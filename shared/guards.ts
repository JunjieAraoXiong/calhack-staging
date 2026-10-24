import { digest, type EffectArgs, type HotelState, type OperationRecord, type Provider, type Quote, type Service, type TransportState, type TripState } from './contracts';

export function check(condition: unknown, reason: string): asserts condition {
  if (!condition) throw new Error(reason);
}

/** All checks are re-run from the authoritative transaction snapshot at provider commit. */
export function validateAdmission(trip: TripState, operation: OperationRecord | null, provider: Provider, operationId: string, args: EffectArgs, admissionRef: string, operations: OperationRecord[], actualTransportCharged = trip.charged): OperationRecord {
  check(operation, 'Missing operation admission');
  check(operationId === admissionRef && operation.operationId === operationId, 'Admission identity mismatch');
  check(operation.provider === provider, 'Admission provider mismatch');
  check(operation.argsDigest === digest(args) && digest(operation.args) === digest(args), 'Operation arguments changed');
  check(['prepared', 'dispatched', 'unknown', 'pending'].includes(operation.status), 'Operation is no longer admitted');
  check(trip.imported && trip.unresolved.length === 0, 'Booking import is unresolved');
  check(trip.active && trip.grant.active, 'Action grant revoked or trip stopped');
  check(operation.intentRevision === trip.intentRevision, 'Stale intent revision');
  check(operation.grantRevision === trip.grant.revision, 'Stale grant revision');
  check(operation.stopEpoch === trip.stopEpoch, 'Stale stop epoch');
  check(Number.isFinite(operation.expiresAt) && trip.now <= operation.expiresAt, 'Admission expired');
  check(Number.isFinite(operation.hold) && operation.hold >= 0, 'Invalid cost hold');
  const allowedBooking = provider === 'transport' ? trip.grant.transportBookingId : trip.grant.hotelBookingId;
  check(args.bookingId === allowedBooking, 'Booking outside granted action scope');
  const access = provider === 'transport' ? trip.transportAccess : trip.hotelAccess;
  check(access.available && access.bookingId === args.bookingId && trip.now <= access.expiresAt, 'Management access required or expired');
  check(access.channel === (provider === 'transport' ? 'guest' : 'hotel'), 'Correct original-channel management access required');
  const pendingHolds = operations.filter(op => ['prepared', 'dispatched', 'pending', 'unknown'].includes(op.status)).reduce((sum, op) => sum + op.hold, 0);
  check(Number.isFinite(trip.grant.cap) && actualTransportCharged + pendingHolds <= trip.grant.cap, 'Additional charges and outstanding holds exceed grant');
  check(!trip.faults.providerUnavailable, 'Provider unavailable');
  return operation;
}

export function createQuote(trip: TripState, transport: TransportState, serviceId: string): Quote {
  const service = transport.services.find(s => s.id === serviceId);
  check(service, 'Unknown service');
  check(service.id !== transport.booking.serviceId, 'Already booked on this service');
  check(service.seats >= transport.booking.adults, 'Insufficient inventory');
  check(service.fare >= transport.booking.fare, 'Refund or fare decrease requires separate policy');
  const expiresAt = Math.min(trip.now + 120_000, transport.booking.cutoff);
  return { id: `${transport.booking.id}:${transport.booking.revision}:${service.id}:${service.revision}:${expiresAt}`, bookingId: transport.booking.id, bookingRevision: transport.booking.revision, serviceId, serviceRevision: service.revision, fare: service.fare, additionalCost: service.fare - transport.booking.fare, expiresAt };
}

export function hotelBound(trip: TripState, hotel: HotelState): number | null {
  const booking = hotel.booking;
  if (booking.decision === 'accepted') return booking.acceptedUntil;
  if (booking.decision === 'pending' && trip.grant.allowTransportWhileHotelPending) return booking.requestedUntil;
  if (booking.decision === 'not_requested') return booking.defaultLatestArrival;
  return null;
}

export function validateTransportEffect(trip: TripState, transport: TransportState, hotel: HotelState, operation: OperationRecord, args: EffectArgs): Service {
  const booking = transport.booking;
  check(booking.channel === 'guest', 'Guest procedure does not support a member booking');
  check(booking.id === args.bookingId, 'Transport booking mismatch');
  check(args.expectedRevision === booking.revision, 'Stale transport booking revision');
  check(trip.now <= booking.cutoff, 'Provider amendment cutoff has passed');
  check(args.latestArrival === undefined, 'Unsupported transport effect arguments');
  const q = args.quote;
  check(q, 'Versioned quote required');
  const service = transport.services.find(s => s.id === q.serviceId);
  check(service && service.id !== booking.serviceId, 'Invalid target service');
  check(q.bookingId === booking.id && q.bookingRevision === booking.revision && q.serviceRevision === service.revision, 'Stale quote or inventory revision');
  check(trip.now <= q.expiresAt && q.expiresAt <= booking.cutoff, 'Quote expired');
  check(q.id === `${booking.id}:${booking.revision}:${service.id}:${service.revision}:${q.expiresAt}`, 'Quote identity mismatch');
  check(Number.isFinite(q.fare) && q.fare === service.fare && q.additionalCost === service.fare - booking.fare && q.additionalCost >= 0, 'Quote fare mismatch');
  check(operation.hold === q.additionalCost, 'Exact incremental fare hold required');
  check(service.seats >= booking.adults && service.maxBags >= booking.bags, 'Inventory or baggage condition changed');
  check(trip.readyTo + trip.boardingBufferMs <= service.departureAt, 'Departure is earlier than safe readiness');
  const bound = hotelBound(trip, hotel);
  check(bound !== null && service.hotelArrivalAt <= bound, 'Hotel arrival is outside accepted or authorized provisional bound');
  return service;
}
