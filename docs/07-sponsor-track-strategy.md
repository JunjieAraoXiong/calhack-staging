# Sponsor Track Strategy

Verified on **2026-10-17, America/Los_Angeles**.
This is an implementation and submission strategy, not a claim that the project is deployed, eligible, or likely to win.
Track names below come from this year's sources; technical recommendations are our design choices.
Read alongside [system alternatives](02-system-design-alternatives.md), [runtime](03-personal-agent-runtime.md), [deployment](05-deployment-and-operations.md), and [evaluation](06-evaluation-and-experiments.md).
The original personal-agent strategy is developed in sections 1–10. The expanded product portfolio appears in section 11 and [its detailed comparison](11-experiment-portfolio.md); those products need not use Gemini, shopping, or WebMCP.

## 1. Recommended combination for the personal-agent branch

Build one product with **Convex as the authoritative backend, Gemini as a real reasoning provider, and a shopping workflow as the consumer demonstration**.
Target Convex first, Gemini second, and Visa conditionally after confirming its implementation requirements.
Use a hosted React/TypeScript interface and an explicitly supported browser for the WebMCP execution surface.
Do not add a second database or agent platform merely to increase the number of sponsor names.

The product promise is: maintain an authorized personal mission as conditions change, identify unfinished decisions that actually depended on the change, and repair the affected work while preserving valid choices.
The canonical mission is camping supplies for six people, at most $300, arriving by Friday, with two vegetarian guests, an owned stove, and an already purchased tent; a grocery mission shares the purchasing pool.
Attendance falls to four for this event only, an item goes out of stock, and the user locks a replacement. Shared equipment choices and completed purchases remain fixed.
A persistent mission already authorizes in-scope revalidation and repair. Ask only about unresolved scope or conflicts, or an effect beyond the existing grant; a fact edit does not itself expand authority.
The runtime's business dependency graph is the technical contribution; the shopping experience makes its value visible.
We have not established global novelty, and sponsor infrastructure does not establish it for us.

## 2. What this year's event sources establish

The current [Cal Hacks 13.0 Devpost page](https://cal-hacks-13-0.devpost.com/) names Application, Intentionality, Functionality, Creativity, and Technical Complexity as judging criteria.
It calls for a project image, GitHub repository, table number, a locally stored demonstration video, and a three-minute pitch followed by two minutes of questions.
Its implementation rule is explicit: **“All work must be done during the hackathon.”**
The [Cal Hacks FAQ](https://www.calhacks.io/) permits advance ideation but says implementation must happen during the event and disallows a project started earlier.
These pages were re-read for this document; Devpost required a direct HTML fetch because the web extraction tool could not retrieve it.

The product roadmap need not stop at a 36-hour prototype.
However, the user's proposed “prebuild the core, refine onsite” schedule is **not established as eligible** by the published rule.
Continue research and design documentation, and obtain an organizer interpretation before treating pre-event implementation as part of an eligible entry.
If building the independent product before the event, record that provenance honestly; do not relabel it as event-only work.
An organizer-approved exception, if one exists, needs explicit confirmation rather than an inference from sponsor enthusiasm.
This document does not send an eligibility inquiry or block the broader product design.

## 3. Track ledger: facts separated from recommendations

The exact quoted names in the first column are verified on the [current Devpost page](https://cal-hacks-13-0.devpost.com/), except the separately sourced Spacetime opportunity.
Prize amounts are intentionally omitted; some displayed valuations combine cash and non-cash benefits.

| Verified track or opportunity | Recommended product role | Still unconfirmed |
|---|---|---|
| `[Convex] Best use of Convex` | Authoritative state, transactional invalidation, durable coordination, live user/agent views | This edition's detailed rubric, deployment proof, and component requirements |
| `[MLH] Best Use of Gemini API` | Actual language interpretation, plan repair, and tool selection | Extra submission fields, model restrictions, credits, and required evidence |
| `[Visa] Best use of Reimagining Shopping sponsored by Visa` | Consumer shopping experience built on the same runtime | Whether a named Visa API, sandbox, transaction, or payment flow is mandatory |
| Spacetime: sponsor article promises a prize for impressive use | Alternative authoritative backend replacing Convex | Exact submission category, detailed eligibility, and deployment requirements |
| `[Fetch.ai] 1st Place Best Use of Fetch.ai` | Optional agent discovery or collaboration only if necessary to the product | Accepted SDK/service, registration, runtime use, and lower-tier details |
| `[Elastic] 1st Place Best use of the Elastic Agent Builder on a Serverless instance` | Optional retrieval/agent variant if it genuinely requires that named service | Detailed evaluation and submission requirements |
| `[Factory] Best Use of the Factory Droid SDK` | Optional SDK-based execution variant with identifiable SDK work | Whether development-time use qualifies or runtime integration is required |
| `[Armadin] Best Security Hack` | Agent Crash Lab only if it tests an actual security threat and control boundary | Required technology, eligible attack scope, and the detailed security rubric |
| `[Apify] 1st Place Best use of Apify` | SupplyWatch collection through real Actor runs and traceable datasets | Accepted sources, required artifact/deployment evidence, and detailed rubric |
| `[Apify] Best Actor sponsored by Apify` | A reusable supplier-observation Actor with useful structured output | Publication, reuse, documentation, and submission requirements |
| `[Coinbase] Best Use of x402 by Coinbase` | SpendRail with real x402 test requests, shared authorization, and reconciliation | Accepted network/environment, required Coinbase services, and proof expected |
| `[Figma] Best Design` | Design quality of the product already being built | Required Figma artifacts and evaluation process |
| `[Figma] Best Use Case of Figma Agent`; `[Figma] Most Creative Use Case of Figma Agent` | Only if there is an actual Figma Agent workflow | Whether the proposed workflow and artifact meet their definitions |
| `[Microsoft] 1st Place Built for the Real World`; `[Microsoft] 2nd Place Microsoft Customer Impact Award` | Consider only with a relevant deployed workflow and demonstrated impact | Required Microsoft technology and customer evidence |
| `[Hyphenate] 1st Place The Hyphenated Enterprise: Autonomous Systems for Finance` | A different enterprise-finance product direction | Technical and business requirements; consumer budgeting is not sufficient evidence |

The Spacetime opportunity is confirmed by its [October 9 sponsor announcement](https://spacetimedb.com/blog/spacetime-at-calhacks).
The expanded review also verified second-through-fifth-place Apify use categories; their presence does not establish whether a project can combine them with other prizes.
Fetch's [event page](https://www.fetch.ai/events/calhacks-13-0) confirms participation, not the missing technical criteria.
Other listed Figma categories include Best Use Case of Figma and Most Creative; do not conflate them with the Agent categories.
CREAO's AI-First Disruptor, One-Person Company, and Team Empowerment categories are possible narratives only after their actual requirements and a suitable use case are confirmed.
No requirement from Convex's All Gas event, older Cal Hacks editions, or another WebMCP competition is imported here.

## 4. Convex should carry the difficult part of the product

### 4.1 Capability-to-evidence mapping

Convex documents automatic reactive query updates and transactional database operations; its query dependencies are not our agent's semantic dependencies. See [Realtime](https://docs.convex.dev/realtime) and [OCC and Atomicity](https://docs.convex.dev/database/advanced/occ).

| Product capability | Proposed Convex integration | Deployed proof | Demo moment |
|---|---|---|---|
| One shared task state | Queries over tenant-scoped task, plan, and command records | Two authenticated clients read the same committed revision | User edits while the agent view is open |
| Versioned personal context | Immutable fact revisions plus a current-version pointer | Event attendance and permanent household facts remain distinct | Reduce camping attendance to four and preserve equipment choices |
| Precise impact detection | Our dependency records indexed by resource and decision | Trace lists affected and unaffected decision IDs | Only dependent unfinished choices are flagged |
| Safe proposal publication | Mutation validates witnesses, `nodeRevision`, `planningAttemptId`, and `stopEpoch` | A stale patch cannot overwrite current choices; unrelated valid nodes survive | Release an old response after the user locks a replacement |
| Durable mission repair | Mutation writes change and schedules processing atomically | Change record and scheduled work share the committed outcome | Refresh while an authorized mission repairs the stock change |
| Shared purchasing capacity | Transactional reservations and confirmed-spend ledger | Camping and groceries cannot reserve the same available funds | Show the grocery reservation limiting camping's available capacity |
| Observable execution | Persistent browser commands, receipts, and workflow events | A command can be followed from issue to confirmed outcome | Reconnect the browser without repeating a confirmed effect |

These are implementation targets, not features already proven in this repository.
Use concrete table and function names that match the final code; the names below are a suggested contract.

### 4.2 Suggested records and indexes

| Record | Essential fields or relationships |
|---|---|
| `facts` / `factVersions` | Owner, fact key, revision, value, scope, source, effective interval, superseded version |
| `missions` / `decisions` | Owner, objective, `planningAttemptId`, `stopEpoch`, per-node `nodeRevision`, status, locks, completion boundary |
| `dependencies` | Decision ID, resource ID, observed version, relevant fields or predicate, dependency kind |
| `changeEvents` / `repairRequests` | Change ID, changed resource/version, authorized mission scope, grant references, processing state |
| `proposals` | `planningAttemptId`, affected `nodeRevision` witnesses, `stopEpoch`, dependency witnesses, patch, validation result |
| `browserCommands` / `receipts` | Command ID, node revision, stop epoch, fence token, grant, target origin, arguments digest, lease, idempotency key, outcome |
| `resourcePools` / `reservations` | Shared limit, confirmed spend, active reservations, mission and operation IDs, reconciliation state |

Index dependency lookup by owner/resource and commands by owner/status/target executor.
Do not scan every user's memories to repair one user's cart.
For a large graph, record a durable work item first and process the affected closure in bounded batches.
Do not keep an entire graph traversal inside one oversized transaction.
Persist the actual read dependencies used to construct a decision; a model-written explanation is not sufficient evidence of dependence.

### 4.3 A complete state-change path

1. `updateFact` authenticates the caller, records the event-scoped attendance change or stock observation, updates its current pointer, and writes a change event.
2. The same mutation records work for the active mission and schedules its processor.
3. The processor finds dependent unfinished decisions and classifies invalid, possibly affected, and unchanged work.
4. Continue revalidation and repair within the persistent mission's authority; ask only about unresolved scope/conflicts or effects beyond the current grant.
5. A repair worker reads the authorized scope, current facts, locks, completed effects, and shared resources into a versioned snapshot.
6. An action calls Gemini for the required reasoning; arithmetic, eligibility, and contract checks remain deterministic code.
7. `publishProposal` checks dependency witnesses, affected node revisions, the accepted planning attempt, and stop epoch before admitting the patch.
8. If relevant state moved, reject the stale patch and schedule fresh work within the remaining authorized scope; preserve unrelated valid nodes.
9. Dispatch valid commands within the existing effect grant, checking grant, node revision, stop epoch, fence, reservation, and domain preconditions again at commit; obtain new authority only when required.
10. Record receipts and fresh verification; update the task's completion state only when its declared outcome is supported.

Scheduling from a mutation is atomic with that mutation, whereas scheduling from an action is not part of one database transaction. This is why step 2 belongs in a mutation. See [Scheduled Functions](https://docs.convex.dev/scheduling/scheduled-functions).
Reactive queries update subscribers; they do not automatically start the business repair workflow.
Every relevant server-side write path must explicitly create the change/work records needed by the runtime.

### 4.4 OCC does not invalidate an old LLM plan for us

Suppose Gemini reads `camping.attendance@7 = 6`, then the user creates `camping.attendance@8 = 4` while the model is running.
A later mutation can successfully write the old model's proposal unless our application compares the proposal's recorded dependency against the current version.
Database OCC protects the reads and writes **inside that mutation**, not an earlier model call's unrecorded assumptions.
The publish/apply mutation must read the authoritative versions, compare witnesses, and reject stale intent before committing.
If another update races with that validation, Convex's transactional conflict handling protects the validation-plus-write boundary.
The combination is application-level freshness validation plus database atomicity, not one feature substituting for the other.
`planningAttemptId` admits a planning result, `nodeRevision` protects an individual decision, and `stopEpoch` handles mission cancellation; none is a user-global revision that discards every plan after one edit.
Use the same database guarantees in every evaluation baseline so the experiment measures the runtime rather than a deliberately weaker backend.

### 4.5 Workflow and the browser bridge

Use the [Convex Workflow component](https://github.com/convex/workflow) for durable coordination, step results, and waiting for external events.
Use [actions](https://docs.convex.dev/functions/actions) for model and external service calls, and mutations for authoritative checks and updates.
Configure action retry behavior explicitly; an external call that may have committed needs reconciliation before another attempt.
Keep workflow definitions stable across deployment or provide a migration/versioning strategy for in-flight work.

The browser subscribes to its pending commands, then calls a mutation to acquire a time-bounded lease.
The lease is coordination, not proof that a tool executed only once.
The executor checks the target origin and current tool contract, invokes the actual page's WebMCP tool, and submits a result tied to the command ID.
For a controlled shop, the tool handler calls a Convex mutation that rechecks the node revision, stop epoch, fence, effect grant, reservation, and domain preconditions, then atomically stores an idempotent effect and receipt.
For an external merchant, rely on its supported idempotency and outcome-query contract; otherwise mark uncertain outcomes for reconciliation.
If the browser disappears after a merchant commits but before returning a receipt, a timeout alone must not trigger blind replay.
The receipt mutation can signal the waiting workflow event using the matching workflow/command identity.
Browser shutdown pauses page execution; durable server state does not give a server access to a closed browser document.
Show `waiting for browser`, `waiting for user` with its actual scope/conflict/authority reason, and `outcome uncertain` as distinct statuses; ordinary authorized repair needs no new approval gate.
The browser integration must follow the current [WebMCP imperative API](https://developer.chrome.com/docs/ai/webmcp/imperative-api), not assume that arbitrary websites expose tools.

### 4.6 Deployment recommendation

Use Vercel for the React frontend and Convex for the backend, with development and production deployments kept separate.
Convex documents this hosting arrangement in its [Vercel deployment guide](https://docs.convex.dev/production/hosting/vercel).
Suggested sequence:

1. Finish the schema, authorization checks, generated API, and tenant-scoped seed/reset operation in development.
2. Register the Workflow component and deploy one vertical path before adding optional sponsor integrations.
3. Store the Gemini key and external-service credentials in backend environment configuration; never expose them in a public frontend variable.
4. Configure the frontend with its public Convex URL and the deployment pipeline with the correctly scoped deployment credential.
5. Follow the documented build command `npx convex deploy --cmd 'npm run build'`, adjusted to the project's actual package scripts.
6. Configure authentication for the real production origin and test a fresh session without a developer's existing cookies.
7. Deploy the WebMCP page, open it in the pinned supported browser, and verify discovery and execution from the actual agent host.
8. Run the two-client stale-plan and browser-reconnect demonstrations against the deployed environment.
9. Record the production URL, frontend commit, Convex deployment, tool schema version, model ID, and fixture version used for the video.

Use [Convex environment variables](https://docs.convex.dev/production/environment-variables) for backend configuration and keep preview credentials isolated from production.
The [Agent component](https://docs.convex.dev/agents/overview) is optional if its conversation/tool facilities reduce real implementation work; it is not a verified requirement of this track.
Do not add vector search, RAG, or another queue unless a demonstrated product requirement calls for it.

## 5. Gemini: demonstrate reasoning that changes the result

Gemini should interpret correction scope, distinguish enduring facts from one-time exceptions, and produce bounded repair proposals from the runtime's current snapshot.
It may select registered tools, but the host executes them and returns observations; a model's function-call output is not a completed WebMCP operation. See [Gemini function calling](https://ai.google.dev/gemini-api/docs/function-calling).
Record the exact model and API version actually available to the team rather than promising a particular model from an example.
Keep a provider abstraction so architecture experiments can compare models without redesigning the state layer.

| Capability | Real integration evidence | Demonstration | Confirmation needed |
|---|---|---|---|
| Change interpretation | Redacted request/response with model ID and parsed scope | Six campers become four for this event, without changing household identity | Eligible API/model and required sponsor proof |
| Local repair | Actual changed decision set and model call trace | Repair unavailable food; preserve two vegetarian guests' requirements, owned stove, purchased tent, and replacement lock | Whether additional submission fields apply |
| Optional receipt understanding | Actual image input and reviewed extraction | Purchased items stop appearing as items still needed | Whether multimodal use adds any rubric value |

Use deterministic totals, quantity checks, and resource predicates after model output validation.
Do not claim a fallback or replayed answer came from a live Gemini call.
If a fixture supplies the model response for reliability testing, label that run as controlled replay and keep a separate live-model demonstration.
Receipt understanding is optional; it should not delay the core correction-to-repair path.

## 6. Visa: a shopping product fit, not assumed API eligibility

The product story is a camping mission that stays valid through attendance and stock changes without losing personal decisions.
The outcome respects quantities, dietary constraints, the $300 cap, Friday arrival, existing equipment, completed purchases, and capacity shared with groceries; execution stays within the existing grant.
[Visa Intelligent Commerce](https://www.visa.com/en-us/solutions/intelligent-commerce) provides relevant agentic-commerce context, but does not establish which APIs or credentials this hackathon gives participants.

| Product capability | Proposed sponsor connection | Honest deployed proof | Pending confirmation |
|---|---|---|---|
| Maintain a shopping mission | Shopping theme using the same runtime | Camping basket repaired after attendance and stock changes, with preserved choices and shared-budget accounting | Is thematic alignment sufficient? |
| Prepare an authorized purchase | Integrate an explicitly available Visa interface only if required and accessible | Sandbox request, response, and verified status | Which API, access process, and test mode qualify? |
| Explain the financial effect | Deterministic basket comparison | Estimated amount and quantities with timestamps | Is payment required, or is planning/checkout preparation enough? |

Never describe a cheaper proposed basket as money actually saved or a simulated checkout as a real Visa transaction.
If access is unavailable, keep the shopping demonstration and label Visa eligibility unconfirmed; do not fabricate an integration.
Do not collect real card details for a demo merely to strengthen a sponsor narrative.

## 7. Alternatives should replace or justify a component

**Spacetime replaces Convex:** choose it if the team can demonstrate the same authoritative state, transaction, subscription, and recovery properties more reliably there.
Its [sponsor announcement](https://spacetimedb.com/blog/spacetime-at-calhacks) confirms an opportunity, not detailed qualification rules.
Reimplement dependency validation and browser command reconciliation explicitly; changing databases does not remove them.
Do not keep two authoritative copies of the task graph to enter two database tracks.

**Fetch.ai:** consider a runtime agent that actually discovers or coordinates a needed service; require a trace showing that the meaningful task crossed that integration.
**Elastic:** use the named Agent Builder on a Serverless instance only if retrieval or agent orchestration in that service is central; ordinary search elsewhere does not establish fit.
**Factory:** document the Droid SDK calls and the work they perform; ordinary use of an AI coding editor is not proof of SDK use.
**Figma:** preserve the actual design file or Agent workflow and connect its decisions to the shipped interface; distinguish design-quality and Agent-specific categories.
**Microsoft, CREAO, and Hyphenate:** change the target workflow only for a convincing user need, not to rename personal shopping as enterprise finance or customer impact.
These variants should reuse the product's behavioral contract and evidence protocol, and should proceed only after their real eligibility requirements are available.

## 8. One demonstration, several evidence views

| Time | User-visible story | Sponsor evidence available afterward |
|---|---|---|
| 0:00–0:25 | Show six-person camping, ≤$300, Friday arrival, two vegetarian guests, owned stove, purchased tent, and grocery pool usage | Persistent mission, effect grant, and real stored state |
| 0:25–0:55 | Two campers cancel; retain shared equipment choices and let the existing mission repair in scope | Gemini event-scope interpretation and authority trace |
| 0:55–1:25 | A food item goes out of stock; show affected nodes and preserved choices | Runtime dependencies and Convex-backed shared resources |
| 1:25–1:55 | Lock a replacement while an old response is pending; reject its stale patch | Node/attempt freshness validation plus transactional commit boundary |
| 1:55–2:30 | Continue authorized repair and bounded execution; reconcile a purchase whose reply is lost | Actual page tool execution, unknown outcome, and recovered receipt |
| 2:30–3:00 | Show verified remaining work, preserved commitments, and both missions' resource usage | Grounded quantities, costs, repair scope, and no duplicate purchase |

Keep the browser reconnect test and implementation trace ready for questions rather than forcing every infrastructure feature into the pitch.
If a controlled delay creates the stale-response scenario, disclose the injected delay; the state change and validation must still be real.
The Convex view emphasizes durable consistency, the Gemini view explains reasoning, and the Visa view explains the shopper's outcome.
None requires a separate product or an extra service added solely for its logo.

## 9. Organizer questions to resolve before claiming eligibility

1. Does the published no-prebuilt-project rule permit any independently developed reusable runtime? If so, what disclosure and new-work boundary are required?
2. What counts as permitted preparation: architecture documents, SDK tutorials, generic scaffolding, datasets, and account provisioning?
3. May one project enter multiple sponsor tracks, and are separate videos, repositories, forms, or deadlines required?
4. For Convex, is a deployed backend required, and are any particular components or cloud/self-hosting choices mandated?
5. For Gemini, which API products/models qualify, and what call evidence or credit registration is needed?
6. For Visa, what exact technical integration is required, how is access obtained, and are sandbox-only outcomes accepted?
7. For Spacetime, Fetch, Elastic, Factory, and Figma, which runtime or development-time activities qualify? For Apify, Coinbase, and Armadin, what hosted artifacts, test environments, or security scope are required?
8. What must remain accessible after judging, and how should supported-browser requirements, demo accounts, and private repositories be supplied?

These are prepared questions, not messages already sent or answers assumed.

## 10. Submission evidence and readiness gate

- A working HTTPS URL, a fresh-session entry path, and the exact supported browser/agent configuration.
- A repository judges can access, reproducible setup steps, dependency lockfile, and a clear account of pre-existing versus event work.
- A deployment manifest tying the demo to code, schema, fixture, model, and backend versions.
- A short architecture diagram identifying what Convex, Gemini, WebMCP, and any optional provider actually do.
- Redacted traces that connect a user request to dependencies, a proposal, actual tool execution, and verification.
- Fixed evaluation scenarios with comparable baselines on the same backend; keep custom tests and external benchmarks separately labeled.
- Separate labels for live provider calls, native WebMCP, adapters, seeded merchant data, simulated purchases, and prerecorded fallback material.
- A locally stored demo video plus the submission's requested video material, project image, and table information.
- Written answers to unresolved eligibility questions and a final list of only the tracks whose conditions the implementation meets.

The readiness threshold is a reproducible user outcome with inspectable evidence, not a maximum sponsor count.

## 11. Expanded product-to-track strategy

The [six-product portfolio](11-experiment-portfolio.md) broadens the product search. The same infrastructure can support different outcomes, but eligibility must follow the product actually implemented.

| Product | Primary technical use | What to show judges | What not to claim |
|---|---|---|---|
| [DataPatch](experiments/datapatch.md) | Convex tracks incidents and candidates; Factory SDK drives bounded diagnosis and code repair in a separate worker | An immutable failing input, real SDK call trace, candidate diff, and independently checked repaired output | A successful SDK turn is not proof that a data pipeline is correct |
| [Agent Crash Lab](experiments/agent-crash-lab.md) | Convex preserves experiment histories; Factory hosts the tested agent or a bounded repair worker | Reproducible fault schedule, effect history, minimized failure, and a rerun after the change | Simulator detection is not production prevention; reliability alone does not establish Armadin security fit |
| [LiveOps](experiments/liveops.md) | Convex state, transactions, and Workflow coordinate participants | Concurrent acceptance/withdrawal, current authority checks, valid revised assignments, and consistent live views | A reactive board alone is not an agent coordination result |
| [SupplyWatch](experiments/supplywatch.md) | Apify gathers source observations; Convex connects them to current demand and decisions | Actual Actor run and dataset IDs, provenance, normalization, affected orders, and constrained substitutes | Scraped observations are not guaranteed current inventory or permission to place orders |
| [SpendRail](experiments/spendrail.md) | Coinbase x402 pays for test services; Convex coordinates shared durable spending state | Real test-network exchange, reservation history, settlement evidence, and separate delivery verification | A simulation is not a protocol integration; generic spending limits are not new functionality |
| [CloseProof](experiments/closeproof.md) | Elastic Agent Builder on Serverless retrieves evidence and invokes deterministic reconciliation tools | Real Agent Builder execution, cited source records, computed difference, and unresolved-case handling | Elasticsearch alone is not the named Agent Builder integration; explanations are not audited accounts |

For Factory, use the [Droid Python SDK](https://docs.factory.com/sdk/python) or the appropriate supported SDK in the application runtime and preserve verifiable run metadata. Merely using a coding assistant to build the product is a separate activity whose eligibility must be confirmed.

For SpendRail, current [Coinbase client documentation](https://docs.cdp.coinbase.com/x402/buyer/client-configuration) already describes spending limits and reservation handling. The product must be judged against those existing capabilities, with any additional value demonstrated in durable cross-agent allocation or service-delivery reconciliation. Do not present the built-in controls as an invention.

For Armadin, a conditional Crash Lab variant could test whether an agent follows malicious tool-output instructions into a forbidden action against an owned test service. Scope the adversary, service, allowed tools, and forbidden outcome explicitly. A timeout-only demonstration belongs to reliability testing, even if its consequences would be serious.

CloseProof has a more direct finance workflow than personal shopping, so Hyphenate is a plausible thematic candidate. Its exact integration, autonomy, and business requirements still need confirmation. Keep the initial product read-only; an investigation does not require writing to the books or moving funds.

The existing work-timing and multi-track questions apply to all six directions. These documents prepare implementation and evidence plans; they do not establish any track's final eligibility.
