# Delivery Roadmap and Demonstration

**Scope:** these milestones develop the original personal-agent candidate. The [expanded portfolio](11-experiment-portfolio.md) and its six product designs define separate minimum experiments and rollout paths; no choice to implement every candidate has been made.

This is a milestone-based product plan, not a 36-hour implementation promise. No milestone below is marked complete by writing these documents. The intended sequence is to establish the core, measure it, and refine the product and presentation. Cal Hacks submission eligibility is a separate constraint: the published event rules do not establish that a prebuilt core is eligible. See [07](07-sponsor-track-strategy.md).

## 1. Scope that makes the thesis testable

The first integrated system contains a personal workspace, one controlled shopping application, two persistent missions sharing a budget, one browser write executor, one model configuration, and an independent evaluation harness.

The first mission prepares a six-person camping trip for at most $300, with Friday delivery, two vegetarian participants, an owned stove, and an already purchased tent. The second mission buys ordinary groceries from the same configured resource pool. The mission limit and the shared pool limit are separate parameters; the fixture must declare whether existing purchases count toward each limit.

One store is sufficient to test state changes, conflicting missions, stale plans, interrupted execution, and recovery. A second store tests portability later. A controlled store makes the correctness boundary inspectable; it does not establish compatibility with arbitrary retail websites.

## 2. Milestones and acceptance gates

| Milestone | Deliverable | Gate before expanding scope |
|---|---|---|
| M0: executable contracts | Typed facts, missions, tool contracts, event records, command states, and fixture specification | Team can explain the authority and version checked at each write; fixture has independent expected outcomes |
| M1: one complete path | User request → actual model call → validated plan → real WebMCP invocation → controlled merchant receipt → verified result | A fresh authenticated session completes the path; trace identifies the real model, browser tool, and committed state |
| M2: persistent personal agent | Scoped facts, two missions, durable controller, resource reservations, grants, cancellation, and reconnect | Concurrent reservations respect admission rules; a lost response does not duplicate a purchase; a late receipt remains visible |
| M3: incremental repair | Captured dependencies, predicate revalidation, local repair, expansion, and global fallback | Sparse changes preserve valid work; query-set and dense-change cases do not leave invalid decisions active |
| M4: credible comparison | Strong R/G/I baselines, independent scorer, frozen manifests, and live-model runs | All systems share protections and budgets; raw traces and failures support the reported aggregate results |
| M5: product and deployment | Accessible workspace, production-like staging, fresh-session onboarding, useful waiting states, sponsor evidence | Another team member can use the deployed system without the author's cookies or manual database fixes |
| M6: extensions | Second merchant, richer personal context, optional solver service or learned routing | Each addition answers a demonstrated limitation and preserves earlier acceptance gates |

M2 and M3 can overlap once M1's contracts are stable. Evaluation harness development starts at M0; it must not be postponed until after the preferred architecture is tuned.

### M0: define the world before optimizing the agent

Specify a finite catalog with prices, stock, delivery windows, dietary attributes, and item compatibility. Separate authoritative merchant data from the agent's observations. Define which changes produce events and which become visible only through a query.

Document hard constraints, soft preferences, commitments, manual locks, and the optimization order. Set rules for a newly lowered budget below existing obligations: show overcommitment, block new inadmissible spending, preserve real purchases, and reconcile uncertain holds. Do not invent a rollback of a completed purchase.

Define the minimum operation contract: a stable logical operation ID, immutable argument digest, source-side checks, an idempotent receipt where supported, and a way to query an uncertain outcome. These definitions make later recovery assertions meaningful.

### M1: make one vertical path real

Use a simple planner initially. It can replan globally while the shared platform is being established. The first meaningful demo is a correct complete outcome, not a large graph visualization.

Pin the browser build and actual WebMCP API used. Prove discovery and invocation in that browser. If a polyfill or custom host is needed, identify it in the manifest and UI used for judging. Put model credentials on the backend. Record an actual provider request and a corresponding tool result.

### M2: establish execution correctness

Add independent mission state, scoped personal facts, reservations, command claims, and durable waits. Exercise a user edit while a model call is pending, a browser disconnect after a write, duplicate command delivery, cancellation before a new commit, and receipt arrival after cancellation.

The primary evidence is authoritative state after each test. A green client notification is insufficient. Preserve operation history so a failure can be reconstructed without relying on a model's explanation.

### M3: earn selective repair

Build reverse dependency lookup and conservative dependency capture. Start with deterministic domain predicates. Treat opaque model choices as depending on all relevant supplied inputs until a narrower contract is justified.

Test insertion into a candidate collection, not just changes to selected items. Test a constraint that connects both missions. If local repair cannot meet constraints or preserve quality, widen the affected scope and allow global replanning. Measure this fallback work; it is part of the algorithm's cost.

### M4: freeze and measure

Tune the baselines and the proposed system on development scenarios. Freeze the held-out protocol and practical success thresholds before reviewing test outcomes. The current plan is 48 held-out scenarios, three trials, and three systems, totaling 432 end-to-end episodes; this is a proposed workload, not completed evidence.

Run the cheaper mechanics suite before paying for all model episodes. Keep deterministic replay and live-model results separate. Publish success, cost, quality, exposure to faults, and uncertainty together. See [06](06-evaluation-and-experiments.md) for the authoritative protocol.

### M5: make the product legible

The main interface should answer: what is the goal, what has happened, what changed, what is still needed, and why is the agent waiting? Put graph details and request traces behind an explanation view. A customer should not need to interpret fencing tokens.

Deploy the shared workspace and merchant fixture over HTTPS. Verify production-origin authentication, browser tool exposure, server configuration, and a fresh user's permissions. Preserve a known demo fixture and a reset operation isolated from other users' data. See [05](05-deployment-and-operations.md).

## 3. Parallel workstreams

These are ownership boundaries, not a requirement for a particular team size. One person can own more than one stream.

| Stream | Owns | Integration contract |
|---|---|---|
| Runtime and data | Convex schema, transactions, events, reservations, commands, receipts | Typed state transitions and authoritative APIs |
| Browser and product | Workspace, controlled store, WebMCP registration, command bridge | Versioned tool schemas, effect semantics, user controls |
| Planning and decisions | Intent extraction, constraints, global and local planning, routing | Validated structured proposals and full cost accounting |
| Evaluation and evidence | Fixtures, fault injection, independent oracle, result aggregation | Frozen scenario manifest, trace schema, reproducible scorer |

Agree on interface changes before editing both sides. Keep scorer logic independent from planner logic: sharing a type definition is useful, sharing the planner's own claim that its answer is correct is not. The evaluator owner should be able to reject a favorable-looking result when the final state is wrong.

## 4. Live demonstration: one story, visible consequences

The [current event page](https://cal-hacks-13-0.devpost.com/) specifies a three-minute pitch and two minutes of questions. The following is a proposed script, not a claim that the application or timings have been tested.

| Time | Action | What the audience should understand |
|---|---|---|
| 0:00–0:25 | Show the camping mission, personal constraints, completed tent purchase, and smaller grocery mission | This is persistent work with shared resources and real commitments |
| 0:25–0:50 | Change attendance from six to four; show an unavailable food item | The world changes after planning; the user does not restart the task |
| 0:50–1:20 | Show quantities and dependent choices being reconsidered while the stove, purchase, and valid choices remain | The runtime knows which work is affected |
| 1:20–1:50 | Apply a user lock while a deliberately delayed old proposal is pending | A stale proposal cannot overwrite current intent |
| 1:50–2:20 | Execute an authorized bounded write and verify the resulting basket/order in the controlled store | The model's suggestion becomes an inspectable application outcome |
| 2:20–3:00 | Show a concise measured comparison and state the limitation of the result | The technical claim has evidence beyond this selected example |

If benchmark runs are incomplete, replace the comparison with clearly labeled acceptance-test results and say the comparative hypothesis is unproven. Never fill the presentation with invented percentages.

Keep the lost-response/reconnect scenario ready for questions. It is a strong correctness demonstration, but forcing every edge case into three minutes can obscure the user benefit. A recorded clip may illustrate a real run; label it as recorded rather than live.

## 5. Evidence the demo should carry

The [past Cal Hacks review](13-past-cal-hacks-projects.md) suggests a useful presentation order: recognizable failure or conflict, changed artifact, correctness evidence, then architecture. Keep runtime graphs available to explain the mechanism after the audience understands the result. This is our interpretation of selected precedents, not a finding about judging causality. Any narrower action set used for the demo must be recorded in its manifest and distinguished from broader benchmark claims.

The presentation build should make the following available without exposing credentials or personal data:

- A manifest with code revision, schema and adapter versions, browser build, model ID, fixture version, and deployment identifiers.
- A trace linking a user change to dependency revalidation, the accepted proposal, actual tool invocation, and final-state verification.
- The declared budget and permission scope used for the action.
- A small comparison chart whose source is the frozen run artifacts, including failures and sample sizes.
- Clear labels for the controlled store, seeded prices, simulated payment, native WebMCP versus an adapter, and live versus replayed model calls.
- Sponsor-specific evidence: actual Convex state transitions, actual Gemini requests if chosen, and any separately verified Visa integration.

A controlled merchant order can demonstrate real application state changes while payment is simulated. Describe those two facts precisely. Do not call a cart estimate money saved or imply a live financial transaction occurred.

## 6. Rehearsal and failure handling

Rehearse from a new browser session and a reset fixture. Test the deployed origin and the intended network conditions. Keep a locally stored recording of a complete successful run, as requested by the event, and disclose when it is used.

If the model provider is unavailable, show the recorded run or an explicitly labeled deterministic replay. If the browser disconnects, show the durable waiting state and reconnect. If a write is uncertain, demonstrate reconciliation instead of manually marking it successful. A legitimate failure that is clearly contained is more defensible than a fabricated success.

Do not reset a real account, release an unknown financial hold, or force a receipt into existence to rescue a live presentation. Demo reset applies only to the isolated fixture and must itself leave a clear boundary in the evidence.

## 7. Decisions that stop or narrow expansion

- If global replanning is equally successful and cheaper, ship it and narrow the incremental claim to any demonstrated operating range.
- If dependency capture remains unsound, use conservative invalidation rather than displaying unsupported precision.
- If model-assisted routing adds cost without benefit, keep deterministic routing and use the model where it improves interpretation or planning.
- If real merchant contracts cannot support the required reconciliation, keep that adapter read-only or preparation-only and disclose the boundary.
- If a sponsor's requirements do not fit the implementation, omit that track rather than redesigning the product around an unverified prize assumption.
- If pre-event implementation is disallowed, maintain a truthful separation between the independent product effort and any eligible event submission.

The next concrete deliverable after this documentation package is M0's executable contract and fixture specification, followed by M1's real vertical path. No app code or deployment is implied by this roadmap.
