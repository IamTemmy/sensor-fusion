import test from 'node:test';
import assert from 'node:assert/strict';
import {create,add,setup,command,advance,botRoute,guardSees,distance,clear} from './helpers/legacy-engine.ts';
import {newLocalLoop,runLocalFrame,reconcilePosition} from '../lib/noise/client-loop.ts';
import {rescueFixture,carryingFixtures,spacingFixture,jackpotFixture} from '../scripts/verify-noise-v18.ts';

test('40 natural captures: rescue window, completion time, follow-through and carried art',()=>{
 const runs=Array.from({length:40},(_,i)=>rescueFixture(i+1));
 const carrying=carryingFixtures().runs;
 assert.ok(carrying.every(r=>!r.echoWasCaughtAtCapture));
 const times=runs.filter(r=>r.ms!==null).map(r=>r.ms!).sort((a,b)=>a-b);
 assert.equal(runs.filter(r=>r.caught).length,40,'Human must actually walk into a patrol in every seed');
 assert.ok(times.length>=28,`${times.length}/40 rescues`);
 assert.ok(times[Math.floor(times.length/2)]<=3000,'Median rescue takes at most 3s');
 assert.ok(runs.filter(r=>r.echoCaught).length/Math.max(1,times.length)<=.1,'Post-rescue captures must be <=10% of successful rescues');
 assert.equal(carrying.filter(r=>r.carryingAtCapture).length,40,'All carrying scenarios must hold art at the capture instant');
 assert.ok(carrying.filter(r=>r.artLost).length<4,'Art lost in fewer than 10% of carrying scenarios');
});
test('20 idle-near-patrol seeds: at most six reversals in any rolling two seconds',()=>{
 for(let seed=1;seed<=20;seed++){const r=spacingFixture(seed);assert.ok(r.maxReversals<=6,`seed ${seed}: ${r.maxReversals} reversals`);}
});
test('weighted bot routing detours around a visible cone and ignores a retreating captor on rescue',()=>{
 const g=create('PATH',1000,3),s=add(g,'Echo','e',true),human=add(g,'Human','h');setup(g);command(g,human.id,{type:'ready'});g.walls=[];g.sensors=[];g.jobEvent=undefined;
 Object.assign(s,{x:200,y:200});Object.assign(human,{x:760,y:200});
 const h={...g.guards[0],id:'test',x:480,y:300,angle:-Math.PI/2,route:[{x:480,y:100}],target:{x:480,y:100},way:0};g.guards=[h];
 const route=botRoute(g,s,human);assert.ok(route.path.length>2);assert.ok(route.path.some(p=>p.y>300));assert.ok(!guardSees(g,h,route.next));
 human.stun=g.now+6000;human.capturedBy=h.id;h.retreatUntil=g.now+4500;
 assert.equal(botRoute(g,s,human).exposed,false);
});
test('bursty local frames and stale input do not make a blocked player bounce',()=>{
 const g=create('BLOCK',1000,1),s=add(g,'Human','h');setup(g);command(g,s.id,{type:'ready'});g.guards=[];g.sensors=[];g.jobEvent=undefined;g.walls=[{x:300,y:100,w:20,h:400}];Object.assign(s,{x:280,y:300});const loop=newLocalLoop();let previous=s.x;
 for(let i=0;i<100;i++){runLocalFrame(g,loop,[16,4,80,32,8][i%5],{x:1,y:0},{x:500,y:300});assert.ok(s.x>=previous&&s.x<=288);assert.ok(clear(s,12,g.walls));previous=s.x;}
 command(g,s.id,{type:'input',match:g.match,seq:s.lastSeq-1,dx:-1,dy:0});advance(g,g.now+40);assert.equal(s.x,previous);
 const rendered={x:280,y:300};for(let i=0;i<30;i++){const old=rendered.x;reconcilePosition(rendered,s,1,g.walls);assert.ok(rendered.x>=old&&rendered.x<=s.x);assert.ok(clear(rendered,12,g.walls));}
 assert.ok(distance(rendered,s)<.1);
});

test('active-guard plate handoff: at least 75% pickup within 15s with Echo beside the crew',()=>{
 const runs=Array.from({length:60},(_,i)=>jackpotFixture(i+1,'crew'));
 assert.ok(runs.filter(r=>r.picked).length>=45);
});
