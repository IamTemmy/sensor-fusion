import type {MuseumArena} from './arenas';
const art=new Map<string,HTMLImageElement>(),loading=new Set<string>();
function load(kind:string){if(loading.has(kind)||typeof Image==='undefined')return;loading.add(kind);const im=new Image();im.onload=()=>art.set(kind,im);im.src='/art/museum/'+({fossil:'fossil-v2',sculpture:'victory-statue',orrery:'orrery'}[kind]||'victory-statue')+'.webp';}
/** Ropes trace existing collision geometry. No extra solid objects are created. */
export function drawMuseumDecor(c:CanvasRenderingContext2D,arena?:MuseumArena){
 if(!arena)return;
 for(const d of arena.decor){load(d.kind);c.save();c.translate(d.x+d.w/2,d.y+d.h/2);const w=d.w,h=d.h;
 const shadow=c.createRadialGradient(0,5,2,0,5,w*.52);shadow.addColorStop(0,'#0008');shadow.addColorStop(1,'#0000');c.save();c.scale(1,h/w);c.fillStyle=shadow;c.beginPath();c.ellipse(0,5,w*.62,w*.48,0,0,Math.PI*2);c.fill();c.restore();
 const xs=w>130?[-w/2,0,w/2]:[-w/2,w/2];
 const rope=(front:boolean)=>{const y=front?h/2:-h/2;c.lineWidth=2.5;c.strokeStyle=arena.theme==='fossil'?'#336452':arena.theme==='celestial'?'#61507c':'#873c4c';for(let i=1;i<xs.length;i++){c.beginPath();c.moveTo(xs[i-1],y-12);c.quadraticCurveTo((xs[i-1]+xs[i])/2,y-4,xs[i],y-12);c.stroke();}for(const x of xs){c.fillStyle='#443722';c.beginPath();c.ellipse(x,y,5,2,0,0,7);c.fill();const g=c.createLinearGradient(x-2,0,x+2,0);g.addColorStop(0,'#6f5126');g.addColorStop(.5,'#f4d78a');g.addColorStop(1,'#947039');c.fillStyle=g;c.fillRect(x-1.5,y-13,3,13);c.beginPath();c.arc(x,y-14,3,0,7);c.fill();}};
 rope(false);c.strokeStyle='#805e59';c.lineWidth=2;for(const x of [-w/2,w/2]){c.beginPath();c.moveTo(x,-h/2-12);c.quadraticCurveTo(x+3,0,x,h/2-12);c.stroke();}
 const im=art.get(d.kind);if(im){const width=arena.id==='flagship-velmont'?(d.kind==='fossil'?80:d.kind==='sculpture'?64:76):d.kind==='fossil'?w*.96:Math.min(w*.95,105),height=width*im.height/im.width;c.drawImage(im,-width/2,h/2-height,width,height);}
 rope(true);c.restore();
 }
}
