import {museumArena} from '../../lib/noise/arenas';
import {preparePractice} from '../../lib/noise/practice';
// Development-only, frozen presentation fixtures. These are NOT playtest results.
import {vanFor,hidingSpots,create,add,setup,configure,clear,event,staffDoors,type Game} from '../../lib/noise/engine';
export function reviewFixture(state:string):Game{
 if(state.startsWith('archive-')){const g=create('VISUAL',0,1001);add(g,'Rookie','local');add(g,'Echo','echo',true);g.match=1;setup(g);g.phase='playing';g.start=0;g.now=0;g.end=90000;g.events=[];g.jobEvent=undefined;if(state==='archive-centerpiece'){Object.assign(g.seats[0],{x:180,y:330});g.now=15000;}return g;}

 if(state.startsWith('flagship-')||state.startsWith('getaway-flagship-')){
  const g=create('VISUAL',0,1001);add(g,'Rookie','local');add(g,'Echo','echo',true);add(g,'Violet','v',true);add(g,'Pip','p',true);configure(g,'duos');g.seats.forEach((s,i)=>s.team=i<2?0:1);setup(g);g.phase='playing';g.start=0;g.now=32000;g.end=90000;g.alert=state.includes('start')?0:18;g.events=[];g.jobEvent=undefined;if(!state.includes('start'))g.loot.forEach(l=>l.sealed=false);
  if(!state.includes('start'))g.guards.forEach((h,i)=>Object.assign(h,h.sentry||h.route[i%h.route.length],{entered:true,entryAt:undefined}));
  const p=state.includes('vault')?{x:810,y:85}:state.includes('archive')?{x:120,y:180}:state.includes('mirrors')?{x:890,y:350}:{x:420,y:335};if(!state.includes('start')){Object.assign(g.seats[0],p);Object.assign(g.seats[1],{x:590,y:335});}
  if(state.includes('start'))g.now=0;
  if(state==='flagship-crew'){const p=hidingSpots(g)[0];Object.assign(g.seats[1],p,{hideId:0,hiddenAt:g.now,sneak:true});Object.assign(g.seats[0],vanFor(g,0),{escaped:true});}
  if(state==='flagship-empty'){g.now=10000;Object.assign(g.seats[0],vanFor(g,0),{emptyBoardUntil:g.now+4000});}
  if(state==='flagship-lobby'){g.match=0;g.phase='lobby';g.layout=-1;g.arena=undefined;}
  if(state.includes('last-call')){g.now=75000;g.end=90000;}
  if(state.includes('pass')){const l=g.loot[3];Object.assign(l,{holder:g.seats[1].id,x:590,y:335});g.seats[1].hand=l.id;event(g,'ECHO: Bring free hands. Q asks me to pass.');}
  else event(g,state==='flagship-plan'?'ARCHITECTURE REVIEW · Fog disabled in this development fixture.':'The Velmont · Vault opens at 1:00.');
  if(state.startsWith('getaway-flagship-')){g.phase='finished';g.success=true;g.total=2100;g.finishedAt=79000;g.finishReason='The van has left.';g.seats.forEach((s,i)=>Object.assign(s,vanFor(g,s.team),{escaped:i!==3,escapedAt:78000,bank:i===0?1200:i===1?900:500}));g.seats[3].x+=48;}
  return g;
 }
 if(state.startsWith('practice-')){const g=create('VISUAL',0,1);g.training=true;add(g,'Rookie','local');add(g,'Echo','echo',true);setup(g);g.phase='playing';g.now=20000;preparePractice(g,Math.max(0,Math.min(6,Number(state.split('-')[1])-1)));if(state==='practice-2'){preparePractice(g,0);g.practiceStage=11;(g as any).lesson.step=1;g.seats[0].hand=g.loot[0].id;g.loot[0].holder=g.seats[0].id;g.seats[1].bot=true;}return g;}
 let g=create('VISUAL',0,1);for(let seed=1;seed<50;seed++){g=create('VISUAL',0,seed);add(g,'Rookie','local');add(g,'Echo','echo',true);if(state!=='coop'){add(g,'Violet','violet',true);add(g,'Pip','pip',true);configure(g,'duos');}setup(g,museumArena);if(g.layout===(state.includes('archive')?1:state.includes('crossroads')?2:0))break;}
 g.phase='playing';g.start=0;g.now=32000;g.end=90000;g.alert=44;g.events=[];
 const spots=[{x:450,y:300},{x:410,y:325},{x:520,y:330},{x:560,y:270}];
 g.seats.forEach((s,i)=>{const target=spots[i];const options=[target,{x:target.x,y:target.y+40},{x:target.x,y:target.y-40}];const p=options.find(p=>clear(p,12,g.walls))||s;Object.assign(s,{x:p.x,y:p.y,team:i<2?0:1,aim:{x:580,y:300},bank:i===0?600:0});});g.total=600;
 g.guards.slice(0,2).forEach((h,i)=>Object.assign(h,{x:480+i*90,y:220,angle:Math.PI/2,mode:'investigate'}));
 const s=g.seats[0],loot=g.loot.find(l=>l.value!==1200)!;loot.holder=s.id;s.hand=loot.id;loot.x=s.x;loot.y=s.y;
 g.noises=[{id:'visual-scream',x:s.x,y:s.y,attached:s.id,holder:null,expires:60000,born:31000,vx:0,vy:0,flight:0,kind:'alarm',source:loot.id}];
 event(g,'ECHO: Covering your alarm.');event(g,state==='coop'?'The collection is still waiting.':'Violet is closing in on the collection.');
 if(['centre','coop','locked','open'].includes(state)){s.hand=null;loot.holder=null;loot.x=loot.home?.x||270;loot.y=loot.home?.y||260;g.noises=[];}
 if(state==='locked'||state==='open'){const j=g.loot.find(l=>l.locked)!;s.x=j.x;s.y=j.y+25;s.aim={x:j.x,y:j.y};if(state==='open'){g.seats[1].x=g.plate.x;g.seats[1].y=g.plate.y;}else{g.seats[1].x=s.x-65;g.seats[1].y=s.y;}}
 if(state.includes('placard')||state.includes('centerpiece')){const d=g.arena!.decor[0];s.hand=null;loot.holder=null;g.noises=[];Object.assign(s,{x:d.x+d.w/2,y:d.y+d.h+35});}
 if(state==='hide'){const p=hidingSpots(g)[0];s.hand=null;loot.holder=null;g.noises=[];Object.assign(s,{x:p.x+30,y:p.y});g.guards[0].victim=s.id;g.guards[0].entered=true;}
 if(state==='event'){g.jobEvent={kind:'shift',at:g.now-500,until:g.now+2000,flashUntil:g.now+2500,started:true,ended:false,warned:true};event(g,'SHIFT CHANGE · Guards switched routes.','honk');}
 if(state==='stash'){const p=hidingSpots(g)[0];Object.assign(s,{x:p.x+35,y:p.y,hand:null});Object.assign(loot,{x:p.x,y:p.y,holder:null,stashedAt:0,claimed:true});g.noises=[];event(g,'Rookie stashed art. Anyone can take it.');}
 if(state==='pass-hot'||state==='pass-quiet'){Object.assign(s,{x:410,y:420,aim:{x:550,y:420}});Object.assign(g.seats[1],{x:550,y:420,hand:null});Object.assign(loot,{x:s.x,y:s.y});if(state==='pass-quiet'){loot.quietUntil=g.now+8000;g.noises=[];}}
 if(state==='pass'){s.hand=null;loot.holder=null;g.noises=[];loot.flight={from:{x:410,y:420},to:{x:550,y:420},at:g.now-250,team:0,thrower:s.id};loot.x=480;loot.y=420;Object.assign(s,{x:410,y:420});Object.assign(g.seats[1],{x:550,y:420,hand:null});event(g,'ECHO: PASS!');}
 if(state.startsWith('dock')){if(state.includes('violet')){s.team=1;g.seats[2].team=0;}const dock=vanFor(g,s.team);Object.assign(s,{x:dock.x,y:dock.y,hand:null});loot.holder=null;loot.banked=true;g.noises=[];event(g,'$600 secured. Rookie delivered Last Sunset.','bank',dock);g.events.at(-1)!.at-=state==='dock'?80:1200;}
 if(state==='van'){s.escaped=true;}
 if(state==='lobby'||state==='guest-lobby'){g.phase='lobby';if(state==='guest-lobby')g.host=g.seats[1].id;}
 if(state==='last-call'){g.boardingAt=g.now-12000;g.end=g.now+3000;}
 if(state==='blackout')g.jobEvent={kind:'blackout',at:g.now-1000,until:g.now+7000,warned:true,started:true,ended:false,flashUntil:g.now+2000};
 if(state==='status'){g.alert=0;}
 if(state==='post-sign'){const d=staffDoors(g)[0];Object.assign(g.guards[0],{x:d.x,y:d.y+30,sentry:{x:d.x,y:d.y+30},entered:true,mode:'patrol',target:{x:d.x,y:d.y+30}});}
 if(state==='briefing')g.phase='ready';
 if(state==='capture'){s.stun=g.now+5900;s.hand=null;loot.holder=null;g.noises=[];event(g,'MINT · Rookie caught! Their crew can untie them.','catch',s);g.events.at(-1)!.at-=80;}
 if((state.startsWith('getaway')||['recap','recap-jackpot','recap-coop','recap-mixed'].includes(state))){g.phase='finished';g.success=true;g.total=3300;g.finishedAt=79000;g.finishReason='The collection is gone. So are you.';g.loot.forEach(l=>{l.banked=true;l.bankedBy=0;});g.seats.forEach((s,i)=>{s.escaped=true;s.escapedAt=78000;s.bank=i===0?1800:i===1?1500:0;s.captures=i===0?4:2;});}
 if(state.startsWith('getaway')){g.seats.forEach(p=>Object.assign(p,vanFor(g,p.team)));g.seats[3].escaped=false;g.seats[3].x-=48;}
 if(state==='recap-loss'){g.seats=g.seats.filter(s=>s.team===0);g.phase='finished';g.crewMode='coop';g.success=false;g.total=600;g.seats.forEach(s=>{s.bank=s.id===g.seats[0].id?600:0;s.escaped=false;});g.finishedAt=g.start+90000;g.finishReason='The van has left.';}
 if(state==="recap-jackpot"){g.total=2675;g.seats[0].bank=1275;g.seats[1].bank=1400;g.seats[2].bank=0;g.seats[3].bank=0;g.crewMode="coop";g.loot.find(l=>l.value!==1200)!.banked=false;}
 if(state==='recap-coop'||state==='recap-jackpot'){g.crewMode='coop';g.seats=g.seats.filter(s=>s.team===0);}
 if(state==='recap-mixed'){g.seats[3].escaped=false;g.seats[3].penalty=150;}
 if(state.startsWith('museum-')){
  // Architecture review: real arena data, frozen actors clear of the centrepiece.
  g.total=0;g.alert=0;g.noises=[];g.events=[];
  for(const l of g.loot){l.holder=null;Object.assign(l,l.home);}
  g.seats.forEach((p,i)=>{const home=vanFor(g,p.team);Object.assign(p,{x:home.x,y:home.y+(i%2?14:-14),hand:null,bank:0});});
  g.guards.forEach((h,i)=>Object.assign(h,h.sentry||h.route[i%h.route.length],{entered:true,mode:'patrol'}));
  if(state.includes('centerpiece')){const d=g.arena!.decor[0];Object.assign(s,{x:d.x+d.w/2,y:d.y+d.h+45});}
  event(g,g.arena!.brief);
 }
 return g;
}
