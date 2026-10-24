# Implementation goal: Tokyo arrival companion

Copy the entire block below into an implementation chat opened on this repository. It supplies the requested `/goal` prefix without prescribing a model, token budget, or undocumented command flags. Saving this file does not start implementation.

The [travel system design](../16-travel-agent-system-design.md) is the current implementation authority. The earlier shopping and incremental-planning documents remain background for reusable runtime principles.

```text
/goal Implement and verify the Tokyo arrival companion defined in docs/16-travel-agent-system-design.md. Deliver a working application that imports an existing flight, guest airport-bus booking, and hotel reservation; reacts to a simulated flight delay; selects applicable local procedures; changes the controlled transport booking; obtains and verifies a controlled hotel's late-arrival decision; and accurately displays confirmed, pending, rejected, and unknown outcomes. Continue through implementation and meaningful verification until the acceptance criteria below are satisfied. Do not stop at scaffolding, a plan, a UI mockup, or a happy-path recording.

Read and establish scope

1. Inspect the repository, applicable AGENTS.md instructions, current working-tree changes, README.md, docs/16-travel-agent-system-design.md, and docs/08-delivery-roadmap-and-demo.md. Preserve existing user work. Use docs/15-persistent-agent-runtime-design.md and docs/03-personal-agent-runtime.md for the shared runtime principles that the travel design retains. The current travel design takes precedence over historical shopping scope, two-mission budgeting, browser-only execution, or incremental-graph milestones.
2. Read exa-results/travel-personal-agent-2026-10-22.md and exa-results/notes-local-workflows.md for evidence boundaries and local procedure sources. This research does not grant live supplier access or establish measured product results. Recheck official implementation documentation when selecting current libraries or APIs.
3. Use the canonical scenario, contracts, spending limits, and acceptance cases in the current design. Resolve routine implementation choices yourself and record material decisions. Ask only for information or access that actually prevents a required step; continue independent work while it is unavailable.

Build the smallest complete system

- Use TypeScript, a React frontend (Vite unless the repository already establishes a suitable alternative), and Convex for authoritative agent state and durable coordination. Use one logical agent/controller with bounded runs. Replan the remaining small journey with structured model output and deterministic validation; retain actual commitments and user corrections.
- Implement typed trip facts, original-channel bookings, local procedure versions, task/run/event state, action grants, operations, receipts, and provider observations. Conversation text must not be the sole source of truth. Separate permanent preferences from this trip's luggage and other temporary constraints.
- Import supplied synthetic confirmations into candidate facts and verify them against the controlled providers. Keep service date, destination timezone, readiness interval, deadline, provider identity, original booking channel, and management-access capability explicit. Missing or conflicting required information must produce a precise unresolved state.
- Implement two curated local procedures: guest bus amendment and hotel late-arrival handling. Store provenance, applicability conditions, required capabilities, deadline checks, failure branches, and postconditions. Select procedures according to the actual booking channel and access. Do not implement unrestricted self-learning of procedures for this milestone.
- Build transport and hotel test providers with separate authoritative records and their own operation contracts. They may share development infrastructure, but the agent cannot declare success by editing its own itinerary or directly rewriting both providers in one transaction. Use an adapter boundary, real persisted business mutations, independently readable outcomes, and an isolated reset mechanism.
- Transport must expose the necessary availability/quote, amendment, booking-read, and operation-result functions. Enforce its own deadline, booking revision, capability, price, and operation-identity checks. For every new controlled provider effect, atomically recheck the current admission registry's applicable intent/grant revisions, stop epoch, argument digest, expiry, and cost hold in that provider's commit mutation, as defined in design 16. A pre-dispatch check alone cannot close this race. Repeating the same logical operation and arguments must return its existing result, even after a later cutoff or revocation; changing arguments under that identity must be rejected.
- Hotel must preserve the original booked night and model a late-arrival request separately from acceptance. Support pending, accepted, and declined responses with inspectable evidence. Delivery or submission of a request is not the hotel's agreement.
- Use backend-compatible adapters for the core controlled workflow so the UI can close without becoming the only controller or executor. Show accurate waiting states if the relevant service or executor is unavailable. Any local development process still needs to remain running; do not describe it as an always-available production service.
- Integrate a configurable model provider through a small server-side interface. Make an actual model call in the verified live-model path; record model/configuration metadata and structured decisions without exposing secrets. Use deterministic code for amounts, time windows, authority, revisions, operation identity, and final-state assertions. Offer a clearly labeled deterministic test/replay mode for repeatable mechanics tests.
- WebMCP exposure on our own controlled pages is an optional later milestone. If implemented, verify actual discovery/invocation on the selected browser host and distinguish native support, bridge/polyfill, and API execution. Core completion does not depend on arbitrary third-party sites adopting WebMCP.

Implement the travel behavior correctly

- Use Asia/Tokyo for the fixture's local display and explicit instants for comparisons. Readiness means being at the correct boarding location, including baggage and walking. Treat its seeded range as a fixture assumption. A post-midnight bus uses the next calendar date; the hotel keeps its original accommodation night.
- On delay, refresh the relevant observations and propose a feasible remaining arrangement. Recheck current inventory, prices, user grants, booking versions, and the time needed to finish before committing an amendment. A proposal valid before a user edit or deadline may be invalid when executed.
- Prefer obtaining the hotel's acceptance before the bus amendment when time permits. The providers do not share an atomic commit. If the hotel is pending near the transport deadline, apply only the specific bounded policy authorized in the current design. Otherwise request the necessary decision and keep the truthful partial state. Silence is not approval.
- Preserve completed changes when another provider refuses or the plan is superseded. Any cancellation or compensating change is a new operation with its own conditions and authority. Never invent a rollback.
- Deduplicate incoming events and give business operations stable identities. On a lost response, reconcile the existing operation before considering another write. An old booking snapshot or expired executor lease does not establish non-execution. Unknown outcomes stay unknown until authoritative evidence resolves them. Preserve late receipts and reconcile them even after task cancellation or a user correction.
- The MVP's success state is arrangements_confirmed under the current verified conditions. It does not claim that the traveler physically arrived. Keep actual arrival separate. On an active trip, a later material event must revalidate current arrangements, downgrade the status if necessary, and resume bounded work. A production flight feed and physical-arrival tracking remain optional.

Make the result usable

- Build a clear journey view with imported commitments, the next physical action, confirmed arrangements, pending requests, and the specific decision the user needs to make. Show prices and deadlines where they affect that decision. Keep detailed traces behind a separate inspection view.
- Include isolated scenario controls for reset, delay injection, duplicate event, lost transport response after commit, hotel pending/refusal, and a user constraint change. Make the simulation label visible. Do not let fault injection or reset touch unrelated data.
- Clearly distinguish actual model calls from replay, actual test-provider mutations from live commercial bookings, and synthetic events/inventory/payment from real-world data. Source retrieval must not masquerade as live inventory or supplier integration.
- Use provided or synthetic data only. This goal authorizes local development, local test-provider actions, and verification. Public deployment, real bookings/payments/cancellations, and messages to actual travelers, hotels, or operators are outside this implementation goal.

Verify completion

Create meaningful automated tests and run the complete browser flow. Inspect authoritative provider state independently of the planner's explanation. At minimum, demonstrate:

1. Imported booking identities, original channel, local dates, and personal/trip-scoped constraints are correct.
2. The normal delay scenario completes through a real model call, actual controlled-provider mutations, and read-back evidence. Exactly one valid amended bus ticket exists; its next-day departure is feasible under the declared readiness assumption; the hotel retains the original booked night and has explicitly accepted the applicable arrival window; additional cost is within the grant.
3. Guest versus member access changes which procedure is executable. Missing access produces an accurate access-required state, not fabricated completion.
4. A stale proposal, expired amendment deadline, changed quote/inventory, revoked grant, or concurrent user constraint edit cannot authorize an invalid new controlled effect.
5. Duplicate events and repeated requests do not produce duplicate logical bookings. A deliberately lost response after a successful transport commit is reconciled to the existing result.
6. Hotel pending/refusal and unavailable provider state remain visible. A transport success plus hotel failure never appears as arrangements_confirmed. No completed effect disappears from history.
7. Reload/reconnect preserves the trip, operations, and receipts. Closing the UI does not erase backend work; an unavailable executor produces an honest waiting state. Cancellation prevents subsequent guarded effects while late outcomes still reconcile.
8. An independent scorer verifies final provider state, dates, permitted costs, preserved commitments, and unresolved outcomes. Record actual results, including failures and unrun cases. Do not invent success rates, savings, or superiority over competitors.
9. A new simulated delay after arrangements_confirmed revalidates the active trip and resumes work when its commitments become infeasible. Provider receipts alone never set traveler_arrived.

Run the relevant typecheck, lint, build, automated acceptance tests, and browser end-to-end checks. Fix substantive failures and rerun affected checks. A polished frontend or deterministic replay alone does not satisfy the live-model criterion.

Work autonomously and leave reproducible evidence

- Establish shared types/contracts before parallel edits. Delegate independent work to subagents with clear file ownership when it helps: provider services and fixtures; controller/model/runtime; interface and browser verification. Integrate their work and run the whole flow yourself.
- Keep a concise implementation checkpoint in docs/implementation-progress.md: completed milestones, decisions, exact next steps, verification commands/results, and remaining access requirements. Update it at meaningful boundaries so another agent can resume without reconstructing chat history.
- Document reproducible setup/start/reset/test commands, supported execution modes, and environment variable names in README.md and .env.example. Never commit credentials or put secrets in client code, screenshots, receipts, or logs. Explain how to configure Convex and the selected model provider using supported setup paths.
- Use existing authorized development configuration where available. If credentials, network access, or a required service are missing, finish all independent code, fixture tests, and clearly labeled replay work; identify the exact missing requirement and keep the associated acceptance criterion unverified. Do not silently substitute another backend for Convex or mark the whole goal achieved because infrastructure is unavailable. Resume the remaining verification once access is supplied.
- Leave source code, curated procedure records with provenance, deterministic fixtures, isolated reset/fault controls, automated tests, and concise run artifacts showing the browser flow and provider outcomes. Include a three-minute demo script with live versus simulated boundaries and a short limitations section.

Finish only when the required implementation and acceptance gates are actually satisfied, or report the specific external requirement preventing the remaining work while preserving a usable checkpoint. The final report should state what was built, how to run it, what was tested, actual results, and any unverified boundaries. Do not describe design documents or seeded screenshots as an implemented integration.
```
