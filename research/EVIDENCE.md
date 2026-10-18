# Evidence Table: Personal Agent × WebMCP

Accessed and compiled on 2026-10-17. The sources below are official documentation, vendor material, and Devpost author self-reports; we have not independently run these products or reproduced their performance. The implications in the tables are our research judgments. Pages may contain updates made after the competition, so current capabilities cannot establish why a project won.

## Events and technology

| Source | What the reviewed material supports | Implication for topic selection |
|---|---|---|
| [Cal Hacks 13.0](https://cal-hacks-13-0.devpost.com/) | Judging criteria: Application, Intentionality, Functionality, Creativity, Technical Complexity; three-minute pitch and two-minute Q&A; project repository and local demo recording required; project work must be completed during the competition | Prioritize a small, complete workflow. After the web retrieval tool failed, public raw HTML was read through curl; the five criteria's weights were not found |
| [Cal Hacks official website](https://www.calhacks.io/) | Describes a 36-hour event; advance ideation is permitted, but project implementation must take place during the event | This round produces research documents only |
| [WebMCP Challenge](https://webmcp.devpost.com/) | A separate event held from 2026-08-25 to 09-04, now concluded; emphasizes people and agents operating together | Use only as a source of examples; its entry rules are not Cal Hacks rules |
| [WebMCP gallery](https://webmcp.devpost.com/project-gallery) | The page displayed 2,473 entries during this review, with some labeled Winner | A large sample exists, but this research did not audit every entry; no claim that a capability is absent across the entire field |
| [Chrome overview](https://developer.chrome.com/docs/ai/webmcp) | WebMCP exposes websites' semantic tools and remains under development with experimental support | Pin the demo browser; do not assume default support in every browser |
| [Chrome imperative API](https://developer.chrome.com/docs/ai/webmcp/imperative-api) | Currently uses document.modelContext; tool registration, discovery, and execution; explicit authorization requirements for cross-origin frames | WebMCP is not a universal remote control for arbitrary websites; prefer same-origin operation for the first version |
| [WebMCP draft](https://webmachinelearning.github.io/webmcp/) | Document-bound tool interface; draft status | Do not claim it is a finalized W3C standard; background scheduling and persistent memory require separate implementation |
| [Specification PR #184](https://github.com/webmachinelearning/webmcp/pull/184) | Migration of the getter from navigator to Document merged on 2026-05-27 | Do not copy older examples without checking them |
| [GoogleChromeLabs example extension](https://github.com/GoogleChromeLabs/webmcp-extension) | A sidebar agent discovers and invokes page tools; the current README requires Chrome 155+ and Node 22.18+; each tab has a separate session | An example is not a production commitment and does not automatically provide shared memory across tabs; not installed or run in this round |
| [Page Agent example](https://github.com/GoogleChromeLabs/webmcp-tools/tree/main/demos/page-agent) | Demonstrates a page agent and iframe tools; includes a polyfill path | A runnable example does not establish that the native protocol path has been verified |
| [WebMCP Evals](https://github.com/GoogleChromeLabs/webmcp-tools/tree/main/webmcp-evals) | Provides evaluation modes including smoke, browser, and simulate | A reference for future fixed final-state evaluation; not run in this round |

## Established products and infrastructure

| Product | Overlap described in official material | Research judgment |
|---|---|---|
| [Reclaim Habit Agent](https://help.reclaim.ai/en/articles/17124978-habit-agent-overview-automate-recurring-routines) | Preference-driven habit scheduling, moving, minimum duration, and locking after a manual move | Ordinary personal schedule repair is insufficiently differentiated |
| [Motion](https://www.usemotion.com/help/time-management/auto-scheduling/reference-auto-scheduling/how-auto-scheduling-works-behind-the-scenes) | Reschedules tasks after conflicts | Automatic rescheduling itself is not new |
| [Amazon Alexa for Shopping](https://www.aboutamazon.com/news/retail/alexa-for-shopping-ai-assistant) | Shopping preferences, purchase history, conversation, and purchasing on the user's behalf | General personalized shopping faces established products |
| [ReturnQueen](https://returnqueen.com/return) | Centralized returns, labels, deadlines, pickup, and refund tracking | Return reminders or an order dashboard are insufficient; actual logistics is its advantage |
| [Ohai](https://www.ohai.ai/) | Family calendars, converting information into tasks, household chores, and meal coordination | An all-purpose family assistant is broad in scope and already faces competition |
| [Bardeen](https://www.bardeen.ai/posts/automation-assistant-beta) | Observes actions and patterns, then generates automations | Learning from a single demonstration is not sufficient on its own as a novelty claim |
| [Mem0 OpenMemory](https://mem0.ai/blog/introducing-openmemory-mcp) | Shared persistent memory across MCP clients and a management UI | Infrastructure for a personal memory store already exists |
| [Visa Intelligent Commerce](https://www.visa.com/en-us/solutions/intelligent-commerce) | Credentials, controls, and authentication related to agent transactions | A consumer use case may fit the sponsor, but which interfaces are available to hackathon participants has not been established |
| [Visa consumer research](https://corporate.visa.com/en/products/intelligent-commerce/earning-trust-report.html) | Discusses shopping, post-purchase tasks, and demand for user control | A vendor survey supports background research, not validated demand for this project |

## WebMCP project sample

| Project | Capabilities described by the author | Counterevidence or implications for the current hypothesis |
|---|---|---|
| [Aisle · Winner](https://devpost.com/software/aisle-ai-wedding-seating) | Seating plans, locks, conflict repair with few moves, and proposal acceptance and withdrawal | A complete example of minimal-disruption repair already exists |
| [Alza · Winner](https://devpost.com/software/alza) | 2D/3D spaces, geometry checks, self-repair, and cross-origin supplier tools | Visualization, self-checking, and cross-site composition are not exclusive differentiators |
| [Bouquet Studio · Winner](https://devpost.com/software/bouquet-studio) | Turns intent into bouquets; people and agents adjust floral composition, with versions and undo | Visible outcomes and a complete experience are useful lessons |
| [Runline](https://devpost.com/software/runline) | Repairs disruptions to events or weekly class schedules; locks, affected-person confirmation, alternatives, and version protection | A direct counterpart to the original scheduling proposal; production identity and external calendars remain future work |
| [Day Canvas](https://devpost.com/software/day-canvas) | People and agents share a calendar canvas, with add/delete/move actions and free-time queries | Changing a calendar with a spoken or written instruction already has a direct example |
| [Moodle WebMCP](https://devpost.com/software/openlms-webmcp) | Moodle plugin, assignment and course reading, study plans, and rubric assistance | General campus study assistance is not an empty field; deep, real integration is more valuable |
| [Recall](https://devpost.com/software/recall-user-controlled-ai-memory) | User-controlled memory, tool permissions, short-lived capabilities, and revocation | Memory ownership and permissions are not new selling points |
| [Mandate · Winner](https://devpost.com/software/mandate-ix29ek) | Record-, field-, and time-scoped authorization, dynamic tools, and server-side validation | A general authorization layer is insufficiently differentiated |
| [Accessible Action Mode](https://devpost.com/software/accessible-action-mode-returns-exchanges) | Conditional returns/exchanges across multiple items; the author explicitly states that Shopify access is read-only and execution is locally simulated | Direct overlap already exists for combined return/exchange plans; do not describe a simulated request as a real refund |
| [ProofDone](https://devpost.com/software/proofdone) | Checks multiple conditions for cancellation, refunds, and fulfillment; handles stale proposals and duplicate execution | A dedicated project already treats verification as a condition of completion |
| [RelayPay](https://devpost.com/software/relaypay) | Investigation, escalation, and verification of refunds that have not arrived | Recovering post-purchase funds is not an empty field; the author describes the current demonstration as deterministic |
| [Concord](https://devpost.com/software/concord-an-agent-that-cannot-overpromise) | Cross-origin travel transactions, compensation, recovery, and receipts | Cross-site rollback/receipt mechanisms themselves have precedents |
| [Spokes](https://devpost.com/software/spokes-sd13ax) | Multiple personal agents negotiate on a map, with public/private constraints and infeasibility handling | Private multi-agent negotiation should not be the sole innovation claim |
| [Waggle](https://devpost.com/software/waggle-webmcp) | Memory correction, precise human approval, re-retrieval, lineage, and rejection of proposals based on old versions | The closest relevant comparison for the memory-repair proposal. Differentiation must lie in dependencies and local replanning of already-generated tasks |
| [Lorekeeper](https://devpost.com/software/extenddb-memory-ledger) | People and agents jointly write memory; conditional updates protect human corrections | Version checks are not new; they are an expected property of a reliable implementation |
| [GroundTrace](https://devpost.com/software/groundtrace-webmcp) | Attaches outcomes, sources, and verification status to operational memory to decide whether it can be relied on | Having a source does not make information immediately actionable; this is not the main direction selected in this round |

## Same-name entities and evidence boundaries

[Devpost Deputy](https://devpost.com/software/deputy) and [Razin Deputy](https://razin.ai/deputy) should not be treated as the same project. The former author's page describes deriving tools from demonstrations; the latter describes bridging webpage forms and controls to tools. The research's earlier conflation has been withdrawn; the main conclusion does not depend on this ambiguous comparison.

This table does not reproduce full webpages, adopt projects' self-reported performance figures, or infer precise reasons for winning from Winner labels. The links above support subsequent source-by-source review.
