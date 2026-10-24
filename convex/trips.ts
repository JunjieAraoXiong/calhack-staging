import { mutation, query, internalQuery } from './_generated/server';
import { internal } from './_generated/api';
import { v } from 'convex/values';
import { TIME, type EventRecord, type Snapshot, type TripState, type TransportBooking } from '../shared/contracts';
import { makeTrip, makeTransport, makeHotel } from '../shared/fixtures';
import { arrangementCheck, parseConfirmations } from '../shared/planner';
import { configureProviderFixture } from './providerHelpers';
import type { MutationCtx, QueryCtx } from './_generated/server';

export async function tripDoc(ctx: QueryCtx|MutationCtx, scenarioId:string) {
  const doc=await ctx.db.query('trips').withIndex('by_scenario',q=>q.eq('scenarioId',scenarioId)).unique();
  if (!doc) throw new Error('Unknown isolated scenario');
  return doc;
}
export async function readSnapshot(ctx:QueryCtx|MutationCtx,scenarioId:string):Promise<Snapshot> {
  const trip=await tripDoc(ctx,scenarioId);
  const transport=await ctx.db.query('transport').withIndex('by_scenario',q=>q.eq('scenarioId',scenarioId)).unique();
  const hotel=await ctx.db.query('hotels').withIndex('by_scenario',q=>q.eq('scenarioId',scenarioId)).unique();
  if (!transport || !hotel) throw new Error('Provider fixture is missing');
  const [operations,receipts,events,traces]=await Promise.all(['operations','receipts','events','traces'].map(table=>ctx.db.query(table as 'operations').withIndex('by_scenario',q=>q.eq('scenarioId',scenarioId)).collect()));
  return {scenarioId,trip:trip.state,transport:transport.state,hotel:hotel.state,operations:operations.map(x=>x.state),receipts:receipts.map(x=>x.state),events:events.map(x=>x.state),traces:traces.map(x=>x.state)};
}
export async function wake(ctx:MutationCtx,scenarioId:string,delay=0) {
  await ctx.scheduler.runAfter(delay,internal.runtime.run,{scenarioId});
}
export async function scheduleDeadline(ctx:MutationCtx,scenarioId:string,trip:TripState,booking:TransportBooking) {
  const eventId=`deadline-scheduled:${booking.revision}:${trip.intentRevision}`;
  if(await ctx.db.query('events').withIndex('by_event',q=>q.eq('scenarioId',scenarioId).eq('eventId',eventId)).unique())return;
  await ctx.db.insert('events',{scenarioId,eventId,state:{eventId,kind:'deadline_scheduled',at:trip.now,intentRevision:trip.intentRevision,state:'admitted',detail:`Booking revision ${booking.revision}; fixture deadline ${booking.cutoff}. Explicit clock advances also wake the controller.`}});
  await ctx.scheduler.runAfter(Math.max(0,booking.cutoff-trip.now),internal.runtime.deadline,{scenarioId,bookingRevision:booking.revision,intentRevision:trip.intentRevision});
}
export const createScenario=mutation({args:{mode:v.union(v.literal('replay'),v.literal('live')),hotelPolicy:v.optional(v.union(v.literal('accepted'),v.literal('pending'),v.literal('declined')))},handler:async(ctx,args)=>{
  const scenarioId=crypto.randomUUID();
  await ctx.db.insert('trips',{scenarioId,state:makeTrip(args.mode)});
  await ctx.db.insert('transport',{scenarioId,state:makeTransport()});
  await ctx.db.insert('hotels',{scenarioId,state:makeHotel(args.hotelPolicy??'accepted')});
  return scenarioId;
}});
export const snapshot=query({args:{scenarioId:v.string()},handler:readSnapshotArgs});
export const internalSnapshot=internalQuery({args:{scenarioId:v.string()},handler:readSnapshotArgs});
async function readSnapshotArgs(ctx:QueryCtx,args:{scenarioId:string}) { return await readSnapshot(ctx,args.scenarioId); }
export const importConfirmations=mutation({args:{scenarioId:v.string(),text:v.string()},handler:async(ctx,args)=>{
  if(args.text.length>20000) throw new Error('Confirmation bundle exceeds fixture import limit');
  const doc=await tripDoc(ctx,args.scenarioId); const current=doc.state as TripState;
  if(current.imported) throw new Error('This scenario already has imported commitments; reset to import a different bundle.');
  const s=await readSnapshot(ctx,args.scenarioId); const parsed=parseConfirmations(args.text,s.transport,s.hotel);
  const state:TripState={...current,importText:args.text,...parsed,imported:parsed.unresolved.length===0,intentRevision:current.intentRevision+1,status:parsed.unresolved.length?'needs_information':'evaluating',message:parsed.unresolved.length?'Some supplied facts need correction before action.':'All three confirmations match the controlled fixture.',checkpoint:'import_verified'};
  if(state.imported){ const check=arrangementCheck(state,s.transport,s.hotel); state.status=check.confirmed?'arrangements_confirmed':'evaluating'; state.message=check.reason; }
  await ctx.db.patch(doc._id,{state});
  if(state.imported) {
    await scheduleDeadline(ctx,args.scenarioId,state,s.transport.booking);
    if(state.delayed) await wake(ctx,args.scenarioId);
  }
  return {imported:state.imported,unresolved:state.unresolved};
}});
export const event=mutation({args:{scenarioId:v.string(),eventId:v.string(),kind:v.string(),payload:v.optional(v.any())},handler:async(ctx,args)=>{
  const existing=await ctx.db.query('events').withIndex('by_event',q=>q.eq('scenarioId',args.scenarioId).eq('eventId',args.eventId)).unique();
  if(existing) return {admitted:false,duplicate:true};
  const doc=await tripDoc(ctx,args.scenarioId); const state={...doc.state} as TripState;
  if(!['delay','later_delay','retry','deadline'].includes(args.kind)) throw new Error('Unsupported fixture event');
  let obsolete=false;
  if(args.kind==='deadline') {const s=await readSnapshot(ctx,args.scenarioId); obsolete=args.payload?.bookingRevision!==s.transport.booking.revision;}
  if(!obsolete && (args.kind==='delay'||args.kind==='later_delay')) {
    const later=args.kind==='later_delay';
    const readyTo=args.payload?.readyTo??(later?Date.parse('2026-11-15T02:30:00+09:00'):TIME.readyTo);
    const readyFrom=args.payload?.readyFrom??(later?readyTo-30*60000:TIME.readyFrom);
    const landingAt=args.payload?.landingAt??(later?Date.parse('2026-11-15T01:00:00+09:00'):TIME.delayedLanding);
    if(![readyTo,readyFrom,landingAt].every(Number.isFinite)||readyFrom>readyTo||landingAt>readyFrom) throw new Error('Invalid arrival interval');
    Object.assign(state,{delayed:true,landingAt,readyFrom,readyTo,intentRevision:state.intentRevision+1,status:'evaluating',message:'A new arrival estimate changes the remaining journey. Rechecking your arrangements.',wakeScheduled:true});
  }
  const rec:EventRecord={eventId:args.eventId,kind:args.kind,at:state.now,intentRevision:state.intentRevision,state:obsolete?'obsolete':'admitted',detail:obsolete?'Booking revision changed; old timer has no authority.':args.kind==='retry'?'Explicit retry / reconciliation wake':'Synthetic event; revalidate current commitments'};
  await ctx.db.insert('events',{scenarioId:args.scenarioId,eventId:args.eventId,state:rec});
  if(!obsolete){state.wakeScheduled=true; await ctx.db.patch(doc._id,{state}); const current=await readSnapshot(ctx,args.scenarioId); if(state.imported)await scheduleDeadline(ctx,args.scenarioId,state,current.transport.booking); await wake(ctx,args.scenarioId);}
  return {admitted:!obsolete,duplicate:false};
}});
export const configure=mutation({args:{scenarioId:v.string(),change:v.string(),value:v.optional(v.any())},handler:async(ctx,args)=>{
  const doc=await tripDoc(ctx,args.scenarioId); const s={...doc.state} as TripState; let intent=false;
  const bool=()=>{if(typeof args.value!=='boolean')throw new Error('Expected boolean'); return args.value;};
  switch(args.change){
    case 'allowTransportWhileHotelPending':s.grant={...s.grant,allowTransportWhileHotelPending:bool(),revision:s.grant.revision+1};intent=true;break;
    case 'grantActive':s.grant={...s.grant,active:bool(),revision:s.grant.revision+1};intent=true;break;
    case 'cap':if(!Number.isSafeInteger(args.value)||args.value<0)throw new Error('Expected a nonnegative yen cap');s.grant={...s.grant,cap:args.value,revision:s.grant.revision+1};intent=true;break;
    case 'transportAccess':case 'hotelAccess': {
      if(!['valid','missing','expired','wrong_booking','member'].includes(args.value))throw new Error('Unsupported access variant');
      const key=args.change; const hotel=key==='hotelAccess';
      s[key]={bookingId:args.value==='wrong_booking'?'WRONG':hotel?'H-001':'B-001',channel:hotel?'hotel':args.value==='member'?'member':'guest',expiresAt:args.value==='expired'?s.now-1:s.now+86400000,available:args.value!=='missing'};intent=true;break;
    }
    case 'lostTransportResponse':case 'lookupUnavailable':case 'providerUnavailable':case 'pauseBeforeCommit':s.faults={...s.faults,[args.change]:bool()};break;
    case 'clock':if(!Number.isFinite(args.value)||args.value<s.now)throw new Error('Clock only advances');s.now=args.value;break;
    case 'readiness':if(!Number.isFinite(args.value)||args.value<s.landingAt)throw new Error('Invalid ready-at-stop time');s.readyTo=args.value;s.readyFrom=Math.min(s.readyFrom,args.value);intent=true;break;
    case 'cancel':s.active=false;s.stopEpoch+=1;s.grant={...s.grant,active:false,revision:s.grant.revision+1};intent=true;break;
    case 'hotelDecision':case 'hotelPolicy':case 'removeInventory':case 'bookingChannel': await configureProviderFixture(ctx,args.scenarioId,args.change,args.value);break;
    default:throw new Error('Unsupported scenario control');
  }
  if(intent)s.intentRevision+=1;
  if(s.imported){s.status='evaluating';s.message='Rechecking current facts and authority.';}
  s.wakeScheduled=true;
  await ctx.db.patch(doc._id,{state:s});
  if(s.imported){const current=await readSnapshot(ctx,args.scenarioId);await scheduleDeadline(ctx,args.scenarioId,s,current.transport.booking);}
  await wake(ctx,args.scenarioId);
  return {intentRevision:s.intentRevision};
}});
