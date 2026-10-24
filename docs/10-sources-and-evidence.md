# Sources and Evidence Register

**October 22 travel extension:** [travel research](../exa-results/travel-personal-agent-2026-10-22.md), with [consumer-product](../exa-results/notes-consumer-products.md), [execution-competitor](../exa-results/notes-execution-competitors.md), [local-workflow](../exa-results/notes-local-workflows.md), and [platform/access](../exa-results/notes-platforms-demand-and-access.md) evidence, informs the active [travel design](16-travel-agent-system-design.md). The research screened 178 Exa result slots across four workstreams, including duplicates; provider claims were not authenticated product trials. All fixture prices, inventory, hotel rules, and flight events in design 16 are synthetic. No application outcomes or measured advantages are established by that research.

Review date: **October 17, 2026, America/Los_Angeles**. This register records sources consulted during the discussion and this documentation pass. It is not a mirror of the pages or a promise that event requirements and preview APIs will remain unchanged. Recheck relevant current documentation when implementing or submitting.

## 1. Evidence categories

| Label | Meaning in this package |
|---|---|
| Source-confirmed | The linked primary source supports the stated fact within its scope |
| Author-described | A project author describes a capability; we have not independently run or audited it |
| Proposed | A design or implementation choice for our product |
| Hypothesis | A comparative claim requiring experiments |
| Measured | A claim backed by our actual run artifacts; none exists yet |
| Historical award verified | An event-linked award record or sponsor announcement supports the named recognition; this does not validate the project's performance or explain judging decisions |
| Unconfirmed requirement | A sponsor or event condition requiring additional current evidence |

The research used official platform documentation, current event pages, original papers and repositories, and project-author submissions. Product overlap findings are directional, not an exhaustive patent, novelty, or market analysis. None establishes a probability of winning.

## 2. Event and sponsor sources

| Source | What it supports | What it does not establish |
|---|---|---|
| [Cal Hacks 13.0 Devpost](https://cal-hacks-13-0.devpost.com/) | Current named tracks, listed judging dimensions, submission materials, pitch format, and work-timing language | Detailed unpublished sponsor rubrics, judging weights, or an exception for our prebuilt implementation |
| [Cal Hacks homepage and FAQ](https://www.calhacks.io/) | Advance ideation versus event implementation boundary and the FAQ's existing-project restriction | Eligibility of a particular shared runtime or any exception not explicitly granted |
| [Cal Hacks Devpost rules](https://cal-hacks-13-0.devpost.com/rules) | Published event rules at review time | Permission inferred from unrelated sponsor contests |
| [MLH Cal Hacks 13.0 event listing](https://www.mlh.com/events/cal-hacks-13-0) | Event context and listed Gemini opportunity | The exact models, account setup, or evidence accepted for our submission |
| [Spacetime at CalHacks, October 9](https://spacetimedb.com/blog/spacetime-at-calhacks) | Sponsor announcement and its prize opportunity for use of Spacetime | Full eligibility terms or a reason to maintain two authoritative databases |
| [Fetch.ai CalHacks 13.0 event page](https://www.fetch.ai/events/calhacks-13-0) | Current participation context | Carryover of older Cal Hacks SDK or registration requirements |
| [Visa Intelligent Commerce](https://www.visa.com/en-us/solutions/intelligent-commerce) | Relevant official agentic-commerce product context | Which Visa API, access process, payment mode, or sandbox is required at Cal Hacks |

Devpost's main page could not be retrieved by the web extraction tool during this pass; its HTML was fetched directly and parsed for the relevant current text. That retrieval difference does not make missing requirements known.

The event lists Application, Intentionality, Functionality, Creativity, and Technical Complexity without published weights in the reviewed material. Our emphasis on a visible user outcome, technical correctness, and credible evaluation is a strategy recommendation, not a derived scoring formula.

The sponsor-specific interpretation and exact verified track names are maintained in [07](07-sponsor-track-strategy.md). No requirements from Convex's separate All Gas contest, an earlier Cal Hacks edition, or the separate WebMCP competition are imported into this event.

## 3. WebMCP and browser execution

| Source | Supported use in the design | Boundary |
|---|---|---|
| [Chrome WebMCP overview](https://developer.chrome.com/docs/ai/webmcp) | Browser-facing tool interface and platform context | Not a universal website adapter, model, or persistent backend agent |
| [Chrome imperative API documentation](https://developer.chrome.com/docs/ai/webmcp/imperative-api) | Current registration, discovery, invocation, tool exposure, and cancellation interfaces | Preview behavior must be pinned and tested; a cancellation signal does not establish rollback |
| [WebMCP draft specification](https://webmachinelearning.github.io/webmcp/) | Proposed standard concepts and interface semantics | A draft is not evidence of universal browser support or final stability |
| [GoogleChromeLabs WebMCP extension](https://github.com/GoogleChromeLabs/webmcp-extension) | A concrete example of a browser agent host and integration requirements | We have not installed it or validated its suitability for our final deployment |
| [Page-agent demo](https://github.com/GoogleChromeLabs/webmcp-tools/tree/main/demos/page-agent) | Example host and polyfill integration to inspect | A polyfilled demonstration is not automatically native API support |
| [WebMCP evaluation examples](https://github.com/GoogleChromeLabs/webmcp-tools/tree/main/webmcp-evals) | Existing evaluation tooling and examples | Not measured results for our application or runtime |

The reviewed Chrome imperative API uses `document.modelContext` registration, discovery, and execution methods. Examples must follow the exact pinned version rather than mixing APIs from different drafts. Tool discovery is scoped by document/origin exposure. Tool availability changes and business data changes are different events: `toolchange` does not replace inventory, budget, or user-edit notifications.

Our adapter metadata for reads, writes, preconditions, idempotency, and outcome queries is an application contract we propose to build. It must not be advertised as semantic guarantees supplied by WebMCP alone.

## 4. Convex and durable coordination

| Source | Supported use in the design | Boundary |
|---|---|---|
| [Realtime](https://docs.convex.dev/realtime) | Reactive queries and synchronized client views | Query subscriptions do not constitute our durable business event log or semantic dependency engine |
| [OCC and atomicity](https://docs.convex.dev/database/advanced/occ) | Transactional mutation behavior and conflict handling | The database does not automatically validate assumptions from an earlier LLM call |
| [Scheduled functions](https://docs.convex.dev/scheduling/scheduled-functions) | Scheduling from a mutation can share its atomic boundary | A scheduled external action is not an exactly-once external business effect |
| [Actions](https://docs.convex.dev/functions/actions) | Calls to external services such as model providers | External side effects do not become database transactions |
| [Function runtimes](https://docs.convex.dev/functions/runtimes) | Supported backend execution environments | Do not assume a Python solver can execute inside a JavaScript/TypeScript function runtime |
| [Running WebAssembly](https://docs.convex.dev/functions/runtimes#running-webassembly) | Imported WASM can implement bounded computation inside TypeScript function entrypoints, including a mutation | Does not provide native Rust function deployment or a documented general WASI environment |
| [Convex limits](https://docs.convex.dev/production/state/limits) | Resource constraints for selecting in-function computation versus an external worker | Actual artifacts and workloads must be measured; WASM does not bypass the limits |
| [Convex Rust client](https://docs.convex.dev/client/rust) | A connection path for a native Rust worker | A client SDK is not a server function runtime |
| [Rust WASM target](https://doc.rust-lang.org/rustc/platform-support/wasm32-unknown-unknown.html) | Target constraints for a pure Rust kernel | OS-dependent libraries and generated glue are not automatically compatible with the browser or Convex |
| [Workflow component repository](https://github.com/convex/workflow) | Durable workflow composition, step persistence, waits, and retry configuration | Not a transaction spanning external merchants; retries require effect-aware handling |
| [Workflow component overview](https://www.convex.dev/components/workflow) | Component integration and use cases | Does not prove our controller or in-flight schema migrations are correct |
| [Agent overview](https://docs.convex.dev/agents/overview) | Optional conversation, tools, and agent facilities | Conversation storage does not replace authoritative facts, grants, orders, or resource ledgers |
| [Agent workflows](https://docs.convex.dev/agents/workflows) | Workflow orchestration and persisted step behavior | A historical step result should not be mistaken for a fresh observation after a world change |
| [Component transactions](https://docs.convex.dev/components/using#transactions) | Transactional relationships between top-level and component mutations | An external action remains outside that atomic boundary |
| [Authentication in functions](https://docs.convex.dev/auth/functions-auth) | Server-side identity checks | Client-supplied owner IDs or scheduling alone do not establish authorization |
| [Vercel deployment](https://docs.convex.dev/production/hosting/vercel) | Supported frontend/backend deployment workflow | No deployment has been performed by creating this package |
| [Environment variables](https://docs.convex.dev/production/environment-variables) | Backend configuration of credentials and environment-specific values | Secrets should not be exposed in frontend configuration or trace exports |

The core application-specific requirements remain explicit witness validation, reservation admission, operation identity, source-side enforcement, and receipt reconciliation. All comparison systems receive the same Convex infrastructure so its benefits are not falsely attributed to incremental planning.

## 5. Models, planning, and prior research

| Source | Relevance | Evidence limit |
|---|---|---|
| [Gemini function calling](https://ai.google.dev/gemini-api/docs/function-calling) | Structured tool requests and the host's execution loop | A model requesting a function does not mean the function ran or the user objective succeeded |
| [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) | Useful distinctions between workflows, routing, and agentic choices | Engineering guidance, not comparative evidence for our chosen architecture |
| [OR-Tools CP-SAT solver](https://developers.google.com/optimization/cp/cp_solver) | Solver status and constrained optimization integration | `FEASIBLE` is not `OPTIMAL`; `UNKNOWN` is not proof of infeasibility |
| [ReAct](https://arxiv.org/abs/2210.03629) | Established reasoning-and-action approach relevant to a baseline | Our tuned implementation must be described; a deliberately weak agent is not a fair baseline |
| [Adapton](https://matthewhammer.org/adapton/adapton-pldi2014.pdf) | Incremental computation and dependency-based reuse precedent | Does not establish agent-task gains or sound semantic dependency capture for our product |
| [HyperAgent](https://arxiv.org/abs/2608.02650) | Tool-schema graph/hypergraph planning and execution prior art | We have not reproduced its results; dependency graphs alone are not our novelty claim |
| [ToolMaze](https://arxiv.org/abs/2606.05806) | Tool-failure recovery and topology-aware scenarios | Not direct evidence of concurrent browser transaction correctness |
| [ToolMaze implementation](https://github.com/Zhudongsheng75/ToolMaze) | Source-level inspection of its environment and fault mechanics | An adapted task must be labeled; hidden paths and future faults must not become agent inputs |
| [tau-bench](https://arxiv.org/abs/2406.12045) | Final-state evaluation and repeated-run reliability as useful precedents | Our custom fixtures are not official tau-bench scores |

ToolMaze source inspection informed the distinction between sequential tool-result perturbations and the publication/commit races we need to evaluate. Its use would be supplementary; our claims about shared resources, late receipts, and stale publication require dedicated independent assertions.

We have not run these papers' benchmarks, reproduced their reported results, trained a decision model, or established that our proposed approach surpasses them.

## 6. Project landscape

These are project-author descriptions from the separate WebMCP project landscape. They informed product selection and caution about overlap. They are not independent capability audits and do not establish current Cal Hacks submission rules.

| Source | Overlap that matters to our decision |
|---|---|
| [WebMCP project gallery](https://webmcp.devpost.com/project-gallery) | Broad discovery source for existing project directions |
| [Runline](https://devpost.com/software/runline) | Schedule repair, preserving choices, and change handling |
| [Aisle](https://devpost.com/software/aisle-ai-wedding-seating) | Constraint-driven event planning and seating |
| [Waggle](https://devpost.com/software/waggle-webmcp) | Shared project memory with human-approved corrections, supersession lineage, and fingerprint checks against stale proposals |
| [Recall](https://devpost.com/software/recall-user-controlled-ai-memory) | User-controlled memory as an existing product theme |
| [Concord](https://devpost.com/software/concord-an-agent-that-cannot-overpromise) | Transaction boundaries, recovery, and cross-application commitments |
| [ProofDone](https://devpost.com/software/proofdone) | Verified outcomes and checking whether execution conditions remain valid |
| [Accessible Action Mode: Returns & Exchanges](https://devpost.com/software/accessible-action-mode-returns-exchanges) | Returns/exchanges workflows and distinctions between local execution and connected-system access |

The resulting recommendation is narrower than claiming a new category: build and evaluate a personal-task runtime whose incremental strategy is useful under stated conditions. Any future competitive claim should compare the actual capability in question, not dismiss other projects based on a short gallery description.

## 7. Internal research history

- [Research protocol](../research/RESEARCH_PROTOCOL.md): goals and evidence discipline.
- [Evidence notes](../research/EVIDENCE.md): gathered facts and qualifications.
- [Research log](../research/RESEARCH_LOG.md): evolution of the investigation.
- [Original landscape synthesis](../research/CALHACKS_WEBMCP_RESEARCH_ZH.md): earlier research summary, translated into English.
- [Original sponsor analysis](../research/SPONSOR_FIT_ZH.md): earlier track-fit discussion.
- [Technical runtime and evaluation notes](../research/TECHNICAL_RUNTIME_EVAL_ZH.md): technical thesis development.
- [Personal-agent system notes](../research/PERSONAL_AGENT_SYSTEM_ZH.md): system and decision-model discussion.

The `docs/` package is the current consolidated recommendation. All research notes are now in English; legacy `_ZH` filenames are retained to preserve links. Earlier notes may contain explored alternatives or superseded assumptions; consult [09](09-decisions-and-open-questions.md) for their current status.

## 8. Claims we can and cannot currently make

We can say that the package proposes a concrete architecture, identifies implementation contracts, compares alternatives, specifies evaluation, and maps current source-confirmed sponsor opportunities to observable integrations.

We cannot yet say that the product is deployed, that its recovery works, that incremental repair saves tokens or time, that a custom decision model is better, that users save money, or that the entry qualifies for a particular prize. Those claims require implementation artifacts, actual experiments, user evidence, or the relevant eligibility confirmation.

## 9. Expanded experiment portfolio sources

The six directions in [11](11-experiment-portfolio.md) were added after the original personal-agent package. Their named APIs and source claims were checked against primary documentation during this pass. The product designs remain proposals.

| Source | Supported use | Boundary |
|---|---|---|
| [Factory Droid Python SDK](https://docs.factory.com/sdk/python) | A real application integration with the local Droid runtime, configurable sessions, tools, and structured results | SDK permission controls do not by themselves isolate hostile transformation code; installed runtime and account access remain untested |
| [pandas merge](https://pandas.pydata.org/docs/reference/api/pandas.merge.html) | Join semantics and validation features relevant to DataPatch's tests | A valid join invocation does not establish correct business identity or aggregation |
| [Pandera DataFrame schemas](https://pandera.readthedocs.io/en/stable/dataframe_schemas.html) | Declared data validation | Cannot infer an absent semantic contract or prove a repair on unseen data |
| [gVisor documentation](https://gvisor.dev/docs/) | A possible stronger execution isolation layer for worker workloads | Compatibility and the selected deployment's actual isolation require testing |
| [Porcupine](https://github.com/anishathalye/porcupine) | Executable-model linearizability checking for concurrent histories | A legal object history may still violate the agent's higher-level intent |
| [Jepsen linearizability](https://jepsen.io/consistency/models/linearizable) | Scope and meaning of the consistency model used by Crash Lab | Does not imply global transactions or exactly-once agent behavior |
| [AWS retry-safe APIs](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/) | Request identity and idempotent service design | These contracts must actually exist at the tested service boundary |
| [OR-Tools employee scheduling](https://developers.google.com/optimization/scheduling/employee_scheduling) | Assignment modeling relevant to LiveOps | Does not provide participant consent or prove the value of model-assisted coordination |
| [Apify Actors](https://docs.apify.com/actors) | Deployable acquisition and processing programs | Actor success does not certify extraction accuracy or source freshness |
| [Apify datasets](https://docs.apify.com/storage/dataset) | Structured result storage | The application must preserve the provenance and retention needed for reproducibility |
| [Apify webhook actions](https://docs.apify.com/integrations/webhooks/actions) | Delivery configuration and retry behavior | Consumer ingestion needs idempotency and authenticity checks |
| [Apify webhook events](https://docs.apify.com/integrations/webhooks/events) | Run lifecycle events | Missing rows after a failed run are not evidence of absent stock |
| [Apify run metadata](https://docs.apify.com/api/v2/actor-run-get) | Inspection of the run that produced observations | A dataset item must still be interpreted and normalized correctly |
| [Coinbase x402 overview](https://docs.cdp.coinbase.com/x402/welcome) | Payment protocol and product context | Protocol use alone does not establish a new spending-control product |
| [Coinbase x402 client configuration](https://docs.cdp.coinbase.com/x402/buyer/client-configuration) | Existing SDK spending limits and uncertain-settlement reservation behavior | These are baseline capabilities, not SpendRail inventions; service delivery needs its own evidence |
| [How x402 works](https://docs.cdp.coinbase.com/x402/how-it-works) | Documented relationship between verification, service work, and settlement | Payment state, production of an output, and delivery to the requester must be tracked separately |
| [x402 buyer quickstart](https://docs.cdp.coinbase.com/x402/buyer/quickstart) | Supported test integration setup and environment selection | The prototype must explicitly pin its intended test environment rather than rely on defaults |
| [CDP facilitator](https://docs.cdp.coinbase.com/x402/seller/facilitator) | Facilitator role and integration details | Fee responsibility and finality must be checked for the selected scheme and version |
| [Elastic Agent Builder setup](https://www.elastic.co/docs/explore-analyze/ai-features/agent-builder/get-started) | Actual feature setup and Serverless access requirements | Account tier, available models, cost, and runtime integration remain untested here |
| [Elastic ES\|QL tools](https://www.elastic.co/docs/explore-analyze/ai-features/agent-builder/tools/esql-tools) | Parameterized evidence retrieval for the proposed CloseProof agent | Search results alone do not establish complete financial evidence or correct reconciliation |
| [Elastic Agent Builder permissions](https://www.elastic.co/docs/explore-analyze/ai-features/agent-builder/permissions) | Feature and data access controls | A tenant identifier in a prompt does not enforce isolation |
| [Elastic programmatic access](https://www.elastic.co/docs/explore-analyze/ai-features/agent-builder/programmatic-access) | Integration of Agent Builder with a separate application | A mocked chat is not proof of these interfaces being used |
| [Stripe payout reconciliation](https://docs.stripe.com/reports/payout-reconciliation) | Existing report capabilities and payout context; a strong CloseProof comparison | CloseProof must add useful cross-source investigation rather than rebrand a native report |
| [Stripe balance transaction fields](https://docs.stripe.com/api/balance_transactions/object) | Processor-specific signed amount, fee, and net fields | Not a universal schema for other providers or an assumption that all exports are complete |
| [Stripe refunds](https://docs.stripe.com/refunds) | Refund statuses and lifecycle distinctions | A refund request alone does not establish every resulting financial or bank event |

The current event page was re-fetched for the expanded portfolio. It confirms the additional Apify, Coinbase x402, and Armadin track names now listed in [07](07-sponsor-track-strategy.md). Technical documentation establishes capabilities; only the event's actual requirements can establish eligibility.

Each product page also maintains sources closest to its technical claims, including additional x402 and Elastic references. No live source collection, SDK run, payment, attack, or benchmark execution was performed to write these documents.

## 10. Historical Cal Hacks award recipients

The [past-project review](13-past-cal-hacks-projects.md) contains 13 selected cases, direct project links, exact recognition, bounded author-described mechanisms, and our proposed design implications. It covers the numbered 2023–2025 Cal Hacks events, not the separate Berkeley AI Hackathon. No historical application or benchmark was run.

| Source | What it supports | Boundary |
|---|---|---|
| [10.0 gallery](https://cal-hacks-10.devpost.com/project-gallery), [11.0 gallery](https://cal-hacks-11-0.devpost.com/project-gallery), [12.0 gallery](https://cal-hacks-12-0.devpost.com/project-gallery) | Event-specific discovery; each selected project's linked award section establishes its listed recognition | A generic winner badge does not establish placement; the selection is not a complete census |
| [Elastic's 12.0 retrospective](https://www.elastic.co/search-labs/blog/agent-builder-projects-learnings-cal-hacks-12-0) | Sponsor confirmation of AgentOverflow's first place and its described integration | Not independent repair correctness or current eligibility |
| [Nexus institutional report](https://engineering.oregonstate.edu/all-stories/oregon-state-team-wins-top-prize-cal-hacks-competition) | Corroboration of first overall at 10.0 | Does not establish why judges selected it |
| [FaceTimeOS author retrospective](https://blog.dylanlu.com/cal-hacks-12/) | Author-disclosed implementation and demonstration constraints | Later account, not an independent execution audit |
| [Duck Duck Goose repository](https://github.com/KevinL10/applovin-query) | Inspectable planner description, benchmark interface, and development-validation process | Published measurements were not reproduced; the original challenge contract was not retrieved |
| [Duck Duck Goose comparison code](https://raw.githubusercontent.com/KevinL10/applovin-query/main/benchmark/run.py) | Direct inspection of numeric normalization and set-based row comparison | Adequacy depends on the task's output semantics; this is not evidence of an erroneous judging result |

Project pages can be updated after an event. The review separates recorded awards, current author descriptions, and our inferences, and does not treat any of them as proof of our novelty, user demand, or chance of winning.

## 11. Personal-agent ecosystem extension — October 18, 2026

The [system comparison](14-personal-agent-system-variations.md) and [persistent runtime extension](15-persistent-agent-runtime-design.md) draw on three separately assigned source reviews:

| Review | Sources and evidence boundary |
|---|---|
| [Commerce and protocols](research/personal-agents-commerce-and-protocols.md) | Stripe/Link and Sierra/PAP announcements, operational guides, and a pinned PAP draft; distinguishes documented contracts from actual enrollment and conformance |
| [Harness and experience](research/personal-agents-harness-and-experience.md) | Decagon/PACT, Profound's observational article, and their public docs; consumer-agent observations do not establish private implementation details |
| [Social and reference architecture](research/personal-agents-social-and-reference-architecture.md) | Exact supplied X posts, qualified retrieval evidence, and the supplied image; reverse engineering and a diagram are not an official implementation specification |

Important new source boundaries: [PAP Operations](https://personalagentprotocol.org/docs/extensions/operations) overlaps with previously discussed operation lifecycle features; [PACT](https://openpactprotocol.org/spec) is a separate protocol, not another name for PAP; [Link](https://docs.stripe.com/agentic-commerce/agents/link-agent-wallet) has its own access and payment-approval requirements. The detailed notes contain the supporting links and version/access qualifications.

The [E2B lifecycle](https://docs.e2b.dev/sandbox) and [persistence](https://docs.e2b.dev/sandbox/persistence) docs support considering a leased execution environment. They do not establish our task durability, external-effect guarantees, or Instinct's internal deployment. Current [Convex scheduling](https://docs.convex.dev/scheduling/scheduled-functions) and [Workflow](https://docs.convex.dev/agents/workflows) documentation was also checked for the persistent extension.

This remains literature and design research. No model benchmark, wallet transaction, protocol conformance test, sandbox integration, messaging setup, or new sponsor eligibility verification was performed.
