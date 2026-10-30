import * as E from '../lib/noise/engine.ts';
import {writeFileSync} from 'node:fs';
const rows=[];for(const level of ['rookie','normal','pro'] as const)for(let seed=1001;seed<=1010;seed++){
const g=E.create('CROWN',0,seed),h=E.add(g,'Player','h'),b=E.add(g,'Echo','b',true);g.difficulty=level;E.setup(g);E.command(g,g.host,{type:'ready'});const c=g.loot.find(l=>l.value===1200)!;let pickup=null,bank=null;
while(g.phase==='playing'){
 if(h.stun<=g.now&&!h.escaped){const target=pickup===null?g.plate:E.vanFor(g,h.team);const p=E.steer(h,target,E.thiefWalls(g,h)),d=E.distance(h,p)||1;E.command(g,h.id,{type:'input',seq:h.lastSeq+1,dx:(p.x-h.x)/d,dy:(p.y-h.y)/d});}
 E.advance(g,g.now+40);if(c.holder&&pickup===null)pickup=(g.now-g.start)/1000;if(c.banked){bank=(g.now-g.start)/1000;break;}
}rows.push({level,seed,pickupSeconds:pickup,bankSeconds:bank});}
writeFileSync('docs/playtests/flagship-velmont/crown-echo-carrier.json',JSON.stringify(rows,null,2));for(const level of ['rookie','normal','pro']){const r=rows.filter(r=>r.level===level);console.log(JSON.stringify({level,pickups:r.filter(r=>r.pickupSeconds!==null).length,banks:r.filter(r=>r.bankSeconds!==null).length,successes:r.filter(r=>r.bankSeconds!==null)}));}
