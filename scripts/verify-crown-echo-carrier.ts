import {setupGate,gateOut,engineHash as gateHash} from './museum-gate-context.ts';
import * as E from '../lib/noise/engine.ts';
import {quietCrown} from './crown-player-policy.ts';
import {writeFileSync} from 'node:fs';
const rows=[];for(const level of ['rookie','normal','pro'] as const)for(let seed=1001;seed<=1000+Number(process.env.CROWN_COUNT||20);seed++){
const g=E.create('CROWN',0,seed),h=E.add(g,'Player','h'),b=E.add(g,'Echo','b',true);g.difficulty=level;setupGate(g);E.command(g,g.host,{type:'ready'});const c=g.loot.find(l=>l.value===1200)!;let pickup=null,bank=null;const policy:{quieting?:boolean}={};
while(g.phase==='playing'){

 if(h.stun<=g.now&&!h.escaped){
 const jar=g.noises.find(n=>n.id===h.hand),alarm=g.noises.find(n=>n.attached===b.id&&n.source===c.id);
 let target:E.Vec=c.holder===h.id?E.vanFor(g,h.team):!c.locked&&!c.guardCarrier?(b.stun>g.now?c:b):g.plate;
 let stop=quietCrown(g,h,c,policy);
 if(jar){if(g.now>=h.windup){const points=Array.from({length:16},(_,i)=>({x:h.x+Math.cos(i*Math.PI/8)*180,y:h.y+Math.sin(i*Math.PI/8)*180})).filter(p=>E.clear(p,8,g.walls)&&E.sight(h,p,g.walls)&&E.distance(p,b)>120);points.sort((a,z)=>E.distance(z,E.vanFor(g,h.team))-E.distance(a,E.vanFor(g,h.team)));if(points[0])E.action(g,h,'throw',points[0]);}stop=true;}
 else if(alarm&&E.interaction(g,h).id===alarm.id)E.action(g,h,'grab');
 else if(!c.locked&&!c.holder&&!c.guardCarrier&&b.stun>g.now&&E.interaction(g,h).id===c.id)E.action(g,h,'grab');
 if(c.holder===b.id&&!alarm&&E.distance(h,b)<100)target=E.vanFor(g,h.team);
 const p=E.botRoute(g,h,target).next,d=E.distance(h,p)||1;E.command(g,h.id,{type:'input',seq:h.lastSeq+1,dx:stop?0:(p.x-h.x)/d,dy:stop?0:(p.y-h.y)/d});
 }
 E.advance(g,g.now+40);if(c.holder&&pickup===null)pickup=(g.now-g.start)/1000;if(c.banked){bank=(g.now-g.start)/1000;break;}
}rows.push({level,seed,pickupSeconds:pickup,bankSeconds:bank});}
writeFileSync(gateOut+'/crown-echo-carrier.json',JSON.stringify(rows,null,2));for(const level of ['rookie','normal','pro']){const r=rows.filter(r=>r.level===level);console.log(JSON.stringify({level,pickups:r.filter(r=>r.pickupSeconds!==null).length,banks:r.filter(r=>r.bankSeconds!==null).length,successes:r.filter(r=>r.bankSeconds!==null)}));}
