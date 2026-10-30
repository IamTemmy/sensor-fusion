// Goal-directed scripted player, not a human skill benchmark. Ordinary inputs/actions,
// unchanged guards, collision, timer and Echo AI; full map knowledge for route planning.
import * as E from '../lib/noise/engine.ts';
import {setupGate,museum} from './museum-gate-context.ts';
import {quietCrown} from './crown-player-policy.ts';
import {writeFileSync} from 'node:fs';
const rows:{level:E.Difficulty;seed:number;event:string|undefined;stars:number;bank:number;complete:number|null;catches:number;escaped:boolean[];missing:{id:string;sealed?:boolean;holder:string|null}[]}[]=[];
for(const level of (process.env.AUDIT_LEVEL?[process.env.AUDIT_LEVEL]:['rookie','normal','pro']) as E.Difficulty[])
for(let seed=1001;seed<1001+Number(process.env.AUDIT_COUNT||20);seed++){
 const g=E.create('AUDIT',0,seed),h=E.add(g,'Player','h'),b=E.add(g,'Echo','b',true);
 g.difficulty=level;setupGate(g);E.command(g,h.id,{type:'ready'});
 const crown=g.loot.find(l=>l.value===1200)!;let order='auto',targetId='',complete:number|null=null,catches=0,stun=0;
 const quiet:{quieting?:boolean}={};let quietId='';
 while(g.phase==='playing'){
  if(h.stun>g.now&&h.stun!==stun){stun=h.stun;catches++;quiet.quieting=false;}
  if(!h.escaped&&h.stun<=g.now){
   const held=g.loot.find(l=>l.id===h.hand),remaining=g.end-g.now;
   const crownRun=!crown.banked&&!crown.holder&&(g.now-g.start>=30000)&&remaining>18000;
   const nextOrder=crownRun?'plate':'auto';if(order!==nextOrder){E.action(g,h,'help:'+nextOrder);order=nextOrder;}
   if(held)quietId=held.id;const q=g.loot.find(l=>l.id===quietId);
   let busy=!!q&&quietCrown(g,h,q,quiet);
   if(g.noises.some(n=>n.id===h.hand)&&!quiet.quieting){
    busy=true;if(g.now>=h.windup){const points=Array.from({length:16},(_,i)=>({x:h.x+Math.cos(i*Math.PI/8)*180,y:h.y+Math.sin(i*Math.PI/8)*180})).filter(p=>E.clear(p,8,g.walls)&&E.sight(h,p,g.walls)&&E.distance(p,b)>100);points.sort((a,c)=>E.distance(c,E.vanFor(g,h.team))-E.distance(a,E.vanFor(g,h.team)));if(points[0])E.action(g,h,'throw',points[0]);}
   }
   const available=g.loot.filter(l=>!l.banked&&!l.holder&&!l.guardCarrier&&!l.flight&&!l.locked&&E.exhibitAvailable(g,l));
   let loot=available.find(l=>l.id===targetId);
   if(!loot){loot=available.sort((a,c)=>{
    const score=(l:E.Loot)=>E.routeLength(g,h,l)+(b.autoTarget===l.id?500:0)+(E.botRoute(g,h,l).exposed?400:0);
    return score(a)-score(c);
   })[0];targetId=loot?.id||'';}
   const target=h.hand?E.vanFor(g,h.team):quiet.quieting&&q?q:crownRun?crown:loot||E.vanFor(g,h.team);
   const p=E.botRoute(g,h,target).next,d=E.distance(h,p)||1;
   const step={x:h.x+(p.x-h.x)/d*6.6,y:h.y+(p.y-h.y)/d*6.6};
   const waiting=h.safe<=g.now&&g.guards.some(a=>E.guardActive(g,a)&&(a.retreatUntil||0)<=g.now&&E.guardSees(g,a,step)&&!E.guardSees(g,a,h));
   E.command(g,h.id,{type:'input',seq:h.lastSeq+1,dx:busy||waiting?0:(p.x-h.x)/d,dy:busy||waiting?0:(p.y-h.y)/d,sneak:!h.hand&&E.botSneakNearSensor(g,h,target)});
   if(!busy&&!h.hand&&E.distance(h,target)<50&&['loot','noise'].includes(E.interaction(g,h).kind))E.action(g,h,'grab');
   if(E.homeSafe(g,h)&&(g.loot.every(l=>l.banked)||remaining<1200))E.action(g,h,'extract');
  }
  E.advance(g,g.now+40);
  if(complete===null&&g.loot.every(l=>l.banked))complete=(g.now-g.start)/1000;
 }
 rows.push({level,seed,event:g.jobEvent?.kind,stars:E.stars(g),bank:g.total,complete,catches,escaped:g.seats.map(s=>s.escaped),missing:g.loot.filter(l=>!l.banked).map(l=>({id:l.id,sealed:l.sealed,holder:l.holder}))});
}
const result={museum,timer:E.DURATION/1000,method:'Scripted goal-directed player plus real Echo; unchanged guards and collisions. Inputs only; no teleportation, invulnerability or pre-banked loot.',summary:['rookie','normal','pro'].map(level=>{const r=rows.filter(r=>r.level===level);return {level,n:r.length,threeStars:r.filter(r=>r.stars===3).length,bestBank:Math.max(...r.map(r=>r.bank)),completionSeconds:r.filter(r=>r.complete!==null).map(r=>r.complete)};}),rows};
writeFileSync(process.env.AUDIT_OUT||`/tmp/perfect-${museum}.json`,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result.summary));
