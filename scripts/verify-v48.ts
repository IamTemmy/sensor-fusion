import type {Difficulty} from '../lib/noise/engine.ts';
import {performance} from 'node:perf_hooks';
const E:typeof import('../lib/noise/engine.ts')=await import((process.env.V48_ENGINE||'../lib/noise/')+'engine.ts');
if(process.env.V48_MODE==='escape'){
 const levels=(process.env.V48_LEVEL?[process.env.V48_LEVEL]:['rookie','normal','pro']) as Difficulty[];
 const rows=[];for(const level of levels){let left=0,tied=0,escaped=0;const misses=[];
 for(let seed=1001;seed<=1040;seed++){const g=E.create('V48',0,seed);E.add(g,'Idle human','human');E.add(g,'Echo','bot',true);g.difficulty=level;E.setup(g);E.command(g,g.host,{type:'ready'});const b=g.seats[1];while(g.phase==='playing')E.advance(g,g.now+40);if(b.escaped)escaped++;else if(b.stun>g.now)tied++;else{left++;misses.push(seed);}}
 rows.push({level,n:40,escaped,tied,left,misses});}console.log(JSON.stringify(rows,null,2));if(!process.env.V48_ENGINE&&rows.some(r=>r.left>2))throw new Error('Echo escape acceptance failed');
}else{
 const g=E.create('CPU48',10000,1003);E.add(g,'Host','host');E.add(g,'Guest','guest');E.configure(g,'duos');E.fillCrews(g);E.setup(g);for(const s of g.seats.filter(s=>!s.bot))E.command(g,s.id,{type:'ready'});
 const bins=new Map<number,number[]>();let maxReplans=0;
 while(g.phase==='playing'){
 for(const s of g.seats.filter(s=>!s.bot)){const l=g.loot.filter(l=>!l.banked&&!l.holder&&!l.locked&&!l.sealed).sort((a,b)=>E.distance(a,s)-E.distance(b,s))[0];const target=s.hand||!l?E.vanFor(g,s.team):l;const p=E.steer(s,target,E.thiefWalls(g,s)),d=E.distance(s,p)||1;E.command(g,s.id,{type:'input',seq:s.lastSeq+1,dx:(p.x-s.x)/d,dy:(p.y-s.y)/d});if(!s.hand&&l&&E.distance(s,l)<50)E.action(g,s,'grab');}
 const from=Math.floor((g.now-g.start)/10000)*10,t=performance.now();E.advance(g,g.now+40);const ms=performance.now()-t;const bin=bins.get(from)||[];bin.push(ms);bins.set(from,bin);if('guardPathStats'in E)maxReplans=Math.max(maxReplans,(E as any).guardPathStats(g).used);
 }
 console.log(JSON.stringify({seed:1003,maxReplans,guards:g.guards.length,bins:[...bins].map(([from,a])=>{a.sort((a,b)=>a-b);return{from,to:from+10,ticks:a.length,mean:a.reduce((x,y)=>x+y,0)/a.length,p95:a[Math.floor(a.length*.95)],max:a.at(-1)}})},null,2));
}
