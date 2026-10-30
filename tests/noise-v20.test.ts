import test from 'node:test';
import assert from 'node:assert/strict';
import {create,add,setup,command,advance,distance,idleGuards,guardSees} from './helpers/legacy-engine.ts';
import {verify} from '../scripts/verify-noise-v20.ts';

test('Claude fixture: 40 fixed seeds, active events, safe waiting/rejoin and at least 40% rescues',()=>{
 const r=verify();assert.equal(r.captures,40);assert.ok(r.heldCaught<=4,JSON.stringify(r));assert.ok(r.postCaught<=4,JSON.stringify(r));assert.ok(r.rescues>=16,JSON.stringify(r));
});
test('idle Follow yields before a different patrol reaches its waiting position',()=>{
 const g=create('WAIT',1000,5),human=add(g,'Human','h'),echo=add(g,'Echo','e',true);setup(g);command(g,human.id,{type:'ready'});g.now=g.start+13000;g.walls=[];g.sensors=[];g.loot=[];g.jobEvent=undefined;
 Object.assign(human,{x:400,y:300});Object.assign(echo,{x:368,y:321,mode:'follow'});
 const guard={...g.guards[0],x:710,y:321,angle:Math.PI,route:[{x:300,y:321},{x:710,y:321}],target:{x:300,y:321},way:0};g.guards=[guard];
 assert.equal(guardSees(g,guard,echo),false,'Initially outside current cone');
 assert.ok(idleGuards(g).some(h=>guardSees(g,h,echo,true)),'Patrol reaches waiting spot within lookahead');
 const before={x:echo.x,y:echo.y};for(let i=0;i<50;i++)advance(g,g.now+40);
 assert.equal(echo.captures,0);assert.equal(guardSees(g,guard,echo),false);assert.ok(distance(before,echo)>20,'Must actively move, not merely wait');
});
