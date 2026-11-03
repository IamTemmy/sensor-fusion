import {test} from 'node:test';
import assert from 'node:assert/strict';
import {alarmChirp} from '../lib/noise/alarm-sound.ts';
test('shared alarm retains the game chirp frequency, envelope and duration',()=>{
 const f:number[][]=[],g:number[][]=[],times:number[]=[];
 const param=(out:number[][])=>({setValueAtTime(...v:number[]){out.push(v);},exponentialRampToValueAtTime(...v:number[]){out.push(v);}});
 const osc={type:'',frequency:param(f),connect(){},disconnect(){},start(t:number){times.push(t);},stop(t:number){times.push(t);}};
 const gain={gain:param(g),connect(){},disconnect(){}};
 alarmChirp({currentTime:2,createOscillator:()=>osc,createGain:()=>gain} as unknown as BaseAudioContext,{} as AudioNode);
 assert.equal(osc.type,'sine');assert.deepEqual(f,[[1150,2],[100,2.2]]);assert.deepEqual(g,[[.035,2],[.001,2.25]]);assert.deepEqual(times,[2,2.26]);
});
