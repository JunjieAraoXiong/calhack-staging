import type { Snapshot } from './contracts';

export interface Check { name: string; pass: boolean; detail: string; }
/** Independent final-state scorer: checks provider records and receipts, never model prose. */
export function scoreArrangement(s: Snapshot): Check[] {
  const b = s.transport.booking;
  const h = s.hotel.booking;
  const busReceipts = s.receipts.filter(r => r.provider === 'transport' && r.outcome === 'committed');
  const check = (name: string, pass: boolean, detail: string): Check => ({name,pass,detail});
  return [
    check('same booking, one valid ticket', b.id === 'B-001' && b.activeTickets === 1, `${b.id}, ${b.activeTickets} valid ticket(s)`),
    check('feasible ready-at-stop window', b.departureAt >= s.trip.readyTo+s.trip.boardingBufferMs, `${b.departureAt} >= ${s.trip.readyTo+s.trip.boardingBufferMs}`),
    check('next-day service date matches departure', b.serviceDate === new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).format(b.departureAt), b.serviceDate),
    check('explicit hotel acceptance covers arrival', h.decision === 'accepted' && h.acceptedUntil !== null && b.hotelArrivalAt <= h.acceptedUntil, `${h.decision}; until ${h.acceptedUntil}; ETA ${b.hotelArrivalAt}`),
    check('original accommodation preserved', h.id === 'H-001' && h.serviceNight === '2026-11-14' && h.checkoutAt === Date.parse('2026-11-15T12:00:00+09:00'), `${h.id} / night ${h.serviceNight}`),
    check('charges match authoritative receipts', busReceipts.reduce((sum,r)=>sum+r.additionalCharged,0) === s.transport.totalAdditionalCharged && s.trip.charged === s.transport.totalAdditionalCharged, `provider ${s.transport.totalAdditionalCharged}; agent ${s.trip.charged}`),
    check('additional charges and holds within grant', s.trip.charged+s.trip.held <= s.trip.grant.cap && s.trip.held === 0, `charged ${s.trip.charged}, held ${s.trip.held}, cap ${s.trip.grant.cap}`),
    check('all effective operations resolved', !s.operations.some(o=>['unknown','dispatched','prepared','pending'].includes(o.status)), s.operations.map(o=>`${o.provider}:${o.status}`).join(', ')),
    check('confirmation has independent supporting state', s.trip.status === 'arrangements_confirmed' && b.departureAt >= s.trip.readyTo+s.trip.boardingBufferMs && h.decision === 'accepted' && h.acceptedUntil !== null && b.hotelArrivalAt <= h.acceptedUntil, s.trip.status),
    check('arrangements do not assert physical arrival', s.trip.travelerArrived === false, 'Physical arrival is a separate observation.'),
  ];
}
