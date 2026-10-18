# Past Cal Hacks Projects: Relevant Precedents and Design Implications

**Reviewed:** October 17, 2026, America/Los_Angeles. **Scope:** selected projects from Cal Hacks 10.0 (2023), 11.0 (2024), and 12.0 (2025). This is research for our scope discussion, not a product selection or an implementation.

The most useful combination for our current interests is **merj's narrow repair workflow, Duck Duck Goose's inspectable optimization and evaluation machinery, and FaceTimeOS's immediately understandable interaction**. That is our design interpretation, not a formula for winning. For Convex specifically, Nexus supplies a concrete precedent for a shared application whose backend serves the central user interaction.

Read with the [experiment portfolio](11-experiment-portfolio.md), [evaluation protocol](06-evaluation-and-experiments.md), and [current sponsor strategy](07-sponsor-track-strategy.md).

## 1. What the evidence establishes

We used the numbered events' official galleries and project-specific award records: [10.0](https://cal-hacks-10.devpost.com/project-gallery), [11.0](https://cal-hacks-11-0.devpost.com/project-gallery), and [12.0](https://cal-hacks-12-0.devpost.com/project-gallery). The separate UC Berkeley AI Hackathon and WebMCP Challenge are not counted as these events.

Here, successful means **a verified listed award or explicitly identified honorable mention**. It does not mean sustained adoption, production readiness, or independently validated performance. Awards below come from each entry's event-linked award section; mechanisms come from author descriptions and, where noted, public code. Elastic's own retrospective additionally identifies the placement of its winner.

No project was installed or executed in this review. Reading a demo description is not independently validating its execution. Current pages and repositories may include later changes; we do not assume every current feature existed at judging time. We did not obtain judging deliberations or a representative sample of losing projects, so these cases cannot establish which feature caused an award or estimate our chance of winning.

## 2. Verified shortlist

All project links below support the listed recognition. Sponsor-category labels are not overall placements; unspecified ranks remain unspecified.

| Project | Edition | Verified recognition | Relevance to our scope |
|---|---|---|---|
| [Duck Duck Goose](https://devpost.com/software/duck-duck-goose-jelxr9) | 12.0 | AppLovin: Query Planner Challenge | Technical mechanism and comparative evaluation |
| [FaceTimeOS: AI Mac Agent](https://devpost.com/software/facetime-macos-ai-agent) | 12.0 | Cal Hacks: 1st Overall | Personal delegation with visible execution |
| [merj](https://devpost.com/software/merj) | 12.0 | CodeRabbit: Best Use of CodeRabbit AI | A bounded repair product and substantive sponsor use |
| [AgentOverflow](https://devpost.com/software/agentoverflow) | 12.0 | Elastic Agent Builder on Serverless; first place confirmed by Elastic | Reusable evidence for developer problem solving |
| [darwin.](https://devpost.com/software/darwin-w6fez0) | 12.0 | Letta: Honorable Mention | Candidate comparison; a limited recognition, not an overall prize |
| [Agent Santa](https://devpost.com/software/agent-santa) | 12.0 | Fetch AI: Best Use of ASI:One | Personalized commerce and an explicit simulation boundary |
| [GhostWriter](https://devpost.com/software/ghostwriter-491kuy) | 11.0 | Cal Hacks: 2nd Overall | Incoming information produces targeted artifact edits |
| [Databae.](https://devpost.com/software/databae) | 11.0 | Fetch.ai: Agentic Track Prize; rank unspecified | Generate/check/execute/analyze already has precedent |
| [Unreal EngJam](https://devpost.com/software/unreal-engjam) | 11.0 | Warp: Best Developer Tool by Warp; Cal Hacks: Most Entertaining Hack | An executable developer tool with visible consequences |
| [TAShopping](https://devpost.com/software/tashopping) | 11.0 | Reflex: Best app built using reflex.dev | Narrow shopping workflow with an actionable output |
| [Nexus](https://devpost.com/software/nexus-27zakp) | 10.0 | Ddoski's Favorite: 1st Overall | React/TypeScript and Convex supporting shared interaction |
| [EasyPC](https://devpost.com/software/easypc) | 10.0 | Best Use of MindsDB; rank unspecified | Data and constraints produce a concrete purchasing plan |
| [SecondSearch](https://devpost.com/software/secondsearch) | 10.0 | Best Use of Milvus; Best Designed Human-Computer Interaction | Direct access to inspectable evidence |

Elastic's [official retrospective](https://www.elastic.co/search-labs/blog/agent-builder-projects-learnings-cal-hacks-12-0) supplies AgentOverflow's first-place designation; its Devpost badge alone identifies the category, not that rank. Nexus's overall award is also corroborated by [Oregon State's report](https://engineering.oregonstate.edu/all-stories/oregon-state-team-wins-top-prize-cal-hacks-competition).

## 3. What to study in each project

### Duck Duck Goose: make the technical contribution inspectable

The author describes a DuckDB engine using storage layout changes, materialized aggregates, feasibility checks, cost-based query rewriting, and warm caches. The [repository](https://github.com/KevinL10/applovin-query) exposes a shared solution interface, repeated runs, expected-output checks, and additional validation queries. Published speedups are author measurements, not independently reproduced results or an official judging score. The extra queries were used during experimentation, so they are not established as a frozen holdout.

The inspected [comparison code](https://raw.githubusercontent.com/KevinL10/applovin-query/main/benchmark/run.py) compares sets of numerically rounded rows. That discards multiplicity and order; whether it satisfies the original challenge depends on a contract we did not retrieve. For our data tasks, explicitly test duplicate counts, ordering when relevant, types, and numeric tolerances. Separately report preprocessing, cold, warm, and amortized costs.

**Our takeaway:** a credible DataPatch or Crash Lab demo can center on an inspectable mechanism, a strong baseline, and reproducible evidence. It does not need another model role merely to appear sophisticated.

### FaceTimeOS: a personal agent needs an immediately recognizable outcome

The authors describe calling a Mac to delegate local work, with computer-use execution and spoken feedback. The [author retrospective](https://blog.dylanlu.com/cal-hacks-12/) reports fragile clicking, dedicated tools for some interactions, and a keyboard-only demo restriction. Those constraints matter when interpreting the broad product promise.

**Our takeaway:** show one useful artifact or completed operation before explaining the runtime. Our proposed distinction is maintaining an authorized mission through changing state, with authoritative outcomes and measured recovery. Keep the demo and benchmark execution paths aligned, and identify any constrained actions, simulations, or recordings. A screenshot helps explain a result but is not the sole correctness oracle.

### merj: repair a precise failure in an existing workflow

The [project](https://devpost.com/software/merj) describes a Git CLI that invokes repair when a pull encounters conflicts. It combines common-ancestor context, retrieved code, CodeRabbit change summaries, and a model-generated resolution. The sponsor capability has a concrete role in the repair path. The write-up does not establish an independently measured semantic-correctness advantage.

**Our takeaway:** DataPatch should have an equally precise trigger and output: a changed input contract, a candidate transformation patch, rebuilt artifacts, and an independent verdict. Its additional claim must concern data semantics and regressions, not simply asking a coding agent to repair something. A past CodeRabbit prize does not establish current Factory eligibility.

### AgentOverflow: turn useful evidence into a reusable artifact

The [authors](https://devpost.com/software/agentoverflow) describe extracting debugging context into structured problem–solution records, validating their structure, retrieving related fixes through Elasticsearch, and exposing context through MCP. Elastic confirms the sponsor-track win. Schema validation and community feedback do not establish that a retrieved patch is correct for new data.

**Our takeaway:** DataPatch's evidence packet should bind the input snapshot, failure, patch, validation results, and unresolved assumptions. CloseProof should similarly return a calculation and source references a reviewer can inspect. MCP in this project is not evidence of WebMCP implementation; our browser integration remains a separate responsibility.

### darwin.: distinguish candidate competition from verified improvement

The [project](https://devpost.com/software/darwin-w6fez0) describes multiple UI-coding candidates, user selection, and changes to agents' stored context or personas. Its listed recognition is a Letta honorable mention. The description does not establish model-weight training or a measured learning gain.

**Our takeaway:** if DataPatch compares candidates, show the distinct repair hypotheses and executable evidence. Human preference between designs is different from semantic correctness. Compare parallel candidates with a sequential agent given the same total resources; keep competition optional until it earns its cost.

### Agent Santa: preference-driven commerce is already a recognizable pattern

The [authors](https://devpost.com/software/agent-santa) describe a gifting agent that obtains recipient preferences, considers gifts, and performs a **simulated** checkout/payment step through a Fetch-based agent workflow. Its award does not establish real payment settlement or reliable external purchasing.

**Our takeaway:** our shopping branch needs more than personalization and delegation. SpendRail's potential difference is an observable history of authorization, reserved funds, attempted effects, settlement, and delivery—including an honestly unresolved outcome. A simulator can exercise real reconciliation logic, but its payment boundary must remain explicit.

### GhostWriter: bounded updates are a close precedent, not sufficient novelty

The [project](https://devpost.com/software/ghostwriter-491kuy) turns office-hours speech into updates to course notes. Its authors describe transcription, retrieval, thresholds for selecting an existing or new note, and insertion markers for granular Markdown edits. The visible result is the updated document.

**Our takeaway:** “new information updates the relevant artifact” is already a recognized product pattern. Our personal agent must show the harder case: an old proposal, a concurrent user change, preserved commitments, and a valid repair. DataPatch must demonstrate semantic regressions being caught. The inspected description alone does not establish either project's guarantees.

### Databae.: several named agents are not the technical claim

The [authors](https://devpost.com/software/databae) describe generator, checker, executor, and analyzer agents translating questions into database results. Their award record names Fetch's agentic category without establishing placement. A model checking another model's SQL is not independent proof of its semantics or safety.

**Our takeaway:** retain the separation of responsibilities in our design, but evaluate whether the extra calls help. DataPatch needs correct repair artifacts; CloseProof needs supported explanations and appropriate abstention. Neither should be pitched primarily as a four-agent pipeline.

### Unreal EngJam: make the developer tool actually execute something

The [authors](https://devpost.com/software/unreal-engjam) describe a TypeScript FigJam plugin that converts graphical programs into an abstract syntax tree and interprets them. Games and visual programs expose the result of execution. This is a developer-tool precedent, not evidence about agent reliability.

**Our takeaway:** Crash Lab should end with a runnable minimal counterexample and a replay after the proposed change. A colorful trace graph helps navigation; the product's value is the independently confirmed failure and useful reproduction.

### Nexus: Convex can serve the central user interaction

The [authors](https://devpost.com/software/nexus-27zakp) describe interest-based voice matching using React/TypeScript, Convex vector search and realtime backend state, and 100ms voice communication. The listed award is first overall; do not relabel it a Convex prize or infer that a database choice caused the result.

**Our takeaway:** make Convex visible through behavior. In LiveOps, two participants' acceptance and withdrawal should produce a consistent revised arrangement. In the personal agent, a user's edit should invalidate the right pending work and preserve actual completed effects. This is a stronger demonstration than displaying the database dashboard alone. Rust remains an engineering choice to justify by workload.

### EasyPC and TAShopping: narrow the shopping problem and return an artifact

[EasyPC](https://devpost.com/software/easypc) describes turning a budget and workload into a priced component list, using a scraped catalog and model/data tooling. Its page does not establish guaranteed compatibility, current availability, or executed purchases.

[TAShopping](https://devpost.com/software/tashopping) describes turning a grocery list into a route through a Target store, using gathered product/layout information and item categorization. It is a narrow shopping interaction; multi-retailer expansion is future work in the write-up. Its current page also records a post-event update, illustrating why current capabilities should not all be attributed to judging day.

**Our takeaway:** SupplyWatch should produce a concrete substitution plan with source time, pack size, units, compatibility, and total cost—not just summarize supplier news. The personal agent should produce a valid basket and explain what changed. Neither needs broad merchant coverage to establish the first useful result.

### SecondSearch: inspectable evidence can be the main interaction

The [authors](https://devpost.com/software/secondsearch) describe finding and displaying the lecture segment relevant to a question through vector search. They report removing a caption-summary step because it slowed the interaction; we did not reproduce its timing.

**Our takeaway:** CloseProof's shortest path should be discrepancy → calculation → exact supporting records. For DataPatch, use failure → patch → semantic diff → verdict. Do not make a long explanation or additional model call a prerequisite for viewing the decisive evidence.

## 4. Concrete implications for our scope discussion

These are proposed refinements, not claims established by the historical projects.

| Our candidate | What this review reinforces | What would justify our additional complexity |
|---|---|---|
| Personal agent | One recognizable mission with visible execution and intervention | Better valid completion or recovery cost under changing state than equally equipped replanning |
| DataPatch | A narrow repair trigger and reviewable evidence packet | Correct hidden-test repairs, preserved unaffected outputs, and useful abstention against the same coding agent |
| Agent Crash Lab | A developer tool that returns an executable artifact | Independently confirmed defects, smaller reproductions, and useful detection per search budget |
| LiveOps | Shared interactions make realtime infrastructure understandable | A valid accepted arrangement with fewer coordination steps than a competent board plus solver |
| SupplyWatch | Narrow data collection followed by a concrete purchasing artifact | Correct normalization and impact detection under stale, missing, or conflicting observations |
| SpendRail | Personalization is separate from execution correctness | Accountable shared obligations and delivery reconciliation beyond current SDK controls |
| CloseProof | Direct access to evidence rather than fluent explanation alone | Correct exception dispositions, arithmetic, citations, and abstention with lower reviewer effort |

The provisional discovery order—DataPatch, LiveOps, SupplyWatch—does not change just because another project won a prize. The strongest new reference for **technical depth and evaluations** is Duck Duck Goose; the closest workflow comparison for **DataPatch** is merj, with GhostWriter and AgentOverflow providing additional overlap. The strongest directly relevant **personal-agent presentation** precedent is FaceTimeOS. **Nexus** is the clearest Convex-backed overall-winner example in this selection.

## 5. Evaluation and demo changes worth carrying forward

1. **Make the output contract executable.** Data tables need duplicate-sensitive comparisons, explicit null/type rules, ordering where promised, and domain-specific numeric tolerances. Deliberately corrupt an expected result to test the evaluator itself.
2. **Separate preparation from recurring work.** Report profiling/index construction, startup, warm execution, validation, failed attempts, and end-to-end costs. Any amortized result states the number of tasks over which preparation is shared. Give baselines equivalent cache and warm-start opportunities.
3. **Keep development validation separate from a frozen holdout.** A test set used to choose implementation changes is development data even if its filename says validation. Inspecting final results and tuning afterward requires a new holdout.
4. **Present the artifact before the architecture.** Start with the failing output, unresolved case, or conflicting assignment. Then show the changed result and the evidence; use the graph to explain how it happened.
5. **Reconcile demonstrated and measured behavior.** If the demo narrows the action set or uses a simulator, record that scope in the run manifest. A recorded success, a native browser call, and a live external effect are different evidence types.

These refinements extend the existing evaluation discipline rather than importing another project's benchmark or claiming a performance result. No implementation or benchmark execution was performed in this pass.

## 6. Sponsor implications and remaining gaps

Historical sponsor use is a design reference. The [Cal Hacks 13.0 track ledger](07-sponsor-track-strategy.md) remains the source for current track names and unresolved requirements. In particular:

- Nexus illustrates useful Convex integration, not a verified Convex-category award in this record.
- AgentOverflow illustrates substantive Elastic Agent Builder use; its 2025 prize does not establish this year's detailed qualification conditions.
- merj illustrates a sponsor tool contributing to repair; it does not substitute for actual Factory SDK integration in our application.
- The query-planner award supports studying an optimization-oriented project; it does not imply that our entry qualifies for a current AppLovin track.
- Fetch awards and a Letta honorable mention remain distinct from overall placements and from each other. Earlier MCP integrations do not establish WebMCP usage.

This was a selective review, not an exhaustive winner census or novelty search. We did not establish a close historical winner for every detail of LiveOps, SpendRail, or Crash Lab; that is not evidence that competitors do not exist. We also lack independently reproduced performance, user-demand evidence for our candidates, and complete current sponsor requirements. Scope should now be decided by the user problem we can test, the data and integrations we can access, and the result we can actually demonstrate.
