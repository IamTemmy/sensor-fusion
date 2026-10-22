import {blackoutActive,tuning,homeSafe,W,H,WALLS,EXIT,SAFE_ZONE,zones,zoneFor,vanFor,sensors,PLATE,plateOpen,interaction,distance,clear,type Game,type View,type Vec} from './engine';
export type Camera={x:number;y:number;scale:number;w:number;h:number};
export function camera(width:number,height:number,me?:Vec):Camera {const scale=width>=650?Math.min(width/W,height/H):Math.max(width/W,height/H);const w=width/scale,h=height/scale;if(width>=650)return {x:-(w-W)/2,y:-(h-H)/2,scale,w,h};return {x:Math.max(0,Math.min(W-w,(me?.x||W/2)-w/2)),y:Math.max(0,Math.min(H-h,(me?.y||H/2)-h/2)),scale,w,h};}
export const COLORS=['#8ef2d2','#bdadff','#ffb974','#91c6ff','#f79cbb','#c2e082'];
export function draw(ctx:CanvasRenderingContext2D,g:Game|View,width:number,height:number,time:number,you:string,positions:Map<string,Vec>,aim:Vec,background=false,reducedMotion=false){
 const walls=g.walls||WALLS,plate=g.plate||PLATE,jackpot=g.loot.find(l=>l.value===1200);
 const me=g.seats.find(s=>s.id===you),display=positions.get(you)||me;const cam=camera(width,height,display);const t=reducedMotion?0:time/1000;
 ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);const ratio=ctx.canvas.width/width;ctx.scale(ratio,ratio);ctx.fillStyle='#0a101e';ctx.fillRect(0,0,width,height);ctx.scale(cam.scale,cam.scale);ctx.translate(-cam.x,-cam.y);
 const caught=g.events.find(e=>e.kind==='catch'&&e.text.includes('caught!')&&g.now-e.at>=0&&g.now-e.at<150);if(caught&&!reducedMotion){const a=(g.now-caught.at)/150;ctx.translate(Math.sin(a*55)*3*(1-a),Math.cos(a*43)*2*(1-a));}
 const rect=(x:number,y:number,w:number,h:number,c:string,r=0)=>{ctx.fillStyle=c;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();};
 const circle=(x:number,y:number,r:number,c:string)=>{ctx.fillStyle=c;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();};
 const text=(s:string,x:number,y:number,size=11,color='#93aaa9',align:CanvasTextAlign='left')=>{ctx.font=`${size>=16?'700':'500'} ${size}px 'Trebuchet MS', sans-serif`;ctx.textAlign=align;ctx.fillStyle=color;ctx.fillText(s,x,y);};
 const art=(value:number,x:number,y:number,scale=1)=>{ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);
 if(value===1200){rect(-14,-14,28,25,'#edbe52',8);circle(-6,-4,3,'#202b36');circle(6,-4,3,'#202b36');rect(-5,5,10,3,'#9b6329',1);ctx.fillStyle='#ffe69c';ctx.beginPath();ctx.moveTo(-14,-12);ctx.lineTo(-18,-24);ctx.lineTo(-5,-17);ctx.lineTo(0,-27);ctx.lineTo(6,-17);ctx.lineTo(18,-24);ctx.lineTo(14,-12);ctx.fill();}
 else if(value>=1000){rect(-15,9,30,8,'#b8c7ce',2);rect(-10,-2,20,13,'#e4e6de',5);circle(0,-13,10,'#eee5cd');rect(-3,-5,6,7,'#d4cfbe');}
 else if(value>=500){rect(-18,-21,36,36,'#c59657',2);rect(-14,-17,28,28,'#223f54');circle(6,-10,5,'#efc16d');ctx.fillStyle='#75b7a3';ctx.beginPath();ctx.moveTo(-14,11);ctx.lineTo(-5,-8);ctx.lineTo(6,11);ctx.fill();}
 else {rect(-10,8,20,5,'#ac8050',2);circle(0,-11,6,'#e5bd83');rect(-5,-6,10,15,'#d29a59',4);rect(-10,-1,20,4,'#e4b775',2);}ctx.restore();};
 // A fixed museum stage. All decoration is paint, never extra collision geometry.
 const floor=['#101f2a','#191e30','#102923'][g.layout];
 rect(18,18,924,564,'#050c17',12);rect(24,24,912,552,floor,3);
 ctx.save();ctx.beginPath();ctx.rect(24,24,912,552);ctx.clip();
 for(let y=24;y<576;y+=48)for(let x=24;x<936;x+=48){
  rect(x+1,y+1,46,46,((x+y)/48)%2?'#ffffff03':'#0000000a');
  ctx.strokeStyle='#adc5bf06';ctx.strokeRect(x+1,y+1,46,46);
  if(g.layout===1){ctx.strokeStyle='#cfae7a0c';ctx.beginPath();ctx.moveTo(x,y+12);ctx.lineTo(x+48,y+12);ctx.moveTo(x,y+36);ctx.lineTo(x+48,y+36);ctx.stroke();}
 }
 ctx.strokeStyle='#bbac7760';ctx.lineWidth=2;ctx.strokeRect(36,36,888,528);ctx.strokeStyle='#bbac7720';ctx.strokeRect(42,42,876,516);
 // Inlaid compass at the heart of the collection, beneath all game objects.
 ctx.save();ctx.translate(480,300);ctx.strokeStyle='#d2bc7b14';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,110,0,Math.PI*2);ctx.stroke();ctx.rotate(Math.PI/4);ctx.strokeRect(-77,-77,154,154);ctx.restore();
 for(const l of g.loot){if(l.banked)continue;const light=ctx.createRadialGradient(l.x,l.y,8,l.x,l.y,100);light.addColorStop(0,'#ffe0a512');light.addColorStop(1,'#ffe0a500');ctx.fillStyle=light;ctx.fillRect(l.x-100,l.y-100,200,200);}
 ctx.restore();
 // Plate gates the jackpot, but never traps a thief in a room.
 const open=plateOpen(g);rect(plate.x-22,plate.y-18,44,36,open?'#b6f2d4':'#4a3d58',6);text(open?'OPEN':'HOLD',plate.x,plate.y+4,10,open?'#17352c':'#ddc1f2','center');ctx.strokeStyle=open?'#b6f2d4':'#ab8bba66';ctx.setLineDash([5,6]);ctx.beginPath();ctx.moveTo(plate.x+24,plate.y);ctx.lineTo(jackpot?.x||835,jackpot?.y||120);ctx.stroke();ctx.setLineDash([]);
 // Extraction bay.
 for(const team of [...new Set(g.seats.map(s=>s.team))]){const v=vanFor(g,team),z=zoneFor(g,team),color=COLORS[team];rect(z.x,z.y,z.w,z.h,color+'35');ctx.strokeStyle=color;ctx.strokeRect(z.x,z.y,z.w,z.h);text(g.crewMode==='coop'?'SAFE · BANK':['MINT VAN','VIOLET VAN','AMBER VAN'][team],v.x,z.y-9,9,color,'center');rect(v.x-24,v.y-22,12,8,'#070f1b',3);rect(v.x+13,v.y-22,12,8,'#070f1b',3);rect(v.x-24,v.y+14,12,8,'#070f1b',3);rect(v.x+13,v.y+14,12,8,'#070f1b',3);rect(v.x-30,v.y-17,60,34,color,8);rect(v.x-25,v.y-12,15,24,'#183047',3);rect(v.x-5,v.y-12,27,24,'#ffffff33',4);rect(v.x+27,v.y-12,4,7,'#fff0b5',1);rect(v.x+27,v.y+5,4,7,'#fff0b5',1);}
 // Sparse decorative frames: no external assets, no visual blockers disguised as floor.
 for(const [x,y,c] of [[98,36,'#9c7259'],[200,36,'#587b78'],[715,36,'#a28c59'],[850,36,'#8d627b']] as [number,number,string][]){rect(x,y,46,10,'#b49862',2);rect(x+4,y+2,38,6,c);}
 // Guard cones use true facing; walls mask their vision in the simulation.
 for(const guard of g.guards){const p=positions.get(guard.id)||guard;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(guard.angle);ctx.globalAlpha=(guard.retreatUntil||0)>g.now?.25:1;const vision=blackoutActive(g)?60:180*tuning(g).sight;const grad=ctx.createRadialGradient(0,0,0,0,0,vision);grad.addColorStop(0,guard.mode==='chase'?'#ff62694a':'#c2e7ff4a');grad.addColorStop(1,'#d8efff00');ctx.fillStyle=grad;ctx.beginPath();ctx.moveTo(0,0);for(let a=-0.65;a<=0.651;a+=0.025){let reach=8;while(reach<vision&&clear({x:p.x+Math.cos(guard.angle+a)*reach,y:p.y+Math.sin(guard.angle+a)*reach},0,[...walls,...zones(g)]))reach+=6;ctx.lineTo(Math.cos(a)*reach,Math.sin(a)*reach);}ctx.closePath();ctx.fill();ctx.restore();}
 // Extrusion is lifted upward from the original wall footprint; collision stays exact.
 for(const w of walls){
  ctx.save();ctx.shadowColor='#000b';ctx.shadowBlur=10;ctx.shadowOffsetY=7;rect(w.x,w.y,w.w,w.h,'#040c16',2);ctx.restore();
  rect(w.x,w.y-11,w.w,w.h+11,'#182b3b',2);
  rect(w.x,w.y+w.h-11,w.w,11,'#263c4b',1);
  rect(w.x,w.y-11,w.w,w.h,'#788a94',2);
  rect(w.x+2,w.y-9,Math.max(1,w.w-4),Math.max(1,w.h-4),'#596e7c',1);
  rect(w.x,w.y-11,w.w,2,'#b8ccce');
  if(w.w>40)rect(w.x+7,w.y+w.h-9,w.w-14,2,'#ac956744');
  if(g.layout===1&&w.w>50&&w.h>=16)for(let bx=w.x+8;bx<w.x+w.w-8;bx+=8)rect(bx,w.y-6,5,Math.min(14,w.h-8),['#a8806a','#baaa7d','#57938c'][Math.floor(bx/8)%3],1);
  else if(w.w>45&&w.h>18&&w.w<200){rect(w.x+6,w.y-5,w.w-12,w.h-12,'#94c5c44a',2);ctx.strokeStyle='#daeee788';ctx.strokeRect(w.x+6,w.y-5,w.w-12,w.h-12);}
 }
 for(const l of g.loot){if(l.banked||l.holder)continue;if(l.sealed){text('SIDE VAULT',l.x,l.y,9,'#9490b0','center');continue;}if(l.locked&&!open){rect(l.x-25,l.y-30,50,60,'#829bc333',5);text('LOCKED',l.x,l.y-35,9,'#e2b9f2','center');}const glow=ctx.createRadialGradient(l.x,l.y,4,l.x,l.y,44);glow.addColorStop(0,'#ffd18025');glow.addColorStop(1,'#ffd18000');ctx.fillStyle=glow;ctx.fillRect(l.x-44,l.y-44,88,88);ctx.save();ctx.shadowColor='#000b';ctx.shadowBlur=9;ctx.shadowOffsetY=5;rect(l.x-18,l.y-5,36,25,'#10151f',4);ctx.restore();rect(l.x-18,l.y+3,36,14,'#324250',3);rect(l.x-18,l.y-10,36,17,'#8a9c9e',4);rect(l.x-15,l.y-8,30,10,'#bac6b4',3);art(l.value,l.x,l.y-7+Math.sin(t*2+l.value)*2);text('$'+l.value,l.x,l.y+36,10,'#e6c58e','center');if(l.droppedAt){ctx.globalAlpha=.65+.35*Math.sin(t*6);text('DROPPED · '+Math.ceil(((l.recoverAt||g.now)-g.now)/1000)+'s',l.x,l.y-35,10,'#ffb38d','center');ctx.globalAlpha=1;}}
 for(const sensor of sensors(g)){rect(sensor.x,sensor.y,sensor.w,sensor.h,sensor.cooldown>g.now?'#ff8b72':'#8ab3eb55');text('SENSOR',sensor.x+sensor.w/2,sensor.y-8,8,'#9dbadd','center');}
 for(const n of g.noises){if(n.holder)continue;const age=reducedMotion?0:(g.now-n.born)/1000;const r=25+(age*40%65);ctx.strokeStyle='#ff887a'+(n.flight>0?'bb':'70');ctx.lineWidth=2;ctx.beginPath();ctx.arc(n.x,n.y,r,0,Math.PI*2);ctx.stroke();if(n.flight<=0){ctx.strokeStyle='#ff887a35';ctx.beginPath();ctx.arc(n.x,n.y,r+20,0,Math.PI*2);ctx.stroke();}if(n.attached)continue;rect(n.x-10,n.y-13,20,28,'#ff9983',8);rect(n.x-7,n.y-17,14,6,'#e8ce95',2);rect(n.x-6,n.y-8,3,13,'#ffe2ba',2);text('♪',n.x+2,n.y+7,16,'#593048','center');}
 if(me&&!me.escaped&&g.phase==='playing'){const p=display!;ctx.strokeStyle='#8ef2d21c';ctx.lineWidth=1;ctx.setLineDash([3,8]);ctx.beginPath();ctx.arc(p.x,p.y,110,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);if(me.hand){const d=distance(p,aim)||1;ctx.strokeStyle='#b4fff080';ctx.setLineDash([5,5]);ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x+(aim.x-p.x)/d*125,p.y+(aim.y-p.y)/d*125);ctx.stroke();ctx.setLineDash([]);}}
 for(const guard of g.guards){const p=positions.get(guard.id)||guard;ctx.save();ctx.translate(p.x,p.y);ctx.scale(1.2,1.2);ctx.translate(-p.x,-p.y);ctx.globalAlpha=(guard.retreatUntil||0)>g.now?.35:1;
 circle(p.x+3,p.y+9,15,'#00000055');rect(p.x-11,p.y-3,22,19,'#26334b',6);rect(p.x-4,p.y+2,8,12,'#495a74',2);
 circle(p.x,p.y-5,10,'#d6a982');rect(p.x-12,p.y-15,24,8,guard.mode==='chase'?'#af4e60':'#697f9a',3);rect(p.x-14,p.y-9,28,4,'#172334',2);circle(p.x,p.y-12,2,'#efd286');
 circle(p.x-4,p.y-4,1.5,'#202333');circle(p.x+4,p.y-4,1.5,'#202333');
 ctx.save();ctx.translate(p.x,p.y);ctx.rotate(guard.angle);rect(10,-3,11,6,'#899ba9',2);rect(18,-3,4,6,'#ffe6a5',1);ctx.restore();
 text(guard.mode==='chase'?'!':guard.mode==='investigate'?'?':'',p.x,p.y-24,20,'#ffb09b','center');ctx.restore();}
 const labels:{x:number;y:number}[]=g.seats.map(s=>vanFor(g,s.team)).map(v=>({x:v.x,y:v.y-44}));const label=(value:string,x:number,y:number,color:string)=>{while(labels.some(p=>Math.abs(p.x-x)<115&&Math.abs(p.y-y)<14))y-=15;labels.push({x,y});text(value,x,y,10,color,'center');};
 [...g.seats].sort((a,b)=>Number(a.id===you)-Number(b.id===you)).forEach(s=>{const i=g.seats.indexOf(s);if(s.escaped)return;const p=positions.get(s.id)||s;ctx.save();ctx.globalAlpha=s.stun>g.now?.8:1;circle(p.x+2,p.y+9,14,'#00000060');const color=s.stun>g.now?'#899fae':COLORS[g.crewMode==='coop'?i%COLORS.length:s.team];if(s.safe>g.now){ctx.strokeStyle='#d7fff0';ctx.lineWidth=3;ctx.beginPath();ctx.arc(p.x,p.y,28,0,Math.PI*2);ctx.stroke();}ctx.save();ctx.translate(p.x,p.y);ctx.scale(1.2,1.2);
 const grab=g.events.find(e=>e.text.startsWith('The art screams!')&&g.now-e.at<350&&distance(e,s)<25);const bounce=grab&&!reducedMotion?Math.sin((g.now-grab.at)/350*Math.PI):0;ctx.scale(1+bounce*.12,1-bounce*.12);ctx.translate(0,-bounce*5);
 // Face-forward silhouettes stay legible while the feet indicate movement.
 const facing=Math.atan2(s.aim.y-s.y,s.aim.x-s.x);const bob=Math.sin(t*10+i)*1.1;
 rect(-9,7,7,10,'#0c1827',3);rect(3,7,7,10,'#0c1827',3);
 rect(-12,-2,24,17,color,7);rect(-5,0,10,14,'#152c3c',3);rect(-15,0,5,10,color,3);rect(10,0,5,10,color,3);
 rect(-18,-1,13,17,'#b49167',5);rect(-18,2,13,3,'#e2bd84',1);circle(0,-8+bob,12,color);circle(1,-6+bob,9,s.stun>g.now?'#a7b8c2':'#edc49b');
 rect(-9,-11+bob,19,8,'#142032',4);circle(-4+Math.cos(facing),-7+bob,2,'#fff6dc');circle(5+Math.cos(facing),-7+bob,2,'#fff6dc');
 ctx.strokeStyle='#8f5445';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(2,-1+bob,3,0,Math.PI*.8);ctx.stroke();
 rect(-11,-20+bob,22,7,color,3);rect(-5,-23+bob,14,5,color,3);
 ctx.restore();ctx.restore();if(s.id===you){ctx.strokeStyle='#ffffff';ctx.lineWidth=3;ctx.beginPath();ctx.roundRect(p.x-23,p.y-32,46,56,17);ctx.stroke();circle(p.x,p.y+29,3,'#ffffff');text('YOU',p.x,p.y+42,9,'#ffffff','center');}
  if(s.hand){const noise=g.noises.some(n=>n.id===s.hand);if(noise){circle(p.x+15,p.y-12,9,'#ff8c82');text('♪',p.x+15,p.y-9,11,'#562b32','center');}else art(g.loot.find(l=>l.id===s.hand)?.value||200,p.x+18,p.y-13,.55);if(noise){const n=g.noises.find(n=>n.id===s.hand)!;text(Math.ceil((n.expires-g.now)/1000)+'s',p.x+26,p.y-20,10,'#ffc2ae');}}
  if(s.stun>g.now){ctx.strokeStyle='#ff8f8f';ctx.lineWidth=3;ctx.beginPath();ctx.arc(p.x,p.y,23,-Math.PI/2,-Math.PI/2+Math.PI*2*Math.min(1,(s.stun-g.now)/6000));ctx.stroke();rect(p.x-5,p.y-7,10,9,'#ffc2b4',2);ctx.strokeRect(p.x-3,p.y-12,6,7);label((s.id===you?'YOU':s.name.toUpperCase())+' · LOCKED '+Math.ceil((s.stun-g.now)/1000)+'s',p.x,p.y-43,'#bfd9ed');}else if(s.safe>g.now)label((s.id===you?'YOU':s.name.toUpperCase())+' · FREE '+Math.ceil((s.safe-g.now)/1000)+'s',p.x,p.y-43,'#d7fff0');else if(!homeSafe(g,s))label((s.id===you?'YOU':s.name.toUpperCase())+(g.noises.some(n=>n.attached===s.id)?' · SCREAMING':''),p.x,p.y-43,color);if(s.rescueId){ctx.strokeStyle='#b6f2d4';ctx.lineWidth=4;ctx.beginPath();ctx.arc(p.x,p.y,26,-Math.PI/2,-Math.PI/2+Math.PI*2*Math.min(1,(g.now-s.rescueAt)/1200));ctx.stroke();}
 });
 if(me&&!background){const target=interaction(g,me);if(target.target){ctx.strokeStyle='#d5ffe8';ctx.lineWidth=2;ctx.setLineDash([4,4]);ctx.beginPath();ctx.arc(target.target.x,target.target.y,28,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);}}
 if(blackoutActive(g)){rect(cam.x,cam.y,cam.w,cam.h,'#03071388');for(const l of g.loot.filter(l=>!l.banked&&!l.sealed)){circle(l.x,l.y,10,'#f7d19166');}}
 if(g.alert>=60){rect(cam.x,cam.y,cam.w,cam.h,'#d7203012');}
 const recent=g.events.filter(e=>g.now-e.at>=0&&g.now-e.at<900&&(['capture','bank','rescue','throw','catch'].includes(e.kind)||e.text.startsWith('The art screams!')));
 for(const e of recent){const age=g.now-e.at,f=age/900,bank=e.kind==='bank',caught=e.kind==='catch'&&e.text.includes('caught!'),freed=e.kind==='rescue'&&!e.text.includes('passed');
  if(!reducedMotion)for(let i=0;i<12;i++){const a=i*Math.PI/6;circle(e.x+Math.cos(a)*f*65,e.y+Math.sin(a)*f*45,Math.max(.1,3*(1-f)),bank?'#ffe0a5':caught?'#ff6c7e':'#b5ffe1');}
  const amount=e.text.match(/^\$(\d+) secured/);const pop=amount?'＋$'+amount[1]:caught?'CAUGHT!':freed?'FREED!':e.text.startsWith('The art screams!')?'✦':'';
  // Text starts above the actor and vanishes at 400ms, never covering their body.
  if(pop&&age<400){ctx.save();ctx.globalAlpha=reducedMotion?1:1-age/500;text(pop,e.x,e.y-55-(reducedMotion?0:f*35),18,bank?'#ffe09d':caught?'#ff7c88':'#b7ffe2','center');ctx.restore();}
 }
 // Gradient edge adds atmosphere without obscuring game objects.
 const vignette=ctx.createRadialGradient(cam.x+cam.w/2,cam.y+cam.h/2,cam.h*.2,cam.x+cam.w/2,cam.y+cam.h/2,cam.w*.72);vignette.addColorStop(0,'#00000000');vignette.addColorStop(1,'#020a1644');ctx.fillStyle=vignette;ctx.fillRect(cam.x,cam.y,cam.w,cam.h);
 ctx.setTransform(1,0,0,1,0,0);return cam;
}
