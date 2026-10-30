import {performance} from 'node:perf_hooks';
import {writeFileSync,mkdirSync} from 'node:fs';
import * as E from '../lib/noise/engine.ts';
const rows=[];
for(let layout=0;layout<3;layout++){
 let g:E.Game|undefined;for(let seed=1001;seed<1041;seed++){const trial=E.create('CPU',10000,seed);E.add(trial,'Host','h');E.add(trial,'Guest','g');E.configure(trial,'duos');E.fillCrews(trial);E.setup(trial);if(trial.layout===layout){g=trial;break;}}
 if(!g)throw Error('No layout fixture');for(const s of g.seats.filter(s=>!s.bot))E.command(g,s.id,{type:'ready'});const samples:number[]=[];
 while(g.phase==='playing'){
 for(const s of g.seats.filter(s=>!s.bot)){const l=g.loot.filter(l=>!l.banked&&!l.holder&&!l.locked&&!l.sealed).sort((a,b)=>E.distance(a,s)-E.distance(b,s))[0];const target=s.hand||!l?E.vanFor(g,s.team):l,p=E.steer(s,target,E.thiefWalls(g,s)),d=E.distance(s,p)||1;E.command(g,s.id,{type:'input',seq:s.lastSeq+1,dx:(p.x-s.x)/d,dy:(p.y-s.y)/d});if(!s.hand&&l&&E.distance(s,l)<50)E.action(g,s,'grab');}
 const t=performance.now();E.advance(g,g.now+40);samples.push(performance.now()-t);
 }
 samples.sort((a,b)=>a-b);const p95=samples[Math.floor(samples.length*.95)],max=samples.at(-1)!;rows.push({layout,ticks:samples.length,p95,max,pass:p95<8&&max<40});
}
const out=process.env.RELEASE_OUT||'docs/playtests/release';mkdirSync(out,{recursive:true});writeFileSync(out+'/cpu.json',JSON.stringify(rows,null,2));console.log(JSON.stringify(rows,null,2));if(rows.some(r=>!r.pass))process.exitCode=1;
