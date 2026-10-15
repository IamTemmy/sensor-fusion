/** Last Lift: server-authoritative grid heist. Currency is fictional score. */
export const W=16,H=11;
export const tiles=[
'################',
'#......#.......#',
'#......#.......#',
'#..............#',
'#..##..#..##...#',
'#......#.......#',
'###.####.###.###',
'#..............#',
'#..##.....##...#',
'#..............#',
'################'];
export const EXIT={x:2,y:9},ROOF={x:13,y:1};
export type Seat={id:string;token:string;name:string;bot:boolean;last:number;lastSeen:number;x:number;y:number;cash:number;hot:number;bank:number;status:'inside'|'escaped'|'caught';loot:string|null;stun:number;decoys:number;trait:number};
export type Loot={id:string;name:string;value:number;x:number;y:number;homeX:number;homeY:number;carriers:string[];state:'floor'|'carried'|'deal'|'sold'|'lost'};
export type Deal={id:string;lootId:string;seats:string[];choices:Record<string,'split'|'steal'>;deadline:number};
export type Room={version:number;code:string;revision:number;phase:'lobby'|'playing'|'finished';round:number;deadline:number;started:number;created:number;hostId:string;seats:Seat[];loot:Loot[];deals:Deal[];history:any[];messages:string[];seed:number;alarm:number;lockdown:boolean;lastTick:number;replay:number;decoy:{x:number;y:number;until:number}|null};
const patrols=[[{x:4,y:3},{x:5,y:3},{x:6,y:3},{x:7,y:3},{x:8,y:3},{x:9,y:3},{x:10,y:3},{x:11,y:3},{x:10,y:3},{x:9,y:3},{x:8,y:3},{x:7,y:3},{x:6,y:3},{x:5,y:3}], [{x:5,y:7},{x:6,y:7},{x:7,y:7},{x:8,y:7},{x:9,y:7},{x:10,y:7},{x:9,y:7},{x:8,y:7},{x:7,y:7},{x:6,y:7}]];
export const walkable=(x:number,y:number)=>Number.isInteger(x)&&Number.isInteger(y)&&y>=0&&y<H&&x>=0&&x<W&&tiles[y][x]!== '#';
export const distance=(a:{x:number;y:number},b:{x:number;y:number})=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
export function guards(r:Room,now:number){const t=Math.floor((now-r.started)/1400);return patrols.map((path,i)=>{const idx=((t+i*3)%path.length+path.length)%path.length;const g=path[idx],next=path[(idx+1)%path.length];return {...g,dx:next.x-g.x,dy:next.y-g.y,distracted:!!r.decoy&&r.decoy.until>now};});}
export function sight(r:Room,now:number){const cells:{x:number;y:number}[]=[];for(const g of guards(r,now)){if(g.distracted)continue;cells.push({x:g.x,y:g.y});for(let j=1;j<=2;j++){const x=g.x+g.dx*j,y=g.y+g.dy*j;if(!walkable(x,y))break;cells.push({x,y});}}return cells;}
function log(r:Room,text:string){r.messages.push(text);r.messages=r.messages.slice(-8);}
function stock():Loot[]{return [{id:'sun',name:'The Midnight Sun',value:2000,x:3,y:1},{id:'mask',name:'The Golden Mask',value:1800,x:12,y:3},{id:'bird',name:'The Glass Bird',value:1200,x:12,y:8}].map(l=>({...l,homeX:l.x,homeY:l.y,carriers:[],state:'floor'}));}
export function createRoom(code:string,now:number):Room{return {version:4,code,revision:0,phase:'lobby',round:0,deadline:0,started:0,created:now,hostId:'',seats:[],loot:stock(),deals:[],history:[],messages:[],seed:crypto.getRandomValues(new Uint32Array(1))[0],alarm:0,lockdown:false,lastTick:0,replay:0,decoy:null};}
export function addSeat(r:Room,name:string,token:string,now:number,bot=false){if(r.phase!=='lobby')throw Error('The heist has started. Create a new crew.');if(r.seats.length>=4)throw Error('Four thieves maximum.');const s:Seat={id:crypto.randomUUID(),token,name:name.trim().slice(0,20)||'Rook',bot,last:0,lastSeen:now,x:2,y:9,cash:0,hot:0,bank:0,status:'inside',loot:null,stun:0,decoys:2,trait:r.seats.length%2};r.seats.push(s);if(!r.hostId)r.hostId=s.id;return s;}
export function heartbeat(r:Room,id:string,now:number){const s=r.seats.find(s=>s.id===id);if(s)s.lastSeen=now;}
export function nextStep(from:{x:number;y:number},to:{x:number;y:number}){if(distance(from,to)===0)return null;const q=[from],seen=new Set([from.x+','+from.y]),prev=new Map<string,{x:number;y:number}>();for(let i=0;i<q.length;i++){const c=q[i];for(const [dx,dy] of [[0,-1],[1,0],[0,1],[-1,0]]){const n={x:c.x+dx,y:c.y+dy},k=n.x+','+n.y;if(!walkable(n.x,n.y)||seen.has(k))continue;seen.add(k);prev.set(k,c);if(distance(n,to)===0){let p=n;while(distance(prev.get(p.x+','+p.y)!,from)!==0)p=prev.get(p.x+','+p.y)!;return p;}q.push(n);}}return null;}
function drop(r:Room,s:Seat){const l=r.loot.find(l=>l.id===s.loot);if(!l)return;for(const id of l.carriers){const c=r.seats.find(s=>s.id===id);if(c)c.loot=null;}l.x=s.x;l.y=s.y;l.carriers=[];l.state='floor';}
function start(r:Room,now:number){r.phase='playing';r.started=now;r.lastTick=now;r.deadline=now+240000;r.alarm=0;r.lockdown=false;r.decoy=null;r.deals=[];r.loot=stock();r.history=[];r.messages=['Midnight. Three exhibits. $5,000. The lift is waiting.'];for(const s of r.seats)Object.assign(s,{x:2,y:9,cash:0,hot:0,bank:0,status:'inside',loot:null,stun:0,decoys:2});}
function move(r:Room,s:Seat,x:number,y:number,now:number){if(now<s.stun)return;if(!walkable(x,y)||distance(s,{x,y})!==1)throw Error('Choose an adjacent open tile.');if(r.deals.some(d=>d.seats.includes(s.id)))throw Error('Resolve your deal first.');const l=r.loot.find(l=>l.id===s.loot);if(l){if(l.carriers.length<2)throw Error('Waiting for a partner. Drop it to move alone.');if(now-s.last<400)return;for(const id of l.carriers){const c=r.seats.find(s=>s.id===id)!;c.x=x;c.y=y;c.last=now;}l.x=x;l.y=y;}else {s.x=x;s.y=y;s.last=now;}}
function interact(r:Room,s:Seat,now:number){if(now<s.stun)throw Error('Recovering. One moment.');if(r.deals.some(d=>d.seats.includes(s.id)))throw Error('Choose Split or Steal first.');const carried=r.loot.find(l=>l.id===s.loot);if(carried){if(distance(s,EXIT)>1)throw Error('Bring the exhibit to the green lift.');if(carried.carriers.length<2)throw Error('A second thief must help carry.');carried.state='deal';const d:Deal={id:crypto.randomUUID(),lootId:carried.id,seats:[...carried.carriers],choices:{},deadline:now+15000};r.deals.push(d);for(const id of d.seats)r.seats.find(s=>s.id===id)!.loot=null;log(r,carried.name+' reached the lift. A private deal is underway.');return;}
const l=r.loot.find(l=>(l.state==='floor'||l.state==='carried')&&l.carriers.length<2&&distance(s,l)<=1);if(!l)throw Error('Stand beside an exhibit or a waiting carrier.');l.carriers.push(s.id);s.loot=l.id;s.x=l.x;s.y=l.y;l.state='carried';log(r,s.name+(l.carriers.length===1?' needs a partner for ':' joined the carry: ')+l.name);}
function resolveDeal(r:Room,d:Deal,now:number){const l=r.loot.find(l=>l.id===d.lootId)!;const ss=d.seats.map(id=>r.seats.find(s=>s.id===id)!);const choices=d.seats.map(id=>d.choices[id]||'split');const both=choices.every(c=>c==='steal');const thief=choices.indexOf('steal');let text='';let payouts=[0,0];if(both){l.state='lost';r.alarm=Math.min(100,r.alarm+25);for(const s of ss){s.x=2;s.y=9;s.stun=now+5000;}text='Both grabbed. Security seized '+l.name+'. That haul is gone.';}else if(thief>=0){l.state='sold';ss[thief].hot+=l.value;payouts[thief]=l.value;r.alarm=Math.min(100,r.alarm+15);text=ss[thief].name+' stole the whole '+l.name+' haul. HOT BAG: only the rooftop exit can bank it.';}else{l.state='sold';for(const s of ss)s.cash+=l.value/2;payouts=[l.value/2,l.value/2];text=ss.map(s=>s.name).join(' + ')+' split '+l.name+'.';}l.carriers=[];r.history.push({id:d.id,name:l.name,value:l.value,players:ss.map(s=>s.name),choices,payouts,text});log(r,text);r.deals=r.deals.filter(x=>x.id!==d.id);}
function escape(r:Room,s:Seat){if(s.loot||r.deals.some(d=>d.seats.includes(s.id)))throw Error('Drop or settle the exhibit first.');const roof=distance(s,ROOF)<=1;if(!roof&&distance(s,EXIT)>1)throw Error('Reach the green lift or the rooftop exit.');if(s.hot>0&&!roof)throw Error('Hot loot cannot leave by the lift. Reach the rooftop exit.');s.bank=s.cash+s.hot;s.cash=0;s.hot=0;s.status='escaped';log(r,s.name+' escaped with $'+s.bank.toLocaleString()+'. Departure confirmed.');}
function finish(r:Room){r.phase='finished';r.deadline=0;for(const s of r.seats)if(s.status==='inside'){drop(r,s);s.status='caught';s.cash=0;s.hot=0;}r.deals=[];log(r,'The shutters close. Only escaped loot counts.');}
export function tick(r:Room,now:number){if(r.version!==4)return;const h=r.seats.find(s=>s.id===r.hostId);if(!h||now-h.lastSeen>30000){const h2=r.seats.find(s=>!s.bot&&now-s.lastSeen<=30000);if(h2)r.hostId=h2.id;}if(r.phase!=='playing')return;if(now>=r.deadline){finish(r);return;}
 for(const d of [...r.deals]){for(const id of d.seats){const s=r.seats.find(s=>s.id===id)!;if(s.bot&&now>=d.deadline-12000&&!d.choices[id]){const crossed=r.history.some(h=>h.players.includes(s.name)&&h.choices.includes('steal'));d.choices[id]=s.trait===1&&crossed?'steal':'split';}}
 if(d.seats.every(id=>d.choices[id])||now>=d.deadline)resolveDeal(r,d,now);}
 if(now-r.lastTick>=700){r.lastTick=now;
 // Companions support the nearest human, never teleport to an exhibit.
 for(const s of r.seats.filter(s=>s.bot&&s.status==='inside'&&now>=s.stun)){
 if(r.deals.some(d=>d.seats.includes(s.id)))continue;
 const humans=r.seats.filter(h=>!h.bot&&h.status==='inside');
 if(!humans.length){drop(r,s);const dest=s.hot?ROOF:EXIT;if(distance(s,dest)<=1)escape(r,s);else {const n=nextStep(s,dest);if(n)move(r,s,n.x,n.y,now);}continue;}
 const l=r.loot.find(l=>l.id===s.loot);if(l){if(l.carriers.length===2){const human=r.seats.find(h=>l.carriers.includes(h.id)&&!h.bot);if(human&&now-human.lastSeen>15000)drop(r,s);}continue;}
 const waiting=r.loot.find(l=>l.state==='carried'&&l.carriers.length===1&&!r.seats.find(h=>h.id===l.carriers[0])?.bot);
 const target=waiting||humans.sort((a,b)=>distance(s,a)-distance(s,b))[0];
 if(waiting&&distance(s,waiting)<=1)interact(r,s,now);else if(distance(s,target)>1){const n=nextStep(s,target);if(n)move(r,s,n.x,n.y,now);}
 }
 const watch=sight(r,now);for(const s of r.seats.filter(s=>s.status==='inside'&&!s.bot&&now>=s.stun&&!r.deals.some(d=>d.seats.includes(s.id))))if(watch.some(c=>distance(c,s)===0)){drop(r,s);s.x=2;s.y=9;s.stun=now+3000;r.alarm=Math.min(100,r.alarm+12);log(r,s.name+' was spotted. Exhibit dropped; 3 seconds to recover.');}
 }
 // A disconnected carrier releases the object; recovery never needs their device.
 for(const s of r.seats)if(!s.bot&&s.loot&&now-s.lastSeen>15000){drop(r,s);log(r,s.name+' disconnected. The exhibit is on the floor.');}
 if(r.alarm>=100&&!r.lockdown){r.lockdown=true;r.deadline=Math.min(r.deadline,now+30000);log(r,'LOCKDOWN. Thirty seconds to get out.');}
 if(r.seats.every(s=>s.status!=='inside'))finish(r);
}
export function intent(r:Room,id:string,a:any,now:number){const s=r.seats.find(s=>s.id===id);if(!s)throw Error('Seat not found.');if(r.version!==4)throw Error('Last Lift is ready. Leave this old room and create a new crew.');heartbeat(r,id,now);tick(r,now);if(['start','bot','demo','removeBot','rematch'].includes(a.type)&&id!==r.hostId)throw Error('Only the host can do this.');
 if(a.type==='bot'||a.type==='demo'){addSeat(r,'Echo',crypto.randomUUID(),now,true);return;}
 if(a.type==='removeBot'){if(r.phase!=='lobby')throw Error('Only before the heist.');const b=r.seats.find(b=>b.id===a.seatId&&b.bot);if(!b)throw Error('Choose a bot.');r.seats=r.seats.filter(s=>s.id!==b.id);return;}
 if(a.type==='start'){if(r.phase!=='lobby'||r.seats.length<2)throw Error('Bring a partner or add Echo.');start(r,now);return;}
 if(a.type==='rematch'){if(r.phase!=='finished')throw Error('Finish this heist first.');r.replay++;r.round++;start(r,now);return;}
 if(r.phase!=='playing'||s.status!=='inside')throw Error('You are out of this heist.');if(a.round!==r.round)throw Error('This action belongs to an old heist.');if(now<s.stun&&['escape','decoy','porter'].includes(a.type))throw Error('Recovering. Wait for the stun to clear.');
 if(a.type==='move'){if(!Number.isInteger(a.dx)||!Number.isInteger(a.dy)||Math.abs(a.dx)+Math.abs(a.dy)!==1)throw Error('Choose one direction.');if(now-s.last<180)return;move(r,s,s.x+a.dx,s.y+a.dy,now);}
 else if(a.type==='interact')interact(r,s,now);
 else if(a.type==='drop')drop(r,s);
 else if(a.type==='choice'){const d=r.deals.find(d=>d.id===a.dealId&&d.seats.includes(id));if(!d||d.choices[id])throw Error('Deal already sealed.');if(!['split','steal'].includes(a.choice))throw Error('Choose Split or Steal.');d.choices[id]=a.choice;if(d.seats.every(id=>d.choices[id]))resolveDeal(r,d,now);}
 else if(a.type==='escape')escape(r,s);
 else if(a.type==='porter'){if(r.seats.filter(s=>s.status==='inside').length!==1||r.seats.some(s=>s.name==='Porter'))throw Error('A partner is still available, or Porter was already called.');const tmp=createRoom(r.code,now);const porter=addSeat(tmp,'Porter',crypto.randomUUID(),now,true);porter.trait=0;r.seats.push(porter);log(r,'Porter arrived. They always split and will take half of a shared haul.');}

 else if(a.type==='decoy'){if(s.decoys<=0)throw Error('No decoys left.');s.decoys--;r.decoy={x:s.x,y:s.y,until:now+7000};log(r,s.name+' triggered a decoy. Guards distracted for 7 seconds.');}
 else if(a.type==='message'){const options=['Partner needed!','Meet at the lift.','I will split.','Heading to the roof.'];if(!options.includes(a.text))throw Error('Choose a radio message.');if(now-s.last<600)return;log(r,s.name+': '+a.text);s.last=now;}
 else throw Error('Unknown action.');tick(r,now);
}
export function project(r:Room,id:string,now:number){const you=r.seats.find(s=>s.id===id);if(!you)throw Error('Invalid token.');if(r.version!==4)throw Error('Last Lift replaced this demo. Leave and create a new crew.');const d=r.deals.find(d=>d.seats.includes(id));return {code:r.code,revision:r.revision,phase:r.phase,round:r.round,deadline:r.deadline,serverNow:now,you:id,host:r.hostId,replay:r.replay,seats:r.seats.map(({token,last,lastSeen,...s})=>s),loot:r.loot,alarm:r.alarm,lockdown:r.lockdown,guards:guards(r,now),sight:sight(r,now),messages:r.messages,history:r.history,deal:d?{id:d.id,name:r.loot.find(l=>l.id===d.lootId)!.name,value:r.loot.find(l=>l.id===d.lootId)!.value,partner:r.seats.find(s=>d.seats.includes(s.id)&&s.id!==id)?.name,deadline:d.deadline,yourChoice:d.choices[id]||null,ready:Object.keys(d.choices).length}:null,decoy:r.decoy};}
