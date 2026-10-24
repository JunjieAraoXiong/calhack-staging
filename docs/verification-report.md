# Tokyo arrival companion: verification report

Verified October 22, 2026 (America/Los_Angeles), using Node.js 24.22.0, Convex 1.48.0, React 19.3.1, and Vite 8.3.5. At verification time, the source was uncommitted; [source-manifest.json](../artifacts/source-manifest.json) identifies the implementation files by SHA-256.

Publication checks on October 23, 2026 passed typechecking, ESLint, all 51 automated tests, and the production build again. All 34 source-file hashes matched the original manifest. The saved live, replay, fault, and restart evidence below was preserved from the original verification.

Verified story: import existing synthetic commitments → inject a material delay → select applicable local procedures and call a real model → obtain hotel acceptance → refresh the quote and amend the existing bus → read back authoritative provider outcomes → display confirmed arrangements.

## Results

Typecheck, ESLint, and production build passed. The automated suite passed **51 tests** (25 provider, 26 runtime/import/planning). Those tests use `convex-test`, a mock backend; separate running-backend checks below exercise actual persisted Convex functions and scheduling.

| Acceptance boundary | Evidence |
| --- | --- |
| Canonical live-model completion | [13/13 assertions](../artifacts/acceptance-live.json); actual `local-codex-cli / gpt-6.1-sol` call and provider mutations |
| Replay mechanics | [13/13 assertions](../artifacts/acceptance-replay.json); explicitly labeled replay |
| Readiness and after-midnight date | Tests exclude S-early; final bus service date is Nov 15 while hotel night remains Nov 14 |
| Hotel arrival bound | Tests reject S-late's 03:05 arrival against the 03:00 accepted bound |
| Cutoff and dispatch buffer | Tests permit provider commit at 22:55 exactly, reject +1 ms, and prevent initial/resumed dispatch after 22:54:30 |
| Scoped guest access | Missing, expired, wrong-booking, and member-channel tests block the guest procedure |
| Pending and declined hotel | Tests and [native faults](../artifacts/acceptance-faults.json) distinguish submission from acceptance; default pending performs no bus change; authorized provisional change stays partial |
| Lost response and uncertain cost | Native scenario commits one amendment, holds JPY 500 while lookup is unavailable, and reconciles the same operation after cancellation |
| Duplicate requests/events | Provider idempotence and repeated-event checks preserve one amendment/charge; changed arguments under the same ID are rejected |
| Stale proposals/authority | Tests change intent, grant, stop epoch, booking/quote/inventory revisions, and hold amounts after preparation; provider commit rejects invalid effects |
| Unknown budget and lowered cap | Tests retain unknown holds, avoid double-counting backed charges, and preserve spent money while surfacing a lower-cap conflict |
| Inventory removed | Native case removes S-target; original booking remains and no feasible alternative is invented |
| Obsolete deadlines | Old booking-revision timer cannot invalidate amended ticket; current intent and amended booking get new timer records |
| Later delay | Native case reopens a confirmed trip, preserves effects, and displays needs-help when no remaining service fits |
| Restart | [11/11 assertions](../artifacts/acceptance-restart.json) after stopping/restarting the actual backend; same prepared operation survives and completes after its persisted lease |
| UI closure/reconnect | Live run finished after its tab was closed. Reopening showed verified arrangements. Backend shutdown displayed a disconnected state, followed by restored records |
| Terminal predicate | Independent assertions require feasible transport and explicit applicable hotel acceptance; physical arrival remains false |

The native fault matrix passed **11/11 scenarios**. This is fixture coverage, not a production reliability estimate or evidence of competitive superiority.

## Browser evidence

The actual UI flow covered scenario creation, import, delay injection, provider inspection, live-mode selection, tab closure during evaluation, and reopening. The visible trace named the real model and request ID. No errors were observed in the checked browser log after completion.

Browser live scenario: `e15f0122-e4d0-40b6-ad7d-5ea8143bbe6e`. Its [persisted state](../artifacts/browser-live-state.json) contains one bus amendment and one hotel request. The [screenshot](../artifacts/browser-live-confirmed.png) shows the live-mode label and verified arrangement.

## Failures found and fixed

The first live attempt conservatively asked for help because the prompt did not distinguish conditional hotel-first planning from permission to amend while acceptance is pending. The prompt now describes that sequence; code still independently guards every effect. The [initial failed trace](../artifacts/live-initial-failure.json) is retained.

The initial native fault matrix found that re-entering an amended-but-pending trip could incorrectly seek another service. The controller now retains the feasible existing ticket and stays partial. [Initial fault results](../artifacts/faults-initial-failure.json) remain alongside the passing rerun.

Review also fixed dispatch-buffer enforcement on resume, deadline registration, lowered-cap conflicts, malformed import handling, impossible readiness intervals, and recovery after exceptions with unresolved operations. Focused tests cover these boundaries.

## Unverified and deferred

Inventory, transactions, flight events, capabilities, and hotel policy remain synthetic. The optional OpenAI Responses adapter has not been exercised; the selected Codex CLI live provider satisfies the required model gate. Production hosting/authentication, commercial supplier access, free-form email extraction, WebMCP, live flight feeds, and physical-arrival tracking are outside this completed local milestone. Local backend and frontend processes must be started using the README commands.
