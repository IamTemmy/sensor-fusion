import {performance} from 'node:perf_hooks';
import {writeFileSync,readFileSync,existsSync} from 'node:fs';
// Keep timing isolated from an explicitly running full-match audit.
const auditFile='docs/playtests/museums-v2/idle-audit-state.json';
while(existsSync(auditFile)&&JSON.parse(readFileSync(auditFile,'utf8')).pending)await new Promise(resolve=>setTimeout(resolve,1000));
import * as Current from '../lib/noise/engine.ts';
const Base:typeof Current=await import(new URL('../../velmont-v73/lib/noise/engine.ts',import.meta.url).href);
function make(E:typeof Current,seed:number){const g=E.create('CPU',10000,seed);E.add(g,'Host','h');E.add(g,'Guest','g');E.configure(g,'duos');E.fillCrews(g);E.setup(g);for(const s of g.seats.filter(s=>!s.bot))E.command(g,s.id,{type:'ready'});return g;}
const rows=[];
for(let repeat=0;repeat<3;repeat++)for(let layout=0;layout<3;layout++){
 const seed=Array.from({length:40},(_,i)=>1001+i).find(seed=>make(Current,seed).layout===layout)!;
 for(const variant of repeat%2?['candidate','v73']:['v73','candidate']){
  const E=variant==='v73'?Base:Current,g=make(E,seed),ticks:number[]=[];
  while(g.phase==='playing'){
   for(const s of g.seats.filter(s=>!s.bot)){const l=g.loot.filter(l=>!l.banked&&!l.holder&&!l.locked&&!l.sealed).sort((a,b)=>E.distance(a,s)-E.distance(b,s))[0];const target=s.hand||!l?E.vanFor(g,s.team):l,p=E.steer(s,target,E.thiefWalls(g,s)),d=E.distance(s,p)||1;E.command(g,s.id,{type:'input',seq:s.lastSeq+1,dx:(p.x-s.x)/d,dy:(p.y-s.y)/d});if(!s.hand&&l&&E.distance(s,l)<50)E.action(g,s,'grab');}
   const t=performance.now();E.advance(g,g.now+40);ticks.push(performance.now()-t);
  }
  ticks.sort((a,b)=>a-b);rows.push({variant,repeat,layout,seed,ticks:ticks.length,p95:ticks[Math.floor(ticks.length*.95)],mean:ticks.reduce((a,b)=>a+b,0)/ticks.length,max:ticks.at(-1)});
  console.log(rows.at(-1));writeFileSync('docs/playtests/museums-v2/cpu.json',JSON.stringify(rows,null,2));
 }
}
