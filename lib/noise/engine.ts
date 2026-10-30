import {archiveArena} from './archive-arena.ts';
import {flagshipArena} from './flagship-arena.ts';
import {sampledClear} from './sampled-clear.ts';
import {RouteQueue} from './route-queue.ts';
import {AUTHORED_RIVALS,AUTHORED_COOP,museumArena,type MuseumArena} from './arenas.ts';
/** Noise Thieves: deterministic, fixed-step simulation shared by solo and server. */
export type Vec={x:number;y:number};
export type Rect=Vec&{w:number;h:number};
export const W=960,H=600,STEP=40,DURATION=90000;
export const EXIT={x:88,y:510};
export const PLATE={x:730,y:155};
export const VAN_RADIUS=35;
export const SAFE_ZONE:Rect={x:53,y:475,w:70,h:70};
export const inside=(p:Vec,r:Rect)=>p.x>=r.x&&p.x<=r.x+r.w&&p.y>=r.y&&p.y<=r.y+r.h;
export const inSafeZone=(p:Vec)=>inside(p,SAFE_ZONE); // legacy co-op helper
export const isFlagship=(g:Game|View)=>['flagship-velmont','night-archive'].includes(g.arena?.id||'');
export const vaultReady=(g:Game|View)=>!isFlagship(g)||(g.phase==='playing'||g.phase==='finished')&&g.now-g.start>=30000;
export const vanFor=(g:Game|View,team:number):Vec=>g.crewMode==='coop'&&g.arena?.coopDock?g.arena.coopDock:g.arena?.docks?g.arena.docks[g.crewMode==='coop'?0:(team+(g.match-1)%2)%2]:g.crewMode==='coop'?EXIT:team===0?{x:90,y:510}:team===1?{x:870,y:!g.arena&&g.layout===1?90:510}:{x:480,y:65};
export const zoneFor=(g:Game|View,team:number):Rect=>{const p=vanFor(g,team);return {x:p.x-35,y:p.y-35,w:70,h:70};};
export const zones=(g:Game|View):Rect[]=>[...new Set(g.seats.map(s=>s.team))].map(t=>zoneFor(g,t));
export const homeSafe=(g:Game|View,s:Vec&{team:number})=>inside(s,zoneFor(g,s.team));
export const anySafe=(g:Game|View,p:Vec)=>zones(g).some(r=>inside(p,r));
export const thiefWalls=(g:Game|View,s:{team:number})=>[...g.walls,...(isFlagship(g)?[]:[...new Set(g.seats.map(p=>p.team))]).filter(t=>t!==s.team&&g.crewMode!=='coop').map(t=>zoneFor(g,t))];
export type Sensor=Rect&{id:string;cooldown:number;screamingUntil?:number;inside?:string[]};
export function sensors(g:Game|View):Sensor[]{return g.sensors||[];}
export const CARRY_SPEED=100;
const alarmHearing=(g:Game|View)=>g.crewMode==='coop'?(difficultyOf(g)==='pro'?340:g.arena&&difficultyOf(g)==='normal'?280:170):170;
export const LOOT_TOTAL=4300;
export const carrySpeed=(value:number,g?:Game|View)=>(g&&isFlagship(g)&&value===1200?165:110-Math.max(0,Math.min(1300,value-200))*30/1300);
export const COOP_GOAL=2600;
export const LAYOUT_NAMES=['Echo Gallery','Night Archive','Crossroads'];
export type Difficulty='rookie'|'normal'|'pro';
export const DIFFICULTY={rookie:{speed:.95,sight:.9,rival:.42},normal:{speed:1.22,sight:1.15,rival:1.14},pro:{speed:1.22,sight:1.15,rival:1.65}};
export const difficultyOf=(g:Game|View):Difficulty=>g.crewMode!=='coop'&&g.seats.some(s=>!s.bot&&s.team!==g.seats.find(p=>!p.bot)?.team)?'normal':g.difficulty||'normal';
export const tuning=(g:Game|View)=>{const d=difficultyOf(g),t=DIFFICULTY[d];return g.crewMode==='coop'?{...t,speed:d==='rookie'?.78:d==='normal'?.96:isFlagship(g)?1.25:1.0,sight:d==='rookie'?.80:d==='normal'?.95:1.0}:t;};
export const guardSpeed=(g:Game|View,mode:Guard['mode'])=>mode==='chase'&&g.crewMode==='coop'?(difficultyOf(g)==='rookie'?.85:difficultyOf(g)==='normal'?1.4:1.5):tuning(g).speed;
export const guardSight=(g:Game|View,h:Pick<Guard,'mode'>)=>h.mode==='chase'&&g.crewMode==='coop'?(difficultyOf(g)==='rookie'?.9:difficultyOf(g)==='normal'?1.25:1.3):tuning(g).sight;
export type CrewMode='coop'|'duos'|'trios';
export const CREW_NAMES=['MINT','VIOLET','AMBER'];
export const WALLS:Rect[]=[{x:0,y:0,w:960,h:24},{x:0,y:576,w:960,h:24},{x:0,y:0,w:24,h:600},{x:936,y:0,w:24,h:600},
{x:300,y:24,w:20,h:150},{x:300,y:260,w:20,h:160},{x:300,y:500,w:20,h:76},
{x:620,y:24,w:20,h:250},{x:620,y:360,w:20,h:120},
{x:320,y:390,w:160,h:18},{x:550,y:390,w:70,h:18},
{x:90,y:220,w:100,h:34},{x:420,y:170,w:90,h:34},{x:750,y:210,w:80,h:34}];
export const LAYOUTS:Rect[][]=[WALLS, [...WALLS.slice(0,4),
{x:300,y:24,w:20,h:100},{x:300,y:210,w:20,h:210},{x:300,y:500,w:20,h:76},
{x:620,y:24,w:20,h:190},{x:620,y:300,w:20,h:180},
{x:360,y:220,w:120,h:24},{x:520,y:390,w:100,h:18},
{x:90,y:220,w:100,h:34},{x:750,y:210,w:80,h:34}],
[...WALLS.slice(0,4),{x:300,y:24,w:20,h:150},{x:300,y:260,w:20,h:160},
{x:620,y:24,w:20,h:120},{x:620,y:230,w:20,h:180},{x:620,y:490,w:20,h:86},
{x:380,y:180,w:140,h:24},{x:380,y:390,w:150,h:24},
{x:100,y:150,w:100,h:24},{x:750,y:270,w:80,h:24}]];
export const mirrorPoint=(p:Vec):Vec=>({x:960-p.x,y:p.y});
const mirrorRect=(r:Rect):Rect=>({...r,x:960-r.x-r.w});
export const rotatePoint=(p:Vec):Vec=>({x:960-p.x,y:600-p.y});
const rotateRect=(r:Rect):Rect=>({...r,x:960-r.x-r.w,y:600-r.y-r.h});
export const wideX=(x:number)=>Math.round((x<360?24+(x-24)*312/336:x>600?936-(936-x)*312/336:480+(x-480)*1.2)/10)*10;
export const widePoint=(p:Vec):Vec=>({x:wideX(p.x),y:p.y});
const wideRect=(r:Rect):Rect=>({...r,x:wideX(r.x),w:wideX(r.x+r.w)-wideX(r.x)});
export const RIVAL_LAYOUTS=JSON.parse(JSON.stringify(AUTHORED_RIVALS)) as Array<{symmetry:string;walls:Rect[];slots:Vec[];jackpot:Vec;idol:Vec;plate:Vec;sensors:Rect[];patrol:Vec[];centreRoute:Vec[];routes:Vec[][];niches:(Vec&{back:string;kind:string})[];rooms:(Vec&{name:string})[]}>;
// Fixed architecture; content slots vary without moving walls or the shared plate.
export const RIVAL_LOOT_SLOTS=[
 {deep:[{x:100,y:100},{x:300,y:100},{x:200,y:270}],jack:[{x:470,y:120},{x:490,y:145},{x:470,y:170}],centre:[{x:490,y:350},{x:470,y:365},{x:490,y:380}]},
 {deep:[{x:80,y:90},{x:305,y:215},{x:260,y:290}],jack:[{x:480,y:440},{x:480,y:450},{x:480,y:470}],centre:[{x:490,y:290},{x:490,y:300},{x:490,y:310}]},
 {deep:[{x:100,y:100},{x:140,y:260},{x:340,y:280}],jack:[{x:470,y:70},{x:490,y:90},{x:470,y:110}],centre:[{x:490,y:270},{x:470,y:300},{x:490,y:330}]}
].map(m=>({deep:m.deep.map(widePoint),jack:m.jack.map(widePoint),centre:m.centre.map(widePoint)}));
export const RIVAL_REINFORCEMENTS:Vec[][]=[
 [{x:380,y:350},{x:480,y:380},{x:580,y:350},{x:580,y:240},{x:380,y:240}],
 [{x:410,y:300},{x:480,y:280},{x:550,y:300},{x:550,y:430},{x:410,y:410}],
 [{x:420,y:260},{x:480,y:210},{x:540,y:260},{x:540,y:340},{x:480,y:380},{x:420,y:340}]
].map(r=>r.map(widePoint));
export const PEDESTALS:Vec[]=[{x:205,y:320},{x:250,y:90},{x:440,y:285},{x:530,y:330},{x:835,y:120},{x:810,y:470},{x:710,y:330},{x:870,y:350}];
export type Thief=Vec&{id:string;name:string;bot:boolean;token?:string;dx:number;dy:number;aim:Vec;inputAt:number;lastSeq:number;ready:boolean;hand:string|null;stun:number;safe:number;escaped:boolean;captures:number;rescues:number;bank:number;cooldown:number;mode:'auto'|'follow'|'fetch'|'cover'|'plate'|'van';task?:string;announcedTask?:string;taskAt?:number;autoTarget?:string;decisionAt?:number;lastSeen:number;team:number;windup:number;bestThrow:number;rescueId:string|null;rescueAt:number;bottleId:string|null;bottleAt:number;sneak?:boolean;plateJob?:string;capturedBy?:string;retreatUntil?:number;retreatPoint?:Vec;spacing?:boolean;avoidPoint?:Vec;avoidUntil?:number;idlePoint?:Vec;idleUntil?:number;idleRescueDeadline?:number;penalty?:number;escapedAt?:number;ambushUntil?:number;calloutAt?:number;botHeading?:Vec;turnAt?:number;hiddenAt?:number;hideCooldown?:number;hideId?:number;progressAt?:number;progressPoint?:Vec;unstickUntil?:number;unstickTarget?:Vec;passUntil?:number;freedAt?:number;escapeCommitted?:boolean;escapeCheckAt?:number;escapeWaitAt?:number;sentryPlan?:{guardId:string;artId:string;bait:Vec;exit:Vec;phase:'approach'|'retreat';until:number};sentryRetryAt?:number;stashWaitUntil?:number;defendAt?:number;coverThreat?:{id:string;distance:number};emptyBoardUntil?:number;selfQuiet?:{artId:string;noiseId:string;until:number};};
export type Guard=Vec&{id:string;angle:number;mode:'patrol'|'investigate'|'chase';target:Vec;route:Vec[];way:number;attention:number;victim:string|null;luredUntil?:number;searchAt?:number;searchCenter?:Vec;retreatUntil?:number;entryAt?:number;door?:Vec;entered?:boolean;sentry?:Vec;sentryFacing?:number;sentryUntil?:number;sentryArt?:string;returnArt?:string;lastSeenPoint?:Vec;lastSeenAt?:number;};
export type Loot=Vec&{id:string;name:string;value:number;holder:string|null;banked:boolean;bankedBy?:number;quietUntil?:number;home?:Vec;droppedAt?:number;recoverAt?:number;guardCarrier?:string;locked?:boolean;sealed?:boolean;claimed?:boolean;eventPiece?:boolean;stashedAt?:number;flight?:{from:Vec;to:Vec;at:number;team:number;thrower:string};};
export type Noise=Vec&{id:string;holder:string|null;expires:number;born:number;vx:number;vy:number;flight:number;kind:'alarm'|'capsule';source:string|null;attached?:string|null;thrownBy?:string;thrownAt?:number;counted?:boolean;heardBy?:string[];ignoredBy?:string[];heardAt?:Record<string,number>;alerted?:boolean};
export type Event={team?:number;id:number;at:number;text:string;kind:'info'|'capture'|'throw'|'catch'|'bank'|'rescue'|'honk'|'land';x:number;y:number};
export type JobEvent={flashUntil?:number;moves?:{from:Vec;to:Vec}[];kind:'blackout'|'shift'|'curator'|'vault';at:number;until:number;warned:boolean;started:boolean;ended:boolean};
export type Game={version:4;crownExitOpen?:boolean;vaultWarned?:boolean;vaultOpened?:boolean;arena?:MuseumArena;hideSpots?:Vec[];difficulty?:Difficulty;jobEvent?:JobEvent;lootTotal?:number;sensors?:Sensor[];practiceStage?:number;training?:boolean;match:number;layout:number;walls:Rect[];plate:Vec;lockdown:boolean;alarmTip:boolean;finishReason:string;finishedAt?:number;crewMode:CrewMode;alert:number;boardingAt:number;honking:boolean;code:string;host:string;phase:'lobby'|'ready'|'playing'|'finished';seats:Thief[];guards:Guard[];loot:Loot[];noises:Noise[];events:Event[];serial:number;now:number;start:number;end:number;seed:number;revision:number;alarmAt:number;total:number;success:boolean};
export const distance=(a:Vec,b:Vec)=>Math.hypot(a.x-b.x,a.y-b.y);
export function clear(p:Vec,r=12,walls:Rect[]=WALLS){return p.x>=24+r&&p.x<=936-r&&p.y>=24+r&&p.y<=576-r&&!walls.some(w=>p.x>w.x-r&&p.x<w.x+w.w+r&&p.y>w.y-r&&p.y<w.y+w.h+r);}
export function sight(a:Vec,b:Vec,walls:Rect[]=WALLS){const n=Math.ceil(distance(a,b)/8);return sampledClear(a,b,0,n,1,n-1,walls);}
export function move(p:Vec,dx:number,dy:number,dt:number,speed=150,walls:Rect[]=WALLS){const len=Math.hypot(dx,dy);if(!len)return;dx/=Math.max(1,len);dy/=Math.max(1,len);const x=p.x+dx*speed*dt,y=p.y+dy*speed*dt;if(clear({x,y:p.y},12,walls))p.x=x;if(clear({x:p.x,y},12,walls))p.y=y;}
function random(g:Game){g.seed=(Math.imul(1664525,g.seed)+1013904223)>>>0;return g.seed/4294967296;}
export function event(g:Game,text:string,kind:Event['kind']='info',p:Vec=EXIT){g.events.push({id:++g.serial,at:g.now,text,kind,x:p.x,y:p.y});g.events=g.events.slice(-12);}
export function create(code:string,now=0,seed=13):Game{return {version:4,match:0,layout:-1,walls:WALLS,plate:PLATE,lockdown:false,alarmTip:false,finishReason:'',crewMode:'coop',alert:0,boardingAt:0,honking:false,code,host:'',phase:'lobby',seats:[],guards:[],loot:[],noises:[],events:[],serial:0,now,start:0,end:0,seed:Math.imul(seed^(seed>>>16),0x45d9f3b)>>>0,revision:0,alarmAt:0,total:0,success:false};}
export function add(g:Game,name:string,token:string,bot=false){if(g.phase!=='lobby')throw Error('This job has started. Join the next one.');if(g.seats.length>=6)throw Error('Crew full (six thieves).');const id='p'+(++g.serial);const s:Thief={id,name:name.trim().slice(0,18)||'Rookie',token:bot?undefined:token,bot,x:85+g.seats.length*30,y:485,dx:0,dy:0,aim:{x:500,y:300},inputAt:0,lastSeq:0,ready:false,hand:null,stun:0,safe:0,escaped:false,captures:0,rescues:0,bank:0,cooldown:0,mode:'auto',lastSeen:g.now,team:0,windup:0,bestThrow:0,rescueId:null,rescueAt:0,bottleId:null,bottleAt:0};if(g.crewMode!=='coop'){const count=g.crewMode==='trios'?2:Math.max(2,...g.seats.map(p=>p.team+1));s.team=Array.from({length:count},(_,i)=>i).sort((a,b)=>g.seats.filter(p=>p.team===a).length-g.seats.filter(p=>p.team===b).length)[0];}g.seats.push(s);if(!g.host)g.host=id;return s;}
export function setup(g:Game,arenaFactory?:typeof museumArena){guardPaths.delete(g);g.seats=g.seats.filter(s=>s.id!=='practice-rival');if(g.crewMode!=='coop'&&g.seats.some(s=>s.team>1)){g.crewMode=g.seats.length>4?'trios':'duos';g.seats.forEach((s,i)=>s.team=i%2);}g.phase='ready';g.crownExitOpen=false;g.vaultWarned=false;g.vaultOpened=false;g.events=[];g.noises=[];g.total=0;g.success=false;g.start=0;g.end=0;g.alert=0;g.boardingAt=0;g.honking=false;g.lockdown=false;g.alarmTip=false;g.finishReason='';g.finishedAt=undefined;g.jobEvent=undefined;g.lootTotal=undefined;g.hideSpots=undefined;g.match++;g.practiceStage=0;
 const previous=g.layout;g.layout=previous<0?Math.floor(random(g)*3):(previous+1+Math.floor(random(g)*2))%3;g.walls=JSON.parse(JSON.stringify(AUTHORED_COOP[g.layout].walls));g.plate={x:730,y:155};
 g.seats.forEach((s,i)=>Object.assign(s,{x:80+i*28,y:495,dx:0,dy:0,hand:null,stun:0,safe:0,escaped:false,captures:0,rescues:0,bank:0,cooldown:0,ready:s.bot,lastSeq:0,inputAt:0,mode:'auto',windup:0,bestThrow:0,rescueId:null,rescueAt:0,bottleId:null,bottleAt:0,sneak:false,plateJob:undefined,capturedBy:undefined,retreatUntil:0,retreatPoint:undefined,spacing:false,avoidPoint:undefined,avoidUntil:0,idlePoint:undefined,idleUntil:0,idleRescueDeadline:0,penalty:0,escapedAt:undefined,ambushUntil:0,calloutAt:undefined,task:undefined,announcedTask:undefined,taskAt:undefined,autoTarget:undefined,decisionAt:undefined,botHeading:undefined,turnAt:undefined,hiddenAt:undefined,hideCooldown:0,hideId:undefined,progressAt:undefined,progressPoint:undefined,unstickUntil:0,unstickTarget:undefined,passUntil:0,freedAt:undefined,escapeCommitted:false,escapeCheckAt:0,escapeWaitAt:0,sentryPlan:undefined,sentryRetryAt:0,stashWaitUntil:0,defendAt:undefined,coverThreat:undefined,emptyBoardUntil:undefined,selfQuiet:undefined}));
 if(!g.training){setupMuseum(g,arenaFactory);return;}g.arena=undefined;
 g.loot=[{id:'art1',name:'Golden echo',value:500,x:205,y:320},{id:'art2',name:'Moon vase',value:800,x:440,y:285},{id:'art3',name:'Crown mask',value:1200,x:835,y:120},{id:'art4',name:'Blue idol',value:1000,x:810,y:470}].map(x=>({...x,holder:null,banked:false}));
 const spots=[...PEDESTALS];for(let i=spots.length-1;i>0;i--){const j=Math.floor(random(g)*(i+1));[spots[i],spots[j]]=[spots[j],spots[i]];}
 g.loot.forEach((l,i)=>{Object.assign(l,spots[i]);l.home={x:l.x,y:l.y};l.locked=l.value===1200;});
 // The valuable core spans guarded wings; no reserved near-home core sites.
 if(g.crewMode==='coop'&&!g.training){const far=[PEDESTALS[4],PEDESTALS[6],PEDESTALS[7]],pick=Math.floor(random(g)*far.length);Object.assign(g.loot[1],far[pick]);Object.assign(g.loot[3],far[(pick+1)%far.length]);const free=PEDESTALS.filter(p=>!g.loot.filter(l=>l.value===800||l.value===1000).some(l=>distance(l,p)<1));Object.assign(g.loot[0],free[Math.floor(random(g)*free.length)]);const rest=free.filter(p=>distance(p,g.loot[0])>1);Object.assign(g.loot[2],rest[Math.floor(random(g)*rest.length)]);g.loot.forEach(l=>l.home={x:l.x,y:l.y});}
 const jackpot=g.loot.find(l=>l.locked)!;g.plate=jackpot.x<300?{x:250,y:400}:jackpot.x<620?{x:565,y:95}:{x:730,y:155};
 const routes=[[{x:210,y:125},{x:250,y:340},{x:70,y:335},{x:70,y:120}],[{x:405,y:95},{x:565,y:95},{x:565,y:335},{x:365,y:335}],[{x:710,y:115},{x:880,y:115},{x:880,y:510},{x:710,y:510}]];
 g.guards=routes.map((r,i)=>{const route=random(g)<.5?[...r].reverse():r;const start=Math.floor(random(g)*route.length);return {id:'g'+i,...route[start],angle:random(g)*Math.PI*2,mode:'patrol',target:route[(start+1)%route.length],route,way:(start+1)%route.length,attention:0,victim:null};});
 if(random(g)<.25)g.guards=g.guards.slice(0,2);else if(random(g)<.25)g.guards.push({...g.guards[1],id:'g-extra',x:540,y:100});
 if(g.training){g.layout=0;g.walls=LAYOUTS[0];g.loot=[{id:'lesson',name:'Practice piece',value:500,x:205,y:320,home:{x:205,y:320},holder:null,banked:false}];g.guards=[{...g.guards[0],id:'lesson-guard',x:250,y:100,angle:Math.PI/2}];}
 if(g.crewMode!=='coop'&&!g.training){
  const map=RIVAL_LAYOUTS[g.layout];g.walls=map.walls;
  const left=map.slots[Math.floor(random(g)*map.slots.length)],right=(map.symmetry==='rotate'?rotatePoint:mirrorPoint)(left);
  const central=map.jackpot;
  const sites=[left,right,central,map.idol];
  g.loot.forEach((l,i)=>{Object.assign(l,sites[i]);l.home={...sites[i]};});
  g.loot[0].value=g.loot[1].value=650;g.loot[0].name='Mint moon';g.loot[1].name='Violet moon';g.plate={...map.plate};
  g.guards=map.routes.map((r,i)=>{const route=random(g)<.5?[...r].reverse():[...r],way=Math.floor(random(g)*r.length);return {id:'g'+i,...route[way],angle:random(g)*Math.PI*2,mode:'patrol',target:route[(way+1)%r.length],route,way:(way+1)%r.length,attention:0,victim:null};});
 }
 g.seats.forEach(s=>{const home=vanFor(g,s.team),index=g.seats.filter(p=>p.team===s.team).indexOf(s);s.x=home.x;s.y=home.y+(index-1)*14;});
 const coopSensors=[[{x:300,y:180,w:20,h:70},{x:620,y:280,w:20,h:70},{x:480,y:390,w:65,h:18}], [{x:300,y:130,w:20,h:70},{x:620,y:220,w:20,h:70},{x:390,y:300,w:160,h:8}], [{x:300,y:180,w:20,h:70},{x:620,y:150,w:20,h:70},{x:620,y:420,w:20,h:60}]];
 g.sensors=(g.crewMode==='coop'?AUTHORED_COOP[g.layout].sensors:RIVAL_LAYOUTS[g.layout].sensors).map((r,i)=>({...r,id:'sensor-'+i,cooldown:0}));
 if(!g.training){setupVariety(g);g.difficulty=difficultyOf(g);if(g.difficulty==='rookie')g.guards=g.guards.filter(h=>h.id!=='g2');if(g.difficulty==='pro'&&g.crewMode!=='coop'){const route=patrolPool(g).find(r=>!g.guards.some(h=>JSON.stringify(h.route)===JSON.stringify(r)))!;g.guards.push({...g.guards[0],id:'g-pro',route,way:1,target:route[1],...route[0]});}}
 // Co-op Pro uses two exhibit posts and stronger pursuit; rivals keeps its extra patrol.
 if(!g.training)setupSentries(g);
 g.hideSpots=chooseHidingSpots(g);
 if(!g.training)g.guards.forEach((h,i)=>stageGuard(g,h,i,12000+Math.floor(i/2)*1800));
 event(g,'Grab the art. Steal its alarm. Get back to the van.');
}

function setupMuseum(g:Game,arenaFactory?:typeof museumArena){
 const map=arenaFactory?arenaFactory(g.layout,g.seats.length):g.seats.length<=4&&g.crewMode!=='trios'?((g.match-1)%2?archiveArena(g.seats.length):flagshipArena(g.seats.length)):museumArena(g.layout,g.seats.length);if(map.id==='flagship-velmont')g.layout=0;if(map.id==='night-archive')g.layout=1;g.arena=map;g.walls=map.walls;g.plate={...map.plate};if(isFlagship(g)){navigationEdges(g.walls);const exit=map.crownExit;if(exit)navigationEdges(g.walls.filter(w=>!(w.x===exit.x&&w.y===exit.y&&w.w===exit.w&&w.h===exit.h)));}
 g.difficulty=difficultyOf(g);const rival=g.crewMode!=='coop';
 const values=map.capacity===6?[200,200,1200,500,500,500,400,400,200,200]:[200,200,1200,500,600,600,500,500];
 const names=['Pocket relic','Music box','Crown mask','Contested collection','Wing masterpiece','Wing masterpiece','Moonlit portrait','Blue moon vase','Archive folio','Moon pendant'];
 const pocketShift=Math.floor(random(g)*5)*6-12;const pocketShift2=Math.floor(random(g)*5)*6-12;
 g.loot=map.slots.map((p,i)=>{p=i<2&&!isFlagship(g)?{x:p.x,y:p.y+(i===0?pocketShift:pocketShift2)}:p;return ({id:'art'+(i+1),name:names[i],value:values[i],...p,home:{...p},holder:null,banked:false,locked:i===2});});g.lootTotal=g.loot.reduce((n,l)=>n+l.value,0);
 // Budget is $4300 at every population; six-player plans spread it across ten jobs.
 g.sensors=map.sensors.map((r,i)=>({...r,id:'sensor-'+i,cooldown:0}));
 const count=g.difficulty==='rookie'?(g.crewMode==='coop'?3:2):g.difficulty==='pro'||g.crewMode==='coop'?4:3;
 const patrolRoutes=isFlagship(g)?(g.difficulty==='rookie'?[map.routes[0],map.routes[1]]:g.difficulty==='normal'?[map.routes[0],map.routes[1]]:map.routes.slice(0,4)):map.routes.slice(0,count);
 g.guards=patrolRoutes.map((r,i)=>{const route=r.map(p=>({...p}));const way=Math.floor(random(g)*route.length);return {id:'g'+i,...route[way],angle:random(g)*Math.PI*2,mode:'patrol',target:route[(way+1)%route.length],route,way:(way+1)%route.length,attention:0,victim:null};});
 setupSentries(g);g.hideSpots=isFlagship(g)?map.niches.map(p=>({x:p.x,y:p.y})):chooseHidingSpots(g);
 const extraPatrols=isFlagship(g)?0:map.capacity===6?2:g.crewMode==='coop'&&map.capacity===4?1:0;
 for(let i=0;i<extraPatrols;i++){const route=map.routes[3+i];g.guards.push({id:'g-crowd-'+i,...route[0],angle:0,mode:'patrol',target:route[1],route,way:1,attention:0,victim:null});}

 g.seats.forEach(s=>{const home=vanFor(g,s.team),index=g.seats.filter(p=>p.team===s.team).indexOf(s);Object.assign(s,{x:home.x,y:home.y+(index-1)*14});});
 g.guards.forEach((h,i)=>{if(isFlagship(g)){if(h.sentry)Object.assign(h,h.sentry);h.entered=true;h.entryAt=undefined;}else stageGuard(g,h,i,!isFlagship(g)&&g.crewMode==='coop'&&g.difficulty==='normal'&&i>=3?55000:g.crewMode==='coop'&&g.difficulty==='rookie'&&i>=2?28000:12000+Math.floor(i/2)*1200);});
 const kind=(['blackout','shift','curator','vault'] as const)[Math.floor(random(g)*4)],at=20000+Math.floor(random(g)*45001);
 g.jobEvent={kind,at,until:at+(kind==='blackout'?8000:kind==='vault'?15000:1000),warned:false,started:false,ended:false};
 if(kind==='vault'){g.loot[3].sealed=true;g.loot[3].eventPiece=true;}
 event(g,`${map.name} · ${map.capacity===2?'Compact':map.capacity===4?'Crew':'Grand'} plan. ${map.brief}`);
}

export function hidingSpots(g:Game|View):Vec[]{return g.layout<0?[]:g.hideSpots||chooseHidingSpots(g);}
function wallDistance(g:Game|View,p:Vec){return Math.min(...g.walls.map(w=>Math.hypot(Math.max(w.x-p.x,0,p.x-w.x-w.w),Math.max(w.y-p.y,0,p.y-w.y-w.h))));}
// Sample real wall-aware return routes, rather than empty space along the top edge.
export function hidingRoutePoints(g:Game|View):Vec[]{
 const points:Vec[]=[];
 for(const team of [...new Set(g.seats.map(s=>s.team))])for(const art of [...g.loot,{...g.plate,home:g.plate}]){
  const p={...(art.home||art)},end=vanFor(g,team);
  for(let i=0;i<160&&distance(p,end)>20;i++){points.push({...p});const q=steer(p,end,g.walls),d=distance(p,q)||1;move(p,(q.x-p.x)/d,(q.y-p.y)/d,.1,150,g.walls);}
 }
 return points;
}
export function arenaDefinition(g:Game|View){if(g.arena)return g.arena;const arenas=g.crewMode==='coop'?AUTHORED_COOP:RIVAL_LAYOUTS;return arenas[g.layout]||arenas[0];}
export function vanFacing(g:Game|View,team:number){return g.arena?.dockFacings?.[g.crewMode==='coop'?0:(team+(g.match-1)%2)%2]||(vanFor(g,team).y<300?'north':'south');}
function chooseHidingSpots(g:Game|View):Vec[]{return (arenaDefinition(g)?.niches||[]).map(p=>({x:p.x,y:p.y}));}
export function nearbyHide(g:Game|View,s:Thief):Vec|undefined{return !s.escaped&&s.stun<=g.now&&!g.noises.some(n=>n.attached===s.id)&&g.now>=(s.hideCooldown||0)?hidingSpots(g).find((p,i)=>distance(s,p)<=40&&!g.seats.some(o=>o.id!==s.id&&o.hideId===i&&hidden(g,o))):undefined;}
export function hidden(g:Game|View,s:Thief){return s.hideId!==undefined&&s.hiddenAt!==undefined&&g.now-s.hiddenAt<6000&&!g.noises.some(n=>n.attached===s.id)&&distance(s,hidingSpots(g)[s.hideId]||{x:-999,y:-999})<23;}
function updateHiding(g:Game,s:Thief){
 const blocked=s.escaped||s.stun>g.now||g.noises.some(n=>n.attached===s.id)||!s.sneak;
 if(s.hideId!==undefined&&(blocked||!hidden(g,s))){s.hideId=undefined;s.hiddenAt=undefined;s.hideCooldown=g.now+4000;}
 if(!blocked&&s.hideId===undefined&&g.now>=(s.hideCooldown||0)){const id=hidingSpots(g).findIndex((p,i)=>distance(s,p)<23&&!g.seats.some(o=>o.id!==s.id&&o.hideId===i&&hidden(g,o)));if(id>=0){s.hideId=id;s.hiddenAt=g.now;}}
}
// Clearance graph includes a full 30-unit exclusion around every posted guard.
export function sentryRoutesClear(g:Game|View,posts:Vec[]=g.guards.flatMap(h=>h.sentry?[h.sentry]:[])){
 const size=10,cols=96,valid=(p:Vec)=>clear(p,13,g.walls)&&posts.every(q=>distance(p,q)>=32);
 const points=[...g.loot.map(l=>l.home||l),...new Set(g.seats.map(s=>s.team))].map(p=>typeof p==='number'?vanFor(g,p):p);
 const cells=points.map(p=>{const candidates:Vec[]=[];for(let dy=-15;dy<=15;dy+=10)for(let dx=-15;dx<=15;dx+=10){const q={x:Math.round((p.x+dx)/10)*10,y:Math.round((p.y+dy)/10)*10};if(valid(q)&&sight(p,q,g.walls)&&posts.every(h=>distance(p,h)>=32))candidates.push(q);}return candidates.sort((a,b)=>distance(a,p)-distance(b,p))[0];});
 if(cells.some(p=>!p))return false;const key=(p:Vec)=>p.y/size*cols+p.x/size,queue=[cells[0]],seen=new Set([key(cells[0])]);
 for(let i=0;i<queue.length;i++)for(const [dx,dy] of [[10,0],[-10,0],[0,10],[0,-10]]){const p={x:queue[i].x+dx,y:queue[i].y+dy},k=key(p);if(!seen.has(k)&&valid(p)){seen.add(k);queue.push(p);}}
 return cells.every(p=>seen.has(key(p)));
}
function setupSentries(g:Game){
 if(isFlagship(g)){
  const posts=[{p:g.arena!.posts![1],art:'art3',facing:Math.PI/2},...(difficultyOf(g)==='rookie'?[]:[{p:g.arena!.posts![0],art:'art6',facing:Math.PI/2}])];
  for(const [i,{p,art,facing}] of posts.entries()){const route=g.arena!.routes[3];g.guards.push({id:'flagship-sentry-'+i,...p,route,way:0,target:{...p},mode:'patrol',angle:facing,sentryFacing:facing,victim:null,attention:0,sentry:{...p},sentryArt:art});}
  return;
 }

 // Rookie co-op teaches routes before adding dedicated exhibit guards.
 if(g.crewMode==='coop'&&difficultyOf(g)==='rookie'){g.guards=g.guards.filter(h=>h.id!=='g-extra');return;}
 const exhibits=g.loot.filter(l=>g.arena&&g.crewMode==='coop'&&difficultyOf(g)==='normal'?l.id==='art6':(l.value>=600||g.arena?.capacity===6&&['art5','art6'].includes(l.id)||difficultyOf(g)==='pro'&&l.id==='art4')&&(difficultyOf(g)!=='rookie'||l.locked)&&(g.crewMode!=='coop'||difficultyOf(g)!=='normal'||l.locked||l.value>=800)&&(g.crewMode!=='coop'||difficultyOf(g)!=='pro'||l.locked||l.id==='art5'));
 const assigned=new Map<string,Vec>(),posts:Vec[]=[];const flip=!g.arena&&g.layout===1?rotatePoint:mirrorPoint;
 for(const [i,l] of exhibits.entries()){
  const partner=g.crewMode!=='coop'?exhibits.find(o=>o!==l&&o.value===l.value&&distance(o,flip(l))<1&&assigned.has(o.id)):undefined;
  const candidates:Vec[]=[];if(partner)candidates.push(flip(assigned.get(partner.id)!));else for(let y=40;y<=560;y+=10)for(let x=40;x<=920;x+=10){const p={x,y},d=distance(l,p);if(d>=45&&d<=125&&clear(p,13,g.walls)&&wallDistance(g,p)<=32&&chooseHidingSpots(g).every(n=>distance(n,p)>=120)&&sight(l,p,g.walls)&&!anySafe(g,p))candidates.push(p);}
  candidates.sort((a,b)=>distance(a,l)-distance(b,l));
  const paired=g.crewMode!=='coop'&&exhibits.some(o=>o!==l&&o.value===l.value&&distance(o,flip(l))<1);
  const post=candidates.find(p=>posts.every(q=>distance(p,q)>60)&&sentryRoutesClear(g,[...posts,p,...(!partner&&paired?[flip(p)]:[])]));
  if(!post)throw Error('No clear sentry post: '+g.crewMode+' '+difficultyOf(g)+' '+g.layout+' '+JSON.stringify(l.home)+' '+l.id);
  assigned.set(l.id,post);posts.push(post);let h=g.guards[i+2];if(!h){const pool=patrolPool(g),r=pool.find(r=>!g.guards.some(h=>JSON.stringify(h.route)===JSON.stringify(r)))||pool[0];h={id:'g-sentry-'+i,...post,route:r,way:0,target:r[0],mode:'patrol',angle:0,victim:null,attention:0};g.guards.push(h);}h.sentry={...post};h.sentryArt=l.id;
 }
}
export function staffDoors(g:Game|View):Vec[]{if(g.arena)return g.arena.doors;const wings=[{x:80,y:40},{x:880,y:g.crewMode!=='coop'&&g.layout===1?560:40}];return g.crewMode==='coop'?wings:[...wings,{x:480,y:40},...(g.layout===1?[{x:480,y:560}]:[])];}
export function guardActive(g:Game|View,h:Guard){return h.entryAt===undefined||!!h.entered||!!h.door&&distance(h,h.door)>1;}
function stageGuard(g:Game,h:Guard,index:number,at:number){
 const doors=staffDoors(g),rivals=g.crewMode!=='coop';
 if(g.arena){h.door={...(g.crewMode==='coop'&&difficultyOf(g)==='normal'&&h.sentry?doors[1]:[...doors].sort((a,b)=>distance(a,h.sentry||h.route[0])-distance(b,h.sentry||h.route[0]))[0])};h.entryAt=at;h.entered=false;Object.assign(h,h.door);h.victim=null;h.attention=0;return;}
 const centre=rivals&&(h.sentry?Math.abs(h.sentry.x-480)<144:h.id==='g2'||h.id==='g-lockdown');
 // Archive rotates 180 degrees: alternate its paired centre doors without consuming gameplay RNG.
 const centralDoor=doors[g.layout===1&&((g.seed+g.match)%2===0)?3:2];
 h.door={...(centre?centralDoor:rivals&&h.sentry?[...doors.slice(0,2)].sort((a,b)=>distance(a,h.sentry!)-distance(b,h.sentry!))[0]:doors[index%2])};
 h.entryAt=rivals&&h.sentry?13800:at;h.entered=false;Object.assign(h,h.door);h.victim=null;h.attention=0;
}
function begin(g:Game){g.phase='playing';g.start=g.now;g.end=g.now+(g.training?300000:DURATION);g.alarmAt=g.now+18000;g.guards.forEach(h=>{if(h.entryAt!==undefined)h.entryAt+=g.now;});if(g.jobEvent){g.jobEvent.at+=g.now;g.jobEvent.until+=g.now;}event(g,g.training?'Practice: grab art, order Echo to Cover me, and bank it. Then plant an alarm on the practice rival.':'Job is live. The van leaves in 90 seconds.');}
function alarm(g:Game,p:Vec,source:string|null=null,attached:string|null=null){const id='n'+(++g.serial);g.noises.push({id,x:p.x,y:p.y,holder:null,expires:g.now+(attached?90000:6500),born:g.now,vx:0,vy:0,flight:0,kind:'alarm',source,attached});return id;}
export function sameCrew(a:{team:number},b:{team:number}){return a.team===b.team;}
export function crewScores(g:Game|View){return [...new Set(g.seats.map(s=>s.team))].sort().map(team=>({team,name:CREW_NAMES[team],bank:g.seats.filter(s=>s.team===team).reduce((n,s)=>n+s.bank,0)}));}
export const isDuel=(g:Game|View)=>g.crewMode==='duos'&&g.seats.length===2&&g.seats[0].team!==g.seats[1].team;
export function plateOpen(g:Game|View){return vaultReady(g)&&g.seats.some(s=>!s.escaped&&s.stun<=g.now&&distance(s,g.plate)<30);}
function capturable(g:Game|View,s:Thief,n:Noise){return !(isFlagship(g)&&n.source?.startsWith('emitter:'))&&!n.holder&&n.flight<=0&&!(n.thrownBy===s.id&&g.now-(n.thrownAt||0)<3000)&&distance(n,s)<(n.attached?90:115)&&sight(s,n,g.walls);}
export function stashSpot(g:Game|View,s:Thief){return hidingSpots(g).findIndex((p,i)=>distance(s,p)<45&&sight(s,p,g.walls)&&!g.loot.some(l=>l.stashedAt===i&&!l.banked));}
export function passTarget(g:Game|View,s:Thief,aim:Vec=s.aim){return g.seats.filter(b=>b.id!==s.id&&sameCrew(b,s)&&!b.hand&&!b.escaped&&b.stun<=g.now&&distance(b,s)<=220&&sight(s,b,g.walls)).sort((a,b)=>distance(a,aim)-distance(b,aim)||distance(a,s)-distance(b,s))[0];}
export function canReceiveArt(g:Game|View,from:Thief,to:Thief){return from.id!==to.id&&sameCrew(from,to)&&!to.hand&&!to.escaped&&to.stun<=g.now&&distance(from,to)<=220&&sight(from,to,g.walls)&&g.guards.every(h=>!guardActive(g,h)||distance(h,to)>45||!sight(h,to,g.walls));}
export function requestArtPass(g:Game,s:Thief){
 if(s.hand){event(g,'Free your hands before asking for art.');return;}
 const bot=g.seats.filter(b=>b.bot&&!b.escaped&&b.stun<=g.now&&g.loot.some(l=>l.holder===b.id)&&canReceiveArt(g,b,s)).sort((a,b)=>distance(a,s)-distance(b,s))[0];
 if(bot){action(g,bot,'throw:'+bot.hand,s);}else event(g,'PASS IT · Get within sight of an art-carrying teammate.');
}
export function emitterPosition(s:Sensor):Vec{return s.h>s.w?{x:s.x+s.w/2,y:s.y+Math.min(16,s.h/2)}:{x:s.x+Math.min(16,s.w/2),y:s.y+s.h/2};}
export function tripEmitter(g:Game,s:Sensor){
 if(s.cooldown>g.now)return false;s.cooldown=g.now+6000;s.screamingUntil=g.now+4000;
 const p=emitterPosition(s),id=alarm(g,p,'emitter:'+s.id),n=g.noises.find(n=>n.id===id)!;n.expires=s.screamingUntil;n.alerted=true;
 g.alert=Math.min(100,g.alert+3);g.alarmTip=true;event(g,'EMITTER SIREN · Noise stays at the wall for four seconds.','info',p);return true;
}
export function crossesBeam(a:Vec,b:Vec,r:Rect){let lo=0,hi=1;for(const [p,d,min,max] of [[a.x,b.x-a.x,r.x,r.x+r.w],[a.y,b.y-a.y,r.y,r.y+r.h]]){if(Math.abs(d)<1e-9){if(p<min||p>max)return false;}else{let t=(min-p)/d,u=(max-p)/d;if(t>u)[t,u]=[u,t];lo=Math.max(lo,t);hi=Math.min(hi,u);if(lo>hi)return false;}}return hi>=0&&lo<=1;}
export function emptyPost(g:Game|View,l:Loot){const h=g.guards.find(h=>h.sentryArt===l.id&&h.sentry);return !!h&&guardActive(g,h)&&distance(h,h.sentry!)>65&&!l.holder&&!l.banked&&!l.claimed;}
function catchArt(g:Game,l:Loot,s:Thief){l.flight=undefined;l.stashedAt=undefined;l.droppedAt=undefined;l.recoverAt=undefined;l.holder=s.id;s.hand=l.id;s.passUntil=g.now+1400;Object.assign(l,{x:s.x,y:s.y});hush(g,l);if(!l.quietUntil||l.quietUntil<=g.now)alarm(g,s,l.id,s.id);}
export function advanceArtFlights(g:Game){for(const l of g.loot){const f=l.flight;if(!f)continue;const t=Math.min(1,(g.now-f.at)/500),p={x:f.from.x+(f.to.x-f.from.x)*t,y:f.from.y+(f.to.y-f.from.y)*t};const last={x:l.x,y:l.y};let blocked=false,interceptor:Thief|undefined;const steps=Math.max(1,Math.ceil(distance(last,p)/5));for(let i=1;i<=steps;i++){const q={x:last.x+(p.x-last.x)*i/steps,y:last.y+(p.y-last.y)*i/steps};if(!clear(q,6,g.walls)){blocked=true;break;}l.x=q.x;l.y=q.y;interceptor=g.seats.find(r=>r.team!==f.team&&!r.hand&&!r.escaped&&r.stun<=g.now&&distance(r,q)<=30&&sight(r,q,g.walls));if(interceptor)break;}
 if(interceptor){catchArt(g,l,interceptor);event(g,interceptor.name+' intercepted '+l.name+'!','capture',interceptor);continue;}
 if(t<1&&!blocked)continue;
 const friend=!blocked&&g.seats.find(r=>r.id!==f.thrower&&r.team===f.team&&!r.hand&&!r.escaped&&r.stun<=g.now&&distance(r,l)<=30&&sight(r,l,g.walls));
 if(friend){catchArt(g,l,friend);event(g,friend.name+' caught the pass!','land',friend);}else{l.flight=undefined;l.droppedAt=g.now;l.recoverAt=g.now+5000;const quiet=!!l.quietUntil&&l.quietUntil>g.now;if(!quiet)alarm(g,l,l.id);event(g,'Pass missed. '+l.name+(quiet?' landed quietly.':' is sounding an alarm.'),'land',l);}
}}
export function openCrownExit(g:Game){
 const exit=g.arena?.crownExit;if(!exit||g.crownExitOpen)return;
 g.crownExitOpen=true;g.walls=g.walls.filter(w=>!(w.x===exit.x&&w.y===exit.y&&w.w===exit.w&&w.h===exit.h));
 guardPaths.delete(g);event(g,'Staff exit unlocked! Take the service shortcut to the loading bay.','honk',exit);
}
// Unavailable event loot never appears in the building or in shadow memory.
export const exhibitAvailable=(g:Game|View,l:Loot)=>!l.sealed&&(!(g.arena&&g.arena.capacity<6)||!['art9','art10'].includes(l.id));
export function interaction(g:Game|View,s:Thief):{label:string;target?:Vec;id?:string;kind:string}{
 if(s.escaped)return {label:'In van',kind:'none'};
 if(s.stun>g.now)return {label:'Tied up · free in '+Math.ceil((s.stun-g.now)/1000)+'s',kind:'none'};
 const friend=g.seats.find(p=>p.id!==s.id&&sameCrew(p,s)&&!p.escaped&&p.stun>g.now&&distance(p,s)<40&&sight(s,p,g.walls));
 if(friend)return {label:s.rescueId===friend.id?'Untying '+Math.min(100,Math.round((g.now-s.rescueAt)/12))+'%':'Untie '+friend.name,target:friend,id:friend.id,kind:'rescue'};
 if(s.hand){const niche=g.loot.some(l=>l.id===s.hand)?stashSpot(g,s):-1;if(niche>=0)return {label:'Stash art',target:hidingSpots(g)[niche],id:String(niche),kind:'stash'};return {label:g.noises.some(n=>n.id===s.hand)?'Aim + throw':'Carry to van',kind:'none'};}

 const n=g.noises.filter(n=>capturable(g,s,n)).sort((a,b)=>distance(a,s)-distance(b,s))[0];
 
 const l=g.loot.filter(l=>!l.holder&&!l.guardCarrier&&!l.flight&&!l.banked&&exhibitAvailable(g,l)&&distance(l,s)<55&&sight(s,l,g.walls)).sort((a,b)=>distance(a,s)-distance(b,s))[0];
 if(n&&(!l||distance(n,s)<distance(l,s)||isFlagship(g)&&l.droppedAt!==undefined&&n.source===l.id&&distance(n,s)<=distance(l,s)))return {label:n.attached?'Grab alarm':'Capture alarm',target:n,id:n.id,kind:'noise'};
 if(l&&isFlagship(g)&&l.value===1200&&!vaultReady(g))return {label:'Vault opens at 1:00',target:l,id:l.id,kind:'locked'};
 if(l)return {label:l.locked&&!plateOpen(g)?'Need plate held':'Grab '+l.name,target:l,id:l.id,kind:l.locked&&!plateOpen(g)?'locked':'loot'};
 return {label:'No target nearby',kind:'none'};
}
export function configure(g:Game,mode:CrewMode){if(g.phase!=='lobby')throw Error('Choose crews in the lobby.');if(mode==='duos'&&g.seats.length>4)mode='trios';g.crewMode=mode;const teams=mode==='coop'?1:2;g.seats.forEach((s,i)=>s.team=i%teams);}
export function fillCrews(g:Game){if(g.phase!=='lobby')throw Error('Fill crews before starting.');const teams=g.crewMode==='coop'?1:g.crewMode==='trios'?2:Math.max(2,...g.seats.map(s=>s.team+1));const size=g.crewMode==='trios'?3:g.crewMode==='duos'?2:Math.max(2,g.seats.length);for(let team=0;team<teams;team++)while(g.seats.filter(s=>s.team===team).length<size&&g.seats.length<6){const b=add(g,['Echo','Pip','Moss','Jinx','Vale'][g.seats.filter(s=>s.bot).length]||'Echo','bot',true);b.team=team;}}
function hush(g:Game,l:Loot){g.noises=g.noises.filter(n=>!(n.source===l.id&&n.attached));}
function drop(g:Game,s:Thief,captured=false){if(!s.hand)return;const l=g.loot.find(x=>x.id===s.hand),n=g.noises.find(x=>x.id===s.hand);if(l){l.holder=null;l.x=s.x;l.y=s.y;l.droppedAt=g.now;l.recoverAt=g.now+5000;event(g,CREW_NAMES[s.team]+' dropped '+l.name+' at '+roomName(l)+'!');const n=g.noises.find(n=>n.source===l.id&&n.attached);if(n){if(captured)hush(g,l);else{n.attached=null;n.expires=g.now+6500;n.x=s.x;n.y=s.y;}}if(captured)l.quietUntil=g.now+8000;}if(n){n.attached=null;n.thrownBy=s.id;n.thrownAt=g.now;n.heardBy=[];n.ignoredBy=[];n.holder=null;n.x=s.x;n.y=s.y;n.expires=g.now+5000;n.born=g.now;}s.hand=null;}
export function action(g:Game,s:Thief,type:string,aim?:Vec){if(g.phase!=='playing'||s.stun>g.now)return;
 // A queued pass must never throw a different item acquired before execution.
 if(type.startsWith('throw:')){if(s.hand!==type.slice(6))return;type='throw';}
 if(type==='extract'&&s.escaped){if(g.boardingAt||g.end-g.now<=15000){event(g,'LAST CALL. Stay aboard: the van is departing.');return;}const home=vanFor(g,s.team);s.escaped=false;s.escapedAt=undefined;s.x=home.x+(home.x<480?30:-30);s.y=home.y;s.safe=g.now+3000;s.dx=s.dy=0;event(g,s.name+' hopped out. Banked art stays secure.','rescue',s);return;}
 if(s.escaped)return;
 if(type==='extract'){if(!homeSafe(g,s)){event(g,'Return to your own crew’s getaway zone first.');return;}const held=g.loot.find(l=>l.id===s.hand);if(!g.training&&!s.bot&&!held&&g.end-g.now>60000&&g.seats.filter(p=>sameCrew(p,s)).every(p=>p.bank===0)){if((s.emptyBoardUntil||0)<=g.now){s.emptyBoardUntil=g.now+4000;event(g,'Leave empty-handed? Press R again','info',s);return;}}s.emptyBoardUntil=undefined;if(held){hush(g,held);held.banked=true;held.bankedBy=s.team;held.holder=null;s.hand=null;s.bank+=held.value;g.total+=held.value;}drop(g,s);g.noises=g.noises.filter(n=>n.attached!==s.id);s.escaped=true;s.escapedAt=g.now;s.dx=s.dy=0;event(g,s.name+' is in the van.','bank',s);return;}
 if(type==='pass-request'){requestArtPass(g,s);return;}
 if(type==='help'||type.startsWith('help:')){const crew=g.seats.filter(x=>x.bot&&sameCrew(x,s));const modes=['auto','follow','cover','fetch','plate','van'] as const;const requested=type.split(':')[1];const mode=modes.includes(requested as typeof modes[number])?requested as typeof modes[number]:modes[(modes.indexOf(crew[0]?.mode||'follow')+1)%modes.length];crew.forEach(b=>b.mode=mode);event(g,CREW_NAMES[s.team]+': '+({auto:'Auto: watching your situation.',cover:'Covering your alarm.',fetch:'Fetching nearby art.',follow:'Following. Alarms are yours.',plate:'Holding the jackpot plate.',van:'Get to the van.'}[mode]));return;}
 if(g.now<s.cooldown)return;s.cooldown=g.now+260;
 if(type==='drop'){drop(g,s);event(g,s.name+' put it down.','info',s);return;}
 if(type==='grab'){
  const target=interaction(g,s);
  if(target.kind==='rescue'){if(s.rescueId!==target.id){s.rescueId=target.id!;s.rescueAt=g.now;const guard=g.guards.find(h=>h.id===g.seats.find(p=>p.id===target.id)?.capturedBy);if(guard)guard.retreatUntil=Math.max(guard.retreatUntil||0,g.now+2500);event(g,'Stay beside '+g.seats.find(p=>p.id===target.id)!.name+' for 1.2s to rescue.');}return;}
  if(target.kind==='stash'){const l=g.loot.find(l=>l.id===s.hand)!;l.stashedAt=Number(target.id);Object.assign(l,hidingSpots(g)[l.stashedAt]);l.holder=null;l.droppedAt=undefined;l.recoverAt=undefined;l.quietUntil=0;s.hand=null;g.noises=g.noises.filter(n=>n.source!==l.id||!!n.holder);g.guards.forEach(h=>{if(h.returnArt===l.id)h.returnArt=undefined;});event(g,s.name+' stashed '+l.name+'. Anyone can take it.','info',l);return;}
  if(target.kind==='noise'){const n=g.noises.find(n=>n.id===target.id)!;if(n.attached){const l=g.loot.find(l=>l.id===n.source);if(l)l.quietUntil=g.now+8000;n.attached=null;}else if(n.source){const l=g.loot.find(l=>l.id===n.source);if(l)l.quietUntil=g.now+8000;}n.holder=s.id;n.flight=0;n.vx=n.vy=0;n.kind='capsule';n.expires=g.now+10000;s.hand=n.id;if(!n.counted){s.captures++;n.counted=true;}s.windup=g.now+650;event(g,s.name+' grabbed the alarm. Aim, then throw!','capture',s);return;}
  if(target.kind==='loot'){const l=g.loot.find(l=>l.id===target.id)!;if(isFlagship(g)&&l.value===1200&&!vaultReady(g))return;if(l.stashedAt!==undefined){l.stashedAt=undefined;l.quietUntil=0;}l.holder=s.id;l.claimed=true;if(l.value===1200)openCrownExit(g);l.locked=false;l.droppedAt=undefined;l.recoverAt=undefined;s.hand=l.id;if(!l.quietUntil||l.quietUntil<=g.now){hush(g,l);alarm(g,s,l.id,s.id);}event(g,isFlagship(g)&&l.value===1200?'CROWN TAKEN · Your teammate can grab its alarm. Get it to the van.':'The art sets off an alarm! G drops it. An empty-handed partner can grab its alarm.','info',s);return;}
  if(target.kind==='locked')event(g,!vaultReady(g)?'Vault time-lock: opens when 1:00 remains.':'The Crown needs a teammate on the Security plate.');
  return;
 }
 if(type==='throw'&&s.hand){let target=aim||s.aim;const carrier=g.seats.find(r=>r.team!==s.team&&!r.escaped&&!homeSafe(g,r)&&distance(r,target)<40&&g.loot.some(l=>l.holder===r.id));if(carrier){const lead=Math.min(.6,distance(s,carrier)/430);target={x:carrier.x+carrier.dx*CARRY_SPEED*lead,y:carrier.y+carrier.dy*CARRY_SPEED*lead};}const dx=target.x-s.x,dy=target.y-s.y,len=Math.hypot(dx,dy)||1;const n=g.noises.find(n=>n.id===s.hand),l=g.loot.find(l=>l.id===s.hand);s.hand=null;
  if(n){n.attached=null;n.thrownBy=s.id;n.thrownAt=g.now;n.heardBy=[];n.ignoredBy=[];n.holder=null;n.x=s.x;n.y=s.y;n.vx=dx/len*430;n.vy=dy/len*430;n.flight=Math.min(.6,len/430);n.born=g.now;n.expires=g.now+6500;event(g,s.name+' threw a distraction.','throw',s);}
  if(l){const friend=passTarget(g,s,aim||s.aim);if(!friend){s.hand=l.id;event(g,'No teammate in passing range. G drops art.');return;}hush(g,l);l.holder=null;l.claimed=true;l.stashedAt=undefined;l.droppedAt=undefined;l.recoverAt=undefined;l.x=s.x;l.y=s.y;l.flight={from:{x:s.x,y:s.y},to:{x:friend.x,y:friend.y},at:g.now,team:s.team,thrower:s.id};event(g,s.name+' passed '+l.name+' toward '+friend.name+'.','throw',s);}

 }
}
export function input(g:Game,s:Thief,a:{seq?:number;dx?:number;dy?:number;aim?:Vec;action?:string;sneak?:boolean}){if(!Number.isSafeInteger(a.seq)||a.seq!<=s.lastSeq)return;s.lastSeq=a.seq!;s.inputAt=g.now;s.sneak=!!a.sneak;s.dx=Math.max(-1,Math.min(1,Number(a.dx)||0));s.dy=Math.max(-1,Math.min(1,Number(a.dy)||0));if(a.aim&&Number.isFinite(a.aim.x)&&Number.isFinite(a.aim.y))s.aim={x:Math.max(24,Math.min(936,a.aim.x)),y:Math.max(24,Math.min(576,a.aim.y))};if(a.action)action(g,s,a.action);}
// Small grid pathfinder: identical collision geometry for humans, guards and bots.
function corridor(a:Vec,b:Vec,walls:Rect[]=WALLS){const n=Math.max(1,Math.ceil(distance(a,b)/5));return sampledClear(a,b,13,n,1,n,walls);}
export function steer(a:Vec,b:Vec,walls:Rect[]=WALLS):Vec{
 const same=(a:Rect,b:Rect)=>a.x===b.x&&a.y===b.y&&a.w===b.w&&a.h===b.h;const arena=RIVAL_LAYOUTS.find(m=>walls.includes(m.walls[4])||m.walls.every(r=>walls.some(w=>same(w,r))));
 if(arena&&a.x>480){const transform=arena.symmetry==='rotate'?rotatePoint:mirrorPoint,rectTransform=arena.symmetry==='rotate'?rotateRect:mirrorRect;const normalized=walls===arena.walls?walls:[...arena.walls,...walls.filter(w=>!arena.walls.some(r=>same(w,r))).map(rectTransform)];return transform(steerRaw(transform(a),transform(b),normalized));}
 return steerRaw(a,b,walls);
}
function steerRaw(a:Vec,b:Vec,walls:Rect[]=WALLS):Vec{if(corridor(a,b,walls))return b;const size=20,cols=48,rows=30;const cell=(p:Vec)=>{const cx=Math.min(cols-2,Math.max(1,Math.floor(p.x/size))),cy=Math.min(rows-2,Math.max(1,Math.floor(p.y/size)));const options:Vec[]=[];for(let y=cy-1;y<=cy+1;y++)for(let x=cx-1;x<=cx+1;x++){const q={x:x*size+10,y:y*size+10};if(x>0&&x<cols-1&&y>0&&y<rows-1&&clear(q,13,walls)&&corridor(p,q,walls))options.push({x,y});}if(!options.length)for(let r=2;r<=3&&!options.length;r++)for(let y=cy-r;y<=cy+r;y++)for(let x=cx-r;x<=cx+r;x++){const q={x:x*size+10,y:y*size+10};if(x>0&&x<cols-1&&y>0&&y<rows-1&&clear(q,13,walls)&&corridor(p,q,walls))options.push({x,y});}return options.sort((a,b)=>distance(p,{x:a.x*size+10,y:a.y*size+10})-distance(p,{x:b.x*size+10,y:b.y*size+10}))[0]||{x:cx,y:cy};};const start=cell(a),goal=cell(b),key=(x:number,y:number)=>y*cols+x;
 // Budget guard route requests consistently, including cache hits, so cache
 // warmth from another match cannot alter authoritative movement.
 if(guardPathContext&&!guardPathPermit(guardPathContext.g,guardPathContext.h))return a;
 const graph=navigationGrid(walls),routeKey=key(start.x,start.y)+':'+key(goal.x,goal.y);let path=graph.paths.get(routeKey);
 if(!path){const q=[key(start.x,start.y)],prev=new Map<number,number>();prev.set(q[0],-1);let end=-1;
  for(let i=0;i<q.length;i++){const v=q[i],x=v%cols,y=Math.floor(v/cols);if(x===goal.x&&y===goal.y){end=v;break;}for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,k=key(nx,ny);if(nx<1||nx>=cols-1||ny<1||ny>=rows-1||prev.has(k)||!graph.clear[k])continue;prev.set(k,v);q.push(k);}}
  path=[];while(end!==-1){path.push({x:(end%cols)*size+10,y:Math.floor(end/cols)*size+10});end=prev.get(end)!;}
  if(graph.paths.size>=2048)graph.paths.delete(graph.paths.keys().next().value!);graph.paths.set(routeKey,path);
 }
 if(guardPathContext){const c=guardPaths.get(guardPathContext.g);if(c)c.queue=c.queue.filter(id=>id!==guardPathContext!.h.id);}
 return path.find(p=>corridor(a,p,walls))||a;
}
// Geometry-only cache. No guard, danger, or decision result is cached here;
// routes retain the exact BFS neighbour order and final line-of-sight checks.
const navigationGrids=new Map<string,{clear:Uint8Array;edges?:Uint8Array;paths:Map<string,Vec[]>}>();
function navigationGrid(walls:Rect[]){
 const key=walls.map(w=>`${w.x},${w.y},${w.w},${w.h}`).join(';');let grid=navigationGrids.get(key);if(grid)return grid;
 grid={clear:new Uint8Array(48*30),paths:new Map()};for(let y=1;y<29;y++)for(let x=1;x<47;x++)grid.clear[y*48+x]=clear({x:x*20+10,y:y*20+10},13,walls)?1:0;
 if(navigationGrids.size>=32)navigationGrids.delete(navigationGrids.keys().next().value!);navigationGrids.set(key,grid);return grid;
}
/** Geometry-only work belongs in the briefing, not the first authoritative tick. */
function navigationEdges(walls:Rect[]){
 const graph=navigationGrid(walls),cols=48,rows=30,point=(k:number)=>({x:k%cols*20+10,y:Math.floor(k/cols)*20+10});
 if(!graph.edges){const edges=new Uint8Array(cols*rows);for(let k=cols;k<cols*(rows-1);k++)if(graph.clear[k])for(const [i,delta] of [1,-1,cols,-cols].entries()){const n=k+delta;if(n>=cols&&n<cols*(rows-1)&&n%cols>=1&&n%cols<cols-1&&graph.clear[n]&&corridor(point(k),point(n),walls))edges[k]|=1<<i;}graph.edges=edges;}
 return {...graph,edges:graph.edges};
}
export function botSneakNearSensor(g:Game,s:Thief,target:Vec){const next=steer(s,target,thiefWalls(g,s));return sensors(g).some(z=>{const closest={x:Math.max(z.x,Math.min(z.x+z.w,s.x)),y:Math.max(z.y,Math.min(z.y+z.h,s.y))};const centre={x:z.x+z.w/2,y:z.y+z.h/2};return distance(s,closest)<50&&(inside(s,{x:z.x-14,y:z.y-14,w:z.w+28,h:z.h+28})||(next.x-s.x)*(centre.x-s.x)+(next.y-s.y)*(centre.y-s.y)>0);});}
type GuardPathCache={at:number;used:number;queue:string[]};
const guardPaths=new WeakMap<Game,GuardPathCache>();
let guardPathContext:{g:Game;h:Guard}|undefined;
export function guardPathStats(g:Game){const c=guardPaths.get(g);return {used:c?.at===g.now?c.used:0,queued:c?.queue.length||0};}
function guardPathPermit(g:Game,h:Guard){
 let c=guardPaths.get(g);if(!c){c={at:g.now,used:0,queue:[]};guardPaths.set(g,c);}
 if(c.at!==g.now){c.at=g.now;c.used=0;c.queue=c.queue.filter(id=>g.guards.some(q=>q.id===id&&guardActive(g,q)&&distance(q,q.target)>6));}
 if(!c.queue.includes(h.id))c.queue.push(h.id);
 if(c.used>=2||c.queue[0]!==h.id)return false;
 c.used++;c.queue.shift();return true;
}
function guardSteer(g:Game,h:Guard,target:Vec,walls:Rect[]){
 if(corridor(h,target,walls)){const c=guardPaths.get(g);if(c)c.queue=c.queue.filter(id=>id!==h.id);return target;}
 guardPathContext={g,h};try{return steer(h,target,walls);}finally{guardPathContext=undefined;}
}
function walk(g:Game,p:Vec,target:Vec,dt:number,speed:number){const seat=g.seats.find(s=>s===p);if(seat){const art=g.loot.find(l=>l.holder===seat.id);if(art){speed=Math.min(speed,carrySpeed(art.value,g));if(seat.bot&&!g.seats.some(p=>p.team===seat.team&&!p.bot))speed*=difficultyOf(g)==='rookie'?.6:difficultyOf(g)==='pro'?(isFlagship(g)?1.45:1.1):isFlagship(g)&&difficultyOf(g)==='normal'?1.1:1;}if(seat.bot&&!art)seat.sneak=botSneakNearSensor(g,seat,target);if(seat.sneak)speed*=.55;}const walls=g.guards.includes(p as Guard)?[...g.walls,...zones(g)]:thiefWalls(g,p as Thief);const next=g.guards.includes(p as Guard)?guardSteer(g,p as Guard,target,walls):steer(p,target,walls);const d=distance(p,next);if(seat?.bot&&d>3){const heading={x:(next.x-p.x)/d,y:(next.y-p.y)/d},reverse=seat.botHeading&&seat.botHeading.x*heading.x+seat.botHeading.y*heading.y<-.5;if(reverse&&g.now-(seat.turnAt??-Infinity)<360&&!g.guards.some(h=>guardActive(g,h)&&(h.retreatUntil||0)<=g.now&&distance(h,seat)<40)){seat.dx=seat.dy=0;return;}if(reverse)seat.turnAt=g.now;seat.botHeading=heading;}if(g.seats.includes(p as Thief)){(p as Thief).dx=d>3?(next.x-p.x)/d:0;(p as Thief).dy=d>3?(next.y-p.y)/d:0;}if(d>(g.guards.includes(p as Guard)?.05:3))move(p,(next.x-p.x)/d,(next.y-p.y)/d,dt,Math.min(speed,d/dt),walls);}
function decoy(g:Game,s:Thief):Vec{const crew=g.seats.filter(p=>sameCrew(p,s)&&!p.escaped);const rivals=g.seats.filter(p=>!sameCrew(p,s)&&!p.escaped);const local=isFlagship(g)?[120,180,240].flatMap(r=>Array.from({length:16},(_,i)=>({x:s.x+Math.cos(i*Math.PI/8)*r,y:s.y+Math.sin(i*Math.PI/8)*r}))):[];const pursuers=isFlagship(g)?g.guards.filter(h=>guardActive(g,h)&&h.mode==='chase'&&h.victim===s.id&&distance(h,s)<240):[];const candidates=[...local,{x:70,y:70},{x:250,y:70},{x:360,y:60},{x:570,y:350},{x:690,y:70},{x:890,y:520},...rivals.map(p=>({x:p.x,y:p.y}))].filter(p=>(!isFlagship(g)||clear(p,8,g.walls))&&distance(p,vanFor(g,s.team))>100&&sight(s,p,g.walls)&&distance(s,p)>100);return candidates.sort((a,b)=>{const score=(p:Vec)=>Math.min(...crew.map(c=>distance(c,p)))+pursuers.reduce((v,h)=>v+(distance(h,p)<180?350:0),0)+rivals.reduce((v,r)=>v+(distance(r,p)<100?(r.hand?220:120):0),0);return score(b)-score(a);})[0]||{x:Math.min(900,s.x+220),y:Math.max(50,s.y-180)};}
export function rescueApproachUnsafe(g:Game,s:Thief,captive:Thief,h:Guard){
 if((h.retreatUntil||0)>g.now)return false;
 if(!['auto','follow'].includes(s.mode)||h.id!==captive.capturedBy)return false;
 const near=Math.min(distance(h,captive),distance(h,s))<=40;
 const angle=Math.atan2(s.y-h.y,s.x-h.x)-h.angle;
 return near&&Math.cos(angle)>.45&&sight(h,s,g.walls);
}
/** Forecast posted guards at their actual post, including their scanning arc. */
function forecastPost(g:Game,h:Guard,now:number){
 if(h.mode!=='patrol'||!h.sentry||(h.sentryUntil||0)>now)return false;
 h.target=h.sentry;
 if(distance(h,h.sentry)>=6)return false;
 const exhibit=g.loot.find(l=>l.id===h.sentryArt);
 h.angle=(h.sentryFacing??(exhibit?Math.atan2(exhibit.y-h.y,exhibit.x-h.x):Math.PI/2))+Math.sin((now-g.start)/1600)*.6;
 return true;
}
function carryingRescueExposed(g:Game,s:Thief,captive:Thief){
 // Check the loaded approach, channel and escape. A retreating captor is safe
 // until its retreat actually ends; an empty-handed rescuer uses the immediate window.
 const art=g.loot.find(l=>l.holder===s.id);if(!art)return false;
 const speed=carrySpeed(art.value,g),traveller={x:s.x,y:s.y},patrols=g.guards.map(h=>({...h,target:{...h.target}}));
 const home=vanFor(g,s.team),walls=thiefWalls(g,s),guardWalls=[...g.walls,...zones(g)];let channel=0;
 for(let i=1;i<=35;i++){
  const now=g.now+i*200,frame={...g,now};
  const target=channel>=1200?home:captive;
  if(channel<1200&&distance(traveller,captive)<35)channel+=200;
  else{const n=steer(traveller,target,walls),d=distance(traveller,n);if(d>1)move(traveller,(n.x-traveller.x)/d,(n.y-traveller.y)/d,.2,Math.min(speed,d/.2),walls);}
  for(const h of patrols){
   if(forecastPost(g,h,now)){if(botDanger(frame,s,h,traveller))return true;continue;}
   const n=steer(h,h.target,guardWalls),d=distance(h,n),old={x:h.x,y:h.y};
   if(d>1)move(h,(n.x-h.x)/d,(n.y-h.y)/d,.2,Math.min((h.retreatUntil||0)>now?120:62*tuning(g).speed,d/.2),guardWalls);
   if(distance(old,h)>.1)h.angle=Math.atan2(h.y-old.y,h.x-old.x);
   if(!h.sentry&&distance(h,h.target)<16){h.way=(h.way+1)%h.route.length;h.target=h.route[h.way];}
   if((h.retreatUntil||0)<=now&&botDanger(frame,s,h,traveller))return true;
  }
  if(homeSafe(g,{...traveller,team:s.team}))return false;
 }
 return false;
}
function crewCall(g:Game,s:Thief,line:string){const text=s.name.toUpperCase()+': '+line;if(g.events.some(e=>e.text===text&&g.now-e.at<10000))return;event(g,text);g.events[g.events.length-1].team=s.team;}
function botCall(g:Game,s:Thief,task:string,line:string){s.task=task;if(s.announcedTask===task)return;if(s.taskAt!==undefined&&g.now-s.taskAt<2500)return;s.announcedTask=task;s.taskAt=g.now;crewCall(g,s,line);}
export function approachExposed(g:Game,s:Vec,target:Vec){
 const active=g.guards.filter(h=>guardActive(g,h)&&(h.retreatUntil||0)<=g.now);if(!active.length)return false;
 const p={x:s.x,y:s.y};for(let i=0;i<35;i++){
  if(active.some(h=>{const d=distance(h,p),a=Math.atan2(p.y-h.y,p.x-h.x)-h.angle;return d<(blackoutActive(g)?60:180*tuning(g).sight)&&(d<45||Math.cos(a)>.79)&&sight(h,p,g.walls);}))return true;
  if(distance(p,target)<25)return false;const n=steer(p,target,g.walls),d=distance(p,n);if(d<1)return true;move(p,(n.x-p.x)/d,(n.y-p.y)/d,.2,Math.min(150,d/.2),g.walls);
 }return distance(p,target)>35;
}
const chaseSightMode={mode:'chase'} as const;
/** Current sight is dangerous; retreating guards are deliberately non-threatening. */
export function guardSees(g:Game,h:Guard,p:Vec,includeRetreat=false){if(!guardActive(g,h)||!includeRetreat&&(h.retreatUntil||0)>g.now)return false;const d=distance(h,p);if(d>=279)return false;const a=Math.atan2(p.y-h.y,p.x-h.x)-h.angle;return d<(h.luredUntil&&h.luredUntil>g.now?60:blackoutActive(g)?60:180*guardSight(g,chaseSightMode)+45)&&(d<60||Math.cos(a)>Math.cos(.8))&&sight(h,p,g.walls);}
function botDanger(g:Game,s:Thief,h:Guard,p:Vec,includeRetreat=false){
 if(!guardActive(g,h)||!includeRetreat&&(h.retreatUntil||0)>g.now)return false;
 const precise=isFlagship(g)&&difficultyOf(g)==='pro'&&!g.seats.some(c=>sameCrew(c,s)&&!c.bot);
 const angle=Math.atan2(p.y-h.y,p.x-h.x)-h.angle;
 const inCone=!precise||distance(h,p)<(h.luredUntil&&h.luredUntil>g.now?60:blackoutActive(g)?60:180*guardSight(g,h)+10)&&(distance(h,p)<50||Math.cos(angle)>Math.cos(.7));
 if(inCone&&guardSees(g,h,p,includeRetreat))return true;
 const art=g.loot.find(l=>l.holder===s.id);if(!art)return false;const noise=g.noises.find(n=>n.attached===s.id);
 const audible=art&&(!art.quietUntil||art.quietUntil<=g.now)&&g.now-(noise?.heardAt?.[h.id]??-Infinity)>8000;
 // Hearing through a wall attracts pursuit, but is not an immediate capture corridor.
 // Forecast sight still protects blind corners; solid cover must remain a viable route.
 return !!audible&&distance(h,p)<(alarmHearing(g)+20)&&(!isFlagship(g)||sight(h,p,g.walls));
}
export function coverPoint(g:Game,s:Thief,captor?:Guard):Vec{
 if(!captor)return {x:s.x,y:s.y};
 const candidates:Vec[]=[];for(const r of [35,60,90,120])for(let i=0;i<12;i++){const p={x:s.x+Math.cos(i*Math.PI/6)*r,y:s.y+Math.sin(i*Math.PI/6)*r};if(clear(p,13,thiefWalls(g,s))&&corridor(s,p,thiefWalls(g,s)))candidates.push(p);}
 return candidates.sort((a,b)=>{const score=(p:Vec)=>distance(s,p)+(sight(captor,p,g.walls)?120:0)+(botDanger(g,s,captor,p,true)?500:0)+g.guards.filter(h=>h!==captor&&botDanger(g,s,h,p)).length*1000+g.guards.filter(h=>(h.retreatUntil||0)<=g.now+1200).reduce((n,h)=>n+(distance(p,h.route[h.way]||h.target)<80?300:0),0);return score(a)-score(b);})[0]||{x:s.x,y:s.y};
}
function moveToCover(g:Game,s:Thief,guard:Guard,dt:number,speed:number){
 // Commit briefly to one cover point instead of choosing the opposite side every frame.
 if(!s.avoidPoint||g.now>=(s.avoidUntil||0)){s.avoidPoint=coverPoint(g,s,guard);s.avoidUntil=g.now+400;}
 if(distance(s,s.avoidPoint)>8)guardedWalk(g,s,s.avoidPoint,dt,speed,false);else{s.dx=0;s.dy=0;}
}
const patrolForecastMemo=new WeakMap<Game,{bucket:number;guards:Guard[]}>();
function planningGuards(g:Game,rescue=false){
 if(rescue)return g.guards.filter(h=>guardActive(g,h)&&(h.retreatUntil||0)<=g.now);
 const active=g.guards.filter(h=>guardActive(g,h)&&(h.retreatUntil||0)<=g.now+(rescue?0:400));
 const bucket=Math.floor(g.now/200);let forecast=patrolForecastMemo.get(g);
 if(!forecast||forecast.bucket!==bucket){
  const walls=[...g.walls,...zones(g)];const guards=g.guards.filter(h=>guardActive(g,h)).map(original=>{
   const h={...original,target:{...original.target}};
   for(let i=0;i<2;i++){if(forecastPost(g,h,g.now+(i+1)*200))continue;const n=steer(h,h.target,walls),d=distance(h,n),old={x:h.x,y:h.y};if(d>1)move(h,(n.x-h.x)/d,(n.y-h.y)/d,.2,Math.min((h.mode==='patrol'?62:h.mode==='chase'?135:103)*guardSpeed(g,h.mode),d/.2),walls);if(distance(old,h)>.1)h.angle=Math.atan2(h.y-old.y,h.x-old.x);if(h.mode==='patrol'&&(!h.sentry||(h.sentryUntil||0)>g.now)&&distance(h,h.target)<16){h.way=(h.way+1)%h.route.length;h.target=h.route[h.way];}}
   return h;
  });forecast={bucket,guards};patrolForecastMemo.set(g,forecast);
 }
 return [...active,...forecast.guards.filter(h=>(h.retreatUntil||0)<=g.now+(rescue?0:400))];
}
type RouteResult={next:Vec;exposed:boolean;path:Vec[]};
const routeMemo=new WeakMap<Game,{bucket:string;routes:Map<string,RouteResult>;risks:Map<string,number>}>();
export function botRoute(g:Game,s:Thief,target:Vec):RouteResult{
 const walls=thiefWalls(g,s),rescuing=g.seats.some(p=>p.stun>g.now&&distance(p,target)<1),active=planningGuards(g,rescuing);
 const carrying=g.loot.some(l=>l.holder===s.id);const laserRisk=(p:Vec)=>carrying&&sensors(g).some(z=>z.cooldown<=g.now&&inside(p,{x:z.x-16,y:z.y-16,w:z.w+32,h:z.h+32}))?180:0;
 const direct=()=>({next:steer(s,target,walls),exposed:false,path:[{x:s.x,y:s.y},target]});if(!active.length&&!carrying)return direct();
 const seen=(p:Vec)=>active.some(h=>botDanger(g,s,h,p,true));
 const lineSafe=(a:Vec,b:Vec)=>{const n=Math.max(1,Math.ceil(distance(a,b)/20));for(let i=1;i<=n;i++)if(seen({x:a.x+(b.x-a.x)*i/n,y:a.y+(b.y-a.y)*i/n}))return false;return true;};
 const upcoming=g.guards.filter(h=>(h.retreatUntil||0)<=g.now+1200);const wayRisk=(p:Vec)=>laserRisk(p)>0||upcoming.some(h=>distance(p,h.route[h.way]||h.target)<75);
 if(corridor(s,target,walls)&&lineSafe(s,target)&&!Array.from({length:Math.max(1,Math.ceil(distance(s,target)/30))},(_,i)=>({x:s.x+(target.x-s.x)*(i+1)/Math.max(1,Math.ceil(distance(s,target)/30)),y:s.y+(target.y-s.y)*(i+1)/Math.max(1,Math.ceil(distance(s,target)/30))})).some(wayRisk))return {next:target,exposed:false,path:[s,target]};
 const bucket=Math.floor(g.now/200)+':'+active.map(h=>h.id+':'+(h.retreatUntil||0)).join(',');let cache=routeMemo.get(g);if(!cache||cache.bucket!==bucket){cache={bucket,routes:new Map(),risks:new Map()};routeMemo.set(g,cache);}
 const size=20,cols=48,rows=30,point=(k:number)=>({x:k%cols*size+10,y:Math.floor(k/cols)*size+10});
 const nearest=(p:Vec)=>{const cx=Math.floor(p.x/size),cy=Math.floor(p.y/size),options:number[]=[];for(let y=cy-1;y<=cy+1;y++)for(let x=cx-1;x<=cx+1;x++){const k=y*cols+x;if(x>0&&x<cols-1&&y>0&&y<rows-1&&clear(point(k),13,walls)&&corridor(p,point(k),walls))options.push(k);}return options.sort((a,b)=>distance(p,point(a))-distance(p,point(b)))[0];};
 const start=nearest(s),goal=nearest(target);if(start===undefined||goal===undefined)return {next:s,exposed:true,path:[]};
 const key=`${s.team}:${s.hand||"empty"}:${start}:${goal}`;const saved=cache.routes.get(key);if(saved&&distance(s,saved.next)>8)return saved;
 const risk=(k:number)=>{const riskKey=(s.hand||"empty")+":"+k;let cost=cache!.risks.get(riskKey);if(cost===undefined){const p=point(k);cost=(seen(p)?260:0)+laserRisk(p)+upcoming.reduce((n,h)=>n+(distance(p,h.route[h.way]||h.target)<75?30:0),0);cache!.risks.set(riskKey,cost);}return cost;};
 const graph=navigationEdges(walls);
 const open=new RouteQueue(cols*rows),cost=new Float64Array(cols*rows).fill(Infinity),prev=new Int32Array(cols*rows).fill(-1),closed=new Uint8Array(cols*rows),heuristic=new Float64Array(cols*rows).fill(-1);
 const estimate=(k:number)=>heuristic[k]<0?(heuristic[k]=distance(point(k),target)):heuristic[k];
 cost[start]=0;open.decrease(start,estimate(start));let end=-1;
 while(open.length){const k=open.pop();closed[k]=1;if(k===goal){end=k;break;}for(const [i,delta] of [1,-1,cols,-cols].entries()){const n=k+delta;if(!(graph.edges[k]&(1<<i))||closed[n])continue;const c=cost[k]+20+risk(n);if(c<cost[n]){cost[n]=c;prev[n]=k;open.decrease(n,c+estimate(n));}}}
 if(end<0)return {next:s,exposed:true,path:[]};const nodes:number[]=[end];while(nodes[0]!==start)nodes.unshift(prev[nodes[0]]);const path=nodes.map(point);path.push(target);
 let next=path.length>1&&corridor(s,path[1],walls)?path[1]:path[0];
 const waypointCost=(p:Vec)=>laserRisk(p)+upcoming.reduce((n,h)=>n+(distance(p,h.route[h.way]||h.target)<75?30:0),0);
 for(let i=path.length-1;i>0;i--){
  if(!corridor(s,path[i],walls)||!lineSafe(s,path[i]))continue;
  const d=distance(s,path[i]),n=Math.max(1,Math.ceil(d/20));let shortcut=d;
  for(let j=1;j<=n;j++)shortcut+=waypointCost({x:s.x+(path[i].x-s.x)*j/n,y:s.y+(path[i].y-s.y)*j/n})*d/n/20;
  const planned=i*20+path.slice(1,i+1).reduce((sum,p)=>sum+waypointCost(p),0);
  if(shortcut<=planned+5){next=path[i];break;}
 }

 // A bot already in danger may leave it; otherwise wait before entering a cone.
 const exposed=!lineSafe(s,next)||path.slice(1).some(p=>seen(p));
 const result={next,exposed,path};cache.routes.set(key,result);return result;
}
function guardedWalk(g:Game,s:Thief,target:Vec,dt:number,speed:number,allowCover=true,interceptGuard?:string){
 // Spend the existing release protection making progress instead of waiting behind a cone.
 if(isFlagship(g)&&s.safe-g.now>500){const next=steer(s,target,thiefWalls(g,s));if(distance(s,next)/speed*1000<s.safe-g.now-300){walk(g,s,target,dt,speed);return;}}

 // Cover may intentionally expose itself to one pursuer, never to another patrol.
 if(interceptGuard){const h=g.guards.find(h=>h.id===interceptGuard),carrier=h&&g.seats.find(p=>p.id===h.victim&&sameCrew(p,s)&&g.loot.some(l=>l.holder===p.id));
  const next={x:s.x+(target.x-s.x)*Math.min(1,speed*dt/(distance(s,target)||1)),y:s.y+(target.y-s.y)*Math.min(1,speed*dt/(distance(s,target)||1))};
  if(carrier&&h&&h.mode==='chase'&&['auto','cover'].includes(s.mode)&&distance(h,carrier)<220&&distance(next,h)>35&&corridor(s,target,thiefWalls(g,s))&&g.guards.filter(o=>o!==h&&guardActive(g,o)).every(o=>!guardSees(g,o,next))){walk(g,s,target,dt,speed);return;}
 }
 const route=botRoute(g,s,target),guards=planningGuards(g,g.seats.some(c=>c.stun>g.now&&distance(c,target)<1));
 // Every movement decision uses the same planner, including short rejoin/cover moves.
 // A thief already exposed may escape, but never enter a new cone or approach its threat.
 const safeSegment=(next:Vec)=>{const n=Math.max(1,Math.ceil(distance(s,next)/10));
  return guards.every(h=>{const already=botDanger(g,s,h,s,true);let previous=distance(h,s);
   for(let i=1;i<=n;i++){const p={x:s.x+(next.x-s.x)*i/n,y:s.y+(next.y-s.y)*i/n};if(botDanger(g,s,h,p,true)&&(!already||distance(h,p)<previous-.1))return false;previous=distance(h,p);}return true;});};
 let next=route.next;
 // A noisy Crown carrier must keep escaping an active pursuit. The weighted
 // route still chooses walls/corners; reject immediate steps into grabbing range.
 if(g.loot.some(l=>l.holder===s.id&&l.value===1200)&&g.guards.some(h=>guardActive(g,h)&&h.mode==='chase'&&h.victim===s.id)){
  const d=distance(s,next)||1,step={x:s.x+(next.x-s.x)/d*speed*dt,y:s.y+(next.y-s.y)/d*speed*dt};
  if(corridor(s,next,thiefWalls(g,s))&&g.guards.filter(h=>guardActive(g,h)).every(h=>distance(h,step)>70||distance(h,step)>distance(h,s))){walk(g,s,next,dt,speed);return;}
 }
 // Weighted paths can start inside a cone; use a clear escape toward cover when that
 // first grid edge approaches the guard. This still passes the same visibility gate.
 if(!allowCover&&corridor(s,target,thiefWalls(g,s))&&safeSegment(target))next=target;
 const blocked=route.path.length===0||!safeSegment(next);
 if(blocked){s.dx=0;s.dy=0;
  // A stale job may take a measured exposure risk, never a blind step into grab range
  // or a rescue/rejoin cone. Forecast distance remains authoritative.
  if((s.unstickUntil||0)>g.now){
   const choices:Vec[]=[];for(let i=0;i<16;i++){const p={x:s.x+Math.cos(i*Math.PI/8)*18,y:s.y+Math.sin(i*Math.PI/8)*18};if(clear(p,13,thiefWalls(g,s))&&corridor(s,p,thiefWalls(g,s))&&guards.every(h=>!guardSees(g,h,p)||distance(h,p)>80||distance(h,p)>distance(h,s)+2))choices.push(p);}
   const score=(p:Vec)=>guards.filter(h=>guardSees(g,h,p)).length*100+distance(p,target);
   choices.sort((a,b)=>score(a)-score(b));if(choices[0]){walk(g,s,choices[0],dt,speed);return;}
  }
  const threat=guards.find(h=>botDanger(g,s,h,s,true));if(threat&&allowCover)moveToCover(g,s,threat,dt,speed);const capsule=g.noises.find(n=>n.holder===s.id);if(capsule&&g.now>=s.windup)action(g,s,'throw',decoy(g,s));return;}
 walk(g,s,next,dt,speed);
}
function waitForRescue(g:Game,s:Thief,dt:number){
 s.dx=0;s.dy=0;
 const guards=planningGuards(g),threat=guards.find(h=>botDanger(g,s,h,s,true))||guards.find(h=>distance(s,h.route[h.way]||h.target)<80);
 if(threat)moveToCover(g,s,threat,dt,165);
}



// Idle safety has a longer horizon than travel routing: a stationary thief must
// yield before an approaching patrol turns the waiting spot into a trap.
type IdleGuard=Guard&{forecastMs:number};
const idleForecastMemo=new WeakMap<Game,{bucket:number;guards:IdleGuard[]}>();
export function idleGuards(g:Game):IdleGuard[]{
 const bucket=Math.floor(g.now/120);const cached=idleForecastMemo.get(g);if(cached?.bucket===bucket)return cached.guards;
 const walls=[...g.walls,...zones(g)],guards:IdleGuard[]=[];
 for(const original of g.guards){if(!guardActive(g,original)||(original.retreatUntil||0)>g.now)continue;
  // Opening-grace guards are parked by the simulation and cannot threaten a waiter.
  if(g.now-g.start<12000&&(original.id==='g-core'||original.id==='g-pro'&&g.crewMode==='coop'||original.id==='g0'||g.crewMode!=='coop'&&original.id==='g1'))continue;const h={...original,target:{...original.target}};guards.push({...h,forecastMs:0});
  for(let i=0;i<6;i++){if(forecastPost(g,h,g.now+(i+1)*250)){guards.push({...h,forecastMs:(i+1)*250});continue;}const next=steer(h,h.target,walls),d=distance(h,next),old={x:h.x,y:h.y};if(d>1)move(h,(next.x-h.x)/d,(next.y-h.y)/d,.25,Math.min((h.mode==='chase'?135:h.mode==='investigate'?103:62)*(g.alert>=30?1.12:1)*guardSpeed(g,h.mode),d/.25),walls);if(distance(old,h)>.1)h.angle=Math.atan2(h.y-old.y,h.x-old.x);if(h.mode==='patrol'&&(!h.sentry||(h.sentryUntil||0)>g.now)&&distance(h,h.target)<16){h.way=(h.way+1)%h.route.length;h.target=h.route[h.way];}guards.push({...h,forecastMs:(i+1)*250});}
 }
 idleForecastMemo.set(g,{bucket,guards});return guards;
}
export function idleSafety(g:Game,s:Thief,dt:number){
 if(s.escaped||s.stun>g.now)return false;
 if(homeSafe(g,s)){s.idlePoint=undefined;s.idleUntil=0;return false;}
 const guards=idleGuards(g),friend=g.seats.find(p=>p.id===s.rescueId&&p.stun>g.now&&distance(p,s)<=45);
 // Finishing a valid channel grants 3s protection. Do not abandon a rescue for
 // a guard that arrives only after that protection begins; present danger still wins.
 const protectedIn=friend?Math.max(0,1200-(g.now-s.rescueAt)):Infinity;
 const unsafe=(p:Vec)=>guards.some(h=>h.forecastMs<protectedIn&&botDanger(g,s,h,p,true));
 // Human crews need bodyguard cover; autonomous rivals retain their roaming
 // escape policy outside rescue situations, rather than abandoning their job.
 const rescueContext=g.seats.some(p=>sameCrew(p,s)&&(!p.bot||p.stun>g.now||p.safe>g.now));
 const reachable=(p:Vec)=>planningGuards(g).every(h=>{const already=botDanger(g,s,h,s,true),n=Math.ceil(distance(s,p)/10);let previous=distance(h,s);for(let i=1;i<=n;i++){const q={x:s.x+(p.x-s.x)*i/n,y:s.y+(p.y-s.y)*i/n};if(botDanger(g,s,h,q,true)&&(!already||distance(h,q)<previous-.1))return false;previous=distance(h,q);}return true;});
 if(!unsafe(s)){if(s.idlePoint&&(s.idleUntil||0)>g.now){if(distance(s,s.idlePoint)>8)guardedWalk(g,s,s.idlePoint,dt,165,false);else{s.dx=0;s.dy=0;}return true;}s.idlePoint=undefined;s.idleUntil=0;return false;}
 if(!s.idlePoint||g.now>=(s.idleUntil||0)||(rescueContext&&!reachable(s.idlePoint)||(unsafe(s.idlePoint)&&g.now>=(s.idleUntil||0)-150))){
  const candidates:Vec[]=hidingSpots(g).filter(p=>distance(p,s)<200&&corridor(s,p,thiefWalls(g,s))&&reachable(p)&&!unsafe(p));
  for(let r=20;r<=(rescueContext?320:200);r+=20)for(let i=0;i<16;i++){const p={x:s.x+Math.cos(i*Math.PI/8)*r,y:s.y+Math.sin(i*Math.PI/8)*r};if(clear(p,13,thiefWalls(g,s))&&corridor(s,p,thiefWalls(g,s))&&(rescueContext?reachable(p):!unsafe(p)))candidates.push(p);}
  // Favor the nearest safe escape, with a small preference for solid cover.
  const scored=new Map<Vec,number>();const score=(p:Vec)=>{const cached=scored.get(p);if(cached!==undefined)return cached;const value=(rescueContext?guards.reduce((n,h)=>n+(botDanger(g,s,h,p,true)?2000/(1+h.forecastMs/1500):0),0):0)+distance(s,p)+Math.max(0,90-Math.min(p.x-24,936-p.x,p.y-24,576-p.y))*12+(s.idlePoint?distance(p,s.idlePoint)*2:0)+g.guards.filter(h=>(h.retreatUntil||0)<=g.now&&sight(h,p,g.walls)).length*(rescueContext?120:12);scored.set(p,value);return value;};candidates.sort((a,b)=>score(a)-score(b));
  s.idlePoint=candidates[0];s.idleUntil=g.now+800;
 }
 s.dx=0;s.dy=0;s.rescueId=null;
 if(s.idlePoint)guardedWalk(g,s,s.idlePoint,dt,165,false);
 else{const threat=guards.find(h=>botDanger(g,s,h,s,true));if(threat)moveToCover(g,s,threat,dt,165);}
 const capsule=g.noises.find(n=>n.holder===s.id);if(capsule&&g.now>=s.windup)action(g,s,'throw',decoy(g,s));
 return true;
}
/** Bound the escape estimate; only recomputed once per second near the end. */
function routeDistance(from:Vec,to:Vec,walls:Rect[],radius=VAN_RADIUS){let p={...from},length=0;for(let i=0;i<64;i++){if(distance(p,to)<radius)return length;const next=steer(p,to,walls),d=distance(p,next);if(d<1)return Infinity;length+=d;p={...next};}return Infinity;}
export function dockRouteDistance(g:Game,s:Thief){return routeDistance(s,vanFor(g,s.team),thiefWalls(g,s));}
export function collectingFits(g:Game,s:Thief,l:Loot){if(!isFlagship(g)||g.end-g.now>=45000)return true;const walls=thiefWalls(g,s);return routeDistance(s,l,walls,40)/165*1000+routeDistance(l,vanFor(g,s.team),walls)/carrySpeed(l.value,g)*1000+14000<g.end-g.now;}
export function botEscape(g:Game,s:Thief,dt:number){
 if(g.training||s.escaped||s.stun>g.now)return false;
 const friendly=g.seats.some(p=>!p.bot&&sameCrew(p,s));if(!friendly&&s.mode!=='van')return false;
 const remaining=g.end-g.now,held=g.loot.find(l=>l.holder===s.id),speed=held?carrySpeed(held.value,g):150;
 if(s.mode==='van'||g.boardingAt||remaining<=15000||s.mode==='auto'&&g.seats.some(p=>!p.bot&&sameCrew(p,s)&&p.escaped))s.escapeCommitted=true;
 if(!s.escapeCommitted&&remaining<45000&&g.now>=(s.escapeCheckAt||0)){s.escapeCheckAt=g.now+1000;if(dockRouteDistance(g,s)/speed*1000+(isFlagship(g)?14000:3000)>remaining)s.escapeCommitted=true;}
 if(!s.escapeCommitted)return false;
 s.plateJob=undefined;s.rescueId=null;s.bottleId=null;s.retreatUntil=0;s.idleUntil=0;s.unstickTarget=undefined;s.unstickUntil=0;s.sneak=false;
 botCall(g,s,'van',s.mode==='van'||g.seats.some(p=>!p.bot&&p.team===s.team&&p.escaped)?'Right behind you.':held?'Banking this, then boarding.':'Heading to the van.');
 const home=vanFor(g,s.team),capsule=g.noises.find(n=>n.holder===s.id);if(capsule&&g.now>=s.windup)action(g,s,'throw',decoy(g,s));
 const before={x:s.x,y:s.y};
 // Use the existing release protection to leave, not to wait for a forecasted cone.
 if(s.safe>g.now+500||g.guards.every(h=>!guardActive(g,h)||(h.retreatUntil||0)>g.now||distance(h,s)>180))walk(g,s,home,dt,speed);
 else{if(s.escapeWaitAt&&g.now-s.escapeWaitAt>600)s.unstickUntil=g.now+40;guardedWalk(g,s,home,dt,speed,false);}
 if(distance(before,s)>.1)s.escapeWaitAt=0;else s.escapeWaitAt??=g.now;
 if(!s.escapeWaitAt&&distance(before,s)<=.1)s.escapeWaitAt=g.now;
 if(homeSafe(g,s))action(g,s,'extract');return true;
}

/** One empty-handed teammate draws a posted guard; the other keeps the theft opportunity. */
export function botSentryTactic(g:Game,s:Thief,dt:number){
 if(g.training||s.hand||s.escaped||s.stun>g.now||!['auto','fetch','cover'].includes(s.mode)||g.end-g.now<18000){s.sentryPlan=undefined;return false;}
 const crew=g.seats.filter(p=>sameCrew(p,s)&&!p.escaped&&p.stun<=g.now);
 if(crew.some(p=>p.stun>g.now)||g.seats.some(p=>sameCrew(p,s)&&p.stun>g.now))return false;
 const cancel=()=>{s.sentryPlan=undefined;s.sentryRetryAt=g.now+3000;return false;};
 if(!s.sentryPlan){
  if(g.now<(s.sentryRetryAt||0))return false;
  // Plan at most twice a second, including failed searches.
  s.sentryRetryAt=g.now+600;
  const post=g.guards.filter(h=>h.sentry&&h.sentryArt&&guardActive(g,h)&&(h.retreatUntil||0)<=g.now&&h.mode==='patrol'&&distance(h,h.sentry)<20&&distance(s,h)<260).sort((a,b)=>distance(s,a)-distance(s,b)).find(h=>{
   const l=g.loot.find(l=>l.id===h.sentryArt);return l&&!l.banked&&!l.holder&&!l.sealed&&!l.locked&&crew.some(p=>p.id!==s.id&&!p.hand&&distance(p,l)<240)&&!g.seats.some(p=>p.id!==s.id&&p.sentryPlan?.guardId===h.id);
  });
  if(!post)return false;
  const art=g.loot.find(l=>l.id===post.sentryArt)!;
  // The closest teammate to the exhibit is the collector, not the decoy.
  const collector=crew.filter(p=>!p.hand).sort((a,b)=>distance(a,art)-distance(b,art)||a.id.localeCompare(b.id))[0];
  if(collector?.id===s.id)return false;
  const walls=thiefWalls(g,s),others=g.guards.filter(h=>h.id!==post.id&&guardActive(g,h));
  const options:Array<{bait:Vec;exit:Vec}>=[];
  for(const offset of [0,-.3,.3,-.55,.55])for(const radius of [135,110]){
   const a=post.angle+offset,bait={x:post.x+Math.cos(a)*radius,y:post.y+Math.sin(a)*radius};
   if(!clear(bait,13,walls)||anySafe(g,bait)||!corridor(s,bait,walls)||!sight(post,bait,g.walls))continue;
   // Commit to a clear escape corridor away from the exhibit before entering sight.
   for(const turn of [0,-.6,.6,-1,1]){const exit={x:bait.x+Math.cos(a+turn)*160,y:bait.y+Math.sin(a+turn)*160};
    if(!clear(exit,13,walls)||distance(exit,art)<170||!corridor(bait,exit,walls))continue;
    const path=[s,...Array.from({length:8},(_,i)=>({x:s.x+(bait.x-s.x)*(i+1)/8,y:s.y+(bait.y-s.y)*(i+1)/8})),bait,exit];
    if(path.some(p=>distance(p,post)<70||others.some(h=>guardSees(g,h,p))))continue;
    options.push({bait,exit});break;
   }
  }
  options.sort((a,b)=>distance(s,a.bait)-distance(s,b.bait));if(!options.length)return false;
  s.sentryPlan={guardId:post.id,artId:art.id,...options[0],phase:'approach',until:g.now+6500};
  s.unstickTarget=undefined;s.idlePoint=undefined;s.avoidPoint=undefined;
 }
 const plan=s.sentryPlan,h=g.guards.find(h=>h.id===plan.guardId),art=g.loot.find(l=>l.id===plan.artId);
 if(!h||!art||g.now>plan.until)return cancel();
 if(h.victim===s.id&&h.mode==='chase'||distance(h,s)<85)plan.phase='retreat';
 if(plan.phase==='approach'&&(art.holder||art.banked||h.mode==='chase'&&h.victim!==s.id))return cancel();
 const target=plan.phase==='retreat'?plan.exit:plan.bait;
 if(plan.phase==='retreat'&&distance(s,target)<12)return cancel();
 const next=steer(s,target,thiefWalls(g,s));
 if(g.guards.some(o=>o.id!==h.id&&guardActive(g,o)&&guardSees(g,o,next)))return cancel();
 botCall(g,s,'lure-sentry',plan.phase==='approach'?"I'll draw the guard. Grab the art!":'Guard is following me. Go!');
 // Intentional visible movement: generic cone avoidance would cancel this tactic.
 s.sneak=false;const d=distance(s,next);s.dx=d>3?(next.x-s.x)/d:0;s.dy=d>3?(next.y-s.y)/d:0;
 if(d>3)move(s,s.dx,s.dy,dt,Math.min(165,d/dt),thiefWalls(g,s));
 return true;
}

/** Stash only under pressure, then use the niche briefly instead of immediately re-grabbing. */
export function botStashTactic(g:Game,s:Thief){
 if(g.training||s.escaped||s.stun>g.now||s.mode==='van'||g.end-g.now<18000)return false;
 if((s.stashWaitUntil||0)>g.now){
  const threat=g.guards.some(h=>guardActive(g,h)&&distance(h,s)<180);
  if(threat&&nearbyHide(g,s)){s.sneak=true;s.dx=s.dy=0;botCall(g,s,'stash-hide','Art stashed. Letting the guard pass.');return true;}
  s.stashWaitUntil=0;
 }
 const held=g.loot.find(l=>l.id===s.hand),spot=held?stashSpot(g,s):-1;
 if(!held||spot<0||distance(s,hidingSpots(g)[spot])>=20)return false;
 const chased=g.guards.some(h=>guardActive(g,h)&&h.mode==='chase'&&h.victim===s.id&&distance(h,s)>55&&distance(h,s)<180);
 if(!chased||!botRoute(g,s,vanFor(g,s.team)).exposed)return false;
 action(g,s,'grab');if(s.hand)return false;
 s.stashWaitUntil=g.now+3500;s.sneak=true;s.dx=s.dy=0;s.unstickTarget=undefined;s.idlePoint=undefined;
 botCall(g,s,'stash-hide','Art stashed. Letting the guard pass.');return true;
}
/** Use the same drop/capture/throw/recover actions available to a lone human. */
export function botQuietArt(g:Game,s:Thief,dt:number){
 if(!isFlagship(g)||s.mode!=='auto'||s.escaped||s.stun>g.now||g.seats.some(p=>p.id!==s.id&&sameCrew(p,s)&&p.stun>g.now&&!p.escaped)&&!g.loot.some(l=>l.value===1200&&(l.holder===s.id||s.selfQuiet?.artId===l.id))){s.selfQuiet=undefined;return false;}
 const held=g.loot.find(l=>l.id===s.hand),home=vanFor(g,s.team);
 if(!s.selfQuiet&&held&&distance(s,home)>100&&g.end-g.now>8000){
  const noise=g.noises.find(n=>n.source===held.id&&n.attached===s.id);
  const helper=g.seats.some(p=>p.id!==s.id&&sameCrew(p,s)&&!p.escaped&&!p.hand&&p.stun<=g.now&&distance(p,s)<100&&sight(p,s,g.walls));
  if(noise&&!helper&&(held.value===1200||g.guards.some(h=>guardActive(g,h)&&distance(h,s)<300))&&g.now>=s.cooldown&&g.end-g.now>dockRouteDistance(g,s)/carrySpeed(held.value,g)*1000+4000){
   action(g,s,'drop');if(!s.hand)s.selfQuiet={artId:held.id,noiseId:noise.id,until:g.now+4000};
  }
 }
 const plan=s.selfQuiet;if(!plan)return false;
 const art=g.loot.find(l=>l.id===plan.artId),noise=g.noises.find(n=>n.id===plan.noiseId);
 if(!art||art.banked||art.guardCarrier||art.holder&&art.holder!==s.id||g.now>plan.until){s.selfQuiet=undefined;return false;}
 if(s.hand===art.id){s.selfQuiet=undefined;return false;}
 s.dx=s.dy=0;
 if(noise?.holder===s.id){if(g.now>=s.windup)action(g,s,'throw',decoy(g,s));else{const threat=g.guards.find(h=>guardActive(g,h)&&distance(h,s)<180&&guardSees(g,h,s));if(threat)moveToCover(g,s,threat,dt,165);}return true;}
 if(noise&&!noise.thrownBy&&capturable(g,s,noise)){
  if(g.now>=s.cooldown&&interaction(g,s).id===noise.id)action(g,s,'grab');return true;
 }
 if(!s.hand){if(distance(s,art)>45)guardedWalk(g,s,art,dt,165);else if(interaction(g,s).id===art.id)action(g,s,'grab');}
 return true;
}
function bot(g:Game,s:Thief,dt:number){
 if(s.escaped||s.stun>g.now)return;
 if((s.selfQuiet||g.loot.some(l=>l.holder===s.id))&&botQuietArt(g,s,dt))return;
 if(botEscape(g,s,dt))return;
 if(botQuietArt(g,s,dt))return;
 const crownJob=isFlagship(g)&&vaultReady(g)&&g.loot.some(l=>l.value===1200&&!l.banked&&!l.holder)&&g.seats.some(p=>!p.bot&&sameCrew(p,s)&&!p.escaped&&p.stun<=g.now&&distance(p,g.plate)<30);
 if(!crownJob&&(botStashTactic(g,s)||botSentryTactic(g,s,dt)))return;
 const before={x:s.x,y:s.y};
 if(s.unstickTarget&&(s.unstickUntil||0)>g.now&&distance(s,s.unstickTarget)>8&&(!s.hand&&g.crewMode!=='coop'||!g.seats.some(p=>p.team===s.team&&p.stun>g.now))){guardedWalk(g,s,s.unstickTarget,dt,s.hand?carrySpeed(g.loot.find(l=>l.id===s.hand)?.value||200,g):145,false);if(distance(before,s)<.1)idleSafety(g,s,dt);return;}
 if(s.unstickTarget){s.unstickTarget=undefined;s.unstickUntil=0;s.progressAt=g.now;s.progressPoint={...before};}
 if(!s.progressPoint||distance(s,s.progressPoint)>12){s.progressPoint={...before};s.progressAt=g.now;s.unstickTarget=undefined;}
 const exempt=homeSafe(g,s)||distance(s,g.plate)<30||!!s.rescueId||s.bottleId&&g.now-s.bottleAt<1400;
 if(!exempt&&g.now-(s.progressAt??g.now)>2800){
  if(!s.unstickTarget){const partner=g.seats.find(p=>p.team===s.team&&!p.bot&&!p.escaped);const choices:Vec[]=[...(partner?[partner]:[]),...g.loot.filter(l=>!l.banked&&!l.guardCarrier&&!l.flight&&!l.holder&&!l.sealed),vanFor(g,s.team)];
   const candidates:Vec[]=[];for(let radius=40;radius<=120;radius+=40)for(let i=0;i<12;i++){const p={x:s.x+Math.cos(i*Math.PI/6)*radius,y:s.y+Math.sin(i*Math.PI/6)*radius};if(clear(p,13,thiefWalls(g,s))&&corridor(s,p,thiefWalls(g,s)))candidates.push(p);}
   const riskScores=new Map<Vec,number>();const risk=(p:Vec)=>{const known=riskScores.get(p);if(known!==undefined)return known;const value=planningGuards(g).filter(h=>guardSees(g,h,p)).length+(botRoute(g,s,p).exposed?100:0);riskScores.set(p,value);return value;};
   candidates.sort((a,b)=>risk(a)-risk(b)||Math.min(...choices.map(c=>distance(a,c)))-Math.min(...choices.map(c=>distance(b,c))));s.unstickTarget=candidates[0];s.unstickUntil=g.now+1800;s.rescueId=null;s.idlePoint=undefined;s.idleUntil=0;botCall(g,s,'reroute','Taking another route');
  }
  if(s.unstickTarget&&(s.unstickUntil||0)>g.now){const capsule=g.noises.find(n=>n.holder===s.id);if(capsule&&g.now>=s.windup)action(g,s,'throw',decoy(g,s));guardedWalk(g,s,s.unstickTarget,dt,s.hand?carrySpeed(g.loot.find(l=>l.id===s.hand)?.value||200,g):145,false);return;}
  s.progressAt=g.now;s.unstickTarget=undefined;s.autoTarget=undefined;s.decisionAt=0;
 }
 const captive=g.seats.find(p=>sameCrew(p,s)&&p.stun>g.now&&!p.escaped);
 if(captive&&s.idlePoint&&s.idleRescueDeadline!==captive.stun&&!rescueForecastExposed(g,s,captive)&&!botRoute(g,s,captive).exposed){s.idlePoint=undefined;s.idleUntil=0;s.idleRescueDeadline=captive.stun;}
 // Continue a short evasive move before re-entering the original standing job.
 if(s.idlePoint&&(s.idleUntil||0)>g.now&&idleSafety(g,s,dt))return;
 botDecision(g,s,dt);
 if(hidingSpots(g).some(p=>distance(s,p)<23)&&g.guards.some(h=>guardActive(g,h)&&distance(h,s)<200))s.sneak=true;
 if(distance(before,s)<.1)idleSafety(g,s,dt);
}
function rescueForecastExposed(g:Game,s:Thief,captive:Thief){
 const route=botRoute(g,s,captive),speed=s.hand?carrySpeed(g.loot.find(l=>l.id===s.hand)?.value||200,g):165;
 const points=[{x:s.x,y:s.y},route.next,...route.path.slice(route.path.findIndex(p=>distance(p,route.next)<1)+1)];
 if(distance(points[points.length-1],captive)>1)points.push(captive);
 const length=points.slice(1).reduce((n,p,i)=>n+distance(points[i],p),0);
 const channel=s.rescueId===captive.id?Math.max(0,1200-(g.now-s.rescueAt)):1200;
 return idleGuards(g).some(h=>{
  if(h.forecastMs>=(s.rescueId===captive.id?0:Math.max(0,length-32)/speed*1000)+channel)return false;
  let remaining=s.rescueId===captive.id?0:Math.min(h.forecastMs/1000*speed,Math.max(0,length-32)),p=points[0];
  for(const next of points.slice(1)){const d=distance(p,next);if(d>remaining){p={x:p.x+(next.x-p.x)*remaining/d,y:p.y+(next.y-p.y)*remaining/d};break;}remaining-=d;p=next;}
  const protectAt=(s.rescueId===captive.id?0:Math.max(0,length-32)/speed*1000)+channel;
  return botDanger(g,s,h,p,true)&&distance(h,p)<25+Math.max(0,protectAt-h.forecastMs)/1000*135*tuning(g).speed;
 });
}
function defendCarrier(g:Game,s:Thief,dt:number){
 if(!['cover','auto'].includes(s.mode)||g.loot.some(l=>l.id===s.hand))return false;
 const carrier=g.seats.find(p=>p.id!==s.id&&sameCrew(p,s)&&!p.escaped&&p.stun<=g.now&&g.loot.some(l=>l.holder===p.id));
 const h=carrier&&g.guards.filter(h=>guardActive(g,h)&&h.mode==='chase'&&h.victim===carrier.id&&distance(h,carrier)<220).sort((a,b)=>distance(a,carrier)-distance(b,carrier))[0];
 if(!carrier||!h){s.coverThreat=undefined;return false;}
 const d=distance(h,carrier),closing=s.coverThreat?.id===h.id&&d<s.coverThreat.distance+.01;s.coverThreat={id:h.id,distance:d};
 if(!closing||g.now<(s.defendAt??-Infinity)+8000)return false;
 const length=distance(h,carrier)||1,away={x:(h.x-carrier.x)/length,y:(h.y-carrier.y)/length};
 const jar=g.noises.find(n=>n.id===s.hand);
 if(jar&&g.now>=s.windup){action(g,s,'throw',{x:h.x+away.x*130,y:h.y+away.y*130});s.defendAt=g.now;crewCall(g,s,"I've got him — run!");return true;}
 if(s.hand)return false;
 const intercept={x:h.x-away.x*65,y:h.y-away.y*65};
 if(!clear(intercept,13,thiefWalls(g,s))||!sight(s,intercept,g.walls))return false;
 if(distance(s,h)>90||!sight(h,s,g.walls)){guardedWalk(g,s,intercept,dt,165,false,h.id);return true;}
 const id=alarm(g,s,null,s.id),noise=g.noises.find(n=>n.id===id)!;noise.expires=g.now+3000;noise.alerted=true;
 s.defendAt=g.now;crewCall(g,s,"I've got him — run!");
 const options=[0,.6,-.6,1.2,-1.2].map(a=>({x:s.x+(away.x*Math.cos(a)-away.y*Math.sin(a))*160,y:s.y+(away.x*Math.sin(a)+away.y*Math.cos(a))*160}));
 const retreat=options.find(p=>clear(p,13,thiefWalls(g,s))&&sight(s,p,g.walls)&&distance(p,carrier)>distance(s,carrier));
 if(retreat){s.retreatPoint=retreat;s.retreatUntil=g.now+2400;guardedWalk(g,s,retreat,dt,165);}return true;
}
function botDecision(g:Game,s:Thief,dt:number){if(s.escaped||s.stun>g.now)return;const crew=g.seats.filter(p=>sameCrew(p,s));const human=crew.find(x=>!x.bot&&!x.escaped);const partner=crew.length>=3&&s.mode==='auto'?crew.filter(p=>p.id!==s.id&&!p.escaped).sort((a,b)=>Number(g.loot.some(l=>l.holder===b.id))-Number(g.loot.some(l=>l.holder===a.id))||Number(a.bot)-Number(b.bot)||distance(s,a)-distance(s,b))[0]:human||crew.find(p=>p.id!==s.id&&!p.escaped);const held=g.loot.find(l=>l.id===s.hand);const capsule=g.noises.find(n=>n.id===s.hand);const home=vanFor(g,s.team);s.sneak=false;const automatic=s.mode==='auto';const mode=automatic?((human||difficultyOf(g)!=='rookie'&&(!isFlagship(g)||difficultyOf(g)!=='pro'||g.guards.some(h=>guardActive(g,h)&&h.mode==='chase'&&h.victim===partner?.id&&distance(h,partner)<220)))&&partner&&g.loot.some(l=>l.holder===partner.id)?'cover':'fetch'):s.mode;
 if(s.retreatUntil&&s.retreatUntil>g.now&&s.retreatPoint){if(distance(s,s.retreatPoint)>10){guardedWalk(g,s,s.retreatPoint,dt,165);return;}s.retreatUntil=0;s.retreatPoint=undefined;}
 if(s.mode==='van'||automatic&&crew.some(p=>!p.bot&&p.escaped)||g.boardingAt||g.end-g.now<10000){botCall(g,s,'van','Right behind you.');if(capsule&&g.now>=s.windup)action(g,s,'throw',decoy(g,s));guardedWalk(g,s,home,dt,150);if(homeSafe(g,s))action(g,s,'extract');return;}
 const captive=crew.find(x=>x.stun>g.now&&!x.escaped);
 if(captive){s.spacing=false;const exposed=botRoute(g,s,captive).exposed||rescueForecastExposed(g,s,captive)||!!held&&carryingRescueExposed(g,s,captive);
  if(held&&(held.value===1200||distance(s,home)<distance(s,captive)||exposed)){botCall(g,s,'bank-rescue','Banking first, then coming for you');guardedWalk(g,s,home,dt,carrySpeed(held.value,g));return;}
  if(exposed){s.rescueId=null;if(!idleSafety(g,s,dt))waitForRescue(g,s,dt);botCall(g,s,'wait-rescue','Waiting for the guard to clear');if(capsule&&g.now>=s.windup)action(g,s,'throw',decoy(g,s));return;}
  botCall(g,s,'rescue','Coming to free '+captive.name);if(distance(s,captive)>32)guardedWalk(g,s,captive,dt,165);if(distance(s,captive)<40)action(g,s,'grab');return;
 }
 const crewAlarm=!s.hand&&['auto','cover'].includes(s.mode)&&g.noises.find(n=>g.loot.some(l=>l.id===n.source&&l.value===1200)&&n.attached&&crew.some(p=>p.id!==s.id&&p.id===n.attached)&&capturable(g,s,n));
 if(crewAlarm&&interaction(g,s).id===crewAlarm.id){action(g,s,'grab');return;}
 if(defendCarrier(g,s,dt))return;
 // Keep the landing spot stable while a teammate's pass is airborne.
 const incoming=g.loot.find(l=>l.flight?.team===s.team&&distance(l.flight.to,s)<70);
 if(!held&&incoming?.flight){guardedWalk(g,s,incoming.flight.to,dt,165);return;}
 if(isFlagship(g)&&held&&(s.passUntil||0)<=g.now&&g.guards.some(h=>guardActive(g,h)&&h.mode==='chase'&&h.victim===s.id&&distance(h,s)<160)){const receiver=crew.find(p=>!p.bot&&canReceiveArt(g,s,p));if(receiver){action(g,s,'throw:'+held.id,receiver);return;}}
 if(held&&(s.passUntil||0)<=g.now&&g.guards.some(h=>guardActive(g,h)&&h.mode==='chase'&&h.victim===s.id&&distance(h,s)<200)){
  const receiver=passTarget(g,s,home);if(receiver&&distance(receiver,home)+50<distance(s,home)&&distance(receiver,s)>65&&!botRoute(g,receiver,home).exposed){action(g,s,'throw',receiver);return;}
 }
 if(automatic&&!s.hand&&human&&human.stun<=g.now&&g.loot.some(l=>l.holder===human.id)&&g.guards.some(h=>guardActive(g,h)&&h.mode==='chase'&&h.victim===human.id&&distance(h,human)<200)){
  const route=steer(human,home,thiefWalls(g,s)),len=distance(human,route)||1;
  const options=[200,170,140,110,80].map(d=>({x:human.x+(route.x-human.x)/len*Math.min(d,len),y:human.y+(route.y-human.y)/len*Math.min(d,len)}));
  const point=options.find(p=>distance(p,human)>50&&clear(p,13,thiefWalls(g,s))&&sight(human,p,g.walls)&&!botRoute(g,s,p).exposed&&!g.guards.some(h=>guardSees(g,h,p as Thief)));
  if(point){botCall(g,s,'receive','PASS!');if(distance(s,point)>9)guardedWalk(g,s,point,dt,165);return;}
 }
 const abandoned=g.loot.filter(l=>!l.sealed&&!l.flight&&emptyPost(g,l)&&(!l.locked||plateOpen(g))).sort((a,b)=>distance(s,a)-distance(s,b))[0];
 if(!held&&!capsule&&mode!=='plate'&&mode!=='follow'&&!(vaultReady(g)&&crew.some(p=>!p.bot&&p.stun<=g.now&&distance(p,g.plate)<30))&&abandoned&&!botRoute(g,s,abandoned).exposed){botCall(g,s,'post-empty',"Post's empty, going in");guardedWalk(g,s,abandoned,dt,150);if(distance(s,abandoned)<50)action(g,s,'grab');return;}
 const plateLoot=vaultReady(g)&&g.loot.find(l=>l.locked&&!l.banked&&!l.guardCarrier&&!l.flight&&!l.holder&&!l.sealed);
 const plateHuman=crew.find(p=>!p.bot&&!p.escaped&&p.stun<=g.now&&distance(p,g.plate)<30);
 const atJack=plateLoot&&human&&distance(human,plateLoot)<70;
 if(!held&&plateLoot&&(plateHuman||atJack||mode==='plate')){
  if(capsule){if(g.now>=s.windup)action(g,s,'throw',decoy(g,s));return;}
  s.bottleId=null;s.sneak=true;
  if(plateHuman&&mode!=='plate'){
   // Do not abandon a plate job after bottling: secure a nearby safe alarm only
   // when the jackpot approach is exposed, throw it, then resume the same job.
   if(g.crewMode!=='coop'&&botRoute(g,s,plateLoot).exposed){
    const bait=g.noises.filter(n=>!n.holder&&!n.attached&&n.flight<=0&&capturable(g,s,n)&&!planningGuards(g).some(h=>guardSees(g,h,s))).sort((a,b)=>distance(s,a)-distance(s,b))[0];
    if(bait){botCall(g,s,'jackpot-decoy','Grabbing an alarm to clear the jackpot');if(capturable(g,s,bait))action(g,s,'grab');else guardedWalk(g,s,bait,dt,165);return;}
   }
   s.plateJob=plateLoot.id;botCall(g,s,'jackpot','GOING FOR THE JACKPOT');guardedWalk(g,s,plateLoot,dt,165);if(distance(s,plateLoot)<50&&interaction(g,s).kind==='loot')action(g,s,'grab');return;}
  botCall(g,s,'hold-plate','Holding the plate. Grab the jackpot');guardedWalk(g,s,g.plate,dt,165);return;
 }
 const pressure=automatic&&!held&&partner&&!homeSafe(g,partner)&&partner.stun<=g.now&&g.guards.some(h=>(h.retreatUntil||0)<=g.now&&distance(h,partner)<150);
 s.spacing=!!pressure;
 if(s.spacing&&partner){const gap=distance(s,partner),threat=g.guards.find(h=>guardSees(g,h,s));
  // Escape a cone before closing the spacing gap; otherwise these goals fight at 100u.
  if(threat){moveToCover(g,s,threat,dt,150);}
  else if(gap<55||gap>100){const turn=steer(partner,home,thiefWalls(g,s)),d=distance(partner,turn)||1;const back={x:partner.x+(turn.x-partner.x)/d*Math.min(80,d),y:partner.y+(turn.y-partner.y)/d*Math.min(80,d)};if(clear(back,13,thiefWalls(g,s))&&!botRoute(g,s,back).exposed)guardedWalk(g,s,back,dt,150);else if(gap>100)guardedWalk(g,s,partner,dt,150);else{s.dx=0;s.dy=0;}}
  else{s.dx=0;s.dy=0;}
  if(capsule&&g.now>=s.windup)action(g,s,'throw',decoy(g,s));
  const scream=g.noises.find(n=>n.attached===partner.id&&capturable(g,s,n));if(scream){if(s.bottleId!==scream.id){s.bottleId=scream.id;s.bottleAt=g.now;}if(g.now-s.bottleAt>=1000)action(g,s,'grab');}return;
 }

 if(automatic)botCall(g,s,held?'bank':mode,held?'Taking this art home':mode==='cover'?'Covering your alarm':'Looking for a safe exhibit');

 if(capsule&&mode==='follow'&&partner){const threat=g.guards.some(h=>distance(h,partner)<150&&sight(h,partner,g.walls));if(threat&&g.now>=s.windup)action(g,s,'throw',decoy(g,s));else if(distance(s,partner)>45)guardedWalk(g,s,partner,dt,150);return;}
 if(capsule){const target=g.seats.filter(r=>r.team!==s.team&&!r.escaped&&!homeSafe(g,r)&&g.loot.some(l=>l.holder===r.id)&&distance(r,s)<270&&sight(s,r,g.walls)).sort((a,b)=>distance(s,a)-distance(s,b))[0];if(target&&g.now>=s.windup){const aim={x:target.x,y:target.y};crewCall(g,s,'Planting an alarm on '+target.name+'!');action(g,s,'throw',aim);return;}if(g.now>=s.windup)action(g,s,'throw',decoy(g,s));return;}
 if(held){guardedWalk(g,s,home,dt,carrySpeed(held.value,g));return;}
 // Hold Plate is a positioning order even while the vault remains time-locked.
 if(mode==='plate'){guardedWalk(g,s,g.plate,dt,145);return;}
 const autonomous=!crew.some(p=>!p.bot),humanFirst=g.seats.some(p=>!p.bot&&p.captures>0);
 const carrier=autonomous&&difficultyOf(g)!=='rookie'&&g.seats.find(r=>r.team!==s.team&&!r.escaped&&!homeSafe(g,r)&&g.loot.some(l=>l.holder===r.id));
 if(carrier&&(!isFlagship(g)&&difficultyOf(g)!=='pro'||g.noises.some(n=>!n.holder&&distance(s,n)<110))&&Math.floor((g.now-g.start)/6000)%3===1){const supply=g.noises.filter(n=>!n.holder&&n.flight<=0&&(!n.thrownBy||n.attached)&&distance(s,n)<220).sort((a,b)=>distance(s,a)-distance(s,b))[0];if(supply){if(!capturable(g,s,supply))guardedWalk(g,s,supply,dt,145);else{if(s.bottleId!==supply.id){s.bottleId=supply.id;s.bottleAt=g.now;}if(g.now-s.bottleAt>=700)action(g,s,'grab');}return;}else{const rivalHome=vanFor(g,carrier.team);guardedWalk(g,s,{x:(carrier.x+rivalHome.x)/2,y:Math.min(450,(carrier.y+rivalHome.y)/2)},dt,145);return;}}
 if(mode==='follow'&&partner&&g.guards.some(h=>distance(h,partner)<160&&sight(h,partner,g.walls))&&(s.calloutAt===undefined||g.now-s.calloutAt>6000)){s.calloutAt=g.now;botCall(g,s,'guard-warning','Guard closing in on '+partner.name+'!');}
 const n=g.noises.filter(n=>!n.holder&&(!n.thrownBy||n.attached)&&capturable(g,s,n)&&g.now-n.born>1400&&((mode==='follow'&&partner&&g.guards.some(h=>distance(h,partner)<160&&sight(h,partner,g.walls))&&distance(partner,n)<150)||(mode==='cover'&&partner&&distance(partner,n)<150)||(autonomous&&((partner&&distance(partner,n)<150)||g.seats.some(r=>r.team!==s.team&&!r.escaped&&r.hand&&distance(r,s)<400&&sight(s,r,g.walls))))||(humanFirst&&mode!=='follow'&&!n.attached&&crew.some(p=>p.hand&&distance(p,n)<100)))).sort((a,b)=>distance(a,s)-distance(b,s))[0];

 if(n){if(interaction(g,s).id!==n.id){guardedWalk(g,s,n,dt,150);return;}if(s.bottleId!==n.id){s.bottleId=n.id;s.bottleAt=g.now;}if(g.now-s.bottleAt>=1000)action(g,s,'grab');return;}s.bottleId=null;
 if(mode==='cover'&&partner){if(distance(s,partner)>55)guardedWalk(g,s,partner,dt,150);return;}
 const jackpot=g.loot.find(l=>l.locked&&!l.banked&&!l.guardCarrier&&!l.flight&&!l.holder);
 if(autonomous&&jackpot&&vaultReady(g)&&(g.loot.filter(l=>!l.banked&&!l.guardCarrier&&!l.flight&&!l.holder&&!l.locked&&!l.sealed).length===0)){if(crew[0]?.id===s.id){botCall(g,s,'hold-plate','Holding the plate. Grab the jackpot');guardedWalk(g,s,g.plate,dt,145);return;}botCall(g,s,'jackpot','GOING FOR THE JACKPOT');guardedWalk(g,s,jackpot,dt,140);if(distance(s,jackpot)<50)action(g,s,'grab');return;}
 const claimCost=(l:Loot)=>crew.length>=3&&crew.some(p=>p.id!==s.id&&p.bot&&!p.hand&&!p.escaped&&p.autoTarget===l.id)?260:0;
 const fetch=mode==='fetch'||autonomous;const rivalSkill=g.arena&&difficultyOf(g)==='normal'?(isFlagship(g)?1.65:1.26):g.arena&&difficultyOf(g)==='pro'?1.80:tuning(g).rival;
 if(automatic&&!autonomous&&(s.decisionAt===undefined||g.now>=s.decisionAt)){s.decisionAt=g.now+700;s.autoTarget=g.loot.filter(l=>!l.banked&&!l.guardCarrier&&!l.flight&&!l.holder&&!l.locked&&!l.sealed&&collectingFits(g,s,l)&&!botRoute(g,s,l).exposed&&!botRoute(g,{...s,x:l.x,y:l.y},home).exposed).sort((a,b)=>distance(a,s)+claimCost(a)-distance(b,s)-claimCost(b))[0]?.id||g.loot.filter(l=>!l.banked&&!l.guardCarrier&&!l.flight&&!l.holder&&!l.locked&&!l.sealed&&collectingFits(g,s,l)).sort((a,b)=>Number(botRoute(g,s,a).exposed)-Number(botRoute(g,s,b).exposed)||distance(a,s)+claimCost(a)-distance(b,s)-claimCost(b))[0]?.id;}
 const l=g.loot.filter(l=>!l.banked&&!l.guardCarrier&&!l.flight&&!l.holder&&!l.locked&&!l.sealed&&fetch&&(!automatic||autonomous||s.autoTarget===l.id)).sort((a,b)=>{const raid=autonomous&&!isFlagship(g)&&difficultyOf(g)==='normal'&&((g.match+Number(s.id.slice(1)))%3===0)&&g.now-g.start<35000;const opponent=g.seats.find(p=>p.team!==s.team);const score=(l:Loot)=>distance(l,s)+claimCost(l)+(autonomous&&(difficultyOf(g)==='pro'||isFlagship(g)&&difficultyOf(g)==='normal')?distance(l,home)*.45-l.value*.3+(crew.some(p=>p.id!==s.id&&!p.hand&&distance(p,l)<distance(s,l)-25)?260:0):0)-(autonomous&&difficultyOf(g)==='rookie'&&crew[0]?.id===s.id&&Math.abs(l.x-480)<100?1000:0)-(raid&&opponent&&distance(l,vanFor(g,opponent.team))<300?450:0);return score(a)-score(b);})[0];
 if(automatic&&!autonomous&&!s.autoTarget&&g.end-g.now<30000){s.escapeCommitted=true;botEscape(g,s,dt);return;}
 if(l&&crew.length>=3)s.autoTarget=l.id;
 if(l&&g.now-g.start>(autonomous?(difficultyOf(g)==='rookie'?5000:isFlagship(g)&&difficultyOf(g)==='pro'?0:1000):isFlagship(g)?1000:12000)){if(autonomous&&difficultyOf(g)==='rookie'&&distance(s,l)<55&&Math.floor((g.now-g.start)/1000)%3===0)return;guardedWalk(g,s,l,dt,autonomous?145*rivalSkill:isFlagship(g)?165:115);if(distance(l,s)<50)action(g,s,'grab');return;}
 if(partner){const home=vanFor(g,s.team),d=distance(partner,home)||1;const receiving={x:partner.x+(home.x-partner.x)/d*38,y:partner.y+(home.y-partner.y)/d*38};const target=clear(receiving,13,thiefWalls(g,s))&&sight(partner,receiving,g.walls)?receiving:partner;if(distance(s,target)>12)guardedWalk(g,s,target,dt,150);}
}
function step(g:Game){const dt=STEP/1000;if(isFlagship(g)){if(!g.vaultWarned&&g.now-g.start>=20000){g.vaultWarned=true;event(g,`VAULT · Opens in 10 seconds. Get to ${g.arena?.id==='night-archive'?'the Map Room':'Security'}.`,'honk');}if(!g.vaultOpened&&vaultReady(g)){g.vaultOpened=true;const sentry=g.guards.find(h=>h.sentryArt==='art3');if(sentry){sentry.sentry=undefined;sentry.sentryArt=undefined;sentry.sentryUntil=undefined;sentry.victim=null;sentry.mode='patrol';sentry.attention=0;sentry.route=(g.arena?.routes[2]||[g.plate,{x:g.plate.x-60,y:g.plate.y}]).map(p=>({...p}));sentry.way=sentry.route.reduce((best,p,i)=>distance(p,g.plate)<distance(sentry.route[best],g.plate)?i:best,0);sentry.target={...sentry.route[sentry.way]};}event(g,`VAULT OPEN · Hold the ${g.arena?.id==='night-archive'?'Map Room':'Security'} plate to release the Crown.`,'capture',g.plate);}}updateJobEvent(g);advanceArtFlights(g);
 // A solo rival has no partner to hold the plate: activating it unlocks the crown for both players.
 if(isDuel(g)&&plateOpen(g)){const crown=g.loot.find(l=>l.locked&&!l.banked);if(crown){crown.locked=false;event(g,'DUEL · Crown unlocked for both thieves.','info',g.plate);}}
 if(!g.honking&&g.end-g.now<=15000){g.honking=true;event(g,'15s LEFT. Return to your own van or lose 25% of your personal bank!','honk');}
 if(!g.training&&g.alert>=60&&!g.lockdown){g.lockdown=true;const route=g.arena?g.arena.routes[5]:g.crewMode==='coop'?[{x:550,y:80},{x:530,y:330},{x:250,y:340}]:RIVAL_REINFORCEMENTS[g.layout];g.guards.push({id:'g-lockdown',...route[0],angle:Math.PI,mode:'patrol',target:route[1],route,way:1,attention:0,victim:null});stageGuard(g,g.guards[g.guards.length-1],g.guards.length-1,g.now+1000);event(g,'LOCKDOWN. Security entering through the staff door.','honk');}
 for(const s of g.seats){if(s.bot)bot(g,s,dt);else if(!s.escaped&&s.stun<=g.now&&g.now-s.inputAt<500)move(s,s.dx,s.dy,dt,(s.hand?(g.loot.some(l=>l.id===s.hand)?carrySpeed(g.loot.find(l=>l.id===s.hand)!.value,g):CARRY_SPEED):165)*(s.sneak?0.55:1),thiefWalls(g,s));
  updateHiding(g,s);
  if(s.stun&&s.stun<=g.now){s.stun=0;s.safe=g.now+3000;s.freedAt=g.now;event(g,s.name+' slipped free. Recover the dropped loot.','rescue',s);}
  const l=g.loot.find(l=>l.holder===s.id);if(l){l.x=s.x;l.y=s.y;if(homeSafe(g,s)){hush(g,l);l.banked=true;l.bankedBy=s.team;l.holder=null;s.hand=null;s.bank+=l.value;g.total+=l.value;if(s.bot&&s.mode==='fetch'&&g.seats.some(p=>!p.bot&&sameCrew(p,s))){s.mode='follow';botCall(g,s,'fetch-done','One piece delivered. Ask Fetch again for another.');}event(g,'$'+l.value+' secured. '+s.name+' delivered '+l.name+'.','bank',vanFor(g,s.team));}}
 }
 for(const s of g.seats){if(!s.rescueId)continue;const friend=g.seats.find(p=>p.id===s.rescueId);if(s.escaped||s.stun>g.now||!friend||friend.stun<=g.now||distance(s,friend)>45||!sight(s,friend,g.walls)){s.rescueId=null;continue;}const capturing=g.guards.find(h=>h.id===friend.capturedBy);if(capturing)capturing.retreatUntil=Math.max(capturing.retreatUntil||0,g.now+1000);if(g.now-s.rescueAt>=1200){s.safe=g.now+3000;s.retreatUntil=g.now+1200;s.retreatPoint=coverPoint(g,s,capturing);friend.stun=0;friend.safe=g.now+3000;friend.freedAt=g.now;s.rescues++;s.rescueId=null;event(g,s.name+' freed '+friend.name+'!','rescue',friend);}}
 for(const l of g.loot){
  if(l.stashedAt===undefined&&l.recoverAt&&g.now>=l.recoverAt&&!l.holder&&!l.banked&&!l.guardCarrier&&!l.flight&&l.home&&!anySafe(g,l)&&!g.guards.some(h=>h.returnArt===l.id)){const guard=g.guards.filter(h=>guardActive(g,h)&&!h.returnArt&&(h.retreatUntil||0)<=g.now).sort((a,b)=>distance(a,l)-distance(b,l))[0];if(guard)guard.returnArt=l.id;}
  if(l.holder&&!l.banked&&!g.noises.some(n=>n.source===l.id&&n.attached)&&(!l.quietUntil||g.now>=l.quietUntil)){const carrier=g.seats.find(s=>s.id===l.holder);if(carrier)alarm(g,carrier,l.id,carrier.id);}
 }
 for(const n of g.noises){if(n.attached){const carrier=g.seats.find(s=>s.id===n.attached);if(carrier){n.x=carrier.x;n.y=carrier.y;}}else if(n.holder){const s=g.seats.find(s=>s.id===n.holder)!;n.x=s.x;n.y=s.y;if(g.now>=n.expires){n.holder=null;s.hand=null;n.expires=g.now+4000;n.born=g.now;event(g,'The alarm burst!','catch',s);}}else if(n.flight>0){const p={x:n.x+n.vx*dt,y:n.y+n.vy*dt};if(clear(p,6,g.walls)){if(isFlagship(g))for(const sensor of sensors(g))if(crossesBeam(n,p,sensor))tripEmitter(g,sensor);n.x=p.x;n.y=p.y;n.flight-=dt;}else n.flight=0;if(n.flight<=.2){const thrower=g.seats.find(s=>s.id===n.thrownBy);const unsafe=thrower&&g.seats.some(s=>sameCrew(s,thrower)&&!s.escaped&&distance(s,n)<100);if(n.flight<=0&&unsafe&&!g.training)g.alert=Math.min(100,g.alert+8);const rival=thrower&&g.seats.find(s=>!sameCrew(s,thrower)&&!s.escaped&&s.stun<=g.now&&!homeSafe(g,s)&&distance(s,n)<=40&&sight(s,n,g.walls));if(rival){n.flight=0;n.attached=rival.id;n.source=null;n.expires=g.now+15000;n.born=g.now;event(g,thrower!.name+' planted an alarm on '+rival.name+'!','land',rival);if(g.training&&!thrower!.bot)g.practiceStage=3;}else if(n.flight<=0)event(g,unsafe?'Too close! The alarm landed near your crew.':'Distraction landed.','land',n);}}}
 g.noises=g.noises.filter(n=>n.expires>g.now);
 for(const guard of g.guards){let victim:Thief|undefined;
  // Loading docks are guard walls. Legacy routes/shift offsets can end inside
  // one; never ask the navigator to reach a forbidden waypoint.
  const guardWalls=[...g.walls,...zones(g)];
  for(let skip=0;skip<guard.route.length&&!clear(guard.route[guard.way],13,guardWalls);skip++){
   const blocked=guard.route[guard.way];guard.way=(guard.way+1)%guard.route.length;
   if(distance(guard.target,blocked)<1)guard.target=guard.route[guard.way];
  }

  if(!guardActive(g,guard)){if(g.now<(guard.entryAt||0))continue;guard.entered=true;guard.target=guard.route[guard.way];event(g,'Staff door opened. Security entering.','honk',guard);}
  if(guard.sentryArt){const exhibit=g.loot.find(l=>l.id===guard.sentryArt);if(!exhibit||exhibit.claimed||exhibit.banked||exhibit.holder){guard.sentry=undefined;guard.sentryArt=undefined;guard.sentryUntil=undefined;guard.attention=0;guard.target=guard.route[guard.way];}}
  if(guard.returnArt){const l=g.loot.find(l=>l.id===guard.returnArt);if(!l||l.banked||l.holder||l.flight||l.stashedAt!==undefined||l.droppedAt===undefined){guard.returnArt=undefined;}else if((guard.retreatUntil||0)<=g.now){const target=l.guardCarrier?l.home!:l;guard.mode='patrol';guard.victim=null;guard.target={...target};const before={x:guard.x,y:guard.y};walk(g,guard,target,dt,85);if(distance(before,guard)>.1)guard.angle=Math.atan2(guard.y-before.y,guard.x-before.x);if(!l.guardCarrier&&!l.flight&&distance(guard,l)<24){hush(g,l);l.guardCarrier=guard.id;event(g,'Security is returning '+l.name+'.','info',l);}if(l.guardCarrier){l.x=guard.x;l.y=guard.y;if(distance(guard,l.home!)<18){Object.assign(l,l.home);l.guardCarrier=undefined;l.droppedAt=undefined;l.recoverAt=undefined;l.locked=l.value===1200;guard.returnArt=undefined;event(g,'Security returned '+l.name+' to its display.','info',l);}}continue;}}
  if(guard.retreatUntil&&guard.retreatUntil>g.now){guard.mode='patrol';guard.target=guard.route[guard.way];if(distance(guard,guard.target)<16){guard.way=(guard.way+1)%guard.route.length;guard.target=guard.route[guard.way];}const previous={x:guard.x,y:guard.y};walk(g,guard,guard.target,dt,120);if(distance(previous,guard)>.1)guard.angle=Math.atan2(guard.y-previous.y,guard.x-previous.x);continue;}
  const visibleOrder=[...g.seats].sort((a,b)=>Number(g.noises.some(n=>n.attached===b.id))-Number(g.noises.some(n=>n.attached===a.id))||distance(guard,a)-distance(guard,b));
  for(const s of visibleOrder){if(s.escaped||s.stun>g.now||s.safe>g.now||homeSafe(g,s)||hidden(g,s)&&distance(guard,s)>=20)continue;const d=distance(guard,s);const diff=Math.atan2(Math.sin(Math.atan2(s.y-guard.y,s.x-guard.x)-guard.angle),Math.cos(Math.atan2(s.y-guard.y,s.x-guard.x)-guard.angle));if(d<(blackoutActive(g)?60:(s.sneak?90:180)*guardSight(g,guard))&&(!(guard.luredUntil&&guard.luredUntil>g.now)||d<45)&&(Math.abs(diff)<0.65||d<45)&&sight(guard,s,g.walls)){victim=s;break;}}
  let noise:Noise|undefined=g.noises.filter(n=>!n.holder&&!n.ignoredBy?.includes(guard.id)&&!anySafe(g,n)&&(n.attached?g.now-(n.heardAt?.[guard.id]??-Infinity)>8000:!n.heardBy?.includes(guard.id)&&(n.thrownBy||((n.heardBy?.length||0)<1)))&&(n.thrownBy||g.guards.filter(other=>guardActive(g,other)&&(other.retreatUntil||0)<=g.now&&distance(other,n)<=distance(guard,n)).length<=(n.attached?2:1))&&n.flight<=0&&(n.thrownBy||g.now-n.born>900)&&(n.attached?distance(n,guard)<alarmHearing(g):(distance(n,guard)<220||distance(n,guard)<420&&sight(guard,n,g.walls)))).sort((a,b)=>Number(Boolean(b.thrownBy&&!b.heardBy?.includes(guard.id)))-Number(Boolean(a.thrownBy&&!a.heardBy?.includes(guard.id)))||distance(a,guard)-distance(b,guard))[0];
  if(!isFlagship(g)&&noise?.thrownBy&&difficultyOf(g)==='pro'&&guard.mode==='chase'&&victim&&distance(guard,victim)<=80&&!noise.heardBy?.includes(guard.id)&&random(g)<.5){noise.ignoredBy??=[];noise.ignoredBy.push(guard.id);noise=undefined;}
  if(isFlagship(g)&&guard.mode==='chase'){
   const chased=victim||g.seats.find(s=>s.id===guard.victim&&!s.escaped&&s.stun<=g.now);
   const fresh=g.noises.filter(n=>n.thrownBy&&!n.attached&&!n.holder&&n.flight<=0&&!n.heardBy?.includes(guard.id)&&g.now-(n.thrownAt??n.born)<=4000&&distance(guard,n)<=200&&!anySafe(g,n)).sort((a,b)=>distance(a,guard)-distance(b,guard))[0];
   if(fresh&&(!chased||distance(guard,chased)>70)){noise=fresh;guard.luredUntil=g.now+2500;victim=undefined;guard.victim=null;}
   else if(chased&&distance(guard,chased)<=70&&noise?.thrownBy)noise=undefined;
  }
  if(noise&&!noise.alerted){noise.alerted=true;if(!g.training)g.alert=Math.min(100,g.alert+(noise.attached?7:3));}
  if(noise?.thrownBy&&!noise.heardBy?.includes(guard.id)&&distance(guard,noise)<=(isFlagship(g)?200:220)&&(!victim||distance(guard,victim)>(isFlagship(g)?70:60))){guard.luredUntil=g.now+2500;victim=undefined;guard.victim=null;}
  if(victim){guard.mode='chase';guard.target={x:victim.x,y:victim.y};guard.victim=victim.id;guard.attention=g.now+1600;guard.lastSeenPoint={x:victim.x,y:victim.y};guard.lastSeenAt=g.now;}
  else if(noise){if(guard.sentry)guard.sentryUntil=g.now+6000;guard.mode='investigate';guard.searchCenter={x:noise.x,y:noise.y};guard.searchAt=0;guard.target={...guard.searchCenter};guard.victim=null;guard.attention=g.now+6500;noise.heardAt??={};noise.heardAt[guard.id]=g.now;noise.heardBy??=[];if(!noise.heardBy.includes(guard.id))noise.heardBy.push(guard.id);if(noise.thrownBy){const thrower=g.seats.find(s=>s.id===noise.thrownBy);if(thrower)thrower.bestThrow=Math.max(thrower.bestThrow,noise.heardBy.length);event(g,'DISTRACTED '+noise.heardBy.length+' GUARD'+(noise.heardBy.length===1?'!':'S!'),'land',noise);}}
  else if(isFlagship(g)&&guard.mode==='chase'&&g.now-(guard.lastSeenAt??(guard.attention-1600))>=1500){guard.mode='investigate';guard.victim=null;guard.searchCenter={...(guard.lastSeenPoint||guard.target)};guard.target={...guard.searchCenter};guard.searchAt=0;guard.attention=g.now+3000;if(guard.sentry)guard.sentryUntil=guard.attention;}
  else if(guard.mode==='investigate'&&guard.searchCenter&&guard.attention>g.now){if(!guard.searchAt&&distance(guard,guard.searchCenter)<35)guard.searchAt=g.now;if(guard.searchAt){if(g.now-guard.searchAt>=3000)guard.attention=0;else{const a=(g.now-guard.searchAt)/3000*Math.PI*2;const p={x:guard.searchCenter.x+Math.cos(a)*34,y:guard.searchCenter.y+Math.sin(a)*34};if(clear(p,13,[...g.walls,...zones(g)]))guard.target=p;}}}
  if(!victim&&guard.attention<=g.now){guard.mode='patrol';guard.victim=null;guard.target=guard.route[guard.way];if(distance(guard,guard.target)<16){guard.way=(guard.way+1)%guard.route.length;guard.target=guard.route[guard.way];}}

  if(guard.sentry&&!victim&&(!guard.sentryUntil||g.now>=guard.sentryUntil)){guard.mode='patrol';guard.attention=0;guard.target=guard.sentry;if(distance(guard,guard.sentry)<6){const exhibit=g.loot.find(l=>l.id===guard.sentryArt);guard.angle=(guard.sentryFacing??(exhibit?Math.atan2(exhibit.y-guard.y,exhibit.x-guard.x):Math.PI/2))+Math.sin((g.now-g.start)/1600)*.6;continue;}}
  const old={x:guard.x,y:guard.y};walk(g,guard,guard.target,dt,(guard.mode==='chase'?135:guard.mode==='investigate'?103:62)*(g.alert>=30?1.12:1)*guardSpeed(g,guard.mode));if(distance(old,guard)>0.1)guard.angle=Math.atan2(guard.y-old.y,guard.x-old.x);
  const caught=g.seats.find(s=>!s.escaped&&s.stun<=g.now&&s.safe<=g.now&&!homeSafe(g,s)&&distance(s,guard)<(hidden(g,s)?20:25)&&sight(s,guard,g.walls));
  if(caught){if(!g.training){drop(g,caught,true);g.noises=g.noises.filter(n=>n.attached!==caught.id);}caught.stun=g.now+(g.training?3000:6000);caught.rescueId=null;caught.capturedBy=guard.id;if(!g.training)g.alert=Math.min(100,g.alert+15);caught.dx=caught.dy=0;guard.mode='patrol';guard.attention=0;guard.retreatUntil=g.now+(distance(caught,g.plate)<30?36000:4500);guard.way=(guard.way+1)%guard.route.length;guard.target=guard.route[guard.way];event(g,CREW_NAMES[caught.team]+' · '+caught.name+' caught! Their crew can untie them.','catch',caught);}
 }
 separateGuards(g);
 for(const sensor of sensors(g)){const inside=g.seats.filter(p=>p.x>=sensor.x-12&&p.x<=sensor.x+sensor.w+12&&p.y>=sensor.y-12&&p.y<=sensor.y+sensor.h+12).map(p=>p.id);const entering=inside.filter(id=>!sensor.inside?.includes(id));sensor.inside=inside;if(sensor.cooldown>g.now)continue;const thief=g.seats.find(p=>entering.includes(p.id)&&!p.escaped&&p.stun<=g.now&&!homeSafe(g,p)&&p.x>=sensor.x-12&&p.x<=sensor.x+sensor.w+12&&p.y>=sensor.y-12&&p.y<=sensor.y+sensor.h+12&&(!p.sneak||g.loot.some(l=>l.holder===p.id)));if(thief){if(isFlagship(g)){tripEmitter(g,sensor);continue;}sensor.cooldown=g.now+6000;alarm(g,thief);g.alarmTip=true;event(g,thief.name+' tripped a sensor. Shift sneaks past empty-handed; art always trips it.');}}
 if(g.training&&g.loot.every(l=>l.banked)&&!g.practiceStage){g.practiceStage=1;g.seats.filter(s=>s.bot).forEach(s=>s.mode='follow');addPracticeRival(g);alarm(g,{x:175,y:440});event(g,'LESSON 2: E grabs the red alarm. Aim at Practice rival, then F to plant it.');}
 if(g.training&&g.practiceStage===1&&!g.noises.some(n=>!n.source))alarm(g,{x:175,y:440});
 if(g.training&&g.practiceStage===3){finish(g,'Practice complete: you banked art and planted a rival alarm.');return;}

 if(!g.training&&!g.boardingAt&&g.loot.length&&g.loot.every(l=>l.banked)){g.boardingAt=g.now;g.end=g.now+15000;event(g,'LAST CALL · All art banked. Board your own van within 15s. Left behind costs 25%.','honk');}
 if(g.seats.every(s=>s.escaped)||g.now>=g.end)finish(g,'The van has left.');
}
function addPracticeRival(g:Game){const rival={...g.seats[0],id:'practice-rival',name:'Practice rival',token:undefined,bot:false,team:1,x:250,y:420,hand:null,dx:0,dy:0,safe:g.now+300000,bank:0};g.seats.push(rival);return rival;}
export function roomName(p:Vec){return p.x<320?'Echo Gallery':p.x<640?'Archive':'Private Collection';}
export function stars(g:Game|View,team=0){
 const scores=crewScores(g),bank=scores.find(t=>t.team===team)?.bank||0;
 if(g.crewMode!=='coop'){
  if(bank<=0||scores.some(t=>t.team!==team&&t.bank>bank))return 0;
  if(g.loot.some(l=>l.locked&&l.banked&&l.bankedBy===team||l.value===1200&&l.banked&&l.bankedBy===team))return 3;
  return g.seats.filter(s=>s.team===team).every(s=>s.escaped)?2:1;
 }
 if(bank<COOP_GOAL||!g.seats.some(s=>s.team===team&&(s.escaped||homeSafe(g,s))))return 0;
 const normal=g.loot.filter(l=>l.value!==1200).every(l=>l.banked&&l.bankedBy===team);return normal?(g.loot.some(l=>l.value===1200&&l.banked&&l.bankedBy===team)?3:2):1;
}
export function recapTip(g:Game|View,team=0){
 const crew=g.seats.filter(s=>s.team===team);
 if(crew.some(s=>(s.penalty||0)>0))return 'Head for your loading dock before Last Call ends. Being left behind costs 25%.';
 if(g.events.some(e=>e.kind==='catch'&&e.text.startsWith(CREW_NAMES[team])))return 'Ask Echo to Cover you before crossing a torch with art.';
 if(!crew.some(s=>s.captures))return 'Grab an alarm and throw it away from your route to pull guards aside.';
 if(!g.loot.some(l=>l.value===1200&&l.bankedBy===team))return 'Send one thief to the plate while the other takes the jackpot.';
 return 'Pass valuable art to a teammate to keep the getaway moving.';
}
export function finish(g:Game,reason:string){if(g.phase==='finished')return;g.phase='finished';if(g.jobEvent)g.jobEvent.ended=true;g.finishedAt=g.now;g.finishReason=reason;for(const s of g.seats){if(homeSafe(g,s)&&s.stun<=g.now){s.escaped=true;s.escapedAt??=g.now;}if(!s.escaped&&!g.training){s.penalty=Math.round(s.bank*.25);s.bank-=s.penalty;}s.dx=s.dy=0;}g.total=g.seats.reduce((n,s)=>n+s.bank,0);g.success=g.total>=(g.training?500:g.crewMode==='coop'?COOP_GOAL:500)&&g.seats.some(s=>s.escaped);event(g,reason);}
export function canEndJob(g:Game|View){return g.phase==='playing'&&g.seats.length>0&&g.seats.every(s=>s.escaped);}
export function separateGuards(g:Game){const active=g.guards.filter(h=>guardActive(g,h));const walls=[...g.walls,...zones(g)];for(let iteration=0;iteration<4;iteration++)for(let i=0;i<active.length;i++)for(let j=i+1;j<active.length;j++){const a=active[i],b=active[j],d=distance(a,b);if(d>=20)continue;const angle=d>.01?Math.atan2(b.y-a.y,b.x-a.x):(i+j)*2.399;for(const [h,sign] of [[b,1],[a,-1]] as const){const q={x:h.x+Math.cos(angle)*(20-d+.1)*sign,y:h.y+Math.sin(angle)*(20-d+.1)*sign};if(clear(q,13,walls)){Object.assign(h,q);break;}}}}
export function advance(g:Game,to:number){if(g.phase!=='playing'){g.now=to;return;}const until=Math.min(to,g.now+2000);while(g.now+STEP<=until&&g.phase==='playing'){g.now+=STEP;step(g);}if(to-until>0){g.end+=to-until;g.now=to;}}
export function command(g:Game,id:string,a:{type:string;name?:string;botId?:string;seatId?:string;preset?:'friends'|'bots';seq?:number;dx?:number;dy?:number;aim?:Vec;action?:string;crewMode?:CrewMode;team?:number;match?:number;sneak?:boolean;difficulty?:Difficulty},arenaFactory?:typeof museumArena){const s=g.seats.find(s=>s.id===id);if(!s)throw Error('Join the crew first.');s.lastSeen=g.now;
 if(a.type==='start'){if(g.host!==id||g.phase!=='lobby')throw Error('Only the host can start from the lobby.');if(g.crewMode!=='coop'){const scores=crewScores(g),size=g.crewMode==='duos'?2:3;if(!isDuel(g)&&(scores.length!==2||scores.some(t=>g.seats.filter(s=>s.team===t.team).length!==size)))throw Error('Balance crews or fill empty slots with bots first.');}setup(g,arenaFactory);}
 else if(a.type==='ready'){if(g.phase!=='ready')return;s.ready=true;if(g.seats.every(s=>s.ready))begin(g);}
 else if(a.type==='difficulty'){if(g.host!==id||g.phase!=='lobby')throw Error('Host chooses difficulty in the lobby.');if(['rookie','normal','pro'].includes(a.difficulty||''))g.difficulty=a.difficulty;}
 else if(a.type==='configure'){if(g.host!==id)throw Error('Host only.');if(['coop','duos','trios'].includes(a.crewMode||''))configure(g,a.crewMode!);}
 else if(a.type==='fill'){if(g.host!==id)throw Error('Host only.');fillCrews(g);}
 else if(a.type==='team'){if(g.phase!=='lobby'||g.crewMode==='coop')return;const target=a.seatId?g.seats.find(p=>p.id===a.seatId):s;if(!target)throw Error('Seat not found.');if(target.id!==id&&g.host!==id)throw Error('Only the host can move another player.');const team=Number(a.team);if(!Number.isInteger(team)||team<0||team>1)throw Error('Choose Mint or Violet.');target.team=team;}
 else if(a.type==='bot'){if(g.host!==id||g.phase!=='lobby')throw Error('Only the host can change the lobby.');if((a.team===0||a.team===1)&&g.crewMode!=='coop'&&g.seats.filter(p=>p.team===a.team).length>=(g.crewMode==='trios'?3:2))throw Error('That crew is full.');const b=add(g,['Echo','Pip','Moss','Jinx','Vale'][g.seats.filter(s=>s.bot).length]||'Echo','bot'+g.serial,true);if(a.team===0||a.team===1)b.team=g.crewMode==='coop'?0:a.team;}
 else if(a.type==='preset'){if(g.host!==id||g.phase!=='lobby')throw Error('Only the host can change the lobby.');const humans=g.seats.filter(p=>!p.bot);if(a.preset==='bots'&&humans.length>3)throw Error('Friends vs bots supports up to three humans.');if(a.preset!=='bots'&&a.preset!=='friends')throw Error('Unknown preset.');g.seats=humans;configure(g,humans.length>(a.preset==='bots'?2:4)?'trios':'duos');if(a.preset==='bots'){g.seats.forEach(p=>p.team=0);const n=Math.max(1,humans.length);for(let i=0;i<n;i++){const b=add(g,['Echo','Pip','Moss'][i],'bot'+g.serial,true);b.team=1;}}}
 else if(a.type==='remove'){if(g.host!==id||g.phase!=='lobby')throw Error('Only the host can change the lobby.');g.seats=g.seats.filter(s=>!s.bot||s.id!==a.botId);}
 else if(a.type==='replay'){if(g.host!==id||g.phase!=='finished')throw Error('Only the host can replay a finished job.');setup(g,arenaFactory);}
 else if(a.type==='endJob'){if(!canEndJob(g))throw Error('Every thief must board first.');finish(g,'The human crews ended the job. Banked loot decides the result.');}
 else if(a.type==='input'){if(a.match!==undefined&&a.match!==g.match)return;input(g,s,a);}
}
export function view(g:Game,id:string){return {...g,you:id,events:g.events.filter(e=>e.team===undefined||e.team===g.seats.find(s=>s.id===id)?.team),seats:g.seats.map(({token,...s})=>s)};}
export type View=ReturnType<typeof view>;

export function routeLength(g:Game|View,from:Vec,to:Vec){const p={...from};let length=0;for(let i=0;i<2500&&distance(p,to)>2;i++){const q=steer(p,to,g.walls),d=distance(p,q);if(d<.01)return Infinity;const before={...p};move(p,(q.x-p.x)/d,(q.y-p.y)/d,.02,Math.min(150,d/.02),g.walls);const moved=distance(p,before);if(moved<.001)return Infinity;length+=moved;}return distance(p,to)<=2?length:Infinity;}
export const blackoutActive=(g:Game|View)=>g.jobEvent?.kind==='blackout'&&g.jobEvent.started&&!g.jobEvent.ended;
function offsetRoute(g:Game,r:Vec[]){for(const [dx,dy] of [[0,20],[0,-20],[20,0],[-20,0],[0,10],[10,0]]){const c=r.map(p=>({x:p.x+dx,y:p.y+dy}));if(c.every((p,i)=>corridor(p,c[(i+1)%c.length],g.walls)))return c;}return r.map((p,i)=>({x:p.x*.8+r[(i+1)%r.length].x*.2,y:p.y*.8+r[(i+1)%r.length].y*.2}));}
export function patrolPool(g:Game){if(g.arena)return g.arena.routes;if(g.crewMode!=='coop'){const m=RIVAL_LAYOUTS[g.layout],alt=offsetRoute(g,m.routes[0]),transform=m.symmetry==='rotate'?rotatePoint:mirrorPoint;const main=m.routes[2],spare=RIVAL_REINFORCEMENTS[g.layout];const inspect=(r:Vec[])=>{const copy=r.map(p=>({...p}));if(g.layout===0){const i=copy.findIndex(p=>p.y>=350);copy.splice(i+1,0,widePoint({x:480,y:380}),{...g.plate},widePoint({x:480,y:380}));}else if(g.layout===1){copy.push(...[{x:410,y:300},{x:410,y:170},{x:550,y:170},{x:550,y:300},{x:410,y:300}].map(widePoint));}else {const i=copy.findIndex(p=>p.y>=340);copy.splice(i+1,0,widePoint({x:540,y:380}),widePoint({x:540,y:440}),{...g.plate},widePoint({x:420,y:440}),widePoint({x:420,y:380}));}const clean=copy.filter((p,i)=>i===0||distance(p,copy[i-1])>.01);if(distance(clean[0],clean[clean.length-1])<.01)clean.pop();return clean;};return [m.routes[0],m.routes[1],inspect(main),alt,alt.map(transform),inspect(spare)];}const base=g.guards.slice(0,3).map(h=>h.route);return [...base,...base.map(r=>offsetRoute(g,r))];}
function placeOnRoute(h:Guard,route:Vec[],fraction:number){h.route=route.map(p=>({...p}));const lengths=route.map((p,i)=>distance(p,route[(i+1)%route.length]));let offset=lengths.reduce((a,b)=>a+b,0)*fraction;let i=0;while(offset>lengths[i]&&i<route.length-1)offset-=lengths[i++];const a=route[i],b=route[(i+1)%route.length],t=offset/(lengths[i]||1);Object.assign(h,{x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,way:(i+1)%route.length,target:{...b},angle:Math.atan2(b.y-a.y,b.x-a.x),mode:'patrol',attention:0,victim:null});}
function setupVariety(g:Game){
 g.lootTotal=LOOT_TOTAL;
 const variant=Math.floor(random(g)*3),cheap=variant===0?300:200,mid=variant===0?500:variant===1?600:500,big=variant===1?1100:1000;
 const rival=g.crewMode!=='coop',map=RIVAL_LAYOUTS[g.layout],transform=map.symmetry==='rotate'?rotatePoint:mirrorPoint;
 const oldJack=g.loot.find(l=>l.value===1200)!;let left:Vec,right:Vec,jack:Vec,bigSpot:Vec,midSpot:Vec,extra:Vec;
 if(rival){left=map.slots[Math.floor(random(g)*map.slots.length)];right=transform(left);jack=map.jackpot;bigSpot=map.idol;midSpot=[{x:480,y:240},{x:480,y:180},{x:480,y:220}][g.layout];extra=[{x:480,y:370},{x:480,y:410},{x:480,y:350}][g.layout];}
 else {const far=[{x:835,y:120},{x:810,y:470},{x:710,y:330},{x:870,y:350}];for(let i=far.length-1;i>0;i--){const j=Math.floor(random(g)*(i+1));[far[i],far[j]]=[far[j],far[i]];}[bigSpot,midSpot,jack,extra]=far;const near=PEDESTALS.filter(p=>p.x<620);left=near[Math.floor(random(g)*near.length)];right=near.filter(p=>distance(p,left)>1)[Math.floor(random(g)*(near.length-1))];g.plate={x:730,y:155};}
 const make=(id:string,name:string,value:number,p:Vec,locked=false):Loot=>({id,name,value,...p,home:{...p},holder:null,banked:false,locked});
 g.loot=[make('art1','Pocket relic',cheap,left),make('art2','Pocket relic',cheap,right),make('art3',oldJack.name,1200,jack,true),make('art4','Grand exhibit',big,bigSpot),make('art5','Silver collection',mid,midSpot)];
 if(variant===2)g.loot.push(make('art6','Curator souvenir',200,extra));
 if(rival){
  const slots=RIVAL_LOOT_SLOTS[g.layout],available=slots.deep.filter(p=>distance(p,left)>=65),deep=available[Math.floor(random(g)*available.length)],c=Math.floor(random(g)*3);
  // $1600 in equal wings, $1700 shared. Requested 40–45% is incompatible with minimum wing values.
  jack=slots.jack[c];bigSpot=slots.centre[c];
  g.loot=[make('art1','Pocket relic',200,left),make('art2','Pocket relic',200,right),make('art3',oldJack.name,1200,jack,true),make('art4','Contested collection',500,bigSpot),make('art5','Wing masterpiece',600,deep),make('art6','Wing masterpiece',600,transform(deep))];
 }


 // Eight useful jobs: three per wing, two contested. Architecture never changes.
 if(rival){
  const candidates=[{x:100,y:180},{x:280,y:170},{x:280,y:300},{x:120,y:280},{x:260,y:310},{x:100,y:80},{x:280,y:80},{x:100,y:340}].map(widePoint).filter(p=>clear(p,14,g.walls)&&g.loot.every(l=>distance(l,p)>=65&&distance(l,transform(p))>=65)&&routeLength(g,vanFor(g,0),p)>=250&&routeLength(g,vanFor(g,1),transform(p))>=250);
  if(!candidates.length)throw Error('No fair mid-tier display slot for arena '+g.layout);
  const middle=candidates[Math.floor(random(g)*candidates.length)];g.loot.push(make('art7','Moonlit portrait',500,middle),make('art8','Moonlit portrait',500,transform(middle)));
 }else{
  const v=Math.floor(random(g)*3),leftDeep=[{x:100,y:100},{x:200,y:90},{x:250,y:90}][v],leftMid=[{x:250,y:170},{x:80,y:190},{x:100,y:90}][v];
  const centralCheap=[{x:440,y:285},{x:390,y:330},{x:560,y:280},{x:550,y:220}][Math.floor(random(g)*4)],centralMid={x:530,y:330},centralDeep={x:550,y:90};
  const right=[{x:835,y:120},{x:810,y:470},{x:870,y:350}];
  g.loot=[make('art1','Pocket relic',200,[{x:205,y:320},{x:230,y:380},{x:240,y:280},{x:120,y:300},{x:120,y:400}][Math.floor(random(g)*5)]),make('art2','Music box',200,centralCheap),make('art3','Crown mask',1200,right[v],true),make('art4','Contested collection',500,right[(v+1)%3]),make('art5','Wing masterpiece',600,leftDeep),make('art6','Wing masterpiece',600,centralDeep),make('art7','Moonlit portrait',500,leftMid),make('art8','Blue moon vase',500,centralMid)];
  g.plate={x:530,y:460};
 }
 if(g.crewMode==='coop'&&g.guards.length<3){const route=[{x:710,y:115},{x:880,y:115},{x:880,y:510},{x:710,y:510}];g.guards.push({...g.guards[0],id:'g2',route,way:0,target:route[0],...route[0]});}
 const pool=patrolPool(g),alt=random(g)<.5,phase=random(g);g.guards.forEach((h,i)=>{const r=rival?pool[i<2?(alt?3+i:i):(random(g)<.5?2:5)]:pool[i%pool.length];placeOnRoute(h,r,(phase+(i===1&&rival?0:i*.31))%1);});
 const kind=(['blackout','shift','curator','vault'] as const)[Math.floor(random(g)*4)],at=20000+Math.floor(random(g)*45001);
 g.jobEvent={kind,at,until:at+(kind==='blackout'?8000:kind==='vault'?15000:1000),warned:false,started:false,ended:false};
 if(kind==='vault'){const l=g.loot.find(l=>l.id===(rival?'art4':'art5'))!;l.sealed=true;l.eventPiece=true;}
}
export function updateJobEvent(g:Game){const e=g.jobEvent;if(!e||g.phase!=='playing')return;
 if(!e.warned&&g.now>=e.at-3000){e.warned=true;event(g,({blackout:'BLACKOUT',shift:'SHIFT CHANGE',curator:'CURATOR TRANSFER',vault:'SIDE VAULT'}[e.kind])+' IN 3 SECONDS','honk');}
 if(!e.started&&g.now>=e.at){e.started=true;e.flashUntil=g.now+4000;
 if(e.kind==='blackout')event(g,'BLACKOUT · Guard vision reduced for 8s. Follow the glowing art.','honk');
 if(e.kind==='shift'){const pool=patrolPool(g),used=new Set<string>();g.guards.filter(h=>!h.sentry).forEach((h,i)=>{const preferred=g.crewMode==='coop'?pool[(i+1)%pool.length]:pool[i<2?(JSON.stringify(h.route)===JSON.stringify(pool[i])?3+i:i):2];const r=preferred&&JSON.stringify(preferred)!==JSON.stringify(h.route)&&!used.has(JSON.stringify(preferred))?preferred:pool.find(r=>JSON.stringify(r)!==JSON.stringify(h.route)&&!used.has(JSON.stringify(r)))||pool[(i+1)%pool.length];used.add(JSON.stringify(r));h.route=r.map(p=>({...p}));h.way=r.reduce((best,p,j)=>distance(h,p)<distance(h,r[best])?j:best,0);h.way=(h.way+i)%r.length;h.target={...r[h.way]};h.mode='patrol';h.attention=0;h.victim=null;});event(g,'SHIFT CHANGE · New patrol circuits. Sentries keep their exhibits.','honk');}
 if(e.kind==='curator'){const pair=g.loot.slice(0,2);if(pair.every(l=>!l.holder&&!l.banked&&!l.droppedAt)){const slots=g.arena?g.arena.slots:g.crewMode==='coop'?PEDESTALS:RIVAL_LAYOUTS[g.layout].slots;const from=pair[0];const near=routeLength(g,vanFor(g,0),from)<250;const next=slots.find(p=>distance(p,from)>60&&!g.loot.some(l=>distance(l,p)<50)&&(routeLength(g,vanFor(g,0),p)<250)===near);if(next){const other=g.arena||g.crewMode==='coop'?pair[1]:(RIVAL_LAYOUTS[g.layout].symmetry==='rotate'?rotatePoint:mirrorPoint)(next);e.moves=[{from:{x:pair[0].x,y:pair[0].y},to:{...next}}];if(g.crewMode!=='coop')e.moves.push({from:{x:pair[1].x,y:pair[1].y},to:{...other}});Object.assign(pair[0],next,{home:{...next}});if(g.crewMode!=='coop')Object.assign(pair[1],other,{home:{x:other.x,y:other.y}});event(g,'CURATOR TRANSFER · Unclaimed pocket exhibits moved within their danger tier.','honk');}else event(g,'CURATOR TRANSFER · No equivalent free display; exhibits stay put.','honk');}else event(g,'CURATOR TRANSFER · Crew already claimed the exhibits. Transfer cancelled.','honk');}
 if(e.kind==='vault'){g.loot.filter(l=>l.eventPiece).forEach(l=>l.sealed=false);event(g,'UNEXPECTED LOOT · A new exhibit has arrived! Available until the van leaves.','honk');}
 }
 // Arrival is permanent: resealing an unclaimed exhibit made a full collection impossible.
 if(e.started&&!e.ended&&g.now>=e.until){e.ended=true;if(e.kind!=='vault')event(g,e.kind==='blackout'?'POWER RESTORED':'Museum event complete.');}
}
