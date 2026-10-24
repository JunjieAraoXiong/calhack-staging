import { TIME, type HotelDecision, type HotelState, type Mode, type TransportState, type TripState } from './contracts';

export const FIXTURE_VERSION = 'tokyo-arrival-v1';
const jp = (value: string) => Date.parse(`${value}+09:00`);

export const SYNTHETIC_CONFIRMATIONS = JSON.stringify({
  flight: { id: 'F-001', provider: 'Fixture Air', landingAt: '2026-11-14T21:30:00+09:00', channel: 'airline', timezone: 'Asia/Tokyo' },
  transport: { id: 'B-001', provider: 'Yoru Test Transport', channel: 'guest', serviceDate: '2026-11-14', departureAt: '2026-11-14T23:00:00+09:00', fare: 3000, currency: 'JPY', adults: 1, bags: 2, managementAccess: 'fixture-guest-capability' },
  hotel: { id: 'H-001', provider: 'Yoru Test Hotel', channel: 'hotel', serviceNight: '2026-11-14', checkoutAt: '2026-11-15T12:00:00+09:00', managementAccess: 'fixture-hotel-capability' },
}, null, 2);

export function makeTrip(mode: Mode = 'replay'): TripState {
  return {
    owner: 'fixture-traveler', fixtureVersion: FIXTURE_VERSION, timezone: 'Asia/Tokyo', now: TIME.start,
    intentRevision: 1, stopEpoch: 0, active: true, mode, status: 'needs_information',
    message: 'Import your three synthetic confirmations to begin.', nextAction: 'Add your flight, airport bus and hotel confirmations.',
    flightId: 'F-001', landingAt: TIME.landing,
    readyFrom: jp('2026-11-14T22:15:00'), readyTo: jp('2026-11-14T22:35:00'), boardingBufferMs: 600_000,
    hotelRequestedUntil: TIME.lateUntil,
    grant: { revision: 1, active: true, cap: 1000, allowTransportWhileHotelPending: false, transportBookingId: 'B-001', hotelBookingId: 'H-001' },
    transportAccess: { bookingId: 'B-001', channel: 'guest', expiresAt: jp('2026-11-16T00:00:00'), available: true },
    hotelAccess: { bookingId: 'H-001', channel: 'hotel', expiresAt: jp('2026-11-16T00:00:00'), available: true },
    imported: false, importText: '', facts: [], unresolved: [], delayed: false, travelerArrived: false,
    charged: 0, held: 0, runRevision: 0, checkpoint: 'awaiting_import', wakeScheduled: false,
    faults: { lostTransportResponse: false, providerUnavailable: false, pauseBeforeCommit: false, lookupUnavailable: false },
  };
}

export function makeTransport(): TransportState {
  return {
    booking: { id: 'B-001', channel: 'guest', revision: 1, serviceId: 'S-original', departureAt: jp('2026-11-14T23:00:00'), hotelArrivalAt: jp('2026-11-14T23:45:00'), fare: 3000, priorPaid: 3000, cutoff: TIME.cutoff, serviceDate: '2026-11-14', activeTickets: 1, adults: 1, bags: 2 },
    services: [
      { id: 'S-original', departureAt: jp('2026-11-14T23:00:00'), hotelArrivalAt: jp('2026-11-14T23:45:00'), fare: 3000, seats: 0, revision: 1, destination: 'Fixture Hotel stop', maxBags: 2 },
      { id: 'S-early', departureAt: jp('2026-11-15T00:50:00'), hotelArrivalAt: jp('2026-11-15T01:35:00'), fare: 3200, seats: 1, revision: 1, destination: 'Fixture Hotel stop', maxBags: 2 },
      { id: 'S-target', departureAt: jp('2026-11-15T01:40:00'), hotelArrivalAt: jp('2026-11-15T02:25:00'), fare: 3500, seats: 1, revision: 1, destination: 'Fixture Hotel stop', maxBags: 2 },
      { id: 'S-late', departureAt: jp('2026-11-15T02:20:00'), hotelArrivalAt: jp('2026-11-15T03:05:00'), fare: 3400, seats: 1, revision: 1, destination: 'Fixture Hotel stop', maxBags: 2 },
    ],
    totalAdditionalCharged: 0, amendments: 0,
  };
}

export function makeHotel(policy: HotelDecision = 'accepted'): HotelState {
  return { booking: { id: 'H-001', revision: 1, serviceNight: '2026-11-14', checkoutAt: jp('2026-11-15T12:00:00'), room: 'Standard room · one adult', defaultLatestArrival: jp('2026-11-15T01:00:00'), requestedUntil: null, acceptedUntil: null, decision: 'not_requested', requestId: null }, responsePolicy: policy, requests: 0 };
}
