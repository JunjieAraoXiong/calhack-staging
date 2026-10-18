# Product Experiment Portfolio

The latest discussion expands the search beyond a personal shopping agent. **Convex is infrastructure; DataPatch, LiveOps, and the other candidates are products.** A backend choice does not decide the user problem or establish technical differentiation.

This document compares six additional directions and explains how to choose among them. The original personal-agent architecture remains a fully specified candidate, not a commitment to force every new product into shopping, WebMCP, or incremental planning. No experiment in this portfolio has been implemented or run.

## 1. Read the detailed designs

| Candidate | Intended user and outcome | Detailed design |
|---|---|---|
| DataPatch | A data engineer receives a validated repair for a broken or silently incorrect transformation | [DataPatch](experiments/datapatch.md) |
| Agent Crash Lab | An agent developer obtains a reproducible failure, minimal counterexample, and evidence that a change addresses it | [Agent Crash Lab](experiments/agent-crash-lab.md) |
| LiveOps | An event coordinator and volunteers reach a valid revised assignment after availability or resources change | [LiveOps](experiments/liveops.md) |
| SupplyWatch | A purchasing operator learns which demand is affected by supplier changes and receives feasible alternatives | [SupplyWatch](experiments/supplywatch.md) |
| SpendRail | An agent-platform operator controls shared paid-service spending and reconciles payment with delivery | [SpendRail](experiments/spendrail.md) |
| CloseProof | An operations analyst receives a traceable explanation of a mismatch between orders, payments, and settlements | [CloseProof](experiments/closeproof.md) |

These are proposed initial users. Interviews, adoption, and willingness to pay remain unvalidated. The detailed pages contain their own deployment paths, data contracts, evaluation plans, demos, and stopping criteria.

## 2. What is technically distinctive in each direction?

| Candidate | Mechanism worth building and evaluating | What would make it too shallow |
|---|---|---|
| DataPatch | Evidence-grounded diagnosis, bounded patch search, immutable data replay, semantic regression checks, and abstention under unresolved ambiguity | Send a traceback to a coding agent and display its patch |
| Agent Crash Lab | Explicit effect histories, controlled fault schedules, invariant checking, failure minimization, and held-out reproduction | Add random delays and show a red error badge |
| LiveOps | Constraint repair combined with versioned offers, participant responses, and atomic assignment admission under concurrent edits | A shared task board with a chatbot |
| SupplyWatch | Provenance-aware observations, entity and unit normalization, impact propagation, and constrained substitution under uncertain freshness | Scrape prices and summarize changes |
| SpendRail | Reservation accounting across agents, narrowly authorized signing, payment-status reconciliation, and independent service-delivery tracking | Add an x402 request to an agent loop |
| CloseProof | Deterministic reconciliation plus evidence retrieval, explicit competing explanations, calculation lineage, and calibrated abstention | Ask an LLM to explain a CSV mismatch |

None of these mechanisms is claimed to be globally novel. The technical claim must be narrow: a measured improvement over a strong alternative on a stated workload, or a demonstrated property within a tested system boundary.

## 3. Architecture selection follows the product

| Candidate | Proposed application state | Proposed execution/data plane | Model's useful role | WebMCP role |
|---|---|---|---|---|
| DataPatch | Convex incident, evidence, candidate, and review state | Factory SDK in an isolated worker; immutable input/output artifacts; Python transformations | Diagnose, choose evidence queries, propose bounded code changes | Optional: let an external assistant inspect incidents or request a validation run |
| Agent Crash Lab | Convex runs, event histories, verdicts, and experiment comparison | Controlled simulator, independent checker, optional Factory agent under test or repair worker | Agent under test, test proposal, or candidate fix; never sole correctness oracle | Optional adapter under test or external access to run evidence |
| LiveOps | Convex authoritative schedules, offers, acceptances, and resource revisions | Workflow coordination with a bounded solver and independent verifier | Optional language layer: interpret exceptions and explain alternatives after the deterministic path works | Useful if participants bring external personal assistants; not required for the internal agent |
| SupplyWatch | Convex normalized observations, demand, impact, and proposed substitutions | Apify Actors plus raw dataset artifacts; normalization and optimization worker | Resolve ambiguous descriptions, investigate evidence, explain alternatives | Optional review/approval interface; does not replace data collection |
| SpendRail | Convex grants, reservations, operation identities, and reconciliation state | x402 client, test resource servers, isolated signer and status observers | Choose useful paid resources subject to deterministic limits | Optional externally callable spending-status or bounded request interface |
| CloseProof | Case state in a chosen application store; Convex only if collaboration needs it | Elastic Agent Builder on Serverless, indexed evidence, deterministic Python matching/calculation | Investigate unresolved cases and explain cited evidence | Optional case-inspection surface; ordinary server tools are sufficient initially |

Convex is a strong proposed common foundation for the first five, but it is not mandatory for CloseProof's first read-only experiment. Elastic's search index is not automatically a transaction ledger, and a transaction database is not automatically an evidence retrieval system. Assign each store an explicit authority if both are used.

Factory's SDK is a runtime integration choice. Whether it can satisfy the desired workload, permissions, model configuration, and isolation must be demonstrated using actual SDK calls. A coding product used to develop the app is a different claim from a SDK integrated into the app.

## 4. Shared foundation, without building six products first

Reuse only the infrastructure the selected experiment actually needs:

- Authenticated ownership and clear workspace boundaries.
- Typed work requests, versioned input references, and persistent status.
- Stable operation identifiers and explicit handling of unknown outcomes where effects exist.
- Artifact references that bind results to exact data, code, tool, and model versions.
- An event trail connecting proposed actions with actual outcomes.
- An independent evaluation runner and a standard cost/latency envelope.

Keep domain logic separate. A data-pipeline patch, a volunteer acceptance, and a payment authorization are not interchangeable operations merely because all can be called a task. They need different validity predicates, authorities, and final-state scorers.

Large data files, worker stdout, and binary artifacts belong in appropriate artifact storage, with metadata and hashes in the control store. Python execution and heavy solver work run in a separate worker. Do not send an entire dataset or every event to a model when a targeted evidence query is enough.

Implement one thin vertical path, then extract proven common code if a second experiment needs it. Designing a universal agent framework before choosing a product delays the most valuable evidence.

## 5. Which directions to explore first

Assuming the stated interest in agent, backend, and data engineering, the recommended discovery order is **DataPatch, LiveOps, then SupplyWatch**. This is a qualitative research priority, not a measured ranking or estimate of winning probability.

| Priority | Candidate | Why it deserves an early test | Evidence that would change the priority |
|---|---|---|---|
| First | DataPatch | Directly tests code-plus-data reasoning; semantic correctness can be checked on hidden inputs; a failing-to-correct replay is visible | A same-budget coding agent with the same evidence and tests performs equally well, or realistic ground truth cannot be obtained |
| Second | LiveOps | Shared state, ongoing human input, and coordination are natural reasons to use Convex; product behavior is easy to observe | A deterministic scheduling UI solves the problem as well with fewer interactions, or meaningful participant workflows cannot be tested |
| Third | SupplyWatch | Data acquisition has a real product purpose and Apify integration can be demonstrated | Matching and source access consume the effort while alternatives remain untrustworthy |
| Conditional alternative | Agent Crash Lab | Strongest when the team wants a developer tool and can obtain multiple agents/adapters to test | It only catches intentionally broken toy implementations or cannot minimize/reproduce failures |
| Conditional alternative | SpendRail | Strong when actual x402 access and reconciliation semantics are available early | It only duplicates existing SDK spending controls or lacks trustworthy payment/status evidence |
| Conditional alternative | CloseProof | Strong when realistic reconciliation records and independently labeled discrepancies are available | Native processor reports plus deterministic joins already solve the work, or ambiguity is forced into unsupported answers |

The original personal-agent runtime remains the strongest continuity choice if personal agency itself is the primary objective. LiveOps is closest to its ongoing coordination mechanisms; SpendRail can become a bounded subsystem; Crash Lab can evaluate it. Those relationships do not require merging the products into one submission.

The [current Coinbase client](https://docs.cdp.coinbase.com/x402/buyer/client-configuration) already provides per-payment and cumulative limits, network restrictions, and reservation handling for uncertain settlement. SpendRail therefore needs a narrower additional claim, such as persistent coordination across agents and independent delivery reconciliation, evaluated against those existing controls.

## 6. Minimum decisive experiments

The point of a first experiment is to remove uncertainty, not maximize the number of tools connected. Each detailed design specifies its own proposed scenario counts and freeze rules. The shopping protocol's 432 planned episodes do not apply automatically to this portfolio.

| Candidate | First concrete artifact | Strong comparison | Main question |
|---|---|---|---|
| DataPatch | One pipeline incident with visible failure, a plausible wrong patch, and independent semantic/regression checks | Same Factory model/SDK, repository, evidence access, visible tests, and resource budget | Does the diagnosis-and-validation loop improve correct repairs rather than merely visible test passes? |
| Agent Crash Lab | A recorded request/commit/response history with a lost reply and a minimized failing schedule | A tuned retry test suite and equivalent fault-search budget | Can the lab find and reproduce a defect the comparison misses, with a correct independent verdict? |
| LiveOps | A schedule with concurrent withdrawal and acceptance affecting scarce skills or rooms | Deterministic scheduler plus the same UI, events, and participant-response policy | Does the agent reach a valid accepted arrangement with less coordination work? |
| SupplyWatch | Fixed supplier snapshots with unit changes, stale fields, and known affected demand | Full deterministic recomputation with the same normalized inputs, objective, solver, and freshness checks; separate matching baselines | Are changed facts, impacted orders, and alternatives correct without silently treating unknowns as facts? |
| SpendRail | Two agents, one cap, one paid test resource, and an uncertain settlement or delivery | Ordinary shared-budget gateway with equivalent protocol access | Does reconciliation preserve obligations and avoid repeated payment/delivery errors under the tested contract? |
| CloseProof | One discrepancy that has a numerical explanation and one genuinely unresolved case | Native processor reports plus deterministic joins, and an equivalent retrieval-enabled LLM | Can the system show the correct amount and evidence chain, and decline the unresolved explanation? |

For DataPatch, compare accepted repairs and abstentions separately. For Crash Lab, count discovered defects only when independently confirmed. For LiveOps, include human burden. For SupplyWatch, score upstream matching errors independently from recommendation errors. For SpendRail, distinguish unsafe attempts from committed effects. For CloseProof, score factual and arithmetic validity separately from fluent wording.

## 7. Common experimental discipline

Use development fixtures to tune the baseline and candidate. Freeze a separate holdout with independent truths before comparison. Give competitors the same relevant information, tools, permissions, and budgets. A richer automatically constructed context can be a product feature, but test it as a separate ablation rather than hiding an information disadvantage in the baseline.

Report cost and latency across unsuccessful attempts, retries, verification, and cleanup. Do not claim improvement from excluding timeouts. Preserve every episode and report how often the intended fault or decision opportunity was actually reached.

Each product needs its own outcome metric. A shared dashboard can display separate measures; it cannot meaningfully average dollars reconciled, rows repaired, and volunteers assigned into one universal agent score. Likewise, do not rank these concepts by hypothetical percentages presented as results.

The earlier [evaluation protocol](06-evaluation-and-experiments.md) supplies principles about fair comparisons, hidden ground truth, and trace accounting. Its domain-specific fixtures and sample counts remain specific to the personal-agent branch.

## 8. Sponsor strategy by product

Track names have been checked against the [current Cal Hacks page](https://cal-hacks-13-0.devpost.com/). The existence of a track does not establish that our planned implementation qualifies. Full wording and unresolved requirements belong in [07](07-sponsor-track-strategy.md).

| Candidate | Most natural track targets | Minimum substantive integration evidence |
|---|---|---|
| DataPatch | Convex; Factory Droid SDK | Persistent incident/repair state and real SDK-driven patch/validation runs bound to artifacts |
| Agent Crash Lab | Convex; Factory Droid SDK; Armadin only for a security variant | Inspectable histories and SDK agent behavior; a security entry also needs a genuine tested threat boundary |
| LiveOps | Convex | Multiple authenticated clients, durable coordination, and transactional admission of conflicting responses |
| SupplyWatch | Apify; Convex | Actual Actor run/dataset provenance linked to normalized observations and affected business demand |
| SpendRail | Coinbase x402; Convex | Real test-protocol requests and reconciliation evidence, clearly separated from simulated payment cases |
| CloseProof | Elastic Agent Builder on Serverless; Hyphenate conditionally | Actual Agent Builder tools over indexed records, deterministic evidence calculations, and a finance workflow that meets the sponsor's criteria |

Armadin's named track is Best Security Hack. Reliability failures such as delays or retries are not automatically security attacks. An optional security-focused Crash Lab needs an explicit adversary, authorized test target, forbidden effect, and independently checked outcome.

Apify has both use-of-Apify categories and a named Best Actor category. A functioning custom Actor may be relevant to the latter, but its presence does not establish category eligibility. Coinbase's named track is specifically x402; a generic spending counter does not demonstrate that integration. Elastic's named track specifically mentions Agent Builder on a Serverless instance; ordinary Elasticsearch usage alone is insufficient evidence of the named technology.

## 9. A deployment path for each experiment

Use a local development environment first, an isolated integration deployment second, and a reproducible demonstration environment third. A deployed frontend alone is not a complete system: verify the worker, service credentials, callback/reconciliation path, persistent artifacts, and fresh-user access that the product actually requires.

| Candidate | Smallest deployment that proves the product path | External dependency to resolve early |
|---|---|---|
| DataPatch | React interface + Convex + one isolated Factory/Python worker + artifact store | SDK access, executable runtime, controlled input artifacts |
| Agent Crash Lab | React/Convex run viewer + isolated simulator/checker worker + one real agent adapter | Agent runtime access and observable effect contract |
| LiveOps | React/Convex workspace + Workflow + bounded solver/verifier; language interpretation added only after the deterministic comparison | Participant identity and a reproducible two-client test |
| SupplyWatch | Apify Actor + dataset ingestion + Convex + normalization/planning worker + React | Approved source access and observable collection freshness |
| SpendRail | React/Convex control surface + constrained signer/client + paid test server + observer | Supported test network, protocol version, wallet custody, and status visibility |
| CloseProof | Elastic Serverless project with Agent Builder + calculator worker + read-only case UI | Agent Builder access and realistic, permitted evidence data |

Each candidate's detailed page separates simulator evidence from real provider integration. If external access blocks an integration, retain a clearly labeled fixture demo rather than claiming sponsor technology was exercised.

## 10. What to choose after the first round

Promote one direction only when it has: a specific user problem; accessible input data; a working vertical path; a useful measured result against a strong comparison; and a credible three-minute explanation of the outcome.

If several qualify, choose based on the team's desired product and evidence quality, then consider sponsor fit. Do not keep six parallel implementations alive to avoid making that choice. The next decision is which minimum experiment to implement, not which six integrations to deploy at once.

Research and design remain distinct from eligible hackathon implementation. The existing [event timing caveat](07-sponsor-track-strategy.md) applies to every candidate. This exploration neither resolves that question nor authorizes external messages, live payments, or production changes.
