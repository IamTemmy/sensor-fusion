// Deterministic full-match CPU benchmark, not a browser FPS measurement.
import {performance} from 'node:perf_hooks';
import {writeFileSync} from 'node:fs';
const root=process.env.PROFILE_BASELINE||'../lib/noise/';
const E:typeof import('../lib/noise/engine.ts')=await import(root+'engine.ts');
const {OnlinePrediction}=await import(root+'online-client.ts');
const g=E.create('PERF46',10000,1001);const h=E.add(g,'Host','host');E.add(g,'Guest','guest');E.configure(g,'duos');E.fillCrews(g);E.setup(g);for(const s of g.seats.filter(s=>!s.bot))E.command(g,s.id,{type:'ready'});
const times:{at:number,ms:number}[]=[],snapshots:any[]=[];
while(g.phase==='playing'){
 for(const s of g.seats.filter(s=>!s.bot)){const l=g.loot.filter(l=>!l.banked&&!l.holder&&!l.locked&&!l.sealed).sort((a,b)=>E.distance(a,s)-E.distance(b,s))[0];const target=s.hand||!l?E.vanFor(g,s.team):l;const next=E.steer(s,target,E.thiefWalls(g,s));const d=E.distance(s,next)||1;E.command(g,s.id,{type:'input',match:g.match,seq:s.lastSeq+1,dx:(next.x-s.x)/d,dy:(next.y-s.y)/d});if(!s.hand&&l&&E.distance(s,l)<50)E.action(g,s,'grab');}
 const t=performance.now();E.advance(g,g.now+40);times.push({at:g.now-g.start,ms:performance.now()-t});if(times.length%125===0)snapshots.push(JSON.parse(JSON.stringify(E.view(g,g.seats[1].id))));
}
const summary=(xs:number[])=>{xs.sort((a,b)=>a-b);return{mean:xs.reduce((a,b)=>a+b,0)/xs.length,p95:xs[Math.floor(xs.length*.95)],max:xs.at(-1),over40:xs.filter(x=>x>40).length};};
const prediction:number[]=[];
for(const v of snapshots){const p=new OnlinePrediction();const start=performance.now();p.accept(v,0,300);for(let i=0;i<12;i++)p.frame(16,{x:0,y:0},{x:480,y:300});prediction.push(performance.now()-start);}
const report={hostTicks:summary(times.map(t=>t.ms)),byPeriod:[0,30,60].map(from=>({from, ...summary(times.filter(t=>t.at>=from*1000&&t.at<(from+30)*1000).map(t=>t.ms))})),guestSnapshotAnd12Frames:summary(prediction),result:{phase:g.phase,total:g.total,bank:g.seats.map(s=>s.bank),captures:g.seats.map(s=>s.captures)}};
console.log(JSON.stringify(report,null,2));if(process.env.PROFILE_OUT)writeFileSync(process.env.PROFILE_OUT,JSON.stringify(report,null,2)+'\n');
