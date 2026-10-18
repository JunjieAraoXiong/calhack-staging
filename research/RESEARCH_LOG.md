# Evolution of Research Judgments

Date: 2026-10-17. The rounds below are literature and competitor reviews, not software experiment runs. There are no metrics, Git keep/discard commits, or performance improvements.

| Round | Hypothesis examined | New evidence or counterargument | Decision |
|---|---|---|---|
| 1 | Personal schedule repair could be a clear differentiator at Cal Hacks | Reclaim, Motion, and Day Canvas; Runline additionally covers disruptions, locks, confirmation, old versions, and retries | Downgrade the original recommendation; stop treating general rescheduling as the main selling point |
| 2 | Adding a shared canvas, minimal changes, or multi-person confirmation could restore differentiation | Aisle, Runline, and Spokes already have corresponding mechanisms | Do not keep adding basic mechanisms to present the concept as novel |
| 3 | Post-purchase execution, completion receipts, and cross-merchant compensation might offer a less occupied direction | Accessible Action Mode, ProofDone, RelayPay, and Concord; ReturnQueen's real logistics service | Downgrade general post-purchase assistance; retain only where real controlled integrations or a very specific user problem justify it |
| 4 | User-editable personal memory is sufficiently distinctive | Mem0, Recall, and Waggle; Waggle also already has precise approval and version fingerprints | Treat the memory store as a component; do not claim authorization, lineage, or version protection as new innovations |
| 5 | Propagating memory corrections into already-generated, unfinished decisions could provide a testable increment | Relative to the reviewed scope of Waggle, the increment lies in decision dependencies and local repair; an unoccupied market has not been established | Retain as a hypothesis for a short validation exercise, not a guarantee of winning |
| 6 | Automatically replacing meals after removing a vegetarian restriction would make a good demo | Independent review noted that removing a restriction does not establish the opposite preference; the original case would encourage excessive repair | Discard that script; use an explicit request involving an incorrectly inferred household size, a dinner-party exception, and already-purchased ingredients |
| 7 | Three websites and multiple agents could make the technology look stronger | External integrations and cross-origin operation are costly, and their necessity has not been established | Narrow to owned, same-origin applications and one agent; demonstrate engineering value through real state conflicts |
| 8 | We can now declare the best topic | User tests, the team's integration conditions, and a runnable prototype are missing | Provide only validation priorities, continue/stop gates, and a future fixed evaluation design |

## Corrections from independent review

- Retain the strongest objection in the main report: “Is this just changing a setting and refreshing a list?” If so, a complex memory system is not justified.
- Record decision dependencies when decisions are generated. A dependency means an input was used, not that it is the sole cause; do not add edges just before the demo to manufacture traceability.
- Optimize for the correct scope, preservation of human edits, and final-state constraints rather than the number of changes.
- Confirm that the two Deputy references are different projects sharing a name, and withdraw the interim judgment that conflated them.
- Downgrade the wording from “preferred product” to “product hypothesis to prioritize for a two-hour validation exercise.”

## Completion status

2026-10-17 development-cadence correction: the user explicitly stated that the main system can be completed first and refined at the event. Withdraw the 36-hour total development limit and replace it with four milestones: a complete core workflow, technical validation, finalized evidence, and integration refinement. Keep cross-mission resources and durable recovery as core capabilities; prioritize reproducible experiments with the additional time. A fresh reading of this edition's homepage still found “All work must be done during the hackathon,” with no exemption for existing code. Record eligibility boundaries separately from product architecture, and do not misrepresent this plan as already compliant with this edition's rules.

2026-10-17 addition: the user requested a deeper treatment of option 1, emphasizing nonlinear execution and credible evaluation. Narrow the technical research objective to dependency revalidation and incremental repair under changing state, and their benefits relative to strong ReAct and global-replanning baselines; add `TECHNICAL_RUNTIME_EVAL_ZH.md`. Related work such as HyperAgent counters the claim that using a DAG is itself an innovation. The evaluation design requires shared tool protections, independent final-state scoring, held-out tests, and ablations. There is still no implementation or measured result.

This round's field research, candidate comparison, counterevidence review, technical-boundary checks, demonstration plan, and event-time plan are complete. The documents record the subsequent evaluation contract required for formal autoresearch. No competition code was developed, prototype run, or user experiment conducted; no scheduled loop or background automation was created.

## October 18: persistent agents and business-facing protocols

Three parallel source reviews examined the newly supplied Stripe, Decagon, Profound, Sierra, X, and architecture references. The consolidated [system comparison](../docs/14-personal-agent-system-variations.md) separates product responsibility, durable lifecycle, execution channel, and planning policy. It compares six configurations with explicit pros/cons and decisive experiments.

The proposed [persistent runtime](../docs/15-persistent-agent-runtime-design.md) adds task-specification revisions, wake-up admission, bounded runs, delivery state, and optional adapter/credential/sandbox boundaries. This extends the existing mission core rather than treating memory or durable state as wholly absent.

The new prior-art correction is that operation identity, revision-bound approval, and recovery already appear in PAP's published draft extension. Those mechanisms cannot be our novelty claim. The remaining research hypothesis concerns mission-level dependency reuse, shared commitments, and useful recovery under changing conditions against equally equipped baselines.

These are source-review conclusions and proposed experiments. No numeric evaluator exists for this research pass, so no autoresearch optimization loop, keep/discard metric, or performance gain is claimed. The user still plans to decide scope before application implementation.
