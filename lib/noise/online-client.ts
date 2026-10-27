import {action,move,view,thiefWalls,carrySpeed,CARRY_SPEED,zones,type Game,type View,type Vec} from './engine.ts';
import type {NetAction} from './network.ts';
type Pending=NetAction&{at:number};
const copy=<T,>(v:T):T=>JSON.parse(JSON.stringify(v));
/** Presentation prediction only: the host alone runs AI, captures, sensors and scoring. */
export class OnlinePrediction {
 game:Game|null=null;authoritative:View|null=null;you='';pending:Pending[]=[];nextAction=0;ack=0;clock=0;
 velocities=new Map<string,Vec>();
 offsets=new Map<string,Vec&{left:number}>();dir:Vec={x:0,y:0};aim:Vec={x:480,y:300};sneak=false;
 reset(){this.game=null;this.authoritative=null;this.pending=[];this.nextAction=0;this.ack=0;this.clock=0;this.offsets.clear();this.velocities.clear();}
 accept(v:View,ack=0,rtt=0){
  if(this.authoritative&&v.code===this.authoritative.code&&v.match===this.authoritative.match&&v.revision<this.authoritative.revision)return false;
  const changed=!this.authoritative||v.code!==this.authoritative.code||v.match!==this.authoritative.match;
  const previous=this.positions();if(changed)this.reset();
  const prior=this.authoritative;this.velocities.clear();
  const elapsed=prior?(v.now-prior.now)/1000:0;
  if(prior&&!changed&&elapsed>0&&elapsed<2)for(const actor of [...v.seats.filter(s=>s.bot),...v.guards]){
   const old=[...prior.seats,...prior.guards].find(s=>s.id===actor.id);if(!old)continue;
   const dx=(actor.x-old.x)/elapsed,dy=(actor.y-old.y)/elapsed;
   if(Math.hypot(dx,dy)<300)this.velocities.set(actor.id,{x:dx,y:dy});
  }
  this.authoritative=copy(v);this.you=v.you;this.ack=ack;this.nextAction=Math.max(this.nextAction,ack);this.pending=this.pending.filter(a=>a.id>ack);
  this.game=copy(v);if((v as View&{hostAway?:boolean}).hostAway){this.clock=v.now;this.offsets.clear();return true;}this.clock=v.now+Math.min(300,Math.max(0,rtt/2));
  const target=this.clock;this.setInput();
  for(const a of this.pending){this.advancePresentation(Math.min(target,Math.max(this.game.now,a.at)));const s=this.game.seats.find(s=>s.id===this.you);if(s)action(this.game,s,a.action,a.aim);}
  this.advancePresentation(target);this.offsets.clear();
  if(!changed)for(const s of [...this.game.seats,...this.game.guards]){const p=previous.get(s.id);if(p&&Math.hypot(p.x-s.x,p.y-s.y)<=90)this.offsets.set(s.id,{x:p.x-s.x,y:p.y-s.y,left:120});}
  return true;
 }
 setInput(){if(!this.game)return;const s=this.game.seats.find(s=>s.id===this.you);if(s){s.dx=this.dir.x;s.dy=this.dir.y;s.aim={...this.aim};s.sneak=this.sneak;s.inputAt=this.game.now;}}
 predict(a:string){if(!this.game||this.game.phase!=='playing'||(this.game as Game&{hostAway?:boolean}).hostAway)return;const item={id:++this.nextAction,action:a,aim:{...this.aim},at:this.game.now};this.pending.push(item);const s=this.game.seats.find(s=>s.id===this.you);if(s)action(this.game,s,a,item.aim);return item;}
 frame(ms:number,dir:Vec,aim:Vec,sneak=false){if(!this.game||(this.game as Game&{hostAway?:boolean}).hostAway)return;this.dir=dir;this.aim=aim;this.sneak=sneak;this.setInput();const dt=Math.min(50,Math.max(0,ms));
  // Never extrapolate indefinitely through an outage. The engine's 500ms human input expiry remains intact.
  this.clock=Math.min(this.clock+dt,(this.authoritative?.now||0)+750);
  this.advancePresentation(this.clock);
  for(const o of this.offsets.values()){const remaining=Math.max(0,o.left-dt),k=o.left?remaining/o.left:0;o.x*=k;o.y*=k;o.left=remaining;}
 }
 // No bot decisions, pathfinding, captures, or score mutations on guests. Short
 // velocity extrapolation is corrected by the next authoritative snapshot.
 private advancePresentation(to:number){
  const g=this.game;if(!g||g.phase!=='playing')return;
  const until=Math.min(to,g.now+750);while(g.now<until)this.stepPresentation(Math.min(until,g.now+40));
 }
 private stepPresentation(to:number){
  const g=this.game!;if(g.phase!=='playing')return;
  const before=g.now,dt=Math.max(0,Math.min(750,to-before))/1000;g.now=to;
  const age=Math.max(0,before-(this.authoritative?.now||before));
  for(const s of g.seats){if(s.escaped||s.stun>before)continue;
   if(!s.bot&&(s.id===this.you||before-s.inputAt<500)){
    const art=g.loot.find(l=>l.id===s.hand),speed=(s.hand?(art?carrySpeed(art.value):CARRY_SPEED):165)*(s.sneak?.55:1);
    move(s,s.dx,s.dy,dt,speed,thiefWalls(g,s));
   }else if(s.bot&&age<250){const velocity=this.velocities.get(s.id);if(velocity){const speed=Math.hypot(velocity.x,velocity.y);if(speed)move(s,velocity.x/speed,velocity.y/speed,Math.min(dt,(250-age)/1000),speed,thiefWalls(g,s));}}
  }
  if(age<250)for(const h of g.guards){const velocity=this.velocities.get(h.id);if(velocity){const speed=Math.hypot(velocity.x,velocity.y);if(speed)move(h,velocity.x/speed,velocity.y/speed,Math.min(dt,(250-age)/1000),speed,[...g.walls,...zones(g)]);}}
  for(const l of g.loot){const holder=g.seats.find(s=>s.id===l.holder);if(holder){l.x=holder.x;l.y=holder.y;}else if(l.flight){const t=Math.min(1,(to-l.flight.at)/500);l.x=l.flight.from.x+(l.flight.to.x-l.flight.from.x)*t;l.y=l.flight.from.y+(l.flight.to.y-l.flight.from.y)*t;}}
  for(const n of g.noises){const holder=g.seats.find(s=>s.id===(n.attached||n.holder));if(holder){n.x=holder.x;n.y=holder.y;}else if(n.flight>0){const speed=Math.hypot(n.vx,n.vy);if(speed)move(n,n.vx/speed,n.vy/speed,Math.min(dt,n.flight),speed,g.walls);n.flight=Math.max(0,n.flight-dt);}}
 }
 positions(){const out=new Map<string,Vec>();if(!this.game)return out;for(const s of [...this.game.seats,...this.game.guards]){const o=this.offsets.get(s.id),p={x:s.x,y:s.y};if(o){const d=Math.hypot(o.x,o.y);if(d){const walls='team' in s?thiefWalls(this.game,s):this.game.walls;move(p,o.x/d,o.y/d,1,d,walls);}}out.set(s.id,p);}return out;}
 current(){if(!this.game)return null;const v=view(this.game,this.you);if(v.phase==='finished'&&this.authoritative?.phase==='playing')v.phase='playing';return v;}
 actions():NetAction[]{return this.pending.slice(0,16).map(({at,...a})=>a);}
}
