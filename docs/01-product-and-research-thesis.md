# Product and Research Thesis

**Scope update:** this document specifies the original personal-agent candidate. The latest discussion also explores six different products in the [experiment portfolio](11-experiment-portfolio.md). Those candidates have their own users, architecture, metrics, and optional WebMCP integration; the shopping thesis below has not been imposed on them.

## The product in one paragraph

A personal agent helps a user complete persistent goals across participating web applications. The user can change requirements or directly edit the same applications while the agent works. The agent keeps track of which decisions depended on which facts, preserves valid completed work, and repairs the remaining plan when circumstances change. The product exposes concrete task state, user controls, and verified outcomes rather than treating a conversation transcript as the complete source of truth.

This is a design hypothesis. We have not established demand, retention, willingness to pay, or a benchmark advantage.

## The user problem

Many useful personal tasks span time and several related decisions. A shopping task may involve personal preferences, existing possessions, quantities, shared spending limits, product availability, and delivery dates. During execution, any of these can change.

The desired experience is: “I can correct my agent or edit the application without losing valid work or silently creating inconsistent actions.”

The initial user is someone coordinating recurring household purchases and a specific event. This gives us both persistent personal context and task-specific exceptions. We should validate this with actual users; it is not evidence that household shopping is the best eventual market.

## Canonical demonstration

The primary mission is:

> Prepare food and shared equipment for six people going camping. Spend no more than $300, have everything arrive by Friday, account for two vegetarian participants, use the stove I already own, and keep the tent purchase that is already complete.

A second small mission, such as weekly groceries, shares a configured household purchasing budget. Each mission has its own constraints; a shared resource ledger prevents both from independently spending the same available funds. All amounts in this document are scenario examples, not measured savings.

During execution, introduce changes the agent did not know in advance:

1. Two participants cancel, but the user explicitly keeps the shared equipment choices.
2. One selected food item becomes unavailable.
3. The user locks a replacement choice directly in the interface.
4. A purchase succeeds at the merchant, but its response is lost.

Expected behavior:

- Reconsider quantities and dependencies affected by attendance, without generalizing event attendance into a permanent household fact.
- Repair the unavailable item and any shared constraints it affects.
- Preserve the user's lock and completed purchase as explicit constraints.
- Reconcile the uncertain purchase before deciding whether another attempt is needed.
- Display the actual remaining task and verified merchant state.

## What makes it personal

Personalization has to affect decisions correctly. It is not satisfied by addressing the user by name or appending a profile to every prompt.

| Dimension | Example | Required behavior |
|---|---|---|
| Stable explicit fact | The user already owns a stove | Avoid buying another unless this mission requires something incompatible |
| Soft preference | The user tends to prefer one brand | Rank suitable choices; do not override a hard deadline |
| Task exception | Two guests are vegetarian this weekend | Apply to those participants and this mission, not automatically to the user's permanent diet |
| Temporal context | A preference applies only this week | Stop applying it after its validity interval |
| Commitment | A tent is already purchased | Preserve the purchase as reality and plan around it |
| Authority | The user approved a particular purchase scope | Execute only within that scope; preferences do not create permission |

The system should make these distinctions inspectable and editable. The runtime should depend on resolved context fields and their sources, rather than invalidating every task whenever any profile field changes.

## Why the technical direction changed

The discussion began with personal agents and WebMCP, with Cal Hacks awards and live demonstration quality as priorities. Several simpler product directions were examined before the current runtime direction.

| Direction considered | Why it was attractive | Why it was narrowed or deprioritized |
|---|---|---|
| Automatic schedule repair | Easy to demonstrate changes and constraints | Runline, Aisle, and Day Canvas show substantial overlap |
| Editable personal memory | Clear user ownership and correction story | Recall covers user-controlled memory; Waggle's shared project memory already includes approved corrections, lineage, and stale-proposal checks |
| Returns and refunds | Concrete personal value | Existing projects already cover conditional returns, verification, and escalation |
| Cross-site transactions and compensation | Serious execution problems | Concord already makes recovery and transaction boundaries central |
| Memory correction propagated into plans | Links personal context to observable work | Promising mechanism, but a quantity-refresh example alone is too small |
| Intent compiler plus solver | Structured constraints can improve reliability | A linear parse–solve–execute demonstration does not establish a novel advantage |
| Replay/debugging tool | Useful technical visibility | Best retained as an experiment and debugging capability unless developer tooling becomes the product |
| Dynamic incremental runtime | Exposes measurable costs of change, reuse, and recovery | Selected for validation; it must still beat strong alternatives |

These are research judgments based partly on author-described projects. They are not independent reproductions or an exhaustive market survey. Sources include [Runline](https://devpost.com/software/runline), [Aisle](https://devpost.com/software/aisle-ai-wedding-seating), [Waggle](https://devpost.com/software/waggle-webmcp), [ProofDone](https://devpost.com/software/proofdone), and [Concord](https://devpost.com/software/concord-an-agent-that-cannot-overpromise).

## The technical thesis

The proposed contribution is an execution runtime that explicitly represents decision validity in a changing world. It uses those representations to reduce unnecessary recovery work while maintaining correctness and solution quality.

The thesis is not “agents cannot replan.” Strong existing agents do replan. It is also not “dependency graphs are new.” For example, [HyperAgent](https://arxiv.org/abs/2608.02650) describes schema-graph-guided tool planning and execution.

The testable questions are:

1. Does dependency-directed repair reduce model and tool work when changes are localized?
2. Does it retain that benefit against a global planner with caching and warm starts?
3. Does validity checking avoid stale execution without excessively invalidating good work?
4. Does the decision layer choose useful information gathering or repair actions without adding more cost than it saves?
5. Can personal context remain correctly scoped across multiple missions?

We expect any incremental advantage to depend on workload structure. Dense dependencies, small inexpensive plans, or broad global changes may favor simpler full replanning.

## What the user should interact with

The main workspace presents mission cards with goals, constraints, current choices, completed actions, and the reason a task is waiting. A user can edit requirements, lock a choice, inspect the personal information used, and stop future execution.

The execution graph is an expandable explanation and demo view. Ordinary product operation should not require users to understand node revisions, fencing tokens, or database isolation.

An activity view should distinguish “proposed,” “submitted,” “confirmed,” and “outcome unknown.” “Done” is reserved for an outcome checked against authoritative state.

## What WebMCP and Convex contribute

WebMCP is the browser-facing tool interface for participating applications. It provides a way to discover and invoke registered tools in an authorized browser context. It does not supply merchant integrations, business semantics, a model, a personal memory system, or a global transaction coordinator. See the [current Chrome API documentation](https://developer.chrome.com/docs/ai/webmcp/imperative-api).

Convex stores authoritative product state and coordinates transactional transitions and durable work. It is a strong fit for the shared user/agent workspace. Its database protections do not automatically establish that a model's earlier proposal is still valid. The application must check relevant versions and conditions when accepting a proposal or committing a business action. See [Convex OCC](https://docs.convex.dev/database/advanced/occ).

## Scope and success criteria

The first complete product slice should include a personal workspace, a participating merchant, two missions with a shared resource, one browser write executor, and reliable outcome reconciliation. Additional merchants test extensibility after this slice works.

Success means all three of the following are demonstrated:

- **Product:** a user can complete and modify a meaningful task with visible, correct outcomes.
- **Engineering:** change, concurrency, and interruption are handled according to explicit contracts.
- **Evidence:** at least one predeclared benefit is supported against strong baselines, with costs and limitations disclosed.

A working demo alone establishes feasibility, not superiority. A favorable benchmark on artificial tasks alone does not establish product demand. Both are necessary parts of the project story.

## Development ambition

The design is no longer constrained to 36 hours of total engineering. The intended sequence is a stable core, credible experiments, then integration and presentation refinement. More available time should strengthen recovery behavior, integration quality, and evidence rather than automatically multiplying model roles or product domains.

Submission eligibility is a separate question. The current event's work-timing language must be resolved before describing prebuilt implementation as eligible. See [sponsor strategy](07-sponsor-track-strategy.md).
