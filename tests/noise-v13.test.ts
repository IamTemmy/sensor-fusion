import test from 'node:test';
import assert from 'node:assert/strict';
import {museumArena} from '../lib/noise/arenas.ts';

test('authored museums retain distinct, non-rectangular patrol circuits',()=>{
 for(const n of [2,4,6])for(let layout=0;layout<3;layout++){
  const {routes}=museumArena(layout,n);
  assert.equal(new Set(routes.map(r=>JSON.stringify([...r].sort((a,b)=>a.x-b.x||a.y-b.y)))).size,routes.length);
  for(const r of routes){assert.ok(r.length>=4);assert.ok(new Set(r.map(p=>p.x)).size>2||new Set(r.map(p=>p.y)).size>2);}
 }
});
