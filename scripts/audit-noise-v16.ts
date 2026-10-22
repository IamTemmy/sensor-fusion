import {writeFileSync,mkdirSync} from 'node:fs';
import {create,add,configure,setup,command,advance,vanFor,routeLength,carrySpeed,distance,patrolPool,clear,RIVAL_LAYOUTS,mirrorPoint,rotatePoint,type Game} from '../lib/noise/engine.ts';
export function job(seed:number,mode:'coop'|'duos'){const g=create('AUDIT',1000,seed);add(g,'Planner','h');if(mode==='duos'){for(let i=1;i<4;i++)add(g,'Seat'+i,'h'+i);configure(g,mode);}setup(g);return g;}
const rows=[];let dangerFailures=0;const plate=[0,1,2].map(layout=>({layout,coop:[] as number[],duos:[] as number[]}));
for(const mode of ['coop','duos'] as const)for(let seed=1;seed<=30;seed++){
 const g=job(seed,mode),home=vanFor(g,0),normal=g.loot.filter(l=>!l.locked),total=g.loot.reduce((a,l)=>a+l.value,0);
 for(const l of g.loot.filter(l=>l.value>300))for(const team of [...new Set(g.seats.map(s=>s.team))])if(routeLength(g,vanFor(g,team),l)<250)dangerFailures++;
 // Relax walls, guards, pickup delay, vault windows and endpoint alignment. This
 // lower bound on trip time makes the resulting optimal haul an upper bound.
 const trips=normal.map(l=>{const d=Math.max(0,distance(home,l)-Math.SQRT2*35-55);return d/165+d/carrySpeed(l.value);});
 let upper=0,routeHaul=0;const realTrips=normal.map(l=>routeLength(g,home,l)/165+routeLength(g,l,home)/carrySpeed(l.value));
 for(let mask=0;mask<(1<<normal.length);mask++){let t=0,r=0,v=0;normal.forEach((l,i)=>{if(mask&(1<<i)){t+=trips[i];r+=realTrips[i];v+=l.value;}});if(t<=90)upper=Math.max(upper,v);if(r<=90)routeHaul=Math.max(routeHaul,v);}
 const targets=mode==='duos'?[{name:'cheap wing pair',a:g.loot[0],b:g.loot[1]},{name:'valuable wing pair',a:g.loot[4],b:g.loot[5]},...['art3','art4'].map(id=>({name:id,a:g.loot.find(l=>l.id===id)!,b:g.loot.find(l=>l.id===id)!})),{name:'plate',a:g.plate,b:g.plate}]:[];const fairness=targets.map(t=>{const mint=routeLength(g,vanFor(g,0),t.a),violet=routeLength(g,vanFor(g,1),t.b);return {target:t.name,mint,violet,spread:Math.abs(mint-violet)};});
 rows.push({fairness,mode,seed,layout:g.layout,pieces:g.loot.length,total,upperBound:upper,upperFraction:upper/total,routePlannerHaul:routeHaul,event:g.jobEvent!.kind});
 if(plate[g.layout][mode].length<8){g.seats.forEach(s=>command(g,s.id,{type:'ready'}));g.jobEvent=undefined;const s=g.seats[0];s.x=g.plate.x;s.y=g.plate.y;let catches=0,old=0;while(g.phase==='playing'){advance(g,g.now+40);if(s.stun>g.now&&s.stun!==old){catches++;old=s.stun;}}plate[g.layout][mode].push(catches);}
}
const report={assumptions:'Solo has no teammate or rival holding the plate. Jackpot cannot be collected alone. Full values known; no guards or event penalties in route planner. Relaxed planner ignores walls and grants maximum pickup/banking reach, providing an optimistic upper bound, not a human win-rate estimate.',dangerFailures,maxSoloFraction:Math.max(...rows.map(r=>r.upperFraction)),plate:plate.map(p=>({layout:p.layout,coop:p.coop,duos:p.duos,coopMean:p.coop.reduce((a,b)=>a+b,0)/p.coop.length,duosMean:p.duos.reduce((a,b)=>a+b,0)/p.duos.length})),runs:rows};
mkdirSync('docs/playtests/v16',{recursive:true});writeFileSync('docs/playtests/v16/verification.json',JSON.stringify(report,null,2));console.log(JSON.stringify({...report,runs:rows.length},null,2));
