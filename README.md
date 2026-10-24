# Travel Personal Agent — Cal Hacks Project

Active design: a persistent travel assistant that coordinates an existing airport transfer and hotel booking after a flight delay. Earlier product exploration, deployment plans, sponsor research, and evaluation protocols remain available as reference.

**Status:** the scoped local implementation is complete and verified: 51 automated tests, live-model provider-backed execution, fault scenarios, browser flow, and backend restart recovery. See the [verification report](docs/verification-report.md) for evidence and limits. Bookings and payments remain controlled simulations.

## Run locally

Requires Node.js 22.12+ and npm; verified with Node.js 24.22.0. The lockfile pins the installed dependencies. No production account or commercial booking credentials are required for the controlled providers.

```sh
npm ci
npm run backend
```

Keep the backend terminal open. On first use, Convex creates an anonymous local deployment, persists its state in the ignored `.convex/` directory, and writes the frontend URL to `.env.local`. In a second terminal:

```sh
npm run dev
```

Open the printed local Vite URL. Create a scenario, load the supplied synthetic confirmations, import them, and inject a flight delay. Each reset creates a separate scenario; previous provider evidence remains intact. Closing the UI does not stop Convex work. Stopping the local backend does stop execution until it is restarted.

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm run test:live -- --replay
npm run test:live
npm run test:faults
```

The last three commands require the backend to be running. `test:live -- --replay` uses labeled deterministic replay, `test:live` uses an actual model, and `test:faults` runs isolated failure scenarios in replay. Each independently inspects provider outcomes and writes JSON under `artifacts/`.

### Live model

The verified local adapter uses an existing Codex CLI sign-in. Check `codex login status`; if needed, sign in using the CLI's normal `codex login` flow. Live mode defaults to `codex-cli` and `gpt-6.1-sol`. It runs a bounded, ephemeral, read-only inference in a temporary directory, with user configuration disabled. It never reads or exports authentication tokens. The model receives synthetic structured facts; provider effects remain controlled by the application. For a different supported configuration:

```sh
npx convex env set ARRIVAL_MODEL_PROVIDER codex-cli
npx convex env set ARRIVAL_MODEL your-supported-model
npx convex env set ARRIVAL_CODEX_BIN /absolute/path/to/codex
```

These variables belong to Convex's server environment. Copying them into Vite's `.env.local` does not configure an action. An optional OpenAI Responses adapter is implemented (`ARRIVAL_MODEL_PROVIDER=openai`, `ARRIVAL_MODEL`, `OPENAI_API_KEY`); it requires your own server-side API credential and was not exercised in the recorded local run. Use the Convex environment tooling to supply it; never commit a key or use a `VITE_` secret.

### Persistence and restart verification

With the backend running, `npm run test:restart:prepare` creates a paused scenario and claims a bounded run. Stop **this project's** backend terminal with Ctrl-C, restart `npm run backend`, then run `npm run test:restart:verify`. The persisted scheduler resumes after the run's 150-second real-time lease; the synthetic trip clock remains frozen. The verifier checks the same operation identity, a single amendment, provider acceptance, and cost. Do not delete `.convex/` during the test.

The UI's **Demo controls** supports a new accepted/pending/declined scenario, injected delays, duplicate delivery, lost responses, unavailable lookup/provider, pre-commit pause, removed inventory, access changes, and revocation. Reset creates a new namespace and does not delete old evidence. The importer accepts the supplied structured JSON format; free-form email parsing is deferred.

See the [three-minute demo script](docs/demo-script.md), [acceptance evidence](artifacts/README.md), and [implementation checkpoint](docs/implementation-progress.md). This local fixture has no production authentication or commercial supplier integration; keep it on loopback.

The demo uses synthetic flight events, inventory, payments, and hotel rules. A real model call does not turn these into commercial integrations. Public deployment, real purchases, hotel messages, and production flight feeds are outside this project milestone.

## Start here

- [Active travel system design](docs/16-travel-agent-system-design.md) — authoritative architecture, domain contracts, finite fixture, and acceptance criteria.
- [Runnable /goal prompt](docs/prompts/travel-agent-goal.md) — copy into an implementation chat in this repository to build and verify the scoped product.
- [Travel delivery roadmap and demo](docs/08-delivery-roadmap-and-demo.md) — implementation milestones and the proposed three-minute arrival story.
- [Travel competitive research](exa-results/travel-personal-agent-2026-10-22.md) — existing products, local procedures, evidence, and the rationale for this scope.
- [Documentation index](docs/README.md) — the complete English design package.
- [Editable system atlas](docs/diagrams/atlas/README.md) — earlier general-runtime whiteboards; the active travel topology is in design 16.
- [Personal-agent system variations](docs/14-personal-agent-system-variations.md) — six configurations, explicit pros/cons, and a recommendation informed by Stripe, Decagon, Profound, Sierra, and the supplied engineering references.
- [Persistent runtime design](docs/15-persistent-agent-runtime-design.md) — task specifications, wake-ups, memory, execution adapters, credentials, delivery, and failure-driven evaluations.
- [Experiment portfolio](docs/11-experiment-portfolio.md) — compare six product candidates and their first decisive experiments.
- [Sponsor strategy](docs/07-sponsor-track-strategy.md) — verified track names, proposed integrations, and unresolved eligibility requirements.
- [Language and integration design](docs/12-typescript-rust-convex-webmcp.md) — TypeScript/Rust responsibilities, Convex WASM support, and the two WebMCP execution paths.
- [Past Cal Hacks projects](docs/13-past-cal-hacks-projects.md) — 13 relevant award recipients from 2023–2025, their technical mechanisms, and implications for our scope.

## Earlier product candidates

| Candidate | Focus |
|---|---|
| [DataPatch](docs/experiments/datapatch.md) | Diagnose and validate repairs to data transformations |
| [Agent Crash Lab](docs/experiments/agent-crash-lab.md) | Reproduce, inspect, and minimize agent recovery failures |
| [LiveOps](docs/experiments/liveops.md) | Repair shared schedules while preserving constraints and participant consent |
| [SupplyWatch](docs/experiments/supplywatch.md) | Connect supplier changes to affected demand and feasible alternatives |
| [SpendRail](docs/experiments/spendrail.md) | Coordinate agent spending and reconcile payment with service delivery |
| [CloseProof](docs/experiments/closeproof.md) | Investigate reconciliation exceptions through verifiable evidence |

The [original shopping design](docs/01-product-and-research-thesis.md) and the candidates above remain research history. The travel implementation reuses their persistent-state and verified-execution principles. Convex is the selected design foundation; the mandatory demo path uses server adapters to controlled providers, with WebMCP an optional separately verified adapter.

## Repository layout

- `docs/` — current English architecture, product, evaluation, and delivery documents.
- `docs/experiments/` — detailed designs for the six additional product candidates.
- `docs/diagrams/` — the original mission-loop whiteboard and the complete editable system atlas, with rendered previews.
- `docs/research/` — source-specific findings, integration gates, and qualifications for the current personal-agent ecosystem.
- `research/` — earlier research notes and discussion history, translated into English and retained for provenance. Legacy `_ZH` filenames remain unchanged to preserve links.
- `exa-results/` — October 22 travel research and source-specific workstream notes.
- `docs/prompts/` — copy-ready implementation prompts; storing a prompt does not start a goal.
- `src/` — traveler UI, evidence view, provider inspectors, and scenario controls.
- `convex/` — durable controller, model adapter, authoritative providers, and state schema.
- `shared/` — contracts, fixtures, curated procedures, deterministic validation, and independent scorer.
- `tests/`, `scripts/`, `artifacts/` — automated checks, running-backend acceptance probes, and recorded results.

Consult the [source register](docs/10-sources-and-evidence.md) for evidence boundaries. Proposed capabilities, planned experiments, and unconfirmed sponsor requirements are labeled throughout the documents.
