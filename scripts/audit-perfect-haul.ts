// Tooling only. Full-map scripted human plus unchanged Echo, using ordinary inputs/actions.
// Not a human-skill benchmark: forecast routing is shared with bots, but this policy is separate.
import * as E from '../lib/noise/engine.ts';
import {setupGate,museum} from './museum-gate-context.ts';
import {writeFileSync} from 'node:fs';
const rows:Record<string,unknown>[]=[];
const levels=(process.env.AUDIT_LEVEL?[process.env.AUDIT_LEVEL]:['normal']) as E.Difficulty[];
for(const level of levels)for(let seed=1001;seed<1001+Number(process.env.AUDIT_COUNT||10);seed++){
 const g=E.create('AUDIT',0,seed),h=E.add(g,'Player','h'),b=E.add(g,'Echo','b',true);
 g.difficulty=level;setupGate(g);E.command(g,h.id,{type:'ready'});
 const home=E.vanFor(g,h.team),crown=g.loot.find(l=>l.value===1200)!;
 let order='auto',target:E.Vec=home,planAt=0,returning=false,catches=0,stun=0,complete:number|null=null;
 let dockMs=0;const margin=8000;
 const routeMs=(from:E.Vec,to:E.Vec,speed:number)=>E.routeLength(g,from,to)/speed*1000;
 while(g.phase==='playing'){
  if(h.stun>g.now&&h.stun!==stun){stun=h.stun;catches++;}
  if(!h.escaped&&h.stun<=g.now){
   const held=g.loot.find(l=>l.id===h.hand),remaining=g.end-g.now;
   if(g.now>=planAt){
    planAt=g.now+400;dockMs=routeMs(h,home,held?E.carrySpeed(held.value,g):165);
    if(remaining<=dockMs+margin)returning=true;
    // Refuse a theft unless the outward route, carrying return, action time and margin fit.
    const canReturn=(l:E.Loot)=>routeMs(h,l,165)+routeMs(l,home,E.carrySpeed(l.value,g))+2000+margin<remaining;
    const crownRun=!returning&&!held&&!crown.banked&&!crown.holder&&!crown.guardCarrier&&g.now-g.start>=30000&&canReturn(crown);
    const nextOrder=returning?'van':crownRun?'plate':'auto';if(order!==nextOrder){E.action(g,h,'help:'+nextOrder);order=nextOrder;}
    const available=g.loot.filter(l=>!l.banked&&!l.holder&&!l.guardCarrier&&!l.flight&&!l.locked&&E.exhibitAvailable(g,l)&&canReturn(l));
    available.sort((a,c)=>{
     const cost=(l:E.Loot)=>routeMs(h,l,165)+(b.autoTarget===l.id?3000:0)+(E.botRoute(g,h,l).exposed?4000:0);
     return cost(a)-cost(c);
    });
    target=held||returning?home:crownRun?crown:available[0]||home;
    if(!held&&!crownRun&&!available.length){returning=true;target=home;if(order!=='van'){E.action(g,h,'help:van');order='van';}}
   }
   // Use the existing one-second shake action, never drop art to quiet it.
   const attached=held&&g.noises.some(n=>n.source===held.id&&n.attached===h.id);
   const threats=g.guards.filter(a=>E.guardActive(g,a)&&(a.retreatUntil||0)<=g.now);
   if(attached&&!h.shakeAlarm&&g.now>=h.windup&&dockMs>2500&&threats.some(a=>E.distance(a,h)<230)){
    const points=Array.from({length:16},(_,i)=>({x:h.x+Math.cos(i*Math.PI/8)*180,y:h.y+Math.sin(i*Math.PI/8)*180})).filter(p=>E.clear(p,8,g.walls)&&E.sight(h,p,g.walls)&&E.distance(p,b)>100);
    points.sort((a,c)=>E.distance(c,home)-E.distance(a,home));if(points[0])E.action(g,h,'shake-alarm',points[0]);
   }
   const route=E.botRoute(g,h,target),speed=held?E.carrySpeed(held.value,g):165;
   let next=route.next;
   // Same guardSees/route planner as the bot: don't enter a new cone or move closer
   // to a visible threat. Short release protection is used normally by the engine.
   const safe=(p:E.Vec)=>E.clear(p,13,E.thiefWalls(g,h))&&E.sight(h,p,E.thiefWalls(g,h))&&(h.safe>g.now+500||threats.every(a=>!E.guardSees(g,a,p)||(E.guardSees(g,a,h)&&E.distance(a,p)>70&&E.distance(a,p)>=E.distance(a,h))));
   const stepTo=(p:E.Vec)=>{const d=E.distance(h,p)||1,k=Math.min(18,d);return {x:h.x+(p.x-h.x)*k/d,y:h.y+(p.y-h.y)*k/d};};
   if(!safe(stepTo(next))){
    const choices=Array.from({length:16},(_,i)=>({x:h.x+Math.cos(i*Math.PI/8)*18,y:h.y+Math.sin(i*Math.PI/8)*18})).filter(safe);
    choices.sort((a,c)=>E.distance(a,route.next)-E.distance(c,route.next));next=choices[0]||h;
   }
   const d=E.distance(h,next)||1;
   E.command(g,h.id,{type:'input',seq:h.lastSeq+1,dx:(next.x-h.x)/d,dy:(next.y-h.y)/d,sneak:!h.hand&&E.botSneakNearSensor(g,h,target)});
   if(!h.hand&&E.distance(h,target)<50&&E.interaction(g,h).kind==='loot')E.action(g,h,'grab');
   if(E.homeSafe(g,h)&&(returning||g.loot.every(l=>l.banked)))E.action(g,h,'extract');
  }
  E.advance(g,g.now+40);
  if(complete===null&&g.loot.every(l=>l.banked))complete=(g.now-g.start)/1000;
 }
 const row={level,seed,event:g.jobEvent?.kind,stars:E.stars(g),bank:g.total,humanEscaped:h.escaped,catches,finishSeconds:(g.now-g.start)/1000,humanEscapeSeconds:h.escapedAt===undefined?null:(h.escapedAt-g.start)/1000,complete,escaped:g.seats.map(s=>s.escaped)};
 rows.push(row);console.log(JSON.stringify(row));
}
const result={museum,timer:E.DURATION/1000,policy:'route-budget-v2',method:'Ordinary human inputs and shake/grab/board commands, 8s return margin, round-trip feasibility, botRoute and guardSees avoidance. Echo and engine unchanged. Full map knowledge; not a human skill benchmark.',rows};
writeFileSync(process.env.AUDIT_OUT||`/tmp/perfect-${museum}.json`,JSON.stringify(result,null,2)+'\n');
