import {test} from 'node:test';
import assert from 'node:assert/strict';
import {heistScoreStep,HEIST_EIGHTH_SECONDS} from '../lib/noise/heist-score.ts';
test('suspense score keeps a stable 100 BPM tempo with bounded density',()=>{assert.equal(HEIST_EIGHTH_SECONDS,.3);for(const pressure of [0,30,60,100])for(const last of [false,true])for(let i=0;i<128;i++){const notes=heistScoreStep(i,pressure,last);assert.ok(notes.length<=3);assert.ok(notes.every(n=>n.gain<=.034&&n.seconds<=2.15));}});
test('last call adds urgency without changing the root or introducing a bright melody',()=>{const calm=Array.from({length:32},(_,i)=>heistScoreStep(i,0,false)).flat(),urgent=Array.from({length:32},(_,i)=>heistScoreStep(i,0,true)).flat();assert.ok(urgent.length>calm.length);assert.ok(urgent.filter(n=>n.voice==='pulse').every(n=>n.midi===38));assert.ok(urgent.every(n=>n.midi<=51));});
test('calm arrangement leaves audible space between cues and repeats deterministically',()=>{assert.deepEqual(heistScoreStep(1,0,false),[]);for(let i=0;i<32;i++)assert.deepEqual(heistScoreStep(i,30,false),heistScoreStep(i+32,30,false));});
