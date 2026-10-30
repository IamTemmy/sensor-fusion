import {distance,sight,isFlagship,type Game,type View,type Vec,type Rect,type Loot} from './engine.ts';

/** Client presentation only. Does not mutate or redact the authoritative simulation. */
export function rayEnd(origin:Vec,angle:number,walls:Rect[],range=1200):Vec {
 const dx=Math.cos(angle),dy=Math.sin(angle);let nearest=range;
 for(const w of walls){let lo=0,hi=nearest;
  for(const [p,d,min,max] of [[origin.x,dx,w.x,w.x+w.w],[origin.y,dy,w.y,w.y+w.h]]){
   if(Math.abs(d)<1e-9){if(p<min||p>max){hi=-1;break;}}
   else{let a=(min-p)/d,b=(max-p)/d;if(a>b)[a,b]=[b,a];lo=Math.max(lo,a);hi=Math.min(hi,b);}
  }
  if(hi>=lo&&lo>=0)nearest=Math.min(nearest,lo);
 }
 return {x:origin.x+dx*nearest,y:origin.y+dy*nearest};
}
export function visibilityPolygon(origin:Vec,walls:Rect[]):Vec[]{
 const angles=new Set<number>();for(let i=0;i<64;i++)angles.add(i*Math.PI/32-Math.PI);
 for(const w of walls)for(const x of [w.x,w.x+w.w])for(const y of [w.y,w.y+w.h]){const a=Math.atan2(y-origin.y,x-origin.x);for(const e of [-.0001,0,.0001])angles.add(a+e);}
 return [...angles].sort((a,b)=>a-b).map(a=>rayEnd(origin,a,walls));
}
export const visibleFrom=(origin:Vec,p:Vec,walls:Rect[])=>distance(origin,p)<=60||sight(origin,p,walls);
type Memory={key:string;loot:Map<string,Loot>;explored:HTMLCanvasElement;mask:HTMLCanvasElement;polygon:Vec[];origin:Vec;at:number};
const memories=new WeakMap<object,Memory>();
function shape(ctx:CanvasRenderingContext2D,polygon:Vec[],origin:Vec){ctx.beginPath();polygon.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.moveTo(origin.x+60,origin.y);ctx.arc(origin.x,origin.y,60,0,Math.PI*2);ctx.fill();}
export function prepareVision(ctx:CanvasRenderingContext2D,g:Game|View,you:string,positions:Map<string,Vec>){
 const me=g.seats.find(s=>s.id===you);if(!isFlagship(g)||!me||g.phase!=='playing'||typeof document==='undefined')return null;
 const origin=positions.get(you)||me,key=`${g.code}:${g.match}:${you}`;
 let m=memories.get(ctx.canvas);if(!m||m.key!==key){const canvas=()=>{const c=document.createElement('canvas');c.width=960;c.height=600;return c;};m={key,loot:new Map(),explored:canvas(),mask:canvas(),polygon:[],origin:{x:-999,y:-999},at:-Infinity};memories.set(ctx.canvas,m);}
 if(distance(m.origin,origin)>2||g.now-m.at>100){m.polygon=visibilityPolygon(origin,g.walls);m.origin={...origin};m.at=g.now;const e=m.explored.getContext('2d')!;e.fillStyle='#fff';shape(e,m.polygon,origin);}
 const visible=(p:Vec)=>visibleFrom(origin,p,g.walls),loot:Loot[]=[];
 // Keep last-observed floor exhibits, never live positions of unseen moving actors.
 for(const l of g.loot){const old=m.loot.get(l.id);if(visible(l)){if(!l.banked&&!l.holder&&!l.guardCarrier&&!l.flight)m.loot.set(l.id,{...l});else m.loot.delete(l.id);loot.push(l);}
  else if(old){if(visible(old))m.loot.delete(l.id);else loot.push({...old});}}
 const scene={...g,loot,guards:g.guards.filter(h=>visible(positions.get(h.id)||h)),noises:g.noises.filter(n=>visible(n)),events:g.events.filter(e=>visible(e))};
 return {scene,visible,paint(){const f=m!.mask.getContext('2d')!;f.clearRect(0,0,960,600);f.globalCompositeOperation='source-over';f.fillStyle='#020711e6';f.fillRect(0,0,960,600);f.globalCompositeOperation='destination-out';f.globalAlpha=.24;f.drawImage(m!.explored,0,0);f.globalAlpha=1;shape(f,m!.polygon,origin);f.globalCompositeOperation='source-over';ctx.drawImage(m!.mask,0,0);
   for(const s of g.seats.filter(s=>s.id!==you&&s.team===me.team&&!s.escaped)){const p=positions.get(s.id)||s;if(visible(p))continue;ctx.save();ctx.fillStyle=s.stun>g.now?'#ff8e98':'#91ead9';ctx.beginPath();ctx.arc(p.x,p.y,5,0,Math.PI*2);ctx.fill();ctx.font='bold 10px Arial';ctx.textAlign='center';ctx.fillText(s.name.toUpperCase(),p.x,p.y-11);ctx.restore();}
 }};
}
