import test from 'node:test';
import assert from 'node:assert/strict';
import {HeistMusic} from '../lib/noise/music.ts';
test('original score schedules bounded notes, mutes, and skips background backlog',()=>{
 let starts=0,disconnected=0;
 const param=()=>({value:0,cancelScheduledValues(){},setTargetAtTime(){},setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}});
 const audio:any={currentTime:0,state:'running',destination:{},createGain:()=>({gain:param(),connect(){},disconnect(){disconnected++;}}),createOscillator:()=>({frequency:param(),connect(){},disconnect(){},start(){starts++;},stop(){}})};
 const score=new HeistMusic(audio);score.update(true,0,false);assert.ok(starts>0&&starts<=3);
 let before=starts;score.update(false,60,true);assert.equal(starts,before);
 audio.currentTime=600;score.update(true,60,true);assert.ok(starts-before<=3);
 before=starts;audio.state='suspended';score.update(true,60,true);assert.equal(starts,before);
 score.dispose();assert.ok(disconnected>0);
});
