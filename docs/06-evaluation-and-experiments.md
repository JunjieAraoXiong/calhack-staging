# Evaluation and Experiments

**Scope:** this protocol evaluates the original personal-agent runtime. The [expanded portfolio](11-experiment-portfolio.md) reuses its fairness principles but defines separate domain fixtures, baselines, metrics, and run counts for each product.

Status: proposed protocol, 2026-10-17. No product implementation, benchmark execution, or measured improvement is established by this document. Every run count below is planned, and every performance hypothesis remains untested.

Related: [runtime](03-personal-agent-runtime.md), [decision layer](04-model-and-decision-layer.md), [operations](05-deployment-and-operations.md), [delivery milestones](08-delivery-roadmap-and-demo.md), and [evidence register](10-sources-and-evidence.md). Design inputs: [runtime evaluation research](../research/TECHNICAL_RUNTIME_EVAL_ZH.md) and [personal-agent system research](../research/PERSONAL_AGENT_SYSTEM_ZH.md).

## 1. Research question and claims we can earn

Under identical model, information, tools, authorization, and execution budgets, does explicit dependency revalidation reduce recovery work when application state changes, while preserving task quality and legal execution?

The candidate contribution is an evaluated execution strategy for changing personal tasks. Dependency graphs, incremental computation, optimistic concurrency, and durable workflows are established techniques; a DAG visualization is not evidence of novelty. [Adapton](https://matthewhammer.org/adapton/adapton-pldi2014.pdf) provides relevant incremental-computation precedent.

| Hypothesis | Evidence required | Failure or narrowing condition |
|---|---|---|
| H1: sparse changes benefit from selective repair | Lower total recovery cost at comparable success and solution quality | Savings disappear against a cached, warm-start global planner, or are offset by graph maintenance |
| H2: dense changes remain manageable | Correct expansion to global repair; measured overhead and quality loss | Local repair repeatedly stalls, misses coupled constraints, or conceals worse solutions |
| H3: personal context is applied selectively | Correct subject, scope, time, and commitment handling on held-out cases | Corrections contaminate other missions or inferred preferences become hard facts or grants |
| H4: execution remains accountable during disruption | Independent evidence of correct receipts, reservations, cancellation, and reconciliation | A committed forbidden effect, duplicate logical purchase, or lost successful receipt occurs |
| H5: model-assisted routing adds value | Better decision outcomes or lower total work than deterministic routing | Added model calls cost more without reducing unnecessary repair, questions, or failures |

Before freezing tests, record the minimum practically useful savings and acceptable quality degradation, including a success-rate comparison margin if one is used. These are product thresholds, not measured results. Do not choose them after inspecting test outcomes.

If the incremental strategy only beats ReAct, describe the result as a benefit of structured execution over that baseline. If a simple rule system solves the workload more cheaply, retain the rule system. If gains occur only at larger graph sizes, state that operating range. A small test set cannot establish universal superiority or strict non-inferiority.

## 2. Separate the experimental layers

**Mechanics suite:** feed every strategy the same structured facts, constraints, and changes. Exercise dependency invalidation, resource accounting, proposal publication, command execution, and reconciliation without natural-language interpretation. This isolates runtime behavior from extraction mistakes.

**End-to-end suite:** provide user language, scoped personal context, application observations, and events. The agent must interpret the request, produce a plan, handle changes, and leave an independently verifiable state. Attribute failures to interpretation, planning, routing, invalidation, execution, or verification rather than presenting one opaque score.

**Browser integration suite:** verify that actual WebMCP discovery and invocation, user edits, disconnects, and reconnects work in the intended browser. Headless simulation results alone cannot establish this. Business changes must use an application event channel: WebMCP `toolchange` describes changes to available tools, not inventory or cart changes. [Official imperative API](https://developer.chrome.com/docs/ai/webmcp/imperative-api).

The first environment is one controlled store, one personal workspace, and two missions sharing a budget. A second store is a later generalization test, not a prerequisite for measuring the first system. These are controlled applications, not evidence of arbitrary merchant support.

## 3. Strong comparison systems

| System | Required implementation |
|---|---|
| R: strong ReAct with replanning | Same model and relevant context; fresh observations or deltas; action history and receipts; retries, clarification, and plan revision; tuned on development cases |
| G: global replanning | Same structured planner and objective as I; re-solve the remaining task after material changes; allow warm starts, cached reads, parallel independent work, and completed-action preservation |
| I: incremental revalidation and repair | Same planner and execution abilities; add observed dependencies, condition revalidation, bounded local repair, scope expansion, and global fallback |

Add a deterministic rule/solver reference in the mechanics suite. It tests whether the modeled task requires language reasoning at all; it is not an artificially weak fourth chatbot.

All three primary systems must share:

- The exact model/version, reasoning configuration, context limits, sampling settings, and tool-response representation.
- Initial world state, factual evidence, public tool contracts, event visibility, authorization, and user-response policy.
- The same Convex transaction guards, budget reservations, operation IDs, idempotency behavior, authoritative receipts, and tenant isolation.
- The same capabilities to read current state, receive business events, retry safely, and execute independent work concurrently.
- A common objective: satisfy hard constraints first; minimize unnecessary changes to existing valid choices next; then optimize declared cost and preference terms. Authorized commitments are hard boundaries unless explicitly revised.
- Matched token, time, and tool budgets, including interpretation, routing, planning, repair, verification, failed calls, retries, and graph maintenance.

Do not erase G's history or deny it warm starts. Do not deprive R of lock information, version errors, or reconciliation tools. Share public effect contracts; keep evaluator truth, future events, and oracle solutions private. Runtime-derived slices are I's computed output, not a free oracle input.

Convex safety guards protect every strategy. Report rejected invalid *attempts* separately from committed invalid *effects*: otherwise common backend safety will be miscredited to the incremental algorithm. Atomic read-check-write behavior is infrastructure, not a planning score. [Convex transaction model](https://docs.convex.dev/database/advanced/occ).

## 4. Dataset, freezing, and planned run count

Use **12 development scenarios** for implementation, prompt tuning, baseline tuning, and harness debugging. Then freeze **48 held-out scenarios**, **3 trials per scenario**, and **3 primary systems**: `48 × 3 × 3 = 432 planned end-to-end episodes`. None has been run. Development, mechanics, browser, budget-curve, and ablation runs are additional and must be budgeted separately.

Allocate eight held-out scenarios to each primary stratum:

| Primary stratum | Required variations |
|---|---|
| No change | Small and larger graphs, trivial and meaningful personal preferences; measure overhead |
| Sparse or irrelevant change | Unrelated facts, one item, one event exception, metadata-only updates |
| Dense or globally coupled change | Headcount, shared deadline, major budget reduction, feasible and infeasible cases |
| Shared resources | Two missions, concurrent reservations, price changes, shared ingredients or stock |
| Publication and commit races | Stale model result, user edit after approval, revoked grant, expired command claim |
| Uncertain execution and recovery | Lost response, late receipt, disconnect, cancellation races; failed compensation only when that extension exists |

Cross-tag cases with personalization, dependency topology, graph size, feasible/infeasible status, and event timing. Include trees, shared consumers, high fan-out, and query-set dependencies. Dense and no-change cases are mandatory, even if they show negative results.

Hold out some combinations of topology, constraints, and events—not merely different names or seeds. Keep fixture-generation code, oracle assertions, scenario IDs, and event schedules inaccessible to agents. A separate evaluator owner should review hidden cases and freeze their hashes before planner tuning ends.

The frozen manifest must identify code commits, prompts, models, tool schemas, adapter versions, environment data, budgets, trial seeds where supported, and scoring rules. Model-provider determinism is not guaranteed by a seed; record actual request metadata.

If budget forces a reduction, change scenario or trial counts for all systems before viewing test outcomes, document the reason, and recompute the planned total. Once test results inform a change, that set becomes development evidence; use a fresh holdout for a new confirmatory claim.

There is no assumed 36-hour total development cap. Advance when implementation and evaluation gates are met. Competition restrictions on pre-event work remain a separate eligibility question, covered in [sponsor strategy](07-sponsor-track-strategy.md).

## 5. Fault injection at semantic checkpoints

For controlled comparisons, inject changes at shared semantic barriers: after a valid initial plan, immediately before the first conditional write, after one purchase is authoritatively committed, or after commit but before its response reaches the executor. Do not inject at each system's Nth tool call or a fixed elapsed second; strategies take different paths and speeds.

Record whether each intended barrier was reached, which fault actually fired, and whether the agent observed its consequences. Preserve runs that never reach a barrier. Their lack of exposure is neither successful recovery nor an excuse to exclude them from overall task results.

Faults should come from the harness, not planner-visible hints. Never expose future fault schedules, expected repair nodes, or the correct action sequence. Use isolated world state for each episode and reset both application data and browser state.

Use a fixed user-response policy for clarification and approval, including response timing and refusal conditions. A system must not get a more cooperative simulated user because it asks more questions. Keep these harness answers outside the planner's context until the corresponding interaction occurs.

Run continuous wall-clock changes as a separate stress suite. It answers a different question about sustained load, coalescing, and convergence. Report injection frequency and exposure; do not mix its scores into the controlled checkpoint comparison.

## 6. Concrete cases and executable assertions

| Case | Injection or request | Independent assertions |
|---|---|---|
| Guest preference contamination | Prior four-person vegetarian dinner was for guests; personal weekday mission starts | Personal headcount remains one; guest restrictions apply only to the guest event; no inferred grant appears |
| Temporary preference expires | “Skip lunch this week” expires before next week's mission | Next-week lunch is permitted; the source interval is respected; unrelated tasks do not become invalid solely from a global revision |
| Event exception survives correction | Correct household size to one; Friday party remains four | Ordinary portions update; Friday remains four; completed purchases remain in the ledger |
| Shared ingredient | Two recipes use the same rice; remove one recipe | Net required rice is recomputed once, accounting for pantry stock and package sizes; no double subtraction |
| Query-set change | A cheaper eligible item enters a previously queried category | Re-evaluate if lowest eligible price is part of the objective; do not claim invalidity merely because a still-feasible choice has a new alternative |
| Two missions, one budget | In a synthetic fixture, a 100-unit pool receives requests for 70 and 60 | Both reservations cannot succeed together; `spent + active reservations <= limit`; rejected mission can revise without stealing the other hold |
| Budget lowered below obligations | User lowers the pool limit below confirmed spending plus existing reservations, including an unknown-operation hold | Pool becomes explicitly overcommitted; available funds may be negative; no new reservation or increase is admitted; spending and unknown holds remain recorded; report the revised objective infeasible until lawful release or settlement restores feasibility |
| Price rises after reservation | Reserved item price increases before execution | Additional amount is reserved atomically or the action is blocked; no duplicate full reservation; grant cap remains enforced |
| Unrelated user edit | Change a fact unused by either mission | Final plan remains legal; no mandatory repair or approval is caused by unrelated revision alone; any extra work is counted |
| Stale proposal | User edits cart or lock state after a proposal was prepared | Old proposal cannot overwrite newer affected state; rejection triggers bounded fresh evaluation |
| Lost successful response | Store commits a purchase, transport drops reply | Operation becomes unknown until reconciled; original receipt resolves it; exactly one logical purchase and one spend entry exist |
| Late success after supersession | Old plan commits before replacement, receipt arrives afterward | Purchase and spend are recorded; superseded descendants are not dispatched; new plan accounts for the purchased item |
| Cancellation race | Cancel mission before or after merchant acceptance | Unstarted writes are blocked after revocation; already accepted effects remain recorded; cancellation is not reported as a refund |
| Failed cancellation/compensation (extension-only) | If an implemented adapter offers cancellation or refund, force that operation to fail | Original effect persists; unresolved or irreversible status is shown; budget is not silently restored |
| Disconnect with unknown write | Executor disappears after dispatch; lease expires | Lease expiry is not treated as proof of failure; reconciliation precedes unsafe retry; stable operation ID is preserved |
| Infeasible change | New deadline or budget conflicts with locked commitments | No illegal workaround is committed; an actual conflicting constraint is identified; unaffected legal state remains intact |

These are expected assertions, not achieved outcomes. Test cancellation both before dispatch and after real acceptance; cancellation cannot erase history. An unknown operation must continue occupying its reservation until evidence supports settlement or release.

Mission cancellation is part of the core runtime; merchant cancellation, refunds, and compensation are not required first-version integrations. Run their failure case only after the relevant tool contract exists, and apply the same extension to all comparison systems.

## 7. Independent evaluator and oracles

Build the evaluator before optimizing the planner. Its inputs are the immutable fixture specification, canonical final application state, authoritative operation ledger, and harness event log. It must not trust agent completion messages, successful HTTP responses, graph validity labels, or model explanations.

Minimum evaluator responsibilities:

1. Check quantities, coverage, compatibility, deadlines, money in integer minor units, personal scope, and approved exceptions against the fixture's rules.
2. Check each committed effect against the grant, proposal, resource state, and cancellation boundary applicable at its acceptance time.
3. Reconcile reservations, receipts, purchases, and spending; detect duplicate logical effects and orphaned or incorrectly released holds.
4. Verify final task claims: completed, blocked, infeasible, cancelled, and unknown must match evidence. A correct unresolved report is not full completion.
5. Compute declared objective terms and unnecessary changes without reading the candidate's dependency graph.

For small catalogs, write a separate exhaustive enumerator to establish feasibility and the best objective vector, including required commitments. Use hand-checked fixtures and deliberately corrupt ledgers to verify that the evaluator fails correctly. Do not import the planner's constraint-checking implementation as the sole oracle.

For larger instances, report independently checked feasibility and a proven lower/upper bound when available. Label a reference solver's unproven incumbent as a reference solution, not “the optimum.” If several solutions are equally valid, compare objective values and invariants rather than exact action strings.

This borrows the idea of checking final database state from [τ-bench](https://arxiv.org/abs/2406.12045), but our dynamic WebMCP tasks are a custom environment. Results are not official τ-bench scores.

## 8. Required trace schema

Write append-only JSONL events, plus canonical state snapshots at the start, injection barriers, settlement, and end. A minimum event envelope is:

```json
{"schemaVersion":1,"experimentId":"...","scenarioId":"...","familyId":"...","trialId":"...","strategy":"I","runId":"...","sequence":1,"timestamp":"...","eventType":"...","missionId":"...","attemptId":"...","nodeId":"...","nodeRevision":1,"operationId":"...","parentEventId":"...","payload":{}}
```

Payloads must capture, when applicable: model request/response hashes and usage; observation versions; read/query/constraint dependencies; candidate and published patches; condition checks; selected routing action; tool origin/schema digest; tool arguments/results; grant/proposal references; claim fence and stop epoch; reservations; receipt evidence; injected faults; and measured durations.

Record both execution state and plan validity: a node can be `succeeded` and `superseded`. Preserve late receipts and failed attempts. Associate model usage with every call, including routing and retries. Store sensitive raw context separately with controlled access; synthetic benchmark fixtures should contain no real user secrets.

The scorer emits machine-readable assertion IDs, pass/fail/unknown, evidence-event references, terminal classification, metric values, and evaluator version. Unknown or missing evidence must not default to pass.

## 9. Metrics and comparisons

Primary: **legal task completion within a fixed resource budget** on feasible cases. Separately report correct infeasibility handling, unresolved execution, and cancellation handling. Publish raw numerators and denominators for every stratum.

Safety: committed invalid effects, duplicate logical effects, overspending, lost receipts, and authorization breaches. Also report invalid attempts rejected by common guards; they measure planning behavior, not a successful safety bypass.

Distinguish **admission violations** from **overcommitment caused by a later user limit reduction**. Check new reservations and exposure increases against the cap applicable at admission, and check purchase authority at actual commit; do not retroactively label previously authorized spending an invalid commit. Reservation-to-spend settlement is not a fresh reservation for the same full amount. Separately measure whether the runtime detects the reduced-cap conflict, blocks new reservations/increases, preserves unknown holds, and reports infeasibility. The fixed-cap 100/70/60 fixture retains its strict invariant.

Efficiency: total input/output tokens, model calls, tool reads/writes, retries, deterministic CPU time, graph-maintenance time, wall-clock time, and reconciliation work. Record provider-reported usage and pricing date for monetary estimates. Include failures and timeouts in cost totals.

Recovery: time from injected event to verified legal stable state; record repair-scope expansions, global fallbacks, and valid nodes reused. A run that never recovers is censored at its budget or classified as failed, not assigned zero recovery time. Report tail latency only with sample-size limitations.

Quality: hard-constraint violations, objective vector, gap to a proven optimum where available, unnecessary changes, and unnecessary clarification/approval requests. Do not reward changing fewer nodes when required changes were missed.

Publish three principal curves: completion versus token/time budget; recovery cost versus affected dependency fraction; and objective quality versus total cost. Show no-change overhead and dense-change results. Planned budget levels must be frozen in advance; extra model runs for these curves are not included in the 432-episode primary total.

Define the affected fraction using fixture-defined reference decision units and independent change labels, not I's own invalidated-node count. Otherwise an incomplete dependency graph could manufacture an apparently favorable workload axis. Count committed transient violations even if later compensation restores a legal final state.

Report all-run cost and paired comparisons where both systems succeed separately. A success-only cost chart can select easy cases and hide failures. Never compare I's successful runs with all baseline runs without identifying the mismatch.

## 10. Pairing, uncertainty, and selection bias

Pair comparisons by scenario and trial setup; randomize or interleave strategy execution order to reduce provider-load and cache-order effects. Prefer paired absolute differences for success and paired differences or log ratios for positive costs; define treatment of zeros and timeouts in advance.

Three trials of one scenario are not three independent tasks. Aggregate or cluster by scenario when estimating uncertainty. If scenarios share a generation template, disclose that dependence and use family-level clustering or a sensitivity analysis; resampling 144 trials as independent observations would overstate precision.

Provide paired confidence intervals, for example by a preregistered cluster bootstrap over the independent scenario/family units with all strategy/trial observations retained together. With few families, report descriptive paired results and wide uncertainty rather than a spurious significance claim. Do not equate a non-significant difference with demonstrated equivalence.

Freeze primary hypotheses and metrics; label exploratory analyses. Keep failures, barrier misses, and negative strata. Report actual fault exposure alongside outcome rates: avoiding a failing call through valid caching is useful, but is not evidence of recovery *after* that fault.

## 11. Ablations, including the decision module

Run each ablation against an otherwise identical implementation, initially on development/mechanics cases. Confirmatory ablations require a separately budgeted frozen run plan.

| Ablation | Question isolated |
|---|---|
| Remove selective slicing, retain planner/cache/guards | Does dependency selection add value beyond structured replanning? |
| Remove condition revalidation, invalidate on relevant version changes | Does semantic revalidation save work beyond version-based invalidation? |
| Replace fine dependencies with conservative category dependencies | Is precision worth maintenance and correctness complexity? |
| Remove query-set dependency tracking in an isolated test build | Does the hidden-query test detect missed invalidation? |
| Disable commit guard or idempotency in an isolated test build | Does the fault harness detect forbidden or duplicate effects? This is harness validation, not a deployable system |
| Global warm start with equivalent caching | Are claimed gains ordinary caching benefits? |

For the decision layer compare D0, deterministic event routing plus the existing planner, with D1, model-assisted semantic routing using the same model. The module may select `continue`, `query`, `repair`, `replan`, `ask`, `wait`, or `stop`; it never overrides guards. Independent weights or training are not required for this comparison.

D1 receives the goal, current state/delta, plan status, dependency evidence, commitments, remaining resources, uncertainty, and available actions. It returns an action, target scope, reason, and required conditions. Do not reveal future faults or evaluator-preferred routes. Count its additional model calls and latency.

Evaluate routing by downstream completion, total cost, avoidable clarification, missed necessary repair, scope expansion, and time to resolution. Some states admit several reasonable actions; judge an allowed action set or eventual outcome, not exact agreement with one hand-written route. Add a separate model only after repeatable evidence of benefit.

## 12. External ToolMaze evaluation

Prior read-only inspection found Source/Processor/Action tool categories, call-time output perturbations, sequential tool execution, and sampled booking tools returning simulated results. It did not establish resource-level read/write sets, versioned commits, concurrent writes, or durable purchase effects. Pin and recheck the exact revision before running. [ToolMaze paper](https://arxiv.org/abs/2606.05806), [public executor](https://github.com/Zhudongsheng75/ToolMaze/blob/main/evaluation/core/sandbox.py).

Use unmodified tasks, tools, perturbations, and scoring with an agent adapter to obtain a separately labeled external tool-failure result. Adding persistent state, concurrency, receipts, or new scoring creates a **custom ToolMaze-derived extension**, not an official benchmark result and not directly comparable with its original leaderboard.

Never expose `valid_paths`, hidden dependency truth, expected answers, or predetermined fault locations to an agent. Record fault hit rates because caching can avoid an injection point. ToolMaze performance cannot validate duplicate-purchase prevention or cancellation safety in our transactional environment. No ToolMaze installation or execution is claimed here.

## 13. Results artifacts and release gate

For each experiment, create an immutable manifest, scenario hashes, raw JSONL traces, state snapshots, evaluator outputs, aggregate tables, plots, and a failure-analysis note. Suggested future layout: `experiments/<id>/{manifest.json,traces/,snapshots/,scores/,summary.csv,report.md}`. These paths describe planned artifacts; this document does not create them.

Run order: validate the independent evaluator with corrupted fixtures; validate mechanics and common guards; tune all baselines on development cases; freeze protocol and versions; run the holdout; score without manual exclusions; inspect failures; publish paired results and exact limitations. Preserve an original report when later fixes create a new experiment.

Keep expected assertions separate from observed outcomes. Until runs exist, result tables must say **Not run**, not contain illustrative percentages. A demo may show a selected live scenario, but the report must disclose its selection and link to complete results. Results from simulation and actual browser execution must remain distinguishable.

Release only the claims supported by these artifacts. Fix committed safety failures before product deployment; narrow performance claims when overhead or global coupling eliminates gains. More development time should improve the evaluator, baselines, and recovery evidence—not remove inconvenient tests.
