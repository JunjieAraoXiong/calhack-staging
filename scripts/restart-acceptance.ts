import { ConvexHttpClient } from 'convex/browser';
import { anyApi } from 'convex/server';
import { loadEnvFile } from 'node:process';
import { execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import type { Snapshot } from '../shared/contracts';
import { SYNTHETIC_CONFIRMATIONS } from '../shared/fixtures';
import { scoreArrangement } from '../shared/scorer';
try{loadEnvFile('.env.local');}catch{/* environment supplied */}
const c=new ConvexHttpClient(process.env.VITE_CONVEX_URL||'http://127.0.0.1:3210');
const path='artifacts/restart-probe.json';
if(process.argv[2]==='prepare'){
  const scenarioId=await c.mutation(anyApi.trips.createScenario,{mode:'replay'});
  await c.mutation(anyApi.trips.importConfirmations,{scenarioId,text:SYNTHETIC_CONFIRMATIONS});
  await c.mutation(anyApi.trips.configure,{scenarioId,change:'pauseBeforeCommit',value:true});
  await c.mutation(anyApi.trips.event,{scenarioId,kind:'delay',eventId:'restart-delay'});
  let before:Snapshot;
  const start=Date.now();
  do{before=await c.query(anyApi.trips.snapshot,{scenarioId});if(before.trip.checkpoint==='paused_before_commit')break;await new Promise(r=>setTimeout(r,100));}while(Date.now()-start<10000);
  assert.equal(before!.trip.checkpoint,'paused_before_commit');
  // Claim a run, then terminate the owned backend before its lease completes. This is an explicit interrupted-run probe.
  const claim=JSON.parse(execFileSync('npx',['convex','run','runtime:claim',JSON.stringify({scenarioId})],{encoding:'utf8'}));
  assert.ok(claim?.token,'A run must be claimed before restart');
  await c.mutation(anyApi.trips.configure,{scenarioId,change:'pauseBeforeCommit',value:false});
  await writeFile(path,JSON.stringify({scenarioId,preparedAt:new Date().toISOString(),before,claimToken:claim.token},null,2)+'\n');
  console.log(JSON.stringify({scenarioId,next:'Stop and restart the owned local Convex process now. Then run this script with verify.'}));
}else if(process.argv[2]==='verify'){
  const probe=JSON.parse(await readFile(path,'utf8'));
  const start=Date.now();let after:Snapshot;
  do{after=await c.query(anyApi.trips.snapshot,{scenarioId:probe.scenarioId});if(after.trip.status==='arrangements_confirmed')break;await new Promise(r=>setTimeout(r,1000));}while(Date.now()-start<180000);
  const checks=scoreArrangement(after!);
  checks.push({name:'prepared operation identity retained through backend restart',pass:probe.before.operations.every((o:{operationId:string})=>after.operations.some(p=>p.operationId===o.operationId)),detail:probe.before.operations.map((o:{operationId:string})=>o.operationId).join(', ')});
  await writeFile('artifacts/acceptance-restart.json',JSON.stringify({...probe,verifiedAt:new Date().toISOString(),after,checks},null,2)+'\n');
  console.log(JSON.stringify({scenarioId:probe.scenarioId,checks},null,2));
  assert.ok(checks.every(check=>check.pass),'Restart must resume to independently verified provider outcomes');
}else throw new Error('Use prepare, restart the local backend, then verify.');
