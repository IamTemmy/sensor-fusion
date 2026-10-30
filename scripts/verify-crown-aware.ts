// Scripted input play-test: real Echo Hold Plate order, normal guards/timers, no teleports or immunity.
import * as E from '../lib/noise/engine.ts';
import {writeFileSync} from 'node:fs';
const rows=[];
for(const level of ['rookie','normal','pro'] as const)for(let seed=1001;seed<=1010;seed++){
 const g=E.create('CROWN',0,seed);const h=E.add(g,'Player','h');const b=E.add(g,'Echo','b',true);g.difficulty=level;E.setup(g);E.command(g,g.host,{type:'ready'});E.action(g,h,'help:plate');const c=g.loot.find(l=>l.value===1200)!;let pickup=null,bank=null,plate=false,caught=0;const seen=new Set();
 while(g.phase==='playing'){
  if(h.stun<=g.now&&!h.escaped){const target=h.hand?E.vanFor(g,h.team):c;const route=E.botRoute(g,h,target);const p=route.next;const d=E.distance(h,p)||1;E.command(g,h.id,{type:'input',seq:h.lastSeq+1,dx:(p.x-h.x)/d,dy:(p.y-h.y)/d});if(!h.hand&&E.distance(h,c)<50&&E.interaction(g,h).kind==='loot')E.action(g,h,'grab');}
  E.advance(g,g.now+40);if(E.distance(b,g.plate)<30)plate=true;for(const e of g.events)if(!seen.has(e.id)){seen.add(e.id);if(e.kind==='catch'&&e.text.includes('Player'))caught++;}
  if(c.holder===h.id&&pickup===null){pickup=(g.now-g.start)/1000;E.action(g,h,'help:cover');}if(c.banked){bank=(g.now-g.start)/1000;break;}
 }
 rows.push({level,seed,echoReachedPlate:plate,pickupSeconds:pickup,bankSeconds:bank,caught});
}
writeFileSync('docs/playtests/flagship-velmont/crown-aware.json',JSON.stringify(rows,null,2));for(const level of ['rookie','normal','pro']){const r=rows.filter(r=>r.level===level);console.log(JSON.stringify({level,n:r.length,plate:r.filter(r=>r.echoReachedPlate).length,pickups:r.filter(r=>r.pickupSeconds!==null).length,banks:r.filter(r=>r.bankSeconds!==null).length,successes:r.filter(r=>r.bankSeconds!==null)}));}
