import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../lib/noise/engine.ts';
import {aboardInstruction,spectatorExplanation} from '../lib/noise/aboard-copy.ts';
for(const departed of [false,true])test(`aboard instruction is readable with whole crew departed=${departed}`,()=>{
 const g=E.create('COPY',0,1001),me=E.add(g,'Player','p'),mate=E.add(g,'Echo','e',true);E.setup(g);
 me.escaped=true;me.escapedAt=1000;if(departed){mate.escaped=true;mate.escapedAt=1100;}
 const text=aboardInstruction(g,me,85);assert.doesNotMatch(text,/[{}]|crewDepartureAt/);assert.match(text,/85s remaining/);
 assert.match(text,departed?/Your crew escaped/:/You’re in the van/);
 if(departed){assert.doesNotMatch(spectatorExplanation(g,me),/Hop out/);assert.match(spectatorExplanation(g,me),/van has left/);}
});
