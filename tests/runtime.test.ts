import { convexTest } from 'convex-test';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import schema from '../convex/schema';
import { api, internal } from '../convex/_generated/api';
import { SYNTHETIC_CONFIRMATIONS, makeHotel, makeTransport, makeTrip } from '../shared/fixtures';
import { TIME, type HotelDecision } from '../shared/contracts';
import { parseConfirmations, candidates, applicableProcedures } from '../shared/planner';
const modules=import.meta.glob('../convex/**/*.ts');

beforeEach(()=>vi.useFakeTimers());
afterEach(()=>{vi.clearAllTimers();vi.useRealTimers();});
async function fixture(policy:HotelDecision='accepted'){
  const t=convexTest(schema,modules);
  const scenarioId=await t.mutation(api.trips.createScenario,{mode:'replay',hotelPolicy:policy});
  await t.mutation(api.trips.importConfirmations,{scenarioId,text:SYNTHETIC_CONFIRMATIONS});
  const configure=(change:string,value?:unknown)=>t.mutation(api.trips.configure,{scenarioId,change,...(value===undefined?{}:{value})});
  const delay=(kind='delay',eventId='delay-1',payload?:unknown)=>t.mutation(api.trips.event,{scenarioId,kind,eventId,...(payload===undefined?{}:{payload})});
  const run=()=>t.action(internal.runtime.run,{scenarioId});
  const read=()=>t.query(api.trips.snapshot,{scenarioId});
  return {t,scenarioId,configure,delay,run,read};
}

describe('bounded journey controller and authoritative readback',()=>{
  it('imports scoped facts and executes the whole replay flow with independent provider effects',async()=>{
    const f=await fixture();await f.delay();await f.run();const s=await f.read();
    expect(s.trip.status).toBe('arrangements_confirmed');expect(s.trip.travelerArrived).toBe(false);
    expect(s.transport).toMatchObject({amendments:1,totalAdditionalCharged:500,booking:{id:'B-001',serviceId:'S-target',serviceDate:'2026-11-15',activeTickets:1}});
    expect(s.hotel.booking).toMatchObject({serviceNight:'2026-11-14',decision:'accepted',acceptedUntil:TIME.lateUntil});
    expect(s.trip).toMatchObject({charged:500,held:0});expect(s.traces).toHaveLength(1);expect(s.traces[0].mode).toBe('replay');
    expect(s.trip.facts.find(f=>f.name==='Fewer transfers')?.scope).toBe('personal');expect(s.trip.facts.find(f=>f.name==='Suitcases')?.scope).toBe('trip');
    expect(s.events.some(e=>e.kind==='procedures_selected'&&e.detail.includes('guest-bus-amendment@1.0.0')&&e.detail.includes('hotel-late-arrival@1.0.0'))).toBe(true);
    expect(s.events.some(e=>e.kind==='deadline_scheduled'&&e.detail.includes('revision 2'))).toBe(true);
  });
  it('deduplicates incoming delay events and repeated controller delivery',async()=>{
    const f=await fixture();expect(await f.delay()).toMatchObject({admitted:true});expect(await f.delay()).toMatchObject({duplicate:true});
    await f.run();await f.run();const s=await f.read();expect(s.transport.amendments).toBe(1);expect(s.hotel.requests).toBe(1);expect(s.receipts).toHaveLength(2);
  });
  it('keeps default pending hotel visible without altering transport',async()=>{
    const f=await fixture('pending');await f.delay();await f.run();await f.run();let s=await f.read();
    expect(s.trip.status).toBe('awaiting_decision');expect(s.transport.amendments).toBe(0);expect(s.hotel.booking.acceptedUntil).toBeNull();
    await f.configure('hotelDecision','accepted');await f.run();s=await f.read();expect(s.trip.status).toBe('arrangements_confirmed');expect(s.hotel.requests).toBe(1);
  });
  it('retains a feasible provisional bus across retries and later refusal',async()=>{
    const f=await fixture('pending');await f.configure('allowTransportWhileHotelPending',true);await f.delay();await f.run();await f.run();
    let s=await f.read();expect(s.trip.status).toBe('partially_confirmed');expect(s.transport.amendments).toBe(1);expect(s.traces).toHaveLength(1);
    await f.configure('hotelDecision','declined');await f.run();s=await f.read();expect(s.trip.status).toBe('needs_help');expect(s.transport.amendments).toBe(1);expect(s.hotel.booking.serviceNight).toBe('2026-11-14');expect(s.operations.find(o=>o.provider==='hotel')?.status).toBe('rejected');
  });
  it('holds the lost-response obligation and reconciles its single late receipt after cancellation',async()=>{
    const f=await fixture();await f.configure('lostTransportResponse',true);await f.configure('lookupUnavailable',true);await f.delay();await f.run();
    let s=await f.read();expect(s.trip.held).toBe(500);expect(s.trip.charged).toBe(0);expect(s.transport.totalAdditionalCharged).toBe(500);expect(s.operations.find(o=>o.provider==='transport')?.status).toBe('unknown');
    await f.run();s=await f.read();expect(s.trip.held).toBe(500);expect(s.transport.amendments).toBe(1);
    await f.configure('cancel');await f.configure('lookupUnavailable',false);await f.run();s=await f.read();expect(s.trip).toMatchObject({active:false,charged:500,held:0});expect(s.transport.amendments).toBe(1);expect(s.operations.find(o=>o.provider==='transport')?.status).toBe('confirmed');
  });
  it('withdraws a prepared admission after authority changes without invoking a new provider effect',async()=>{
    const f=await fixture();await f.configure('pauseBeforeCommit',true);await f.delay();await f.run();
    expect((await f.read()).operations[0].status).toBe('prepared');
    await f.configure('grantActive',false);await f.configure('pauseBeforeCommit',false);await f.run();const s=await f.read();
    expect(s.hotel.requests).toBe(0);expect(s.transport.amendments).toBe(0);expect(s.operations[0].status).toBe('rejected');expect(s.trip.held).toBe(0);
  });
  it('rechecks the dispatch safety buffer when a prepared bus operation resumes',async()=>{
    const f=await fixture('pending');await f.delay();await f.run();await f.configure('hotelDecision','accepted');await f.configure('pauseBeforeCommit',true);await f.run();
    let s=await f.read();expect(s.operations.find(o=>o.provider==='transport')?.status).toBe('prepared');expect(s.trip.held).toBe(500);
    await f.configure('clock',TIME.cutoff-15000);await f.configure('pauseBeforeCommit',false);await f.run();s=await f.read();
    expect(s.transport.amendments).toBe(0);expect(s.trip.held).toBe(0);expect(s.trip.message).toContain('dispatch buffer');
  });
  it('does not allow an original deadline timer to invalidate an amended booking',async()=>{
    const f=await fixture();await f.delay();await f.run();await f.delay('deadline','old-timer',{bookingRevision:1});
    const s=await f.read();expect(s.trip.status).toBe('arrangements_confirmed');expect(s.events.find(e=>e.eventId==='old-timer')?.state).toBe('obsolete');expect(s.transport.amendments).toBe(1);
  });
  it('reopens a confirmed journey on a materially later readiness interval',async()=>{
    const f=await fixture();await f.delay();await f.run();await f.delay('later_delay','new-delay');expect((await f.read()).trip.status).toBe('evaluating');
    await f.run();const s=await f.read();expect(s.trip.status).toBe('needs_help');expect(s.trip.travelerArrived).toBe(false);expect(s.transport.amendments).toBe(1);expect(s.hotel.booking.serviceNight).toBe('2026-11-14');
  });
  it('preserves spent charges but requests a budget decision after a cap reduction',async()=>{
    const f=await fixture();await f.delay();await f.run();await f.configure('cap',100);await f.run();const s=await f.read();
    expect(s.trip.status).toBe('needs_help');expect(s.trip.checkpoint).toBe('budget_conflict');expect(s.trip.charged).toBe(500);expect(s.transport.totalAdditionalCharged).toBe(500);expect(s.transport.amendments).toBe(1);
  });
  it('rejects an arrival interval that begins before the flight lands',async()=>{
    const f=await fixture();await expect(f.delay('delay','invalid-delay',{landingAt:TIME.delayedLanding,readyFrom:TIME.delayedLanding-60000,readyTo:TIME.readyTo})).rejects.toThrow('Invalid arrival interval');
    expect((await f.read()).trip.delayed).toBe(false);
  });
  it('keeps state and admits recovery when a controller lease expires',async()=>{
    const f=await fixture();await f.delay();const claimed=await f.t.mutation(internal.runtime.claim,{scenarioId:f.scenarioId});expect(claimed).not.toBeNull();
    vi.setSystemTime(Date.now()+151001);
    await f.t.mutation(internal.runtime.recover,{scenarioId:f.scenarioId,token:claimed!.token});await f.run();const s=await f.read();expect(s.trip.status).toBe('arrangements_confirmed');expect(s.transport.amendments).toBe(1);
  });
  it.each(['missing','expired','wrong_booking','member'])('does not fabricate guest access for %s',async variant=>{
    const f=await fixture();await f.configure('transportAccess',variant);await f.delay();await f.run();const s=await f.read();expect(s.trip.status).toBe('needs_information');expect(s.transport.amendments).toBe(0);expect(s.hotel.requests).toBe(0);
  });
});

describe('candidate extraction and deterministic planning boundary',()=>{
  it.each(['null','[]','hello'])('reports unresolved data for invalid import %s',text=>{
    expect(parseConfirmations(text,makeTransport(),makeHotel()).unresolved.length).toBeGreaterThan(0);
  });
  it.each(['currency','managementAccess','serviceDate','provider','fare'])('does not verify a missing transport %s',field=>{
    const input=JSON.parse(SYNTHETIC_CONFIRMATIONS);delete input.transport[field];
    const parsed=parseConfirmations(JSON.stringify(input),makeTransport(),makeHotel());expect(parsed.unresolved.length).toBeGreaterThan(0);
  });
  it('excludes a guest procedure when the actual original channel is member',async()=>{
    const f=await fixture();await f.configure('bookingChannel','member');await f.configure('transportAccess','member');
    const s=await f.read();expect(applicableProcedures(s).map(p=>p.id)).toEqual(['hotel-late-arrival']);
  });
  it('selects observed feasible candidates rather than a hard-coded service identity',()=>{
    const trip=makeTrip();trip.readyFrom=TIME.readyFrom;trip.readyTo=TIME.readyTo;const transport=makeTransport();
    transport.services.find(s=>s.id==='S-target')!.id='S-observed-renamed';
    expect(candidates(trip,transport,makeHotel()).map(s=>s.id)).toEqual(['S-observed-renamed']);
    transport.services.find(s=>s.id==='S-observed-renamed')!.seats=0;expect(candidates(trip,transport,makeHotel())).toEqual([]);
  });
});
