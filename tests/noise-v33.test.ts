import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../lib/noise/engine.ts';
import {routePair} from '../scripts/arena-routes.ts';
function job(seed=1,mode:E.CrewMode='duos'){const g=E.create('V33',0,seed);E.add(g,'Human','tok');E.configure(g,mode);E.fillCrews(g);E.setup(g);E.command(g,g.seats[0].id,{type:'ready'});return g;}
test('authored rooms: two body-clear route alternatives per exhibit and plate, each crew, both modes',()=>{
 for(const mode of ['coop','duos'] as const)for(let seed=1;seed<=12;seed++){
 const g=job(seed,mode);assert.ok(E.arenaDefinition(g).rooms.length>=8);
 for(const team of mode==='coop'?[0]:[0,1])for(const p of [...g.loot,g.plate])assert.equal(routePair(g,E.vanFor(g,team),p).length,2,`${mode}/${seed}/${team}/${JSON.stringify(p)}`);
 }
});
test('four wall recesses stay clear of staff doors, bays and sentry posts; lasers terminate on walls',()=>{
 const inside=(p:E.Vec,w:E.Rect)=>p.x>=w.x&&p.x<=w.x+w.w&&p.y>=w.y&&p.y<=w.y+w.h;
 for(const mode of ['coop','duos'] as const)for(let seed=1;seed<=12;seed++){
 const g=job(seed,mode);for(const p of E.hidingSpots(g)){
 assert.ok(E.staffDoors(g).every(d=>E.distance(p,d)>=100));assert.ok(g.guards.every(h=>!h.sentry||E.distance(p,h.sentry)>=120));assert.ok(!E.anySafe(g,p));assert.ok(E.clear(p,22,g.walls));
 assert.ok(g.walls.some(w=>Math.hypot(Math.max(w.x-p.x,0,p.x-w.x-w.w),Math.max(w.y-p.y,0,p.y-w.y-w.h))<=32));
 }
 for(const q of g.sensors!){const ends=q.w>q.h?[{x:q.x,y:q.y+q.h/2},{x:q.x+q.w,y:q.y+q.h/2}]:[{x:q.x+q.w/2,y:q.y},{x:q.x+q.w/2,y:q.y+q.h}];for(const p of ends)assert.ok(g.walls.some(w=>inside(p,w)),`floating laser ${mode}/${g.layout}: ${JSON.stringify(q)}`);}
 for(const team of mode==='coop'?[0]:[0,1])assert.equal(E.vanFacing(g,team),E.vanFor(g,team).y<300?'north':'south');
 }
});
test('rivals stars reward winning, crew escape, and winning with the jackpot',()=>{
 const g=job();const crew=g.seats.filter(s=>s.team===0),rival=g.seats.find(s=>s.team===1)!;crew[0].bank=800;rival.bank=500;assert.equal(E.stars(g,0),1);assert.equal(E.stars(g,1),0);crew.forEach(s=>s.escaped=true);assert.equal(E.stars(g,0),2);const jack=g.loot.find(l=>l.value===1200)!;jack.banked=true;jack.bankedBy=0;assert.equal(E.stars(g,0),3);rival.bank=2000;assert.equal(E.stars(g,0),0);
});
test('Auto Echo banks carried art and boards after human; explicit van order works too',()=>{
 for(const explicit of [false,true]){const g=job(1,'coop');g.guards=[];g.sensors=[];g.jobEvent=undefined;const [h,e]=g.seats;const home=E.vanFor(g,0);Object.assign(h,home);Object.assign(e,{x:home.x+90,y:home.y});const art=g.loot[0];art.holder=e.id;e.hand=art.id;art.claimed=true;
 if(explicit)E.action(g,h,'help:van');else E.action(g,h,'extract');
 for(let i=0;i<500&&!e.escaped;i++)E.advance(g,g.now+40);
 assert.equal(e.escaped,true);assert.equal(art.banked,true);assert.equal(e.bank,art.value);assert.ok(g.events.some(x=>x.text.includes('Right behind you')));
 }
});
