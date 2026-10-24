# Local workflow evidence: Tokyo arrival-night travel agent

Research date: **2026-10-22, America/Los_Angeles**. This is source-based product research, not a tested booking integration or travel instruction for a particular date. Sources reviewed: **33 search-result slots** across five Exa searches (7 + 7 + 7 + 7 + 5); repeated search results are not unique sources. Eight distinct primary pages are used below. No real bookings, messages, or payments were made.

## Findings that materially change the product

### 1. A flight delay creates an expiring decision across two independent providers

Tokyo Airport Limousine's [official FAQ](https://www.limousinebus.co.jp/en/support/) states that flight delays do not create an automatic refund entitlement for a missed bus; users must change or cancel at least five minutes before the booked departure. Its airport-departure guidance suggests allowing 60 minutes after an international flight's scheduled arrival, while explicitly warning that procedures can take longer. It recommends changing the bus time before boarding a delayed flight. These are operator-specific rules, not universal airport transport rules.

The same FAQ says a post-midnight trip must be booked under its actual calendar date: its example is a 00:20 November 15 bus, not November 14. Member and guest reservation-management paths differ; a guest can use the link in the reservation email.

**Product implication (inference):** the agent needs an explicit deadline, a readiness estimate with uncertainty, a reservation-management link, and the date in the destination timezone. Merely showing a later route leaves the existing financial and operational commitment unresolved. The useful unit of automation is a verified change before the deadline.

Quality: primary operating company's support instructions; useful for its own contracts, not proof that our system can invoke the site. Publication date absent; retrieved for this review.

### 2. “Public transport stops at midnight” would be a wrong generic rule

Haneda's [official bus access page](https://tokyo-haneda.com/en/access/bus/index.html) lists Terminal 3 late-night departures for Shinjuku/Ikebukuro at 00:20, 01:00, 01:40 and 02:20, and a Yokohama/Sakuragicho departure at 01:20. The page says schedules can change and directs travelers to the respective operators. This documents candidate services; it does not establish availability or seats for a particular journey.

Haneda's [international arrival procedure](https://tokyo-haneda.com/en/flight/int/arr_step.html?tab=) includes immigration, baggage collection and customs before the arrival lobby. Flight landing time therefore cannot directly substitute for time at the bus stop.

The [airport terminal FAQ](https://tokyo-haneda.com/en/faq/terminal_details.html) also distinguishes terminal operating hours; Terminal 3 is generally open 24 hours, while domestic areas of Terminals 1 and 2 have overnight closure rules. Do not generalize a terminal's availability to the whole airport.

**Product implication (inference):** preserve service, terminal, direction, travel date and source timestamp. Reconcile higher-level tourism summaries against the current operator. Do not hard-code an apparent local custom as a timeless truth.

Quality: primary airport operational pages; the transport operator remains the authority for a specific service. Airport bus and arrival pages fetched in full; terminal FAQ reviewed in search output.

### 3. A restaurant reservation is not one universal “book/edit/pay” operation

TableCheck's [payment-method guide](https://support-diners.tablecheck.com/hc/en-us/articles/44451699391001-About-Payment-Methods) distinguishes advance payment, card authorization, payment at the restaurant, participating-restaurant TableCheck Pay, and reservation fees. A card authorization is not completed meal payment; the amount and payment rules vary by restaurant. Its [amendment help](https://support-diners.tablecheck.com/hc/en-us/articles/900000873503-Amending-Your-Pre-Authorized-Prepaid-Reservation) says online modification depends on the restaurant and whether the confirmation page offers a change button. Some cases require a new reservation followed by cancellation of the original, with the restaurant's cancellation policy checked.

Its [direct-contact help](https://support-diners.tablecheck.com/hc/en-us/articles/900004340263-Please-Contact-the-Property-Directly) directs late-arrival, dietary accommodation, refund and other venue-specific questions to the property; the platform help center cannot answer on the property's behalf.

**Product implication (inference):** a local workflow must branch on actual provider capability. “Changed the itinerary” must not imply “changed the reservation”; “card entered” must not imply “paid.” For a late-arrival request, sent/requested/acknowledged need separate states. Do not claim that every Japanese restaurant requires a local phone number: this research did not establish that.

Quality: primary platform support, directly describes operational limitations. No hands-on reservation or authenticated flow verified.

### 4. Tourist-compatible setup needs device and payment preconditions

JR East's [Welcome Suica Mobile page](https://www.jreast.co.jp/en/multi/wsmlp/), labeled current as of March 2026, describes issuance and top-up through its iOS app. It requires Apple Pay-supported devices and age 13+, and says country restrictions may prevent setup/top-up until arrival in Japan. The balance expires after 180 days and is non-refundable. The page now documents JR-EAST Train Reservation login/sign-up and purchase steps for reserved Shinkansen/limited-express seats; a 2025 announcement alone would understate the current documented scope.

**Product implication (inference):** a personal agent should first establish device, payment capability, travel timing and whether the traveler already has a suitable transit card. It should not tell an incompatible-device user to follow the same steps. The user's own Apple Pay authorization remains a real device-bound step; a text agent's claim cannot replace it.

Quality: primary rail operator's product instructions, dated March 2026; useful current evidence, not an agent-control API contract.

## Refined meaning of “learn the local workflow”

A defensible local playbook is a versioned conditional procedure, not a list of popular apps or a model's unsourced recollection. Suggested record:

| Field | Example for a timed airport bus |
|---|---|
| Scope | Operator, airport terminal, origin/destination, ticket channel |
| Source and freshness | Official FAQ URL, fetched timestamp, timetable effective date if given |
| Traveler preconditions | Party size, luggage, mobility needs, device/payment capability |
| Current commitment | Provider booking ID, departure in Asia/Tokyo, fare/payment state |
| Trigger | Flight estimate changes; baggage readiness changes; service cancellation |
| Decision deadline | Last allowed change/cancel time derived from that booking's rules |
| Feasibility | Ready-at-stop estimate plus uncertainty; seats checked separately |
| Action branch | Modify existing ticket; cancel plus rebook; or prepare a human/provider handoff |
| Proof | Provider-confirmed new booking and old booking status, not a chat statement |
| Failure handling | Unknown write outcome requires read-back before retry; expired deadline is explicit |

An LLM can extract and propose playbook revisions, but reviewed source rules and observed successful flows should determine whether it is eligible for execution. Browser observations can provide evidence about a workflow; one successful run does not prove it applies to other merchants, channels or dates.

## Credible demo proposal

**Story:** an international visitor has a flight to Haneda T3, a timed bus reservation and a hotel reservation. A flight-delay event arrives while the original bus can still be changed. The agent recognizes the bus is no longer reachable, locates a later service on the next calendar date, and checks whether the hotel can accept the new arrival time. It then reconciles both provider states and presents a practical arrival card.

**Illustrative fixture, not live travel information:** flight initially arrives 21:30; existing bus departs 23:00. At 22:30 a synthetic event changes estimated landing to 23:40. A fixture's airport-readiness assumption produces 00:40. A seeded 01:00 bus has seats; the fixture estimates hotel arrival at 01:45. The controlled hotel's existing check-in condition is 01:00, so a late-arrival request must be acknowledged before the plan can be shown as fully arranged. These are intentionally selected demo values and policies; they are not claims about a real flight, hotel's check-in policy, travel time or inventory.

Recommended sequence:

1. Show imported flight/bus/hotel confirmations plus traveler preferences and agreed action limits.
2. Inject the delay, visibly labeled simulated. Show the endangered bus-change deadline and next-day date.
3. Read relevant official-source facts and current controlled inventory. Derive the affected commitments.
4. Perform real state changes on controlled transport/hotel services: bus amendment and acknowledged late-arrival request. Preserve confirmation IDs, amounts, timezone and status.
5. Display the new ground-transfer instruction and hotel acknowledgment. If the hotel declines, show a feasible alternative or a precisely scoped user decision.
6. Repeat with a duplicate event or lost provider response. Prove no duplicate booking and do not fabricate an acknowledgment.

Optional second vignette: the traveler has an incompatible device for the selected mobile transit setup. The playbook changes the proposed setup steps rather than insisting on the same app. This is an informative planning branch; it should not crowd out the main cross-provider execution story.

## Implementation and evidence boundaries

| Layer | Achievable demo evidence | Boundary |
|---|---|---|
| Local knowledge | Retrieve primary pages and display cited extracted conditions | Not a guarantee of date-specific seat inventory or future policy stability |
| Traveler context | Parse user-provided or synthetic confirmations into explicit typed state | No claim of broad mailbox integration unless actually implemented |
| Monitoring | Inject a delay event into a real durable event handler | Label the flight event simulated unless a licensed actual feed is connected |
| Execution | Mutate two independently modeled controlled providers and verify receipts | Controlled services do not prove real Limousine Bus/TableCheck/hotel integration |
| Real site access | Read public pages; a separately tested browser adapter may prepare a supported action | This research did not establish public booking APIs, authenticated automation access, permission or supported writes for these providers |
| Hotel contact | A controlled inbox can return an explicit accepted/declined result | Sending a request is not acceptance; real property policy must be obtained for the actual booking |
| Payment | Track authorized/held/paid/refunded as distinct states | Do not label a simulator payment or card hold as a real completed purchase |

Minimum acceptance checks: timezone and midnight date correct; change initiated before deadline; chosen route feasible under declared uncertainty; existing hotel booking preserved; two provider read-backs match the new plan; repeated events do not create duplicate commitments; unknown outcomes remain unresolved until reconciled.

## Research gaps

- No authenticated booking flow, foreign-phone acceptance, baggage allowance or merchant API access was tested.
- No universal late-check-in rule was identified; use the actual property and booking's rules, or explicitly synthetic fixture data.
- The first night's problem is evidenced by operational complexity, but its frequency, willingness to delegate and willingness to pay still require traveler interviews and observed task trials.
- The research supports a narrow demonstrable product hypothesis, not a claim of exclusive market differentiation.
