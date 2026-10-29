import * as E from '../lib/noise/engine.ts';
import {museumArena} from '../lib/noise/arenas.ts';
import {writeFileSync,mkdirSync} from 'node:fs';
const out='docs/playtests/museums-v2';mkdirSync(out,{recursive:true});
const mode=process.env.MUSEUM_GATE||'geometry';
function make(seed:number,n:number,level:E.Difficulty='normal',coop=false){const g=E.create('V2',0,seed);E.add(g,'Human','h');for(let i=1;i<n;i++)E.add(g,'Bot '+i,'b'+i,true);if(!coop)E.configure(g,n===6?'trios':'duos');g.difficulty=level;E.setup(g);E.command(g,g.host,{type:'ready'});return g;}
if(mode==='geometry'){
 const rows=[];
 for(const n of [2,4,6])for(let layout=0;layout<3;layout++){
  const m=museumArena(layout,n),walls=m.walls.map(w=>({x:w.x-13,y:w.y-13,w:w.w+26,h:w.h+26}));
  const visible=(a:E.Vec,b:E.Vec)=>!walls.some(w=>{let lo=0,hi=1;for(const [p,d,min,max] of [[a.x,b.x-a.x,w.x,w.x+w.w],[a.y,b.y-a.y,w.y,w.y+w.h]]){if(Math.abs(d)<1e-9){if(p<=min||p>=max)return false;}else{const t1=(min-p)/d,t2=(max-p)/d;lo=Math.max(lo,Math.min(t1,t2));hi=Math.min(hi,Math.max(t1,t2));if(lo>=hi)return false;}}return hi>0&&lo<1;});
  const docks=[{x:90,y:510},{x:870,y:510}],targets=[...m.slots,m.plate,...m.niches];
  const corners=walls.flatMap(w=>[{x:w.x-.01,y:w.y-.01},{x:w.x+w.w+.01,y:w.y-.01},{x:w.x-.01,y:w.y+w.h+.01},{x:w.x+w.w+.01,y:w.y+w.h+.01}]).filter(p=>E.clear(p,13,m.walls));
  const nodes=[...docks,...targets,...corners],d=nodes.map((a,i)=>nodes.map((b,j)=>i===j?0:visible(a,b)?E.distance(a,b):Infinity));
  for(let k=0;k<nodes.length;k++)for(let i=0;i<nodes.length;i++)for(let j=0;j<nodes.length;j++)d[i][j]=Math.min(d[i][j],d[i][k]+d[k][j]);
  const percent=(a:number,b:number)=>100*Math.abs(a-b)/Math.max(a,b);
  const pairs=m.slots.map((p,i)=>({i,j:m.slots.findIndex(q=>q.x===960-p.x&&q.y===p.y)})).filter(p=>p.j>=p.i);
  const fairness=pairs.map(({i,j})=>({art:i+1,twin:j+1,mint:d[0][2+i],violet:d[1][2+j],differencePct:percent(d[0][2+i],d[1][2+j])}));
  const values=n===6?[200,200,1200,500,500,500,400,400,200,200]:[200,200,1200,500,600,600,500,500];
  // Minimum sum of dock-to-art shortest paths for a subset worth at least $2,600.
  const nearest=docks.map((_,team)=>{let best={value:0,distance:Infinity,arts:[] as number[]};for(let mask=1;mask<(1<<values.length);mask++){let value=0,total=0;const arts=[];for(let i=0;i<values.length;i++)if(mask&(1<<i)){value+=values[i];total+=d[team][2+i];arts.push(i+1);}if(value>=2600&&total<best.distance)best={value,distance:total,arts};}return best;});
  const query=(team:number,p:E.Vec)=>Math.min(...nodes.map((q,i)=>visible(q,p)?d[team][i]+E.distance(q,p):Infinity));
  const pocketShiftMaxPct=Math.max(...[-12,-6,0,6,12].flatMap(a=>[-12,-6,0,6,12].map(b=>percent(query(0,{...m.slots[0],y:m.slots[0].y+a}),query(1,{...m.slots[1],y:m.slots[1].y+b})))));
  let setups=0;const failures=[];
  for(const coop of [false,true])for(const level of ['rookie','normal','pro'] as const){let found=false;for(let seed=1;seed<50&&!found;seed++){try{const g=make(seed,n,level,coop);if(g.layout!==layout)continue;found=true;setups++;if(!E.sentryRoutesClear(g))failures.push('sentry clearance');for(const r of E.patrolPool(g))for(let i=0;i<r.length;i++)if(!Number.isFinite(E.routeLength(g,r[i],r[(i+1)%r.length])))failures.push('guard route');}catch(e){failures.push(String(e));break;}}}
  rows.push({layout,n,pocketShiftMaxPct,reachable:targets.every((p,i)=>E.clear(p,13,m.walls)&&Number.isFinite(d[0][i+2])&&Number.isFinite(d[1][i+2])),fairness,plateDifferencePct:percent(d[0][2+m.slots.length],d[1][2+m.slots.length]),nearest2600:nearest,collectionDifferencePct:percent(nearest[0].distance,nearest[1].distance),setups,failures});
 }
 writeFileSync(out+'/geometry.json',JSON.stringify(rows,null,2));console.log(JSON.stringify(rows,null,2));
 if(rows.some(r=>!r.reachable||r.failures.length||r.setups!==6||r.pocketShiftMaxPct>5||r.plateDifferencePct>5||r.collectionDifferencePct>5||r.fairness.some(p=>p.differencePct>5)))process.exitCode=1;
}else if(mode==='idle'){
 const rows=[];
 for(const layout of process.env.MUSEUM_LAYOUT?[Number(process.env.MUSEUM_LAYOUT)]:[0,1,2]){
  const cases:{seed:number;n:number;level:E.Difficulty;stalls:any[]}[]=[];for(let seed=1001;cases.length<30;seed++){
   const index=cases.length,n=[2,4,6][index%3],level=(['rookie','normal','pro'] as const)[Math.floor(index/3)%3];const g=make(seed,n,level,n===2);if(g.layout!==layout)continue;
   const history=new Map<string,{x:number;y:number;at:number}>(),stalls:any[]=[],seen=new Set<string>();
   while(g.phase==='playing'){
    const s=g.seats[0],l=g.loot.filter(l=>!l.banked&&!l.holder&&!l.locked&&!l.sealed).sort((a,b)=>E.distance(s,a)-E.distance(s,b))[0];const target=s.hand||!l||g.end-g.now<7000?E.vanFor(g,0):l;const p=E.steer(s,target,E.thiefWalls(g,s)),dist=E.distance(s,p)||1;E.command(g,s.id,{type:'input',seq:s.lastSeq+1,dx:(p.x-s.x)/dist,dy:(p.y-s.y)/dist});if(!s.hand&&l&&E.distance(s,l)<50)E.action(g,s,'grab');
    E.advance(g,g.now+40);
    for(const b of g.seats.filter(s=>s.bot)){
     const waiting=b.escaped||b.stun>g.now||E.hidden(g,b)||(b.rescueId&&g.now-b.rescueAt<1300)||(b.bottleId&&g.now-b.bottleAt<1500)||b.windup>g.now;
     if(waiting){history.delete(b.id);continue;}
     const h=history.get(b.id);if(!h||E.distance(b,h)>10)history.set(b.id,{x:b.x,y:b.y,at:g.now});else if(g.now-h.at>=6000&&!seen.has(b.id)){seen.add(b.id);stalls.push({id:b.id,at:g.now,x:b.x,y:b.y,task:b.task,mode:b.mode,hand:b.hand,homeSafe:E.homeSafe(g,b),plateDistance:E.distance(b,g.plate),unbanked:g.loot.filter(l=>!l.banked&&!l.holder).map(l=>({id:l.id,locked:l.locked}))});}
    }
   }
   cases.push({seed,n,level,stalls});
  }rows.push({layout,matches:cases.length,stalls:cases.reduce((a,c)=>a+c.stalls.length,0),cases});console.log('layout',layout,'done');
 }writeFileSync(out+'/idle'+(process.env.MUSEUM_LAYOUT?'-'+process.env.MUSEUM_LAYOUT:'')+'.json',JSON.stringify(rows,null,2));console.log(JSON.stringify(rows,null,2));
}
