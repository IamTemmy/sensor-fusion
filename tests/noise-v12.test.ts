import test from 'node:test';
import assert from 'node:assert/strict';
import {create,add,configure,setup,RIVAL_LAYOUTS,mirrorPoint,vanFor,distance,clear,sight} from '../lib/noise/engine.ts';
const game=(seed:number)=>{const g=create('MAP',0,seed);for(let i=0;i<4;i++)add(g,'P'+i,''+i);configure(g,'duos');setup(g);return g;};
test('30 seeded rivals maps: mirrored equal exhibits, useful wings, distinct patrols, unobstructed targets',()=>{
 const placements=new Set<string>(),layouts=new Set<number>();
 for(let seed=1;seed<=30;seed++){
 const g=game(seed);layouts.add(g.layout);placements.add(JSON.stringify(g.loot.map(l=>[l.x,l.y])));
 const [left,right]=g.loot;assert.deepEqual(mirrorPoint(left),{x:right.x,y:right.y});assert.equal(left.value,right.value);
 assert.ok(left.x<300&&right.x>660);assert.ok(distance(vanFor(g,0),left)<distance(vanFor(g,0),right));
 assert.ok(distance(vanFor(g,1),right)<distance(vanFor(g,1),left));
 const routes=g.guards.map(h=>JSON.stringify([...h.route].sort((a,b)=>a.x-b.x||a.y-b.y)));assert.equal(new Set(routes).size,routes.length);
 for(const p of [...g.loot,g.plate,...g.guards.flatMap(h=>h.route)])assert.ok(clear(p,12,g.walls),JSON.stringify(p));
 for(const sensor of g.sensors!)for(const t of [0,.25,.5,.75,1])assert.ok(clear({x:sensor.x+sensor.w/2,y:sensor.y+sensor.h*t},0,g.walls));
 for(const h of g.guards)for(let i=0;i<h.route.length;i++)assert.ok(sight(h.route[i],h.route[(i+1)%h.route.length],g.walls),'patrol segment blocked');
 }
 assert.equal(layouts.size,3);assert.ok(placements.size>=10);
});
test('three genuinely different symmetric geometries and safe separated vans',()=>{
 assert.equal(new Set(RIVAL_LAYOUTS.map(m=>JSON.stringify(m.walls))).size,3);
 for(const m of RIVAL_LAYOUTS)for(const w of m.walls)assert.ok(m.walls.some(r=>r.x===960-w.x-w.w&&r.y===w.y&&r.w===w.w&&r.h===w.h));
 const g=game(4);assert.ok(vanFor(g,0).x<150);assert.ok(vanFor(g,1).x>810);assert.ok(vanFor(g,2).y<100);
});
test('co-op valuable core is on the patrolled far wing, not reserved near-home sites',()=>{
 for(let seed=1;seed<=30;seed++){
 const g=create('COOP',0,seed);add(g,'Human','h');add(g,'Echo','b',true);setup(g);
 for(const l of g.loot.filter(l=>l.value===800||l.value===1000))assert.ok(l.x>=710);
 }
});
