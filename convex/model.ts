'use node';
import { internalAction } from './_generated/server';
import { v } from 'convex/values';
import { spawn } from 'node:child_process';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Snapshot } from '../shared/contracts';
import { applicableProcedures, candidates, validateDecision } from '../shared/planner';

const schema={type:'object',additionalProperties:false,properties:{action:{type:'string',enum:['arrange','ask','wait','stop']},serviceId:{type:['string','null']},reason:{type:'string'}},required:['action','serviceId','reason']};
export const decide=internalAction({args:{snapshot:v.any()},handler:async(_ctx,args)=>{
  const s=args.snapshot as Snapshot;
  const context={procedures:applicableProcedures(s),timezone:s.trip.timezone,now:s.trip.now,readyAtStop:{from:s.trip.readyFrom,to:s.trip.readyTo,assumption:'Synthetic interval includes immigration, bags and walking'},boardingBufferMs:s.trip.boardingBufferMs,hotelRequestedUntil:s.trip.hotelRequestedUntil,hotel:s.hotel.booking,transport:s.transport.booking,feasibleCandidates:candidates(s.trip,s.transport,s.hotel),additionalBudget:{cap:s.trip.grant.cap,charged:s.trip.charged,held:s.trip.held},pendingHotelAllowed:s.trip.grant.allowTransportWhileHotelPending};
  const prompt='You propose a remaining Tokyo arrival arrangement using only this supplied structured snapshot. Do not use any tools, files, network, or external knowledge. All inventory is synthetic. Choose action arrange and an observed feasible candidate serviceId when there is a feasible candidate; choose ask with null serviceId otherwise. Prefer earliest feasible arrival then lower additional cost. The arrange action proposes a conditional sequence: first request hotel late-arrival acceptance until hotelRequestedUntil, then refresh the transport quote and amend the bus only after hotel acceptance. When pendingHotelAllowed is false, that prohibits committing the bus while the hotel is pending; it does not prohibit proposing this sequence or requesting the hotel decision. Current default hotel cutoff does not invalidate a candidate whose arrival fits the requested later bound, because gaining that hotel acceptance is the first step. If the hotel declines or remains pending without authorization, the controller preserves the bus. Do not invent hotel acceptance or authorize actions. Deterministic guards and independent providers enforce all effects. Reply only with the required JSON object and a short user-readable reason. Snapshot: '+JSON.stringify(context);
  const provider=process.env.ARRIVAL_MODEL_PROVIDER??'codex-cli';
  if(provider==='openai'){
    const key=process.env.OPENAI_API_KEY;const model=process.env.ARRIVAL_MODEL??'gpt-6';
    if(!key)throw new Error('Live model requires OPENAI_API_KEY in the Convex server environment');
    const response=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({model,input:prompt,text:{format:{type:'json_schema',name:'arrival_decision',strict:true,schema}}}),signal:AbortSignal.timeout(100000)});
    if(!response.ok)throw new Error(`Live model API returned HTTP ${response.status}`);
    const body=await response.json() as any;
    const output=(body.output??[]).flatMap((item:any)=>item.content??[]).filter((item:any)=>item.type==='output_text').map((item:any)=>item.text).join('');
    return {decision:validateDecision(JSON.parse(output)),provider:'openai-responses',model:body.model??model,requestId:body.id??null};
  }
  if(provider!=='codex-cli')throw new Error('Unknown live model provider');
  // Local-only adapter: uses the CLI's supported existing sign-in, never reads or exports tokens.
  const directory=await mkdtemp(join(tmpdir(),'arrival-model-'));const outputPath=join(directory,'decision.json');const schemaPath=join(directory,'schema.json');
  const model=process.env.ARRIVAL_MODEL??'gpt-6.1-sol';
  try {
    await writeFile(schemaPath,JSON.stringify(schema));
    const output=await new Promise<string>((resolve,reject)=>{
      const child=spawn(process.env.ARRIVAL_CODEX_BIN??'codex',['exec','--ephemeral','--ignore-user-config','--sandbox','read-only','--skip-git-repo-check','--model',model,'--output-schema',schemaPath,'--output-last-message',outputPath,'--json','-'],{cwd:directory,env:process.env,stdio:['pipe','pipe','pipe']});
      let stdout='';let stderr='';
      const timer=setTimeout(()=>{child.kill('SIGTERM');reject(new Error('Live model CLI timed out'));},100000);
      child.stdout.on('data',chunk=>{stdout+=String(chunk);if(stdout.length>200000)stdout=stdout.slice(-200000);});
      child.stderr.on('data',chunk=>{stderr+=String(chunk);if(stderr.length>2000)stderr=stderr.slice(-2000);});
      child.on('error',()=>{clearTimeout(timer);reject(new Error('Live model CLI is unavailable on this local backend'));});
      child.on('close',code=>{clearTimeout(timer);if(code===0)resolve(stdout);else reject(new Error(`Live model CLI failed (exit ${code}); check local Codex sign-in and model configuration. ${stderr.includes('not supported')?'The selected model is not supported.':''}`));});
      child.stdin.end(prompt);
    });
    const events=output.split('\n').flatMap(line=>{try{return[JSON.parse(line)];}catch{return[];}});
    const thread=events.find(e=>e.type==='thread.started');
    return {decision:validateDecision(JSON.parse(await readFile(outputPath,'utf8'))),provider:'local-codex-cli',model,requestId:thread?.thread_id??null};
  } finally {await rm(directory,{recursive:true,force:true});}
}});
