import test from 'node:test';
import assert from 'node:assert/strict';
import {stackPopLabel,type LabelBox} from '../lib/noise/artwork.ts';
import {create,tuning,guardSpeed,guardSight,type Guard} from '../lib/noise/engine.ts';
test('capture, rescue and bank pops remain at their event, not a distant same-column jackpot',()=>{
 for(const name of ['TIED UP!','FREED!','+$600']){
  const labels:LabelBox[]=[{x:480,y:120,width:120,height:18}];
  const p=stackPopLabel(480,400,name.length*12,18,labels);
  assert.equal(p.x,480);assert.equal(p.y,335);
 }
});
test('nearby actor labels push a pop apart locally',()=>{
 const labels:LabelBox[]=[{x:480,y:335,width:120,height:18}];
 const p=stackPopLabel(480,400,100,18,labels);
 assert.equal(p.x,480);assert.equal(p.y,312);
 assert.ok(Math.abs(p.y-labels[0].y)>18);
});
test('v36 eases only Rookie co-op patrol and sight; other levels and chase settings stay fixed',()=>{
 const g=create('TEST',0,1);const h={mode:'chase'} as Guard;
 g.crewMode='coop';g.difficulty='rookie';assert.equal(tuning(g).speed,.78);assert.equal(tuning(g).sight,.80);assert.equal(guardSpeed(g,'chase'),.85);assert.equal(guardSight(g,h),.9);
 g.difficulty='normal';assert.equal(tuning(g).speed,.96);assert.equal(tuning(g).sight,.95);
 g.difficulty='pro';assert.equal(tuning(g).speed,1);assert.equal(tuning(g).sight,1);
 g.crewMode='duos';for(const [level,speed,sight,rival] of [['rookie',.95,.9,.42],['normal',1.22,1.15,1.10],['pro',1.22,1.15,1.65]] as const){g.difficulty=level;assert.deepEqual(tuning(g),{speed,sight,rival});}
});
