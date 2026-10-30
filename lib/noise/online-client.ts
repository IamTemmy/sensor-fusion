import {action,move,view,thiefWalls,carrySpeed,CARRY_SPEED,type Game,type View,type Vec} from './engine.ts';
import type {NetAction} from './network.ts';
export type Movement={seq:number;dx:number;dy:number;sneak:boolean;sentAt:number};
type Pending=NetAction&{at:number};
const copy=<T,>(v:T):T=>JSON.parse(JSON.stringify(v));
/** Presentation prediction only: the host alone runs AI, captures, sensors and scoring. */
export class OnlinePrediction {
 game:Game|null=null;authoritative:View|null=null;you='';pending:Pending[]=[];nextAction=0;ack=0;clock=0;
 movements:Movement[]=[];changes:{at:number;dir:Vec;sneak:boolean}[]=[];snapshots:{v:View;at:number}[]=[];
 relay=false;snapshotGaps:number[]=[];private renderAt:number|undefined;private renderClock=0;
 setRelay(relay:boolean){if(this.relay===relay)return;this.relay=relay;this.snapshotGaps=[];this.renderAt=undefined;}
 get interpolationDelay(){const gaps=[...this.snapshotGaps].sort((a,b)=>a-b);return this.relay&&gaps.length?Math.max(100,Math.min(600,1.5*gaps[Math.ceil(gaps.length*.9)-1])):100;}
 now:()=>number;constructor(now=()=>performance.now()){this.now=now;}
 recordMovement(a:{seq:number;dx:number;dy:number;sneak?:boolean}){this.movements.push({...a,sneak:!!a.sneak,sentAt:this.now()});this.movements=this.movements.slice(-256);}
 offsets=new Map<string,Vec&{left:number}>();dir:Vec={x:0,y:0};aim:Vec={x:480,y:300};sneak=false;
 reset(){this.game=null;this.authoritative=null;this.pending=[];this.nextAction=0;this.ack=0;this.clock=0;this.offsets.clear();this.movements=[];this.changes=[];this.snapshots=[];this.snapshotGaps=[];this.renderAt=undefined;}
 accept(v:View,ack=0,rtt=0){
  if(this.authoritative&&v.code===this.authoritative.code&&v.match===this.authoritative.match&&v.revision<=this.authoritative.revision)return false;
  const changed=!this.authoritative||v.code!==this.authoritative.code||v.match!==this.authoritative.match;
  const previous=this.positions();if(changed)this.reset();
  const received=this.now();
  const last=this.snapshots.at(-1);if(last&&received>last.at){this.snapshotGaps.push(received-last.at);this.snapshotGaps=this.snapshotGaps.slice(-10);}
  this.snapshots.push({v:copy(v),at:received});this.snapshots=this.snapshots.slice(-32);
  this.authoritative=copy(v);this.you=v.you;this.ack=Math.max(this.ack,ack);this.nextAction=Math.max(this.nextAction,this.ack);this.pending=this.pending.filter(a=>a.id>this.ack);
  this.game=copy(v);this.clock=v.now;
  if((v as View&{hostAway?:boolean}).hostAway){this.offsets.clear();this.movements=[];this.changes=[];return true;}
  const own=v.seats.find(s=>s.id===this.you);
  const anchor=this.movements.find(m=>m.seq===own?.lastSeq);
  // inputAt is the host time at which lastSeq was accepted. Map this snapshot
  // onto the local input timeline; replay actual directions, never ping/2.
  const from=anchor?anchor.sentAt+Math.max(0,v.now-own!.inputAt):this.movements.find(m=>m.seq>(own?.lastSeq||0))?.sentAt;
  if(from!==undefined){
   let at=Math.max(from,received-750);
   let active=this.changes.filter(c=>c.at<=at).at(-1);
   for(const c of this.changes.filter(c=>c.at>at&&c.at<=received)){
    if(active)this.replayMovement(c.at-at,active.dir,active.sneak);at=c.at;active=c;
   }
   if(active)this.replayMovement(received-at,active.dir,active.sneak);
  }
  // Keep the acknowledged anchor until a newer sequence arrives.
  this.movements=this.movements.filter(m=>m.seq>=(own?.lastSeq||0));
  const cutoff=this.movements[0]?.sentAt??received-750;
  const first=this.changes.findIndex(c=>c.at>=cutoff);if(first>1)this.changes.splice(0,first-1);else if(first===-1)this.changes=this.changes.slice(-1);
  this.clock=this.game.now;this.setInput();
  for(const a of this.pending){const s=this.game.seats.find(s=>s.id===this.you);if(s)action(this.game,s,a.action,a.aim);}
  this.offsets.clear();
  if(!changed&&own){const s=this.game.seats.find(s=>s.id===this.you)!;const p=previous.get(s.id);if(p&&Math.hypot(p.x-s.x,p.y-s.y)<=20)this.offsets.set(s.id,{x:p.x-s.x,y:p.y-s.y,left:80});}
  return true;
 }
 setInput(){if(!this.game)return;const s=this.game.seats.find(s=>s.id===this.you);if(s){s.dx=this.dir.x;s.dy=this.dir.y;s.aim={...this.aim};s.sneak=this.sneak;s.inputAt=this.game.now;}}
 predict(a:string){if(!this.game||this.game.phase!=='playing'||(this.game as Game&{hostAway?:boolean}).hostAway)return;const item={id:++this.nextAction,action:a,aim:{...this.aim},at:this.game.now};this.pending.push(item);const s=this.game.seats.find(s=>s.id===this.you);if(s)action(this.game,s,a,item.aim);return item;}
 frame(ms:number,dir:Vec,aim:Vec,sneak=false){if(!this.game||(this.game as Game&{hostAway?:boolean}).hostAway)return;const at=this.now();if(!this.changes.length||dir.x!==this.dir.x||dir.y!==this.dir.y||sneak!==this.sneak)this.changes.push({at,dir:{...dir},sneak});this.dir=dir;this.aim=aim;this.sneak=sneak;this.setInput();const dt=Math.min(50,Math.max(0,ms));
  // Never extrapolate indefinitely through an outage. The engine's 500ms human input expiry remains intact.
  this.clock=Math.min(this.clock+dt,(this.authoritative?.now||0)+750);
  this.advancePresentation(this.clock);
  for(const o of this.offsets.values()){const remaining=Math.max(0,o.left-dt),k=o.left?remaining/o.left:0;o.x*=k;o.y*=k;o.left=remaining;}
 }
 // No bot decisions, pathfinding, captures, or score mutations on guests.
 // Only the local thief moves here; remote actors use buffered interpolation.
 private advancePresentation(to:number){
  const g=this.game;if(!g||g.phase!=='playing')return;
  const until=Math.min(to,g.now+750);while(g.now<until)this.stepPresentation(Math.min(until,g.now+40));
 }
 private stepPresentation(to:number){
  const g=this.game!;if(g.phase!=='playing')return;
  const before=g.now,dt=Math.max(0,Math.min(750,to-before))/1000;g.now=to;
  const s=g.seats.find(s=>s.id===this.you);
  if(s&&!s.escaped&&s.stun<=before){
   const art=g.loot.find(l=>l.id===s.hand),speed=(s.hand?(art?carrySpeed(art.value,g):CARRY_SPEED):165)*(s.sneak?.55:1);
   move(s,s.dx,s.dy,dt,speed,thiefWalls(g,s));
  }
  for(const l of g.loot){const holder=g.seats.find(s=>s.id===l.holder);if(holder){l.x=holder.x;l.y=holder.y;}else if(l.flight){const t=Math.min(1,(to-l.flight.at)/500);l.x=l.flight.from.x+(l.flight.to.x-l.flight.from.x)*t;l.y=l.flight.from.y+(l.flight.to.y-l.flight.from.y)*t;}}
  for(const n of g.noises){const holder=g.seats.find(s=>s.id===(n.attached||n.holder));if(holder){n.x=holder.x;n.y=holder.y;}else if(n.flight>0){const speed=Math.hypot(n.vx,n.vy);if(speed)move(n,n.vx/speed,n.vy/speed,Math.min(dt,n.flight),speed,g.walls);n.flight=Math.max(0,n.flight-dt);}}
 }
 private replayMovement(ms:number,dir:Vec,sneak:boolean){this.dir=dir;this.sneak=sneak;this.setInput();this.advancePresentation(this.game!.now+ms);}
 positions(){const out=new Map<string,Vec>();if(!this.game)return out;
  const now=this.now(),desired=now-this.interpolationDelay;
  // Slew the playback clock when the measured delay changes: never rewind actors
  // or freeze them merely to fill a newly enlarged buffer. Own prediction is separate.
  let target=desired;
  if(this.relay){if(this.renderAt===undefined)this.renderAt=desired;else{const dt=Math.max(0,now-this.renderClock);this.renderAt+=dt*Math.max(.5,Math.min(1.25,1+(desired-this.renderAt-dt)/500));}target=this.renderAt;this.renderClock=now;}
  let newer=this.snapshots.find(s=>s.at>=target)||this.snapshots.at(-1);
  let older=[...this.snapshots].reverse().find(s=>s.at<=target)||this.snapshots[0];
  const latest=this.snapshots.at(-1);if(this.relay&&latest&&target>latest.at&&this.snapshots.length>1){newer=latest;older=this.snapshots.at(-2)!;}
  for(const s of [...this.game.seats,...this.game.guards]){
   let p={x:s.x,y:s.y};
   if(s.id===this.you){const o=this.offsets.get(s.id);if(o){const d=Math.hypot(o.x,o.y);if(d)move(p,o.x/d,o.y/d,1,d,thiefWalls(this.game,s as Game['seats'][number]));}}
   else if(older&&newer){const a=[...older.v.seats,...older.v.guards].find(a=>a.id===s.id),b=[...newer.v.seats,...newer.v.guards].find(a=>a.id===s.id);if(a&&b){const t=newer.at===older.at?1:Math.max(0,Math.min(this.relay?1+100/(newer.at-older.at):1,(target-older.at)/(newer.at-older.at)));p={x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t};}}
   out.set(s.id,p);
  }return out;}
 current(){if(!this.game)return null;const v=view(this.game,this.you);if(v.phase==='finished'&&this.authoritative?.phase==='playing')v.phase='playing';return v;}
 actions():NetAction[]{return this.pending.slice(0,16).map(({at,...a})=>a);}
}
