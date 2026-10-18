# Personal Agent Runtime

## Scope

This document specifies the recommended runtime. It describes intended contracts, not an implemented or formally proven system. The initial domain is purchasing through a controlled, participating web application. Generalization requires additional adapters and tests.

The runtime has four responsibilities: maintain the user's applicable context; determine which decisions remain valid; coordinate authorized execution; and reconcile actual outcomes. Model behavior is specified separately in [04](04-model-and-decision-layer.md).

## Authority and module boundaries

| Module | Owns | Must not assume |
|---|---|---|
| Personal context resolver | Applicable facts, preferences, exceptions, provenance | That a recent observation is a permanent user preference |
| Mission controller | Event processing, planning attempts, progress, waiting states | That the newest model response reflects the newest world state |
| Planner and decision policy | Candidate plans or next actions | Authority to bypass constraints or rewrite completed operations |
| Dependency engine | Read witnesses, reverse dependency index, revalidation | That JSON Schema describes all business effects |
| Resource coordinator | Reservations, spending, capacity shared by missions | That each mission owns the user's entire budget |
| Command coordinator | Dispatch, ownership, retries, reconciliation | That lease expiry proves non-execution |
| Browser executor | Discovery and invocation of accessible WebMCP tools | That a tool name is globally unique or that a closed page can execute |
| Outcome verifier | Fresh observations and postcondition checks | That a successful HTTP/tool response proves the user goal is satisfied |

Convex is the authoritative application store. The browser is a client and execution location, not a second independent source of mission truth. External merchant state remains authoritative for external purchases.

## Personal state

### Record categories

Keep explicit facts, inferred preferences, task requirements, external observations, commitments, and grants distinct. They can share indexing conventions, but they are not interchangeable.

| Field | Purpose |
|---|---|
| `ownerId` | Account allowed to manage this record |
| `subjectId` | Person or entity the assertion is about |
| `kind` | Explicit fact, inferred preference, or external observation |
| `scope` | Personal, household, mission, or event |
| `key`, `value` | Typed assertion |
| `sourceRef`, `assertedBy` | User input, external system observation, or inference evidence |
| `validFrom`, `validUntil` | Temporal applicability |
| `status` | Active, disputed, superseded, or expired |
| `revision` | Application-managed version of this assertion |

Inferred preferences additionally reference their evidence. External observations include observation time and, where available, a source version. Model confidence is metadata, not a permission or truth guarantee.

### Resolution order

1. Select the relevant subject, scope, and time interval.
2. Apply explicit task exceptions only where they are applicable.
3. Prefer explicit corrections to superseded assertions and inferences.
4. Preserve compatible assertions at different scopes.
5. If equally applicable explicit assertions conflict without a clear correction, mark a dispute and block only dependent decisions.

“I live alone” and “Friday dinner has four guests” are compatible. A purchase for a friend must not update the owner's dietary identity. Removing an inferred preference does not establish its opposite.

The resolver emits values together with the records used to derive them. Decisions depend on these resolved fields. A provenance-only change can refresh evidence without requiring a new product choice if the applicable value and constraints are unchanged.

## Missions and plans

A mission contains an objective, hard constraints, soft preferences, fixed user choices, authorization references, shared resource references, and progress. Conversation messages are inputs and explanations; they are not the entire mission state.

Recommended mission states are `draft`, `active`, `waiting_for_user`, `waiting_for_executor`, `reconciling`, `completed`, `cancelled`, and `failed`. Record the waiting or failure reason explicitly. A blocked branch need not prevent independent authorized preparation elsewhere in the mission.

Each planning attempt receives a consistent context snapshot and an identifier. Its result is a candidate patch, not a direct database update.

### Decision representation

```ts
// Interface sketch, not product implementation.
type Decision = {
  missionId: string;
  nodeId: string;
  nodeRevision: number;
  operator: string;
  args: Record<string, unknown>;
  dependsOn: string[];
  readRefs: ReadWitness[];
  queryRefs: QueryWitness[];
  constraintRefs: string[];
  outputRef?: string;
  validity: "pending_check" | "valid" | "invalid" | "superseded";
};
```

Arguments may contain validated references to previous results. Operators belong to a finite domain registry; arbitrary generated JavaScript is not the plan format.

Structural validation checks operator existence, types, ownership, references, cycles, and bounded plan size. Domain validation checks quantities, units, budget, time, compatibility, fixed choices, and permitted effects.

## Tool contracts

A tool is identified by origin, name, schema digest, and adapter contract version. A browser-side handle is reconstructed through current discovery; do not persist a JavaScript `Window` or assume an old tool handle survives navigation.

A participating adapter supplies:

- Inputs and outputs, including units and structured error codes.
- Resources read and written, or a conservative procedure for recording them.
- Preconditions and observable postconditions.
- Query collection dependencies and freshness information.
- Whether a request is read-only, reversible, or externally consequential.
- Idempotency and outcome-query semantics.
- What authorization and source-side conditional checks are enforceable.

WebMCP tool annotations and schemas are useful metadata, but they do not constitute a proof that the declared effect is accurate. The runtime's guarantees apply to tested adapter contracts. Current discovery, origin gating, execution, and cancellation interfaces are documented by [Chrome](https://developer.chrome.com/docs/ai/webmcp/imperative-api).

## Dependency validity and repair

### Where dependencies come from

Record reads performed by trusted adapters and references evaluated by domain expressions. Conservatively include all relevant inputs supplied to an unconstrained model choice. A model-generated list of its own dependencies is insufficient for sound invalidation.

Dependencies include concrete entities and query collections. A choice described as cheapest among eligible products can become outdated when a new eligible product appears, even if the selected product is unchanged. Track that collection or invalidate conservatively at a category level.

Distinguish hard feasibility from preference or optimality freshness. A newly cheaper product does not automatically authorize replacing an existing choice, especially when the objective prioritizes preserving valid commitments.

### Repair procedure

1. Persist an input/resource event with the authoritative state mutation.
2. Find potentially affected decisions using reverse dependency keys.
3. Re-resolve applicable context and recheck predicates.
4. Preserve decisions whose relevant conditions and outputs still hold.
5. Invalidate affected outputs and their downstream consumers.
6. Fix unaffected decisions as boundary conditions and solve the affected subproblem.
7. If shared constraints cannot be satisfied, expand the repair set to connected variables; fall back to full replanning when necessary.
8. Validate the patch against current state before publication.
9. Dispatch only currently valid, authorized, resource-backed actions.

The optimization order must be shared with the baselines: satisfy hard constraints and explicit locks, preserve commitments, minimize changes where specified, then optimize cost or preference. Local feasibility does not establish global optimality. Record any solution-quality gap.

### Version domains

| Version | Meaning |
|---|---|
| Fact/resource revision | A particular input or collection changed |
| `planningAttemptId` | Which model/solver attempt may publish for this mission |
| `nodeRevision` | Which version of an individual decision is current |
| `stopEpoch` | Mission-wide cancellation or equivalent invalidation of future execution |
| `fenceToken` | Which command claimant may submit a new effect |
| Event sequence | Consumer progress through a log; not a global plan-validity test |

Do not use one user-global revision to invalidate every mission. An old planning result is admitted only if its attempt and relevant witnesses remain acceptable. Replacing one node must not automatically discard unrelated valid work.

## Event processing and durable coordination

Persist explicit business events for user requests, context changes, resource changes, toolset changes, command outcomes, executor availability, and authority changes. Query subscriptions notify clients about current state; they are not the business event log.

Each consumer keeps a cursor and processes events idempotently. Coalesce repeated state updates where safe, but do not discard distinct authorization changes, cancellation requests, or completed-operation receipts. Internal UI/progress writes must not recursively trigger semantic replanning.

A mission controller advances bounded work per invocation, then waits or schedules another invocation. Maintain at most one accepted planning attempt per mission initially. Different missions may plan in parallel; resource admission remains transactional.

State changes and scheduling from a Convex mutation can commit together. This closes the gap between persisting a change and arranging its processing. However, the application still owns error recovery and the correctness of the scheduled work. See [scheduled functions](https://docs.convex.dev/scheduling/scheduled-functions).

Use Workflow for durable steps and waits. On a new world event, explicitly perform a new state read; replaying a previously completed query step can reuse its historical result. Large artifacts should be referenced by IDs rather than repeatedly passed through workflow state. See [Convex workflows](https://docs.convex.dev/agents/workflows).

## Commands, receipts, and execution races

### Separate effect status from plan validity

Command execution state is `queued → claimed → executing → succeeded | failed | unknown`. Plan validity is a separate dimension. An operation can be **succeeded and superseded**.

This is necessary when an old plan's purchase succeeds while a new user instruction is arriving. Record the actual purchase and spending, then repair the current mission. Never drop a late receipt merely because its node is no longer current.

### Command identity

Persist `operationId`, mission/node identity, node revision, stop epoch, tool identity, argument digest, status, claim owner, claim expiry, fencing token, and workflow event identity. Reuse `operationId` for retries of the same logical effect. A genuinely different purchase gets a new identity.

Claiming prevents normal duplicate dispatch. It does not prove at-most-once business execution. If an executing write loses its executor, classify it as unknown and query the outcome before retrying. Reads can have a less restrictive retry policy.

### Controlled-merchant commit

Within one authoritative mutation:

1. Authenticate the caller and check access to the operation.
2. Look for an existing receipt for the same operation and matching argument digest; if present, return the actual result.
3. For a new effect, check current node revision, stop epoch, fence, grant, resource reservation, and domain preconditions.
4. Apply the inventory/order changes and resource accounting.
5. Persist the operation receipt atomically with the business effect.

Checking for an existing completed operation is essential: cancellation after a completed purchase cannot make the historical purchase disappear. Cancellation accepted before a new authoritative commit prevents that commit under the controlled contract.

When a receipt reaches the coordinator, persist it and notify the waiting workflow consistently. Convex supports committing top-level and called component mutation writes together; do not swallow a component failure and then pretend the notification committed. See [component transactions](https://docs.convex.dev/components/using#transactions).

### External merchants

Convex cannot make its local receipt write atomic with an arbitrary external merchant. External guarantees depend on that merchant's idempotency, conditional-commit, and outcome-query interfaces. A local timeout or an aborted browser request does not prove that the external action failed.

Unknown outcomes retain their resource reservation until reconciled. Automatic compensation is a separate authorized action, not a deletion of history. Unsupported external writes must be identified as outside the demonstrated guarantee.

## Shared resources and authorization

For a budget pool:

`available = limit - confirmed_spend - active_reservations`

Two missions requesting the same funds must use one transactional admission procedure. A revised quote adjusts the reservation by its delta rather than reserving the entire amount twice. A successful operation converts reserved funds to spending; a confirmed non-execution releases the reservation. Unknown writes do neither until reconciled.

A user can lower a budget below existing spending or reservations. Preserve that new requested limit and mark the pool `overcommitted`; available capacity may then be negative. Reject new reservations and reservation increases until capacity becomes sufficient, preserve confirmed spending and unknown-operation holds, and report the revised objective as infeasible where appropriate. Do not erase history or silently release uncertain obligations to satisfy the new limit. A purchase validly admitted before the reduction is not retroactively an invalid commit. A subsequent confirmed non-execution may release a hold; settlement of a prior successful purchase converts its hold to spending without inventing new capacity.

Reservation expiry requires care: expiry may release an unused preparation, but must not silently release funds backing a potentially executed unknown write.

Grants identify the principal, mission/resource scope, allowed effects, optional approved proposal digest, amount limits, validity interval, and revocation status. Having enough funds is not authorization. Having authorization is not proof that funds remain available.

Derive account identity through authenticated server context and check ownership on every exposed read/write path. Scheduled/internal work receives a validated principal reference and rechecks current authority at commit. Website content is observation data, not an instruction that can grant authority. See [Convex authentication in functions](https://docs.convex.dev/auth/functions-auth).

## Storage and interfaces

| Data group | Required access patterns |
|---|---|
| Facts | Owner + scope + key; applicable time; provenance |
| Missions | Owner + status; current planning attempt; progress cursor |
| Decisions/dependencies | Mission + node; reverse dependency key |
| Commands | Executor scope + status; operation identity |
| Receipts | Operation identity; immutable result reference |
| Events | Mission/stream + sequence; related entity/operation |
| Budget pools/reservations | Pool + active status; operation/mission |
| Grants | Principal + scope; expiration/revocation |
| Domain data | Merchant catalog, category versions, inventory, orders |

Indexes support efficient access; they are not a substitute for transactional uniqueness checks. Avoid oversized all-mission scans in commit paths.

Suggested service contracts are `submitUserInput`, `applyContextPatch`, `preparePlanningContext`, `publishPlanPatch`, `reserveResources`, `claimCommand`, `commitOperation`, `reconcileOperation`, and `settleCommand`. Model-facing schemas should expose the smallest relevant contract instead of unrestricted table access.

## Acceptance invariants

- A task-local fact does not become a permanent user fact without a valid update.
- No new controlled effect commits against invalid authority or a superseded decision.
- An observed completed effect remains recorded even if its plan becomes obsolete.
- The same logical operation does not create two controlled-merchant orders.
- A new reservation or increase is admitted only within the current shared limit. A later user limit reduction can create an explicit overcommitted state, which blocks further allocation while preserving existing obligations.
- Browser disconnection does not erase mission state or create evidence of non-execution.
- A completed mission satisfies independently checked domain postconditions.
- An irrelevant change does not force a semantic replan of unrelated work.

The tests and workloads used to demonstrate these invariants are defined in [06](06-evaluation-and-experiments.md). Passing bounded tests supports those tested conditions; it is not a proof for arbitrary third-party websites.
