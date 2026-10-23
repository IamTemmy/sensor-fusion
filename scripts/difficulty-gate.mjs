import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const exec=promisify(execFile),levels=['rookie','normal','pro'];
const engineHash=createHash('sha256').update(readFileSync('lib/noise/engine.ts')).update(readFileSync('lib/noise/arenas.ts')).digest('hex');
const policyHash=createHash('sha256').update(readFileSync('scripts/simulate-noise-v17.ts')).digest('hex');
const file='docs/playtests/v33/difficulty-matrix.json';let report;
try{report=JSON.parse(readFileSync(file,'utf8'));}catch{}
if(report?.engineHash!==engineHash||report?.policyHash!==policyHash){
 const cells=await Promise.all(levels.map(async difficulty=>{
  const parts=await Promise.all(['coop','duos'].map(async mode=>{
   const {stdout}=await exec(process.execPath,['--experimental-strip-types','scripts/simulate-noise-v17.ts'],{env:{...process.env,SIM_DIFFICULTY:difficulty,SIM_COUNT:'40',SIM_SEED:'1001',SIM_MODE:mode},maxBuffer:4*1024*1024});
   const result=JSON.parse(stdout);console.log(`${mode} ${difficulty}: ${(result.results[0].winRate*100).toFixed(1)}% complete`);return result;
  }));return {...parts[0],results:parts.flatMap(p=>p.results)};
 }));
 report={engineHash,policyHash,seeds:'1001–1040',matches:240,cells};mkdirSync('docs/playtests/v33',{recursive:true});writeFileSync(file,JSON.stringify(report,null,2)+'\n');
}
for(const mode of ['coop','duos']){
 const cells=levels.map(d=>report.cells.find(c=>c.difficulty===d).results.find(r=>r.mode===mode));
 assert.ok(cells.every(c=>c.n>=40),'At least 40 seeds required in each cell');
 console.log(mode,levels.map((d,i)=>`${d}: ${(cells[i].winRate*100).toFixed(1)}%`).join(' · '));
 assert.ok(cells[0].winRate>cells[1].winRate&&cells[1].winRate>cells[2].winRate,`${mode}: difficulty order must be Rookie > Normal > Pro`);
}
const coop=d=>report.cells.find(c=>c.difficulty===d).results.find(r=>r.mode==='coop').winRate;
assert.ok(coop('rookie')>=.75&&coop('rookie')<=.95,'Rookie co-op target is approximately 85%');
assert.ok(coop('normal')>=.50&&coop('normal')<=.70,'Normal co-op target is approximately 60%');
assert.ok(coop('pro')>=.15&&coop('pro')<=.35,'Pro co-op target is approximately 25%');
const rivals=d=>report.cells.find(c=>c.difficulty===d).results.find(r=>r.mode==='duos').winRate;
assert.ok(rivals('rookie')>.70,'Rookie rivals must remain above 70%');
assert.ok(rivals('normal')>=.45&&rivals('normal')<=.50,'Normal rivals target is 45–50%');
console.log('Difficulty ordering gate passed (same 40 seeds, naive collector + Auto Echo).');
