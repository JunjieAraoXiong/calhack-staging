# Cal Hacks Project Research

Product exploration, system designs, deployment plans, sponsor-track research, and evaluation protocols for Cal Hacks.

**Status:** research and design. This repository does not yet contain an implemented application or measured experiment results.

## Start here

- [Documentation index](docs/README.md) — the complete English design package.
- [Editable architecture diagram](docs/diagrams/README.md) — the personal-agent design in Excalidraw, with a PNG preview and an explanation of the feedback loop.
- [Personal-agent system variations](docs/14-personal-agent-system-variations.md) — six configurations, explicit pros/cons, and a recommendation informed by Stripe, Decagon, Profound, Sierra, and the supplied engineering references.
- [Persistent runtime design](docs/15-persistent-agent-runtime-design.md) — task specifications, wake-ups, memory, execution adapters, credentials, delivery, and failure-driven evaluations.
- [Experiment portfolio](docs/11-experiment-portfolio.md) — compare six product candidates and their first decisive experiments.
- [Sponsor strategy](docs/07-sponsor-track-strategy.md) — verified track names, proposed integrations, and unresolved eligibility requirements.
- [Language and integration design](docs/12-typescript-rust-convex-webmcp.md) — TypeScript/Rust responsibilities, Convex WASM support, and the two WebMCP execution paths.
- [Past Cal Hacks projects](docs/13-past-cal-hacks-projects.md) — 13 relevant award recipients from 2023–2025, their technical mechanisms, and implications for our scope.

## Product candidates

| Candidate | Focus |
|---|---|
| [DataPatch](docs/experiments/datapatch.md) | Diagnose and validate repairs to data transformations |
| [Agent Crash Lab](docs/experiments/agent-crash-lab.md) | Reproduce, inspect, and minimize agent recovery failures |
| [LiveOps](docs/experiments/liveops.md) | Repair shared schedules while preserving constraints and participant consent |
| [SupplyWatch](docs/experiments/supplywatch.md) | Connect supplier changes to affected demand and feasible alternatives |
| [SpendRail](docs/experiments/spendrail.md) | Coordinate agent spending and reconcile payment with service delivery |
| [CloseProof](docs/experiments/closeproof.md) | Investigate reconciliation exceptions through verifiable evidence |

The [original personal-agent design](docs/01-product-and-research-thesis.md) remains a separate candidate. Convex is a proposed infrastructure foundation; WebMCP is used where browser-based agent access serves the product.

## Repository layout

- `docs/` — current English architecture, product, evaluation, and delivery documents.
- `docs/experiments/` — detailed designs for the six additional product candidates.
- `docs/diagrams/` — editable Excalidraw architecture and rendered previews.
- `docs/research/` — source-specific findings, integration gates, and qualifications for the current personal-agent ecosystem.
- `research/` — earlier research notes and discussion history, translated into English and retained for provenance. Legacy `_ZH` filenames remain unchanged to preserve links.

Consult the [source register](docs/10-sources-and-evidence.md) for evidence boundaries. Proposed capabilities, planned experiments, and unconfirmed sponsor requirements are labeled throughout the documents.
