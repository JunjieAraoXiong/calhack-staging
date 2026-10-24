# Decisions and Open Questions

This record distinguishes the user's stated direction from technical recommendations and unresolved implementation choices. It summarizes the current discussion; it is not a claim of user approval for every proposed component.

**October 22 update:** the user requested updating the system design for the travel use case and preparing a runnable implementation prompt. [16 — Travel system design](16-travel-agent-system-design.md) now defines the active implementation target. Earlier shopping and portfolio choices remain research history. No goal has been launched or application implemented by this documentation update.

## 1. Decision status

| Topic | Status | Current position |
|---|---|---|
| Product field | Current design direction | Travel personal agent coordinating existing arrival arrangements; earlier alternatives remain in [11](11-experiment-portfolio.md) |
| Event objective | User direction | Prioritize Cal Hacks award relevance and a strong live demonstration |
| Technical depth | User direction | Go beyond a linear workflow; produce credible evaluation evidence |
| Total engineering time | User direction | Do not impose a 36-hour product-development cap |
| Documentation | User direction | Detailed English docs with alternative architectures, deployment, and sponsor analysis |
| Backend | Preferred direction | Convex, with concrete responsibility for shared state and coordination |
| Primary implementation question | Current travel scope | Can sourced procedures and persistent execution correctly coordinate existing bookings with less user work? Comparative advantage remains unmeasured |
| Initial product example | Current travel scope | Tokyo arrival: imported flight, guest airport-bus reservation, and hotel reservation |
| Initial breadth | Current travel scope | One journey, two independent controlled providers, one controller; see canonical fixture in 16 |
| Model provider | Implementation choice | One configurable real provider/model, using an existing suitable setup where available; record and verify the chosen version |
| Agent topology | Recommendation | One logical personal agent with one active journey controller; independent read-only subtasks may be delegated |
| Decision model | Recommendation | Deterministic guards plus model-assisted decisions for ambiguity; no initial custom training |
| Browser host | Optional adapter choice | Mandatory flow uses server adapters; a WebMCP path must pass separate browser discovery/invocation checks |
| Planning/solver implementation | Current recommendation | Structured replanning of remaining tasks with deterministic validators; optimized incremental repair and solvers deferred |
| Track submission | Product-dependent and unconfirmed | Convex/Gemini/Visa for the original branch; Factory, Apify, Coinbase, Elastic, Armadin, and Hyphenate considered where the selected product substantively fits |
| Portfolio priority | Historical research | DataPatch, LiveOps, and SupplyWatch retain their proposed experiments; travel is the current implementation target, not a measured market winner |
| WebMCP across candidates | Current scope | Optional verified adapter for the travel prototype; retains historical importance in the original browser-agent branch |
| Implementation language | Recommendation, not implementation | TypeScript for web/WebMCP/Convex; optional pure Rust/WASM kernel; native worker only for justified workloads; Python remains natural for DataPatch. See [12](12-typescript-rust-convex-webmcp.md) |
| Prebuilt implementation eligibility | Unconfirmed and in tension with published rules | Do not treat the user's preferred product schedule as an exception to the event rules |
| Performance superiority | Unproven | Requires the experiments in [06](06-evaluation-and-experiments.md) |
| Persistent assistant lifecycle | Retained design | Versioned task specs, wake-up admission, bounded runs, and delivery state from [15](15-persistent-agent-runtime-design.md), specialized by 16 |
| Protocol and wallet integrations | Optional, access unverified | Compare PAP, PACT, Link, and browser adapters without assuming interchangeability, production access, or sponsorship |
| Product configuration | Current design | Persistent arrival companion, curated procedures, independent provider commits, and verified outcomes |
| Operation-lifecycle novelty | Corrected by new prior art | PAP Operations already specifies operation identity, revision-bound approval, and recovery; evaluate mission-level behavior above the shared substrate |
| Success boundary | Current design | arrangements_confirmed under current verified conditions; later material events trigger revalidation; physical arrival remains separate |
| Local procedures | Current design | Curated, sourced and versioned bus/hotel procedures first; autonomous procedure learning deferred |
| Implementation handoff | Prepared, not started | Copy [the /goal prompt](prompts/travel-agent-goal.md) into an implementation chat; no token budget or model override prescribed |

## 2. Architecture decision records

ADRs 01–08 were developed for the personal-agent runtime. Their principles can be reused where relevant, but domain-specific contracts and implementation choices for the six alternatives are specified in [11](11-experiment-portfolio.md) and its linked designs.

For the active travel build, ADR-09 and ADR-10 below specialize scope and execution order. ADR-05's multiple-mission ledger and ADR-07's browser-first sequence are historical scale/channel choices, not prerequisites.

### ADR-09: make the arrival workflow the first implementation

**Decision:** implement one imported journey, two curated procedures, and two controlled provider adapters. Start with structured replanning, current-state validation, durable operations, and read-back confirmation.

**Reason:** this finite workflow tests meaningful local procedure selection and cross-provider follow-through without requiring global travel inventory or a complex incremental planner. The competitive research shows that memory, booking, and disruption recovery already have close alternatives.

**Consequence:** design 16's finite fixture and acceptance suite govern the first build. The earlier shopping benchmark and multi-mission optimization remain optional future research, not completion gates.

### ADR-10: separate provider effects, business acceptance, and arrangements status

**Decision:** each provider commits its own effects, with independent receipts and reconciliation. Hotel request delivery, hotel acceptance, confirmed arrangements, and actual traveler arrival are different states.

**Reason:** transport and hotel cannot share an atomic real-world commit. A partial outcome must stay visible, and imported order details do not grant universal modification authority.

**Consequence:** define explicit pending-hotel policy, preserved original accommodation night, additional-cost grants, and post-confirmation revalidation. Controlled fixtures may enforce current admission at commit; production guarantees depend on each actual supplier.

### ADR-01: keep authoritative task state outside conversation history

**Decision:** store facts, missions, decisions, resources, commands, and receipts as typed records. Use conversation history for interpretation and explanation.

**Reason:** a user edit, completed purchase, and pending model answer may disagree. The system needs an explicit authority and version for each. A transcript alone cannot atomically reserve money or prevent a stale proposal from replacing current state.

**Consequence:** more schema and transition code, but inspectable recovery and reproducible evaluation. Convex's Agent component is optional support, not a replacement for domain state.

### ADR-02: compare incremental repair with a strong global alternative

**Decision:** implement a shared platform first, then compare ReAct, global replanning, and incremental repair under the same conditions.

**Reason:** the technical claim concerns avoiding unnecessary work, not merely adding database checks that a baseline lacks. A global planner can retain history, cache observations, warm-start, preserve commitments, and run independent work concurrently.

**Consequence:** the preferred architecture may lose on small or densely coupled tasks. Retain a global fallback and report the workload range in which incremental maintenance is useful.

### ADR-03: treat planning validity and real effects separately

**Decision:** keep plan/node validity independent from execution status. Preserve late authoritative receipts even when the initiating decision has been superseded.

**Reason:** an operation may have committed before a cancellation or new instruction reaches its source. Ignoring its receipt would corrupt spending and future planning.

**Consequence:** `succeeded + superseded` is a meaningful state. The UI and evaluator must reflect real commitments. Neither cancellation nor lease expiry proves rollback.

### ADR-04: use multiple version domains

**Decision:** distinguish input revisions, planning attempts, node revisions, stop epochs, command fencing, and event cursors.

**Reason:** a single user-global counter would either invalidate unrelated work or fail to express the right execution boundary. Convex OCC alone does not know which earlier model assumptions remain relevant.

**Consequence:** explicit witness validation at publication and commit, with bounded transactional reads. See [03](03-personal-agent-runtime.md) for the canonical terms.

### ADR-05: make resource admission transactional

**Decision:** coordinate both missions through a shared ledger of confirmed spending, active reservations, and uncertain obligations.

**Reason:** independent prompts can each regard the same balance as available. Correctness must survive concurrent writes and browser retries.

**Consequence:** a user lowering the cap below existing obligations creates an overcommitted pool; it does not erase history. New spending admission is blocked as appropriate, and the agent explains infeasibility or seeks a lawful resolution. Evaluate invalid admission separately from a later external cap reduction.

### ADR-06: separate logical model roles from model deployments

**Decision:** define interpretation, planning, decision policy, and repair interfaces, initially backed by one configured provider/model where appropriate.

**Reason:** structured responsibilities help evaluation without requiring four models, agents, or services. Model training is premature before collecting meaningful trajectories and showing routing errors matter.

**Consequence:** route deterministic cases without inference. Use `continue / query / repair / replan / ask / wait / stop` as the policy vocabulary. Compare model-assisted routing against rules using downstream outcomes and total cost.

### ADR-07: start with an inspectable browser integration

**Decision:** prove the real WebMCP path in a pinned browser and controlled application before broadening hosting or merchant support.

**Reason:** tool registration, exposure, origin permissions, authentication, and document lifetime are separate from backend orchestration. WebMCP does not make arbitrary sites controllable.

**Consequence:** document any polyfill or bridge. A backend-only API adapter remains a useful integration, but it must not be presented as native WebMCP execution.

### ADR-08: keep evaluation truth outside the agent

**Decision:** score authoritative outcomes using independent logic and private scenario state, including faults and feasible alternatives.

**Reason:** a model's self-report or agreement with one expected action sequence does not establish success. Multiple action sequences can be valid, and an apparently successful response may leave the wrong state.

**Consequence:** freeze fixtures, budgets, and thresholds; preserve failures; separate live calls from replay; track event exposure and quality gaps. No measured result exists yet.

## 3. Open questions and how to resolve them

Current travel questions concern real supplier access, actual demand for arrival coordination, procedure maintenance, model reliability, and which production adapters can support safe reconciliation. The October 18 configuration questions remain historical exploration in [14](14-personal-agent-system-variations.md).

Owners below are responsibilities to assign, not named people or work already delegated to a team member.

| Priority | Question | Evidence needed | Suggested owner |
|---|---|---|---|
| Before event submission | What preparation and existing code does Cal Hacks permit? | Current organizer interpretation of the published implementation rule, including disclosure requirements; separate from ordinary product development | Submission lead |
| Before claiming a track | What exactly do the chosen product's sponsors require this year, and can one entry target multiple tracks? | Current track instructions or explicit sponsor/organizer answer | Submission lead |
| Before product expansion | Does arrival coordination outperform accessible alternatives on the target task? | Observed competitive task audit and a useful working vertical path | Product and evaluation |
| Before product expansion | Do intended travelers repeatedly encounter and want to delegate this problem? | Observed recent-trip walkthroughs and feedback on the concrete arrival flow | Product lead |
| M0 | How are prior fares, additional charges, and unknown obligations counted? | Design 16's finite fixture, one journey cap, and independent ledger assertions | Runtime and product |
| M0 | What events are observable, and how fresh are external observations? | Adapter contract distinguishing event push, polling, and source-side checks | Browser and runtime |
| M0 | What does an ongoing mission authorize automatically? | Explicit read/repair/write grants, amount limits, expiry, and revocation behavior | Product and runtime |
| Optional browser milestone | Which exact browser build and host support the selected WebMCP surface? | A reproducible discovery-and-execution smoke test, separately labeled from server API execution | Browser lead |
| M1 | Which exact model and reasoning configuration is usable at acceptable cost and latency? | Small development-set comparison with actual request metadata and provider limits | Planning lead |
| After M4, if complexity warrants | Do constraints need a solver service beyond the typed planner? | Runtime and quality comparison on representative combinatorial cases | Planning lead |
| Before adding a production provider | Can the supplier support access, applicable changes, and outcome lookup? | Actual source behavior and failure tests; the MVP first validates controlled transport/hotel contracts | Integration lead |
| Before test freeze | What cost saving and quality margin would make the added runtime complexity worthwhile? | Predeclared practical thresholds and an agreed statistical protocol | Evaluation lead |
| M4 / before event demonstration | Will demonstration devices and networks support the chosen setup? | Fresh-session rehearsal and any event access instructions | Demo lead |
| After the arrival prototype | Which second city or provider tests a different procedure or execution contract? | Failure/extension analysis and maintenance effort from the first journey | Product and evaluation |

## 4. Scope of autonomy

An accepted ongoing mission can authorize continued observation, revalidation, and repair within its declared bounds. The agent should not ask for permission again merely because a fact changed or a model returned a proposal.

Ask when the scope is genuinely unresolved, when hard requirements conflict and the user must choose, or when a proposed effect exceeds the existing grant. For example, a delay can trigger an authorized bus amendment; cancelling the hotel or buying a replacement stay cannot be inferred from a general desire for convenient travel.

This is an application contract to implement and evaluate. Preparing the goal prompt does not start the implementation run or authorize public deployment, real supplier messages, or purchases. Event submission eligibility remains separate from ordinary local product development.

## 5. Explicit non-goals for the first validation stage

- Universal automation of websites that do not participate in the chosen tool interface.
- A separately fine-tuned personal model for every user.
- A large society of autonomous agents without measured need for that topology.
- Atomic transactions spanning independent external merchants.
- Claims of guaranteed optimality from a time-limited feasible solver result.
- Claims of benchmark superiority, customer savings, deployment, or prize eligibility before the corresponding evidence exists.

These boundaries preserve a testable first system. They do not prohibit later expansion when a concrete requirement and validation plan justify it.

## 6. Change management for the design

When a decision changes, record the trigger, the evidence, the new behavior, and affected contracts. Update the runtime, evaluation, deployment, and sponsor documents together where relevant. In particular, changing the model, event visibility, tool permissions, solver objective, or resource budget can invalidate a prior comparison.

Keep a failed experiment or rejected design in the research history when it explains the final tradeoff. Rewrite the current recommendation so a new reader does not need the conversation chronology to know what to build.
