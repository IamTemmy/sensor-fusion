import * as E from '../../../lib/noise/engine.ts';
function make(n:number,seed:number){const g=E.create('AUDIT72',0,seed);E.add(g,'Human','h');for(let i=1;i<n;i++)E.add(g,'Bot '+i,'b'+i,true);if(n>2)E.configure(g,n===6?'trios':'duos');E.setup(g);for(const s of g.seats.filter(s=>!s.bot))E.command(g,s.id,{type:'ready'});return g;}
const cases:any[]=[];
for(const n of [2,4,6])for(const layout of [0,1,2])for(const policy of ['idle','collector']){
 const seed=Array.from({length:100},(_,i)=>i+1).find(seed=>make(n,seed).layout===layout)!;const g=make(n,seed),hist=new Map<string,{x:number;y:number;at:number}>(),stalls:any[]=[],seen=new Set<string>();let flips=0,sentryHoldTicks=0,activeTicks=0,passes=0;const events=new Set<number>();
 while(g.phase==='playing'){
  const before=new Map(g.guards.map(h=>[h.id,{x:h.x,y:h.y,angle:h.angle}]));
  if(policy==='collector'){const s=g.seats[0],l=g.loot.filter(l=>!l.banked&&!l.holder&&!l.locked&&!l.sealed).sort((a,b)=>E.distance(a,s)-E.distance(b,s))[0],target=s.hand||!l?E.vanFor(g,0):l,p=E.steer(s,target,E.thiefWalls(g,s)),d=E.distance(s,p)||1;E.command(g,s.id,{type:'input',seq:s.lastSeq+1,dx:(p.x-s.x)/d,dy:(p.y-s.y)/d});if(!s.hand&&l&&E.distance(s,l)<50)E.action(g,s,'grab');}
  E.advance(g,g.now+40);
  for(const e of g.events){if(!events.has(e.id)&&e.text.includes('passed '))passes++;events.add(e.id);}
  for(const h of g.guards){if(!E.guardActive(g,h))continue;activeTicks++;const b=before.get(h.id);if(b&&E.distance(h,b)<4&&Math.abs(Math.atan2(Math.sin(h.angle-b.angle),Math.cos(h.angle-b.angle)))>2)flips++;
   if(h.sentry&&E.distance(h,h.sentry)<10){sentryHoldTicks++;hist.delete(h.id);continue;}
   const old=hist.get(h.id);if(!old||E.distance(h,old)>10)hist.set(h.id,{x:h.x,y:h.y,at:g.now});else if(g.now-old.at>6000&&!seen.has(h.id)){seen.add(h.id);stalls.push({at:g.now,h:structuredClone(h),targetDistance:E.distance(h,h.target),clear:E.clear(h,13,[...g.walls,...E.zones(g)])});}
  }
 }
 cases.push({n,layout,seed,policy,flips,activeTicks,sentryHoldTicks,passes,stalls});
}
console.log(JSON.stringify({note:'18 full matches: 2/4/6 thieves x 3 museums x idle/naive-collector. Stall = within 10u for >6s, excluding stationed sentries and guards not yet entered. Flip = >2 rad in a tick with <4u travel. These are diagnostics, not all flips are defects.',cases},null,2));
