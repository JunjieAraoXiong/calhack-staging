# Travel Agent Delivery Roadmap and Demonstration

**Current scope: October 22, 2026.** Implement the [travel-agent system design](16-travel-agent-system-design.md): one Tokyo arrival journey with imported flight, guest bus, and hotel confirmations; one durable controller; curated local procedures; and two controlled providers with independently verifiable outcomes.

**Status:** the scoped local implementation is now verified; see the [verification report](verification-report.md) for actual results. The milestones below preserve the delivery plan. The [implementation goal prompt](prompts/travel-agent-goal.md) remains the runnable handoff, and the [demo script](demo-script.md) describes the implemented walkthrough. The earlier shopping roadmap is summarized in the historical appendix below.

This is a milestone-based product plan without an assumed 36-hour engineering cap. Event eligibility and sponsor submission requirements remain separate from independent product development. The older [sponsor research](07-sponsor-track-strategy.md) does not establish eligibility for this travel implementation.

## 1. The first deliverable

The product accepts the arrangements a traveler already has, detects an arrival disruption, chooses a supported local procedure, changes the necessary arrangements within the user's bounds, and verifies the resulting provider state.

Build one complete path before adding destinations or service categories:

> Imported flight + guest bus ticket + original hotel night → simulated delay → check feasibility and cutoff → select the guest management procedure → obtain any necessary decision → coordinate bus amendment and hotel late-arrival acceptance → read back both providers → show confirmed and unresolved arrangements.

Use structured replanning of the remaining tasks. Preserve completed effects and user constraints. Keep explicit relationships such as flight arrival → readiness at bus stop → bus departure → hotel arrival, but defer reverse-dependency optimization and the original multi-mission shopping benchmark.

The first product screen should answer what is arranged, what the traveler should do next, and which decision remains. Execution traces belong behind a details view.

## 2. Milestones and acceptance gates

| Milestone | Deliverable | Gate before moving on |
| --- | --- | --- |
| M0: contracts and fixture | Travel commitments, time semantics, action scope, provider capabilities, operation identity, curated procedures, controllable test clock, and independent expected outcomes | Team can explain which service owns each fact, what confirms success, and what happens after an uncertain write; fixture values and simulation boundaries are explicit |
| M1: one complete vertical flow | Imported confirmations → actual model proposal → deterministic checks → two supported provider interactions → read-back results → arrival card | A fresh demo session completes the happy path using real application state changes; trace links model call, chosen procedure, operations, and resulting provider records |
| M2: persistent coordination | Stored task/event/operation state, deadline wake-ups, response handling, refresh/reconnect, event deduplication, and current-intent checks | Refresh or replace the controller without losing work; a duplicate event cannot duplicate a commitment; late evidence remains recorded |
| M3: failure and boundary tests | Lost response, stale proposal, deadline expiry, unavailable seat, hotel pending/refusal, missing guest access, user correction, and executor outage | Independent final-state assertions pass; incomplete arrangements remain visibly incomplete; no unverified success or duplicate side effect |
| M4: reproducible product demonstration | Clear UI, documented setup/reset, isolated demo data, actual-machine rehearsal, evidence artifacts, and recorded fallback | Another developer can start the system from documented configuration and reproduce the flow and failure cases without the author's private cookies or manual record edits |
| M5: optional production pilot or comparative research | One separately qualified real provider integration or a frozen paired travel benchmark | Supported access and operational behavior are tested, or comparison conditions and outcome scoring are frozen before reporting results |

M0 is the foundation for parallel implementation. UI, planner, and provider work can proceed together once their shared types and ownership contracts are agreed. Test fixtures and the outcome checker begin at M0.

### M0: make the domain explicit

Use the authoritative fixture and schemas from [16](16-travel-agent-system-design.md). At minimum, define:

- The original provider and booking channel, reservation identity, management access, payment state, applicable policy, and latest observation for each commitment.
- Destination timezone and local calendar date, original hotel service night, a ready-at-the-correct-bus-stop interval, boarding margin, amendment cutoff, and execution buffer.
- A guest management procedure and a hotel late-arrival procedure, each with source references, applicability, required access, available actions, and completion evidence.
- Separate controller, transport-provider, and hotel-provider state. They may share deployment infrastructure for the MVP, but each provider owns its business transitions and receipts. The controller cannot claim success by editing its own timeline.
- Stable operation identity and argument binding; supported idempotent submission and operation lookup in the controlled provider; truthful unknown outcomes where evidence is unavailable.
- The user's spending and effect scope, including the policy for a pending hotel response near the bus amendment cutoff.

All numeric flight, inventory, pricing, readiness, and hotel-policy data are fixture values. Official source rules are scoped to their operator and retrieval date. A historical source extract is not live availability.

### M1: complete the path before optimizing

The model should receive the actual current observations, traveler constraints, and supported procedure candidates. It proposes a typed action or remaining plan; application code checks dates, current availability, cutoff, authority, and costs before each effect. Do not hard-code a favorable final answer and present it as model reasoning.

When feasible, obtain hotel acceptance for a defined latest arrival time before amending the bus, then refresh the bus quote and inventory. A hotel acknowledgment does not hold a seat. If the hotel remains pending near the cutoff, apply the explicit bounded-action policy or present the specific decision to the user. Silence is not approval.

At completion, read the provider records. There must be one valid amended bus reservation, the original hotel night must remain booked, and the late-arrival condition must be accepted before showing the arrangements as fully confirmed.

Use one tested execution path per required operation. An API call to a controlled provider is API execution. A WebMCP call requires actual registration, discovery, invocation, and visible provider state change in the chosen browser. If a bridge or polyfill is used, name it. None of these paths establishes access to a real bus company or hotel.

### M2: preserve progress across interruptions

Persist task revisions, wake events, bounded runs, proposals, operations, and receipts. Use the current task state when resuming; a cached model context is not a fresh provider observation. Accept and reconcile late receipts even after the originating proposal becomes obsolete.

The mandatory backend/provider path must continue its supported work while the traveler UI is closed and those services remain available. An optional page-bound executor cannot invoke tools after its page closes. For that path, persist waiting-for-executor state and revalidate on reconnect. Backend durability alone is not an always-available browser.

When a provider has committed but its response is lost, query the original operation identity before another write. An old booking snapshot alone does not prove non-execution. Keep the outcome unknown until the adapter's evidence resolves it.

### M3: check the outcomes independently

Tests should exercise meaningful state transitions and externally visible results. They should not merely repeat the planner's implementation or compare its text with a canned answer.

| Case | Independent assertion |
| --- | --- |
| Normal imported journey | Provider identities, original channels, hotel service night, and traveler constraints are preserved |
| Delay across midnight | The replacement bus uses the correct next calendar date and is feasible under the declared readiness interval and boarding margin |
| Guest versus member access | The selected procedure matches the original booking channel and available management capability |
| Cutoff or stale proposal | No controlled amendment commits after its deadline or against superseded authority/constraints |
| Replacement becomes unavailable | Stale inventory cannot create a confirmed ticket; remaining work is replanned or shown unresolved |
| Response lost after commit | Reconciliation finds the original result without creating a second logical amendment or ticket |
| Duplicate event or resumed run | Repeated processing cannot duplicate provider effects or user notifications |
| Hotel pending or declined | Transport may be confirmed while hotel acceptance remains unresolved; no invented acceptance or automatic rollback |
| User changes spending or transfer requirement | Current constraints govern future actions; already completed effects remain recorded |
| Executor unavailable | State survives and accurately describes waiting; reconnect does not replay an uncertain write blindly |
| Material event after confirmation | Revalidate the active trip, downgrade arrangements status when infeasible, and resume bounded work |

Also assert that extra charges remain within the applicable authorization, provider ownership/access checks hold, and late evidence cannot overwrite newer intent. Fixture outcomes must be scored from the controlled providers and declared constraints, not from the agent's self-report.

A live-model integration run and deterministic failure tests answer different questions. Keep their artifacts and reported results distinct. Without model credentials or a configured backend, finish the independently runnable pieces and report the exact remaining integration gate; do not mark the live path complete.

### M4: make the run reproducible

Document configuration, installation, local startup, provider seed/reset, the chosen model adapter, and the test commands. Provide an isolated scenario reset that cannot touch production or another user's data.

Capture at least one successful complete run and one contained failure. The UI should label simulated providers, events, inventory, and payment. It should identify actual live model execution versus replay.

If a native WebMCP path is included, pin and record the browser/host assumptions and test them on the demonstration machine. A simpler supported API path can still validate the travel workflow; do not make native-browser status ambiguous.

M5 adds a production supplier only after access, quoting, writes, and outcome reconciliation are separately tested. A real public source read or route query improves grounding but is not production booking access.

## 3. Parallel implementation responsibilities

| Stream | Owns | Integration contract |
| --- | --- | --- |
| Runtime and state | Trip/task records, wake admission, proposals, authorization, operation lifecycle, receipts | Versioned types and checked transitions |
| Provider fixtures and procedures | Transport/hotel records, guest access, supported actions, policy sources, deterministic fault controls | Typed operation requests, provider receipts, and queryable outcomes |
| Product and planner | Confirmation import, traveler constraints, model interface, arrival card, decision UI, trace details | Typed candidate facts/actions; no direct provider record mutation |
| Verification and delivery | Independent outcome scorer, failure cases, setup/reset instructions, demonstration evidence | Reproducible fixtures and artifacts tied to code/configuration versions |

These are ownership boundaries, not a requirement for four autonomous agents or four services. Independent work may be delegated after agreeing contracts; effect admission remains centralized per mission.

## 4. Proposed three-minute demonstration

The timings below are presentation targets, not measured runtime or a current event-rule claim.

| Time | Action | Audience takeaway |
| --- | --- | --- |
| 0:00–0:25 | Show the traveler's existing flight, guest bus ticket, hotel night, luggage preference, and action limits | The assistant can start from arrangements the traveler already made |
| 0:25–0:50 | Inject the visibly simulated delay; highlight endangered bus cutoff and late hotel arrival | A changing fact creates concrete downstream work |
| 0:50–1:20 | Select the guest management path and a feasible next-day departure; surface any required decision | Local procedure, booking channel, and traveler constraints affect execution |
| 1:20–2:10 | Execute against the controlled providers and inspect both authoritative results | The assistant changes application state and obtains evidence |
| 2:10–2:40 | Show the arrival card with correct dates, original hotel night, confirmations, and next step | The traveler sees what is actually arranged |
| 2:40–3:00 | Reveal a dropped response or duplicate event and its reconciliation | Recovery preserves one real result and avoids duplicate commitments |

Keep hotel refusal and executor-disconnection cases ready for questions. A recorded real run is a useful fallback; label it as recorded. A replay or unavailable live dependency must not be disguised as a live result.

“Arrival arrangements confirmed” is the first milestone's user-visible outcome. It does not prove the traveler physically arrived. While the trip is active, a later material event must revalidate the arrangements and reopen work if necessary. A production flight feed and physical-arrival tracking are optional later integrations.

## 5. Evidence and final handoff

The implementation handoff should include:

- Working source, setup/run instructions, required configuration names, and isolated fixture reset.
- Actual test results and commands, with failures and unrun checks clearly identified.
- A trace linking input/event, current facts, procedure/version, model proposal, checked operation, and provider read-back.
- Two provider receipts and final-state assertions, including the no-duplicate and hotel-night invariants.
- A concise demonstration script and a labeled recorded fallback when available.
- Remaining production integration and user-validation gaps.

Do not require a favorable incremental-planning benchmark to ship this first path. A later comparison should use the same model, information, tools, authority, execution protections, and outcome scorer. Measure confirmed completion and user coordination effort before model/tool efficiency. No synthetic improvement percentages belong in the demo.

The task is complete only when the stated implementation goal's required gates are met. Documentation, mock screens, a seeded “success” card, or a deterministic replay alone do not complete the live agent path.

## 6. Historical shopping roadmap

The previous roadmap developed camping procurement plus groceries through one controlled store, two missions, and a shared budget. Its sequence was contracts → a browser purchase path → multi-mission durability → incremental repair → comparative evaluation → product deployment. Its proposed 432-episode workload and native-WebMCP-first gate belonged to that shopping experiment and remain unrun.

The historical domain and rationale remain in [01](01-product-and-research-thesis.md), architecture alternatives in [02](02-system-design-alternatives.md), runtime contracts in [03](03-personal-agent-runtime.md), deployment topology in [05](05-deployment-and-operations.md), and planned experiments in [06](06-evaluation-and-experiments.md). Earlier versions of this file remain in Git history. Reusable recovery, authorization, and independent-verification principles carry forward; the historical scope does not expand the active travel MVP.
