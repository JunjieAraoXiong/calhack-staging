# Verification artifacts

This directory holds actual run evidence, not seeded success claims. `npm run test:live` writes `acceptance-live.json`; `npm run test:live -- --replay` writes `acceptance-replay.json` after a successful provider-backed run.

Reports include the isolated scenario ID, execution mode/model metadata, fixture version, source revision context, authoritative provider inspection results, operations, and independently computed assertions. A replay report does not satisfy the live-model gate. Failures and unrun cases belong in the implementation checkpoint and final verification report.

Recorded results: `acceptance-live.json` and `acceptance-replay.json` each pass 13 assertions; `acceptance-faults.json` passes 11 native scenarios; `acceptance-restart.json` passes 11 assertions after a real backend restart. `browser-live-state.json` and `browser-live-confirmed.png` document the UI flow. `source-manifest.json` hashes the source. Initial failures are retained and explained in [the verification report](../docs/verification-report.md).
