import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';

async function files(directory:string):Promise<string[]>{
  const entries=await readdir(directory,{withFileTypes:true});
  const nested=await Promise.all(entries.map(e=>e.isDirectory()?files(`${directory}/${e.name}`):Promise.resolve([`${directory}/${e.name}`])));
  return nested.flat();
}
const paths=(await Promise.all(['src','convex','shared','tests','scripts'].map(files))).flat().concat(['package.json','package-lock.json','index.html','tsconfig.json','vite.config.ts','vitest.config.ts','eslint.config.js']).sort();
const hashes=await Promise.all(paths.map(async path=>({path,sha256:createHash('sha256').update(await readFile(path)).digest('hex')})));
const sourceDigest=createHash('sha256').update(JSON.stringify(hashes)).digest('hex');
await writeFile('artifacts/source-manifest.json',JSON.stringify({at:new Date().toISOString(),gitBase:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),workingTree:'Implementation is uncommitted; hashes identify exact source files.',sourceDigest,files:hashes},null,2)+'\n');
console.log(`Recorded ${hashes.length} source files; SHA-256 ${sourceDigest}`);
