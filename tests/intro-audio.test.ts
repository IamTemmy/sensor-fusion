import {test} from 'node:test';
import assert from 'node:assert/strict';
import {prepareNarration,narrationWindow,narratedSegmentSeconds} from '../lib/noise/intro-audio.ts';
test('narration begins 300ms after cut and split heist resumes without repeating',()=>{assert.deepEqual(narrationWindow(0,4),{delay:.3,seek:0,remaining:4});assert.deepEqual(narrationWindow(3,4),{delay:0,seek:2.7,remaining:1.2999999999999998});});
test('long voice extends its final segment, never the first half of the heist',()=>{assert.equal(narratedSegmentSeconds(5,0,5,8),8.9);assert.equal(narratedSegmentSeconds(6,0,3,8),3);assert.equal(narratedSegmentSeconds(6,3,3,8),5.9);assert.equal(narratedSegmentSeconds(5,0,5,0),5);});
test('silent recording is rejected instead of extending the shot',()=>{assert.equal(prepareNarration([new Float32Array(100)],1000),null);});
test('narration trims silence with breath margin and preserves stereo alignment',()=>{const a=new Float32Array(1000),b=new Float32Array(1000);a.fill(.05,200,500);b.fill(.1,220,550);const edit=prepareNarration([a,b],1000)!;assert.equal(edit.start,170);assert.equal(edit.end,580);assert.ok(edit.gain>1&&edit.gain<=4);});
test('normalization never raises peaks above headroom',()=>{const edit=prepareNarration([new Float32Array([0,0,1,0,0])],1000)!;assert.ok(edit.gain<=.8);});

import {IntroSound} from '../components/noise/intro-sound.ts';
function audioFixture(){
 const starts:number[][]=[],gains:number[][]=[];
 const param=()=>({value:0,setValueAtTime(...v:number[]){gains.push(v);},exponentialRampToValueAtTime(){},setTargetAtTime(...v:number[]){gains.push(v);},cancelScheduledValues(){}});
 const node=()=>({connect(){return this;},disconnect(){},start(...v:number[]){starts.push(v);},stop(){},gain:param(),frequency:param(),threshold:param(),knee:param(),ratio:param(),attack:param(),release:param(),buffer:null,type:''});
 const buffer=(channels:number,length:number,rate:number)=>{const data=Array.from({length:channels},()=>new Float32Array(length));return {numberOfChannels:channels,sampleRate:rate,duration:length/rate,getChannelData:(c:number)=>data[c]};};
 const raw=buffer(1,8000,1000);raw.getChannelData(0).fill(.12);
 const context={currentTime:0,sampleRate:1000,destination:node(),createGain:node,createDynamicsCompressor:node,createOscillator:node,createBufferSource:node,createConvolver:node,createBiquadFilter:node,createBuffer:buffer,decodeAudioData:async()=>raw};
 return {sound:new IntroSound(context as unknown as OfflineAudioContext),starts,gains};
}
test('live audio scheduler delays voice, ducks ambience by 10dB and retains the full long line',async()=>{const f=audioFixture();await f.sound.prepareVoice(0,new ArrayBuffer(1));const seconds=narratedSegmentSeconds(5,0,5,f.sound.voiceDuration(0));f.sound.scene(0,0,seconds);assert.ok(f.starts.some(s=>s[0]===.3&&s[1]===0&&s[2]===8));assert.ok(f.gains.some(g=>g[0]===Math.pow(10,-10/20)));});
test('second heist segment resumes the narration at 2.7 seconds',async()=>{const f=audioFixture();await f.sound.prepareVoice(3,new ArrayBuffer(1));f.sound.scene(3,3,narratedSegmentSeconds(6,3,3,8));assert.ok(f.starts.some(s=>s[0]===0&&s[1]===2.7&&s[2]===5.3));});
test('SFX mute changes the master gain to zero and restores it',()=>{const f=audioFixture();f.sound.mute(true);assert.equal(f.gains.at(-1)?.[0],0);f.sound.mute(false);assert.equal(f.gains.at(-1)?.[0],.65);});
