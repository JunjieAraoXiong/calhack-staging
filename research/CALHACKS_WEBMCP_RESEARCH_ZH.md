# Personal Agent × WebMCP: Cal Hacks Project Research

Date: 2026-10-17. Primary goals: winning at Cal Hacks and delivering an effective live demonstration. The early scope assumed a team of 2–4 people and approximately 36 hours; the user later explicitly removed the 36-hour limit on total development, preferring to complete the core first and refine it onsite. The old schedule below is retained as research history; the current references are the [system design](./PERSONAL_AGENT_SYSTEM_ZH.md) and [staged technical validation](./TECHNICAL_RUNTIME_EVAL_ZH.md). Team expertise, available accounts, and access to real users remain unknown. All conclusions are project-selection judgments, not estimates of winning probability or user-research findings.

**Conclusion: this direction is worth pursuing, but “personal memory + tool calls + shared interface” is already crowded. I would withdraw the recommendation to make ordinary schedule repair the first choice. The most promising hypothesis to validate next is “after correcting personal memory, precisely repair things already planned but not yet completed.” This is only a higher-priority hypothesis for validation; it cannot yet be described as a product with a clear competitive advantage in winning the hackathon.**

If the team already has access to a real campus workflow, its users, and a controlled system it can write to, solving that workflow's problem may be more compelling than the general concept below. We currently have no evidence that the team has such access, so we do not count it as an existing advantage.

This round produced research, not a prototype. We reviewed the competition, official technical materials, established products, and WebMCP projects; we did not run those projects, interview users, or measure performance. See the [research protocol](./RESEARCH_PROTOCOL.md), [evidence table](./EVIDENCE.md), and [evolution of judgments](./RESEARCH_LOG.md) for the method and supporting evidence.

## Why the original recommendation needs to change

Cal Hacks considers practical application, design, functionality, creativity, and engineering capability, and allows only a three-minute pitch. The WebMCP Challenge is a separate competition that has already ended. Its projects are useful research material, but its judging rules cannot be applied directly. [Cal Hacks](https://cal-hacks-13-0.devpost.com/), [WebMCP Challenge](https://webmcp.devpost.com/)

After expanding the sample, we found that several proposed highlights are already existing features:

- Schedule rearrangement: Reclaim and Motion already cover automatic adjustment; Runline's authors additionally describe disruption repair, manual locks, alternatives, confirmations, and protection against old versions. Merely changing the setting to “student schedules” does not establish enough differentiation. [Reclaim](https://help.reclaim.ai/en/articles/17124978-habit-agent-overview-automate-recurring-routines), [Runline](https://devpost.com/software/runline)
- User-controlled memory: Waggle already demonstrates memory correction, human approval, subsequent recall, and a modification trail; version protection also exists. “Users can edit the agent's memory” is insufficient as a new selling point. [Waggle](https://devpost.com/software/waggle-webmcp)
- Post-purchase execution: Accessible Action Mode already describes combined return/exchange conditions; ProofDone emphasizes verification of final outcomes; Concord emphasizes cross-site recovery. We cannot package receipts or undo functionality themselves as our innovation. [Accessible Action Mode](https://devpost.com/software/accessible-action-mode-returns-exchanges), [ProofDone](https://devpost.com/software/proofdone), [Concord](https://devpost.com/software/concord-an-agent-that-cannot-overpromise)

These are capability descriptions from the authors' current pages. They may include post-competition updates and have not been independently reproduced by us. They are sufficient counterevidence for project selection, but cannot establish exactly why a project won.

## Comparing candidate directions

The following are qualitative judgments under the same criteria. No official weights or creativity scores have been invented.

| Direction | Live-demo appeal | Main difficulty | Decision this round |
|---|---|---|---|
| A personal assistant that does everything | Many features, but the central point is hard to communicate | Excessive scope and weak end-to-end completion | Exclude from this scope |
| Personal schedule repair | Clear before/after change | Overlap with Reclaim, Motion, Runline, and Day Canvas | Downgrade from first choice |
| Portable personal memory store | Fits the theme | Mem0, Recall, and Waggle already exist; value is relatively abstract | Use as a component, not a standalone project |
| Generate automation from one demonstration | Easy to understand | Existing automation tools and similar projects; reliable transfer is difficult | Not a priority for now |
| General shopping agent | Products make a visually clear demonstration | Mature competition; payment and merchant access add risk | Do not pursue before narrowing |
| Learning and recovery after a failed purchase | Money, time, and mistaken purchases are tangible | Many return-related competitors; can easily become a simulated store | Prioritize only with real, controlled integration access |
| Local plan repair after memory correction | Can show cause, impact, preservation, and change | May look like refreshing a list after changing a setting | Prioritize for a short validation gate |
| One real campus administrative workflow | Credible users and completed outcomes | Depends on existing access and permissions, currently unknown | Raise priority if users and access already exist |
| Student dorm move-out clearance plan | Strong visuals through item cards, timing, and transport changes | Resale/pickup channel integration; insufficient competitor coverage this round | Backup hypothesis; do not claim an unoccupied market |

**Do not interpret “already exists” as “the project cannot be built.”** A hackathon entry can still win through problem selection, actual integration, and execution quality. But distinguish baseline capabilities from the additional value the team can demonstrate live.

## Priority hypothesis: memory correction and local repair

In one sentence: **“The AI misunderstood me once, and that affected later plans; I correct it once, and it finds the affected unfinished work and changes only what needs changing.”**

Initially limit the target users to students who use an agent for weekly meal and shopping plans. We have not validated how often such users encounter this problem; do that before committing to full development.

For a repeatable demonstration, the incorrect memory can be an explicitly labeled test input. However, the agent must actually read that input when generating the subsequent plans and dependency records. A prewritten animation must not be presented as capturing a real, naturally occurring model error.

Demo example: after last week's gathering, the agent incorrectly treats the user as a four-person household, causing excessive portions and ingredient quantities for some of this week's dinners. The user says:

> The four people last week were only visiting; I usually live alone. Adjust this week's remaining meals and ingredients still to buy to one-person portions. Friday's gathering is still for four people, and keep what I have already purchased.

The interface shows the memory's source, weekly meals, and shopping list. The system distinguishes the long-term household size from a one-time gathering, finds plans dependent on the old memory, proposes local changes, and preserves manually locked and completed items. Ingredients shared across dishes need to be aggregated; ingredients already purchased should participate in the revised plan rather than simply being deleted.

**The defensible difference from Waggle is limited to this layer: the page we read focuses on correcting memory and recalling it correctly; this hypothesis tracks application decisions generated before the correction and repairs their consequences.** This comparison is limited to the material reviewed, not a claim of being the first in the world.

The strongest objection is: “Isn't this just changing household size from four to one?” If the final demonstration is only a global multiplier change, abandon that framing. The reason to continue must be a demonstration that simultaneously handles long-term facts and event exceptions, prior user edits, shared ingredient dependencies, completed actions, and related objects that should remain unchanged. Natural language expresses scope and tradeoffs; code handles data dependencies and constraint validation.

Another error that must be corrected: removing a restriction does not establish the opposite preference. For example, “I am not vegetarian” does not mean all vegetarian meals should be replaced with meat. Impact detection first produces a set that needs rechecking; whether anything changes still depends on explicit intent and current state.

## Three-minute demonstration script

| Time | What the audience sees | What it should prove |
|---|---|---|
| 0:00–0:25 | A single user's weekly plan buys for four; a one-time gathering is shown being misused as a long-term fact | An intuitive problem with specific consequences |
| 0:25–0:50 | The user enters the correction above while preserving Friday's gathering and purchased ingredients | One sentence expresses both a long-term correction and exceptions |
| 0:50–1:30 | A change preview appears for two unfinished plans and the shopping list; locked and completed cards remain unchanged | Local repair protects the user's prior work |
| 1:30–2:05 | The user first adjusts one ingredient manually; the old proposal is rejected on submission, and the agent reads current state before recalculating | The human and agent can genuinely take turns operating the system |
| 2:05–2:40 | Apply the proposal and show the final list; the next planning round uses a one-person baseline while retaining the gathering exception | It addresses past consequences and corrects future behavior |
| 2:40–3:00 | Explain the distinction in one sentence and show a small number of actual tool-call records | Operations come from actual WebMCP execution, not a prerecorded chat animation |

Clearly label all orders and products that are test data. This demo completes planning and edits to a list of items still to buy; it does not claim refunds, actual purchases, or cross-merchant transactions. A recording is an offline backup and must not be presented as live execution.

## Minimum implementation boundary

One owned application, one agent, and three same-origin views: memory evidence, meals, and shopping list. The first version does not use cross-origin iframes, develop a separate browser extension, or add multiple agents or a general knowledge-graph editor.

Conceptual architecture:

```text
Direct user edits ──→ Shared application state ←── WebMCP semantic tools ←── Browser agent
                              │                                                 │
              Memory versions / decision inputs / manual locks        Model choices and explanations
                              │
                 Deterministic checks and applied results
```

When each decision is generated, record the memory versions, input objects, and state actually read. Do not manually attach “causal relationships” to results just before the demonstration. A dependency edge records an input that was used; it does not guarantee that the input was the output's sole cause. On a change, first mark affected decisions, then use current constraints to decide whether they need to be redone. Show unknown dependencies honestly; do not present model guesses as traceability.

Suggested tool responsibilities: read context and decisions, propose memory corrections, query affected decisions, propose local repairs, and apply reviewed proposals. Use ordinary code for domain calculations, quantity aggregation, locks, and version checks; the model handles scope interpretation, proposes feasible tradeoffs, and explains them. Validate again at the application's write boundary rather than trusting model output alone.

Tools, UI, and business logic operate on the same state. Allow only the exact proposal reviewed by the user to be applied; recalculate if an input version changes. Undo covers only reversible in-app changes and must not overwrite later manual edits.

The current official interface uses `document.modelContext`. Cross-origin tool access requires the corresponding authorization; persistent memory, background execution, and cross-site transactions are not automatically provided by the protocol. [Chrome API](https://developer.chrome.com/docs/ai/webmcp/imperative-api), [draft specification](https://webmachinelearning.github.io/webmcp/)

At the start of the competition, verify the complete “register tool → agent discovers it → invocation → final UI state” path. GoogleChromeLabs provides an [extension example](https://github.com/GoogleChromeLabs/webmcp-extension) and a [Page Agent](https://github.com/GoogleChromeLabs/webmcp-tools/tree/main/demos/page-agent). The former currently requires Chrome 155+ and Node 22.18+; the latter has a polyfill path. Pin versions before using the examples, and distinguish native execution from compatibility paths; neither was run in this research round.

## Gates for continuing or stopping

Use the first two hours of the competition as a feasibility gate rather than committing to all 36 hours upfront:

- Show three non-teammates a simplified 60-second flow and ask them to restate the problem, the result, and why the system should not simply regenerate everything. Record their actual words and avoid leading questions. This test has not yet been performed.
- Include at least one related object that should not change, one object with a shared dependency that needs recalculation, and one completed object that cannot be rewritten.
- Let a tester change an input unexpectedly; the agent must still produce a different valid proposal, without relying on a fixed success script.
- Explain the difference from an existing memory manager in one sentence.

Stop pursuing this product hypothesis if the audience sees only a headcount adjustment, the explanation requires extensive architecture discussion, traceability is added after the fact, or the system can only regenerate everything. If a genuinely usable order or campus-workflow integration already exists, shift to its narrow end-to-end workflow. Otherwise, choose a new concrete problem instead of immediately adding features.

## 36-hour schedule (after passing the gate)

| Period | Deliverable |
|---|---|
| Hours 0–2 | The validation gate above and the native tool path; change direction if they fail |
| Hours 2–6 | Domain data, state, decision-input records, and fixed acceptance scenarios |
| Hours 6–14 | Three shared views and a complete workflow that can be performed manually |
| Hours 14–22 | Agent reading, local proposals, explanations, and WebMCP execution |
| Hours 22–28 | Validation of version conflicts, exceptions, shared ingredients, completed items, and repeated calls |
| Hours 28–32 | Testing by non-teammates, removing demo obstacles, and deleting features that do not serve the main story |
| Hours 32–36 | Three-minute rehearsals, recording, submission text, repository, and environment instructions |

A four-person team can divide UI, domain state/validation, agent/tools, and user validation/integration; combine responsibilities with fewer people. Do not sacrifice integration time to connect a second external service.

## How to actually use autoresearch later

This round did not run a formal optimization loop. After implementation, fix one file to optimize, such as the planning policy, and fix the model, tools, scenarios, and checker. Judge results by programmatically reading final application state, rather than having the model that wrote the proposal grade itself.

| Fixed scenario | Required final state |
|---|---|
| A one-time gathering is mistaken for long-term household size | Long-term memory is correct, and future meals for the user use the correct scope |
| An explicit four-person gathering exception | That event's headcount and commitments are preserved |
| A menu locked by the user | The original object is not rewritten |
| Ingredients already purchased | Purchase facts remain, with no false claim of returning them; the new proposal accounts for available inventory |
| Ingredients shared across multiple dishes | Total demand and net quantity still to buy are correct; do not simply delete an entire row |
| A manual list edit during repair | The old preview cannot overwrite the new edit; reread before proposing again |
| A restriction is withdrawn without requesting a replacement | Do not infer the opposite preference or make unsupported broad changes |
| A plan unrelated to the memory | No erroneous modification |
| The same operation is called repeatedly | No duplicate deduction, creation, or application |
| Native WebMCP execution | Tool results, UI, and persistent state agree; a bypass function call does not count as passing the protocol path |

The suggested primary metric is `scenario_pass_rate`, higher is better. Hard constraints are zero erroneous modifications to locked/completed items and zero known invalid writes. A case passes only when all final-state assertions pass; record ambiguous language explanations separately through human review. Repeat runs under the same conditions and report actual numerators, denominators, and failures, not just the best run.

Compare “full regeneration” against “local repair after tracing dependencies,” using the same model and initial state. Change only one strategy factor; treat latency, call count, and the number of manual corrections as secondary metrics. [WebMCP Evals](https://github.com/GoogleChromeLabs/webmcp-tools/tree/main/webmcp-evals) is a possible reference. Once fixed, the evaluator must not be changed to improve the score; before implementation, do not invent evaluation commands or claim that experiments were run.

## Sponsor and submission strategy

See the supplementary [sponsor-track fit plan](./SPONSOR_FIT_ZH.md): use the shopping theme for Visa, choose either Convex or SpacetimeDB for shared state, and use Gemini for interpretation and tool calling. Exact eligibility and restrictions on entering multiple tracks still require confirmation against this edition's detailed rules.

First select a user outcome the team can complete, then choose a sponsor capability it actually uses. The current [Cal Hacks prize page](https://cal-hacks-13-0.devpost.com/) lists Visa's Reimagining Shopping, Fetch.ai, Convex, and Figma Agent/Design categories, among others. Memory repair does not necessarily qualify for any of them, and a shopping list does not automatically establish eligibility for a payment track. Verify sponsor rules, account access, and specific requirements before finalizing the implementation.

There is insufficient evidence to claim that “a less crowded track is easier to win” or that “integrating more sponsors makes winning more likely.” Do not add unnecessary calls merely to claim a multi-agent system. Submission materials should explain who the user is, what was actually solved, where the agent must make decisions in the demonstration, which part WebMCP actually handles, and the boundaries of test data and external integrations.

## What remains unknown

Three things could change the final choice: whether the team has real campus/merchant-system access; whether target users have experienced memory errors propagating into later work; and whether the two-hour validation lets an audience understand the value of local repair. Without that evidence, this report recommends what to validate first, rather than declaring that an idea will definitely win.
