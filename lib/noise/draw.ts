import {crewActorState,floorExhibits,prepareVision} from './visibility';
import {departingVan} from './getaway';
import {museumIdentity} from './museum-identity';
import {drawMuseumDecor} from './museum-decor';
import {recentLure} from './clarity';
import {practiceTarget} from './practice';
import {roomLabels} from './world-labels';
import {drawRope} from './rope';

import {preloadSprites,sprite,paintedFloor,actorPose,artSpriteKey} from './sprites';
import {artwork,drawArtwork,stackLabel,stackPopLabel,type LabelBox} from './artwork';
import {exhibitAvailable,isFlagship,vaultReady,emitterPosition,passTarget,isDuel,emptyPost,arenaDefinition,vanFacing,guardSight,nearbyHide,hidden,hidingSpots,guardActive,staffDoors,blackoutActive,tuning,homeSafe,W,H,WALLS,EXIT,SAFE_ZONE,zones,zoneFor,vanFor,sensors,PLATE,plateOpen,interaction,distance,clear,type Game,type View,type Vec} from './engine';
export {type Camera} from './camera';
import {museumCamera} from './camera';
export const camera=museumCamera;
export const COLORS=['#8ef2d2','#bdadff','#ffb974','#91c6ff','#f79cbb','#c2e082'];
export function draw(ctx:CanvasRenderingContext2D,g:Game|View,width:number,height:number,time:number,you:string,positions:Map<string,Vec>,aim:Vec,background=false,reducedMotion=false,overview=true,departureMs?:number,lights:'full'|'shadows'='full'){
 preloadSprites();
 const original=g;const vision=background?null:prepareVision(ctx,g,you,positions,lights);if(vision)g=vision.scene;
 const walls=g.walls||WALLS,plate=g.plate||PLATE,jackpot=g.loot.find(l=>l.value===1200);
 const me=g.seats.find(s=>s.id===you),display=positions.get(you)||me;const cam=camera(width,height,display,overview);const t=reducedMotion?0:time/1000;
 ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);const ratio=ctx.canvas.width/width;ctx.scale(ratio,ratio);ctx.fillStyle='#0a101e';ctx.fillRect(0,0,width,height);ctx.scale(cam.scale,cam.scale);ctx.translate(-cam.x,-cam.y);
 const caught=g.events.find(e=>e.kind==='catch'&&e.text.includes('caught!')&&g.now-e.at>=0&&g.now-e.at<150);if(caught&&!reducedMotion){const a=(g.now-caught.at)/150;ctx.translate(Math.sin(a*55)*3*(1-a),Math.cos(a*43)*2*(1-a));}
 const rect=(x:number,y:number,w:number,h:number,c:string,r=0)=>{ctx.fillStyle=c;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();};
 const circle=(x:number,y:number,r:number,c:string)=>{ctx.fillStyle=c;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();};
 const text=(s:string,x:number,y:number,size=12,color='#d9e1df',align:CanvasTextAlign='left')=>{const px=Math.max(12/cam.scale,size);ctx.font=`${size>=16?'400':'700'} ${px}px ${size>=16?"'Bungee', Impact":"Arial"}, sans-serif`;ctx.textAlign=align;ctx.fillStyle=color;ctx.fillText(s,x,y);};
 const art=(id:string,value:number,x:number,y:number,scale=1,carried=false)=>{const spec=artwork(id,value,g.layout);ctx.save();if(spec.kind==='gold'||spec.kind==='idol')ctx.filter='sepia(.85) saturate(1.5)';const ok=sprite(ctx,artSpriteKey(spec.kind),x,y,58*scale,68*scale,false,false,carried);ctx.restore();if(!ok)drawArtwork(ctx,id,value,x,y,scale,g.layout);};
 // A fixed museum stage. All decoration is paint, never extra collision geometry.
 const identity=museumIdentity(g.layout),floor=identity.floor;
 rect(18,18,924,564,'#050c17',12);rect(24,24,912,552,floor,3);
 ctx.save();ctx.beginPath();ctx.rect(24,24,912,552);ctx.clip();
 for(let y=24;y<576;y+=48)for(let x=24;x<936;x+=48){
  rect(x+1,y+1,46,46,(Math.floor((x-24)/48)+Math.floor((y-24)/48))%2?'#ffffff08':'#030b1644');
  ctx.strokeStyle='#b7c9c918';ctx.strokeRect(x+1,y+1,46,46);
  if(g.layout===1){ctx.strokeStyle='#cfae7a0c';ctx.beginPath();ctx.moveTo(x,y+12);ctx.lineTo(x+48,y+12);ctx.moveTo(x,y+36);ctx.lineTo(x+48,y+36);ctx.stroke();}
 }
 paintedFloor(ctx);rect(24,24,912,552,identity.wash);
 if(g.layout===2){ctx.strokeStyle='#d8bd782b';ctx.lineWidth=.8;for(const r of [75,140,210]){ctx.beginPath();ctx.ellipse(480,300,r,r*.65,0,0,Math.PI*2);ctx.stroke();}for(let i=0;i<32;i++){const x=65+(i*173)%820,y=70+(i*97)%460;circle(x,y,i%4===0?1.8:1,'#dceaff66');if(i%4===0){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+24,y-15);ctx.stroke();}}}
 if(g.layout===1){ctx.strokeStyle='#b58f4e18';for(let y=32;y<576;y+=18){ctx.beginPath();ctx.moveTo(24,y);ctx.lineTo(936,y);ctx.stroke();}}
 // Warm pools from the exhibition lights contrast with the moonlit service loop.
 for(const x of [145,480,815]){const light=ctx.createRadialGradient(x,65,4,x,65,210);light.addColorStop(0,identity.light);light.addColorStop(.4,'#d5ac7111');light.addColorStop(1,'#dfb27300');ctx.fillStyle=light;ctx.fillRect(x-210,24,420,250);}

 // Low-contrast carpet is floor paint only, clipped around the exact collision walls.
 ctx.save();ctx.beginPath();ctx.rect(24,24,912,552);for(const w of walls)ctx.rect(w.x,w.y,w.w,w.h);ctx.clip('evenodd');ctx.globalAlpha=.55;rect(448,40,64,520,'#5e263c');rect(452,40,2,520,'#b48a53');rect(508,40,2,520,'#b48a53');if(g.layout===2){rect(40,270,880,60,'#5e263c');rect(40,274,880,2,'#b48a53');rect(40,324,880,2,'#b48a53');}ctx.restore();
 if(g.layout===2){circle(480,300,96,'#172f45');ctx.strokeStyle='#b99c5a88';ctx.lineWidth=2;for(const r of [86,94]){ctx.beginPath();ctx.arc(480,300,r,0,Math.PI*2);ctx.stroke();}for(let i=0;i<24;i++){const a=i*Math.PI/12;ctx.beginPath();ctx.moveTo(480+Math.cos(a)*86,300+Math.sin(a)*86);ctx.lineTo(480+Math.cos(a)*94,300+Math.sin(a)*94);ctx.stroke();}}
 if(g.layout===0)for(const d of g.arena?.decor||[]){rect(d.x-3,d.y-3,d.w+6,d.h+6,floor,8);}
 ctx.strokeStyle='#bbac7760';ctx.lineWidth=2;ctx.strokeRect(36,36,888,528);ctx.strokeStyle='#bbac7720';ctx.strokeRect(42,42,876,516);
 for(const room of (g.training||width<700&&overview?[]:roomLabels(original,Math.max(10,10/cam.scale)))){if(g.seats.some(s=>distance(positions.get(s.id)||s,room)<60)||staffDoors(g).some(d=>distance(d,room)<65)||g.guards.some(h=>h.sentry&&distance(h,room)<65))continue;ctx.save();ctx.globalAlpha=.22;text(room.name,room.x,room.y,12,'#dac9a0','center');ctx.restore();}
 // Inlaid compass at the heart of the collection, beneath all game objects.
 ctx.save();ctx.translate(480,300);ctx.strokeStyle='#d2bc7b14';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,110,0,Math.PI*2);ctx.stroke();ctx.rotate(Math.PI/4);ctx.strokeRect(-77,-77,154,154);ctx.restore();
 for(const l of floorExhibits(g)){if(l.stashedAt!==undefined)continue;const light=ctx.createRadialGradient(l.x,l.y,8,l.x,l.y,100);light.addColorStop(0,'#ffcf7738');light.addColorStop(1,'#ffe0a500');ctx.fillStyle=light;ctx.fillRect(l.x-100,l.y-100,200,200);}
 ctx.restore();
 // Plate gates the jackpot, but never traps a thief in a room.
 const open=plateOpen(g)||(isDuel(g)&&!!jackpot&&!jackpot.locked);if(!sprite(ctx,open?'plate-on':'plate-off',plate.x,plate.y,44,40)){rect(plate.x-22,plate.y-18,44,36,open?'#b6f2d4':'#4a3d58',6);}text(!vaultReady(g)?'1:00 LOCK':open?'OPEN':isDuel(g)?'UNLOCK':'HOLD',plate.x,plate.y+34,12,open?'#9af3cf':'#dac6f0','center');if(!isFlagship(g)){ctx.strokeStyle=open?'#b6f2d499':'#ab8bba55';ctx.setLineDash([5,6]);ctx.beginPath();ctx.moveTo(plate.x,plate.y);ctx.lineTo(jackpot?.x||835,jackpot?.y||120);ctx.stroke();ctx.setLineDash([]);}
 // The lit loading bay retains the exact safe-zone geometry. Vans are outside the wall.
 for(const team of [...new Set(g.seats.map(s=>s.team))]){const v=vanFor(g,team),z=zoneFor(g,team),color=COLORS[team];rect(z.x,z.y,z.w,z.h,color+'35');ctx.strokeStyle=color;ctx.strokeRect(z.x,z.y,z.w,z.h);const top=v.y<300,side=v.x<480?1:-1;const dockNameX=isFlagship(g)?v.x:v.x+side*78,dockNameY=top?z.y+5:z.y+z.h-3;text(team===0?'MINT DOCK':'VIOLET DOCK',dockNameX,dockNameY,8,color+'aa','center');if(me?.team===team&&g.phase==='playing'&&homeSafe(g,me)&&!me.escaped){const promptX=v.x+side*120;const promptY=[v.y,v.y-35,v.y+35,v.y-70,v.y+70].find(y=>y>70&&y<530&&g.seats.every(s=>{const p=positions.get(s.id)||s;return Math.abs(p.x-promptX)>70||Math.abs(p.y-y)>55;})&&floorExhibits(g).every(l=>Math.abs(l.x-promptX)>85||Math.abs(l.y-y)>55))??v.y;text(width<800?'Banks here · Tap Board':'Banks here · R boards',promptX,promptY+2,10,'#ffe1a1','center');}}
 // Border ornament stays on solid outer-wall footprints, never across a route.
 for(const x of [80,300,650,880]){const light=ctx.createRadialGradient(x,32,2,x,32,85);light.addColorStop(0,'#ffd68130');light.addColorStop(1,'#ffd68100');ctx.fillStyle=light;ctx.fillRect(x-85,24,170,90);sprite(ctx,'sconce',x,28,18,32);}
 for(const x of [130,820]){sprite(ctx,'banner',x,20,18,32);sprite(ctx,'bench',x,580,60,18);}
 for(const x of [21,939])for(const y of [25,575])sprite(ctx,'plant',x,y,27,29);
 for(const x of [18,942])sprite(ctx,'art-bust',x,300,24,30);
 for(const door of staffDoors(g)){rect(door.x-22,door.y-13,44,26,'#253c50',3);ctx.strokeStyle='#d5b76a';ctx.strokeRect(door.x-22,door.y-13,44,26);text('STAFF',door.x,door.y+4,12,'#f7daa0','center');}
 const staffExit=g.arena?.crownExit;if(staffExit){const x=staffExit.x+staffExit.w/2,y=staffExit.y+staffExit.h/2;ctx.save();ctx.strokeStyle=g.crownExitOpen?'#8ef2d2':'#e8c36e';ctx.lineWidth=3;ctx.setLineDash(g.crownExitOpen?[7,5]:[]);ctx.strokeRect(staffExit.x,staffExit.y,staffExit.w,staffExit.h);text(g.crownExitOpen?'← EXIT':'CROWN EXIT',g.arena?.id==='flagship-velmont'?staffExit.x+staffExit.w+14:x-14,y,10,g.crownExitOpen?'#8ef2d2':'#e8c36e',g.arena?.id==='flagship-velmont'?'left':'right');ctx.restore();}
 const hideSpot=me?nearbyHide(g,me):undefined;for(const [i,p] of hidingSpots(g).entries()){const niche=arenaDefinition(g)?.niches?.[i];rect(p.x-23,p.y-25,46,46,'#050d19',5);if(niche?.kind==='curtain'){rect(p.x-23,p.y-30,46,4,'#d5ba79');for(let n=0;n<5;n++)rect(p.x-22+n*9,p.y-26,8,39,n%2?'#543345':'#815265',3);}else if(niche?.kind!=='recess'){rect(p.x-22,p.y+8,44,13,'#647b80',3);sprite(ctx,'plant',p.x,p.y-8,36,42);}circle(p.x,p.y,23,'#8ef2d218');if(hideSpot&&distance(hideSpot,p)<1){ctx.save();ctx.strokeStyle='#bcffe9';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(p.x,p.y,27,0,Math.PI*2);ctx.stroke();ctx.restore();}}
 if(g.jobEvent?.flashUntil&&g.now<g.jobEvent.flashUntil){const e=g.jobEvent;ctx.save();ctx.setLineDash([6,6]);ctx.strokeStyle='#ffe29caa';ctx.lineWidth=2;
 if(e.kind==='shift'&&g.now-e.at<3000)for(const h of g.guards.filter(h=>guardActive(g,h))){ctx.beginPath();h.route.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();text('NEW ROUTES',h.route[0].x,h.route[0].y-15,12,'#ffe29c','center');}
 if(e.kind==='curator')for(const m of e.moves||[]){ctx.beginPath();ctx.moveTo(m.from.x,m.from.y);ctx.lineTo(m.to.x,m.to.y);ctx.stroke();text('MOVED',m.from.x,m.from.y,12,'#ffe29c','center');const f=reducedMotion?1:Math.min(1,(g.now-e.at)/800);circle(m.from.x+(m.to.x-m.from.x)*f,m.from.y+(m.to.y-m.from.y)*f,12,'#ffe29c88');}ctx.restore();}
 if(g.jobEvent?.kind==='vault'&&g.jobEvent.started&&!g.jobEvent.ended)for(const l of g.loot.filter(l=>l.eventPiece&&!l.banked)){ctx.save();ctx.shadowColor='#ffda76';ctx.shadowBlur=22;ctx.strokeStyle='#ffda76';ctx.lineWidth=4;ctx.strokeRect(l.x-32,l.y-40,64,68);ctx.restore();}
 const lessonTarget=practiceTarget(g);if(g.training&&lessonTarget){ctx.save();ctx.strokeStyle='#ffe19a';ctx.lineWidth=3;ctx.setLineDash([7,5]);ctx.beginPath();ctx.arc(lessonTarget.x,lessonTarget.y,34+(reducedMotion?0:Math.sin(t*4)*3),0,Math.PI*2);ctx.stroke();ctx.restore();}
 // Guard cones use true facing; walls mask their vision in the simulation.
 for(const guard of original.guards.filter(h=>guardActive(g,h)&&(!vision||vision.visible(positions.get(h.id)||h)))){const lure=recentLure(g,guard.id);if(lure){ctx.save();ctx.strokeStyle='#8ef2d299';ctx.lineWidth=2;ctx.setLineDash([5,5]);ctx.beginPath();ctx.moveTo(guard.x,guard.y);ctx.lineTo(lure.x,lure.y);ctx.stroke();ctx.setLineDash([]);ctx.beginPath();ctx.arc(guard.x,guard.y,27,0,Math.PI*2);ctx.stroke();ctx.restore();}const p=({...guard,...(positions.get(guard.id)||guard)});ctx.save();ctx.translate(p.x,p.y);ctx.rotate(guard.angle);ctx.globalAlpha=(guard.retreatUntil||0)>g.now?.25:1;const vision=blackoutActive(g)?60:180*guardSight(g,guard);const grad=ctx.createRadialGradient(0,0,0,0,0,vision);grad.addColorStop(0,guard.mode==='chase'?'#ff62694a':'#c2e7ff4a');grad.addColorStop(1,'#d8efff00');ctx.fillStyle=grad;ctx.beginPath();ctx.moveTo(0,0);for(let a=-0.65;a<=0.651;a+=0.025){let reach=8;while(reach<vision&&clear({x:p.x+Math.cos(guard.angle+a)*reach,y:p.y+Math.sin(guard.angle+a)*reach},0,[...walls,...zones(g)]))reach+=6;ctx.lineTo(Math.cos(a)*reach,Math.sin(a)*reach);}ctx.closePath();ctx.fill();ctx.restore();}
 // Extrusion is lifted upward from the original wall footprint; collision stays exact.
 const exhibitWall=(w:{x:number;y:number;w:number;h:number})=>!!g.arena?.decor.some(d=>d.x===w.x&&d.y===w.y&&d.w===w.w&&d.h===w.h);
 for(const w of walls.filter(w=>!exhibitWall(w))){
  ctx.save();ctx.shadowColor='#000b';ctx.shadowBlur=10;ctx.shadowOffsetY=7;rect(w.x,w.y,w.w,w.h,'#040c16',2);ctx.restore();
  rect(w.x,w.y-11,w.w,w.h+11,'#182b3b',2);
  rect(w.x,w.y+w.h-11,w.w,11,'#263c4b',1);
  rect(w.x,w.y-11,w.w,w.h,identity.cap,2);
  rect(w.x+2,w.y-9,Math.max(1,w.w-4),Math.max(1,w.h-4),identity.cap,1);rect(w.x+1,w.y-10,w.w-2,2,'#d1b17a');
  rect(w.x,w.y-11,w.w,2,'#b8ccce');
  if(w.w>40)rect(w.x+7,w.y+w.h-9,w.w-14,2,'#ac956744');
  ctx.save();ctx.globalAlpha=.35;sprite(ctx,w.w>=w.h?'wall-h':'wall-v',w.x+w.w/2,w.y+w.h/2-5.5,w.w,w.h+11,false,true);ctx.restore();
  if(g.layout===1&&w.w>50&&w.h>=16)for(let bx=w.x+8;bx<w.x+w.w-8;bx+=8)rect(bx,w.y-6,5,Math.min(14,w.h-8),['#a8806a','#baaa7d','#57938c'][Math.floor(bx/8)%3],1);
  else if(g.layout===1&&w.h>50&&w.w>=16){for(let by=w.y+8;by<w.y+w.h-8;by+=8)rect(w.x+5,by-8,Math.min(14,w.w-8),5,['#a8806a','#baaa7d','#57938c'][Math.floor(by/8)%3],1);}
  else if(w.w>45&&w.h>18&&w.w<200){rect(w.x+6,w.y-5,w.w-12,w.h-12,'#94c5c44a',2);ctx.strokeStyle='#daeee788';ctx.strokeRect(w.x+6,w.y-5,w.w-12,w.h-12);}
 }
 // Brass wall caps and sconces belong to solid geometry, never to a walkable lane.
 for(const w of walls.filter(w=>!exhibitWall(w)&&w.w<200&&w.h>=20&&w.x>24&&w.x<910)){
  ctx.strokeStyle='#ccb88966';ctx.lineWidth=1;ctx.strokeRect(w.x+3,w.y-7,w.w-6,Math.max(4,w.h-6));
  if(w.h>70){sprite(ctx,'sconce',w.x+w.w/2,w.y+w.h-18,17,27);}
 }
 drawMuseumDecor(ctx,g.arena);
 // Paint dock openings after the wall tops, without changing collision or zone coordinates.
 for(const team of [...new Set(g.seats.map(s=>s.team))]){const v=vanFor(g,team),facing=vanFacing(g,team),top=v.y<300,color=COLORS[team],edge=top?24:576;ctx.strokeStyle=color;ctx.lineWidth=3;if(isFlagship(g)){
  // Service driveways face the nearest exterior edge; only the van animates across it.
  const west=facing==='west',lane=west?{x:0,y:v.y-34,w:v.x+34,h:68}:{x:v.x-34,y:v.y-34,w:68,h:H-v.y+34};
  rect(lane.x,lane.y,lane.w,lane.h,'#101b28');ctx.strokeRect(lane.x,lane.y,lane.w,lane.h);
  ctx.strokeStyle=color+'99';ctx.lineWidth=2;for(const offset of [8,20]){const x=west?offset:v.x,y=west?v.y:H-offset;ctx.beginPath();ctx.moveTo(x+(west?6:-7),y+(west?-7:-6));ctx.lineTo(x,y);ctx.lineTo(x+(west?6:7),y+(west?7:-6));ctx.stroke();}
 }else{rect(v.x-34,edge-13,68,28,'#101b28');ctx.strokeRect(v.x-34,edge-13,68,28);}const glow=ctx.createRadialGradient(v.x,edge,5,v.x,v.y,85);glow.addColorStop(0,color+'66');glow.addColorStop(1,color+'00');ctx.fillStyle=glow;ctx.fillRect(v.x-50,Math.min(v.y,edge)-40,100,140);const departure=departureMs===undefined?null:departingVan(g,team,departureMs);ctx.save();ctx.translate(departure?.x??v.x,departure?.y??(isFlagship(g)?v.y:top?12:588));ctx.rotate(facing==='north'?Math.PI:facing==='east'?-Math.PI/2:facing==='west'?Math.PI/2:0);if(departure&&departure.progress>0){for(let i=0;i<4;i++){const drift=(departureMs!/100+i*.3)%1;circle((i%2?1:-1)*(9+drift*8),-32-drift*30,4+drift*8,'#c9d8d333');}}sprite(ctx,team===0?'van-mint':'van-violet',0,0,54,66);if(departure){const gap=12*(1-departure.doors);rect(-23-gap,-27,22,6,'#1b3f46',2);rect(1+gap,-27,22,6,'#1b3f46',2);rect(-21,-22,8,3,'#ff6654',1);rect(13,-22,8,3,'#ff6654',1);}ctx.restore();}
 const lootLabels:{l:typeof g.loot[number];name:string;glow:string}[]=[];
 for(const l of g.loot){if(!exhibitAvailable(g,l)||l.banked||l.holder||l.guardCarrier)continue;if(l.stashedAt!==undefined){ctx.save();ctx.globalAlpha=.8;art(l.id,l.value,l.x,l.y-10,.6,true);ctx.restore();text('STASH · $'+l.value,l.x,l.y+24,11,'#ffe2a1','center');continue;}if(l.flight){const f=Math.min(1,(g.now-l.flight.at)/500);circle(l.x,l.y,10,'#0008');art(l.id,l.value,l.x,l.y-25-(reducedMotion?12:Math.sin(f*Math.PI)*55),.72,true);continue;}const spec=artwork(l.id,l.value,g.layout);const glow=ctx.createRadialGradient(l.x,l.y,4,l.x,l.y,50);glow.addColorStop(0,(l.locked&&open?'#ffd579':spec.glow)+'38');glow.addColorStop(1,spec.glow+'00');ctx.fillStyle=glow;ctx.fillRect(l.x-50,l.y-50,100,100);
 if(l.locked&&!open)text(vaultReady(g)?'🔒 Hold the plate':'🔒 Opens at 1:00',l.x,l.y+48,11,'#ffe2a1','center');
 if(l.locked){sprite(ctx,open?'case-open':'case-locked',l.x,l.y-19,66,80);art(l.id,l.value,l.x,l.y-17,.72);if(!open){ctx.save();ctx.strokeStyle='#ff6169';ctx.shadowColor='#ff4656';ctx.shadowBlur=5;ctx.lineWidth=1.2;for(const dy of [-40,-25,-10]){ctx.beginPath();ctx.moveTo(l.x-22,l.y+dy);ctx.lineTo(l.x+22,l.y+dy);ctx.stroke();}ctx.restore();}else if(!reducedMotion){for(let i=0;i<3;i++){const a=t+i*2.1;circle(l.x+Math.cos(a)*28,l.y-25+Math.sin(a)*22,1.5,'#ffe9af');}}}
 else art(l.id,l.value,l.x,l.y-20+Math.sin(t*2+l.value)*.6,1);
 if(emptyPost(g,l)&&!g.guards.some(h=>guardActive(g,h)&&distance(h,l)<60))text('POST EMPTY',l.x,l.y-65,12,'#a2f1cb','center');lootLabels.push({l,name:spec.name,glow:spec.glow});}
 for(const sensor of sensors(g)){const vertical=sensor.h>sensor.w,a={x:sensor.x+(vertical?sensor.w/2:0),y:sensor.y+(vertical?0:sensor.h/2)},b={x:a.x+(vertical?0:sensor.w),y:a.y+(vertical?sensor.h:0)},trip=(sensor.screamingUntil||0)>g.now||sensor.cooldown-g.now>5500,sneak=g.seats.some(p=>p.sneak&&p.x>sensor.x-18&&p.x<sensor.x+sensor.w+18&&p.y>sensor.y-18&&p.y<sensor.y+sensor.h+18);ctx.save();ctx.globalAlpha=sneak&&!reducedMotion?.35+Math.abs(Math.sin(t*20))*.45:1;ctx.strokeStyle=trip?'#fff1df':'#ff4a65';ctx.shadowColor='#ff284b';ctx.shadowBlur=trip?18:8;ctx.lineWidth=trip?4:2;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();for(const p of [a,b]){rect(p.x-4,p.y-4,8,8,'#6c253b',2);circle(p.x,p.y,2,'#ffb3b7');}if(isFlagship(g)){const e=emitterPosition(sensor);rect(e.x-5,e.y-7,10,14,trip?'#ffe3a8':'#a96658',3);circle(e.x,e.y,3,trip?'#fff5d1':'#ff6f79');}ctx.restore();}
 for(const n of g.noises){if(n.holder)continue;const age=reducedMotion?0:Math.max(0,(g.now-n.born)/1000);const r=25+(age*40%65);ctx.strokeStyle='#ff887a'+(n.flight>0?'bb':'70');ctx.lineWidth=2;ctx.beginPath();ctx.arc(n.x,n.y,r,0,Math.PI*2);ctx.stroke();if(n.flight<=0){ctx.strokeStyle='#ff887a35';ctx.beginPath();ctx.arc(n.x,n.y,r+20,0,Math.PI*2);ctx.stroke();}if(n.attached)continue;rect(n.x-10,n.y-13,20,28,'#ff9983',8);rect(n.x-7,n.y-17,14,6,'#e8ce95',2);rect(n.x-6,n.y-8,3,13,'#ffe2ba',2);text('♪',n.x+2,n.y+7,16,'#593048','center');}
 if(me&&!me.escaped&&g.phase==='playing'){const p=display!;ctx.strokeStyle='#8ef2d21c';ctx.lineWidth=1;ctx.setLineDash([3,8]);ctx.beginPath();ctx.arc(p.x,p.y,110,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);if(me.hand){const capsule=g.noises.some(n=>n.id===me.hand),receiver=!capsule?passTarget(g,me,aim):undefined,target=receiver||aim,d=distance(p,target)||1;let reach=Math.min(d,capsule?258:220);for(let i=6;i<=reach;i+=6)if(!clear({x:p.x+(target.x-p.x)/d*i,y:p.y+(target.y-p.y)/d*i},6,walls)){reach=i-6;break;}const end={x:p.x+(target.x-p.x)/d*reach,y:p.y+(target.y-p.y)/d*reach};ctx.strokeStyle='#b4fff0a0';ctx.setLineDash([5,5]);ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.quadraticCurveTo((p.x+end.x)/2,(p.y+end.y)/2-20,end.x,end.y);ctx.stroke();if(capsule){ctx.strokeStyle='#ffb38b70';ctx.beginPath();ctx.arc(end.x,end.y,220,0,Math.PI*2);ctx.stroke();text('HEARING RANGE',end.x,end.y-226,12,'#ffcfad','center');}ctx.setLineDash([]);}}
 // Fog belongs to the world; visible actor sprites and carried art stay intact above it.
 if(vision){vision.paint();
  for(const h of vision.unseen.filter(h=>guardActive(original,h))){
   ctx.save();ctx.translate(h.x,h.y);ctx.rotate(h.angle);const cone=ctx.createRadialGradient(0,0,0,0,0,150);cone.addColorStop(0,'#c7e9ff26');cone.addColorStop(1,'#c7e9ff00');ctx.fillStyle=cone;ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,150,-.55,.55);ctx.closePath();ctx.fill();ctx.restore();
   if(distance(vision.origin,h)<160&&distance(h,h.target)>2&&(reducedMotion||g.now%1200<500)){ctx.save();ctx.strokeStyle='#f4d7a780';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(h.x,h.y,reducedMotion?14:10+(g.now%1200)/35,0,Math.PI*2);ctx.stroke();text('!',h.x,h.y+4,12,'#f4d7a7','center');ctx.restore();}
  }
  for(const s of vision.rivalGhosts){ctx.save();ctx.globalAlpha=s.alpha;ctx.filter='grayscale(1)';const pose=actorPose(Math.cos(s.angle),Math.sin(s.angle));sprite(ctx,(s.team===0?'mint':'violet')+'-'+pose.pose,s.x,s.y-7,40,49,pose.flip);ctx.restore();}
  for(const h of vision.ghosts){ctx.save();ctx.globalAlpha=h.alpha;ctx.filter='grayscale(1)';const pose=actorPose(Math.cos(h.angle),Math.sin(h.angle));sprite(ctx,'guard-'+pose.pose,h.x,h.y-7,40,49,pose.flip);ctx.strokeStyle='#d8e7ee';ctx.beginPath();ctx.moveTo(h.x,h.y);ctx.lineTo(h.x+Math.cos(h.angle)*24,h.y+Math.sin(h.angle)*24);ctx.stroke();ctx.restore();}
 }
 for(const guard of g.guards.filter(h=>guardActive(g,h))){const lure=recentLure(g,guard.id);if(lure){ctx.save();ctx.strokeStyle='#8ef2d299';ctx.lineWidth=2;ctx.setLineDash([5,5]);ctx.beginPath();ctx.moveTo(guard.x,guard.y);ctx.lineTo(lure.x,lure.y);ctx.stroke();ctx.setLineDash([]);ctx.beginPath();ctx.arc(guard.x,guard.y,27,0,Math.PI*2);ctx.stroke();ctx.restore();}const p=({...guard,...(positions.get(guard.id)||guard)});ctx.save();ctx.translate(p.x,p.y);ctx.scale(1.2,1.2);ctx.translate(-p.x,-p.y);ctx.globalAlpha=(guard.retreatUntil||0)>g.now?.35:1;
 const gp=actorPose(Math.cos(guard.angle),Math.sin(guard.angle));ctx.save();ctx.filter='brightness(1.18) drop-shadow(2px 0px 0px #b5e9ff) drop-shadow(-2px 0px 0px #b5e9ff) drop-shadow(0px 2px 0px #b5e9ff) drop-shadow(0px -2px 0px #b5e9ff)';const guardPaint=sprite(ctx,'guard-'+gp.pose,p.x,p.y-7,40,49,gp.flip);ctx.restore();ctx.save();ctx.shadowColor='#9ce3ff';ctx.shadowBlur=12;circle(p.x,p.y-22,3.2,'#e5f9ff');circle(p.x+Math.cos(guard.angle)*17,p.y+Math.sin(guard.angle)*17,3,'#d4f4ff');ctx.restore();if(!guardPaint){circle(p.x+3,p.y+9,15,'#00000055');rect(p.x-11,p.y-3,22,19,'#26334b',6);rect(p.x-4,p.y+2,8,12,'#495a74',2);
 circle(p.x,p.y-5,10,'#d6a982');rect(p.x-12,p.y-15,24,8,guard.mode==='chase'?'#af4e60':'#697f9a',3);rect(p.x-14,p.y-9,28,4,'#172334',2);circle(p.x,p.y-12,2,'#efd286');
 circle(p.x-4,p.y-4,1.5,'#202333');circle(p.x+4,p.y-4,1.5,'#202333');
 ctx.save();ctx.translate(p.x,p.y);ctx.rotate(guard.angle);rect(10,-3,11,6,'#899ba9',2);rect(18,-3,4,6,'#ffe6a5',1);ctx.restore();
 }
 text(lure?'LURED':guard.mode==='chase'?'!':guard.mode==='investigate'?'?':guard.returnArt?'RETURNING ART':guard.sentry&&!staffDoors(g).some(d=>Math.abs(d.x-p.x)<55&&Math.abs(d.y-(p.y-36))<32)?'POST':'',p.x,p.y-30,lure||guard.sentry||guard.returnArt?12:20,'#ffb09b','center');ctx.restore();const carried=g.loot.find(l=>l.guardCarrier===guard.id);if(carried)art(carried.id,carried.value,p.x,p.y-48,.65,true);}
 const labels:LabelBox[]=[];const pendingLabels:{value:string;x:number;y:number;color:string}[]=[];const label=(value:string,x:number,y:number,color:string)=>{if(jackpot&&!jackpot.banked&&!jackpot.holder&&Math.abs(x-jackpot.x)<90&&Math.abs(y-jackpot.y)<100)y=Math.min(y,jackpot.y-73);pendingLabels.push({value,x,y,color});};
 [...g.seats].sort((a,b)=>Number(a.id===you)-Number(b.id===you)).forEach(s=>{const i=g.seats.indexOf(s);const state=crewActorState(g,you,s,p=>!vision||vision.visible(positions.get(s.id)||p));if(state==='occluded')return;if(state==='aboard'){const dock=(departureMs===undefined?null:departingVan(g,s.team,departureMs))||vanFor(g,s.team),aboard=g.seats.filter(p=>p.team===s.team&&p.escaped),index=aboard.findIndex(p=>p.id===s.id),x=dock.x+(index-(aboard.length-1)/2)*20;circle(x,dock.y-27,8,COLORS[s.team]);text('✓',x,dock.y-23,11,'#fff','center');label((s.id===you?'YOU':s.name.toUpperCase())+' · ABOARD',x,dock.y-43,COLORS[s.team]);return;}const p=positions.get(s.id)||s;ctx.save();ctx.globalAlpha=hidden(g,s)?.35:s.stun>g.now?.8:1;circle(p.x+2,p.y+9,14,'#00000060');const color=s.stun>g.now?'#899fae':COLORS[s.team];if(s.safe>g.now){ctx.strokeStyle='#d7fff0';ctx.lineWidth=3;ctx.beginPath();ctx.arc(p.x,p.y,28,0,Math.PI*2);ctx.stroke();}ctx.save();ctx.translate(p.x,p.y);ctx.scale(1.2,1.2);
 const grab=g.events.find(e=>e.text.startsWith('The art sets off an alarm!')&&g.now-e.at<350&&distance(e,s)<25);const bounce=grab&&!reducedMotion?Math.sin((g.now-grab.at)/350*Math.PI):0;ctx.scale(1+bounce*.12,1-bounce*.12);ctx.translate(0,-bounce*5);
 // Face-forward silhouettes stay legible while the feet indicate movement.
 const facing=Math.atan2(s.aim.y-s.y,s.aim.x-s.x);const bob=Math.sin(t*10+i)*1.1;
 const ap=actorPose(s.dx||s.aim.x-s.x,s.dy||s.aim.y-s.y,!!g.loot.find(l=>l.id===s.hand));ctx.save();ctx.filter=(s.stun>g.now?'brightness(.85) ':'')+'drop-shadow(2px 0px 0px #e0f2ed) drop-shadow(-2px 0px 0px #e0f2ed) drop-shadow(0px 2px 0px #e0f2ed) drop-shadow(0px -2px 0px #e0f2ed)';const painted=sprite(ctx,(s.team===0?'mint':'violet')+'-'+ap.pose,0,-8,40,49,ap.flip);ctx.restore();if(!painted){rect(-9,7,7,10,'#0c1827',3);rect(3,7,7,10,'#0c1827',3);
 rect(-12,-2,24,17,color,7);rect(-5,0,10,14,'#152c3c',3);rect(-15,0,5,10,color,3);rect(10,0,5,10,color,3);
 rect(-18,-1,13,17,'#b49167',5);rect(-18,2,13,3,'#e2bd84',1);circle(0,-8+bob,12,color);circle(1,-6+bob,9,s.stun>g.now?'#a7b8c2':'#edc49b');
 rect(-9,-11+bob,19,8,'#142032',4);circle(-4+Math.cos(facing),-7+bob,2,'#fff6dc');circle(5+Math.cos(facing),-7+bob,2,'#fff6dc');
 ctx.strokeStyle='#8f5445';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(2,-1+bob,3,0,Math.PI*.8);ctx.stroke();
 rect(-11,-20+bob,22,7,color,3);rect(-8,2,19,4,color,2);rect(7,4,5,11,color,2);rect(-5,-23+bob,14,5,color,3);}
 ctx.restore();ctx.restore();if(state==='hidden'){ctx.save();ctx.strokeStyle=COLORS[s.team]+'99';ctx.lineWidth=2;ctx.setLineDash([4,3]);ctx.strokeRect(p.x-21,p.y-30,42,54);ctx.restore();}if(s.id===you){ctx.strokeStyle='#ffffff';ctx.lineWidth=3;ctx.beginPath();ctx.roundRect(p.x-23,p.y-32,46,56,17);ctx.stroke();circle(p.x,p.y+29,3,'#ffffff');}
  if(s.freedAt&&g.now-s.freedAt<650&&!reducedMotion)drawRope(ctx,p.x,p.y,1,0,(g.now-s.freedAt)/650);
  if(s.hand){const noise=g.noises.some(n=>n.id===s.hand);if(noise){circle(p.x+15,p.y-12,9,'#ff8c82');text('♪',p.x+15,p.y-9,11,'#562b32','center');}else art(s.hand,g.loot.find(l=>l.id===s.hand)?.value||200,p.x,p.y-54,.65,true);if(noise){const n=g.noises.find(n=>n.id===s.hand)!;text(Math.ceil((n.expires-g.now)/1000)+'s',p.x+26,p.y-20,10,'#ffc2ae');}}
  if(s.stun>g.now){ctx.strokeStyle='#ff8f8f';ctx.lineWidth=3;ctx.beginPath();ctx.arc(p.x,p.y,23,-Math.PI/2,-Math.PI/2+Math.PI*2*Math.min(1,(s.stun-g.now)/6000));ctx.stroke();const rescuer=g.seats.find(r=>r.rescueId===s.id),loosen=rescuer?Math.min(1,(g.now-rescuer.rescueAt)/1200):0;drawRope(ctx,p.x,p.y,loosen,reducedMotion?0:Math.sin(t*14)*1.4);label((s.id===you?'YOU':s.name.toUpperCase())+' · TIED UP '+Math.ceil((s.stun-g.now)/1000)+'s',p.x,p.y-(g.loot.some(l=>l.id===s.hand)?88:43),'#bfd9ed');}else if(s.safe>g.now)label((s.id===you?'YOU':s.name.toUpperCase())+' · FREE '+Math.ceil((s.safe-g.now)/1000)+'s',p.x,p.y-(g.loot.some(l=>l.id===s.hand)?88:43),'#d7fff0');else label((s.id===you?'YOU':s.name.toUpperCase())+(hidden(g,s)?' · HIDING':'')+(g.noises.some(n=>n.id===s.hand)?' · ALARM IN HAND':g.noises.some(n=>n.attached===s.id)?' · ALARM ON':''),p.x,p.y-(g.loot.some(l=>l.id===s.hand)?88:43),color);if(s.rescueId){ctx.strokeStyle='#b6f2d4';ctx.lineWidth=4;ctx.beginPath();ctx.arc(p.x,p.y,26,-Math.PI/2,-Math.PI/2+Math.PI*2*Math.min(1,(g.now-s.rescueAt)/1200));ctx.stroke();}
 });
 for(const item of lootLabels){const {l,name,glow}=item;if(!isFlagship(g)&&g.seats.some(s=>!s.escaped&&distance(s,l)<55))continue;const h=12/cam.scale;const near=g.seats.some(s=>!s.escaped&&distance(s,l)<90);const value='$'+l.value;const nameShown=near&&!g.seats.some(s=>!s.escaped&&distance(s,l)<40);const lines=nameShown?2:1;const width=Math.max(value.length*h*.65+12,nameShown?name.length*h*.55+10:0);const box=stackLabel(l.x,l.y+28,width,h*lines+8,labels);rect(box.x-width/2,box.y-h,width,h*lines+8,'#081324eb',4);text(value,box.x,box.y,12,glow,'center');if(nameShown)text(name,box.x,box.y+h+2,12,'#eee6cf','center');}
 for(const l of pendingLabels){const h=12/cam.scale;ctx.font=`700 ${h}px Arial`;const w=ctx.measureText(l.value).width+12;const box=stackLabel(Math.max(cam.x+w/2+4,Math.min(cam.x+cam.w-w/2-4,l.x)),Math.max(cam.y+h+5,l.y),w,h,labels);rect(box.x-w/2,box.y-h,w,h+7,'#071321e8',4);text(l.value,box.x,box.y,12,l.color,'center');}
 if(me&&!background){const target=interaction(g,me);if(target.target){ctx.strokeStyle='#d5ffe8';ctx.lineWidth=2;ctx.setLineDash([4,4]);ctx.beginPath();ctx.arc(target.target.x,target.target.y,28,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);}}
 if(blackoutActive(g)){rect(cam.x,cam.y,cam.w,cam.h,isFlagship(g)?(lights==='full'?'#03071366':'#03071380'):'#03071388');for(const l of floorExhibits(g).filter(l=>!l.sealed)){circle(l.x,l.y,10,'#f7d19166');}}
 if(g.alert>=60){rect(cam.x,cam.y,cam.w,cam.h,'#d7203012');}
 const recent=g.events.filter(e=>g.now-e.at>=0&&g.now-e.at<900&&(['capture','bank','rescue','throw','catch'].includes(e.kind)||e.text.startsWith('The art sets off an alarm!')||e.text.startsWith('DISTRACTED ')));
 for(const e of recent){const age=g.now-e.at,f=age/900,bank=e.kind==='bank',caught=e.kind==='catch'&&e.text.includes('caught!'),freed=e.kind==='rescue'&&!e.text.includes('passed');
  if(!reducedMotion)for(let i=0;i<12;i++){const a=i*Math.PI/6;circle(e.x+Math.cos(a)*f*65,e.y+Math.sin(a)*f*45,Math.max(.1,3*(1-f)),bank?'#ffe0a5':caught?'#ff6c7e':'#b5ffe1');}
  const amount=e.text.match(/^\$(\d+) secured/);const pop=e.text.startsWith('DISTRACTED ')?e.text:amount?'＋$'+amount[1]+' BANKED':caught?'TIED UP!':freed?'FREED!':e.text.startsWith('The art sets off an alarm!')?'✦':'';
  // Text starts above the actor and vanishes at 400ms, never covering their body.
  if(pop&&age<400){ctx.save();ctx.globalAlpha=reducedMotion?1:1-age/500;const popSize=bank?24:18,size=Math.max(12/cam.scale,popSize);ctx.font=`400 ${size}px 'Bungee', Impact, sans-serif`;const box=stackPopLabel(e.x,e.y-(reducedMotion?0:f*35),ctx.measureText(pop).width,size,labels);const popX=Math.max(cam.x+ctx.measureText(pop).width/2+4,Math.min(cam.x+cam.w-ctx.measureText(pop).width/2-4,box.x));text(pop,popX,box.y,popSize,bank?'#ffe09d':caught?'#ff7c88':'#b7ffe2','center');ctx.restore();}
 }
 // Gradient edge adds atmosphere without obscuring game objects.
 const vignette=ctx.createRadialGradient(cam.x+cam.w/2,cam.y+cam.h/2,cam.h*.2,cam.x+cam.w/2,cam.y+cam.h/2,cam.w*.72);vignette.addColorStop(0,'#00000000');vignette.addColorStop(1,isFlagship(g)?'#020a1618':'#020a1644');ctx.fillStyle=vignette;ctx.fillRect(cam.x,cam.y,cam.w,cam.h);
 ctx.setTransform(ratio,0,0,ratio,0,0);
 const top=-cam.y*cam.scale,bottom=(600-cam.y)*cam.scale;
 if(overview&&g.arena&&top>65){ctx.textAlign='center';ctx.font="700 12px Arial";ctx.fillStyle='#d8bd83';ctx.fillText(g.arena.name.toUpperCase(),width/2,top-28);ctx.strokeStyle='#d8bd8333';ctx.beginPath();ctx.moveTo(width/2-65,top-17);ctx.lineTo(width/2+65,top-17);ctx.stroke();ctx.font='11px Arial';ctx.fillStyle='#a4b5c3';ctx.fillText('Whole museum · Closer view follows your thief',width/2,Math.min(height-16,bottom+32));}
 ctx.setTransform(1,0,0,1,0,0);return cam;
}
