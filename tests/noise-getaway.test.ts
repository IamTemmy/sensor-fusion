import test from 'node:test';import assert from 'node:assert/strict';import {create,add,configure,view,setup,vanFor,W,H} from '../lib/noise/engine.ts';import {departingVan,getawayEligible,GETAWAY_MS} from '../lib/noise/getaway.ts';
function job(){const g=create('VAN');add(g,'Mint','m');add(g,'Violet','v');configure(g,'duos');g.phase='finished';g.finishReason='The van has left.';g.seats.forEach(s=>s.escaped=true);g.seats[0].bank=1200;g.seats[1].bank=600;return g;}
test('winner van closes doors and leaves before the other crew without mutating game state',()=>{const g=job(),before=JSON.stringify(g);assert.ok(getawayEligible(g));assert.equal(departingVan(g,0,250)!.doors,1);assert.ok(departingVan(g,0,600)!.progress>departingVan(g,1,600)!.progress);assert.equal(departingVan(g,1,GETAWAY_MS)!.progress,1);assert.equal(JSON.stringify(g),before);});
test('no getaway for practice, host disconnect or an entirely stranded crew',()=>{const g=job();g.training=true;assert.equal(getawayEligible(g),false);g.training=false;g.finishReason='Host left. Job ended';assert.equal(getawayEligible(g),false);g.finishReason='The van has left.';g.seats[1].escaped=false;assert.equal(departingVan(g,1,1000),null);g.seats[0].escaped=false;assert.equal(getawayEligible(g),false);});

test('flagship vans face and fully leave the nearest exterior edge, including swapped docks',()=>{
 for(const match of [1,2]){const g=job();g.match=match-1;setup(g);g.phase='finished';g.seats.forEach(s=>s.escaped=true);const before=JSON.stringify(g);
  for(const team of [0,1]){const home=vanFor(g,team),middle=departingVan(g,team,750)!,end=departingVan(g,team,GETAWAY_MS)!;
   if(home.x<100){assert.ok(middle.x<home.x);assert.equal(end.y,home.y);assert.ok(end.x<-33);}
   else{assert.ok(middle.y>home.y);assert.equal(end.x,home.x);assert.ok(end.y>H+33);}
  }assert.equal(JSON.stringify(g),before);
 }
});
