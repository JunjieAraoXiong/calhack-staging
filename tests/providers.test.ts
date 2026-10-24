import { convexTest } from 'convex-test';
import { describe, expect, it } from 'vitest';
import schema from '../convex/schema';
import { api, internal } from '../convex/_generated/api';
import { TIME, digest, type EffectArgs, type HotelDecision, type OperationRecord, type Provider, type TripState } from '../shared/contracts';
import { makeHotel, makeTransport, makeTrip } from '../shared/fixtures';

const modules=import.meta.glob('../convex/**/*.ts');
const scenarioId='provider-isolated-test';

async function setup(options:{now?:number;policy?:HotelDecision;hotelAccepted?:boolean}={}) {
  const t=convexTest(schema,modules);
  await t.run(async ctx=>{
    const trip=makeTrip();
    trip.imported=true;
    trip.delayed=true;
    trip.readyFrom=TIME.readyFrom;
    trip.readyTo=TIME.readyTo;
    trip.now=options.now??TIME.start;
    const hotel=makeHotel(options.policy);
    if(options.hotelAccepted??true) {hotel.booking.decision='accepted';hotel.booking.acceptedUntil=TIME.lateUntil;}
    await ctx.db.insert('trips',{scenarioId,state:trip});
    await ctx.db.insert('transport',{scenarioId,state:makeTransport()});
    await ctx.db.insert('hotels',{scenarioId,state:hotel});
  });
  return t;
}
type Test=Awaited<ReturnType<typeof setup>>;

async function changeTrip(t:Test,change:(trip:TripState)=>void){
  await t.run(async ctx=>{
    const d=(await ctx.db.query('trips').collect())[0];
    const trip=d.state as TripState;
    change(trip);
    await ctx.db.patch(d._id,{state:trip});
  });
}
async function admit(t:Test,provider:Provider,args:EffectArgs,operationId='op-1',hold=provider==='transport'?args.quote!.additionalCost:0){
  await t.run(async ctx=>{
    const trip=(await ctx.db.query('trips').collect())[0].state as TripState;
    const operation:OperationRecord={operationId,provider,args,argsDigest:digest(args),intentRevision:trip.intentRevision,grantRevision:trip.grant.revision,stopEpoch:trip.stopEpoch,expiresAt:TIME.lateUntil,hold,status:'dispatched',createdAt:trip.now,updatedAt:trip.now,reason:'Test admission',receiptId:null};
    await ctx.db.insert('operations',{scenarioId,operationId,state:operation});
    await ctx.db.patch((await ctx.db.query('trips').collect())[0]._id,{state:{...trip,held:trip.held+hold}});
  });
  return {scenarioId,operationId,args,admissionRef:operationId};
}
async function transportArgs(t:Test,serviceId='S-target'):Promise<EffectArgs>{
  const quote=await t.query(internal.providers.quote,{scenarioId,serviceId});
  return {bookingId:'B-001',expectedRevision:quote.bookingRevision,quote};
}

describe('controlled provider transaction boundaries',()=>{
  it('amends the same ticket with independent date, fare and charge evidence',async()=>{
    const t=await setup();
    const input=await admit(t,'transport',await transportArgs(t));
    const receipt=await t.mutation(internal.providers.amendTransport,input);
    expect(receipt).toMatchObject({outcome:'committed',additionalCharged:500});
    const inspected=await t.query(api.providers.inspectTransport,{scenarioId});
    expect(inspected.state.booking).toMatchObject({id:'B-001',serviceId:'S-target',fare:3500,serviceDate:'2026-11-15',activeTickets:1,revision:2});
    expect(inspected.state).toMatchObject({amendments:1,totalAdditionalCharged:500});
    expect(inspected.receipts).toHaveLength(1);
    expect((await t.query(api.providers.inspectHotel,{scenarioId})).state.booking.serviceNight).toBe('2026-11-14');
  });
  it.each([{offset:0,expected:'committed'},{offset:1,expected:'rejected'}])('checks inclusive source cutoff at offset $offset ms',async({offset,expected})=>{
    const t=await setup({now:TIME.cutoff});
    const input=await admit(t,'transport',await transportArgs(t));
    await changeTrip(t,trip=>{trip.now+=offset;});
    expect((await t.mutation(internal.providers.amendTransport,input)).outcome).toBe(expected);
    expect((await t.query(api.providers.inspectTransport,{scenarioId})).state.amendments).toBe(expected==='committed'?1:0);
  });
  it.each(['intent','grant','stop','revoked'])('rejects %s changes made after dispatch admission',async(change)=>{
    const t=await setup();
    const input=await admit(t,'transport',await transportArgs(t));
    await changeTrip(t,trip=>{
      if(change==='intent')trip.intentRevision++;
      if(change==='grant')trip.grant.revision++;
      if(change==='stop')trip.stopEpoch++;
      if(change==='revoked')trip.grant.active=false;
    });
    const receipt=await t.mutation(internal.providers.amendTransport,input);
    expect(receipt.outcome).toBe('rejected');
    expect((await t.query(api.providers.inspectTransport,{scenarioId})).state.amendments).toBe(0);
  });
  it('retrieves the same committed result after revocation/cutoff and rejects altered arguments',async()=>{
    const t=await setup();
    const input=await admit(t,'transport',await transportArgs(t));
    const original=await t.mutation(internal.providers.amendTransport,input);
    await changeTrip(t,trip=>{trip.grant.active=false;trip.now=TIME.lateUntil;trip.stopEpoch++;});
    expect(await t.mutation(internal.providers.amendTransport,input)).toEqual(original);
    expect(await t.query(internal.providers.lookupOperation,{scenarioId,operationId:input.operationId})).toEqual(original);
    await expect(t.mutation(internal.providers.amendTransport,{...input,args:{...input.args,expectedRevision:9}})).rejects.toThrow('different arguments');
    expect((await t.query(api.providers.inspectTransport,{scenarioId})).state).toMatchObject({amendments:1,totalAdditionalCharged:500});
  });
  it.each(['S-early','S-late'])('rejects %s using readiness and actual hotel bound',async serviceId=>{
    const t=await setup();
    const input=await admit(t,'transport',await transportArgs(t,serviceId));
    expect((await t.mutation(internal.providers.amendTransport,input)).outcome).toBe('rejected');
  });
  it('rejects stale inventory at commit even with an earlier valid quote',async()=>{
    const t=await setup();
    const input=await admit(t,'transport',await transportArgs(t));
    await t.mutation(internal.providers.configureFixture,{scenarioId,change:'removeInventory',value:'S-target'});
    expect((await t.mutation(internal.providers.amendTransport,input)).evidence).toMatch(/Stale quote/);
    expect((await t.query(api.providers.inspectTransport,{scenarioId})).state.amendments).toBe(0);
  });
  it('rejects a quote that expires before the provider booking cutoff',async()=>{
    const t=await setup();
    const args=await transportArgs(t);
    const input=await admit(t,'transport',args);
    await changeTrip(t,trip=>{trip.now=args.quote!.expiresAt+1;});
    const result=await t.mutation(internal.providers.amendTransport,input);
    expect(result.outcome).toBe('rejected');
    expect(result.evidence).toBe('Quote expired');
  });
  it('checks the current booking revision and exact held amount at commit',async()=>{
    for(const variant of ['booking_revision','wrong_hold']){
      const t=await setup();
      const args=await transportArgs(t);
      const input=await admit(t,'transport',args,'op-1',variant==='wrong_hold'?499:500);
      if(variant==='booking_revision')await t.run(async ctx=>{
        const d=(await ctx.db.query('transport').collect())[0];
        await ctx.db.patch(d._id,{state:{...d.state,booking:{...d.state.booking,revision:2}}});
      });
      const result=await t.mutation(internal.providers.amendTransport,input);
      expect(result.outcome).toBe('rejected');
      expect(result.evidence).toMatch(variant==='booking_revision'?/Stale transport booking revision/:/Exact incremental fare hold required/);
    }
  });
  it('accepts an observed alternative when its conditions change, without relying on S-target',async()=>{
    const t=await setup();
    await t.run(async ctx=>{
      const d=(await ctx.db.query('transport').collect())[0];
      const state=d.state;
      const service=state.services.find((s:{id:string})=>s.id==='S-early');
      service.departureAt=Date.parse('2026-11-15T01:30:00+09:00');
      service.hotelArrivalAt=Date.parse('2026-11-15T02:15:00+09:00');
      service.revision++;
      await ctx.db.patch(d._id,{state});
    });
    const result=await t.mutation(internal.providers.amendTransport,await admit(t,'transport',await transportArgs(t,'S-early')));
    expect(result).toMatchObject({outcome:'committed',additionalCharged:200});
    expect((await t.query(api.providers.inspectTransport,{scenarioId})).state.booking.serviceId).toBe('S-early');
  });
  it.each(['missing','expired','wrong-booking','member'])('requires scoped guest access: %s',async variant=>{
    const t=await setup();
    const input=await admit(t,'transport',await transportArgs(t));
    await changeTrip(t,trip=>{
      if(variant==='missing')trip.transportAccess.available=false;
      if(variant==='expired')trip.transportAccess.expiresAt=trip.now-1;
      if(variant==='wrong-booking')trip.transportAccess.bookingId='B-OTHER';
      if(variant==='member')trip.transportAccess.channel='member';
    });
    expect((await t.mutation(internal.providers.amendTransport,input)).outcome).toBe('rejected');
    expect((await t.query(api.providers.inspectTransport,{scenarioId})).state.amendments).toBe(0);
  });
  it('reserves unknown obligations instead of reallocating their budget',async()=>{
    const t=await setup();
    const args=await transportArgs(t);
    await changeTrip(t,trip=>{trip.grant.cap=750;});
    await admit(t,'transport',args,'unknown-previous',500);
    await t.run(async ctx=>{
      const op=(await ctx.db.query('operations').collect())[0];
      await ctx.db.patch(op._id,{state:{...op.state,status:'unknown'}});
    });
    const input=await admit(t,'transport',args,'op-new',500);
    const result=await t.mutation(internal.providers.amendTransport,input);
    expect(result).toMatchObject({outcome:'rejected'});
    expect(result.evidence).toContain('outstanding holds exceed grant');
    expect((await t.query(api.providers.inspectTransport,{scenarioId})).state.amendments).toBe(0);
    const previous=await t.run(async ctx=>(await ctx.db.query('operations').collect()).find(op=>op.operationId==='unknown-previous')!.state as OperationRecord);
    expect(previous).toMatchObject({status:'unknown',hold:500});
  });
  it('does not count a backed but unreconciled charge twice against the grant',async()=>{
    const t=await setup();
    await changeTrip(t,trip=>{trip.grant.cap=500;});
    await t.mutation(internal.providers.amendTransport,await admit(t,'transport',await transportArgs(t),'bus-op'));
    // Agent operation is still dispatched and its hold remains; provider receipt backs that same charge.
    const receipt=await t.mutation(internal.providers.requestHotel,await admit(t,'hotel',{bookingId:'H-001',expectedRevision:1,latestArrival:TIME.lateUntil},'hotel-op'));
    expect(receipt.outcome).toBe('committed');
    expect((await t.query(api.providers.inspectTransport,{scenarioId})).state.totalAdditionalCharged).toBe(500);
  });
  it('keeps a submitted hotel request pending until independent hotel acceptance',async()=>{
    const t=await setup({policy:'pending',hotelAccepted:false});
    const input=await admit(t,'hotel',{bookingId:'H-001',expectedRevision:1,latestArrival:TIME.lateUntil});
    const submitted=await t.mutation(internal.providers.requestHotel,input);
    expect(submitted).toMatchObject({outcome:'pending',hotelDecision:'pending'});
    expect((await t.query(api.providers.inspectHotel,{scenarioId})).state.booking.acceptedUntil).toBeNull();
    await t.mutation(internal.providers.setHotelDecision,{scenarioId,decision:'accepted'});
    expect(await t.query(internal.providers.lookupOperation,{scenarioId,operationId:input.operationId})).toMatchObject({outcome:'committed',hotelDecision:'accepted'});
    const hotel=(await t.query(api.providers.inspectHotel,{scenarioId})).state;
    expect(hotel).toMatchObject({requests:1,booking:{serviceNight:'2026-11-14',acceptedUntil:TIME.lateUntil}});
    expect(await t.mutation(internal.providers.requestHotel,input)).toMatchObject({hotelDecision:'accepted'});
    expect((await t.query(api.providers.inspectHotel,{scenarioId})).state.requests).toBe(1);
  });
  it('pending hotel blocks default transport, while explicit provisional policy preserves later refusal',async()=>{
    for(const allowed of [false,true]){
      const t=await setup({policy:'pending',hotelAccepted:false});
      await changeTrip(t,trip=>{trip.grant.allowTransportWhileHotelPending=allowed;});
      await t.mutation(internal.providers.requestHotel,await admit(t,'hotel',{bookingId:'H-001',expectedRevision:1,latestArrival:TIME.lateUntil},'hotel-op'));
      const receipt=await t.mutation(internal.providers.amendTransport,await admit(t,'transport',await transportArgs(t),'bus-op'));
      expect(receipt.outcome).toBe(allowed?'committed':'rejected');
      await t.mutation(internal.providers.setHotelDecision,{scenarioId,decision:'declined'});
      expect((await t.query(api.providers.inspectTransport,{scenarioId})).state.amendments).toBe(allowed?1:0);
      expect((await t.query(api.providers.inspectHotel,{scenarioId})).state.booking).toMatchObject({serviceNight:'2026-11-14',decision:'declined',acceptedUntil:null});
    }
  });
  it('lost response lookup is evidence of the original single effect',async()=>{
    const t=await setup();
    const input=await admit(t,'transport',await transportArgs(t));
    await t.mutation(internal.providers.amendTransport,input); // Caller deliberately drops result.
    await t.run(async ctx=>{
      const d=(await ctx.db.query('operations').collect())[0];
      await ctx.db.patch(d._id,{state:{...d.state,status:'unknown'}});
    });
    expect(await t.query(internal.providers.lookupOperation,{scenarioId,operationId:input.operationId})).toMatchObject({outcome:'committed',additionalCharged:500});
    await t.mutation(internal.providers.amendTransport,input);
    expect((await t.query(api.providers.inspectTransport,{scenarioId})).state).toMatchObject({amendments:1,totalAdditionalCharged:500});
  });
  it('does not turn unavailable operation lookup into absent/non-executed evidence',async()=>{
    const t=await setup();
    await changeTrip(t,trip=>{trip.faults.lookupUnavailable=true;});
    await expect(t.query(internal.providers.lookupOperation,{scenarioId,operationId:'unresolved'})).rejects.toThrow('lookup unavailable');
  });
  it('mutates only the selected isolated scenario namespace',async()=>{
    const t=await setup();
    const other='other-isolated-scenario';
    await t.run(async ctx=>{
      await ctx.db.insert('trips',{scenarioId:other,state:makeTrip()});
      await ctx.db.insert('transport',{scenarioId:other,state:makeTransport()});
      await ctx.db.insert('hotels',{scenarioId:other,state:makeHotel()});
    });
    await t.mutation(internal.providers.amendTransport,await admit(t,'transport',await transportArgs(t)));
    const untouched=await t.query(api.providers.inspectTransport,{scenarioId:other});
    expect(untouched.state).toEqual(makeTransport());
    expect(untouched.receipts).toEqual([]);
    await t.mutation(internal.providers.configureFixture,{scenarioId,change:'removeInventory',value:'S-early'});
    expect((await t.query(api.providers.inspectTransport,{scenarioId:other})).state).toEqual(makeTransport());
  });
});
