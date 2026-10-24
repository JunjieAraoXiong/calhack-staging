import { internalAction, internalMutation } from './_generated/server';
import { internal } from './_generated/api';
import { v } from 'convex/values';
import { digest, type EffectArgs, type OperationRecord, type Receipt, type Snapshot, type TripState, type TripStatus } from '../shared/contracts';
import { applicableProcedures, arrangementCheck, candidates, replayDecision } from '../shared/planner';
import { tripDoc, readSnapshot, wake, scheduleDeadline } from './trips';

type RuntimeTrip=TripState & {leaseUntil?:number; leaseToken?:string; reconciliationAttempts?:number};
const scenarioArgs={scenarioId:v.string()};
export const claim=internalMutation({args:scenarioArgs,handler:async(ctx,{scenarioId})=>{
  const doc=await tripDoc(ctx,scenarioId); const trip=doc.state as RuntimeTrip;
  if(trip.leaseUntil && trip.leaseUntil>Date.now()){await wake(ctx,scenarioId,1000);return null;}
  const runRevision=trip.runRevision+1; const token=`${runRevision}:${Date.now()}`;
  await ctx.db.patch(doc._id,{state:{...trip,runRevision,leaseToken:token,leaseUntil:Date.now()+150000,checkpoint:'restoring_current_state',wakeScheduled:false}});
  // A controller action may be interrupted; this persisted watchdog admits recovery after its bounded lease.
  await ctx.scheduler.runAfter(151000,internal.runtime.recover,{scenarioId,token});
  return {token,snapshot:await readSnapshot(ctx,scenarioId)};
}});
export const recover=internalMutation({args:{scenarioId:v.string(),token:v.string()},handler:async(ctx,args)=>{
  const doc=await tripDoc(ctx,args.scenarioId); const trip=doc.state as RuntimeTrip;
  if(trip.leaseToken===args.token && (trip.leaseUntil??0)<=Date.now()){await ctx.db.patch(doc._id,{state:{...trip,leaseUntil:0,checkpoint:'controller_recovery',wakeScheduled:true}});await wake(ctx,args.scenarioId);}
}});
export const finish=internalMutation({args:{scenarioId:v.string(),token:v.string(),intentRevision:v.number(),status:v.string(),message:v.string(),checkpoint:v.string(),retry:v.optional(v.boolean())},handler:async(ctx,args)=>{
  const doc=await tripDoc(ctx,args.scenarioId); const trip=doc.state as RuntimeTrip;
  if(trip.leaseToken!==args.token)return;
  const sameIntent=trip.intentRevision===args.intentRevision;
  const attempts=args.retry?(trip.reconciliationAttempts??0)+1:0;
  const state:RuntimeTrip={...trip,leaseUntil:0,leaseToken:'',checkpoint:args.checkpoint,wakeScheduled:false,reconciliationAttempts:attempts};
  if(sameIntent){state.status=args.status as TripStatus;state.message=args.message;state.nextAction=state.status==='arrangements_confirmed'?'After immigration and baggage collection, reach the airport bus stop before the verified departure. Keep the bus ticket and hotel acceptance available.':state.status==='awaiting_decision'?'Review the outstanding hotel decision and the bounded transport option.':'Keep your existing confirmations available while the unresolved step is handled.';}
  await ctx.db.patch(doc._id,{state});
  if(!sameIntent || (args.retry && attempts<=3))await wake(ctx,args.scenarioId,sameIntent?Math.min(1000*attempts,5000):0);
}});
export const prepare=internalMutation({args:{scenarioId:v.string(),provider:v.union(v.literal('transport'),v.literal('hotel')),args:v.any(),intentRevision:v.number(),runRevision:v.number()},handler:async(ctx,args):Promise<OperationRecord>=>{
  const doc=await tripDoc(ctx,args.scenarioId);const trip=doc.state as RuntimeTrip;const s=await readSnapshot(ctx,args.scenarioId);const effect=args.args as EffectArgs;
  if(!trip.active||!trip.grant.active||trip.intentRevision!==args.intentRevision)throw new Error('Intent or authority changed before dispatch');
  if(s.operations.some(o=>['prepared','dispatched','unknown'].includes(o.status)))throw new Error('An earlier potentially effective operation must be reconciled first');
  const cost=args.provider==='transport'?effect.quote?.additionalCost:0;
  if(typeof cost!=='number'||!Number.isSafeInteger(cost)||cost<0)throw new Error('Invalid additional-cost quote');
  if(trip.charged+trip.held+cost>trip.grant.cap)throw new Error('Additional cost and active obligations exceed the current grant');
  if(args.provider==='transport' && trip.now>s.transport.booking.cutoff-30000)throw new Error('The transport dispatch safety window has closed');
  const operationId=`${args.scenarioId}/${args.provider}/${effect.expectedRevision}/${args.intentRevision}/${args.runRevision}`;
  const existing=await ctx.db.query('operations').withIndex('by_operation',q=>q.eq('scenarioId',args.scenarioId).eq('operationId',operationId)).unique();
  if(existing){if(existing.state.argsDigest!==digest(effect))throw new Error('Operation identity cannot change arguments');return existing.state;}
  const op:OperationRecord={operationId,provider:args.provider,intentRevision:trip.intentRevision,grantRevision:trip.grant.revision,stopEpoch:trip.stopEpoch,argsDigest:digest(effect),expiresAt:Math.min(trip.now+60000,args.provider==='transport'?s.transport.booking.cutoff:trip.now+60000),hold:cost,args:effect,status:'prepared',createdAt:trip.now,updatedAt:trip.now,reason:'Current intent admitted; awaiting provider transaction',receiptId:null};
  await ctx.db.insert('operations',{scenarioId:args.scenarioId,operationId,state:op});
  await ctx.db.patch(doc._id,{state:{...trip,held:trip.held+cost,status:'executing',checkpoint:`prepared_${args.provider}`}});
  return op;
}});
export const withdrawAdmission=internalMutation({args:{scenarioId:v.string(),operationId:v.string(),reason:v.string()},handler:async(ctx,args)=>{
  const receipt=await ctx.db.query('receipts').withIndex('by_operation',q=>q.eq('scenarioId',args.scenarioId).eq('operationId',args.operationId)).unique();
  if(receipt)return receipt.state as Receipt;
  const op=await ctx.db.query('operations').withIndex('by_operation',q=>q.eq('scenarioId',args.scenarioId).eq('operationId',args.operationId)).unique();
  if(!op)throw new Error('Missing admission');
  const doc=await tripDoc(ctx,args.scenarioId);
  // This transaction also prevents a later controlled-provider commit from using the withdrawn admission.
  await ctx.db.patch(op._id,{state:{...op.state,status:'rejected',reason:args.reason,updatedAt:doc.state.now}});
  const all=await ctx.db.query('operations').withIndex('by_scenario',q=>q.eq('scenarioId',args.scenarioId)).collect();
  const held=all.reduce((n,o)=>n+(['prepared','dispatched','pending','unknown'].includes(o.state.status)?o.state.hold:0),0);
  await ctx.db.patch(doc._id,{state:{...doc.state,held}});
  return null;
}});
export const markOperation=internalMutation({args:{scenarioId:v.string(),operationId:v.string(),status:v.union(v.literal('dispatched'),v.literal('unknown')),reason:v.string()},handler:async(ctx,args)=>{
  const op=await ctx.db.query('operations').withIndex('by_operation',q=>q.eq('scenarioId',args.scenarioId).eq('operationId',args.operationId)).unique();if(!op)throw new Error('Missing prepared operation');
  if(op.state.status==='confirmed'||op.state.status==='rejected')return;
  const doc=await tripDoc(ctx,args.scenarioId); const trip=doc.state as TripState;
  await ctx.db.patch(op._id,{state:{...op.state,status:args.status,reason:args.reason,updatedAt:trip.now}});
  await ctx.db.patch(doc._id,{state:{...trip,checkpoint:args.status==='unknown'?'reconciling_uncertain_effect':`dispatching_${op.state.provider}`}});
}});
export const ingest=internalMutation({args:{scenarioId:v.string(),receipt:v.any()},handler:async(ctx,args)=>{
  const receipt=args.receipt as Receipt;
  const op=await ctx.db.query('operations').withIndex('by_operation',q=>q.eq('scenarioId',args.scenarioId).eq('operationId',receipt.operationId)).unique();
  if(!op||op.state.argsDigest!==receipt.argsDigest)throw new Error('Receipt does not match admitted operation');
  const authoritative=await ctx.db.query('receipts').withIndex('by_operation',q=>q.eq('scenarioId',args.scenarioId).eq('operationId',receipt.operationId)).unique();
  if(!authoritative||JSON.stringify(authoritative.state)!==JSON.stringify(receipt))throw new Error('Receipt has not been verified with the provider');
  const status=receipt.outcome==='pending'?'pending':receipt.outcome==='rejected'||receipt.hotelDecision==='declined'?'rejected':'confirmed';
  await ctx.db.patch(op._id,{state:{...op.state,status,updatedAt:receipt.at,receiptId:receipt.operationId,reason:receipt.evidence}});
  const all=await ctx.db.query('operations').withIndex('by_scenario',q=>q.eq('scenarioId',args.scenarioId)).collect();
  const rs=await ctx.db.query('receipts').withIndex('by_scenario',q=>q.eq('scenarioId',args.scenarioId)).collect();
  const charged=rs.reduce((n,r)=>n+(r.state.outcome==='committed'?r.state.additionalCharged:0),0);
  const held=all.reduce((n,o)=>n+(['prepared','dispatched','pending','unknown'].includes(o.state.status)?o.state.hold:0),0);
  const doc=await tripDoc(ctx,args.scenarioId);
  // Actual effects survive user edits, stopped trips, and superseded planning attempts.
  const state={...doc.state,charged,held,checkpoint:'provider_receipt_reconciled'};
  await ctx.db.patch(doc._id,{state});
  if(receipt.provider==='transport'&&receipt.outcome==='committed'){const s=await readSnapshot(ctx,args.scenarioId);await scheduleDeadline(ctx,args.scenarioId,state,s.transport.booking);}
}});
export const trace=internalMutation({args:{scenarioId:v.string(),trace:v.any()},handler:async(ctx,args)=>{
  const id=await ctx.db.insert('traces',{scenarioId:args.scenarioId,state:args.trace});
  const s=await readSnapshot(ctx,args.scenarioId);const eventId=`procedures:${id}`;
  const current=s.trip.intentRevision===args.trace.intentRevision;
  const selected=current?applicableProcedures(s).map(p=>`${p.id}@${p.version}`).join(', '):'Proposal superseded before procedure admission';
  await ctx.db.insert('events',{scenarioId:args.scenarioId,eventId,state:{eventId,kind:'procedures_selected',at:s.trip.now,intentRevision:args.trace.intentRevision,state:current?'admitted':'obsolete',detail:`${selected}. Original transport channel: ${s.transport.booking.channel}. Controlled-provider procedures only.`}});
}});
export const deadline=internalMutation({args:{scenarioId:v.string(),bookingRevision:v.number(),intentRevision:v.number()},handler:async(ctx,args)=>{
  const s=await readSnapshot(ctx,args.scenarioId);const eventId=`cutoff:${args.bookingRevision}:${args.intentRevision}`;
  if(await ctx.db.query('events').withIndex('by_event',q=>q.eq('scenarioId',args.scenarioId).eq('eventId',eventId)).unique())return;
  const obsolete=s.transport.booking.revision!==args.bookingRevision||s.trip.intentRevision!==args.intentRevision;
  await ctx.db.insert('events',{scenarioId:args.scenarioId,eventId,state:{eventId,kind:'deadline',at:s.trip.now,intentRevision:s.trip.intentRevision,state:obsolete?'obsolete':'admitted',detail:obsolete?'Old booking/intent timer ignored.':'Deadline wake; frozen fixture clock remains explicitly controlled.'}});
  if(!obsolete)await wake(ctx,args.scenarioId);
}});

export const run=internalAction({args:scenarioArgs,handler:async(ctx,{scenarioId})=>{
  const claimed=await ctx.runMutation(internal.runtime.claim,{scenarioId}); if(!claimed)return;
  let s:Snapshot=claimed.snapshot;const token:string=claimed.token;let status:TripStatus='needs_help';let message='The controller stopped before it could verify the arrangement.';let checkpoint='needs_attention';let retry=false;
  const refresh=async()=>{s=await ctx.runQuery(internal.trips.internalSnapshot,{scenarioId});return s;};
  const set=(st:TripStatus,msg:string,cp:string,again=false)=>{status=st;message=msg;checkpoint=cp;retry=again;};
  const dispatch=async(op:OperationRecord):Promise<boolean>=>{
    await refresh();
    const stale=!s.trip.active||!s.trip.grant.active||op.intentRevision!==s.trip.intentRevision||op.grantRevision!==s.trip.grant.revision||op.stopEpoch!==s.trip.stopEpoch;
    const tooLate=op.provider==='transport'&&s.trip.now>s.transport.booking.cutoff-30000;
    if(stale||tooLate){
      const reason=tooLate?'The controller dispatch buffer closed before sending this operation.':'This prepared admission was superseded or stopped before dispatch.';
      const historical:Receipt|null=await ctx.runMutation(internal.runtime.withdrawAdmission,{scenarioId,operationId:op.operationId,reason});
      if(historical){await ctx.runMutation(internal.runtime.ingest,{scenarioId,receipt:historical});return true;}
      set('needs_help',reason,'admission_withdrawn');return false;
    }
    if(s.trip.faults.pauseBeforeCommit){set('awaiting_decision','Execution is paused before the provider commit for this isolated fault scenario.','paused_before_commit');return false;}
    await ctx.runMutation(internal.runtime.markOperation,{scenarioId,operationId:op.operationId,status:'dispatched',reason:'Dispatching the immutable request to its provider'});
    try {
      const receipt:Receipt=await ctx.runMutation(op.provider==='transport'?internal.providers.amendTransport:internal.providers.requestHotel,{scenarioId,operationId:op.operationId,args:op.args,admissionRef:op.operationId});
      await refresh();
      if(op.provider==='transport'&&s.trip.faults.lostTransportResponse){
        await ctx.runMutation(internal.runtime.markOperation,{scenarioId,operationId:op.operationId,status:'unknown',reason:'Injected loss after the provider committed; the cost hold remains until lookup.'});
        set('partially_confirmed','The transport response was lost. Its existing operation is being reconciled; no second ticket will be submitted.','reconciling_uncertain_effect',true);return false;
      }
      await ctx.runMutation(internal.runtime.ingest,{scenarioId,receipt});
      if(receipt.outcome==='rejected'){set('needs_help',receipt.evidence,'provider_rejected');return false;}
      return true;
    } catch {
      await ctx.runMutation(internal.runtime.markOperation,{scenarioId,operationId:op.operationId,status:'unknown',reason:'Provider delivery has no definitive outcome yet; lookup is required.'});
      set('partially_confirmed','A provider operation has an unknown outcome. Its existing identity and cost hold are preserved.','reconciling_uncertain_effect',true);return false;
    }
  };
  try {
    // A later hotel business decision updates the same request; retain and ingest its new evidence.
    for(const receipt of s.receipts.filter(r=>r.provider==='hotel')){
      const op=s.operations.find(o=>o.operationId===receipt.operationId);
      if(op && ['confirmed','rejected'].includes(op.status) && op.reason!==receipt.evidence)await ctx.runMutation(internal.runtime.ingest,{scenarioId,receipt});
    }
    // Read authoritative results first, including operations from superseded/stopped intents.
    for(const op of s.operations.filter(o=>['prepared','dispatched','unknown','pending'].includes(o.status))){
      let receipt:Receipt|null;
      try {receipt=await ctx.runQuery(internal.providers.lookupOperation,{scenarioId,operationId:op.operationId});}
      catch {set('partially_confirmed','Provider lookup is unavailable. The existing operation remains unresolved and its hold stays reserved.','waiting_for_provider_lookup',true);return;}
      if(receipt)await ctx.runMutation(internal.runtime.ingest,{scenarioId,receipt});
      else {
        await refresh();
        if(!s.trip.active||!s.trip.grant.active||op.intentRevision!==s.trip.intentRevision){
          // Submitting the same identity is safe: provider will reject a new effect under stale admission, or return a historic receipt if it already committed.
          if(!await dispatch(op))return;
        }else if(!await dispatch(op))return;
      }
    }
    await refresh();
    if(!s.trip.imported){set('needs_information','Import the supplied flight, bus, and hotel confirmations before the agent acts.','waiting_for_import');return;}
    if(!s.trip.active||!s.trip.grant.active){set('needs_help','Future changes are stopped. Existing bookings and any completed provider effects are preserved.','stopped');return;}
    if(s.trip.faults.providerUnavailable){set('needs_help','The controlled provider service is unavailable. Your persisted journey will resume on retry or reconnection.','waiting_for_executor',true);return;}
    if(s.trip.charged+s.trip.held>s.trip.grant.cap){set('needs_help','Previously committed charges and unresolved holds exceed your new spending limit. Those existing effects are preserved; revise the limit or review the already committed cost.','budget_conflict');return;}
    const check=arrangementCheck(s.trip,s.transport,s.hotel);
    if(check.confirmed){set('arrangements_confirmed',check.reason,'arrangements_verified');return;}
    if(s.hotel.booking.decision==='declined'){set('needs_help','The hotel declined late arrival. Any bus amendment and the original hotel night are preserved; a new lodging decision requires new authority.','hotel_declined');return;}
    if(s.hotel.booking.decision==='pending' && s.transport.booking.departureAt>=s.trip.readyTo+s.trip.boardingBufferMs && s.hotel.booking.requestedUntil!==null && s.transport.booking.hotelArrivalAt<=s.hotel.booking.requestedUntil){set('partially_confirmed','Your current bus remains feasible under the requested arrival window. Hotel acceptance is still pending; no further bus change is needed.','waiting_for_hotel_decision');return;}
    if(s.hotel.booking.decision==='pending'&&!s.trip.grant.allowTransportWhileHotelPending){set('awaiting_decision','The hotel has not accepted late arrival. You can wait, or explicitly allow the bus change while this hotel request remains unresolved.','waiting_for_hotel_decision');return;}
    const access=s.trip.transportAccess;
    if(!access.available||access.expiresAt<s.trip.now||access.bookingId!==s.transport.booking.id||access.channel!==s.transport.booking.channel||access.channel!=='guest'){
      set('needs_information',access.channel==='member'?'This curated procedure supports the original guest-management channel. A member booking needs a separately supported procedure.':'Valid guest management access scoped to B-001 is required before any bus change.','access_required');return;
    }
    const hAccess=s.trip.hotelAccess;
    if(!hAccess.available||hAccess.expiresAt<s.trip.now||hAccess.bookingId!==s.hotel.booking.id||hAccess.channel!=='hotel'){
      set('needs_information','Valid management access scoped to H-001 is required before requesting late arrival.','access_required');return;
    }
    if(s.trip.now>s.transport.booking.cutoff-30000){set('needs_help','The bus amendment dispatch window has closed. Existing reservations are preserved; the agent cannot promise a late change.','transport_cutoff');return;}
    const revision=s.trip.intentRevision;
    const modelResult=s.trip.mode==='replay'?{decision:replayDecision(s),provider:'deterministic-replay',model:'observed-candidate-rule-v1',requestId:null}:await ctx.runAction(internal.model.decide,{snapshot:s});
    await ctx.runMutation(internal.runtime.trace,{scenarioId,trace:{mode:s.trip.mode,provider:modelResult.provider,model:modelResult.model,requestId:modelResult.requestId,at:s.trip.now,intentRevision:revision,decision:modelResult.decision}});
    await refresh();
    if(s.trip.intentRevision!==revision){set('evaluating','Your constraints changed while planning. The old proposal cannot authorize a new effect.','superseded_plan',true);return;}
    const decision=modelResult.decision;
    if(decision.action!=='arrange'||decision.serviceId===null){set('needs_help',decision.reason,'no_feasible_proposal');return;}
    if(!candidates(s.trip,s.transport,s.hotel).some(x=>x.id===decision.serviceId)){set('needs_help','The proposed departure no longer passes current readiness, inventory, hotel-window, and spending checks.','proposal_rejected');return;}
    if(s.hotel.booking.decision==='not_requested'){
      const op:OperationRecord=await ctx.runMutation(internal.runtime.prepare,{scenarioId,provider:'hotel',args:{bookingId:s.hotel.booking.id,expectedRevision:s.hotel.booking.revision,latestArrival:s.trip.hotelRequestedUntil},intentRevision:revision,runRevision:s.trip.runRevision});
      if(!await dispatch(op))return;
    }
    await refresh();
    if((s.hotel.booking.decision as string)==='declined'){set('needs_help','The hotel declined the late-arrival request. Your original booking is preserved; no bus change was made.','hotel_declined');return;}
    if(s.hotel.booking.decision==='pending'&&!s.trip.grant.allowTransportWhileHotelPending){set('awaiting_decision','The hotel request is pending. The bus remains unchanged unless you explicitly authorize transport while hotel acceptance is unresolved.','waiting_for_hotel_decision');return;}
    const quote=await ctx.runQuery(internal.providers.quote,{scenarioId,serviceId:decision.serviceId});
    await refresh();
    if(!candidates(s.trip,s.transport,s.hotel).some(x=>x.id===decision.serviceId)){set('needs_help','Inventory or feasibility changed after hotel handling. No new bus change was made.','inventory_changed');return;}
    const op:OperationRecord=await ctx.runMutation(internal.runtime.prepare,{scenarioId,provider:'transport',args:{bookingId:s.transport.booking.id,expectedRevision:s.transport.booking.revision,quote},intentRevision:revision,runRevision:s.trip.runRevision});
    if(!await dispatch(op))return;
    await refresh();
    const final=arrangementCheck(s.trip,s.transport,s.hotel);
    if(final.confirmed)set('arrangements_confirmed',final.reason,'arrangements_verified');
    else set('partially_confirmed',s.hotel.booking.decision==='pending'?'Your bus is changed, but hotel acceptance is still pending. This is not a fully confirmed arrival.':final.reason,'awaiting_remaining_confirmation');
  } catch(error) {
    const messageText=error instanceof Error?error.message:'Unknown controller error';
    let unresolved=false;
    try{await refresh();unresolved=s.operations.some(o=>['prepared','dispatched','unknown'].includes(o.status));}catch{/* Backend outage keeps the durable lease/watchdog as the recovery path. */}
    if(unresolved)set('partially_confirmed','An interrupted controller step left a persisted operation to reconcile. Its identity and any cost hold are preserved.','recovering_interrupted_step',true);
    else set('needs_help',messageText.includes('model')||messageText.includes('Model')?'Live model execution is unavailable or invalid. No replay was substituted. Check the server model configuration and retry.':messageText.slice(0,250),'controller_error');
  } finally {
    await ctx.runMutation(internal.runtime.finish,{scenarioId,token,intentRevision:s.trip.intentRevision,status,message,checkpoint,retry});
  }
}});
