import {setupGate,gateOut,engineHash as gateHash} from './museum-gate-context.ts';
// Scripted input play-test: real Echo Hold Plate order, normal guards/timers, no teleports or immunity.
import * as E from '../lib/noise/engine.ts';
import {quietCrown} from './crown-player-policy.ts';
import {writeFileSync} from 'node:fs';
const rows=[];
for(const level of ['rookie','normal','pro'] as const)for(let seed=1001;seed<=1000+Number(process.env.CROWN_COUNT||20);seed++){
 const g=E.create('CROWN',0,seed);const h=E.add(g,'Player','h');const b=E.add(g,'Echo','b',true);g.difficulty=level;setupGate(g);E.command(g,g.host,{type:'ready'});E.action(g,h,'help:plate');const c=g.loot.find(l=>l.value===1200)!;let pickup=null,bank=null,plate=false,caught=0;const policy:{quieting?:boolean}={};let outerLoop=false,safeExit=false,approachLoop=false;const seen=new Set();
 while(g.phase==='playing'){
  if(h.stun<=g.now&&!h.escaped){const quieting=quietCrown(g,h,c,policy);if(g.arena?.id==='night-archive'&&E.distance(h,{x:640,y:540})<35&&!c.holder)approachLoop=true;if(g.arena?.id==='night-archive'&&E.distance(h,{x:750,y:230})<30&&c.holder===h.id)safeExit=true;if(g.arena?.id==='night-archive'&&E.distance(h,{x:640,y:540})<35&&c.holder===h.id)outerLoop=true;const target=h.hand?(g.arena?.id==='night-archive'&&!outerLoop?(!safeExit?{x:750,y:230}:{x:640,y:540}):E.vanFor(g,h.team)):g.now-g.start<(g.arena?.id==='night-archive'?25000:30000)?E.vanFor(g,h.team):g.arena?.id==='night-archive'&&!approachLoop?{x:640,y:540}:c;const p=E.botRoute(g,h,target).next;const d=E.distance(h,p)||1;const step={x:h.x+(p.x-h.x)/d*6.6,y:h.y+(p.y-h.y)/d*6.6};const waiting=g.arena?.id==='night-archive'&&h.safe<=g.now&&g.guards.some(a=>E.guardActive(g,a)&&(a.retreatUntil||0)<=g.now&&E.guardSees(g,a,step)&&!E.guardSees(g,a,h));E.command(g,h.id,{type:'input',seq:h.lastSeq+1,dx:quieting||waiting?0:(p.x-h.x)/d,dy:quieting||waiting?0:(p.y-h.y)/d,sneak:!h.hand&&E.botSneakNearSensor(g,h,target)});if(!quieting&&!h.hand&&E.distance(h,c)<50&&E.interaction(g,h).kind==='loot')E.action(g,h,'grab');}
  E.advance(g,g.now+40);if(E.distance(b,g.plate)<30)plate=true;for(const e of g.events)if(!seen.has(e.id)){seen.add(e.id);if(e.kind==='catch'&&e.text.includes('Player'))caught++;}
  if(c.holder===h.id&&pickup===null){pickup=(g.now-g.start)/1000;E.action(g,h,'help:cover');}if(c.banked){bank=(g.now-g.start)/1000;break;}
 }
 rows.push({level,seed,echoReachedPlate:plate,pickupSeconds:pickup,bankSeconds:bank,caught});
}
writeFileSync(gateOut+'/crown-with-echo.json',JSON.stringify(rows,null,2));for(const level of ['rookie','normal','pro']){const r=rows.filter(r=>r.level===level);console.log(JSON.stringify({level,n:r.length,plate:r.filter(r=>r.echoReachedPlate).length,pickups:r.filter(r=>r.pickupSeconds!==null).length,banks:r.filter(r=>r.bankSeconds!==null).length,successes:r.filter(r=>r.bankSeconds!==null)}));}
