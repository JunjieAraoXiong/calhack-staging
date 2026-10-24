import { ConvexHttpClient } from 'convex/browser';
import { anyApi } from 'convex/server';
import { loadEnvFile } from 'node:process';
import { mkdir, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import type { Snapshot } from '../shared/contracts';
import { SYNTHETIC_CONFIRMATIONS } from '../shared/fixtures';
import { scoreArrangement } from '../shared/scorer';

try { loadEnvFile('.env.local'); } catch { /* Explicit environment works too. */ }
const url = process.env.VITE_CONVEX_URL || process.env.CONVEX_URL;
if (!url) throw new Error('Start npm run backend first; set VITE_CONVEX_URL to the local Convex URL.');
const client = new ConvexHttpClient(url);
const mode = process.argv.includes('--replay') ? 'replay' : 'live';
const start = Date.now();
const scenarioId = await client.mutation(anyApi.trips.createScenario,{mode});
await client.mutation(anyApi.trips.importConfirmations,{scenarioId,text:SYNTHETIC_CONFIRMATIONS});
await client.mutation(anyApi.trips.event,{scenarioId,eventId:'acceptance-delay-1',kind:'delay'});
let snapshot: Snapshot;
let failure: string | null = null;
for (;;) {
  snapshot = await client.query(anyApi.trips.snapshot,{scenarioId}) as Snapshot;
  if (snapshot.trip.status === 'arrangements_confirmed') break;
  if (Date.now()-start > 180_000 || ['needs_help','needs_information','awaiting_decision'].includes(snapshot.trip.status) && snapshot.trip.delayed) {
    failure = `Scenario ${scenarioId} incomplete: ${snapshot.trip.status}: ${snapshot.trip.message}`;
    break;
  }
  await new Promise(r=>setTimeout(r,500));
}
const providerTransport = await client.query(anyApi.providers.inspectTransport,{scenarioId});
const providerHotel = await client.query(anyApi.providers.inspectHotel,{scenarioId});
const checks = scoreArrangement(snapshot);
checks.push({name:'one canonical amendment and charge',pass:snapshot.transport.amendments===1&&snapshot.transport.totalAdditionalCharged===500&&snapshot.transport.booking.serviceId==='S-target',detail:JSON.stringify({amendments:snapshot.transport.amendments,charged:snapshot.transport.totalAdditionalCharged,service:snapshot.transport.booking.serviceId})});
checks.push({name:'declared model mode actually used',pass:snapshot.traces.some(t=>t.mode===mode&&(mode==='replay'||t.provider!=='replay')),detail:snapshot.traces.map(t=>`${t.mode}/${t.provider}/${t.model}`).join(', ')});
// Repeat exact event ID after success: no second effect or revision.
await client.mutation(anyApi.trips.event,{scenarioId,eventId:'acceptance-delay-1',kind:'delay'});
const afterDuplicate = await client.query(anyApi.trips.snapshot,{scenarioId}) as Snapshot;
checks.push({name:'event redelivery preserves single amendment',pass:afterDuplicate.transport.amendments===1&&afterDuplicate.transport.totalAdditionalCharged===500,detail:`amendments=${afterDuplicate.transport.amendments}`});
await mkdir('artifacts',{recursive:true});
const report = {timestamp:new Date().toISOString(),scenarioId,mode,fixtureVersion:snapshot.trip.fixtureVersion,revision:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),workingTree:'uncommitted implementation; inspect accompanying source',elapsedMs:Date.now()-start,checks,providerTransport,providerHotel,snapshot};
const path = failure ? `artifacts/acceptance-${mode}-failed-${Date.now()}.json` : `artifacts/acceptance-${mode}.json`;
await writeFile(path,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({scenarioId,mode,checks,failure,artifact:path},null,2));
if (failure || checks.some(c=>!c.pass)) process.exitCode=1;
