import test from 'node:test';
import assert from 'node:assert/strict';
import {create,add,configure,setup,command,advance,updateJobEvent,routeLength,patrolPool,clear,distance,vanFor,mirrorPoint,rotatePoint,LOOT_TOTAL,carrySpeed,finish,blackoutActive,type Game} from './helpers/legacy-engine.ts';
const job=(seed=1,mode:'coop'|'duos'='duos')=>{const g=create('TEST',1000,seed);for(let i=0;i<(mode==='coop'?2:4);i++)add(g,'P'+i,'t'+i);configure(g,mode);setup(g);return g;};
function live(g:Game){for(const s of g.seats)command(g,s.id,{type:'ready'});}
test('fixed 4300 budget, eight pieces, all value tiers, equal-budget rivals and 250-unit danger rule across seeds',()=>{
 const counts=new Set();for(const mode of ['coop','duos'] as const)for(let seed=1;seed<=30;seed++){
 const g=job(seed,mode);counts.add(g.loot.length);assert.equal(g.loot.reduce((a,l)=>a+l.value,0),LOOT_TOTAL);assert.ok(g.loot.some(l=>l.value<=300));assert.ok(g.loot.some(l=>l.value>=500&&l.value<=800));assert.ok(g.loot.some(l=>!l.locked&&l.value>=600));
 for(const l of g.loot.filter(l=>l.value>300))for(const team of [...new Set(g.seats.map(s=>s.team))])assert.ok(routeLength(g,vanFor(g,team),l)>=250);
 if(mode==='duos'){const [a,b]=g.loot;assert.ok(clear(a,12,g.walls)&&clear(b,12,g.walls));assert.equal(a.value,b.value);assert.equal(a.sealed,b.sealed);}
 }assert.deepEqual([...counts].sort(),[8]);
});
test('eight-piece budget still reserves the jackpot for teamwork; carry speed decreases by value',()=>{
 for(let seed=1;seed<=30;seed++){const g=job(seed);const accessible=g.loot.filter(l=>!l.locked).reduce((a,l)=>a+l.value,0);assert.equal(LOOT_TOTAL-accessible,1200);assert.ok(distance(g.plate,g.loot.find(l=>l.locked)!)>90);}
 assert.equal(carrySpeed(200),110);assert.equal(carrySpeed(1500),80);assert.ok(carrySpeed(1000)<carrySpeed(500));
});
test('each event warns 3s before, triggers once, preserves budget and ends; shift never teleports guards',()=>{
 for(const kind of ['blackout','shift','curator','vault'] as const){const g=job();live(g);g.jobEvent={kind,at:g.now+5000,until:g.now+5000+(kind==='blackout'?8000:kind==='vault'?15000:1000),started:false,ended:false,warned:false};if(kind==='vault'){g.loot[4].sealed=true;g.loot[4].eventPiece=true;}
 g.now=g.jobEvent.at-3001;updateJobEvent(g);assert.equal(g.jobEvent.warned,false);g.now++;updateJobEvent(g);assert.equal(g.jobEvent.warned,true);
 const routes=g.guards.map(h=>JSON.stringify(h.route));const before=g.guards.map(h=>({x:h.x,y:h.y}));g.now=g.jobEvent.at;updateJobEvent(g);assert.equal(g.jobEvent.started,true);if(kind==='shift'){assert.deepEqual(g.guards.map(h=>({x:h.x,y:h.y})),before);g.guards.forEach((h,i)=>h.sentry?assert.equal(JSON.stringify(h.route),routes[i]):assert.notEqual(JSON.stringify(h.route),routes[i]));}if(kind==='blackout')assert.equal(blackoutActive(g),true);if(kind==='vault')assert.equal(g.loot[4].sealed,false);
 const n=g.events.length;updateJobEvent(g);assert.equal(g.events.length,n);assert.equal(g.loot.reduce((a,l)=>a+l.value,0),LOOT_TOTAL);g.now=g.jobEvent.until;updateJobEvent(g);assert.equal(g.jobEvent.ended,true);assert.equal(blackoutActive(g),false);if(kind==='vault')assert.equal(g.loot[4].sealed,false);
 if(kind==='curator'){const [a,b]=g.loot;assert.ok(clear(a,12,g.walls)&&clear(b,12,g.walls));}finish(g,'done');command(g,g.host,{type:'replay'});assert.equal(g.jobEvent?.started,false);
 }
});
// Historical mirror-specific case replaced by museum-arenas.test.ts.

test('Follow stays within passing range and warns about an approaching guard',()=>{
 const g=job(1,'coop'),s=g.seats[0],echo=g.seats[1];echo.bot=true;echo.mode='follow';live(g);g.jobEvent=undefined;g.walls=[];s.x=440;s.y=285;echo.x=520;echo.y=285;g.guards=[];for(let i=0;i<40;i++)advance(g,g.now+40);assert.ok(distance(s,echo)<=60);const template=job().guards[0];g.guards=[{...template,id:'near',x:450,y:245,angle:0,retreatUntil:g.now+10000}];advance(g,g.now+40);assert.ok(g.events.some(e=>e.text.includes('Guard closing')));
});
test('new central loot respects the existing <40-unit rival route fairness gate',()=>{
 for(let seed=1;seed<=15;seed++){const g=job(seed);for(const l of g.loot.filter(l=>l.locked||l.id==='art4')){const a=routeLength(g,vanFor(g,0),l),b=routeLength(g,vanFor(g,1),l);assert.ok(Math.abs(a-b)<40,JSON.stringify({seed,layout:g.layout,id:l.id,a,b}));}}
});
