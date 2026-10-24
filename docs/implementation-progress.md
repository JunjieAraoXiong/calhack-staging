# Implementation checkpoint

The scoped local Tokyo arrival companion is implemented and verified. The updated system design and runnable `/goal` prompt remain the handoff authority. No required local-demo acceptance gate remains open.

## Architecture decisions
- React/Vite + TypeScript; Convex is the authoritative state and durable scheduler.
- Local anonymous Convex development keeps fixture data isolated in this checkout; no production deployment.
- Provider records have separate tables and mutations; effect admission is checked within each provider transaction.
- Shared domain contracts are in `shared/contracts.ts`. UI reads an aggregate snapshot; provider inspection reads authoritative provider records.
- Live provider configuration is server-side. The selected Codex CLI adapter uses existing sign-in without exporting authentication. Replay remains labeled. The optional OpenAI Responses adapter is implemented but unverified.

## Current milestone
Completed: structured-confirmation importer, React journey UI, scoped permission and budget holds, provider inspectors, two versioned sourced procedures, durable Convex controller, model proposal boundary, separate provider transactions, receipt reconciliation, fault controls, and independent scorer. Verified with Convex 1.48.0, React 19.3.1, Vite 8.3.5, TypeScript 6.0.3, and Node.js 24.22.0.

The canonical final state is one B-001 ticket on Nov 15 at 01:40, fare JPY 3,500, one JPY 500 additional charge, and H-001's original Nov 14 night with explicit acceptance until Nov 15 at 03:00. Physical arrival remains false.

Use [README](../README.md) for exact setup, model configuration, tests, reset controls, and restart commands. Use [demo script](demo-script.md) for the three-minute presentation. Fixture data persists under ignored `.convex/`; reset creates a new scenario instead of deleting evidence. At the end of the original verification, no commit or public deployment had been created.

Verification servers were stopped after the final checks. Start `npm run backend` and `npm run dev` in separate terminals to run the demo again; saved data remains available.

## Checks
| Command/check | Actual result |
| --- | --- |
| `npm run typecheck` | Passed |
| `npm run lint` | Passed |
| `npm test` | 51 passed: 25 provider and 26 runtime/import/planner tests |
| `npm run build` | Passed |
| `npm run test:live` | Actual `local-codex-cli / gpt-6.1-sol`; 13 independent assertions passed |
| `npm run test:live -- --replay` | 13 assertions passed, explicitly replay |
| `npm run test:faults` | 11/11 scenarios passed against running local Convex |
| Restart prepare → stop backend → restart → verify | 11/11 assertions; same prepared operation resumed after its lease |
| Browser replay and live flows | Imported, delayed, verified provider effects; live run finished with the tab closed |
| Browser reload/reconnect | Saved trip survived backend shutdown; accurate offline state and automatic reconnect |
| Browser error log after live completion | No errors observed |

See [verification report](verification-report.md) and [artifacts](../artifacts/README.md) for exact source hashes, provider snapshots, screenshots, and retained initial failures.

## Limits and future work
- Flight events, inventory, payments, hotel policy, and capabilities are synthetic; no commercial supplier integration.
- Import accepts the supplied structured JSON; arbitrary email/PDF extraction is deferred.
- Local processes must run for execution. No always-on production claim.
- Optional OpenAI Responses adapter is unverified; the required live gate passed with Codex CLI.
- WebMCP, live flight feeds, physical-arrival tracking, phone calls, and autonomous procedure learning remain deferred as designed.
