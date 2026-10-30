import {distance,sight,isFlagship,guardActive,type Game,type View,type Vec,type Rect} from './engine.ts';

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
export type GuardMemory=Vec&{angle:number;at:number};
export function rememberGuards(memory:Map<string,GuardMemory>,guards:(Vec&{id:string;angle:number})[],visible:(p:Vec)=>boolean,now:number){
 for(const h of guards)if(visible(h))memory.set(h.id,{x:h.x,y:h.y,angle:h.angle,at:now});
 return [...memory].flatMap(([id,h])=>{if(now-h.at>=3000||!guards.some(g=>g.id===id)){memory.delete(id);return [];}return visible(guards.find(g=>g.id===id)!)?[]:[{id,...h,alpha:.5*(1-(now-h.at)/3000)}];});
}
type Memory={key:string;guards:Map<string,GuardMemory>;mask:HTMLCanvasElement;polygon:Vec[];origin:Vec;at:number};
const memories=new WeakMap<object,Memory>();
function shape(ctx:CanvasRenderingContext2D,polygon:Vec[],origin:Vec){ctx.beginPath();polygon.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.moveTo(origin.x+60,origin.y);ctx.arc(origin.x,origin.y,60,0,Math.PI*2);ctx.fill();}
export function prepareVision(ctx:CanvasRenderingContext2D,g:Game|View,you:string,positions:Map<string,Vec>,lights:'full'|'shadows'='shadows'){
 const me=g.seats.find(s=>s.id===you);if(!isFlagship(g)||!me||g.phase!=='playing'||typeof document==='undefined')return null;
 const origin=positions.get(you)||me,key=`${g.code}:${g.match}:${you}`;
 let m=memories.get(ctx.canvas);if(!m||m.key!==key){const c=document.createElement('canvas');c.width=960;c.height=600;m={key,guards:new Map(),mask:c,polygon:[],origin:{x:-999,y:-999},at:-Infinity};memories.set(ctx.canvas,m);}
 if(lights==='full'){m.guards.clear();return null;}
 if(distance(m.origin,origin)>2||g.now-m.at>100){m.polygon=visibilityPolygon(origin,g.walls);m.origin={...origin};m.at=g.now;}
 const visible=(p:Vec)=>visibleFrom(origin,p,g.walls),guards=g.guards.filter(h=>guardActive(g,h)).map(h=>({...h,...(positions.get(h.id)||h)}));
 const ghosts=rememberGuards(m.guards,guards,visible,g.now);
 // The whole building and exhibit state remain readable. Only opposing actors are occluded.
 const scene={...g,guards:g.guards.filter(h=>visible(positions.get(h.id)||h))};
 return {scene,visible,ghosts,unseen:guards.filter(h=>!visible(h)),origin,paint(){const f=m!.mask.getContext('2d')!;f.clearRect(0,0,960,600);f.globalCompositeOperation='source-over';f.fillStyle='rgba(39,44,51,.35)';f.fillRect(0,0,960,600);f.globalCompositeOperation='destination-out';shape(f,m!.polygon,origin);f.globalCompositeOperation='source-over';ctx.drawImage(m!.mask,0,0);}};
}
