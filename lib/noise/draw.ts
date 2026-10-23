
import {preloadSprites,sprite,paintedFloor,actorPose,artSpriteKey} from './sprites';
import {artwork,drawArtwork,stackLabel,type LabelBox} from './artwork';
import {guardSight,nearbyHide,hidden,hidingSpots,guardActive,staffDoors,blackoutActive,tuning,homeSafe,W,H,WALLS,EXIT,SAFE_ZONE,zones,zoneFor,vanFor,sensors,PLATE,plateOpen,interaction,distance,clear,type Game,type View,type Vec} from './engine';
export type Camera={x:number;y:number;scale:number;w:number;h:number};
export function camera(width:number,height:number,me?:Vec):Camera {const scale=width>=650?Math.min(width/W,height/H):Math.max(width/W,height/H);const w=width/scale,h=height/scale;if(width>=650)return {x:-(w-W)/2,y:-(h-H)/2,scale,w,h};return {x:Math.max(0,Math.min(W-w,(me?.x||W/2)-w/2)),y:Math.max(0,Math.min(H-h,(me?.y||H/2)-h/2)),scale,w,h};}
export const COLORS=['#8ef2d2','#bdadff','#ffb974','#91c6ff','#f79cbb','#c2e082'];
export function draw(ctx:CanvasRenderingContext2D,g:Game|View,width:number,height:number,time:number,you:string,positions:Map<string,Vec>,aim:Vec,background=false,reducedMotion=false){
 preloadSprites();
 const walls=g.walls||WALLS,plate=g.plate||PLATE,jackpot=g.loot.find(l=>l.value===1200);
 const me=g.seats.find(s=>s.id===you),display=positions.get(you)||me;const cam=camera(width,height,display);const t=reducedMotion?0:time/1000;
 ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);const ratio=ctx.canvas.width/width;ctx.scale(ratio,ratio);ctx.fillStyle='#0a101e';ctx.fillRect(0,0,width,height);ctx.scale(cam.scale,cam.scale);ctx.translate(-cam.x,-cam.y);
 const caught=g.events.find(e=>e.kind==='catch'&&e.text.includes('caught!')&&g.now-e.at>=0&&g.now-e.at<150);if(caught&&!reducedMotion){const a=(g.now-caught.at)/150;ctx.translate(Math.sin(a*55)*3*(1-a),Math.cos(a*43)*2*(1-a));}
 const rect=(x:number,y:number,w:number,h:number,c:string,r=0)=>{ctx.fillStyle=c;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();};
 const circle=(x:number,y:number,r:number,c:string)=>{ctx.fillStyle=c;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();};
 const text=(s:string,x:number,y:number,size=12,color='#d9e1df',align:CanvasTextAlign='left')=>{const px=Math.max(12/cam.scale,size);ctx.font=`${size>=16?'400':'700'} ${px}px ${size>=16?"'Bungee', Impact":"Arial"}, sans-serif`;ctx.textAlign=align;ctx.fillStyle=color;ctx.fillText(s,x,y);};
 const art=(id:string,value:number,x:number,y:number,scale=1,carried=false)=>{const spec=artwork(id,value);ctx.save();if(spec.kind==='gold'||spec.kind==='idol')ctx.filter='sepia(.85) saturate(1.5)';const ok=sprite(ctx,artSpriteKey(spec.kind),x,y,58*scale,68*scale,false,false,carried);ctx.restore();if(!ok)drawArtwork(ctx,id,value,x,y,scale);};
 // A fixed museum stage. All decoration is paint, never extra collision geometry.
 const floor=['#101f2a','#191e30','#102923'][g.layout];
 rect(18,18,924,564,'#050c17',12);rect(24,24,912,552,floor,3);
 ctx.save();ctx.beginPath();ctx.rect(24,24,912,552);ctx.clip();
 for(let y=24;y<576;y+=48)for(let x=24;x<936;x+=48){
  rect(x+1,y+1,46,46,((x+y)/48)%2?'#ffffff03':'#0000000a');
  ctx.strokeStyle='#adc5bf03';ctx.strokeRect(x+1,y+1,46,46);
  if(g.layout===1){ctx.strokeStyle='#cfae7a0c';ctx.beginPath();ctx.moveTo(x,y+12);ctx.lineTo(x+48,y+12);ctx.moveTo(x,y+36);ctx.lineTo(x+48,y+36);ctx.stroke();}
 }
 paintedFloor(ctx);
 // Low-contrast carpet is floor paint only, clipped around the exact collision walls.
 ctx.save();ctx.beginPath();ctx.rect(24,24,912,552);for(const w of walls)ctx.rect(w.x,w.y,w.w,w.h);ctx.clip('evenodd');ctx.globalAlpha=.55;rect(448,40,64,520,'#5e263c');rect(452,40,2,520,'#b48a53');rect(508,40,2,520,'#b48a53');if(g.layout===2){rect(40,270,880,60,'#5e263c');rect(40,274,880,2,'#b48a53');rect(40,324,880,2,'#b48a53');}ctx.restore();
 ctx.strokeStyle='#bbac7760';ctx.lineWidth=2;ctx.strokeRect(36,36,888,528);ctx.strokeStyle='#bbac7720';ctx.strokeRect(42,42,876,516);
 // Inlaid compass at the heart of the collection, beneath all game objects.
 ctx.save();ctx.translate(480,300);ctx.strokeStyle='#d2bc7b14';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,110,0,Math.PI*2);ctx.stroke();ctx.rotate(Math.PI/4);ctx.strokeRect(-77,-77,154,154);ctx.restore();
 for(const l of g.loot){if(l.banked)continue;const light=ctx.createRadialGradient(l.x,l.y,8,l.x,l.y,100);light.addColorStop(0,'#ffcf7738');light.addColorStop(1,'#ffe0a500');ctx.fillStyle=light;ctx.fillRect(l.x-100,l.y-100,200,200);}
 ctx.restore();
 // Plate gates the jackpot, but never traps a thief in a room.
 const open=plateOpen(g);if(!sprite(ctx,open?'plate-on':'plate-off',plate.x,plate.y,44,40)){rect(plate.x-22,plate.y-18,44,36,open?'#b6f2d4':'#4a3d58',6);}text(open?'OPEN':'HOLD',plate.x,plate.y+34,12,open?'#9af3cf':'#dac6f0','center');ctx.strokeStyle=open?'#b6f2d499':'#ab8bba55';ctx.setLineDash([5,6]);ctx.beginPath();ctx.moveTo(plate.x,plate.y);ctx.lineTo(jackpot?.x||835,jackpot?.y||120);ctx.stroke();ctx.setLineDash([]);
 // The lit loading bay retains the exact safe-zone geometry. Vans are outside the wall.
 for(const team of [...new Set(g.seats.map(s=>s.team))]){const v=vanFor(g,team),z=zoneFor(g,team),color=COLORS[team];rect(z.x,z.y,z.w,z.h,color+'35');ctx.strokeStyle=color;ctx.strokeRect(z.x,z.y,z.w,z.h);text('LOADING BAY',v.x,z.y-9,9,color,'center');}
 // Border ornament stays on solid outer-wall footprints, never across a route.
 for(const x of [80,300,650,880]){const light=ctx.createRadialGradient(x,32,2,x,32,85);light.addColorStop(0,'#ffd68130');light.addColorStop(1,'#ffd68100');ctx.fillStyle=light;ctx.fillRect(x-85,24,170,90);sprite(ctx,'sconce',x,28,18,32);}
 for(const x of [130,820]){sprite(ctx,'banner',x,20,18,32);sprite(ctx,'bench',x,580,60,18);}
 for(const x of [21,939])for(const y of [25,575])sprite(ctx,'plant',x,y,27,29);
 for(const x of [18,942])sprite(ctx,'art-bust',x,300,24,30);
 for(const door of staffDoors(g)){rect(door.x-22,door.y-13,44,26,'#253c50',3);ctx.strokeStyle='#d5b76a';ctx.strokeRect(door.x-22,door.y-13,44,26);text('STAFF',door.x,door.y+4,12,'#f7daa0','center');}
 const hideSpot=me?nearbyHide(g,me):undefined;for(const p of hidingSpots(g)){sprite(ctx,'plant',p.x,p.y-8,40,48);circle(p.x,p.y,23,'#8ef2d218');if(hideSpot&&distance(hideSpot,p)<1){ctx.save();ctx.strokeStyle='#bcffe9';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(p.x,p.y,27,0,Math.PI*2);ctx.stroke();ctx.restore();}}
 if(g.jobEvent?.flashUntil&&g.now<g.jobEvent.flashUntil){const e=g.jobEvent;ctx.save();ctx.setLineDash([6,6]);ctx.strokeStyle='#ffe29caa';ctx.lineWidth=2;
 if(e.kind==='shift'&&g.now-e.at<3000)for(const h of g.guards.filter(h=>guardActive(g,h))){ctx.beginPath();h.route.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();text('NEW ROUTES',h.route[0].x,h.route[0].y-15,12,'#ffe29c','center');}
 if(e.kind==='curator')for(const m of e.moves||[]){ctx.beginPath();ctx.moveTo(m.from.x,m.from.y);ctx.lineTo(m.to.x,m.to.y);ctx.stroke();text('MOVED',m.from.x,m.from.y,12,'#ffe29c','center');const f=reducedMotion?1:Math.min(1,(g.now-e.at)/800);circle(m.from.x+(m.to.x-m.from.x)*f,m.from.y+(m.to.y-m.from.y)*f,12,'#ffe29c88');}ctx.restore();}
 if(g.jobEvent?.kind==='vault'&&g.jobEvent.started&&!g.jobEvent.ended)for(const l of g.loot.filter(l=>l.eventPiece&&!l.banked)){ctx.save();ctx.shadowColor='#ffda76';ctx.shadowBlur=22;ctx.strokeStyle='#ffda76';ctx.lineWidth=4;ctx.strokeRect(l.x-32,l.y-40,64,68);ctx.restore();}
 // Guard cones use true facing; walls mask their vision in the simulation.
 for(const guard of g.guards.filter(h=>guardActive(g,h))){const p=({...guard,...(positions.get(guard.id)||guard)});ctx.save();ctx.translate(p.x,p.y);ctx.rotate(guard.angle);ctx.globalAlpha=(guard.retreatUntil||0)>g.now?.25:1;const vision=blackoutActive(g)?60:180*guardSight(g,guard);const grad=ctx.createRadialGradient(0,0,0,0,0,vision);grad.addColorStop(0,guard.mode==='chase'?'#ff62694a':'#c2e7ff4a');grad.addColorStop(1,'#d8efff00');ctx.fillStyle=grad;ctx.beginPath();ctx.moveTo(0,0);for(let a=-0.65;a<=0.651;a+=0.025){let reach=8;while(reach<vision&&clear({x:p.x+Math.cos(guard.angle+a)*reach,y:p.y+Math.sin(guard.angle+a)*reach},0,[...walls,...zones(g)]))reach+=6;ctx.lineTo(Math.cos(a)*reach,Math.sin(a)*reach);}ctx.closePath();ctx.fill();ctx.restore();}
 // Extrusion is lifted upward from the original wall footprint; collision stays exact.
 for(const w of walls){
  ctx.save();ctx.shadowColor='#000b';ctx.shadowBlur=10;ctx.shadowOffsetY=7;rect(w.x,w.y,w.w,w.h,'#040c16',2);ctx.restore();
  rect(w.x,w.y-11,w.w,w.h+11,'#182b3b',2);
  rect(w.x,w.y+w.h-11,w.w,11,'#263c4b',1);
  rect(w.x,w.y-11,w.w,w.h,'#788a94',2);
  rect(w.x+2,w.y-9,Math.max(1,w.w-4),Math.max(1,w.h-4),'#596e7c',1);
  rect(w.x,w.y-11,w.w,2,'#b8ccce');
  if(w.w>40)rect(w.x+7,w.y+w.h-9,w.w-14,2,'#ac956744');
  sprite(ctx,w.w>=w.h?'wall-h':'wall-v',w.x+w.w/2,w.y+w.h/2-5.5,w.w,w.h+11,false,true);
  if(g.layout===1&&w.w>50&&w.h>=16)for(let bx=w.x+8;bx<w.x+w.w-8;bx+=8)rect(bx,w.y-6,5,Math.min(14,w.h-8),['#a8806a','#baaa7d','#57938c'][Math.floor(bx/8)%3],1);
  else if(w.w>45&&w.h>18&&w.w<200){rect(w.x+6,w.y-5,w.w-12,w.h-12,'#94c5c44a',2);ctx.strokeStyle='#daeee788';ctx.strokeRect(w.x+6,w.y-5,w.w-12,w.h-12);}
 }
 // Paint dock openings after the wall tops, without changing collision or zone coordinates.
 for(const team of [...new Set(g.seats.map(s=>s.team))]){const v=vanFor(g,team),top=v.y<300,color=COLORS[team],edge=top?24:576;rect(v.x-34,edge-13,68,28,'#101b28');ctx.strokeStyle=color;ctx.lineWidth=3;ctx.strokeRect(v.x-34,edge-13,68,28);const glow=ctx.createRadialGradient(v.x,edge,5,v.x,v.y,85);glow.addColorStop(0,color+'66');glow.addColorStop(1,color+'00');ctx.fillStyle=glow;ctx.fillRect(v.x-50,Math.min(v.y,edge)-40,100,140);sprite(ctx,team===0?'van-mint':'van-violet',v.x,top?12:588,54,66);}
 const lootLabels:{l:typeof g.loot[number];name:string;glow:string}[]=[];
 for(const l of g.loot){if(l.banked||l.holder||l.guardCarrier)continue;if(l.sealed)continue;const spec=artwork(l.id,l.value);const glow=ctx.createRadialGradient(l.x,l.y,4,l.x,l.y,50);glow.addColorStop(0,(l.locked&&open?'#ffd579':spec.glow)+'38');glow.addColorStop(1,spec.glow+'00');ctx.fillStyle=glow;ctx.fillRect(l.x-50,l.y-50,100,100);
 if(l.locked){sprite(ctx,open?'case-open':'case-locked',l.x,l.y-19,66,80);art(l.id,l.value,l.x,l.y-17,.72);if(!open){ctx.save();ctx.strokeStyle='#ff6169';ctx.shadowColor='#ff4656';ctx.shadowBlur=5;ctx.lineWidth=1.2;for(const dy of [-40,-25,-10]){ctx.beginPath();ctx.moveTo(l.x-22,l.y+dy);ctx.lineTo(l.x+22,l.y+dy);ctx.stroke();}ctx.restore();}else if(!reducedMotion){for(let i=0;i<3;i++){const a=t+i*2.1;circle(l.x+Math.cos(a)*28,l.y-25+Math.sin(a)*22,1.5,'#ffe9af');}}}
 else art(l.id,l.value,l.x,l.y-20+Math.sin(t*2+l.value)*.6,1);
 lootLabels.push({l,name:spec.name,glow:spec.glow});}
 for(const sensor of sensors(g)){const vertical=sensor.h>sensor.w,a={x:sensor.x+(vertical?sensor.w/2:0),y:sensor.y+(vertical?0:sensor.h/2)},b={x:a.x+(vertical?0:sensor.w),y:a.y+(vertical?sensor.h:0)},trip=sensor.cooldown-g.now>5500,sneak=g.seats.some(p=>p.sneak&&p.x>sensor.x-18&&p.x<sensor.x+sensor.w+18&&p.y>sensor.y-18&&p.y<sensor.y+sensor.h+18);ctx.save();ctx.globalAlpha=sneak&&!reducedMotion?.35+Math.abs(Math.sin(t*20))*.45:1;ctx.strokeStyle=trip?'#fff1df':'#ff4a65';ctx.shadowColor='#ff284b';ctx.shadowBlur=trip?18:8;ctx.lineWidth=trip?4:2;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();for(const p of [a,b]){rect(p.x-4,p.y-4,8,8,'#6c253b',2);circle(p.x,p.y,2,'#ffb3b7');}ctx.restore();}
 for(const n of g.noises){if(n.holder)continue;const age=reducedMotion?0:(g.now-n.born)/1000;const r=25+(age*40%65);ctx.strokeStyle='#ff887a'+(n.flight>0?'bb':'70');ctx.lineWidth=2;ctx.beginPath();ctx.arc(n.x,n.y,r,0,Math.PI*2);ctx.stroke();if(n.flight<=0){ctx.strokeStyle='#ff887a35';ctx.beginPath();ctx.arc(n.x,n.y,r+20,0,Math.PI*2);ctx.stroke();}if(n.attached)continue;rect(n.x-10,n.y-13,20,28,'#ff9983',8);rect(n.x-7,n.y-17,14,6,'#e8ce95',2);rect(n.x-6,n.y-8,3,13,'#ffe2ba',2);text('♪',n.x+2,n.y+7,16,'#593048','center');}
 if(me&&!me.escaped&&g.phase==='playing'){const p=display!;ctx.strokeStyle='#8ef2d21c';ctx.lineWidth=1;ctx.setLineDash([3,8]);ctx.beginPath();ctx.arc(p.x,p.y,110,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);if(me.hand){const d=distance(p,aim)||1,capsule=g.noises.some(n=>n.id===me.hand);let reach=Math.min(d,capsule?258:60);for(let i=6;i<=reach;i+=6)if(!clear({x:p.x+(aim.x-p.x)/d*i,y:p.y+(aim.y-p.y)/d*i},6,walls)){reach=i-6;break;}const end={x:p.x+(aim.x-p.x)/d*reach,y:p.y+(aim.y-p.y)/d*reach};ctx.strokeStyle='#b4fff0a0';ctx.setLineDash([5,5]);ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.quadraticCurveTo((p.x+end.x)/2,(p.y+end.y)/2-20,end.x,end.y);ctx.stroke();if(capsule){ctx.strokeStyle='#ffb38b70';ctx.beginPath();ctx.arc(end.x,end.y,220,0,Math.PI*2);ctx.stroke();text('HEARING RANGE',end.x,end.y-226,12,'#ffcfad','center');}ctx.setLineDash([]);}}
 for(const guard of g.guards.filter(h=>guardActive(g,h))){const p=({...guard,...(positions.get(guard.id)||guard)});ctx.save();ctx.translate(p.x,p.y);ctx.scale(1.2,1.2);ctx.translate(-p.x,-p.y);ctx.globalAlpha=(guard.retreatUntil||0)>g.now?.35:1;
 const gp=actorPose(Math.cos(guard.angle),Math.sin(guard.angle));ctx.save();ctx.filter='brightness(1.18) drop-shadow(2px 0px 0px #b5e9ff) drop-shadow(-2px 0px 0px #b5e9ff) drop-shadow(0px 2px 0px #b5e9ff) drop-shadow(0px -2px 0px #b5e9ff)';const guardPaint=sprite(ctx,'guard-'+gp.pose,p.x,p.y-7,40,49,gp.flip);ctx.restore();ctx.save();ctx.shadowColor='#9ce3ff';ctx.shadowBlur=12;circle(p.x,p.y-22,3.2,'#e5f9ff');circle(p.x+3,p.y-3,2.5,'#d4f4ff');circle(p.x+Math.cos(guard.angle)*17,p.y+Math.sin(guard.angle)*17,3,'#d4f4ff');ctx.restore();if(!guardPaint){circle(p.x+3,p.y+9,15,'#00000055');rect(p.x-11,p.y-3,22,19,'#26334b',6);rect(p.x-4,p.y+2,8,12,'#495a74',2);
 circle(p.x,p.y-5,10,'#d6a982');rect(p.x-12,p.y-15,24,8,guard.mode==='chase'?'#af4e60':'#697f9a',3);rect(p.x-14,p.y-9,28,4,'#172334',2);circle(p.x,p.y-12,2,'#efd286');
 circle(p.x-4,p.y-4,1.5,'#202333');circle(p.x+4,p.y-4,1.5,'#202333');
 ctx.save();ctx.translate(p.x,p.y);ctx.rotate(guard.angle);rect(10,-3,11,6,'#899ba9',2);rect(18,-3,4,6,'#ffe6a5',1);ctx.restore();
 }
 text(guard.mode==='chase'?'!':guard.mode==='investigate'?'?':guard.sentry?'POST':guard.returnArt?'RETURN':'',p.x,p.y-30,guard.sentry||guard.returnArt?12:20,'#ffb09b','center');ctx.restore();const carried=g.loot.find(l=>l.guardCarrier===guard.id);if(carried)art(carried.id,carried.value,p.x,p.y-48,.65,true);}
 const labels:LabelBox[]=[];const pendingLabels:{value:string;x:number;y:number;color:string}[]=[];const label=(value:string,x:number,y:number,color:string)=>{if(jackpot&&!jackpot.banked&&!jackpot.holder&&Math.abs(x-jackpot.x)<90&&Math.abs(y-jackpot.y)<100)y=Math.min(y,jackpot.y-73);pendingLabels.push({value,x,y,color});};
 [...g.seats].sort((a,b)=>Number(a.id===you)-Number(b.id===you)).forEach(s=>{const i=g.seats.indexOf(s);if(s.escaped)return;const p=positions.get(s.id)||s;ctx.save();ctx.globalAlpha=hidden(g,s)?.35:s.stun>g.now?.8:1;circle(p.x+2,p.y+9,14,'#00000060');const color=s.stun>g.now?'#899fae':COLORS[s.team];if(s.safe>g.now){ctx.strokeStyle='#d7fff0';ctx.lineWidth=3;ctx.beginPath();ctx.arc(p.x,p.y,28,0,Math.PI*2);ctx.stroke();}ctx.save();ctx.translate(p.x,p.y);ctx.scale(1.2,1.2);
 const grab=g.events.find(e=>e.text.startsWith('The art screams!')&&g.now-e.at<350&&distance(e,s)<25);const bounce=grab&&!reducedMotion?Math.sin((g.now-grab.at)/350*Math.PI):0;ctx.scale(1+bounce*.12,1-bounce*.12);ctx.translate(0,-bounce*5);
 // Face-forward silhouettes stay legible while the feet indicate movement.
 const facing=Math.atan2(s.aim.y-s.y,s.aim.x-s.x);const bob=Math.sin(t*10+i)*1.1;
 const ap=actorPose(s.dx||s.aim.x-s.x,s.dy||s.aim.y-s.y,!!g.loot.find(l=>l.id===s.hand));ctx.save();ctx.filter=(s.stun>g.now?'brightness(.85) ':'')+'drop-shadow(2px 0px 0px #e0f2ed) drop-shadow(-2px 0px 0px #e0f2ed) drop-shadow(0px 2px 0px #e0f2ed) drop-shadow(0px -2px 0px #e0f2ed)';const painted=sprite(ctx,(s.team===0?'mint':'violet')+'-'+ap.pose,0,-8,40,49,ap.flip);ctx.restore();if(!painted){rect(-9,7,7,10,'#0c1827',3);rect(3,7,7,10,'#0c1827',3);
 rect(-12,-2,24,17,color,7);rect(-5,0,10,14,'#152c3c',3);rect(-15,0,5,10,color,3);rect(10,0,5,10,color,3);
 rect(-18,-1,13,17,'#b49167',5);rect(-18,2,13,3,'#e2bd84',1);circle(0,-8+bob,12,color);circle(1,-6+bob,9,s.stun>g.now?'#a7b8c2':'#edc49b');
 rect(-9,-11+bob,19,8,'#142032',4);circle(-4+Math.cos(facing),-7+bob,2,'#fff6dc');circle(5+Math.cos(facing),-7+bob,2,'#fff6dc');
 ctx.strokeStyle='#8f5445';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(2,-1+bob,3,0,Math.PI*.8);ctx.stroke();
 rect(-11,-20+bob,22,7,color,3);rect(-8,2,19,4,color,2);rect(7,4,5,11,color,2);rect(-5,-23+bob,14,5,color,3);}
 ctx.restore();ctx.restore();if(s.id===you){ctx.strokeStyle='#ffffff';ctx.lineWidth=3;ctx.beginPath();ctx.roundRect(p.x-23,p.y-32,46,56,17);ctx.stroke();circle(p.x,p.y+29,3,'#ffffff');}
  if(s.hand){const noise=g.noises.some(n=>n.id===s.hand);if(noise){circle(p.x+15,p.y-12,9,'#ff8c82');text('♪',p.x+15,p.y-9,11,'#562b32','center');}else art(s.hand,g.loot.find(l=>l.id===s.hand)?.value||200,p.x,p.y-54,.65,true);if(noise){const n=g.noises.find(n=>n.id===s.hand)!;text(Math.ceil((n.expires-g.now)/1000)+'s',p.x+26,p.y-20,10,'#ffc2ae');}}
  if(s.stun>g.now){ctx.strokeStyle='#ff8f8f';ctx.lineWidth=3;ctx.beginPath();ctx.arc(p.x,p.y,23,-Math.PI/2,-Math.PI/2+Math.PI*2*Math.min(1,(s.stun-g.now)/6000));ctx.stroke();ctx.strokeStyle='#ffe1ae';ctx.lineWidth=2;for(const x of [-6,6]){ctx.beginPath();ctx.arc(p.x+x,p.y-3,5,0,Math.PI*2);ctx.stroke();}ctx.beginPath();ctx.moveTo(p.x-1,p.y-3);ctx.lineTo(p.x+1,p.y-3);ctx.stroke();label((s.id===you?'YOU':s.name.toUpperCase())+' · CUFFED '+Math.ceil((s.stun-g.now)/1000)+'s',p.x,p.y-(g.loot.some(l=>l.id===s.hand)?88:43),'#bfd9ed');}else if(s.safe>g.now)label((s.id===you?'YOU':s.name.toUpperCase())+' · FREE '+Math.ceil((s.safe-g.now)/1000)+'s',p.x,p.y-(g.loot.some(l=>l.id===s.hand)?88:43),'#d7fff0');else label((s.id===you?'YOU':s.name.toUpperCase())+(hidden(g,s)?' · ◉ HIDDEN':'')+(g.noises.some(n=>n.attached===s.id)?' · SCREAMING':''),p.x,p.y-(g.loot.some(l=>l.id===s.hand)?88:43),color);if(s.rescueId){ctx.strokeStyle='#b6f2d4';ctx.lineWidth=4;ctx.beginPath();ctx.arc(p.x,p.y,26,-Math.PI/2,-Math.PI/2+Math.PI*2*Math.min(1,(g.now-s.rescueAt)/1200));ctx.stroke();}
 });
 for(const item of lootLabels){const {l,name,glow}=item;if(g.seats.some(s=>!s.escaped&&distance(s,l)<30))continue;const h=12/cam.scale;const near=g.seats.some(s=>!s.escaped&&distance(s,l)<90);const value='$'+l.value;const nameShown=near&&!g.seats.some(s=>!s.escaped&&distance(s,l)<40);const lines=nameShown?2:1;const width=Math.max(value.length*h*.65+12,nameShown?name.length*h*.55+10:0);const box=stackLabel(l.x,l.y+28,width,h*lines+8,labels);rect(box.x-width/2,box.y-h,width,h*lines+8,'#081324eb',4);text(value,box.x,box.y,12,glow,'center');if(nameShown)text(name,box.x,box.y+h+2,12,'#eee6cf','center');}
 for(const l of pendingLabels){const h=12/cam.scale;ctx.font=`700 ${h}px Arial`;const w=ctx.measureText(l.value).width+12;const box=stackLabel(Math.max(cam.x+w/2+4,Math.min(cam.x+cam.w-w/2-4,l.x)),Math.max(cam.y+h+5,l.y),w,h,labels);rect(box.x-w/2,box.y-h,w,h+7,'#071321e8',4);text(l.value,box.x,box.y,12,l.color,'center');}
 if(me&&!background){const target=interaction(g,me);if(target.target){ctx.strokeStyle='#d5ffe8';ctx.lineWidth=2;ctx.setLineDash([4,4]);ctx.beginPath();ctx.arc(target.target.x,target.target.y,28,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);}}
 if(blackoutActive(g)){rect(cam.x,cam.y,cam.w,cam.h,'#03071388');for(const l of g.loot.filter(l=>!l.banked&&!l.sealed)){circle(l.x,l.y,10,'#f7d19166');}}
 if(g.alert>=60){rect(cam.x,cam.y,cam.w,cam.h,'#d7203012');}
 const recent=g.events.filter(e=>g.now-e.at>=0&&g.now-e.at<900&&(['capture','bank','rescue','throw','catch'].includes(e.kind)||e.text.startsWith('The art screams!')||e.text.startsWith('DISTRACTED ')));
 for(const e of recent){const age=g.now-e.at,f=age/900,bank=e.kind==='bank',caught=e.kind==='catch'&&e.text.includes('caught!'),freed=e.kind==='rescue'&&!e.text.includes('passed');
  if(!reducedMotion)for(let i=0;i<12;i++){const a=i*Math.PI/6;circle(e.x+Math.cos(a)*f*65,e.y+Math.sin(a)*f*45,Math.max(.1,3*(1-f)),bank?'#ffe0a5':caught?'#ff6c7e':'#b5ffe1');}
  const amount=e.text.match(/^\$(\d+) secured/);const pop=e.text.startsWith('DISTRACTED ')?e.text:amount?'＋$'+amount[1]:caught?'CUFFED!':freed?'FREED!':e.text.startsWith('The art screams!')?'✦':'';
  // Text starts above the actor and vanishes at 400ms, never covering their body.
  if(pop&&age<400){ctx.save();ctx.globalAlpha=reducedMotion?1:1-age/500;text(pop,e.x,Math.min(e.y-65,...labels.filter(l=>Math.abs(l.x-e.x)<100).map(l=>l.y-28))-(reducedMotion?0:f*35),18,bank?'#ffe09d':caught?'#ff7c88':'#b7ffe2','center');ctx.restore();}
 }
 // Gradient edge adds atmosphere without obscuring game objects.
 const vignette=ctx.createRadialGradient(cam.x+cam.w/2,cam.y+cam.h/2,cam.h*.2,cam.x+cam.w/2,cam.y+cam.h/2,cam.w*.72);vignette.addColorStop(0,'#00000000');vignette.addColorStop(1,'#020a1644');ctx.fillStyle=vignette;ctx.fillRect(cam.x,cam.y,cam.w,cam.h);
 ctx.setTransform(1,0,0,1,0,0);return cam;
}
