import { PROCEDURES } from './procedures';
import type { HotelState, ImportedFact, ModelDecision, Snapshot, TransportState, TripState } from './contracts';

/** The model only chooses among these observed options; commit guards independently recheck every condition. */
export function candidates(trip: TripState, transport: TransportState, hotel: HotelState) {
  const bound = hotel.booking.decision === 'accepted' && hotel.booking.acceptedUntil !== null
    ? hotel.booking.acceptedUntil : trip.hotelRequestedUntil;
  return transport.services.filter(s => s.id !== transport.booking.serviceId && s.seats >= transport.booking.adults &&
    s.maxBags >= transport.booking.bags && s.departureAt >= trip.readyTo + trip.boardingBufferMs &&
    s.hotelArrivalAt <= bound && Math.max(0, s.fare - transport.booking.fare) + trip.charged + trip.held <= trip.grant.cap)
    .sort((a,b) => a.hotelArrivalAt - b.hotelArrivalAt || a.fare - b.fare);
}
export function replayDecision(snapshot: Snapshot): ModelDecision {
  const option = candidates(snapshot.trip, snapshot.transport, snapshot.hotel)[0];
  return option ? { action:'arrange', serviceId:option.id, reason:'Observed departure clears the ready-at-stop interval and boarding buffer, and arrives within the requested hotel window.' }
    : { action:'ask', serviceId:null, reason:'No observed departure satisfies readiness, hotel arrival, capacity, and the remaining additional-cost grant.' };
}
export function validateDecision(value: unknown): ModelDecision {
  if (!value || typeof value !== 'object') throw new Error('Model returned no structured decision');
  const v = value as Record<string, unknown>;
  if (!['arrange','ask','wait','stop'].includes(String(v.action)) || !(v.serviceId === null || typeof v.serviceId === 'string') || typeof v.reason !== 'string' || v.reason.length > 2000)
    throw new Error('Model decision does not match the action contract');
  return { action:v.action as ModelDecision['action'], serviceId:v.serviceId as string|null, reason:v.reason };
}
export function arrangementCheck(trip: TripState, transport: TransportState, hotel: HotelState): {confirmed:boolean; reason:string} {
  if (!trip.imported) return {confirmed:false,reason:'Import and verify the three confirmations first.'};
  if (trip.charged+trip.held>trip.grant.cap) return {confirmed:false,reason:'Previously committed additional charges and unresolved holds exceed the new spending limit. Existing effects are preserved; a budget decision is required.'};
  if (transport.booking.activeTickets !== 1) return {confirmed:false,reason:'The provider does not show exactly one valid bus ticket.'};
  if (transport.booking.departureAt < trip.readyTo + trip.boardingBufferMs) return {confirmed:false,reason:'The booked bus departs before you can safely reach its boarding stop.'};
  if (hotel.booking.serviceNight !== '2026-11-14') return {confirmed:false,reason:'The original hotel night is not preserved.'};
  const bound = hotel.booking.decision === 'accepted' ? hotel.booking.acceptedUntil : hotel.booking.defaultLatestArrival;
  if (bound === null || transport.booking.hotelArrivalAt > bound) return {confirmed:false,reason:'The hotel has not accepted the arrival time of the current bus.'};
  if (hotel.booking.decision === 'declined') return {confirmed:false,reason:'The hotel declined the late-arrival request.'};
  return {confirmed:true,reason:'The bus and the hotel arrival window are verified. Your original hotel night is preserved.'};
}

export function parseConfirmations(text: string, transport: TransportState, hotel: HotelState): {facts:ImportedFact[]; unresolved:string[]} {
  const facts: ImportedFact[] = [];
  let input: Record<string, any>;
  try { input=JSON.parse(text); } catch { return {facts,unresolved:['Use the supplied structured confirmation bundle (valid JSON). Free-form email extraction is outside this fixture importer.']}; }
  if(!input||typeof input!=='object'||Array.isArray(input))return {facts,unresolved:['The confirmation bundle must be a JSON object with flight, transport and hotel records.']};
  const unresolved:string[]=[];
  const add=(name:string, value:unknown, expected:unknown, source:string, scope:'trip'|'personal'='trip')=>{
    const verified=value!==undefined && value===expected;
    facts.push({name,value:value===undefined?'Missing':String(value),scope,source,verified});
    if (!verified) unresolved.push(`${name}: ${value===undefined?'missing':`does not match the controlled provider (${String(expected)})`}`);
  };
  add('Flight identity',input.flight?.id,'F-001','supplied synthetic flight confirmation');
  add('Flight landing',input.flight?.landingAt,'2026-11-14T21:30:00+09:00','supplied synthetic flight confirmation');
  add('Flight provider',input.flight?.provider,'Fixture Air','supplied synthetic flight confirmation');
  add('Destination timezone',input.flight?.timezone,'Asia/Tokyo','supplied synthetic flight confirmation');
  add('Flight channel',input.flight?.channel,'airline','supplied synthetic flight confirmation');
  add('Bus booking',input.transport?.id,transport.booking.id,'controlled transport booking');
  add('Original channel',input.transport?.channel,transport.booking.channel,'controlled transport booking');
  add('Bus service date',input.transport?.serviceDate,transport.booking.serviceDate,'controlled transport booking');
  add('Bus provider',input.transport?.provider,'Yoru Test Transport','controlled transport booking');
  add('Bus departure',input.transport?.departureAt,'2026-11-14T23:00:00+09:00','controlled transport booking');
  add('Prior paid fare',input.transport?.fare,transport.booking.priorPaid,'controlled transport booking');
  add('Payment currency',input.transport?.currency,'JPY','controlled transport booking');
  add('Bus access',input.transport?.managementAccess,'fixture-guest-capability','fixture capability reference, scoped to B-001');
  add('Adult travelers',input.transport?.adults,transport.booking.adults,'controlled transport booking');
  add('Suitcases',input.transport?.bags,transport.booking.bags,'trip-specific traveler declaration');
  add('Hotel booking',input.hotel?.id,hotel.booking.id,'controlled hotel booking');
  add('Hotel night',input.hotel?.serviceNight,hotel.booking.serviceNight,'controlled hotel booking');
  add('Hotel provider',input.hotel?.provider,'Yoru Test Hotel','controlled hotel booking');
  add('Hotel channel',input.hotel?.channel,'hotel','controlled hotel booking');
  add('Hotel checkout',input.hotel?.checkoutAt,'2026-11-15T12:00:00+09:00','controlled hotel booking');
  add('Hotel access',input.hotel?.managementAccess,'fixture-hotel-capability','fixture capability reference, scoped to H-001');
  facts.push({name:'Fewer transfers',value:'preferred',scope:'personal',source:'explicit fixture traveler preference',verified:true});
  return {facts,unresolved};
}

/** Only reviewed, currently applicable procedures enter the planner's action vocabulary. */
export function applicableProcedures(snapshot: Snapshot) {
  const {trip,transport,hotel}=snapshot;
  return PROCEDURES.filter(procedure=>procedure.id==='guest-bus-amendment'
    ? transport.booking.channel==='guest' && trip.transportAccess.channel==='guest' && trip.transportAccess.available && trip.transportAccess.bookingId===transport.booking.id && trip.now<=trip.transportAccess.expiresAt
    : trip.hotelAccess.channel==='hotel' && trip.hotelAccess.available && trip.hotelAccess.bookingId===hotel.booking.id && trip.now<=trip.hotelAccess.expiresAt)
    .map(procedure=>({id:procedure.id,version:procedure.version,applicability:procedure.applicability,actions:procedure.actions,sources:procedure.sources.map(source=>({url:source.url,rule:source.rule}))}));
}
