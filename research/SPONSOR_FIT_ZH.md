# Cal Hacks 13.0: Sponsor-Track Fit

Verification date: 2026-10-17. Based on the “personal memory correction → local repair of previously generated plans” proposal. The following are product and technical fit recommendations, not confirmed eligibility.

## Update: a Convex design for the incremental agent runtime

The user subsequently chose to investigate dynamic environments, dependency revalidation, and incremental repair in greater depth; see the [technical and evaluation protocol](./TECHNICAL_RUNTIME_EVAL_ZH.md) for the complete design. This section updates Convex's role; the earlier shopping proposal is retained below for reference.

The current Devpost page was read again on 2026-10-17, confirming that it lists `[Convex] Best use of Convex`; no additional detailed rules for this edition were obtained. Convex's own All Gas event and the historical Zero to One event are different competitions. Their deployment, plugin, social-posting, and scoring requirements cannot be imported as requirements for this edition.

### Recommended proposition

“Use Convex's reactive state, transactions, and durable workflows to keep a personal agent observable and recoverable while the user continuously changes the task, repairing only the affected decisions.” This is a project recommendation, not a judgment about winning probability or official scoring weights.

Convex has three core responsibilities:

1. **Shared state and presentation:** persist tasks, preferences, inventory, carts, locked items, dependency records, pending commands, and receipts. The human, browser agent, and observer interface subscribe to the relevant queries; component-local state cannot be the authoritative source.
2. **Atomic state transitions and repair scheduling:** the same mutation changes business state, records the change, and schedules subsequent repair. For a large graph, it can record only the change and repair job, then compute the invalidation closure in batches to avoid a large transaction. Scheduling with `scheduler.runAfter` inside a mutation commits together with the data changes. An older planning run may still return, so publication must check dependency versions, task generations, or conditions stored by the application itself rather than relying only on native OCC.
3. **Durable execution coordination:** the Workflow component saves step results, waits for events, and manages recovery. Put LLM calls in actions; put database validation and commits in mutations. The browser connects actual WebMCP tool execution to the workflow through command subscriptions, atomic claims, and receipts.

Convex's query dependency tracking does not automatically generate the agent's business dependencies, and subscription updates do not automatically start backend workflows. We implement the dependency graph and invalidation algorithm; server-side state-change entrypoints explicitly schedule repair jobs.

### Concrete execution path

1. The user changes headcount or budget through an `updateRequirement` mutation.
2. The mutation stores the change, application version, and repair request, and atomically schedules request processing.
3. The repair process reads the affected scope and, when necessary, calls the model through an action to produce a proposal carrying dependency witnesses.
4. A `publishPlan` mutation checks that the proposal is still based on valid conditions; if stale, it preserves the newer state and schedules another repair.
5. The browser subscribes to `getPendingCommands`, claims a command through a mutation, then invokes the page's actual WebMCP tool.
6. A write to the controlled store uses a mutation to validate conditions and update inventory, cart, and operation receipt; the browser reports the result to the workflow.
7. All observer interfaces see the committed state of the same task through queries. Network arrival times may differ; do not advertise zero-latency synchronization across devices.

Workflow recovery does not guarantee that an external merchant operation executes exactly once; external side effects still require idempotency keys and receipt queries. After the browser executing WebMCP closes, server state and workflows can persist, but page operations must wait for an available browser. Do not claim the system can continue operating that page after its browser has closed.

### Track demonstration and evidence

Use an execution window and a user window during the live demonstration: after the agent reads a plan, the user changes the budget. Release the old model response and show that its proposal cannot overwrite the new requirement, then repair only the affected portion. Refresh the execution window to show durable task recovery without repeating confirmed operations. An observer window displays tasks, versions, commands, and receipts in real time.

Convex-related evidence: measured latency from multi-client edits to display, the number of stale proposals incorrectly accepted in concurrent scenarios, duplicate side effects, and recovery success rate and duration. Algorithmic evidence: all three agent baselines share the Convex backend, comparing success rate, model/tool cost, and repair scope. A comparison in which “our system has transactions and the baseline does not” cannot establish an algorithmic advantage.

Prioritize Database, reactive queries, mutations, Actions, and Workflow. The Agent component can manage conversations, tool traces, and usage, but is not a confirmed track requirement. Do not add RAG or vector search merely to increase the feature count.

Official references: [Realtime](https://docs.convex.dev/realtime), [OCC and atomicity](https://docs.convex.dev/database/advanced/occ), [atomic scheduling](https://docs.convex.dev/scheduling/scheduled-functions), [Actions](https://docs.convex.dev/functions/actions), [Workflow](https://github.com/convex/workflow), [Agent component](https://docs.convex.dev/agents/overview).

## Recommended combination

Consumer product positioning: **a personal shopping agent that adjusts meals and purchases as your actual life changes, while preserving purchased items and gathering exceptions.**

Prioritize Visa's shopping theme + Convex's shared state + Gemini's interpretation and tool calling. Each serves a genuinely necessary part of the product. Whether Visa requires a specific API, actual payment, or a sandbox flow still needs confirmation from the detailed track rules.

| Track | Verified information | How the product should fit | Evidence in the demonstration |
|---|---|---|---|
| Visa — Reimagining Shopping | The [official competition page](https://cal-hacks-13-0.devpost.com/) lists this track and a $5,000 prize; complete technical requirements were not found | Shift from “memory management” to “shopping decisions that adapt to changing circumstances”; show how portions, purchased inventory, budget, and gathering exceptions affect an unsubmitted basket | Specific quantities/estimated amounts before and after the change using the same catalog, preserved items, and the new basket after user review. Do not describe an estimated amount reduction as actual savings |
| Convex — Best use of Convex | The competition page lists the track; [official documentation](https://docs.convex.dev/realtime) supports live queries, and the [transaction documentation](https://docs.convex.dev/database/advanced/occ) explains atomicity and concurrency control | Store memory versions, plans, items still to buy, purchased items, locks, and proposals in Convex; UI and WebMCP operate on the same state | After the user changes something, the agent's old proposal cannot overwrite the new data; related objects update together after replanning, and multiple interfaces show consistent state |
| Gemini — Best Use of Gemini API | The [MLH page for this event](https://www.mlh.com/events/cal-hacks-13-0) publicly lists the prize and emphasizes building AI applications with Gemini | Gemini interprets long-term facts and one-time exceptions, generates repair plans, and calls WebMCP through the host; optionally reads shopping receipts and marks purchases after user verification | The natural-language correction preserves the right scope; receipt recognition actually changes which items no longer need to be bought; show real model calls rather than an extra decorative chat box |
| SpacetimeDB — Dedicated use prize | The [official Spacetime event article](https://spacetimedb.com/blog/spacetime-at-calhacks) confirms that impressive use of Spacetime will be rewarded; it does not provide complete rules or an amount | Use as an alternative to Convex; if the team knows it well, implement shopping state edited simultaneously by roommates and an agent | Two people edit while an agent replans; all clients agree, and locked/purchased items remain preserved |
| Fetch.ai — Best Use of Fetch.ai | The competition page lists $1,500 for first place, $1,000 for second, and $500 for third; the [official event page](https://www.fetch.ai/events/calhacks-13-0) confirms participation | Consider only when Fetch actually provides agent discovery, collaboration, or execution; the specific SDK/service depends on the detailed rules | Identify a necessary task that actually passed through Fetch and show its result; adding a name or an unnecessary agent does not justify the complexity |

## How the same three-minute story can serve several tracks

1. Start with a receipt or purchased-items list whose source is clearly labeled; the user checks the recognized products and quantities.
2. Show an excessive, unsubmitted basket caused by the wrong household size, alongside the personal memory that caused it.
3. The user corrects it: “I usually live alone; Friday's gathering is still for four; keep what I bought; plan the rest of this week within my budget.”
4. Gemini interprets the scope, and the agent reads the page's WebMCP tools and proposes revised meals and a new basket.
5. The user manually locks an item; the old proposal becomes invalid, and the agent recalculates against shared state. Convex or SpacetimeDB supplies state consistency.
6. Show final portions, the list of items still to buy, and estimated amounts, then save after user confirmation. A clearly available test-checkout interface can extend the demonstration, but without one, do not falsely claim payment completion.

Visa judges see the shopping experience; the database sponsor sees a real use of concurrency and consistency; Gemini judges see how the model changes decisions. The core remains the same user task.

## Boundaries we must implement ourselves

- Convex automatically handles database transaction conflicts, but does not automatically discover that an LLM proposal from ten seconds earlier is stale. Proposals must still carry relevant object versions, and business logic must compare them and reject stale proposals at application time.
- Code calculates product quantities and amounts; the model interprets and recommends. Reducing a basket's amount does not mean the user has actually saved that money.
- Gemini function calling and WebMCP are two interface layers: the host obtains page tools and exposes calling capabilities to the model, then executes on the page. Calling only a backend function cannot be labeled completion of the native WebMCP path.
- Receipt-image understanding is a suggested enhancement, not a public requirement of the Gemini track. Avoid expanding into OCR and product matching before the basic flow works.
- Choose either Convex or SpacetimeDB. Fetch should not add an extra execution layer solely for a prize.

## How to consider the other tracks

Figma's Best Design can be an additional candidate based on the product's existing design work. Best Use Case of Figma Agent is not equivalent to “we drew a sketch in Figma”; read the detailed rules to determine qualification. Do not turn the final product into a design tool for this purpose.

CREAO's AI-First Disruptor, One-Person Company, and Team Empowerment categories, and Microsoft's Built for the Real World / Customer Impact categories, are listed on this edition's competition page. However, the public pages reviewed did not provide complete usage requirements. The current consumer proposal suggests a possible thematic connection, but cannot be claimed to qualify already.

If the team is willing to change the target user, similar planning capabilities could serve a small food-service operator: a customer changes headcount, which updates the menu, procurement, and draft costs. That would make the One-Person Company product narrative more natural. However, customer authorization, real integration access, and feature boundaries would all change; do not add enterprise modules ad hoc to the current personal-shopping proposal.

Hyphenate's theme explicitly concerns autonomous systems for enterprise finance, while Factory lists a Droid SDK usage prize. The current meal and shopping proposal cannot be assumed to qualify merely because it has a budget field or the team used AI during development; neither is a priority this round.

## Three things to confirm before implementation

1. Visa: is reimagining the shopping experience sufficient, or is a specific Visa API integration mandatory? Is a test cart/sandbox enough, and is payment required?
2. Agent-related sponsors: which SDKs, services, deployment methods, or registrations are mandatory? Does development-time use count, or must the product use them at runtime?
3. Organizers: how many sponsor tracks may a project enter, are there combination restrictions, and are separate videos or additional forms required?

The public pages reviewed do not currently provide definitive answers. Prepare the same core user flow first, then choose technical interfaces after obtaining the detailed rules, rather than overbuilding for unknown conditions.

Technical references: [Gemini function calling](https://ai.google.dev/gemini-api/docs/function-calling), [Gemini image understanding](https://ai.google.dev/gemini-api/docs/image-understanding), [Convex Realtime](https://docs.convex.dev/realtime), [Convex OCC and atomicity](https://docs.convex.dev/database/advanced/occ).
