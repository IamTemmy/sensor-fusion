// Design validation against existing engine primitives. No game data is changed.
import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {clear,sight,steer,move,carrySpeed} from '../../lib/noise/engine.ts';
const m=JSON.parse(readFileSync(new URL('./blueprint.json',import.meta.url),'utf8'));
const targets=[...m.arts,m.plate,...m.docks,...m.hides,...m.sentries];
for(const p of targets)assert(clear(p,13,m.walls),`Blocked target ${JSON.stringify(p)}`);
const segment=(a:any,b:any)=>{const n=Math.ceil(Math.hypot(b.x-a.x,b.y-a.y));for(let i=0;i<=n;i++)assert(clear({x:a.x+(b.x-a.x)*i/n,y:a.y+(b.y-a.y)*i/n},13,m.walls),`Patrol collision ${JSON.stringify([a,b,i/n])}`);};
let guardSegments=0;
for(const r of m.guardRoutes)for(let i=1;i<r.length;i++){segment({x:r[i-1][0],y:r[i-1][1]},{x:r[i][0],y:r[i][1]});guardSegments++;}
assert(!sight(m.plate,m.arts.at(-1),m.walls),'Plate sees Crown');
const journeys=[];
for(const target of targets){
 const p={...m.docks[0]};let ticks=0,distance=0;
 for(;ticks<8000&&Math.hypot(p.x-target.x,p.y-target.y)>8;ticks++){
  const next=steer(p,target,m.walls),before={...p};move(p,next.x-p.x,next.y-p.y,.04,150,m.walls);distance+=Math.hypot(p.x-before.x,p.y-before.y);
 }
 assert(ticks<8000,`Navigation stalled to ${JSON.stringify(target)}`);
 journeys.push({target:target.name||`${target.x},${target.y}`,seconds:ticks*.04,distance:Math.round(distance)});
}
const rivalJourneys=[];
for(let crew=0;crew<2;crew++)for(const target of [...m.arts,m.plate,...m.hides]){
 const other=m.docks[1-crew],walls=[...m.walls,{x:other.x-35,y:other.y-35,w:70,h:70}];
 const p={...m.docks[crew]};let ticks=0;
 for(;ticks<8000&&Math.hypot(p.x-target.x,p.y-target.y)>8;ticks++){
  const next=steer(p,target,walls);move(p,next.x-p.x,next.y-p.y,.04,150,walls);
 }
 assert(ticks<8000,`Crew ${crew} blocked by opponent dock reaching ${JSON.stringify(target)}`);
 rivalJourneys.push({crew,target:target.name||`${target.x},${target.y}`,seconds:ticks*.04});
}
const passFrom={x:590,y:335},passTo={x:410,y:335};
assert(sight(passFrom,passTo,m.walls));assert(Math.hypot(passTo.x-passFrom.x,passTo.y-passFrom.y)<=220);
const result={clearTargets:targets.length,engineNavigationTargets:journeys.length,rivalNavigationTargets:rivalJourneys.length,guardSegments,plateHasNoSightToCrown:true,passFixture:{from:passFrom,to:passTo,distance:180,clearSight:true},crownCarrySpeed:carrySpeed(1200),journeys,rivalJourneys,limits:'Static authored geometry only; no bots, guard AI, capacity, latency, balance or release gates simulated. Engine navigation uses its existing 12u movement, while static target/patrol clearance uses 13u.'};
writeFileSync(new URL('./engine-check.json',import.meta.url),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
