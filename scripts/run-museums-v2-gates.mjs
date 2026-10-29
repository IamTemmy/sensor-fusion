import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
const exec=promisify(execFile),out='docs/playtests/museums-v2';mkdirSync(out,{recursive:true});
const hash=createHash('sha256').update(readFileSync('lib/noise/engine.ts')).update(readFileSync('lib/noise/arenas.ts')).digest('hex');
const jobs=[['tests',['--experimental-strip-types','--test','tests/*.test.ts'],{}],['typecheck',['node_modules/typescript/bin/tsc','--noEmit'],{}],['geometry',['--experimental-strip-types','scripts/verify-museums-v2.ts'],{}],...[0,1,2].map(layout=>['idle-'+layout,['--experimental-strip-types','scripts/verify-museums-v2.ts'],{MUSEUM_GATE:'idle',MUSEUM_LAYOUT:String(layout)}]),...['rookie','normal','pro'].flatMap(level=>[['escape-'+level,['--experimental-strip-types','scripts/verify-v48.ts'],{V48_MODE:'escape',V48_LEVEL:level}],...['coop','duos'].map(mode=>['difficulty-'+mode+'-'+level,['--experimental-strip-types','scripts/simulate-noise-v17.ts'],{SIM_DIFFICULTY:level,SIM_COUNT:'40',SIM_SEED:'1001',SIM_MODE:mode}])])];
// Expand the test glob without a shell.
const {readdirSync}=await import('node:fs');jobs[0][1]=['--experimental-strip-types','--test',...readdirSync('tests').filter(f=>f.endsWith('.test.ts')).map(f=>'tests/'+f)];
let prior;try{prior=JSON.parse(readFileSync(out+'/run.json','utf8'));}catch{}
const results=process.env.MUSEUM_RESUME==='1'&&prior?.hash===hash?prior.results:[];
const pending=jobs.filter(([name])=>!results.some(r=>r.name===name&&r.exitCode===0));
let index=0;
await Promise.all(Array.from({length:2},async()=>{while(index<pending.length){const [name,args,env]=pending[index++];console.log('start',name);let result;try{const r=await exec(process.execPath,args,{env:{...process.env,...env},maxBuffer:20*1024*1024});result={name,exitCode:0,stdout:r.stdout,stderr:r.stderr};}catch(e){result={name,exitCode:e.code,stdout:e.stdout||'',stderr:e.stderr||''};}writeFileSync(out+'/'+name+'.log',result.stdout+result.stderr);const oldIndex=results.findIndex(r=>r.name===name);if(oldIndex>=0)results.splice(oldIndex,1);results.push({name,exitCode:result.exitCode});writeFileSync(out+'/run.json',JSON.stringify({hash,results},null,2));console.log('done',name,result.exitCode);}}));
