'use client';
import {useState} from 'react';
import * as E from '../../lib/noise/engine';
import {flagshipArena} from '../../lib/noise/flagship-arena';
import {archiveArena} from '../../lib/noise/archive-arena';
// Temporary development harness; exact seed, policies, cases and thresholds from verify-flagship.ts.
export default function PerformanceReview(){
 const [busy,B]=useState(false),[result,R]=useState<any[]>([]),[status,S]=useState('Ready');
 async function run(){B(true);R([]);const output:any[]=[];
 for(const museum of ['flagship-velmont','night-archive']){
 const cases=[];for(const n of [2,4])for(const level of ['rookie','normal','pro'] as const){
 S(museum+' · '+n+' thieves · '+level);await new Promise(r=>setTimeout(r,50));
 const g=E.create('GATE',0,1003);E.add(g,'Human','h');for(let i=1;i<n;i++)E.add(g,'Bot '+i,'b'+i,true);if(n===4)E.configure(g,'duos');g.difficulty=level;g.match=0;E.setup(g,(_,n)=>museum==='night-archive'?archiveArena(n):flagshipArena(n));E.command(g,g.host,{type:'ready'});
 const times:number[]=[],slowTicks:any[]=[];
 while(g.phase==='playing'){
 const s=g.seats[0];if(!(s.stun>g.now||s.escaped)){const l=g.loot.filter(l=>!l.banked&&!l.holder&&!l.locked&&!l.sealed).sort((a,b)=>E.distance(s,a)-E.distance(s,b))[0];const t=s.hand||!l||g.end-g.now<7000?E.vanFor(g,0):l;const p=E.steer(s,t,E.thiefWalls(g,s)),d=E.distance(s,p)||1;E.command(g,s.id,{type:'input',seq:s.lastSeq+1,dx:(p.x-s.x)/d,dy:(p.y-s.y)/d});if(!s.hand&&l&&E.distance(s,l)<50&&E.interaction(g,s).kind==='loot')E.action(g,s,'grab');if(g.end-g.now<7000&&E.homeSafe(g,s))E.action(g,s,'extract');}
 const at=performance.now();E.advance(g,g.now+40);const ms=performance.now()-at;times.push(ms);if(ms>=20)slowTicks.push({at:g.now-g.start,ms});if(times.length%250===0)await new Promise(r=>setTimeout(r,0));
 }
 times.sort((a,b)=>a-b);cases.push({n,level,ticks:times.length,p95:times[Math.floor(times.length*.95)],max:times.at(-1),slowTicks});
 }
 output.push({museum,cases,p95:Math.max(...cases.map(c=>c.p95)),max:Math.max(...cases.map(c=>c.max!))});R([...output]);
 }
 S('Complete');B(false);
 }
 if(process.env.NODE_ENV!=='development')return <p>Development only.</p>;
 return <main style={{padding:24,overflow:'auto',height:'100vh'}}><h1>Browser host CPU check</h1><p>Same 12 match fixtures as the CLI gate. No rendering cost included. Yielding occurs outside measured ticks.</p><button disabled={busy} onClick={run}>Run host timing checks</button><p role="status">{status}</p><pre id="cpu-results">{JSON.stringify(result,null,2)}</pre></main>;
}
