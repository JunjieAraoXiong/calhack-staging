import { v } from 'convex/values';
import { internalMutation, internalQuery, query, type MutationCtx } from './_generated/server';
import { digest, type EffectArgs, type OperationRecord, type Provider, type Receipt } from '../shared/contracts';
import { check, createQuote, validateAdmission, validateTransportEffect } from '../shared/guards';
import { configureProviderFixture, providerRecords } from './providerHelpers';

const scenario = {scenarioId:v.string()};
const writeArgs = {scenarioId:v.string(),operationId:v.string(),args:v.any(),admissionRef:v.string()};

export const readTransport = internalQuery({args:scenario,handler:async(ctx,{scenarioId})=>{
  const r = await providerRecords(ctx,scenarioId);
  check(!r.tripState.faults.providerUnavailable,'Provider unavailable');
  return r.transportState;
}});
export const readHotel = internalQuery({args:scenario,handler:async(ctx,{scenarioId})=>{
  const r = await providerRecords(ctx,scenarioId);
  check(!r.tripState.faults.providerUnavailable,'Provider unavailable');
  return r.hotelState;
}});
export const quote = internalQuery({args:{...scenario,serviceId:v.string()},handler:async(ctx,{scenarioId,serviceId})=>{
  const r = await providerRecords(ctx,scenarioId);
  check(!r.tripState.faults.providerUnavailable,'Provider unavailable');
  return createQuote(r.tripState,r.transportState,serviceId);
}});
export const lookupOperation = internalQuery({args:{...scenario,operationId:v.string()},handler:async(ctx,{scenarioId,operationId})=>{
  const r = await providerRecords(ctx,scenarioId);
  check(!r.tripState.faults.lookupUnavailable && !r.tripState.faults.providerUnavailable,'Provider operation lookup unavailable');
  const receipt = await ctx.db.query('receipts').withIndex('by_operation',q=>q.eq('scenarioId',scenarioId).eq('operationId',operationId)).unique();
  return (receipt?.state as Receipt | undefined) ?? null;
}});

async function commit(ctx:MutationCtx,input:{scenarioId:string;operationId:string;args:EffectArgs;admissionRef:string},provider:Provider):Promise<Receipt> {
  const {scenarioId,operationId,args,admissionRef} = input;
  check(args && typeof args === 'object' && typeof args.bookingId === 'string' && Number.isInteger(args.expectedRevision),'Malformed effect arguments');
  const argsDigest = digest(args);
  const prior = await ctx.db.query('receipts').withIndex('by_operation',q=>q.eq('scenarioId',scenarioId).eq('operationId',operationId)).unique();
  if (prior) {
    const receipt = prior.state as Receipt;
    check(receipt.provider === provider && receipt.argsDigest === argsDigest,'Operation identity reused with different arguments');
    return receipt; // Historical result comes before new-effect admission/deadline checks.
  }
  const r = await providerRecords(ctx,scenarioId);
  check(!r.tripState.faults.providerUnavailable,'Provider unavailable');
  const [operationDocs,receiptDocs] = await Promise.all([
    ctx.db.query('operations').withIndex('by_scenario',q=>q.eq('scenarioId',scenarioId)).collect(),
    ctx.db.query('receipts').withIndex('by_scenario',q=>q.eq('scenarioId',scenarioId)).collect(),
  ]);
  const operationStates = operationDocs.map(d=>d.state as OperationRecord);
  const operation = operationStates.find(op=>op.operationId === operationId) ?? null;
  // A matching admission is required even to record a rejection. Invalid callers cannot poison IDs.
  check(operation && operation.provider === provider && operation.argsDigest === argsDigest,'Missing or mismatched operation admission');
  const accounted = new Set(receiptDocs.filter(d=>['committed','rejected'].includes((d.state as Receipt).outcome)).map(d=>d.operationId));
  const unaccountedHolds = operationStates.filter(op=>!accounted.has(op.operationId));
  let receipt:Receipt = {operationId,provider,argsDigest,outcome:'rejected',bookingRevision:provider==='transport'?r.transportState.booking.revision:r.hotelState.booking.revision,additionalCharged:0,at:r.tripState.now,evidence:''};
  try {
    const admitted = validateAdmission(r.tripState,operation,provider,operationId,args,admissionRef,unaccountedHolds,r.transportState.totalAdditionalCharged);
    if (provider === 'transport') {
      const service = validateTransportEffect(r.tripState,r.transportState,r.hotelState,admitted,args);
      const b = r.transportState.booking;
      const previousService = r.transportState.services.find(s=>s.id === b.serviceId);
      if (previousService) { previousService.seats += b.adults; previousService.revision++; }
      service.seats -= b.adults;
      service.revision++;
      const cost = service.fare - b.fare;
      b.revision++;
      b.serviceId = service.id;
      b.departureAt = service.departureAt;
      b.hotelArrivalAt = service.hotelArrivalAt;
      b.fare = service.fare;
      b.cutoff = service.departureAt - 300_000;
      b.serviceDate = new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).format(service.departureAt);
      r.transportState.totalAdditionalCharged += cost;
      r.transportState.amendments++;
      receipt = {...receipt,outcome:'committed',bookingRevision:b.revision,additionalCharged:cost,evidence:`Amended existing ${b.id} to ${service.id}; one active ticket, fare JPY ${b.fare}, incremental simulated charge JPY ${cost}.`};
      await ctx.db.patch(r.transport._id,{state:r.transportState});
    } else {
      const b = r.hotelState.booking;
      check(args.bookingId===b.id && args.expectedRevision===b.revision,'Stale hotel booking revision');
      check(args.quote===undefined,'Unsupported hotel effect arguments');
      check(typeof args.latestArrival==='number' && Number.isFinite(args.latestArrival),'A definite arrival instant is required');
      check(args.latestArrival===r.tripState.hotelRequestedUntil && args.latestArrival<=b.checkoutAt && args.latestArrival>b.defaultLatestArrival,'Arrival outside granted hotel window');
      check(admitted.hold===0,'Hotel request has zero fixture fee');
      check(b.requestId===null,'An existing late-arrival request must be reconciled first');
      b.revision++;
      b.requestId=operationId;
      b.requestedUntil=args.latestArrival;
      b.decision=r.hotelState.responsePolicy;
      b.acceptedUntil=b.decision==='accepted'?args.latestArrival:null;
      r.hotelState.requests++;
      receipt={...receipt,outcome:b.decision==='pending'?'pending':'committed',bookingRevision:b.revision,hotelDecision:b.decision,evidence:`Late-arrival request submitted for existing ${b.id}; business decision ${b.decision}; original service night ${b.serviceNight} and checkout retained.`};
      await ctx.db.patch(r.hotel._id,{state:r.hotelState});
    }
  } catch (error) {
    receipt.evidence=error instanceof Error?error.message:'Provider rejected invalid effect';
  }
  await ctx.db.insert('receipts',{scenarioId,operationId,state:receipt});
  return receipt;
}

export const amendTransport=internalMutation({args:writeArgs,handler:(ctx,args)=>commit(ctx,args,'transport')});
export const requestHotel=internalMutation({args:writeArgs,handler:(ctx,args)=>commit(ctx,args,'hotel')});
export const setHotelDecision=internalMutation({args:{...scenario,decision:v.union(v.literal('accepted'),v.literal('pending'),v.literal('declined'))},handler:async(ctx,{scenarioId,decision})=>{
  await configureProviderFixture(ctx,scenarioId,'hotelDecision',decision);
}});
export const configureFixture=internalMutation({args:{...scenario,change:v.string(),value:v.optional(v.any())},handler:async(ctx,{scenarioId,change,value})=>{
  await configureProviderFixture(ctx,scenarioId,change,value);
}});

export const inspectTransport=query({args:scenario,handler:async(ctx,{scenarioId})=>{
  const r=await providerRecords(ctx,scenarioId);
  const receipts=await ctx.db.query('receipts').withIndex('by_scenario',q=>q.eq('scenarioId',scenarioId)).collect();
  return {state:r.transportState,receipts:receipts.map(d=>d.state as Receipt).filter(s=>s.provider==='transport')};
}});
export const inspectHotel=query({args:scenario,handler:async(ctx,{scenarioId})=>{
  const r=await providerRecords(ctx,scenarioId);
  const receipts=await ctx.db.query('receipts').withIndex('by_scenario',q=>q.eq('scenarioId',scenarioId)).collect();
  return {state:r.hotelState,receipts:receipts.map(d=>d.state as Receipt).filter(s=>s.provider==='hotel')};
}});
