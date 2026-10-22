import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {releaseSet} from '../scripts/verify-noise-v19.ts';

test('40 natural self-releases: Echo is caught within 3s in at most 10%',()=>{
 // Take the first 40 timer releases in seed order. Early rescues are recorded but
 // cannot dilute this denominator. Never filter on Echo's subsequent outcome.
 const {runs}=releaseSet();
 assert.equal(runs.length,40);
 assert.ok(runs.every(r=>r.capture&&r.selfReleased&&r.echoFreeAtRelease&&r.release-r.capture>=5960));
 assert.ok(runs.filter(r=>r.echoCaught).length<=4,JSON.stringify(runs.filter(r=>r.echoCaught)));
});
test('bot movement decisions cannot bypass guard-aware routing',()=>{
 const source=readFileSync(new URL('../lib/noise/engine.ts',import.meta.url),'utf8');
 const decisions=source.slice(source.indexOf('function bot(g:'),source.indexOf('function step(g:'));
 assert.doesNotMatch(decisions,/\bwalk\(/,'All bot branches must use guardedWalk');
});

test('a freed partner across a guard cone does not trigger a direct rejoin',async()=>{
 const {create,add,setup,command,advance,guardSees}=await import('../lib/noise/engine.ts');
 for(const mode of ['auto','follow','cover'] as const){
  const g=create('CONE',1000,3),human=add(g,'Human','h'),echo=add(g,'Echo','e',true);setup(g);command(g,human.id,{type:'ready'});
  g.now=g.start+20000;g.walls=[];g.sensors=[];g.loot=[];g.jobEvent=undefined;
  Object.assign(human,{x:650,y:200,stun:0,safe:g.now+3000});Object.assign(echo,{x:200,y:200,mode});
  const guard={...g.guards[0],x:400,y:350,angle:-Math.PI/2,route:[{x:400,y:350}],target:{x:400,y:350},way:0};g.guards=[guard];
  for(let i=0;i<75;i++){advance(g,g.now+40);assert.equal(echo.captures,0,mode+' rejoined through the guard');assert.equal(guardSees(g,guard,echo),false,mode+' entered the visible cone');}
 }
});
