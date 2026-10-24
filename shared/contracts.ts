/** Shared domain contracts. All provider inventory, fares, payments and events are synthetic. */
export type Mode = 'replay' | 'live';
export type HotelDecision = 'accepted' | 'pending' | 'declined';
export type TripStatus = 'needs_information' | 'evaluating' | 'awaiting_decision' | 'executing' | 'partially_confirmed' | 'arrangements_confirmed' | 'needs_help';
export type OperationStatus = 'prepared' | 'dispatched' | 'pending' | 'confirmed' | 'rejected' | 'unknown';
export type Provider = 'transport' | 'hotel';
export interface Capability { bookingId: string; channel: 'guest' | 'member' | 'hotel'; expiresAt: number; available: boolean; }
export interface Grant { revision: number; active: boolean; cap: number; allowTransportWhileHotelPending: boolean; transportBookingId: string; hotelBookingId: string; }
export interface ImportedFact { name: string; value: string; scope: 'personal' | 'trip'; source: string; verified: boolean; }
export interface TripState {
  owner: string; fixtureVersion: string; timezone: 'Asia/Tokyo'; now: number;
  intentRevision: number; stopEpoch: number; active: boolean; mode: Mode; status: TripStatus;
  message: string; nextAction: string; flightId: string; landingAt: number;
  readyFrom: number; readyTo: number; boardingBufferMs: number; hotelRequestedUntil: number;
  grant: Grant; transportAccess: Capability; hotelAccess: Capability;
  imported: boolean; importText: string; facts: ImportedFact[]; unresolved: string[];
  delayed: boolean; travelerArrived: false; charged: number; held: number;
  runRevision: number; checkpoint: string; wakeScheduled: boolean;
  faults: { lostTransportResponse: boolean; providerUnavailable: boolean; pauseBeforeCommit: boolean; lookupUnavailable: boolean };
}
export interface Service { id: string; departureAt: number; hotelArrivalAt: number; fare: number; seats: number; revision: number; destination: string; maxBags: number; }
export interface TransportBooking { id: string; channel: 'guest' | 'member'; revision: number; serviceId: string; departureAt: number; hotelArrivalAt: number; fare: number; priorPaid: number; cutoff: number; serviceDate: string; activeTickets: number; adults: number; bags: number; }
export interface TransportState { booking: TransportBooking; services: Service[]; totalAdditionalCharged: number; amendments: number; }
export interface HotelBooking { id: string; revision: number; serviceNight: string; checkoutAt: number; room: string; defaultLatestArrival: number; requestedUntil: number | null; acceptedUntil: number | null; decision: HotelDecision | 'not_requested'; requestId: string | null; }
export interface HotelState { booking: HotelBooking; responsePolicy: HotelDecision; requests: number; }
export interface Quote { id: string; bookingId: string; bookingRevision: number; serviceId: string; serviceRevision: number; fare: number; additionalCost: number; expiresAt: number; }
export interface EffectArgs { bookingId: string; expectedRevision: number; quote?: Quote; latestArrival?: number; }
export interface Admission { operationId: string; provider: Provider; intentRevision: number; grantRevision: number; stopEpoch: number; argsDigest: string; expiresAt: number; hold: number; args: EffectArgs; }
export interface OperationRecord extends Admission { status: OperationStatus; createdAt: number; updatedAt: number; reason: string; receiptId: string | null; }
export interface Receipt { operationId: string; provider: Provider; argsDigest: string; outcome: 'committed' | 'rejected' | 'pending'; bookingRevision: number; additionalCharged: number; at: number; evidence: string; hotelDecision?: HotelDecision; }
export interface EventRecord { eventId: string; kind: string; at: number; intentRevision: number; state: 'admitted' | 'deduplicated' | 'obsolete'; detail: string; }
export interface ModelDecision { action: 'arrange' | 'ask' | 'wait' | 'stop'; serviceId: string | null; reason: string; }
export interface ModelTrace { mode: Mode; provider: string; model: string; at: number; intentRevision: number; decision: ModelDecision; requestId: string | null; }
export interface Snapshot { scenarioId: string; trip: TripState; transport: TransportState; hotel: HotelState; operations: OperationRecord[]; receipts: Receipt[]; events: EventRecord[]; traces: ModelTrace[]; }
export const TIME = {
  start: Date.parse('2026-11-14T22:30:00+09:00'), landing: Date.parse('2026-11-14T21:30:00+09:00'), delayedLanding: Date.parse('2026-11-14T23:40:00+09:00'),
  readyFrom: Date.parse('2026-11-15T00:25:00+09:00'), readyTo: Date.parse('2026-11-15T01:10:00+09:00'),
  cutoff: Date.parse('2026-11-14T22:55:00+09:00'), lateUntil: Date.parse('2026-11-15T03:00:00+09:00'),
};
/** Canonical serialization: immutable effect identity; not a credential or cryptographic signature. */
export function digest(args: EffectArgs): string {
  const canonical = (x: unknown): unknown => Array.isArray(x) ? x.map(canonical) : x && typeof x === 'object' ? Object.fromEntries(Object.entries(x).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>[k,canonical(v)])) : x;
  return JSON.stringify(canonical(args));
}
export function localTime(at: number): string { return new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Tokyo',month:'short',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(at); }
