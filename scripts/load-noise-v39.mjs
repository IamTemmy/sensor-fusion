// Authorized, bounded 20-second multiplayer measurement. Never logs seat tokens.
import {writeFileSync,mkdirSync} from 'node:fs';
const base=process.env.LOAD_URL||'https://sensor-fusion-temmy.iamtemmy.chatgpt.site';
const duration=Number(process.env.LOAD_MS||20000),output=process.env.LOAD_OUTPUT||'docs/playtests/v39/network-load.json';
const delay=ms=>new Promise(r=>setTimeout(r,ms));
async function post(body,extra=0){const start=performance.now();if(extra)await delay(extra/2);const r=await fetch(base+'/api/noise',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(15000)});const text=await r.text();if(extra)await delay(extra/2);let data;try{data=JSON.parse(text);}catch{throw Error(`Non-JSON HTTP ${r.status}`);}return {status:r.status,data,ms:performance.now()-start,bytes:Buffer.byteLength(text)};}
async function required(a){const r=await post({...a,protocol:2});if(r.status!==200)throw Error(`${a.type}: HTTP ${r.status}: ${r.data.error}`);return r.data;}
const percentile=(a,p)=>a.length?[...a].sort((x,y)=>x-y)[Math.min(a.length-1,Math.floor(a.length*p))]:null;
async function run(n,extra){
 const host=await required({type:'create',name:'Network QA 1'}),code=host.view.code;
 const clients=[{token:host.token,view:host.view,arenaKey:host.arenaKey}];
 for(let i=1;i<n;i++){const p=await required({type:'join',code,name:'Network QA '+(i+1)});clients.push({token:p.token,view:p.view,arenaKey:p.arenaKey});}
 await required({type:'start',code,token:clients[0].token});for(const c of clients){const d=await required({type:'ready',code,token:c.token});c.view=d.view;c.arenaKey=d.arenaKey;}
 const start=performance.now(),end=start+duration;const stats=clients.map(()=>({latencies:[],bytes:[],fresh:0,received:0,conflicts409:0,casRetries:0,stale:0,errors:{},seq:0,revision:-1}));
 await Promise.all(clients.flatMap((c,i)=>[0,1].map(async lane=>{if(lane)await delay(75);const s=stats[i];while(performance.now()<end){
  const elapsed=performance.now()-start,seq=++s.seq;try{const r=await post({type:'input',protocol:2,code,token:c.token,match:c.view.match,seq,dx:Math.sin(elapsed/1500),dy:Math.cos(elapsed/1700),aim:{x:480,y:300},actions:[],arenaKey:c.arenaKey},extra);
   if(performance.now()>end)break;s.latencies.push(r.ms);s.bytes.push(r.bytes);if(r.status===409)s.conflicts409++;
   if(r.status!==200){s.errors[r.status]=(s.errors[r.status]||0)+1;await delay(150);continue;}
   s.received++;s.casRetries+=r.data.retries||0;if(r.data.view.revision>s.revision){s.fresh++;s.revision=r.data.view.revision;}else s.stale++;
  }catch(e){s.errors[e.message]=(s.errors[e.message]||0)+1;await delay(150);}
 }})));
 const result={clients:n,addedRoundTripMs:extra,durationMs:duration,room:code,perClient:stats.map(s=>({updatesPerSecond:+(s.fresh/(duration/1000)).toFixed(2),responsesPerSecond:+(s.received/(duration/1000)).toFixed(2),medianMs:percentile(s.latencies,.5),p90Ms:percentile(s.latencies,.9),maxMs:s.latencies.length?Math.max(...s.latencies):null,conflicts409:s.conflicts409,casRetries:s.casRetries,stale:s.stale,averageResponseBytes:s.bytes.length?Math.round(s.bytes.reduce((a,b)=>a+b,0)/s.bytes.length):0,errors:s.errors}))};console.log(JSON.stringify(result));return result;
}
const report={url:base,at:new Date().toISOString(),method:'Two concurrent request lanes per client; 20s response window; injected latency is 150ms before send plus 150ms before delivery. No artificial server delay. Updates count fresh revisions.',runs:[]};
for(const n of [2,4])for(const extra of [0,300]){report.runs.push(await run(n,extra));mkdirSync(output.slice(0,output.lastIndexOf('/')),{recursive:true});writeFileSync(output,JSON.stringify(report,null,2)+'\n');}
