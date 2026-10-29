import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../lib/noise/engine.ts';
import {recordOutcome} from '../lib/noise/records.ts';
test('a patrol completes a sub-three-unit navigation corner instead of freezing',()=>{
 const g=E.create('CORNER',0,1);E.add(g,'Human','h');for(let i=1;i<4;i++)E.add(g,'Bot '+i,'b'+i,true);E.configure(g,'duos');E.setup(g);E.command(g,g.seats[0].id,{type:'ready'});
 while(g.now<26000)E.advance(g,g.now+40);
 const h=g.guards[0];Object.assign(h,{x:191.8954,y:309.6788,target:{x:80,y:300},mode:'patrol',victim:undefined});
 const before={x:h.x,y:h.y};for(let i=0;i<50;i++)E.advance(g,g.now+40);
 assert.ok(E.distance(h,before)>10,'guard must leave the corner');
});
test('device records distinguish first runs, improvements, ties and worse runs',()=>{
 const old={stars:2,bank:2600,time:70};assert.equal(recordOutcome(null,old),'first');assert.equal(recordOutcome(old,{...old}),'existing');assert.equal(recordOutcome(old,{...old,time:80}),'existing');assert.equal(recordOutcome(old,{...old,time:69}),'new');assert.equal(recordOutcome(old,{...old,stars:3}),'new');
});
