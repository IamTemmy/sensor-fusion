import test from 'node:test';
import assert from 'node:assert/strict';
import {create,add,configure,setup,RIVAL_LAYOUTS,mirrorPoint,rotatePoint,vanFor,distance,clear,sight} from '../lib/noise/engine.ts';
const game=(seed:number)=>{const g=create('MAP',0,seed);for(let i=0;i<4;i++)add(g,'P'+i,''+i);configure(g,'duos');setup(g);return g;};
// Historical mirror-specific case replaced by museum-arenas.test.ts.

// Historical mirror-specific case replaced by museum-arenas.test.ts.

test('co-op valuable core spans the three rooms instead of clustering in the far wing',()=>{
 for(let seed=1;seed<=30;seed++){
 const g=create('COOP',0,seed);add(g,'Human','h');add(g,'Echo','b',true);setup(g);
 for(const [min,max] of [[0,320],[320,640],[640,960]])assert.ok(g.loot.some(l=>l.x>=min&&l.x<max&&l.value>=500));
 }
});
