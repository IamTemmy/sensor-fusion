import test from 'node:test';import assert from 'node:assert/strict';
import * as E from '../lib/noise/engine.ts';
import {museumArena} from '../lib/noise/arenas.ts';
import {packet,unpack} from '../lib/noise/network.ts';
import {rayEnd,visibleFrom,visibilityPolygon} from '../lib/noise/visibility.ts';
import {OnlinePrediction} from '../lib/noise/online-client.ts';
function job(n=2,mode:E.CrewMode='coop',difficulty:E.Difficulty='normal'){
 const g=E.create('FLAG',1000,1001);E.add(g,'Human','h');for(let i=1;i<n;i++)E.add(g,'Echo '+i,'b',true);E.configure(g,mode);g.difficulty=difficulty;E.setup(g);E.command(g,g.host,{type:'ready'});return g;
}
function quiet(g:E.Game){g.guards=[];g.sensors=[];g.jobEvent=undefined;g.seats.forEach(s=>s.bot=false);}
test('flagship selects 2–4 thieves; six thieves and 3v3 retain authored legacy museums',()=>{
 for(const n of [2,3,4])assert.equal(job(n).arena?.id,'flagship-velmont');
 for(const mode of ['coop','trios'] as const){const g=job(6,mode);assert.deepEqual(g.arena,museumArena(g.layout,6));assert.equal(E.isFlagship(g),false);}
});
test('bay pocket art is equidistant; rematches alternate docks without changing teams or values',()=>{
 const g=job(4,'duos');const before=g.seats.map(s=>s.team),homes=[E.vanFor(g,0),E.vanFor(g,1)],bay=g.loot[0];
 assert.equal(E.distance(bay,homes[0]),E.distance(bay,homes[1]));assert.equal(bay.value,200);
 g.phase='finished';E.command(g,g.host,{type:'replay'});assert.deepEqual(E.vanFor(g,0),homes[1]);assert.deepEqual(E.vanFor(g,1),homes[0]);assert.deepEqual(g.seats.map(s=>s.team),before);assert.equal(g.loot.reduce((n,l)=>n+l.value,0),4300);
});
test('all mode/difficulty setups have radius-13 targets and a vault sentry active at match start',()=>{
 for(const n of [2,4])for(const mode of ['coop','duos'] as const)for(const level of ['rookie','normal','pro'] as const){const g=job(n,mode,level);
  for(const p of [...g.loot,g.plate,...E.hidingSpots(g),...g.seats])assert.ok(E.clear(p,13,g.walls),JSON.stringify(p));
  const h=g.guards.find(h=>h.sentryArt==='art3')!;assert.ok(h&&E.guardActive(g,h));assert.ok(E.distance(h,h.sentry!)<1);assert.equal(h.entryAt,undefined);
  assert.ok(g.arena!.routes.some(r=>r.some(p=>p.x>24&&p.x<278&&p.y>120&&p.y<250)),'Archive patrol');
 }
});
test('time lock overrides held plate until 1:00; countdown and opening chime fire once',()=>{
 const g=job();quiet(g);const [h,b]=g.seats,c=g.loot[2];Object.assign(h,{x:c.x,y:c.y});Object.assign(b,g.plate);
 g.now=g.start+19960;E.advance(g,g.now+40);assert.equal(g.events.filter(e=>e.text.startsWith('VAULT ·')).length,1);
 g.now=g.start+29960;assert.equal(E.plateOpen(g),false);E.action(g,h,'grab');assert.equal(h.hand,null);
 E.advance(g,g.now+40);assert.equal(E.plateOpen(g),true);E.advance(g,g.now+280);E.action(g,h,'grab');assert.equal(h.hand,c.id);
 E.advance(g,g.now+400);assert.equal(g.events.filter(e=>e.text.startsWith('VAULT OPEN')).length,1);assert.ok(g.events.some(e=>e.text.startsWith('VAULT OPEN')&&e.kind==='capture'));
});
test('duel activation only latches after opening, allowing both solo rivals to leave the plate',()=>{
 const g=job(2,'duos');quiet(g);Object.assign(g.seats[0],g.plate);E.advance(g,g.now+40);assert.equal(g.loot[2].locked,true);
 g.now=g.start+30000;E.advance(g,g.now+40);assert.equal(g.loot[2].locked,false);Object.assign(g.seats[0],E.vanFor(g,0));assert.equal(g.loot[2].locked,false);
});
test('Crown slowdown is shared by host and guest; its attached alarm cannot be bottled',()=>{
 const g=job();quiet(g);g.now=g.start+31000;g.walls=[];const [h,b]=g.seats,c=g.loot[2];Object.assign(h,{x:600,y:300});Object.assign(c,{x:600,y:300});Object.assign(b,g.plate);E.action(g,h,'grab');
 assert.equal(h.hand,c.id);Object.assign(b,{x:650,y:300});assert.notEqual(E.interaction(g,b).kind,'noise');E.action(g,b,'grab');assert.equal(b.hand,null);
 assert.equal(E.carrySpeed(1200,g),E.carrySpeed(1200)*.8);const pred=new OnlinePrediction();pred.accept(E.view(g,h.id));const x=h.x;pred.frame(40,{x:1,y:0},{x:700,y:300});E.command(g,h.id,{type:'input',seq:1,dx:1,dy:0});E.advance(g,g.now+40);assert.ok(Math.abs(h.x-x-E.carrySpeed(1200,g)*.04)<.001);assert.ok(Math.abs(pred.positions().get(h.id)!.x-h.x)<.001);
});
test('emitter siren remains at emitter for 4s and serializes in delta packets',()=>{
 const g=job(),s=g.sensors![0];const before=packet(g,g.host),v=unpack(before);assert.equal(E.tripEmitter(g,s),true);assert.equal(E.tripEmitter(g,s),false);
 const n=g.noises.find(n=>n.source==='emitter:'+s.id)!;assert.deepEqual({x:n.x,y:n.y},E.emitterPosition(s));assert.equal(n.expires-g.now,4000);assert.equal(n.attached,null);assert.equal(g.alert,3);
 const next=unpack(packet(g,g.host,before.arenaKey),v);assert.equal(next.sensors![0].screamingUntil,g.now+4000);
});
test('a thrown jar crossing a beam triggers its emitter rather than attaching noise to a thief',()=>{
 const g=job();quiet(g);g.walls=[];g.sensors=[{id:'test',x:400,y:250,w:6,h:100,cooldown:0}];
 g.noises=[{id:'flying',x:390,y:300,holder:null,source:null,kind:'capsule',vx:430,vy:0,flight:.3,born:g.now,expires:g.now+6500}];E.advance(g,g.now+40);assert.ok(g.noises.some(n=>n.source==='emitter:test'&&!n.attached));
});
test('Pass it requests only actual art, never a held jar; blocked and occupied receivers reject',()=>{
 const g=job();quiet(g);g.walls=[];g.hideSpots=[];const [human,bot]=g.seats;bot.bot=true;Object.assign(human,{x:410,y:335});Object.assign(bot,{x:590,y:335});const l=g.loot[0];l.holder=bot.id;bot.hand=l.id;Object.assign(l,{x:bot.x,y:bot.y});
 E.action(g,human,'pass-request');assert.ok(l.flight);assert.equal(bot.hand,null);assert.equal(l.flight!.to.x,human.x);
 l.flight=undefined;l.holder=null;bot.hand='jar';E.action(g,human,'pass-request');assert.equal(bot.hand,'jar');
 bot.hand=l.id;l.holder=bot.id;g.walls=[{x:480,y:250,w:20,h:170}];E.action(g,human,'pass-request');assert.equal(bot.hand,l.id);
 g.walls=[];human.hand='occupied';E.action(g,human,'pass-request');assert.equal(bot.hand,l.id);
});
test('visibility is blocked by walls beyond near-radius; doorways transmit sight and ray polygons',()=>{
 const walls=[{x:200,y:24,w:12,h:220},{x:200,y:324,w:12,h:252}],p={x:120,y:280};
 assert.ok(visibleFrom(p,{x:320,y:280},walls));assert.equal(visibleFrom({x:120,y:150},{x:320,y:150},walls),false);
 assert.ok(visibleFrom({x:180,y:150},{x:220,y:150},walls));assert.equal(rayEnd({x:120,y:150},0,walls).x,200);assert.ok(visibilityPolygon(p,walls).length>64);
});
test('posted guards leave radius-13 circulation available in every flagship setup',()=>{for(const n of [2,4])for(const mode of ['coop','duos'] as const)for(const d of ['rookie','normal','pro'] as const)assert.ok(E.sentryRoutesClear(job(n,mode,d)),`${n}/${mode}/${d}`);});
test('chased bot automatically passes actual art to a visible human within 220u',()=>{const g=job();quiet(g);g.walls=[];g.hideSpots=[];g.now=g.start+40000;const [human,b]=g.seats;b.bot=true;Object.assign(human,{x:400,y:300});Object.assign(b,{x:580,y:300});const l=g.loot[0];Object.assign(l,{holder:b.id,x:b.x,y:b.y});b.hand=l.id;g.guards=[{id:'chaser',x:700,y:300,angle:Math.PI,mode:'chase',target:b,route:[{x:700,y:300}],way:0,attention:8000,victim:b.id,entered:true}];E.advance(g,g.now+40);assert.ok(l.flight);assert.equal(l.flight!.to.x,human.x);assert.equal(b.hand,null);});
test('autonomous crews do not commit to a locked plate before the vault opens',()=>{const g=job(4,'duos');g.guards=[];g.sensors=[];g.jobEvent=undefined;for(const l of g.loot)if(l.value!==1200)l.banked=true;for(let i=0;i<200;i++)E.advance(g,g.now+40);assert.ok(g.seats.filter(s=>s.bot&&s.team===1).every(s=>s.task!=='hold-plate'));});
test('no unobstructed floor rectangle exceeds both 260u width and 200u height',()=>{const g=job(),xs=[...new Set([24,936,...g.walls.flatMap(w=>[w.x,w.x+w.w])])].filter(x=>x>=24&&x<=936).sort((a,b)=>a-b);for(const a of xs)for(const b of xs){if(b-a<=260)continue;const blocked=g.walls.filter(w=>w.x<b&&w.x+w.w>a).map(w=>[Math.max(24,w.y),Math.min(576,w.y+w.h)]).filter(([a,b])=>b>a).sort((a,b)=>a[0]-b[0]);let end=24;for(const [lo,hi] of blocked){assert.ok(lo-end<=200,`${a}..${b} / ${end}..${lo}`);end=Math.max(end,hi);}assert.ok(576-end<=200,`${a}..${b} / ${end}..576`);}});
test('navigation escapes the thin floor strip below the Fossil recess',()=>{const g=job(),p={x:44,y:404},home=E.vanFor(g,0);assert.ok(E.clear(p,13,g.walls));for(let i=0;i<300&&E.distance(p,home)>20;i++){const q=E.steer(p,home,g.walls);E.move(p,q.x-p.x,q.y-p.y,.04,150,g.walls);}assert.ok(E.distance(p,home)<20);});
