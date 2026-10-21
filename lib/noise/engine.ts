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
export const vanFor=(g:Game|View,team:number):Vec=>g.crewMode==='coop'?EXIT:team===0?{x:90,y:510}:team===1?{x:870,y:g.layout===1?90:510}:{x:480,y:65};
export const zoneFor=(g:Game|View,team:number):Rect=>{const p=vanFor(g,team);return {x:p.x-35,y:p.y-35,w:70,h:70};};
export const zones=(g:Game|View):Rect[]=>[...new Set(g.seats.map(s=>s.team))].map(t=>zoneFor(g,t));
export const homeSafe=(g:Game|View,s:Vec&{team:number})=>inside(s,zoneFor(g,s.team));
export const anySafe=(g:Game|View,p:Vec)=>zones(g).some(r=>inside(p,r));
export const thiefWalls=(g:Game|View,s:{team:number})=>[...g.walls,...[...new Set(g.seats.map(p=>p.team))].filter(t=>t!==s.team&&g.crewMode!=='coop').map(t=>zoneFor(g,t))];
export type Sensor=Rect&{id:string;cooldown:number;inside?:string[]};
export function sensors(g:Game|View):Sensor[]{return g.sensors||[];}
export const CARRY_SPEED=100;
export const LOOT_TOTAL=3300;
export const carrySpeed=(value:number)=>110-Math.max(0,Math.min(1300,value-200))*30/1300;
export const COOP_GOAL=1800;
export const LAYOUT_NAMES=['Echo Gallery','Night Archive','Crossroads'];
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
export const RIVAL_LAYOUTS=[
 {symmetry:'mirror',half:[{x:180,y:160,w:40,h:40},{x:180,y:360,w:40,h:40},{x:330,y:200,w:28,h:70},{x:400,y:24,w:20,h:180},{x:400,y:204,w:40,h:20},{x:400,y:396,w:40,h:20},{x:400,y:416,w:20,h:160}],shared:[{x:440,y:290,w:80,h:20}],slots:[{x:130,y:150},{x:280,y:280},{x:130,y:390}],jackpot:{x:480,y:140},idol:{x:480,y:350},plate:{x:480,y:470},sensors:[{x:440,y:204,w:80,h:8},{x:440,y:408,w:80,h:8}],patrol:[{x:100,y:100},{x:300,y:100},{x:100,y:440},{x:300,y:440}],centreRoute:[{x:380,y:240},{x:580,y:240},{x:600,y:350},{x:480,y:380},{x:360,y:350}]},
 {symmetry:'rotate',half:[{x:360,y:24,w:20,h:236},{x:360,y:340,w:20,h:236},{x:130,y:130,w:150,h:24},{x:80,y:240,w:140,h:24},{x:180,y:350,w:140,h:24},{x:440,y:220,w:80,h:20}],shared:[],slots:[{x:100,y:190},{x:280,y:290},{x:120,y:420}],jackpot:{x:510,y:450},idol:{x:480,y:300},plate:{x:450,y:150},sensors:[{x:360,y:274,w:20,h:52},{x:580,y:274,w:20,h:52}],patrol:[{x:80,y:90},{x:320,y:90},{x:320,y:190},{x:260,y:290},{x:80,y:300},{x:80,y:430},{x:340,y:430},{x:340,y:90}],centreRoute:[{x:410,y:170},{x:550,y:170},{x:550,y:300},{x:410,y:300},{x:410,y:430},{x:550,y:430},{x:550,y:300},{x:410,y:300}]},
 {symmetry:'mirror',half:[{x:180,y:140,w:200,h:100},{x:180,y:360,w:200,h:100},{x:380,y:24,w:20,h:120},{x:400,y:144,w:40,h:20},{x:380,y:420,w:20,h:156}],shared:[{x:440,y:400,w:80,h:20}],slots:[{x:100,y:180},{x:100,y:300},{x:100,y:420}],jackpot:{x:480,y:90},idol:{x:480,y:300},plate:{x:480,y:510},sensors:[{x:440,y:144,w:80,h:8},{x:380,y:270,w:8,h:60},{x:572,y:270,w:8,h:60}],patrol:[{x:100,y:100},{x:140,y:260},{x:340,y:280},{x:140,y:340},{x:150,y:490}],centreRoute:[{x:440,y:190},{x:520,y:260},{x:520,y:340},{x:480,y:380},{x:440,y:340},{x:440,y:260}]}
].map(m=>{const transform=m.symmetry==='rotate'?rotatePoint:mirrorPoint,rectTransform=m.symmetry==='rotate'?rotateRect:mirrorRect;return {...m,walls:[...WALLS.slice(0,4),...m.half,...m.half.map(rectTransform),...m.shared],routes:[m.patrol,m.patrol.map(transform),m.centreRoute]};});
export const RIVAL_REINFORCEMENTS:Vec[][]=[
 [{x:380,y:350},{x:480,y:380},{x:580,y:350},{x:580,y:240},{x:380,y:240}],
 [{x:410,y:300},{x:480,y:280},{x:550,y:300},{x:550,y:430},{x:410,y:410}],
 [{x:420,y:260},{x:480,y:210},{x:540,y:260},{x:540,y:340},{x:480,y:380},{x:420,y:340}]
];
export const PEDESTALS:Vec[]=[{x:205,y:320},{x:250,y:90},{x:440,y:285},{x:530,y:330},{x:835,y:120},{x:810,y:470},{x:710,y:330},{x:870,y:350}];
export type Thief=Vec&{id:string;name:string;bot:boolean;token?:string;dx:number;dy:number;aim:Vec;inputAt:number;lastSeq:number;ready:boolean;hand:string|null;stun:number;safe:number;escaped:boolean;captures:number;rescues:number;bank:number;cooldown:number;mode:'follow'|'fetch'|'cover'|'plate';lastSeen:number;team:number;windup:number;bestThrow:number;rescueId:string|null;rescueAt:number;bottleId:string|null;bottleAt:number;sneak?:boolean;plateJob?:string;capturedBy?:string;retreatUntil?:number;penalty?:number;escapedAt?:number;ambushUntil?:number;calloutAt?:number;};
export type Guard=Vec&{id:string;angle:number;mode:'patrol'|'investigate'|'chase';target:Vec;route:Vec[];way:number;attention:number;victim:string|null;luredUntil?:number;searchAt?:number;searchCenter?:Vec;retreatUntil?:number;};
export type Loot=Vec&{id:string;name:string;value:number;holder:string|null;banked:boolean;bankedBy?:number;quietUntil?:number;home?:Vec;droppedAt?:number;recoverAt?:number;locked?:boolean;sealed?:boolean;claimed?:boolean;eventPiece?:boolean};
export type Noise=Vec&{id:string;holder:string|null;expires:number;born:number;vx:number;vy:number;flight:number;kind:'alarm'|'capsule';source:string|null;attached?:string|null;thrownBy?:string;thrownAt?:number;counted?:boolean;heardBy?:string[];heardAt?:Record<string,number>;alerted?:boolean};
export type Event={id:number;at:number;text:string;kind:'info'|'capture'|'throw'|'catch'|'bank'|'rescue'|'honk'|'land';x:number;y:number};
export type JobEvent={kind:'blackout'|'shift'|'curator'|'vault';at:number;until:number;warned:boolean;started:boolean;ended:boolean};
export type Game={version:3;jobEvent?:JobEvent;lootTotal?:number;sensors?:Sensor[];practiceStage?:number;training?:boolean;match:number;layout:number;walls:Rect[];plate:Vec;lockdown:boolean;alarmTip:boolean;finishReason:string;finishedAt?:number;crewMode:CrewMode;alert:number;boardingAt:number;honking:boolean;code:string;host:string;phase:'lobby'|'ready'|'playing'|'finished';seats:Thief[];guards:Guard[];loot:Loot[];noises:Noise[];events:Event[];serial:number;now:number;start:number;end:number;seed:number;revision:number;alarmAt:number;total:number;success:boolean};
export const distance=(a:Vec,b:Vec)=>Math.hypot(a.x-b.x,a.y-b.y);
export function clear(p:Vec,r=12,walls:Rect[]=WALLS){return p.x>=24+r&&p.x<=936-r&&p.y>=24+r&&p.y<=576-r&&!walls.some(w=>p.x>w.x-r&&p.x<w.x+w.w+r&&p.y>w.y-r&&p.y<w.y+w.h+r);}
export function sight(a:Vec,b:Vec,walls:Rect[]=WALLS){const n=Math.ceil(distance(a,b)/8);for(let i=1;i<n;i++)if(!clear({x:a.x+(b.x-a.x)*i/n,y:a.y+(b.y-a.y)*i/n},0,walls))return false;return true;}
export function move(p:Vec,dx:number,dy:number,dt:number,speed=150,walls:Rect[]=WALLS){const len=Math.hypot(dx,dy);if(!len)return;dx/=Math.max(1,len);dy/=Math.max(1,len);const x=p.x+dx*speed*dt,y=p.y+dy*speed*dt;if(clear({x,y:p.y},12,walls))p.x=x;if(clear({x:p.x,y},12,walls))p.y=y;}
function random(g:Game){g.seed=(Math.imul(1664525,g.seed)+1013904223)>>>0;return g.seed/4294967296;}
export function event(g:Game,text:string,kind:Event['kind']='info',p:Vec=EXIT){g.events.push({id:++g.serial,at:g.now,text,kind,x:p.x,y:p.y});g.events=g.events.slice(-12);}
export function create(code:string,now=0,seed=13):Game{return {version:3,match:0,layout:-1,walls:WALLS,plate:PLATE,lockdown:false,alarmTip:false,finishReason:'',crewMode:'coop',alert:0,boardingAt:0,honking:false,code,host:'',phase:'lobby',seats:[],guards:[],loot:[],noises:[],events:[],serial:0,now,start:0,end:0,seed:Math.imul(seed^(seed>>>16),0x45d9f3b)>>>0,revision:0,alarmAt:0,total:0,success:false};}
export function add(g:Game,name:string,token:string,bot=false){if(g.phase!=='lobby')throw Error('This job has started. Join the next one.');if(g.seats.length>=6)throw Error('Crew full (six thieves).');const id='p'+(++g.serial);const s:Thief={id,name:name.trim().slice(0,18)||'Rookie',token:bot?undefined:token,bot,x:85+g.seats.length*30,y:485,dx:0,dy:0,aim:{x:500,y:300},inputAt:0,lastSeq:0,ready:false,hand:null,stun:0,safe:0,escaped:false,captures:0,rescues:0,bank:0,cooldown:0,mode:'follow',lastSeen:g.now,team:0,windup:0,bestThrow:0,rescueId:null,rescueAt:0,bottleId:null,bottleAt:0};if(g.crewMode!=='coop'){const count=g.crewMode==='trios'?2:Math.max(2,...g.seats.map(p=>p.team+1));s.team=Array.from({length:count},(_,i)=>i).sort((a,b)=>g.seats.filter(p=>p.team===a).length-g.seats.filter(p=>p.team===b).length)[0];}g.seats.push(s);if(!g.host)g.host=id;return s;}
export function setup(g:Game){g.seats=g.seats.filter(s=>s.id!=='practice-rival');if(g.crewMode!=='coop'&&g.seats.some(s=>s.team>1)){g.crewMode=g.seats.length>4?'trios':'duos';g.seats.forEach((s,i)=>s.team=i%2);}g.phase='ready';g.events=[];g.noises=[];g.total=0;g.success=false;g.start=0;g.end=0;g.alert=0;g.boardingAt=0;g.honking=false;g.lockdown=false;g.alarmTip=false;g.finishReason='';g.finishedAt=undefined;g.jobEvent=undefined;g.lootTotal=undefined;g.match++;g.practiceStage=0;
 const previous=g.layout;g.layout=previous<0?Math.floor(random(g)*3):(previous+1+Math.floor(random(g)*2))%3;g.walls=LAYOUTS[g.layout];g.plate={x:730,y:155};
 g.seats.forEach((s,i)=>Object.assign(s,{x:80+i*28,y:495,dx:0,dy:0,hand:null,stun:0,safe:0,escaped:false,captures:0,rescues:0,bank:0,cooldown:0,ready:s.bot,lastSeq:0,inputAt:0,mode:'follow',windup:0,bestThrow:0,rescueId:null,rescueAt:0,bottleId:null,bottleAt:0,sneak:false,plateJob:undefined,capturedBy:undefined,retreatUntil:0,penalty:0,escapedAt:undefined,ambushUntil:0,calloutAt:undefined}));
 g.loot=[{id:'art1',name:'Golden echo',value:500,x:205,y:320},{id:'art2',name:'Moon vase',value:800,x:440,y:285},{id:'art3',name:'The scream',value:1200,x:835,y:120},{id:'art4',name:'Blue idol',value:1000,x:810,y:470}].map(x=>({...x,holder:null,banked:false}));
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
 g.sensors=(g.crewMode==='coop'?coopSensors[g.layout]:RIVAL_LAYOUTS[g.layout].sensors).map((r,i)=>({...r,id:'sensor-'+i,cooldown:0}));
 if(!g.training)setupVariety(g);
 event(g,'Grab the gold. Steal its alarm. Get back to the van.');
}
function begin(g:Game){g.phase='playing';g.start=g.now;g.end=g.now+(g.training?300000:DURATION);g.alarmAt=g.now+18000;if(g.jobEvent){g.jobEvent.at+=g.now;g.jobEvent.until+=g.now;}event(g,g.training?'Practice: grab art, order Echo to Cover me, and bank it. Then plant a capsule on the practice rival.':'Job is live. The van leaves in 90 seconds.');}
function alarm(g:Game,p:Vec,source:string|null=null,attached:string|null=null){const id='n'+(++g.serial);g.noises.push({id,x:p.x,y:p.y,holder:null,expires:g.now+(attached?90000:6500),born:g.now,vx:0,vy:0,flight:0,kind:'alarm',source,attached});return id;}
export function sameCrew(a:{team:number},b:{team:number}){return a.team===b.team;}
export function crewScores(g:Game|View){return [...new Set(g.seats.map(s=>s.team))].sort().map(team=>({team,name:CREW_NAMES[team],bank:g.seats.filter(s=>s.team===team).reduce((n,s)=>n+s.bank,0)}));}
export function plateOpen(g:Game|View){return g.seats.some(s=>!s.escaped&&s.stun<=g.now&&distance(s,g.plate)<30);}
function capturable(g:Game|View,s:Thief,n:Noise){return !n.holder&&n.flight<=0&&!(n.thrownBy===s.id&&g.now-(n.thrownAt||0)<3000)&&distance(n,s)<(n.attached?90:115)&&sight(s,n,g.walls);}
export function interaction(g:Game|View,s:Thief):{label:string;target?:Vec;id?:string;kind:string}{
 if(s.escaped)return {label:'In van',kind:'none'};
 if(s.stun>g.now)return {label:'Free in '+Math.ceil((s.stun-g.now)/1000)+'s',kind:'none'};
 const friend=g.seats.find(p=>p.id!==s.id&&sameCrew(p,s)&&!p.escaped&&p.stun>g.now&&distance(p,s)<40&&sight(s,p,g.walls));
 if(friend)return {label:s.rescueId===friend.id?'Rescuing '+Math.min(100,Math.round((g.now-s.rescueAt)/15))+'%':'Rescue '+friend.name,target:friend,id:friend.id,kind:'rescue'};
 if(s.hand)return {label:g.noises.some(n=>n.id===s.hand)?'Aim + throw':'Carry to van',kind:'none'};

 const n=g.noises.filter(n=>capturable(g,s,n)).sort((a,b)=>distance(a,s)-distance(b,s))[0];
 if(n)return {label:n.attached?'Steal scream':'Capture alarm',target:n,id:n.id,kind:'noise'};
 const l=g.loot.filter(l=>!l.holder&&!l.banked&&!l.sealed&&distance(l,s)<55&&sight(s,l,g.walls)).sort((a,b)=>distance(a,s)-distance(b,s))[0];
 if(l)return {label:l.locked&&!plateOpen(g)?'Need plate held':'Grab '+l.name,target:l,id:l.id,kind:l.locked&&!plateOpen(g)?'locked':'loot'};
 return {label:'No target nearby',kind:'none'};
}
export function configure(g:Game,mode:CrewMode){if(g.phase!=='lobby')throw Error('Choose crews in the lobby.');if(mode==='duos'&&g.seats.length>4)mode='trios';g.crewMode=mode;const teams=mode==='coop'?1:2;g.seats.forEach((s,i)=>s.team=i%teams);}
export function fillCrews(g:Game){if(g.phase!=='lobby')throw Error('Fill crews before starting.');const teams=g.crewMode==='coop'?1:g.crewMode==='trios'?2:Math.max(2,...g.seats.map(s=>s.team+1));const size=g.crewMode==='trios'?3:g.crewMode==='duos'?2:Math.max(2,g.seats.length);for(let team=0;team<teams;team++)while(g.seats.filter(s=>s.team===team).length<size&&g.seats.length<6){const b=add(g,['Echo','Pip','Moss','Jinx','Vale'][g.seats.filter(s=>s.bot).length]||'Echo','bot',true);b.team=team;}}
function hush(g:Game,l:Loot){g.noises=g.noises.filter(n=>!(n.source===l.id&&n.attached));}
function drop(g:Game,s:Thief,captured=false){if(!s.hand)return;const l=g.loot.find(x=>x.id===s.hand),n=g.noises.find(x=>x.id===s.hand);if(l){l.holder=null;l.x=s.x;l.y=s.y;l.droppedAt=g.now;l.recoverAt=g.now+12000;event(g,CREW_NAMES[s.team]+' dropped '+l.name+' at '+roomName(l)+'!');const n=g.noises.find(n=>n.source===l.id&&n.attached);if(n){if(captured)hush(g,l);else{n.attached=null;n.expires=g.now+6500;n.x=s.x;n.y=s.y;}}if(captured)l.quietUntil=g.now+8000;}if(n){n.attached=null;n.thrownBy=s.id;n.thrownAt=g.now;n.heardBy=[];n.holder=null;n.x=s.x;n.y=s.y;n.expires=g.now+5000;n.born=g.now;}s.hand=null;}
export function action(g:Game,s:Thief,type:string,aim?:Vec){if(g.phase!=='playing'||s.escaped||s.stun>g.now)return;
 if(type==='extract'){if(!homeSafe(g,s)){event(g,'Return to your own crew’s getaway zone first.');return;}const held=g.loot.find(l=>l.id===s.hand);if(held){hush(g,held);held.banked=true;held.bankedBy=s.team;held.holder=null;s.hand=null;s.bank+=held.value;g.total+=held.value;}drop(g,s);g.noises=g.noises.filter(n=>n.attached!==s.id);s.escaped=true;s.escapedAt=g.now;s.dx=s.dy=0;event(g,s.name+' is in the van.','bank',s);return;}
 if(type==='help'||type.startsWith('help:')){const crew=g.seats.filter(x=>x.bot&&sameCrew(x,s));const modes=['follow','cover','fetch','plate'] as const;const requested=type.split(':')[1];const mode=modes.includes(requested as typeof modes[number])?requested as typeof modes[number]:modes[(modes.indexOf(crew[0]?.mode||'follow')+1)%modes.length];crew.forEach(b=>b.mode=mode);event(g,CREW_NAMES[s.team]+': '+({cover:'Covering your scream.',fetch:'Fetching nearby art.',follow:'Following. Alarms are yours.',plate:'Holding the jackpot plate.'}[mode]));return;}
 if(g.now<s.cooldown)return;s.cooldown=g.now+260;
 if(type==='drop'){drop(g,s);event(g,s.name+' put it down.','info',s);return;}
 if(type==='grab'){
  const target=interaction(g,s);
  if(target.kind==='rescue'){if(s.rescueId!==target.id){s.rescueId=target.id!;s.rescueAt=g.now;const guard=g.guards.find(h=>h.id===g.seats.find(p=>p.id===target.id)?.capturedBy);if(guard)guard.retreatUntil=Math.max(guard.retreatUntil||0,g.now+2500);event(g,'Stay beside '+g.seats.find(p=>p.id===target.id)!.name+' for 1.5s to rescue.');}return;}
  if(target.kind==='noise'){const n=g.noises.find(n=>n.id===target.id)!;if(n.attached){const l=g.loot.find(l=>l.id===n.source);if(l)l.quietUntil=g.now+8000;n.attached=null;}else if(n.source){const l=g.loot.find(l=>l.id===n.source);if(l)l.quietUntil=g.now+8000;}n.holder=s.id;n.flight=0;n.vx=n.vy=0;n.kind='capsule';n.expires=g.now+10000;s.hand=n.id;if(!n.counted){s.captures++;n.counted=true;}s.windup=g.now+650;event(g,s.name+' stole the scream. Aim, then throw!','capture',s);return;}
  if(target.kind==='loot'){const l=g.loot.find(l=>l.id===target.id)!;l.holder=s.id;l.claimed=true;l.locked=false;l.droppedAt=undefined;l.recoverAt=undefined;s.hand=l.id;if(!l.quietUntil||l.quietUntil<=g.now){hush(g,l);alarm(g,s,l.id,s.id);}event(g,'The art screams! G drops it. An empty-handed partner can steal its scream.','info',s);return;}
  if(target.kind==='locked')event(g,'The Scream is locked. A teammate must hold the marked plate.');
  return;
 }
 if(type==='throw'&&s.hand){let target=aim||s.aim;const carrier=g.seats.find(r=>r.team!==s.team&&!r.escaped&&!homeSafe(g,r)&&distance(r,target)<40&&g.loot.some(l=>l.holder===r.id));if(carrier){const lead=Math.min(.6,distance(s,carrier)/430);target={x:carrier.x+carrier.dx*CARRY_SPEED*lead,y:carrier.y+carrier.dy*CARRY_SPEED*lead};}const dx=target.x-s.x,dy=target.y-s.y,len=Math.hypot(dx,dy)||1;const n=g.noises.find(n=>n.id===s.hand),l=g.loot.find(l=>l.id===s.hand);s.hand=null;
  if(n){n.attached=null;n.thrownBy=s.id;n.thrownAt=g.now;n.heardBy=[];n.holder=null;n.x=s.x;n.y=s.y;n.vx=dx/len*430;n.vy=dy/len*430;n.flight=Math.min(.6,len/430);n.born=g.now;n.expires=g.now+6500;event(g,s.name+' threw a distraction.','throw',s);}
  if(l){const friend=g.seats.filter(b=>b.id!==s.id&&sameCrew(b,s)&&!b.hand&&!b.escaped&&b.stun<=g.now&&distance(b,s)<=60&&sight(s,b,g.walls)).sort((a,b)=>distance(a,target)-distance(b,target))[0];if(!friend){s.hand=l.id;event(g,"Can't throw art. A teammate must be within reach; G drops it.");return;}friend.hand=l.id;l.holder=friend.id;const scream=g.noises.find(n=>n.source===l.id&&n.attached);if(scream)scream.attached=friend.id;event(g,s.name+' passed '+l.name+' to '+friend.name+'.','rescue',friend);}

 }
}
export function input(g:Game,s:Thief,a:{seq?:number;dx?:number;dy?:number;aim?:Vec;action?:string;sneak?:boolean}){if(!Number.isSafeInteger(a.seq)||a.seq!<=s.lastSeq)return;s.lastSeq=a.seq!;s.inputAt=g.now;s.sneak=!!a.sneak;s.dx=Math.max(-1,Math.min(1,Number(a.dx)||0));s.dy=Math.max(-1,Math.min(1,Number(a.dy)||0));if(a.aim&&Number.isFinite(a.aim.x)&&Number.isFinite(a.aim.y))s.aim={x:Math.max(24,Math.min(936,a.aim.x)),y:Math.max(24,Math.min(576,a.aim.y))};if(a.action)action(g,s,a.action);}
// Small grid pathfinder: identical collision geometry for humans, guards and bots.
function corridor(a:Vec,b:Vec,walls:Rect[]=WALLS){const n=Math.max(1,Math.ceil(distance(a,b)/5));for(let i=1;i<=n;i++)if(!clear({x:a.x+(b.x-a.x)*i/n,y:a.y+(b.y-a.y)*i/n},13,walls))return false;return true;}
export function steer(a:Vec,b:Vec,walls:Rect[]=WALLS):Vec{if(corridor(a,b,walls))return b;const size=40,cols=24,rows=15;const cell=(p:Vec)=>{const cx=Math.min(cols-2,Math.max(1,Math.floor(p.x/size))),cy=Math.min(rows-2,Math.max(1,Math.floor(p.y/size)));const options:Vec[]=[];for(let y=cy-1;y<=cy+1;y++)for(let x=cx-1;x<=cx+1;x++){const q={x:x*size+20,y:y*size+20};if(x>0&&x<cols-1&&y>0&&y<rows-1&&clear(q,13,walls)&&corridor(p,q,walls))options.push({x,y});}return options.sort((a,b)=>distance(p,{x:a.x*size+20,y:a.y*size+20})-distance(p,{x:b.x*size+20,y:b.y*size+20}))[0]||{x:cx,y:cy};};const start=cell(a),goal=cell(b),key=(x:number,y:number)=>y*cols+x;const q=[key(start.x,start.y)],prev=new Map<number,number>();prev.set(q[0],-1);let end=-1;for(let i=0;i<q.length;i++){const v=q[i],x=v%cols,y=Math.floor(v/cols);if(x===goal.x&&y===goal.y){end=v;break;}for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,k=key(nx,ny);if(nx<1||nx>=cols-1||ny<1||ny>=rows-1||prev.has(k)||!clear({x:nx*size+20,y:ny*size+20},13,walls))continue;prev.set(k,v);q.push(k);}}
 if(end<0)return a;const path:Vec[]=[];while(end!==-1){path.push({x:(end%cols)*size+20,y:Math.floor(end/cols)*size+20});end=prev.get(end)!;}return path.find(p=>corridor(a,p,walls))||a;}
function walk(g:Game,p:Vec,target:Vec,dt:number,speed:number){const walls=g.guards.includes(p as Guard)?[...g.walls,...zones(g)]:thiefWalls(g,p as Thief);const next=steer(p,target,walls);const d=distance(p,next);if(g.seats.includes(p as Thief)){(p as Thief).dx=d>3?(next.x-p.x)/d:0;(p as Thief).dy=d>3?(next.y-p.y)/d:0;}if(d>3)move(p,(next.x-p.x)/d,(next.y-p.y)/d,dt,Math.min(speed,d/dt),walls);}
function decoy(g:Game,s:Thief):Vec{const crew=g.seats.filter(p=>sameCrew(p,s)&&!p.escaped);const rivals=g.seats.filter(p=>!sameCrew(p,s)&&!p.escaped);const candidates=[{x:70,y:70},{x:250,y:70},{x:360,y:60},{x:570,y:350},{x:690,y:70},{x:890,y:520},...rivals.map(p=>({x:p.x,y:p.y}))].filter(p=>distance(p,vanFor(g,s.team))>100&&sight(s,p,g.walls)&&distance(s,p)>100);return candidates.sort((a,b)=>{const score=(p:Vec)=>Math.min(...crew.map(c=>distance(c,p)))+rivals.reduce((v,r)=>v+(distance(r,p)<100?(r.hand?220:120):0),0);return score(b)-score(a);})[0]||{x:Math.min(900,s.x+220),y:Math.max(50,s.y-180)};}
function bot(g:Game,s:Thief,dt:number){if(s.escaped||s.stun>g.now)return;const crew=g.seats.filter(p=>sameCrew(p,s));const human=crew.find(x=>!x.bot&&!x.escaped);const partner=human||crew.find(p=>p.id!==s.id&&!p.escaped);const held=g.loot.find(l=>l.id===s.hand);const capsule=g.noises.find(n=>n.id===s.hand);const home=vanFor(g,s.team);
 if(s.retreatUntil&&s.retreatUntil>g.now){walk(g,s,home,dt,165);return;}
 if(g.boardingAt||g.end-g.now<10000){walk(g,s,home,dt,150);if(homeSafe(g,s))action(g,s,'extract');return;}
 const captive=crew.find(x=>x.stun>g.now&&!x.escaped);if(captive){const danger=g.guards.some(guard=>(guard.retreatUntil||0)<=g.now&&distance(guard,captive)<140&&sight(guard,captive,g.walls));if(danger){s.rescueId=null;if(capsule&&g.now>=s.windup)action(g,s,'throw',decoy(g,s));else if(g.guards.some(guard=>distance(guard,s)<140&&sight(guard,s,g.walls)))walk(g,s,home,dt,165);return;}if(distance(s,captive)>32)walk(g,s,captive,dt,150);if(distance(s,captive)<40)action(g,s,'grab');return;}
 if(capsule&&s.mode==='follow'&&partner){const threat=g.guards.some(h=>distance(h,partner)<150&&sight(h,partner,g.walls));if(threat&&g.now>=s.windup)action(g,s,'throw',decoy(g,s));else if(distance(s,partner)>45)walk(g,s,partner,dt,150);return;}
 if(capsule){const target=g.seats.filter(r=>r.team!==s.team&&!r.escaped&&!homeSafe(g,r)&&g.loot.some(l=>l.holder===r.id)&&distance(r,s)<270&&sight(s,r,g.walls)).sort((a,b)=>distance(s,a)-distance(s,b))[0];if(target&&g.now>=s.windup){const aim={x:target.x,y:target.y};event(g,s.name+': Planting an alarm on '+target.name+'!');action(g,s,'throw',aim);return;}if(g.now>=s.windup)action(g,s,'throw',decoy(g,s));return;}
 if(held){walk(g,s,home,dt,carrySpeed(held.value));return;}
 if(s.mode==='plate'){walk(g,s,g.plate,dt,145);return;}
 const autonomous=!crew.some(p=>!p.bot),humanFirst=g.seats.some(p=>!p.bot&&p.captures>0);
 const carrier=autonomous&&g.seats.find(r=>r.team!==s.team&&!r.escaped&&!homeSafe(g,r)&&g.loot.some(l=>l.holder===r.id));
 if(carrier&&Math.floor((g.now-g.start)/6000)%3===1){const supply=g.noises.filter(n=>!n.holder&&n.flight<=0&&(!n.thrownBy||n.attached)&&distance(s,n)<220).sort((a,b)=>distance(s,a)-distance(s,b))[0];if(supply){if(!capturable(g,s,supply))walk(g,s,supply,dt,145);else{if(s.bottleId!==supply.id){s.bottleId=supply.id;s.bottleAt=g.now;}if(g.now-s.bottleAt>=700)action(g,s,'grab');}return;}else{const rivalHome=vanFor(g,carrier.team);walk(g,s,{x:(carrier.x+rivalHome.x)/2,y:Math.min(450,(carrier.y+rivalHome.y)/2)},dt,145);return;}}
 if(s.mode==='follow'&&partner&&g.guards.some(h=>distance(h,partner)<160&&sight(h,partner,g.walls))&&(s.calloutAt===undefined||g.now-s.calloutAt>6000)){s.calloutAt=g.now;event(g,s.name+': Guard closing in on '+partner.name+'!');}
 const n=g.noises.filter(n=>!n.holder&&(!n.thrownBy||n.attached)&&capturable(g,s,n)&&g.now-n.born>1400&&((s.mode==='follow'&&partner&&g.guards.some(h=>distance(h,partner)<160&&sight(h,partner,g.walls))&&distance(partner,n)<150)||(s.mode==='cover'&&partner&&distance(partner,n)<150)||(autonomous&&((partner&&distance(partner,n)<150)||g.seats.some(r=>r.team!==s.team&&!r.escaped&&r.hand&&distance(r,s)<400&&sight(s,r,g.walls))))||(humanFirst&&s.mode!=='follow'&&!n.attached&&crew.some(p=>p.hand&&distance(p,n)<100)))).sort((a,b)=>distance(a,s)-distance(b,s))[0];
 if(n){if(s.bottleId!==n.id){s.bottleId=n.id;s.bottleAt=g.now;}if(g.now-s.bottleAt>=1000)action(g,s,'grab');return;}s.bottleId=null;
 const plateHuman=crew.find(p=>!p.bot&&!p.escaped&&p.stun<=g.now&&distance(p,g.plate)<30);
 const plateLoot=g.loot.find(l=>l.locked&&!l.banked&&!l.holder);
 if(plateHuman&&plateLoot){if(s.plateJob!==plateLoot.id){s.plateJob=plateLoot.id;event(g,s.name.toUpperCase()+': GOING FOR THE SCREAM');}walk(g,s,plateLoot,dt,150);if(distance(s,plateLoot)<50)action(g,s,'grab');return;}
 if(s.mode==='cover'&&partner){if(distance(s,partner)>55)walk(g,s,partner,dt,150);return;}
 const jackpot=g.loot.find(l=>l.locked&&!l.banked&&!l.holder);
 if(autonomous&&jackpot&&g.loot.filter(l=>!l.banked&&!l.holder&&!l.locked&&!l.sealed).length===0){if(crew[0]?.id===s.id){walk(g,s,g.plate,dt,145);return;}walk(g,s,jackpot,dt,140);if(distance(s,jackpot)<50)action(g,s,'grab');return;}
 const fetch=s.mode==='fetch'||autonomous;
 const l=g.loot.filter(l=>!l.banked&&!l.holder&&!l.locked&&!l.sealed&&fetch).sort((a,b)=>distance(a,s)-distance(b,s))[0];
 if(l&&g.now-g.start>12000){walk(g,s,l,dt,autonomous?145:115);if(distance(l,s)<50)action(g,s,'grab');return;}
 if(partner){const home=vanFor(g,s.team),d=distance(partner,home)||1;const receiving={x:partner.x+(home.x-partner.x)/d*38,y:partner.y+(home.y-partner.y)/d*38};const target=clear(receiving,13,thiefWalls(g,s))&&sight(partner,receiving,g.walls)?receiving:partner;if(distance(s,target)>12)walk(g,s,target,dt,150);}
}
function step(g:Game){const dt=STEP/1000;updateJobEvent(g);
 if(!g.honking&&g.end-g.now<=15000){g.honking=true;event(g,'15s LEFT. Return to your own van or lose 25% of your personal bank!','honk');}
 if(!g.training&&g.alert>=60&&!g.lockdown){g.lockdown=true;const route=g.crewMode==='coop'?[{x:550,y:80},{x:530,y:330},{x:250,y:340}]:RIVAL_REINFORCEMENTS[g.layout];g.guards.push({id:'g-lockdown',...route[0],angle:Math.PI,mode:'patrol',target:route[1],route,way:1,attention:0,victim:null});event(g,'LOCKDOWN. An extra guard has arrived.','honk');}
 for(const s of g.seats){if(s.bot)bot(g,s,dt);else if(!s.escaped&&s.stun<=g.now&&g.now-s.inputAt<500)move(s,s.dx,s.dy,dt,(s.hand?(g.loot.some(l=>l.id===s.hand)?carrySpeed(g.loot.find(l=>l.id===s.hand)!.value):CARRY_SPEED):165)*(s.sneak?0.55:1),thiefWalls(g,s));
  if(s.stun&&s.stun<=g.now){s.stun=0;s.safe=g.now+3000;event(g,s.name+' slipped free. Recover the dropped loot.','rescue',s);}
  const l=g.loot.find(l=>l.holder===s.id);if(l){l.x=s.x;l.y=s.y;if(homeSafe(g,s)){hush(g,l);l.banked=true;l.bankedBy=s.team;l.holder=null;s.hand=null;s.bank+=l.value;g.total+=l.value;if(s.bot&&s.mode==='fetch'&&g.seats.some(p=>!p.bot&&sameCrew(p,s))){s.mode='follow';event(g,s.name+': One piece delivered. Ask Fetch again for another.');}event(g,'$'+l.value+' secured. '+s.name+' delivered '+l.name+'.','bank',vanFor(g,s.team));}}
 }
 for(const s of g.seats){if(!s.rescueId)continue;const friend=g.seats.find(p=>p.id===s.rescueId);if(s.escaped||s.stun>g.now||!friend||friend.stun<=g.now||distance(s,friend)>45||!sight(s,friend,g.walls)){s.rescueId=null;continue;}const capturing=g.guards.find(h=>h.id===friend.capturedBy);if(capturing)capturing.retreatUntil=Math.max(capturing.retreatUntil||0,g.now+1000);if(g.now-s.rescueAt>=1500){s.safe=g.now+3000;s.retreatUntil=g.now+3000;friend.stun=0;friend.safe=g.now+3000;s.rescues++;s.rescueId=null;event(g,s.name+' freed '+friend.name+'!','rescue',friend);}}
 for(const l of g.loot){if(l.recoverAt&&g.now>=l.recoverAt&&!l.holder&&!l.banked&&l.home){hush(g,l);Object.assign(l,l.home);l.locked=l.value===1200;l.recoverAt=undefined;l.droppedAt=undefined;event(g,'Security returned '+l.name+' to its display.');}if(l.holder&&!l.banked&&!g.noises.some(n=>n.source===l.id&&n.attached)&&(!l.quietUntil||g.now>=l.quietUntil)){const carrier=g.seats.find(s=>s.id===l.holder)!;alarm(g,carrier,l.id,carrier.id);}}
 for(const n of g.noises){if(n.attached){const carrier=g.seats.find(s=>s.id===n.attached);if(carrier){n.x=carrier.x;n.y=carrier.y;}}else if(n.holder){const s=g.seats.find(s=>s.id===n.holder)!;n.x=s.x;n.y=s.y;if(g.now>=n.expires){n.holder=null;s.hand=null;n.expires=g.now+4000;n.born=g.now;event(g,'The bottled alarm burst!','catch',s);}}else if(n.flight>0){const p={x:n.x+n.vx*dt,y:n.y+n.vy*dt};if(clear(p,6,g.walls)){n.x=p.x;n.y=p.y;n.flight-=dt;}else n.flight=0;if(n.flight<=.2){const thrower=g.seats.find(s=>s.id===n.thrownBy);const unsafe=thrower&&g.seats.some(s=>sameCrew(s,thrower)&&!s.escaped&&distance(s,n)<100);if(n.flight<=0&&unsafe&&!g.training)g.alert=Math.min(100,g.alert+8);const rival=thrower&&g.seats.find(s=>!sameCrew(s,thrower)&&!s.escaped&&s.stun<=g.now&&!homeSafe(g,s)&&distance(s,n)<=40&&sight(s,n,g.walls));if(rival){n.flight=0;n.attached=rival.id;n.source=null;n.expires=g.now+15000;n.born=g.now;event(g,thrower!.name+' planted an alarm on '+rival.name+'!','land',rival);if(g.training&&!thrower!.bot)g.practiceStage=3;}else if(n.flight<=0)event(g,unsafe?'Too close! The noise landed near your crew.':'Distraction landed.','land',n);}}}
 g.noises=g.noises.filter(n=>n.expires>g.now);
 for(const guard of g.guards){let victim:Thief|undefined;
  if(g.now-g.start<12000&&(guard.id==='g0'||(g.crewMode!=='coop'&&guard.id==='g1'))){guard.x=guard.id==='g1'?880:80;guard.y=guard.id==='g1'&&g.crewMode!=='coop'&&g.layout===1?540:60;guard.angle=guard.y>300?Math.PI/2:-Math.PI/2;guard.mode='patrol';continue;}
  if(guard.retreatUntil&&guard.retreatUntil>g.now){guard.mode='patrol';guard.target=guard.route[guard.way];if(distance(guard,guard.target)<16){guard.way=(guard.way+1)%guard.route.length;guard.target=guard.route[guard.way];}walk(g,guard,guard.target,dt,120);continue;}
  for(const s of g.seats){if(s.escaped||s.stun>g.now||s.safe>g.now||homeSafe(g,s))continue;const d=distance(guard,s);const diff=Math.atan2(Math.sin(Math.atan2(s.y-guard.y,s.x-guard.x)-guard.angle),Math.cos(Math.atan2(s.y-guard.y,s.x-guard.x)-guard.angle));if(d<(blackoutActive(g)?60:(s.sneak?90:180))&&(!(guard.luredUntil&&guard.luredUntil>g.now)||d<45)&&(Math.abs(diff)<0.65||d<45)&&sight(guard,s,g.walls)){victim=s;break;}}
  const noise=g.noises.filter(n=>!n.holder&&!anySafe(g,n)&&(n.attached?g.now-(n.heardAt?.[guard.id]??-Infinity)>8000:!n.heardBy?.includes(guard.id)&&(n.heardBy?.length||0)<1)&&g.guards.filter(other=>distance(other,n)<=distance(guard,n)).length<=(n.attached?2:1)&&n.flight<=0&&g.now-n.born>900&&(n.attached?distance(n,guard)<170:(distance(n,guard)<220||distance(n,guard)<420&&sight(guard,n,g.walls)))).sort((a,b)=>Number(Boolean(b.thrownBy&&!b.heardBy?.includes(guard.id)))-Number(Boolean(a.thrownBy&&!a.heardBy?.includes(guard.id)))||distance(a,guard)-distance(b,guard))[0];
  if(noise&&!noise.alerted){noise.alerted=true;if(!g.training)g.alert=Math.min(100,g.alert+(noise.attached?7:3));}
  if(noise?.thrownBy&&!noise.heardBy?.includes(guard.id)&&(!victim||distance(guard,victim)>45)){guard.luredUntil=g.now+1800;victim=undefined;}
  if(victim){guard.mode='chase';guard.target={x:victim.x,y:victim.y};guard.victim=victim.id;guard.attention=g.now+1600;}
  else if(noise){guard.mode='investigate';guard.searchCenter={x:noise.x,y:noise.y};guard.searchAt=0;guard.target={...guard.searchCenter};guard.victim=null;guard.attention=g.now+6500;noise.heardAt??={};noise.heardAt[guard.id]=g.now;noise.heardBy??=[];if(!noise.heardBy.includes(guard.id))noise.heardBy.push(guard.id);if(noise.thrownBy){const thrower=g.seats.find(s=>s.id===noise.thrownBy);if(thrower)thrower.bestThrow=Math.max(thrower.bestThrow,noise.heardBy.length);}}
  else if(guard.mode==='investigate'&&guard.searchCenter&&guard.attention>g.now){if(!guard.searchAt&&distance(guard,guard.searchCenter)<35)guard.searchAt=g.now;if(guard.searchAt){if(g.now-guard.searchAt>=3000)guard.attention=0;else{const a=(g.now-guard.searchAt)/3000*Math.PI*2;const p={x:guard.searchCenter.x+Math.cos(a)*34,y:guard.searchCenter.y+Math.sin(a)*34};if(clear(p,13,[...g.walls,...zones(g)]))guard.target=p;}}}
  if(!victim&&guard.attention<=g.now){guard.mode='patrol';guard.victim=null;guard.target=guard.route[guard.way];if(distance(guard,guard.target)<16){guard.way=(guard.way+1)%guard.route.length;guard.target=guard.route[guard.way];}}

  const old={x:guard.x,y:guard.y};walk(g,guard,guard.target,dt,(guard.mode==='chase'?135:guard.mode==='investigate'?103:62)*(g.alert>=30?1.12:1));if(distance(old,guard)>0.1)guard.angle=Math.atan2(guard.y-old.y,guard.x-old.x);
  const caught=g.seats.find(s=>!s.escaped&&s.stun<=g.now&&s.safe<=g.now&&!homeSafe(g,s)&&distance(s,guard)<25&&sight(s,guard,g.walls));
  if(caught){if(!g.training){drop(g,caught,true);g.noises=g.noises.filter(n=>n.attached!==caught.id);}caught.stun=g.now+(g.training?3000:6000);caught.rescueId=null;caught.capturedBy=guard.id;if(!g.training)g.alert=Math.min(100,g.alert+15);caught.dx=caught.dy=0;guard.mode='patrol';guard.attention=0;guard.retreatUntil=g.now+(distance(caught,g.plate)<30?36000:3500);guard.way=(guard.way+1)%guard.route.length;guard.target=guard.route[guard.way];event(g,CREW_NAMES[caught.team]+' · '+caught.name+' caught! Their crew can rescue them.','catch',caught);}
 }
 for(const sensor of sensors(g)){const inside=g.seats.filter(p=>p.x>=sensor.x-12&&p.x<=sensor.x+sensor.w+12&&p.y>=sensor.y-12&&p.y<=sensor.y+sensor.h+12).map(p=>p.id);const entering=inside.filter(id=>!sensor.inside?.includes(id));sensor.inside=inside;if(sensor.cooldown>g.now)continue;const thief=g.seats.find(p=>entering.includes(p.id)&&!p.escaped&&p.stun<=g.now&&!homeSafe(g,p)&&p.x>=sensor.x-12&&p.x<=sensor.x+sensor.w+12&&p.y>=sensor.y-12&&p.y<=sensor.y+sensor.h+12&&(!p.sneak||g.loot.some(l=>l.holder===p.id)));if(thief){sensor.cooldown=g.now+6000;alarm(g,thief);g.alarmTip=true;event(g,thief.name+' tripped a sensor. Shift sneaks past empty-handed; art always trips it.');}}
 if(g.training&&g.loot.every(l=>l.banked)&&!g.practiceStage){g.practiceStage=1;g.seats.filter(s=>s.bot).forEach(s=>s.mode='follow');addPracticeRival(g);alarm(g,{x:175,y:440});event(g,'LESSON 2: E bottles the red alarm. Aim at Practice rival, then F to plant it.');}
 if(g.training&&g.practiceStage===1&&!g.noises.some(n=>!n.source))alarm(g,{x:175,y:440});
 if(g.training&&g.practiceStage===3){finish(g,'Practice complete: you banked art and planted a rival alarm.');return;}

 if(!g.training&&!g.boardingAt&&g.loot.length&&g.loot.every(l=>l.banked)){g.boardingAt=g.now;g.end=g.now+15000;event(g,'LAST CALL · All art banked. Board your own van within 15s. Left behind costs 25%.','honk');}
 if(g.seats.every(s=>s.escaped)||g.now>=g.end)finish(g,'The van has left.');
}
function addPracticeRival(g:Game){const rival={...g.seats[0],id:'practice-rival',name:'Practice rival',token:undefined,bot:false,team:1,x:250,y:420,hand:null,dx:0,dy:0,safe:g.now+300000,bank:0};g.seats.push(rival);return rival;}
export function roomName(p:Vec){return p.x<320?'Echo Gallery':p.x<640?'Archive':'Private Collection';}
export function stars(g:Game|View,team=0){const bank=crewScores(g).find(t=>t.team===team)?.bank||0;if(bank<COOP_GOAL||!g.seats.some(s=>s.team===team&&(s.escaped||homeSafe(g,s))))return 0;const normal=g.loot.filter(l=>l.value!==1200).every(l=>l.banked&&l.bankedBy===team);return normal?(g.loot.some(l=>l.value===1200&&l.banked&&l.bankedBy===team)?3:2):1;}
export function finish(g:Game,reason:string){if(g.phase==='finished')return;g.phase='finished';if(g.jobEvent)g.jobEvent.ended=true;g.finishedAt=g.now;g.finishReason=reason;for(const s of g.seats){if(homeSafe(g,s)&&s.stun<=g.now){s.escaped=true;s.escapedAt??=g.now;}if(!s.escaped&&!g.training){s.penalty=Math.round(s.bank*.25);s.bank-=s.penalty;}s.dx=s.dy=0;}g.total=g.seats.reduce((n,s)=>n+s.bank,0);g.success=g.total>=(g.training?500:g.crewMode==='coop'?COOP_GOAL:500)&&g.seats.some(s=>s.escaped);event(g,reason);}
export function canEndJob(g:Game|View){return g.phase==='playing'&&g.seats.length>0&&g.seats.every(s=>s.escaped);}
export function advance(g:Game,to:number){if(g.phase!=='playing'){g.now=to;return;}const until=Math.min(to,g.now+2000);while(g.now+STEP<=until&&g.phase==='playing'){g.now+=STEP;step(g);}if(to-until>0){g.end+=to-until;g.now=to;}}
export function command(g:Game,id:string,a:{type:string;name?:string;botId?:string;seq?:number;dx?:number;dy?:number;aim?:Vec;action?:string;crewMode?:CrewMode;team?:number;match?:number;sneak?:boolean}){const s=g.seats.find(s=>s.id===id);if(!s)throw Error('Join the crew first.');s.lastSeen=g.now;
 if(a.type==='start'){if(g.host!==id||g.phase!=='lobby')throw Error('Only the host can start from the lobby.');if(g.crewMode!=='coop'){const scores=crewScores(g),size=g.crewMode==='duos'?2:3;if(scores.length!==2||scores.some(t=>g.seats.filter(s=>s.team===t.team).length!==size))throw Error('Balance crews or fill empty slots with bots first.');}setup(g);}
 else if(a.type==='ready'){if(g.phase!=='ready')return;s.ready=true;if(g.seats.every(s=>s.ready))begin(g);}
 else if(a.type==='configure'){if(g.host!==id)throw Error('Host only.');if(['coop','duos','trios'].includes(a.crewMode||''))configure(g,a.crewMode!);}
 else if(a.type==='fill'){if(g.host!==id)throw Error('Host only.');fillCrews(g);}
 else if(a.type==='team'){if(g.phase!=='lobby'||g.crewMode==='coop')return;const team=Number(a.team),max=2;if(Number.isInteger(team)&&team>=0&&team<max)s.team=team;}
 else if(a.type==='bot'){if(g.host!==id||g.phase!=='lobby')throw Error('Only the host can change the lobby.');add(g,['Echo','Pip','Moss','Jinx','Vale'][g.seats.filter(s=>s.bot).length]||'Echo','bot'+g.serial,true);}
 else if(a.type==='remove'){if(g.host!==id||g.phase!=='lobby')throw Error('Only the host can change the lobby.');g.seats=g.seats.filter(s=>!s.bot||s.id!==a.botId);}
 else if(a.type==='replay'){if(g.host!==id||g.phase!=='finished')throw Error('Only the host can replay a finished job.');setup(g);}
 else if(a.type==='endJob'){if(!canEndJob(g))throw Error('Every thief must board first.');finish(g,'The human crews ended the job. Banked loot decides the result.');}
 else if(a.type==='input'){if(a.match!==undefined&&a.match!==g.match)return;input(g,s,a);}
}
export function view(g:Game,id:string){return {...g,you:id,seats:g.seats.map(({token,...s})=>s)};}
export type View=ReturnType<typeof view>;

export function routeLength(g:Game|View,from:Vec,to:Vec){const p={...from};let length=0;for(let i=0;i<2500&&distance(p,to)>2;i++){const q=steer(p,to,g.walls),d=distance(p,q);if(d<.01)return Infinity;const before={...p};move(p,(q.x-p.x)/d,(q.y-p.y)/d,.02,Math.min(150,d/.02),g.walls);const moved=distance(p,before);if(moved<.001)return Infinity;length+=moved;}return distance(p,to)<=2?length:Infinity;}
export const blackoutActive=(g:Game|View)=>g.jobEvent?.kind==='blackout'&&g.jobEvent.started&&!g.jobEvent.ended;
function offsetRoute(g:Game,r:Vec[]){for(const [dx,dy] of [[0,20],[0,-20],[20,0],[-20,0],[0,10],[10,0]]){const c=r.map(p=>({x:p.x+dx,y:p.y+dy}));if(c.every((p,i)=>corridor(p,c[(i+1)%c.length],g.walls)))return c;}return r.map((p,i)=>({x:p.x*.8+r[(i+1)%r.length].x*.2,y:p.y*.8+r[(i+1)%r.length].y*.2}));}
export function patrolPool(g:Game){if(g.crewMode!=='coop'){const m=RIVAL_LAYOUTS[g.layout],alt=offsetRoute(g,m.routes[0]),transform=m.symmetry==='rotate'?rotatePoint:mirrorPoint;const main=m.routes[2],spare=RIVAL_REINFORCEMENTS[g.layout];const inspect=(r:Vec[])=>{const copy=r.map(p=>({...p}));if(g.layout===0){const i=copy.findIndex(p=>p.y>=350);copy.splice(i+1,0,{x:480,y:380},{...g.plate},{x:480,y:380});}else if(g.layout===1){copy.push({x:410,y:300},{x:410,y:170},{x:550,y:170},{x:550,y:300},{x:410,y:300});}else {const i=copy.findIndex(p=>p.y>=340);copy.splice(i+1,0,{x:540,y:380},{x:540,y:440},{...g.plate},{x:420,y:440},{x:420,y:380});}const clean=copy.filter((p,i)=>i===0||distance(p,copy[i-1])>.01);if(distance(clean[0],clean[clean.length-1])<.01)clean.pop();return clean;};return [m.routes[0],m.routes[1],inspect(main),alt,alt.map(transform),inspect(spare)];}const base=g.guards.slice(0,3).map(h=>h.route);return [...base,...base.map(r=>offsetRoute(g,r))];}
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
 if(g.crewMode==='coop'&&g.guards.length<3){const route=[{x:710,y:115},{x:880,y:115},{x:880,y:510},{x:710,y:510}];g.guards.push({...g.guards[0],id:'g2',route,way:0,target:route[0],...route[0]});}
 const pool=patrolPool(g),alt=random(g)<.5,phase=random(g);g.guards.forEach((h,i)=>{const r=rival?pool[i<2?(alt?3+i:i):(random(g)<.5?2:5)]:pool[i%pool.length];placeOnRoute(h,r,(phase+(i===1&&rival?0:i*.31))%1);});
 const kind=(['blackout','shift','curator','vault'] as const)[Math.floor(random(g)*4)],at=35000+Math.floor(random(g)*10000);
 g.jobEvent={kind,at,until:at+(kind==='blackout'?8000:kind==='vault'?15000:1000),warned:false,started:false,ended:false};
 if(kind==='vault'){const l=g.loot.find(l=>l.id==='art5')!;l.sealed=true;l.eventPiece=true;}
}
export function updateJobEvent(g:Game){const e=g.jobEvent;if(!e||g.phase!=='playing')return;
 if(!e.warned&&g.now>=e.at-3000){e.warned=true;event(g,({blackout:'BLACKOUT',shift:'SHIFT CHANGE',curator:'CURATOR TRANSFER',vault:'SIDE VAULT'}[e.kind])+' IN 3 SECONDS','honk');}
 if(!e.started&&g.now>=e.at){e.started=true;
 if(e.kind==='blackout')event(g,'BLACKOUT · Guard vision reduced for 8s. Follow the glowing art.','honk');
 if(e.kind==='shift'){const pool=patrolPool(g);g.guards.forEach((h,i)=>{const r=g.crewMode==='coop'?pool[(i+1)%pool.length]:pool[i<2?(JSON.stringify(h.route)===JSON.stringify(pool[i])?3+i:i):(i===2?(JSON.stringify(h.route)===JSON.stringify(pool[2])?5:2):(JSON.stringify(g.guards[2].route)===JSON.stringify(pool[2])?5:2))];h.route=r.map(p=>({...p}));h.way=r.reduce((best,p,j)=>distance(h,p)<distance(h,r[best])?j:best,0);h.target={...r[h.way]};h.mode='patrol';h.attention=0;h.victim=null;});event(g,'SHIFT CHANGE · New patrol circuits.','honk');}
 if(e.kind==='curator'){const pair=g.loot.slice(0,2);if(pair.every(l=>!l.holder&&!l.banked&&!l.droppedAt)){const slots=g.crewMode==='coop'?PEDESTALS:RIVAL_LAYOUTS[g.layout].slots;const from=pair[0];const near=routeLength(g,vanFor(g,0),from)<250;const next=slots.find(p=>distance(p,from)>60&&!g.loot.some(l=>distance(l,p)<50)&&(routeLength(g,vanFor(g,0),p)<250)===near);if(next){const other=g.crewMode==='coop'?pair[1]:(RIVAL_LAYOUTS[g.layout].symmetry==='rotate'?rotatePoint:mirrorPoint)(next);Object.assign(pair[0],next,{home:{...next}});if(g.crewMode!=='coop')Object.assign(pair[1],other,{home:{x:other.x,y:other.y}});event(g,'CURATOR TRANSFER · Unclaimed pocket exhibits moved within their danger tier.','honk');}else event(g,'CURATOR TRANSFER · No equivalent free display; exhibits stay put.','honk');}else event(g,'CURATOR TRANSFER · Crew already claimed the exhibits. Transfer cancelled.','honk');}
 if(e.kind==='vault'){g.loot.filter(l=>l.eventPiece).forEach(l=>l.sealed=false);event(g,'SIDE VAULT OPEN · 15s to claim its reserved prize!','honk');}
 }
 if(e.started&&!e.ended&&g.now>=e.until){e.ended=true;if(e.kind==='vault')g.loot.filter(l=>l.eventPiece&&!l.claimed&&!l.holder&&!l.banked).forEach(l=>l.sealed=true);event(g,e.kind==='blackout'?'POWER RESTORED':e.kind==='vault'?'SIDE VAULT CLOSED':'Museum event complete.');}
}
