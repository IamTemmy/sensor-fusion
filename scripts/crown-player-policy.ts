import * as E from '../lib/noise/engine.ts';
/** Inputs only: free a hand, bottle the ordinary alarm, throw away from the crew, recover art. */
export function quietCrown(g:E.Game,h:E.Thief,c:E.Loot,state:{quieting?:boolean}){
 if(h.stun>g.now){state.quieting=false;return false;}
 const noise=g.noises.find(n=>n.source===c.id&&n.attached===h.id);
 if(h.hand===c.id&&noise&&E.distance(h,E.vanFor(g,h.team))>120){E.action(g,h,'drop');state.quieting=true;return true;}
 if(!state.quieting)return false;
 if(c.banked||c.guardCarrier||c.holder&&c.holder!==h.id){state.quieting=false;return false;}
 const jar=g.noises.find(n=>n.id===h.hand);
 if(jar){if(g.now<h.windup)return true;
  const crew=g.seats.filter(p=>p.id!==h.id&&p.team===h.team&&!p.escaped),guards=g.guards.filter(a=>E.guardActive(g,a));
  const points=[120,180,240].flatMap(r=>Array.from({length:16},(_,i)=>({x:h.x+Math.cos(i*Math.PI/8)*r,y:h.y+Math.sin(i*Math.PI/8)*r}))).filter(p=>E.clear(p,8,g.walls)&&E.sight(h,p,g.walls)&&crew.every(b=>E.distance(p,b)>100));
  points.sort((a,b)=>{const score=(p:E.Vec)=>guards.filter(a=>E.distance(a,p)<200).length*200+E.distance(p,E.vanFor(g,h.team));return score(b)-score(a);});
  if(points[0])E.action(g,h,'throw',points[0]);return true;
 }
 if(h.hand===c.id){state.quieting=false;return false;}
 const context=E.interaction(g,h);if(context.kind==='noise'||context.id===c.id)E.action(g,h,'grab');else state.quieting=false;return true;
}
