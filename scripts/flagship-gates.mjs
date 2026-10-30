import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {readFileSync,writeFileSync,readdirSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
const exec=promisify(execFile),out='docs/playtests/flagship-velmont';mkdirSync(out,{recursive:true});
export function releaseHash(){const paths=['package.json','app/page.tsx','app/globals.css','app/visual-review/page.tsx','tests/helpers/legacy-engine.ts',...readdirSync('components/noise').filter(x=>/\.tsx?$/.test(x)).map(x=>'components/noise/'+x),...readdirSync('hooks').filter(x=>/\.tsx?$/.test(x)).map(x=>'hooks/'+x),...readdirSync('scripts').filter(x=>/\.(ts|mjs)$/.test(x)&&!x.startsWith('.')).map(x=>'scripts/'+x),...readdirSync('lib/noise').filter(x=>x.endsWith('.ts')).map(x=>'lib/noise/'+x),...readdirSync('tests').filter(x=>x.endsWith('.ts')).map(x=>'tests/'+x)].sort();const h=createHash('sha256');for(const p of paths)h.update(p).update(readFileSync(p));return h.digest('hex');}
const read=p=>{try{return JSON.parse(readFileSync(p,'utf8'));}catch{return null;}};
async function run(args,env={}){try{return {...await exec(process.execPath,['--experimental-strip-types',...args],{env:{...process.env,...env},maxBuffer:16e6}),passed:true};}catch(e){return {stdout:e.stdout||'',stderr:e.stderr||'',passed:false};}}
async function main(){
 const report={sourceHash:releaseHash(),at:new Date().toISOString(),policy:'2026-10-30 Crown access: user approved fast banking after the 1:00 pickup lock; 0:45 banking restriction retired. Rookie/Normal/Pro human Crown 95/70/40%, Echo Normal 50%, Normal solo haul 1500. Win rates informational.',gates:{},museums:{},failed:[],passed:false};
 for(const name of ['test','typecheck']){const r=await exec('pnpm',[name],{maxBuffer:16e6}).then(r=>({...r,passed:true})).catch(e=>({stdout:e.stdout||'',stderr:e.stderr||'',passed:false}));writeFileSync(out+'/'+name+'.log',r.stdout+'\n'+r.stderr);report.gates[name]={passed:r.passed};if(!r.passed)report.failed.push(name);}
 // Two independent museum suites; CPU timing is intentionally deferred until both finish.
 await Promise.all(['flagship-velmont','night-archive'].map(async museum=>{
  const env={GATE_MUSEUM:museum},dir='docs/playtests/'+museum;mkdirSync(dir,{recursive:true});const gates={};report.museums[museum]=gates;
  const check=(name,passed,details)=>{gates[name]={...details,passed:!!passed};if(!passed)report.failed.push(museum+'/'+name);};
  console.log('Testing',museum);
  for(const mode of ['idle','rush','patrol']){const r=await run(['scripts/verify-flagship.ts'],{...env,FLAGSHIP_GATE:mode});writeFileSync(dir+'/'+mode+'.log',r.stdout+r.stderr);const data=read(dir+'/'+mode+'.json');check(mode,r.passed&&data&&(mode==='rush'?data.matches===120&&data.earlyPickups===0:mode==='idle'?data.matches===30&&data.stalls===0:data.matches===9&&data.stalls===0),data?{...data,cases:undefined}:{error:r.stderr});}
  const echo=await run(['scripts/verify-playability.ts'],{...env,PLAY_GATE:'echo',PLAY_COUNT:'40'});const data=read(dir+'/echo-alone.json');check('echoAlone',echo.passed&&data?.rows?.find(r=>r.level==='normal')?.median>=1500,{rows:data?.rows?.map(({runs,...r})=>r)});
  const escapes=data?.rows?.map(r=>({difficulty:r.level,n:r.n,left:r.runs.filter(x=>!x.escaped).length}));check('echoEscape',escapes?.length===3&&escapes.every(r=>r.n===40&&r.left<=2),{rows:escapes});
  const crown=await run(['scripts/verify-crown-play.ts'],{...env,CROWN_COUNT:'20'});const c=read(dir+'/crown-with-echo.json');const rows=['rookie','normal','pro'].map(level=>{const a=c?.filter(r=>r.level===level)||[];return{difficulty:level,n:a.length,banks:a.filter(r=>r.bankSeconds!==null).length};});const rates=rows.map(r=>r.banks/r.n);check('crownHuman',crown.passed&&rows.every(r=>r.n===20)&&rates[0]>=.95&&rates[1]>=.70&&rates[2]>=.40,{rows,method:'Timed approach; normal inputs/actions, empty-handed sneaking, alarm bottling and recovery; Echo holds plate then covers.'});
  {
   const r=await run(['scripts/verify-crown-echo-carrier.ts'],{...env,CROWN_COUNT:'20'}),c=read(dir+'/crown-echo-carrier.json');const rows=['rookie','normal','pro'].map(level=>{const a=c?.filter(r=>r.level===level)||[];return{difficulty:level,n:a.length,banks:a.filter(r=>r.bankSeconds!==null).length};});check('crownEcho',r.passed&&rows.every(r=>r.n===20)&&rows[1].banks>=10,{rows,method:'Human holds plate, then supports Echo with alarm capture and dropped-loot recovery. Crew banking after Echo pickup, including legitimate passes.'});
   if(museum==='flagship-velmont'){const chase=await run(['scripts/verify-playability.ts'],{...env,PLAY_GATE:'chase'}),d=read(dir+'/chase-forks.json');check('chaseForks',chase.passed&&d?.caughtRate<=.25,{n:d?.n,caught:d?.caught,caughtRate:d?.caughtRate});}
  }
  gates.winRates={informational:true,cells:[]};
  for(const level of ['rookie','normal','pro'])for(const mode of ['coop','duos'])for(const swap of mode==='duos'?['0','1']:['0']){const r=await run(['scripts/simulate-noise-v17.ts'],{...env,SIM_MODE:mode,SIM_DIFFICULTY:level,SIM_COUNT:'20',SIM_SEED:'1001',SIM_DOCK_SWAP:swap});let d;try{d=JSON.parse(r.stdout);}catch{}writeFileSync(dir+`/difficulty-${mode}-${level}-${swap}.json`,r.stdout||JSON.stringify({error:r.stderr}));gates.winRates.cells.push({mode,difficulty:level,swap:Number(swap),n:d?.results?.[0]?.n,rate:d?.results?.[0]?.winRate});if(!r.passed)report.failed.push(museum+'/win-rate-simulation');}
 }));
 for(const museum of ['flagship-velmont','night-archive']){console.log('Isolated CPU',museum);const r=await run(['scripts/verify-flagship.ts'],{GATE_MUSEUM:museum,FLAGSHIP_GATE:'cpu'}),d=read('docs/playtests/'+museum+'/cpu.json');report.museums[museum].cpu={p95:d?.p95,max:d?.max,passed:r.passed&&d?.p95<8&&d?.max<40};if(!report.museums[museum].cpu.passed)report.failed.push(museum+'/cpu');}
 report.passed=report.failed.length===0;writeFileSync(out+'/release.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));if(!report.passed)process.exitCode=1;
}
if(process.argv[1]?.endsWith('flagship-gates.mjs'))await main();
