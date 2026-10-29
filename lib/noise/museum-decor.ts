import type {MuseumArena} from './arenas';
const art=new Map<string,HTMLImageElement>();const loading=new Set<string>();
function loadArt(kind:string){if(loading.has(kind)||typeof Image==='undefined')return;loading.add(kind);const im=new Image();im.onload=()=>art.set(kind,im);im.src='/art/museum/'+(kind==='fossil'?'fossil-v2':'victory-statue')+'.webp';}
/** Non-interactive exhibits sit on their actual solid display footprints. */
export function drawMuseumDecor(c:CanvasRenderingContext2D,arena?:MuseumArena){
 if(!arena)return;loadArt('fossil');loadArt('sculpture');
 const line=(pts:number[][],color='#eadbb5',width=3)=>{c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();};
 for(const d of arena.decor){c.save();c.translate(d.x+d.w/2,d.y+d.h/2);const w=d.w,h=d.h;
 const exhibit=art.get(d.kind);
 if(exhibit){
  // A quiet brass-edged floor island marks the solid footprint. The sprite
  // includes its own pedestal; do not stack a wall/bookshelf underneath it.
  c.fillStyle='#101a20';c.beginPath();c.roundRect(-w/2,-h/2,w,h,8);c.fill();c.strokeStyle='#ad956480';c.lineWidth=1;c.stroke();
  const width=d.kind==='fossil'?w+12:Math.min(w+12,110),height=width*exhibit.height/exhibit.width;
  c.drawImage(exhibit,-width/2,h/2-height+2,width,height);c.restore();continue;
 }

 c.shadowColor='#000b';c.shadowBlur=12;c.shadowOffsetY=8;c.fillStyle='#07111b';c.beginPath();c.roundRect(-w/2,-h/2,w,h,8);c.fill();c.shadowBlur=0;c.shadowOffsetY=0;
 const g=c.createLinearGradient(0,-h/2,0,h/2);g.addColorStop(0,'#42505a');g.addColorStop(.45,'#192c37');g.addColorStop(1,'#091521');c.fillStyle=g;c.fillRect(-w/2+3,-h/2+3,w-6,h-6);c.strokeStyle='#c1a16a';c.lineWidth=1.5;c.strokeRect(-w/2+4,-h/2+4,w-8,h-8);
 if(d.kind==='fossil'){
  // Mounted theropod: segmented tail, barrel ribs, pelvic girdle, legs and jaw.
  line([[-74,2],[-59,-4],[-43,-10],[-25,-16],[-3,-19],[17,-18],[31,-25],[42,-38],[56,-41]],'#8e7652',6);
  line([[-74,1],[-59,-5],[-43,-11],[-25,-17],[-3,-20],[17,-19],[31,-26],[42,-39],[56,-42]],'#e8dab3',3);
  for(let i=0;i<8;i++){const x=-27+i*6;const yy=-17-Math.sin(i/8*Math.PI)*3;line([[x,yy],[x-5,yy+10],[x-3,yy+22],[x+2,yy+25],[x+5,yy+18]],'#d7c59c',2);line([[x,yy-3],[x+1,yy+2]],'#fff0c9',3);}
  line([[-27,-12],[-35,1],[-25,14],[-27,20],[-38,20]],'#d9c7a1',4);line([[12,-11],[22,0],[15,16],[22,20],[31,20]],'#dfcfa8',4);
  line([[30,-25],[37,-15],[46,-14]],'#ebd9b3',2);line([[37,-15],[43,-9]],'#ebd9b3',1.5);
  c.fillStyle='#e4d3ad';c.beginPath();c.moveTo(47,-46);c.lineTo(65,-47);c.lineTo(76,-39);c.lineTo(74,-32);c.lineTo(59,-34);c.lineTo(52,-30);c.closePath();c.fill();c.fillStyle='#13212b';c.beginPath();c.ellipse(58,-40,4,3,0,0,7);c.fill();line([[55,-29],[68,-26],[75,-31]],'#e4d3ad',2);
  for(let x=61;x<75;x+=4)line([[x,-33],[x-1,-29]],'#fff0cf',1);
  line([[-20,20],[-20,-8]],'#8e784e',1);line([[29,20],[29,-20]],'#8e784e',1);
 }else if(d.kind==='orrery'){
  c.fillStyle='#c4a669';c.beginPath();c.ellipse(0,13,23,8,0,0,7);c.fill();line([[0,10],[0,-15]],'#ddbf7b',5);
  c.strokeStyle='#dfbd7b';c.lineWidth=2;for(const tilt of [-.65,.65,0]){c.beginPath();c.ellipse(0,-20,33,15,tilt,0,Math.PI*2);c.stroke();}
  const glow=c.createRadialGradient(-3,-23,1,0,-20,16);glow.addColorStop(0,'#fff4cd');glow.addColorStop(.4,'#e7c274');glow.addColorStop(1,'#89643f');c.fillStyle=glow;c.beginPath();c.arc(0,-20,13,0,7);c.fill();for(const [x,y,r]of [[-29,-27,5],[25,-5,4],[21,-37,3]]){c.fillStyle='#85b4bb';c.beginPath();c.arc(x,y,r,0,7);c.fill();}
 }else{
  c.fillStyle='#d7d6c8';c.beginPath();c.moveTo(-16,13);c.lineTo(-12,-14);c.lineTo(-5,-29);c.lineTo(8,-29);c.lineTo(14,-14);c.lineTo(20,13);c.closePath();c.fill();c.fillStyle='#faf1d6';c.beginPath();c.ellipse(1,-36,9,12,-.1,0,7);c.fill();line([[-6,-22],[-24,-10],[-34,-21]],'#e9e3cf',5);line([[10,-23],[28,-37],[36,-32]],'#e9e3cf',5);line([[-7,-11],[-9,11]],'#929b9a',2);line([[3,-10],[8,13]],'#b1b5aa',2);c.fillStyle='#dfd2ad';c.fillRect(-25,13,50,5);
 }
 // Small bronze interpretation label, intentionally no floating gameplay label.
 c.fillStyle='#b8a079';c.fillRect(-16,h/2-7,32,4);c.restore();
 }
}
