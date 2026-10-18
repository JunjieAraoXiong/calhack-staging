# Decisions and Open Questions

This record distinguishes the user's stated direction from technical recommendations and unresolved implementation choices. It summarizes the current discussion; it is not a claim of user approval for every proposed component.

## 1. Decision status

| Topic | Status | Current position |
|---|---|---|
| Product field | Expanded user direction | Preserve personal agent plus WebMCP as one option; explore six additional agent/backend/data products in [11](11-experiment-portfolio.md) |
| Event objective | User direction | Prioritize Cal Hacks award relevance and a strong live demonstration |
| Technical depth | User direction | Go beyond a linear workflow; produce credible evaluation evidence |
| Total engineering time | User direction | Do not impose a 36-hour product-development cap |
| Documentation | User direction | Detailed English docs with alternative architectures, deployment, and sponsor analysis |
| Backend | Preferred direction | Convex, with concrete responsibility for shared state and coordination |
| Primary technical hypothesis | Personal-agent recommendation | Dependency-directed revalidation and incremental repair can reduce work under localized changes; portfolio candidates test different hypotheses |
| Initial product example | Personal-agent recommendation | Camping and household shopping with scoped preferences and shared resources |
| Initial breadth | Recommendation | One controlled merchant, two missions, one write executor; expand after correctness |
| Model provider | Provisional recommendation | Gemini is a plausible sponsor-aligned first provider; exact model is unselected |
| Agent topology | Recommendation | One logical personal agent with multiple mission controllers and shared state |
| Decision model | Recommendation | Deterministic guards plus model-assisted decisions for ambiguity; no initial custom training |
| Browser host | Unresolved implementation choice | Validate a controlled page host first; extension or hosted browser only where needed |
| Planning/solver implementation | Unresolved implementation choice | Typed domain planner initially; evaluate a separate solver service for real combinatorial need |
| Track submission | Product-dependent and unconfirmed | Convex/Gemini/Visa for the original branch; Factory, Apify, Coinbase, Elastic, Armadin, and Hyphenate considered where the selected product substantively fits |
| Portfolio priority | Research recommendation | First compare DataPatch, LiveOps, and SupplyWatch; no final pivot or empirical winner selected |
| WebMCP across candidates | Updated scope | Core to the original browser-agent branch; optional when external agents need an application tool interface |
| Implementation language | Recommendation, not implementation | TypeScript for web/WebMCP/Convex; optional pure Rust/WASM kernel; native worker only for justified workloads; Python remains natural for DataPatch. See [12](12-typescript-rust-convex-webmcp.md) |
| Prebuilt implementation eligibility | Unconfirmed and in tension with published rules | Do not treat the user's preferred product schedule as an exception to the event rules |
| Performance superiority | Unproven | Requires the experiments in [06](06-evaluation-and-experiments.md) |
| Persistent assistant lifecycle | New recommendation, not implementation approval | Put versioned task specs, wake-up admission, bounded runs, and delivery state around the mission core; see [15](15-persistent-agent-runtime-design.md) |
| Protocol and wallet integrations | Optional, access unverified | Compare PAP, PACT, Link, and browser adapters without assuming interchangeability, production access, or sponsorship |
| Product configuration | Open scope discussion | Prefer persistent assistant plus the incremental-repair experiment; browser copilot, protocol concierge, commerce specialist, and delegation platform remain alternatives in [14](14-personal-agent-system-variations.md) |
| Operation-lifecycle novelty | Corrected by new prior art | PAP Operations already specifies operation identity, revision-bound approval, and recovery; evaluate mission-level behavior above the shared substrate |

## 2. Architecture decision records

ADRs 01–08 were developed for the personal-agent runtime. Their principles can be reused where relevant, but domain-specific contracts and implementation choices for the six alternatives are specified in [11](11-experiment-portfolio.md) and its linked designs.

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

October 18 scope questions: consumer mission service versus business-facing interoperability; one concrete recurring task; supported execution environment; task revision/missed-run policy; memory correction and retention; useful delivery policy; and actual access to any chosen PAP/PACT/Link counterpart. The [six-variation comparison](14-personal-agent-system-variations.md) gives deciding experiments. No final product choice was made by adding that research.

Owners below are responsibilities to assign, not named people or work already delegated to a team member.

| Priority | Question | Evidence needed | Suggested owner |
|---|---|---|---|
| Before eligible implementation planning | What preparation and existing code does Cal Hacks permit? | Current organizer interpretation of the published implementation rule, including disclosure requirements | Submission lead |
| Before claiming a track | What exactly do the chosen product's sponsors require this year, and can one entry target multiple tracks? | Current track instructions or explicit sponsor/organizer answer | Submission lead |
| Before expanding implementation | Which portfolio candidate passes its minimum decisive experiment? | Working vertical path, credible input data, fair comparison, and useful outcome | Product and evaluation |
| Before product expansion | Do intended users repeatedly encounter this coordination problem? | Observed task walkthroughs and feedback on the concrete shopping flow | Product lead |
| M0 | How are mission limits, shared limits, prior purchases, and taxes/shipping counted? | Fixture specification and user-facing accounting rules | Runtime and product |
| M0 | What events are observable, and how fresh are external observations? | Adapter contract distinguishing event push, polling, and source-side checks | Browser and runtime |
| M0 | What does an ongoing mission authorize automatically? | Explicit read/repair/write grants, amount limits, expiry, and revocation behavior | Product and runtime |
| M1 | Which exact browser build and agent host support the required native WebMCP surface? | A reproducible discovery-and-execution smoke test on the deployed origin | Browser lead |
| M1 | Which exact model and reasoning configuration is usable at acceptable cost and latency? | Small development-set comparison with actual request metadata and provider limits | Planning lead |
| M1–M3 | Do constraints need a solver service, or is a bounded typed planner sufficient? | Runtime and quality comparison on representative combinatorial cases | Planning lead |
| Before adding an external merchant adapter | Can the intended real merchant expose idempotency, conditional writes, and outcome lookup? | Actual source API/adapter behavior and failure tests; M2 first validates the controlled store's contract | Integration lead |
| Before test freeze | What cost saving and quality margin would make the added runtime complexity worthwhile? | Predeclared practical thresholds and an agreed statistical protocol | Evaluation lead |
| M5 | Will judging devices and networks support the chosen browser setup? | Fresh-device rehearsal and event access instructions | Demo lead |
| M6 | Which second domain tests a genuinely different dependency or execution contract? | Failure/extension analysis from the first domain | Product and evaluation |

## 4. Scope of autonomy

An accepted ongoing mission can authorize continued observation, revalidation, and repair within its declared bounds. The agent should not ask for permission again merely because a fact changed or a model returned a proposal.

Ask when the scope is genuinely unresolved, when hard requirements conflict and the user must choose, or when a proposed effect exceeds the existing grant. For example, an attendance change within an approved shopping mission can trigger quantity repair; buying a substitute above the authorized cap cannot be inferred from a general brand preference.

This is an application contract to implement and evaluate. It does not imply that the documentation task authorized deploying the product, sending organizer messages, or making purchases.

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
