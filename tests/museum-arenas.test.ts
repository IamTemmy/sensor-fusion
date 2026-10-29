import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../lib/noise/engine.ts';
import {museumArena} from '../lib/noise/arenas.ts';
import {museumCamera} from '../lib/noise/camera.ts';
import {routePair} from '../scripts/arena-routes.ts';
import {packet,unpack,arenaKey} from '../lib/noise/network.ts';
function job(layout:number,n:number,coop=false,level:E.Difficulty='normal'){
 for(let seed=1;seed<100;seed++){const g=E.create('MUSEUM',0,seed);for(let i=0;i<n;i++)E.add(g,'Thief '+i,''+i,i>0);if(!coop)E.configure(g,n>4?'trios':'duos');g.difficulty=level;E.setup(g);if(g.layout===layout)return g;}throw Error('Missing layout');
}
test('nine population/theme plans are distinct and independently authored, not reflected wings',()=>{
 const shapes=new Set<string>();for(const n of [2,4,6])for(let layout=0;layout<3;layout++){
  const m=museumArena(layout,n);shapes.add(JSON.stringify(m.walls));assert.equal(m.capacity,n);
  assert.ok(m.walls.some(w=>!m.walls.some(q=>q.x===960-w.x-w.w&&q.y===w.y&&q.w===w.w&&q.h===w.h)));
  assert.ok(m.decor.length);for(const d of m.decor)assert.ok(m.walls.some(w=>w.x===d.x&&w.y===d.y&&w.w===d.w&&w.h===d.h),'decor must have a visible solid footprint');
 }assert.equal(shapes.size,9);
});
test('every plan: two routes to every exhibit, plate and niche; both crews can bank and escape',()=>{
 for(const n of [2,4,6])for(let layout=0;layout<3;layout++){
  const g=job(layout,n);assert.equal(g.loot.length,n===6?10:8);assert.equal(g.loot.reduce((v,l)=>v+l.value,0),4300);
  for(const p of [...g.loot,g.plate,...E.hidingSpots(g)]){assert.ok(E.clear(p,22,g.walls),`${g.arena!.id}: blocked ${JSON.stringify(p)}`);for(const team of [0,1]){assert.ok(Number.isFinite(E.routeLength(g,E.vanFor(g,team),p)));assert.equal(routePair(g,E.vanFor(g,team),p).length,2,`${g.arena!.id}/${team}/${JSON.stringify(p)}`);}}
  assert.ok(E.sentryRoutesClear(g));for(const h of g.guards){assert.ok(E.clear(h.door!,13,g.walls));assert.equal(E.guardActive(g,h),false);for(const p of h.route)assert.ok(E.clear(p,13,g.walls));}
 }
});
test('fair opportunities: shared objectives within 80 route units, collection cost within 15%, no cheap jackpot monopoly',()=>{
 for(const n of [2,4,6])for(let layout=0;layout<3;layout++){
  const g=job(layout,n);for(const p of [g.loot[2],g.loot[3],g.plate]){const d=[0,1].map(t=>E.routeLength(g,E.vanFor(g,t),p));assert.ok(Math.abs(d[0]-d[1])<80,`${g.arena!.id}: ${d}`);}
  const cost=[0,1].map(t=>[t,4+t,6+t].reduce((sum,i)=>sum+E.routeLength(g,E.vanFor(g,t),g.loot[i]),0));assert.ok(Math.max(...cost)/Math.min(...cost)<1.15,`${g.arena!.id}: ${cost}`);
  assert.ok(g.loot.filter(l=>!l.locked).reduce((v,l)=>v+l.value,0)>2600);assert.ok(E.distance(g.plate,g.loot[2])>250);
  for(const l of g.loot.filter(l=>l.value>300))for(const t of [0,1])assert.ok(E.routeLength(g,E.vanFor(g,t),l)>=250);
 }
});
test('all difficulties/populations: valid sentries, collision-safe patrol destinations and replay rotation',()=>{
 for(const coop of [false,true])for(const n of [2,4,6])for(const level of ['rookie','normal','pro'] as const)for(let layout=0;layout<3;layout++){
  const g=job(layout,n,coop,level);assert.ok(E.sentryRoutesClear(g));for(const r of E.patrolPool(g))for(let i=0;i<r.length;i++)assert.ok(Number.isFinite(E.routeLength(g,r[i],r[(i+1)%r.length])));
  g.phase='finished';E.command(g,g.host,{type:'replay'});assert.notEqual(g.layout,layout);assert.equal(g.arena?.capacity,n);
 }
});
test('museum definition travels once per arena and survives delta snapshots',()=>{const g=job(1,6),p=packet(g,g.host),v=unpack(p),delta=packet(g,g.host,arenaKey(g));assert.equal('arena' in delta.view,false);assert.equal(delta.arena,undefined);assert.deepEqual(unpack(delta,v).arena,g.arena);});
test('phone camera keeps the full museum in overview and the player body visible at every edge in closer view',()=>{
 for(const [w,h] of [[360,370],[390,526],[740,160],[1280,620]])for(const overview of [true,false])for(const p of [{x:40,y:40},{x:920,y:40},{x:40,y:560},{x:920,y:560},{x:480,y:300}]){
  const c=museumCamera(w,h,p,overview);const x=(p.x-c.x)*c.scale,y=(p.y-c.y)*c.scale;
  assert.ok(x>=12&&x<=w-12);assert.ok(y>=12&&y<=h-12);
  if(overview){assert.ok(c.x<=0&&c.y<=0);assert.ok(c.x+c.w>=960&&c.y+c.h>=600);}
  assert.ok(Math.abs(c.x+x/c.scale-p.x)<.001&&Math.abs(c.y+y/c.scale-p.y)<.001,'aim inverse must agree with drawing');
 }
});

// Four/six-player results must not overwrite the compact-plan device record.
import {recordKey} from '../lib/noise/records.ts';
test('personal bests distinguish population plans',()=>{assert.notEqual(recordKey('normal','duos',0,'museum-0-2'),recordKey('normal','duos',0,'museum-0-4'));});
