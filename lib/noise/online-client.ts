import {action,advance,move,view,thiefWalls,type Game,type View,type Vec} from './engine.ts';
import type {NetAction} from './network.ts';
type Pending=NetAction&{at:number};
const copy=<T,>(v:T):T=>JSON.parse(JSON.stringify(v));
/** Speculative full-world simulation. Only authoritative snapshots can award a final result. */
export class OnlinePrediction {
 game:Game|null=null;authoritative:View|null=null;you='';pending:Pending[]=[];nextAction=0;ack=0;clock=0;
 offsets=new Map<string,Vec&{left:number}>();dir:Vec={x:0,y:0};aim:Vec={x:480,y:300};sneak=false;
 reset(){this.game=null;this.authoritative=null;this.pending=[];this.nextAction=0;this.ack=0;this.clock=0;this.offsets.clear();}
 accept(v:View,ack=0,rtt=0){
  if(this.authoritative&&v.code===this.authoritative.code&&v.match===this.authoritative.match&&v.revision<this.authoritative.revision)return false;
  const changed=!this.authoritative||v.code!==this.authoritative.code||v.match!==this.authoritative.match;
  const previous=this.positions();if(changed)this.reset();
  this.authoritative=copy(v);this.you=v.you;this.ack=ack;this.nextAction=Math.max(this.nextAction,ack);this.pending=this.pending.filter(a=>a.id>ack);
  this.game=copy(v);this.clock=v.now+Math.min(300,Math.max(0,rtt/2));
  const target=this.clock;this.setInput();
  for(const a of this.pending){advance(this.game,Math.min(target,Math.max(this.game.now,a.at)));const s=this.game.seats.find(s=>s.id===this.you);if(s)action(this.game,s,a.action,a.aim);}
  advance(this.game,target);this.offsets.clear();
  if(!changed)for(const s of [...this.game.seats,...this.game.guards]){const p=previous.get(s.id);if(p&&Math.hypot(p.x-s.x,p.y-s.y)<=90)this.offsets.set(s.id,{x:p.x-s.x,y:p.y-s.y,left:120});}
  return true;
 }
 setInput(){if(!this.game)return;const s=this.game.seats.find(s=>s.id===this.you);if(s){s.dx=this.dir.x;s.dy=this.dir.y;s.aim={...this.aim};s.sneak=this.sneak;s.inputAt=this.game.now;}}
 predict(a:string){if(!this.game||this.game.phase!=='playing')return;const item={id:++this.nextAction,action:a,aim:{...this.aim},at:this.game.now};this.pending.push(item);const s=this.game.seats.find(s=>s.id===this.you);if(s)action(this.game,s,a,item.aim);return item;}
 frame(ms:number,dir:Vec,aim:Vec,sneak=false){if(!this.game)return;this.dir=dir;this.aim=aim;this.sneak=sneak;this.setInput();const dt=Math.min(50,Math.max(0,ms));
  // Never extrapolate indefinitely through an outage. The engine's 500ms human input expiry remains intact.
  this.clock=Math.min(this.clock+dt,(this.authoritative?.now||0)+750);
  advance(this.game,this.clock);
  for(const o of this.offsets.values()){const remaining=Math.max(0,o.left-dt),k=o.left?remaining/o.left:0;o.x*=k;o.y*=k;o.left=remaining;}
 }
 positions(){const out=new Map<string,Vec>();if(!this.game)return out;for(const s of [...this.game.seats,...this.game.guards]){const o=this.offsets.get(s.id),p={x:s.x,y:s.y};if(o){const d=Math.hypot(o.x,o.y);if(d){const walls='team' in s?thiefWalls(this.game,s):this.game.walls;move(p,o.x/d,o.y/d,1,d,walls);}}out.set(s.id,p);}return out;}
 current(){if(!this.game)return null;const v=view(this.game,this.you);if(v.phase==='finished'&&this.authoritative?.phase==='playing')v.phase='playing';return v;}
 actions():NetAction[]{return this.pending.slice(0,16).map(({at,...a})=>a);}
}
