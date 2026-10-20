/** Noise Thieves: deterministic, fixed-step simulation shared by solo and server. */
export type Vec={x:number;y:number};
export type Rect=Vec&{w:number;h:number};
export const W=960,H=600,STEP=40,DURATION=90000;
export const EXIT={x:88,y:510};
export const WALLS:Rect[]=[{x:0,y:0,w:960,h:24},{x:0,y:576,w:960,h:24},{x:0,y:0,w:24,h:600},{x:936,y:0,w:24,h:600},
{x:300,y:24,w:20,h:150},{x:300,y:260,w:20,h:160},{x:300,y:500,w:20,h:76},
{x:620,y:24,w:20,h:250},{x:620,y:360,w:20,h:120},
{x:320,y:390,w:160,h:18},{x:550,y:390,w:70,h:18},
{x:90,y:220,w:100,h:34},{x:420,y:170,w:90,h:34},{x:750,y:210,w:80,h:34}];
export type Thief=Vec&{id:string;name:string;bot:boolean;token?:string;dx:number;dy:number;aim:Vec;inputAt:number;lastSeq:number;ready:boolean;hand:string|null;stun:number;safe:number;escaped:boolean;captures:number;rescues:number;bank:number;cooldown:number;mode:'follow'|'fetch';lastSeen:number};
export type Guard=Vec&{id:string;angle:number;mode:'patrol'|'investigate'|'chase';target:Vec;route:Vec[];way:number;attention:number;victim:string|null};
export type Loot=Vec&{id:string;name:string;value:number;holder:string|null;banked:boolean};
export type Noise=Vec&{id:string;holder:string|null;expires:number;born:number;vx:number;vy:number;flight:number;kind:'alarm'|'capsule';source:string|null};
export type Event={id:number;at:number;text:string;kind:'info'|'capture'|'throw'|'catch'|'bank'|'rescue';x:number;y:number};
export type Game={version:1;code:string;host:string;phase:'lobby'|'ready'|'playing'|'finished';seats:Thief[];guards:Guard[];loot:Loot[];noises:Noise[];events:Event[];serial:number;now:number;start:number;end:number;seed:number;revision:number;alarmAt:number;total:number;success:boolean};
export const distance=(a:Vec,b:Vec)=>Math.hypot(a.x-b.x,a.y-b.y);
export function clear(p:Vec,r=12){return p.x>=24+r&&p.x<=936-r&&p.y>=24+r&&p.y<=576-r&&!WALLS.some(w=>p.x>w.x-r&&p.x<w.x+w.w+r&&p.y>w.y-r&&p.y<w.y+w.h+r);}
export function sight(a:Vec,b:Vec){const n=Math.ceil(distance(a,b)/8);for(let i=1;i<n;i++)if(!clear({x:a.x+(b.x-a.x)*i/n,y:a.y+(b.y-a.y)*i/n},0))return false;return true;}
export function move(p:Vec,dx:number,dy:number,dt:number,speed=150){const len=Math.hypot(dx,dy);if(!len)return;dx/=Math.max(1,len);dy/=Math.max(1,len);const x=p.x+dx*speed*dt,y=p.y+dy*speed*dt;if(clear({x,y:p.y}))p.x=x;if(clear({x:p.x,y}))p.y=y;}
function random(g:Game){g.seed=(Math.imul(1664525,g.seed)+1013904223)>>>0;return g.seed/4294967296;}
export function event(g:Game,text:string,kind:Event['kind']='info',p:Vec=EXIT){g.events.push({id:++g.serial,at:g.now,text,kind,x:p.x,y:p.y});g.events=g.events.slice(-12);}
export function create(code:string,now=0,seed=13):Game{return {version:1,code,host:'',phase:'lobby',seats:[],guards:[],loot:[],noises:[],events:[],serial:0,now,start:0,end:0,seed,revision:0,alarmAt:0,total:0,success:false};}
export function add(g:Game,name:string,token:string,bot=false){if(g.phase!=='lobby')throw Error('This job has started. Join the next one.');if(g.seats.length>=4)throw Error('Crew full (four thieves).');const id='p'+(++g.serial);const s:Thief={id,name:name.trim().slice(0,18)||'Rookie',token:bot?undefined:token,bot,x:85+g.seats.length*30,y:485,dx:0,dy:0,aim:{x:500,y:300},inputAt:0,lastSeq:0,ready:false,hand:null,stun:0,safe:0,escaped:false,captures:0,rescues:0,bank:0,cooldown:0,mode:'follow',lastSeen:g.now};g.seats.push(s);if(!g.host)g.host=id;return s;}
export function setup(g:Game){g.phase='ready';g.events=[];g.noises=[];g.total=0;g.success=false;g.start=0;g.end=0;
 g.seats.forEach((s,i)=>Object.assign(s,{x:80+i*28,y:495,dx:0,dy:0,hand:null,stun:0,safe:0,escaped:false,captures:0,rescues:0,bank:0,cooldown:0,ready:s.bot,lastSeq:0,mode:'follow'}));
 g.loot=[{id:'art1',name:'Golden echo',value:500,x:205,y:320},{id:'art2',name:'Moon vase',value:800,x:440,y:285},{id:'art3',name:'The scream',value:1200,x:835,y:120},{id:'art4',name:'Blue idol',value:1000,x:810,y:470}].map(x=>({...x,holder:null,banked:false}));
 const routes=[[{x:210,y:125},{x:250,y:340},{x:70,y:335},{x:70,y:120}],[{x:405,y:95},{x:565,y:95},{x:565,y:335},{x:365,y:335}],[{x:710,y:115},{x:880,y:115},{x:880,y:510},{x:710,y:510}]];
 g.guards=routes.map((route,i)=>({id:'g'+i,...route[0],angle:Math.PI/2,mode:'patrol',target:route[1],route,way:1,attention:0,victim:null}));
 event(g,'Grab the gold. Steal its alarm. Get back to the van.');
}
function begin(g:Game){g.phase='playing';g.start=g.now;g.end=g.now+DURATION;g.alarmAt=g.now+18000;event(g,'Job is live. The van leaves in 90 seconds.');}
function alarm(g:Game,p:Vec,source:string|null=null){const id='n'+(++g.serial);g.noises.push({id,x:p.x,y:p.y,holder:null,expires:g.now+6500,born:g.now,vx:0,vy:0,flight:0,kind:'alarm',source});return id;}
function drop(g:Game,s:Thief){if(!s.hand)return;const l=g.loot.find(x=>x.id===s.hand),n=g.noises.find(x=>x.id===s.hand);if(l){l.holder=null;l.x=s.x;l.y=s.y;}if(n){n.holder=null;n.x=s.x;n.y=s.y;n.expires=g.now+5000;n.born=g.now;}s.hand=null;}
export function action(g:Game,s:Thief,type:string,aim?:Vec){if(g.phase!=='playing'||s.escaped||s.stun>g.now)return;
 if(type==='extract'){if(distance(s,EXIT)>70)throw Error('Return to the mint getaway zone first.');const held=g.loot.find(l=>l.id===s.hand);if(held){held.banked=true;held.holder=null;s.hand=null;s.bank+=held.value;g.total+=held.value;}drop(g,s);s.escaped=true;s.dx=s.dy=0;event(g,s.name+' is in the van.','bank',s);return;}
 if(type==='help'){g.seats.filter(x=>x.bot).forEach(b=>b.mode=b.mode==='follow'?'fetch':'follow');event(g,'Echo: '+(g.seats.find(x=>x.bot)?.mode==='fetch'?'I’ll bring nearby loot.':'Sticking with you.'));return;}
 if(g.now<s.cooldown)return;s.cooldown=g.now+260;
 if(type==='grab'){
  const friend=g.seats.find(p=>p.id!==s.id&&p.stun>g.now&&distance(p,s)<65&&sight(s,p));if(friend){friend.stun=0;friend.safe=g.now+2600;s.rescues++;event(g,s.name+' freed '+friend.name+'!','rescue',friend);return;}
  if(s.hand){drop(g,s);event(g,s.name+' put it down.','info',s);return;}
  const n=g.noises.filter(n=>!n.holder&&distance(n,s)<115&&sight(s,n)).sort((a,b)=>distance(a,s)-distance(b,s))[0];
  if(n){n.holder=s.id;n.flight=0;n.vx=n.vy=0;n.kind='capsule';n.expires=g.now+10000;s.hand=n.id;s.captures++;event(g,s.name+' stole the alarm. Throw it away from the crew!','capture',s);return;}
  const l=g.loot.filter(l=>!l.holder&&!l.banked&&distance(l,s)<55&&sight(s,l)).sort((a,b)=>distance(a,s)-distance(b,s))[0];
  if(l){l.holder=s.id;s.hand=l.id;alarm(g,l,l.id);event(g,'Alarm! Drop the art to capture it—or let a friend handle it.','info',s);}return;
 }
 if(type==='throw'&&s.hand){const target=aim||s.aim;const dx=target.x-s.x,dy=target.y-s.y,len=Math.hypot(dx,dy)||1;const n=g.noises.find(n=>n.id===s.hand),l=g.loot.find(l=>l.id===s.hand);s.hand=null;
  if(n){n.holder=null;n.x=s.x;n.y=s.y;n.vx=dx/len*430;n.vy=dy/len*430;n.flight=0.6;n.born=g.now;n.expires=g.now+6500;event(g,s.name+' threw a distraction.','throw',s);}
  if(l){let p:Vec={x:s.x,y:s.y};for(let i=0;i<14;i++){const q={x:p.x+dx/len*10,y:p.y+dy/len*10};if(!clear(q,10))break;p=q;}l.holder=null;l.x=p.x;l.y=p.y;const friend=g.seats.find(b=>b.id!==s.id&&!b.hand&&!b.escaped&&b.stun<=g.now&&distance(b,l)<40);if(friend){friend.hand=l.id;l.holder=friend.id;event(g,friend.name+' caught the loot!','rescue',friend);}else event(g,s.name+' tossed the loot.','throw',l);}
 }
}
export function input(g:Game,s:Thief,a:{seq?:number;dx?:number;dy?:number;aim?:Vec;action?:string}){if(!Number.isSafeInteger(a.seq)||a.seq!<=s.lastSeq)return;s.lastSeq=a.seq!;s.inputAt=g.now;s.dx=Math.max(-1,Math.min(1,Number(a.dx)||0));s.dy=Math.max(-1,Math.min(1,Number(a.dy)||0));if(a.aim&&Number.isFinite(a.aim.x)&&Number.isFinite(a.aim.y))s.aim={x:Math.max(24,Math.min(936,a.aim.x)),y:Math.max(24,Math.min(576,a.aim.y))};if(a.action)action(g,s,a.action);}
// Small grid pathfinder: identical collision geometry for humans, guards and bots.
function corridor(a:Vec,b:Vec){const n=Math.max(1,Math.ceil(distance(a,b)/5));for(let i=1;i<=n;i++)if(!clear({x:a.x+(b.x-a.x)*i/n,y:a.y+(b.y-a.y)*i/n},13))return false;return true;}
export function steer(a:Vec,b:Vec):Vec{if(corridor(a,b))return b;const size=40,cols=24,rows=15;const cell=(p:Vec)=>{const cx=Math.min(cols-2,Math.max(1,Math.floor(p.x/size))),cy=Math.min(rows-2,Math.max(1,Math.floor(p.y/size)));const options:Vec[]=[];for(let y=cy-1;y<=cy+1;y++)for(let x=cx-1;x<=cx+1;x++){const q={x:x*size+20,y:y*size+20};if(x>0&&x<cols-1&&y>0&&y<rows-1&&clear(q,13)&&corridor(p,q))options.push({x,y});}return options.sort((a,b)=>distance(p,{x:a.x*size+20,y:a.y*size+20})-distance(p,{x:b.x*size+20,y:b.y*size+20}))[0]||{x:cx,y:cy};};const start=cell(a),goal=cell(b),key=(x:number,y:number)=>y*cols+x;const q=[key(start.x,start.y)],prev=new Map<number,number>();prev.set(q[0],-1);let end=-1;for(let i=0;i<q.length;i++){const v=q[i],x=v%cols,y=Math.floor(v/cols);if(x===goal.x&&y===goal.y){end=v;break;}for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,k=key(nx,ny);if(nx<1||nx>=cols-1||ny<1||ny>=rows-1||prev.has(k)||!clear({x:nx*size+20,y:ny*size+20},13))continue;prev.set(k,v);q.push(k);}}
 if(end<0)return a;const path:Vec[]=[];while(end!==-1){path.push({x:(end%cols)*size+20,y:Math.floor(end/cols)*size+20});end=prev.get(end)!;}return path.find(p=>corridor(a,p))||a;}
function walk(p:Vec,target:Vec,dt:number,speed:number){const next=steer(p,target);const d=distance(p,next);if(d>3)move(p,(next.x-p.x)/d,(next.y-p.y)/d,dt,Math.min(speed,d/dt));}
function bot(g:Game,s:Thief,dt:number){if(s.escaped||s.stun>g.now)return;const human=g.seats.find(x=>!x.bot&&!x.escaped);const held=g.loot.find(l=>l.id===s.hand);const capsule=g.noises.find(n=>n.id===s.hand);
 const captive=g.seats.find(x=>x.stun>g.now&&!x.bot);if(captive){walk(s,captive,dt,150);if(distance(s,captive)<60)action(g,s,'grab');return;}
 if(capsule){const target=g.guards.filter(x=>distance(x,s)<270).sort((a,b)=>distance(a,s)-distance(b,s))[0];const aim=target?{x:target.x+(target.x-s.x)*1.4,y:target.y+(target.y-s.y)*1.4}:{x:850,y:70};action(g,s,'throw',aim);return;}
 if(held){walk(s,EXIT,dt,125);return;}
 const n=g.noises.find(n=>!n.holder&&distance(n,s)<160&&sight(s,n));if(n&&human&&distance(human,n)<200){walk(s,n,dt,150);if(distance(s,n)<110)action(g,s,'grab');return;}
 if(g.end-g.now<12000){walk(s,EXIT,dt,150);if(distance(s,EXIT)<65)action(g,s,'extract');return;}
 const l=g.loot.filter(l=>!l.banked&&!l.holder&&distance(l,s)<(s.mode==='fetch'?300:60)).sort((a,b)=>distance(a,s)-distance(b,s))[0];
 if(l&&g.now-g.start>9000&&(s.mode==='fetch'||!human?.hand&&human&&distance(human,l)>90)){walk(s,l,dt,125);if(distance(l,s)<50)action(g,s,'grab');return;}
 if(human&&distance(human,s)>75)walk(s,{x:human.x-40,y:human.y+25},dt,142);
}
function step(g:Game){const dt=STEP/1000;
 for(const s of g.seats){if(s.bot)bot(g,s,dt);else if(!s.escaped&&s.stun<=g.now&&g.now-s.inputAt<500)move(s,s.dx,s.dy,dt,s.hand?125:165);
  if(s.stun&&s.stun<=g.now){s.stun=0;s.safe=g.now+2500;event(g,s.name+' slipped free. Recover the dropped loot.','rescue',s);}
  const l=g.loot.find(l=>l.holder===s.id);if(l){l.x=s.x;l.y=s.y;if(distance(s,EXIT)<62){l.banked=true;l.holder=null;s.hand=null;s.bank+=l.value;g.total+=l.value;event(g,'$'+l.value+' secured. '+s.name+' delivered '+l.name+'.','bank',EXIT);}}
 }
 for(const n of g.noises){if(n.holder){const s=g.seats.find(s=>s.id===n.holder)!;n.x=s.x;n.y=s.y;if(g.now>=n.expires){n.holder=null;s.hand=null;n.expires=g.now+4000;n.born=g.now;event(g,'The bottled alarm burst!','catch',s);}}else if(n.flight>0){const p={x:n.x+n.vx*dt,y:n.y+n.vy*dt};if(clear(p,6)){n.x=p.x;n.y=p.y;n.flight-=dt;}else n.flight=0;}}
 g.noises=g.noises.filter(n=>n.expires>g.now);
 for(const guard of g.guards){let victim:Thief|undefined;
  for(const s of g.seats){if(s.escaped||s.stun>g.now||s.safe>g.now||distance(s,EXIT)<90)continue;const d=distance(guard,s);const diff=Math.atan2(Math.sin(Math.atan2(s.y-guard.y,s.x-guard.x)-guard.angle),Math.cos(Math.atan2(s.y-guard.y,s.x-guard.x)-guard.angle));if(d<180&&(Math.abs(diff)<0.65||d<45)&&sight(guard,s)){victim=s;break;}}
  const noise=g.noises.filter(n=>!n.holder&&n.flight<=0&&g.now-n.born>900&&distance(n,guard)<420&&sight(guard,n)).sort((a,b)=>distance(a,guard)-distance(b,guard))[0];
  if(victim){guard.mode='chase';guard.target={x:victim.x,y:victim.y};guard.victim=victim.id;guard.attention=g.now+1600;}
  else if(noise){guard.mode='investigate';guard.target={x:noise.x,y:noise.y};guard.victim=null;guard.attention=g.now+2000;}
  else if(guard.attention<g.now){guard.mode='patrol';guard.victim=null;guard.target=guard.route[guard.way];if(distance(guard,guard.target)<16){guard.way=(guard.way+1)%guard.route.length;guard.target=guard.route[guard.way];}}
  const old={x:guard.x,y:guard.y};walk(guard,guard.target,dt,guard.mode==='chase'?135:guard.mode==='investigate'?103:62);if(distance(old,guard)>0.1)guard.angle=Math.atan2(guard.y-old.y,guard.x-old.x);
  const caught=g.seats.find(s=>!s.escaped&&s.stun<=g.now&&s.safe<=g.now&&distance(s,EXIT)>90&&distance(s,guard)<25&&sight(s,guard));
  if(caught){drop(g,caught);caught.stun=g.now+4500;caught.dx=caught.dy=0;guard.mode='patrol';guard.attention=0;event(g,caught.name+' caught! Get close and GRAB to free them.','catch',caught);}
 }
 if(g.now>g.alarmAt){const targets=g.loot.filter(l=>!l.banked&&!l.holder);if(targets.length&&g.noises.length<3){const l=targets[Math.floor(random(g)*targets.length)];alarm(g,l,l.id);}g.alarmAt=g.now+15000+random(g)*7000;}
 if(g.seats.every(s=>s.escaped)||g.now>=g.end){g.phase='finished';g.success=g.total>=500&&g.seats.some(s=>s.escaped||distance(s,EXIT)<70);for(const s of g.seats){if(distance(s,EXIT)<70&&s.stun<=g.now)s.escaped=true;s.dx=s.dy=0;}event(g,g.success?'The crew got away.':'The van had to leave.');}
}
export function advance(g:Game,to:number){if(g.phase!=='playing'){g.now=to;return;}const until=Math.min(to,g.now+2000);while(g.now+STEP<=until&&g.phase==='playing'){g.now+=STEP;step(g);}if(to-until>0){g.end+=to-until;g.now=to;}}
export function command(g:Game,id:string,a:{type:string;name?:string;botId?:string;seq?:number;dx?:number;dy?:number;aim?:Vec;action?:string}){const s=g.seats.find(s=>s.id===id);if(!s)throw Error('Join the crew first.');s.lastSeen=g.now;
 if(a.type==='start'){if(g.host!==id||g.phase!=='lobby')throw Error('Only the host can start from the lobby.');setup(g);}
 else if(a.type==='ready'){if(g.phase!=='ready')return;s.ready=true;if(g.seats.every(s=>s.ready))begin(g);}
 else if(a.type==='bot'){if(g.host!==id||g.phase!=='lobby')throw Error('Only the host can change the lobby.');add(g,['Echo','Pip','Moss'][g.seats.filter(s=>s.bot).length]||'Echo','bot'+g.serial,true);}
 else if(a.type==='remove'){if(g.host!==id||g.phase!=='lobby')throw Error('Only the host can change the lobby.');g.seats=g.seats.filter(s=>!s.bot||s.id!==a.botId);}
 else if(a.type==='replay'){if(g.host!==id||g.phase!=='finished')throw Error('Only the host can replay a finished job.');setup(g);}
 else if(a.type==='input')input(g,s,a);
}
export function view(g:Game,id:string){return {...g,you:id,seats:g.seats.map(({token,...s})=>s)};}
export type View=ReturnType<typeof view>;
