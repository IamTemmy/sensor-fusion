import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const exec=promisify(execFile),levels=['rookie','normal','pro'];
const engineHash=createHash('sha256').update(readFileSync('lib/noise/engine.ts')).digest('hex');
const policyHash=createHash('sha256').update(readFileSync('scripts/simulate-noise-v17.ts')).digest('hex');
const file='docs/playtests/v20/difficulty-matrix.json';let report;
try{report=JSON.parse(readFileSync(file,'utf8'));}catch{}
if(report?.engineHash!==engineHash||report?.policyHash!==policyHash){
 const cells=await Promise.all(levels.map(async difficulty=>{
  const {stdout}=await exec(process.execPath,['--experimental-strip-types','scripts/simulate-noise-v17.ts'],{env:{...process.env,SIM_DIFFICULTY:difficulty,SIM_COUNT:'40',SIM_SEED:'1001',SIM_MODE:''},maxBuffer:4*1024*1024});return JSON.parse(stdout);
 }));
 report={engineHash,policyHash,seeds:'1001–1040',matches:240,cells};mkdirSync('docs/playtests/v20',{recursive:true});writeFileSync(file,JSON.stringify(report,null,2)+'\n');
}
for(const mode of ['coop','duos']){
 const cells=levels.map(d=>report.cells.find(c=>c.difficulty===d).results.find(r=>r.mode===mode));
 assert.ok(cells.every(c=>c.n>=40),'At least 40 seeds required in each cell');
 console.log(mode,levels.map((d,i)=>`${d}: ${(cells[i].winRate*100).toFixed(1)}%`).join(' · '));
 assert.ok(cells[0].winRate>cells[1].winRate&&cells[1].winRate>cells[2].winRate,`${mode}: difficulty order must be Rookie > Normal > Pro`);
}
console.log('Difficulty ordering gate passed (same 40 seeds, naive collector + Auto Echo).');
