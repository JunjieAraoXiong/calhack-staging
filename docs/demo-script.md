# Yoru: three-minute arrival demo

Run the backend and frontend using the repository README. Keep the local backend process running throughout the demonstration. Set up the live model adapter before choosing Live model; replay is a separate, explicitly labeled mode.

## 0:00–0:30 · Start with existing commitments

Open the app. Say: “This traveler already has a flight, an airport-bus ticket, and a hotel room. The problem is coordinating them when something changes.”

Choose **Live model**, then **Prepare my arrival**. Click **Import & verify confirmations**. The importer checks the supplied synthetic confirmation bundle against the controlled providers. Point out B-001’s guest channel, the Nov 14 hotel service night, one adult and two suitcases, and the JPY 1,000 additional-cost cap.

Boundary: flight events, inventory, payments, and bookings are synthetic. Provider changes are persisted business mutations in controlled providers. They are not commercial bookings.

## 0:30–1:20 · One material change, several obligations

Click **Simulate flight delay**. The new landing estimate is Nov 14 at 23:40. The assumed ready-at-stop interval extends to Nov 15 at 01:10, with another ten minutes required for boarding.

Say: “Landing time is not boarding readiness. The early bus is infeasible, and the very late bus misses the hotel’s accepted arrival bound.”

Wait for the runtime. It obtains explicit hotel acceptance, refreshes the transport quote, amends the original guest reservation and verifies both provider outcomes. In a successful canonical run, the card shows the next-day 01:40 bus, hotel acceptance until 03:00, and JPY 500 additional charge. It says **arrangements confirmed**, not that the traveler has arrived.

## 1:20–1:50 · Show the evidence

Open **Details & evidence**. Show the recorded live model decision, provider operations and receipts, and the versioned local procedures. The operator FAQ informs procedure semantics; it does not imply integration with that operator.

Open **Provider records**. Read the independent provider-owned records: one active B-001 ticket, one amendment effect, JPY 500 charged, and H-001 still on the original Nov 14 night with explicit late-arrival acceptance.

## 1:50–2:35 · Uncertainty stays visible

Open **Demo controls**, choose **New · pending hotel**, then import and inject the delay. With default permission, the bus remains unchanged while the hotel is pending. Show the concrete decision card. If demonstrating the tradeoff, explicitly choose **Allow bus change with hotel pending**. The bus can change while the trip remains partially confirmed. Select a declined hotel decision to show that the completed bus amendment is retained and no hotel cancellation is invented.

For a strictly timed talk, use replay for this second scenario and state that this demonstrates the same deterministic execution mechanics, without another live inference call.

## 2:35–3:00 · Durable, revisable arrangements

Return to an accepted scenario or create one. Reload the page to show persisted state. Inject **Later material delay** after confirmation: the trip revalidates its existing commitments and reopens work if they no longer fit.

Say: “The agent keeps track of what was actually agreed, what remains uncertain, and what needs your decision. That is what makes an arrival feel manageable.”

## Extra fault demonstrations

- **Lose response after transport commit**, optionally with operation lookup unavailable: an unknown obligation retains its cost hold. Restore lookup and wake reconciliation. Provider inspection must still show one amendment and one charge.
- **Pause before provider commit**, then revoke the action grant or change readiness: a stale proposal cannot authorize a new effect.
- **Duplicate same event**: the existing event identity is deduplicated, with no extra provider effect.
- **Provider unavailable**: the interface identifies persisted records and pending fresh verification; it does not claim a new success.

Check the current implementation progress and run evidence before claiming any acceptance test passed. This script specifies the intended demonstration; it is not a test-results report.
