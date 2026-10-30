import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from './helpers/legacy-engine.ts';
function job(seed=1,mode:E.CrewMode='duos',difficulty:E.Difficulty='normal'){const g=E.create('V31',0,seed);E.add(g,'Human','tok');E.configure(g,mode);E.fillCrews(g);g.difficulty=difficulty;E.setup(g);E.command(g,g.seats[0].id,{type:'ready'});return g;}
function tick(g:E.Game,ms:number){for(let i=0;i<ms;i+=40)E.advance(g,g.now+40);}
test('all sentry posts leave 30-unit-clear art-to-van routes; distinct posts and wall cover',()=>{
 for(const mode of ['coop','duos'] as const)for(const d of ['rookie','normal','pro'] as const)for(let seed=1;seed<=40;seed++){
 const g=job(seed,mode,d);assert.ok(E.sentryRoutesClear(g),`${mode}/${d}/${seed}`);
 const posts=g.guards.filter(h=>h.sentry);assert.equal(new Set(posts.map(h=>`${h.sentry!.x},${h.sentry!.y}`)).size,posts.length);

 const spots=E.hidingSpots(g);assert.equal(spots.length,4);for(const p of spots){assert.ok(posts.every(h=>E.distance(p,h.sentry!)>=120));assert.ok(g.walls.some(w=>Math.hypot(Math.max(w.x-p.x,0,p.x-w.x-w.w),Math.max(w.y-p.y,0,p.y-w.y-w.h))<=32));}
 }
});
test('a claimed sentry exhibit retires its post and resumes a patrol',()=>{const g=job(),h=g.guards.find(h=>h.sentry)!,l=g.loot.find(l=>l.id===h.sentryArt)!;g.now=20000;g.start=0;g.end=90000;h.entered=true;l.claimed=true;tick(g,40);assert.equal(h.sentry,undefined);assert.equal(h.sentryArt,undefined);assert.ok(h.route.length>1);});
test('security collects after five seconds and visibly walks art home, blocking grabs only while carried',()=>{
 const g=job(1,'coop'),s=g.seats[0],l=g.loot[0];g.now=20000;g.start=0;g.end=90000;g.walls=[];g.sensors=[];g.jobEvent=undefined;g.seats.forEach(p=>{p.bot=false;p.safe=100000;});Object.assign(l,{x:400,y:300,home:{x:650,y:300},droppedAt:g.now,recoverAt:g.now+5000,holder:null});g.guards=[{id:'returner',x:350,y:300,angle:0,mode:'patrol',target:{x:350,y:300},route:[{x:350,y:300}],way:0,attention:0,victim:null}];
 tick(g,4960);assert.equal(l.guardCarrier,undefined);let carried=false;for(let i=0;i<250;i++){tick(g,40);if(l.guardCarrier){carried=true;assert.equal(l.x,g.guards[0].x);Object.assign(s,{x:l.x,y:l.y});assert.notEqual(E.interaction(g,s).id,l.id);}if(!l.droppedAt)break;}assert.ok(carried);assert.deepEqual({x:l.x,y:l.y},l.home);assert.equal(l.guardCarrier,undefined);assert.equal(l.recoverAt,undefined);
});
