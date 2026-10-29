import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../lib/noise/engine.ts';
function job(seed=1,mode:E.CrewMode='duos',difficulty:E.Difficulty='normal'){const g=E.create('V31',0,seed);E.add(g,'Human','tok');E.configure(g,mode);E.fillCrews(g);g.difficulty=difficulty;E.setup(g);E.command(g,g.seats[0].id,{type:'ready'});return g;}
function tick(g:E.Game,ms:number){for(let i=0;i<ms;i+=40)E.advance(g,g.now+40);}
test('v32 hiding is useful, door-safe and accessible across every layout and difficulty',()=>{
 for(const mode of ['coop','duos'] as const)for(const d of ['rookie','normal','pro'] as const)for(let seed=1;seed<=40;seed++){
 const g=job(seed,mode,d);assert.ok(E.sentryRoutesClear(g),`${mode}/${d}/${seed}`);
 const posts=g.guards.filter(h=>h.sentry);assert.equal(new Set(posts.map(h=>`${h.sentry!.x},${h.sentry!.y}`)).size,posts.length);

 const routes=E.hidingRoutePoints(g);const spots=E.hidingSpots(g);assert.equal(spots.length,4);for(const p of spots){assert.ok(E.staffDoors(g).every(d=>E.distance(p,d)>=80));assert.ok(g.loot.some(l=>E.distance(p,l.home||l)<=150)||routes.some(q=>E.distance(p,q)<=150));assert.ok(!E.anySafe(g,p));assert.ok(posts.every(h=>E.distance(p,h.sentry!)>=120));assert.ok(g.walls.some(w=>Math.hypot(Math.max(w.x-p.x,0,p.x-w.x-w.w),Math.max(w.y-p.y,0,p.y-w.y-w.h))<=32));}
 }
});
