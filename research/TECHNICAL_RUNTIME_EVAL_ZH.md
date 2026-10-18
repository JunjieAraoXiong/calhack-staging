# From an Intent Compiler to an Evaluable Incremental Agent Runtime

Date: 2026-10-17. Status: draft technical design and experiment protocol; no product implementation or measured performance. This document responds to the concern that “Option 1 is too linear and needs technical differentiation and credible evaluation,” updating the earlier recommendation centered on memory correction.

See the subsequent [Personal Agent System Architecture](./PERSONAL_AGENT_SYSTEM_ZH.md) for further definitions of personal state, budgets shared across missions, model interfaces, execution states, and receipt semantics. That design narrows the MVP to one controlled store and two missions, deferring the second store.

## Research Question

With the same model, tools, state information, and execution budget, can explicit dependencies and conditional revalidation reduce repeated planning work while maintaining or improving final task success as website state changes continuously?

Comparisons must include a strong ReAct agent that can retry, observe state, and revise its plan, as well as global replanning with caching and warm starts. Dependency graphs, incremental computation, and optimistic concurrency control are not new inventions. HyperAgent has already investigated tool-schema graphs and dynamic planning; “using a DAG” cannot be the research contribution. [Paper](https://arxiv.org/abs/2608.02650)

## Product and Controlled Environment

Build a personal purchasing agent whose requirements the user can change during execution. The initial version described here covers two controlled store views and one personal task board. The two stores can initially use same-origin pages to contain browser-integration costs; they are test environments, not claimed integrations with real merchants.

Example request: prepare food and shared equipment for a weekend camping trip for six people, with a total budget of $300, delivery before Friday, two vegetarian participants, an already purchased tent that must remain unchanged, and a stove already available at home. A finite catalog explicitly labels capacity, compatibility, price, inventory, delivery, and category. The example demonstrates shared budgets, branch dependencies, alternatives, and completed facts; the camping domain is not the algorithmic novelty.

During execution, allow an item to go out of stock, a delivery commitment to change, the user to increase attendance or lock a choice, or a response to be lost after a successful commit. The goal is to continuously absorb events and repair the remaining plan while preserving work that is still valid. Prioritize stock changes, user edits, and lost responses in the first version rather than implementing every fault at once.

## Four Deliverables

1. **Controlled WebMCP environment:** catalog queries, cart reads, resource reservation, conditional commits, and operation-receipt queries; the page also supports direct human interaction. Business state has versions and event records. Tool adapters explicitly declare read/write scope, conditions, and observable effects.
2. **Runtime:** structured constraints, dependency records derived from actual reads, an invalidation index, conditional revalidation, local repair, and state machines for committed and unknown outcomes.
3. **Comparison harness:** fixed scenarios, isolated initial states, fault injection, three agents using the same model, an independent final-state checker, raw JSONL traces, and metrics.
4. **Demo interface:** real carts and a task board, a live dependency graph, event controls, and measured results. The dependency graph comes from execution records, not a prebuilt animation.

A WebMCP tool schema is not a specification of business preconditions or side effects; adapters supply those semantics. `toolchange` indicates a change to the tool collection, not a business event such as stock or cart changes. The application must implement its own business-event channel and give every experimental group the same information. [Official Chrome API](https://developer.chrome.com/docs/ai/webmcp/imperative-api)

## Technical Core

### Structured Constraints and Dependency Evidence

The model maps natural language into a finite constraint language, such as budget, attendance, deadlines, dietary attributes, and locked items. It may also propose candidate alternatives. Code performs constraint checking, amount calculations, and version validation. Dependencies come from tool reads and constraint expressions; the model's own account of “what I depended on” is not sufficient.

Each decision records at least its input entities and versions, query collections and versions, constraints used, output, preconditions, downstream consumers, execution state, and operation ID.

Query-collection dependencies matter: “the cheapest currently available item that can arrive on time” depends on the candidate collection, not only the selected item. A cheaper item appearing, or an empty search result becoming nonempty, may affect the decision. The first version can conservatively track category versions, sacrificing some reuse to avoid missing invalidations.

### Conditional Revalidation and Progressive Expansion of Repair Scope

After an event:

1. Find potentially affected decisions using the changed keys and mark them for revalidation.
2. Recheck the conditions actually used. A version change that leaves relevant attributes unchanged can preserve a decision; a change to the optimization candidate collection triggers reassessment of the corresponding choice.
3. Propagate downstream when an output becomes invalid or changes. Preserve unrelated branches. Completed business operations remain facts and cannot be deleted from history.
4. Solve within the affected scope first, treating unaffected decisions outside it as boundary conditions. Use the same lexicographic objective: satisfy hard constraints, minimize changes to current commitments, then optimize cost and preferences.
5. If shared budget, capacity, or delivery constraints cannot be satisfied, include connected variables and retry, eventually falling back to global solving. Do not claim that the first locally feasible solution is necessarily globally optimal.
6. Before committing, the authoritative service checks necessary versions and preconditions and performs the write in the same atomic operation. Any conflict becomes a new event and reenters the feedback loop.

Use simple, explainable expansion rules initially; do not implement an unverifiable complex algorithm merely to advertise a “minimal slice.” Report actual recomputation scope, execution cost, and the gap from the global optimum.

### Side Effects and Uncertainty

Actions distinguish at least pending, running, committed, unknown, and invalid. If a request times out but the service may have committed it, enter unknown and query the operation ID's receipt before deciding whether to proceed or retry.

Atomic server validation, idempotency, and operation receipts are shared infrastructure for every experimental group. They demonstrate correct system execution but cannot independently count as an advantage of the incremental algorithm. Two external merchants do not automatically share a global transaction; sites without server-side conditional writes or receipts are outside these guarantees.

## Evaluation: Freeze the Protocol Before Optimizing the Implementation

### Comparison Groups

| System | Required capabilities |
|---|---|
| Strong ReAct | Current state/state deltas, action history, versions, and receipts; retries and replanning allowed; reasonably tuned prompts |
| Global replanning | The same structured planner, constraints, completed-operation records, and cache as the incremental group; warm starts allowed; resolve the entire remaining plan after each material change |
| Incremental runtime | The same planning and execution capabilities, plus dependency-based localization, conditional revalidation, and scope expansion |

Also compare deterministic rules or a global solver at the structured-input layer. If a simple method already solves the problem where language understanding is unnecessary, report that honestly instead of forcing a model into the design.

Use the same model version, reasoning configuration, tool contracts, visible events, total token/time limits, and initial state. Include all auxiliary model calls, graph maintenance, tool reads, failed retries, and commit-validation costs. Baselines may also run nonconflicting tasks in parallel.

### Scenarios and Budget

First use 12 development scenarios to debug the baselines and harness. After freezing the protocol, plan 48 held-out scenarios with three runs per scenario per group, for 432 end-to-end episodes. If the available model budget is insufficient, uniformly reduce the repetition or scenario count before inspecting test results and disclose that reduction; do not retain only favorable outcomes.

The held-out scenarios cover six categories: no change, unrelated/local changes, shared-resource changes, global-constraint changes, commit races, and uncertain commit outcomes. Each category includes different dependency structures, product combinations, and feasibility conditions. Include infeasible instances, where the correct result is an explicit conflict without exceeding authority, rather than an invented plan.

Trigger events at shared semantic barriers, such as “before the first commit” or “after one purchase completes,” rather than at each group's Nth tool call. Retain and report traces that never reach the barrier. Evaluate continuous wall-clock events separately as a stress test instead of combining them with controlled experiments in one number.

Keep development and test sets separate. Go beyond changing random seeds by holding out some shared-resource topologies, constraint combinations, and event combinations. If tuning continues after inspecting held-out results, reclassify that batch as development data and reserve a new test set.

### Independent Scoring

The checker reads final world state and immutable operation logs directly, checking attendance/capacity, budget, deadlines, user locks, and duplicate commits. Do not let the agent score itself, rely only on a “tool call succeeded” response, or reuse the runtime's dependency graph to prove that the runtime is correct.

For small catalogs, implement a separate exhaustive checker to establish feasibility and the optimal objective value. For large stress instances, check independent constraints and solution bounds; do not call an unproven solver output optimal.

The idea of comparing a final database state with a target in τ-bench is useful, but this is a newly defined dynamic WebMCP environment. Its scores cannot be presented as official τ-bench scores. [Paper](https://arxiv.org/abs/2406.12045)

### Required Metrics

The primary metric is final valid task-completion rate within a fixed budget. Report correct rejection/conflict-identification rate separately for infeasible instances.

Also report total model tokens, total tool calls, post-event recovery latency, duplicate business side effects, unnecessary changes, and the final cost/preference gap from the global solution. Cost statistics cover all episodes, including failures and timeouts. Present cost comparisons between paired successful runs separately; do not show only the subset where our method succeeds. Report raw numerators and denominators by fault category and uncertainty intervals paired by scenario.

Three recommended measured plots:

- Success rate versus token/time budget: does the method complete more at the same budget, or merely spend more?
- Recovery cost versus the proportion of affected tasks: do local changes help, and when do global changes eliminate the advantage?
- Ablation comparison: remove dependency selection; remove conditional revalidation. Both variants retain the same commit protections.

Retain no-change overhead and negative results under global changes. A prospective evaluation target can be “substantially lower total cost under local changes without reducing final success or plan quality”; numbers such as 20% or 30% are only product thresholds awaiting validation. Small samples cannot establish strict noninferiority or universal superiority.

## External Benchmarks and Related Work

ToolMaze studies tool failures, DAG topology, and replanning; its perturbation categories are useful references. A read-only review of its public code found Source/Processor/Action tool categories, but no unified resource-level read/write sets or versioned commit contract. Its main perturbations replace results at invocation, its executor processes tool calls individually, and sampled booking tools return simulated results. It can therefore provide a supplementary external test of tool-failure recovery, but cannot directly validate concurrent writes or duplicate-order safety. [Paper](https://arxiv.org/abs/2606.05806), [executor](https://github.com/Zhudongsheng75/ToolMaze/blob/main/evaluation/core/sandbox.py)

When adding only an agent adapter while retaining the original tasks, tools, perturbations, and scoring, report results in the original environment separately. If adding state versions or concurrent events, label the result a custom extension rather than an official score. Do not expose valid_paths, the true DAG, or predetermined fault locations to the planner. Also record how often faults actually occur: bypassing a fault through caching is not the same as recovering after experiencing it. ToolMaze was not installed or executed in this research round.

Existing WebMCP projects already include state repair, receipts, and cross-site compensation, so product claims should center on reproducible measurements. Before running experiments, do not claim a new algorithm, the most reliable agent, or superiority over every existing system.

## Staged Implementation and Acceptance

The user explicitly removed the assumption that all development must fit into 36 hours, preferring to complete the main system before refining it onsite. The following stages follow maturity rather than compressing the core into event hours. Competition timing rules are recorded separately in the research protocol; this schedule does not imply that pre-event code is approved for use in this edition.

| Stage | Deliverables | Evidence required to advance |
|---|---|---|
| Core feedback loop | Personal state, missions, tool contracts, Convex state transitions, browser commands and receipts, independent checker | Repeatable execution from real tool reads to final-state validation; process/page restarts preserve confirmed outcomes |
| Technical validation | Dependency revalidation, local repair, resource reservation across missions, strong baselines, fault injection, trace export | Identify benefits and counterexamples in development scenarios; confirm the advantage does not come from information asymmetry or weaker baselines |
| Result finalization | Frozen evaluation protocol and versions, held-out scenarios, ablations, performance curves, failure analysis | Reproducible results supporting precise claims; otherwise continue revising the method or narrowing the claim |
| Integration and onsite refinement | Real usage feedback, sponsor-technology demonstrations, interaction polish, environment compatibility, demo backups | Targeted regression checks for new changes; no dependence on inventing the core algorithm onsite or fabricating evaluation conclusions |

Prioritize correctness, baseline quality, fault recovery, and interpretable experiments when more development time is available, rather than automatically adding domains, microservices, or model roles. Shared resources across two missions are part of system acceptance; add multiple websites incrementally as a scalability test.

If the incremental group cannot outperform cached global replanning, the core claim does not hold. If it only beats ReAct, position the result as an engineering benefit of structured execution. If graph maintenance costs more on small problems, report the applicable scale or abandon the complex graph design. Do not use more agents, RAG, or a vector database to conceal a lack of benefit.

## Three-Minute Demonstration

State a concrete personal task and start real execution. During execution, let the judges change attendance, make an item unavailable, or lock a choice. The dependency graph uses live records to show which decisions were revalidated, retained, or replaced. Show that the final cart satisfies the constraints, then open the full measured comparison of all three systems under the same conditions and one failure case.

Sponsor connections can remain: the purchasing product narrative aligns with Visa's shopping theme, Convex or SpacetimeDB supports shared state, and Gemini supports semantic understanding. Eligibility depends on each track's rules; do not add modules unrelated to the experiment merely to display more logos.
