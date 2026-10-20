/** Noise Thieves: deterministic, fixed-step simulation shared by solo and server. */
export type Vec={x:number;y:number};
export type Rect=Vec&{w:number;h:number};
export const W=960,H=600,STEP=40,DURATION=90000;
export const EXIT={x:88,y:510};
export const PLATE={x:730,y:155};
export type CrewMode='coop'|'duos'|'trios';
export const CREW_NAMES=['MINT','VIOLET','AMBER'];
export const WALLS:Rect[]=[{x:0,y:0,w:960,h:24},{x:0,y:576,w:960,h:24},{x:0,y:0,w:24,h:600},{x:936,y:0,w:24,h:600},
{x:300,y:24,w:20,h:150},{x:300,y:260,w:20,h:160},{x:300,y:500,w:20,h:76},
{x:620,y:24,w:20,h:250},{x:620,y:360,w:20,h:120},
{x:320,y:390,w:160,h:18},{x:550,y:390,w:70,h:18},
{x:90,y:220,w:100,h:34},{x:420,y:170,w:90,h:34},{x:750,y:210,w:80,h:34}];
export type Thief=Vec&{id:string;name:string;bot:boolean;token?:string;dx:number;dy:number;aim:Vec;inputAt:number;lastSeq:number;ready:boolean;hand:string|null;stun:number;safe:number;escaped:boolean;captures:number;rescues:number;bank:number;cooldown:number;mode:'follow'|'fetch'|'cover'|'plate';lastSeen:number;team:number;windup:number;bestThrow:number};
export type Guard=Vec&{id:string;angle:number;mode:'patrol'|'investigate'|'chase';target:Vec;route:Vec[];way:number;attention:number;victim:string|null};
export type Loot=Vec&{id:string;name:string;value:number;holder:string|null;banked:boolean;quietUntil?:number};
export type Noise=Vec&{id:string;holder:string|null;expires:number;born:number;vx:number;vy:number;flight:number;kind:'alarm'|'capsule';source:string|null;attached?:string|null;thrownBy?:string;thrownAt?:number;counted?:boolean;heardBy?:string[]};
export type Event={id:number;at:number;text:string;kind:'info'|'capture'|'throw'|'catch'|'bank'|'rescue'|'honk'|'land';x:number;y:number};
export type Game={version:2;crewMode:CrewMode;alert:number;boardingAt:number;honking:boolean;code:string;host:string;phase:'lobby'|'ready'|'playing'|'finished';seats:Thief[];guards:Guard[];loot:Loot[];noises:Noise[];events:Event[];serial:number;now:number;start:number;end:number;seed:number;revision:number;alarmAt:number;total:number;success:boolean};
export const distance=(a:Vec,b:Vec)=>Math.hypot(a.x-b.x,a.y-b.y);
export function clear(p:Vec,r=12){return p.x>=24+r&&p.x<=936-r&&p.y>=24+r&&p.y<=576-r&&!WALLS.some(w=>p.x>w.x-r&&p.x<w.x+w.w+r&&p.y>w.y-r&&p.y<w.y+w.h+r);}
export function sight(a:Vec,b:Vec){const n=Math.ceil(distance(a,b)/8);for(let i=1;i<n;i++)if(!clear({x:a.x+(b.x-a.x)*i/n,y:a.y+(b.y-a.y)*i/n},0))return false;return true;}
export function move(p:Vec,dx:number,dy:number,dt:number,speed=150){const len=Math.hypot(dx,dy);if(!len)return;dx/=Math.max(1,len);dy/=Math.max(1,len);const x=p.x+dx*speed*dt,y=p.y+dy*speed*dt;if(clear({x,y:p.y}))p.x=x;if(clear({x:p.x,y}))p.y=y;}
function random(g:Game){g.seed=(Math.imul(1664525,g.seed)+1013904223)>>>0;return g.seed/4294967296;}
export function event(g:Game,text:string,kind:Event['kind']='info',p:Vec=EXIT){g.events.push({id:++g.serial,at:g.now,text,kind,x:p.x,y:p.y});g.events=g.events.slice(-12);}
export function create(code:string,now=0,seed=13):Game{return {version:2,crewMode:'coop',alert:0,boardingAt:0,honking:false,code,host:'',phase:'lobby',seats:[],guards:[],loot:[],noises:[],events:[],serial:0,now,start:0,end:0,seed,revision:0,alarmAt:0,total:0,success:false};}
export function add(g:Game,name:string,token:string,bot=false){if(g.phase!=='lobby')throw Error('This job has started. Join the next one.');if(g.seats.length>=6)throw Error('Crew full (six thieves).');const id='p'+(++g.serial);const s:Thief={id,name:name.trim().slice(0,18)||'Rookie',token:bot?undefined:token,bot,x:85+g.seats.length*30,y:485,dx:0,dy:0,aim:{x:500,y:300},inputAt:0,lastSeq:0,ready:false,hand:null,stun:0,safe:0,escaped:false,captures:0,rescues:0,bank:0,cooldown:0,mode:'follow',lastSeen:g.now,team:0,windup:0,bestThrow:0};if(g.crewMode!=='coop'){const count=g.crewMode==='trios'?2:Math.max(2,...g.seats.map(p=>p.team+1));s.team=Array.from({length:count},(_,i)=>i).sort((a,b)=>g.seats.filter(p=>p.team===a).length-g.seats.filter(p=>p.team===b).length)[0];}g.seats.push(s);if(!g.host)g.host=id;return s;}
export function setup(g:Game){g.phase='ready';g.events=[];g.noises=[];g.total=0;g.success=false;g.start=0;g.end=0;g.alert=0;g.boardingAt=0;g.honking=false;
 g.seats.forEach((s,i)=>Object.assign(s,{x:80+i*28,y:495,dx:0,dy:0,hand:null,stun:0,safe:0,escaped:false,captures:0,rescues:0,bank:0,cooldown:0,ready:s.bot,lastSeq:0,mode:'follow',windup:0,bestThrow:0}));
 g.loot=[{id:'art1',name:'Golden echo',value:500,x:205,y:320},{id:'art2',name:'Moon vase',value:800,x:440,y:285},{id:'art3',name:'The scream',value:1200,x:835,y:120},{id:'art4',name:'Blue idol',value:1000,x:810,y:470}].map(x=>({...x,holder:null,banked:false}));
 const routes=[[{x:210,y:125},{x:250,y:340},{x:70,y:335},{x:70,y:120}],[{x:405,y:95},{x:565,y:95},{x:565,y:335},{x:365,y:335}],[{x:710,y:115},{x:880,y:115},{x:880,y:510},{x:710,y:510}]];
 g.guards=routes.map((route,i)=>({id:'g'+i,...route[0],angle:Math.PI/2,mode:'patrol',target:route[1],route,way:1,attention:0,victim:null}));
 event(g,'Grab the gold. Steal its alarm. Get back to the van.');
}
function begin(g:Game){g.phase='playing';g.start=g.now;g.end=g.now+DURATION;g.alarmAt=g.now+18000;event(g,'Job is live. The van leaves in 90 seconds.');}
function alarm(g:Game,p:Vec,source:string|null=null,attached:string|null=null){const id='n'+(++g.serial);g.noises.push({id,x:p.x,y:p.y,holder:null,expires:g.now+(attached?90000:6500),born:g.now,vx:0,vy:0,flight:0,kind:'alarm',source,attached});g.alert=Math.min(100,g.alert+5);return id;}
export function sameCrew(a:{team:number},b:{team:number}){return a.team===b.team;}
export function crewScores(g:Game|View){return [...new Set(g.seats.map(s=>s.team))].sort().map(team=>({team,name:CREW_NAMES[team],bank:g.seats.filter(s=>s.team===team).reduce((n,s)=>n+s.bank,0)}));}
export function plateOpen(g:Game|View){return g.seats.some(s=>!s.escaped&&s.stun<=g.now&&distance(s,PLATE)<30);}
function capturable(g:Game|View,s:Thief,n:Noise){return !n.holder&&n.flight<=0&&!(n.thrownBy===s.id&&g.now-(n.thrownAt||0)<3000)&&distance(n,s)<(n.attached?90:115)&&sight(s,n);}
export function interaction(g:Game|View,s:Thief):{label:string;target?:Vec;id?:string;kind:string}{
 if(s.escaped)return {label:'In van',kind:'none'};
 if(s.stun>g.now)return {label:'Free in '+Math.ceil((s.stun-g.now)/1000)+'s',kind:'none'};
 const friend=g.seats.find(p=>p.id!==s.id&&sameCrew(p,s)&&!p.escaped&&p.stun>g.now&&distance(p,s)<65&&sight(s,p));
 if(friend)return {label:'Rescue '+friend.name,target:friend,id:friend.id,kind:'rescue'};
 if(s.hand)return {label:g.noises.some(n=>n.id===s.hand)?'Aim + throw':'Carry to van',kind:'none'};
 const n=g.noises.filter(n=>capturable(g,s,n)).sort((a,b)=>distance(a,s)-distance(b,s))[0];
 if(n)return {label:n.attached?'Steal scream':'Capture alarm',target:n,id:n.id,kind:'noise'};
 const l=g.loot.filter(l=>!l.holder&&!l.banked&&distance(l,s)<55&&sight(s,l)).sort((a,b)=>distance(a,s)-distance(b,s))[0];
 if(l)return {label:l.id==='art3'&&!plateOpen(g)?'Need plate held':'Grab '+l.name,target:l,id:l.id,kind:l.id==='art3'&&!plateOpen(g)?'locked':'loot'};
 return {label:'Move closer',kind:'none'};
}
export function configure(g:Game,mode:CrewMode){if(g.phase!=='lobby')throw Error('Choose crews in the lobby.');g.crewMode=mode;const teams=mode==='duos'?Math.max(2,Math.ceil(g.seats.length/2)):mode==='trios'?2:1;g.seats.forEach((s,i)=>s.team=i%teams);}
export function fillCrews(g:Game){if(g.phase!=='lobby')throw Error('Fill crews before starting.');const teams=g.crewMode==='coop'?1:g.crewMode==='trios'?2:Math.max(2,...g.seats.map(s=>s.team+1));const size=g.crewMode==='trios'?3:g.crewMode==='duos'?2:Math.max(2,g.seats.length);for(let team=0;team<teams;team++)while(g.seats.filter(s=>s.team===team).length<size&&g.seats.length<6){const b=add(g,['Echo','Pip','Moss','Jinx','Vale'][g.seats.filter(s=>s.bot).length]||'Echo','bot',true);b.team=team;}}
function hush(g:Game,l:Loot){g.noises=g.noises.filter(n=>!(n.source===l.id&&n.attached));}
function drop(g:Game,s:Thief){if(!s.hand)return;const l=g.loot.find(x=>x.id===s.hand),n=g.noises.find(x=>x.id===s.hand);if(l){l.holder=null;l.x=s.x;l.y=s.y;const n=g.noises.find(n=>n.source===l.id&&n.attached);if(n){n.attached=null;n.expires=g.now+6500;n.x=s.x;n.y=s.y;}}if(n){n.attached=null;n.thrownBy=s.id;n.thrownAt=g.now;n.heardBy=[];n.holder=null;n.x=s.x;n.y=s.y;n.expires=g.now+5000;n.born=g.now;}s.hand=null;}
export function action(g:Game,s:Thief,type:string,aim?:Vec){if(g.phase!=='playing'||s.escaped||s.stun>g.now)return;
 if(type==='extract'){if(distance(s,EXIT)>70){event(g,'Return to the mint getaway zone first.');return;}const held=g.loot.find(l=>l.id===s.hand);if(held){hush(g,held);held.banked=true;held.holder=null;s.hand=null;s.bank+=held.value;g.total+=held.value;}drop(g,s);s.escaped=true;s.dx=s.dy=0;event(g,s.name+' is in the van.','bank',s);return;}
 if(type==='help'||type.startsWith('help:')){const crew=g.seats.filter(x=>x.bot&&sameCrew(x,s));const modes=['follow','cover','fetch','plate'] as const;const requested=type.split(':')[1];const mode=modes.includes(requested as typeof modes[number])?requested as typeof modes[number]:modes[(modes.indexOf(crew[0]?.mode||'follow')+1)%modes.length];crew.forEach(b=>b.mode=mode);event(g,CREW_NAMES[s.team]+': '+({cover:'Covering your scream.',fetch:'Fetching nearby art.',follow:'Following. Alarms are yours.',plate:'Holding the jackpot plate.'}[mode]));return;}
 if(g.now<s.cooldown)return;s.cooldown=g.now+260;
 if(type==='drop'){drop(g,s);event(g,s.name+' put it down.','info',s);return;}
 if(type==='grab'){
  const target=interaction(g,s);
  if(target.kind==='rescue'){const friend=g.seats.find(p=>p.id===target.id)!;friend.stun=0;friend.safe=g.now+2600;s.rescues++;event(g,s.name+' freed '+friend.name+'!','rescue',friend);return;}
  if(target.kind==='noise'){const n=g.noises.find(n=>n.id===target.id)!;if(n.attached){const l=g.loot.find(l=>l.id===n.source);if(l)l.quietUntil=g.now+8000;n.attached=null;}else if(n.source){const l=g.loot.find(l=>l.id===n.source);if(l)l.quietUntil=g.now+8000;}n.holder=s.id;n.flight=0;n.vx=n.vy=0;n.kind='capsule';n.expires=g.now+10000;s.hand=n.id;if(!n.counted){s.captures++;n.counted=true;g.alert=Math.min(100,g.alert+2);}s.windup=g.now+650;event(g,s.name+' stole the scream. Aim, then throw!','capture',s);return;}
  if(target.kind==='loot'){const l=g.loot.find(l=>l.id===target.id)!;l.holder=s.id;s.hand=l.id;if(!l.quietUntil||l.quietUntil<=g.now){hush(g,l);alarm(g,s,l.id,s.id);}event(g,'The art screams! G drops it. An empty-handed partner can steal its scream.','info',s);return;}
  if(target.kind==='locked')event(g,'The Scream is locked. A teammate must hold the marked plate.');
  return;
 }
 if(type==='throw'&&s.hand){const target=aim||s.aim;const dx=target.x-s.x,dy=target.y-s.y,len=Math.hypot(dx,dy)||1;const n=g.noises.find(n=>n.id===s.hand),l=g.loot.find(l=>l.id===s.hand);s.hand=null;
  if(n){n.attached=null;n.thrownBy=s.id;n.thrownAt=g.now;n.heardBy=[];n.holder=null;n.x=s.x;n.y=s.y;n.vx=dx/len*430;n.vy=dy/len*430;n.flight=0.6;n.born=g.now;n.expires=g.now+6500;event(g,s.name+' threw a distraction.','throw',s);}
  if(l){hush(g,l);let p:Vec={x:s.x,y:s.y};for(let i=0;i<14;i++){const q={x:p.x+dx/len*10,y:p.y+dy/len*10};if(!clear(q,10))break;p=q;}l.holder=null;l.x=p.x;l.y=p.y;const friend=g.seats.find(b=>b.id!==s.id&&sameCrew(b,s)&&!b.hand&&!b.escaped&&b.stun<=g.now&&distance(b,l)<40);if(friend){friend.hand=l.id;l.holder=friend.id;event(g,friend.name+' caught the loot!','rescue',friend);}else event(g,s.name+' tossed the loot.','throw',l);}
 }
}
export function input(g:Game,s:Thief,a:{seq?:number;dx?:number;dy?:number;aim?:Vec;action?:string}){if(!Number.isSafeInteger(a.seq)||a.seq!<=s.lastSeq)return;s.lastSeq=a.seq!;s.inputAt=g.now;s.dx=Math.max(-1,Math.min(1,Number(a.dx)||0));s.dy=Math.max(-1,Math.min(1,Number(a.dy)||0));if(a.aim&&Number.isFinite(a.aim.x)&&Number.isFinite(a.aim.y))s.aim={x:Math.max(24,Math.min(936,a.aim.x)),y:Math.max(24,Math.min(576,a.aim.y))};if(a.action)action(g,s,a.action);}
// Small grid pathfinder: identical collision geometry for humans, guards and bots.
function corridor(a:Vec,b:Vec){const n=Math.max(1,Math.ceil(distance(a,b)/5));for(let i=1;i<=n;i++)if(!clear({x:a.x+(b.x-a.x)*i/n,y:a.y+(b.y-a.y)*i/n},13))return false;return true;}
export function steer(a:Vec,b:Vec):Vec{if(corridor(a,b))return b;const size=40,cols=24,rows=15;const cell=(p:Vec)=>{const cx=Math.min(cols-2,Math.max(1,Math.floor(p.x/size))),cy=Math.min(rows-2,Math.max(1,Math.floor(p.y/size)));const options:Vec[]=[];for(let y=cy-1;y<=cy+1;y++)for(let x=cx-1;x<=cx+1;x++){const q={x:x*size+20,y:y*size+20};if(x>0&&x<cols-1&&y>0&&y<rows-1&&clear(q,13)&&corridor(p,q))options.push({x,y});}return options.sort((a,b)=>distance(p,{x:a.x*size+20,y:a.y*size+20})-distance(p,{x:b.x*size+20,y:b.y*size+20}))[0]||{x:cx,y:cy};};const start=cell(a),goal=cell(b),key=(x:number,y:number)=>y*cols+x;const q=[key(start.x,start.y)],prev=new Map<number,number>();prev.set(q[0],-1);let end=-1;for(let i=0;i<q.length;i++){const v=q[i],x=v%cols,y=Math.floor(v/cols);if(x===goal.x&&y===goal.y){end=v;break;}for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,k=key(nx,ny);if(nx<1||nx>=cols-1||ny<1||ny>=rows-1||prev.has(k)||!clear({x:nx*size+20,y:ny*size+20},13))continue;prev.set(k,v);q.push(k);}}
 if(end<0)return a;const path:Vec[]=[];while(end!==-1){path.push({x:(end%cols)*size+20,y:Math.floor(end/cols)*size+20});end=prev.get(end)!;}return path.find(p=>corridor(a,p))||a;}
function walk(p:Vec,target:Vec,dt:number,speed:number){const next=steer(p,target);const d=distance(p,next);if(d>3)move(p,(next.x-p.x)/d,(next.y-p.y)/d,dt,Math.min(speed,d/dt));}
function decoy(g:Game,s:Thief):Vec{const crew=g.seats.filter(p=>sameCrew(p,s)&&!p.escaped);const rivals=g.seats.filter(p=>!sameCrew(p,s)&&!p.escaped);const candidates=[{x:70,y:70},{x:250,y:70},{x:360,y:60},{x:570,y:350},{x:690,y:70},{x:890,y:520},...rivals.map(p=>({x:p.x,y:p.y}))].filter(p=>distance(p,EXIT)>210&&sight(s,p)&&distance(s,p)>100);return candidates.sort((a,b)=>{const score=(p:Vec)=>Math.min(...crew.map(c=>distance(c,p)))+rivals.reduce((v,r)=>v+(distance(r,p)<100?70:0),0);return score(b)-score(a);})[0]||{x:Math.min(900,s.x+220),y:Math.max(50,s.y-180)};}
function bot(g:Game,s:Thief,dt:number){if(s.escaped||s.stun>g.now)return;const crew=g.seats.filter(p=>sameCrew(p,s));const human=crew.find(x=>!x.bot&&!x.escaped);const partner=human||crew.find(p=>p.id!==s.id&&!p.escaped);const held=g.loot.find(l=>l.id===s.hand);const capsule=g.noises.find(n=>n.id===s.hand);
 if(g.boardingAt||g.end-g.now<10000){walk(s,EXIT,dt,150);if(distance(s,EXIT)<65)action(g,s,'extract');return;}
 const captive=crew.find(x=>x.stun>g.now&&!x.escaped);if(captive){walk(s,captive,dt,150);if(distance(s,captive)<60)action(g,s,'grab');return;}
 if(capsule){if(g.now>=s.windup)action(g,s,'throw',decoy(g,s));return;}
 if(held){walk(s,EXIT,dt,125);return;}
 if(s.mode==='plate'){walk(s,PLATE,dt,145);return;}
 const autonomous=!crew.some(p=>!p.bot),humanFirst=g.seats.some(p=>!p.bot&&p.captures>0);
 const n=g.noises.filter(n=>!n.holder&&!n.thrownBy&&capturable(g,s,n)&&g.now-n.born>1400&&((s.mode==='cover'&&partner&&distance(partner,n)<150)||(autonomous&&partner&&distance(partner,n)<150)||(humanFirst&&s.mode!=='follow'&&!n.attached&&crew.some(p=>p.hand&&distance(p,n)<100)))).sort((a,b)=>distance(a,s)-distance(b,s))[0];
 if(n){action(g,s,'grab');return;}
 if(s.mode==='cover'&&partner){if(distance(s,partner)>55)walk(s,partner,dt,150);return;}
 const jackpot=g.loot.find(l=>l.id==='art3'&&!l.banked&&!l.holder);
 if(autonomous&&jackpot&&g.loot.filter(l=>!l.banked&&!l.holder&&l.id!=='art3').length===0){if(crew[0]?.id===s.id){walk(s,PLATE,dt,145);return;}walk(s,jackpot,dt,140);if(distance(s,jackpot)<50)action(g,s,'grab');return;}
 const fetch=s.mode==='fetch'||autonomous;
 const l=g.loot.filter(l=>!l.banked&&!l.holder&&l.id!=='art3'&&fetch).sort((a,b)=>distance(a,s)-distance(b,s))[0];
 if(l&&g.now-g.start>12000){walk(s,l,dt,135);if(distance(l,s)<50)action(g,s,'grab');return;}
 if(partner&&distance(partner,s)>65)walk(s,partner,dt,150);
}
function step(g:Game){const dt=STEP/1000;
 if(g.crewMode==='coop'&&!g.boardingAt&&g.seats.filter(s=>!s.bot).every(s=>s.escaped)&&g.seats.some(s=>!s.bot)){g.boardingAt=g.now;event(g,'Crew boarding. Job closes in 5 seconds.');}
 if(!g.honking&&g.end-g.now<=15000){g.honking=true;event(g,'VAN LEAVES IN 15 SECONDS. Bank it or lose it!','honk');}
 if(g.alert>=60&&g.guards.length===3){const route=[{x:850,y:520},{x:690,y:320}];g.guards.push({id:'g3',...route[0],angle:Math.PI,mode:'patrol',target:route[1],route,way:1,attention:0,victim:null});event(g,'LOCKDOWN. A fourth guard has arrived.','honk');}
 for(const s of g.seats){if(s.bot)bot(g,s,dt);else if(!s.escaped&&s.stun<=g.now&&g.now-s.inputAt<500)move(s,s.dx,s.dy,dt,s.hand?125:165);
  if(s.stun&&s.stun<=g.now){s.stun=0;s.safe=g.now+2500;event(g,s.name+' slipped free. Recover the dropped loot.','rescue',s);}
  const l=g.loot.find(l=>l.holder===s.id);if(l){l.x=s.x;l.y=s.y;if(distance(s,EXIT)<62){hush(g,l);l.banked=true;l.holder=null;s.hand=null;s.bank+=l.value;g.total+=l.value;event(g,'$'+l.value+' secured. '+s.name+' delivered '+l.name+'.','bank',EXIT);}}
 }
 for(const l of g.loot){if(l.holder&&!l.banked&&!g.noises.some(n=>n.source===l.id&&n.attached)&&(!l.quietUntil||g.now>=l.quietUntil)){const carrier=g.seats.find(s=>s.id===l.holder)!;alarm(g,carrier,l.id,carrier.id);}}
 for(const n of g.noises){if(n.attached){const carrier=g.seats.find(s=>s.id===n.attached);if(carrier){n.x=carrier.x;n.y=carrier.y;}}else if(n.holder){const s=g.seats.find(s=>s.id===n.holder)!;n.x=s.x;n.y=s.y;if(g.now>=n.expires){n.holder=null;s.hand=null;n.expires=g.now+4000;n.born=g.now;event(g,'The bottled alarm burst!','catch',s);}}else if(n.flight>0){const p={x:n.x+n.vx*dt,y:n.y+n.vy*dt};if(clear(p,6)){n.x=p.x;n.y=p.y;n.flight-=dt;}else n.flight=0;if(n.flight<=0)event(g,'Distraction landed.','land',n);}}
 g.noises=g.noises.filter(n=>n.expires>g.now);
 for(const guard of g.guards){let victim:Thief|undefined;
  if(g.now-g.start<12000&&guard.id==='g0'){guard.x=80;guard.y=60;guard.angle=-Math.PI/2;guard.mode='patrol';continue;}
  for(const s of g.seats){if(s.escaped||s.stun>g.now||s.safe>g.now||distance(s,EXIT)<90)continue;const d=distance(guard,s);const diff=Math.atan2(Math.sin(Math.atan2(s.y-guard.y,s.x-guard.x)-guard.angle),Math.cos(Math.atan2(s.y-guard.y,s.x-guard.x)-guard.angle));if(d<180&&(Math.abs(diff)<0.65||d<45)&&sight(guard,s)){victim=s;break;}}
  const noise=g.noises.filter(n=>!n.holder&&n.flight<=0&&g.now-n.born>900&&distance(n,guard)<420&&sight(guard,n)).sort((a,b)=>distance(a,guard)-distance(b,guard))[0];
  if(victim){guard.mode='chase';guard.target={x:victim.x,y:victim.y};guard.victim=victim.id;guard.attention=g.now+1600;}
  else if(noise){guard.mode='investigate';guard.target={x:noise.x,y:noise.y};guard.victim=null;guard.attention=g.now+2000;if(noise.thrownBy&&!noise.heardBy?.includes(guard.id)){noise.heardBy??=[];noise.heardBy.push(guard.id);const thrower=g.seats.find(s=>s.id===noise.thrownBy);if(thrower)thrower.bestThrow=Math.max(thrower.bestThrow,noise.heardBy.length);}}
  else if(guard.attention<g.now){guard.mode='patrol';guard.victim=null;guard.target=guard.route[guard.way];if(distance(guard,guard.target)<16){guard.way=(guard.way+1)%guard.route.length;guard.target=guard.route[guard.way];}}
  const old={x:guard.x,y:guard.y};walk(guard,guard.target,dt,(guard.mode==='chase'?135:guard.mode==='investigate'?103:62)*(g.alert>=30?1.12:1));if(distance(old,guard)>0.1)guard.angle=Math.atan2(guard.y-old.y,guard.x-old.x);
  const caught=g.seats.find(s=>!s.escaped&&s.stun<=g.now&&s.safe<=g.now&&distance(s,EXIT)>90&&distance(s,guard)<25&&sight(s,guard));
  if(caught){drop(g,caught);caught.stun=g.now+4500;caught.dx=caught.dy=0;guard.mode='patrol';guard.attention=0;event(g,caught.name+' caught! Get close and GRAB to free them.','catch',caught);}
 }
 if(g.now>g.alarmAt){const targets=g.loot.filter(l=>!l.banked&&!l.holder);if(targets.length&&g.noises.length<3){const l=targets[Math.floor(random(g)*targets.length)];alarm(g,l,l.id);}g.alarmAt=g.now+15000+random(g)*7000;}
 if(g.seats.every(s=>s.escaped)||g.now>=g.end||(g.boardingAt>0&&g.now-g.boardingAt>=5000)){g.phase='finished';g.success=g.total>=500&&g.seats.some(s=>s.escaped||distance(s,EXIT)<70);for(const s of g.seats){if(distance(s,EXIT)<70&&s.stun<=g.now)s.escaped=true;s.dx=s.dy=0;}event(g,g.success?'The crew got away.':'The van had to leave.');}
}
export function advance(g:Game,to:number){if(g.phase!=='playing'){g.now=to;return;}const until=Math.min(to,g.now+2000);while(g.now+STEP<=until&&g.phase==='playing'){g.now+=STEP;step(g);}if(to-until>0){g.end+=to-until;g.now=to;}}
export function command(g:Game,id:string,a:{type:string;name?:string;botId?:string;seq?:number;dx?:number;dy?:number;aim?:Vec;action?:string;crewMode?:CrewMode;team?:number}){const s=g.seats.find(s=>s.id===id);if(!s)throw Error('Join the crew first.');s.lastSeen=g.now;
 if(a.type==='start'){if(g.host!==id||g.phase!=='lobby')throw Error('Only the host can start from the lobby.');if(g.crewMode!=='coop'){const scores=crewScores(g),size=g.crewMode==='duos'?2:3;if(scores.length<2||scores.some(t=>g.seats.filter(s=>s.team===t.team).length!==size))throw Error('Balance crews or fill empty slots with bots first.');}setup(g);}
 else if(a.type==='ready'){if(g.phase!=='ready')return;s.ready=true;if(g.seats.every(s=>s.ready))begin(g);}
 else if(a.type==='configure'){if(g.host!==id)throw Error('Host only.');if(['coop','duos','trios'].includes(a.crewMode||''))configure(g,a.crewMode!);}
 else if(a.type==='fill'){if(g.host!==id)throw Error('Host only.');fillCrews(g);}
 else if(a.type==='team'){if(g.phase!=='lobby'||g.crewMode==='coop')return;const team=Number(a.team),max=g.crewMode==='trios'?2:3;if(Number.isInteger(team)&&team>=0&&team<max)s.team=team;}
 else if(a.type==='bot'){if(g.host!==id||g.phase!=='lobby')throw Error('Only the host can change the lobby.');add(g,['Echo','Pip','Moss','Jinx','Vale'][g.seats.filter(s=>s.bot).length]||'Echo','bot'+g.serial,true);}
 else if(a.type==='remove'){if(g.host!==id||g.phase!=='lobby')throw Error('Only the host can change the lobby.');g.seats=g.seats.filter(s=>!s.bot||s.id!==a.botId);}
 else if(a.type==='replay'){if(g.host!==id||g.phase!=='finished')throw Error('Only the host can replay a finished job.');setup(g);}
 else if(a.type==='input')input(g,s,a);
}
export function view(g:Game,id:string){return {...g,you:id,seats:g.seats.map(({token,...s})=>s)};}
export type View=ReturnType<typeof view>;
