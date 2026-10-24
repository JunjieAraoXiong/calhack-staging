import type { MutationCtx, QueryCtx } from './_generated/server';
import type { HotelDecision, HotelState, Receipt, TransportState, TripState } from '../shared/contracts';
import { check } from '../shared/guards';

type ReadCtx = QueryCtx | MutationCtx;

export async function providerRecords(ctx: ReadCtx, scenarioId: string) {
  const [trip, transport, hotel] = await Promise.all([
    ctx.db.query('trips').withIndex('by_scenario', q => q.eq('scenarioId', scenarioId)).unique(),
    ctx.db.query('transport').withIndex('by_scenario', q => q.eq('scenarioId', scenarioId)).unique(),
    ctx.db.query('hotels').withIndex('by_scenario', q => q.eq('scenarioId', scenarioId)).unique(),
  ]);
  check(trip && transport && hotel, 'Unknown isolated scenario');
  return { trip, transport, hotel, tripState: trip.state as TripState, transportState: transport.state as TransportState, hotelState: hotel.state as HotelState };
}

/** Explicit test-fixture controls. This is not an agent capability or a supplier integration. */
export async function configureProviderFixture(ctx: MutationCtx, scenarioId: string, change: string, value?: unknown) {
  const records = await providerRecords(ctx, scenarioId);
  if (change === 'removeInventory' || change === 'inventoryRevision') {
    const id = typeof value === 'string' ? value : 'S-target';
    const service = records.transportState.services.find(s => s.id === id);
    check(service, 'Unknown fixture service');
    service.revision++;
    if (change === 'removeInventory') service.seats = 0;
    await ctx.db.patch(records.transport._id, {state: records.transportState});
    return;
  }
  if (change === 'bookingChannel') {
    check(value === 'guest' || value === 'member', 'Unknown booking channel');
    records.transportState.booking.channel = value;
    records.transportState.booking.revision++;
    await ctx.db.patch(records.transport._id, {state: records.transportState});
    return;
  }
  if (change === 'hotelPolicy' || change === 'hotelDecision') {
    check(value === 'pending' || value === 'accepted' || value === 'declined', 'Invalid hotel decision');
    records.hotelState.responsePolicy = value;
    if (change === 'hotelDecision' && records.hotelState.booking.requestId) {
      const booking = records.hotelState.booking;
      booking.revision++;
      booking.decision = value;
      booking.acceptedUntil = value === 'accepted' ? booking.requestedUntil : null;
      const receipt = await ctx.db.query('receipts').withIndex('by_operation', q => q.eq('scenarioId',scenarioId).eq('operationId',booking.requestId!)).unique();
      check(receipt, 'Hotel request is missing its provider receipt');
      const previous = receipt.state as Receipt;
      const state: Receipt = { ...previous, outcome: value === 'pending' ? 'pending' : 'committed', bookingRevision: booking.revision, at: records.tripState.now, hotelDecision: value as HotelDecision, evidence: `Existing request ${booking.requestId}: hotel decision ${value}; original night ${booking.serviceNight} preserved. Submission recorded at ${previous.at}.` };
      await ctx.db.patch(receipt._id, {state});
      await ctx.db.insert('events', {scenarioId, eventId:`provider-hotel-decision:${booking.requestId}:${booking.revision}`, state:{eventId:`provider-hotel-decision:${booking.requestId}:${booking.revision}`,kind:'hotel_business_decision',at:records.tripState.now,intentRevision:records.tripState.intentRevision,state:'admitted',detail:`Hotel decision ${previous.hotelDecision} → ${value}; request ${booking.requestId}. ${previous.evidence}`}});
    }
    await ctx.db.patch(records.hotel._id, {state:records.hotelState});
    return;
  }
  throw new Error(`Unknown provider fixture control: ${change}`);
}
