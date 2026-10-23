import test from 'node:test';
import assert from 'node:assert/strict';
import {openingSweep} from '../lib/noise/opening-sweep.ts';
test('protected opening sweep animates both sides and returns seamlessly without modifying guards',()=>{
 for(const x of [80,880]){
  const h={id:x===80?'g0':'g1',x,y:60},g={now:0,start:0,crewMode:'duos'};
  assert.equal(openingSweep(g,h).x,x);
  assert.notEqual(openingSweep({...g,now:2000},h).x,x);
  assert.equal(openingSweep({...g,now:12000},h).x,x);
  assert.equal(openingSweep({...g,now:2000},h,true).x,x);
  assert.equal(h.x,x);
 }
});
