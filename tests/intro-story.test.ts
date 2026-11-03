import {test} from 'node:test';
import assert from 'node:assert/strict';
import {INTRO_DURATION,INTRO_SHOTS,INTRO_SEGMENTS,introFrame,introClip,introCaption,introAsset,allowIntroVideo,endingOpacity,shouldUseClipAudio,cameraAt,alarmPulse} from '../lib/noise/intro-story.ts';
test('six-shot story totals 28 seconds',()=>{assert.equal(INTRO_DURATION,28);assert.deepEqual(INTRO_SHOTS.map(s=>s.seconds),[5,4,4,4,6,5]);assert.equal(INTRO_SEGMENTS.length,6);});
test('exact recording script stays synchronized with captions',()=>{assert.deepEqual(INTRO_SHOTS.map(s=>s.caption),[
'The plan is simple. Get in. Get the Crown. Get out.',
"Every crew in town wants what's behind that glass.",
'Ninety seconds. One very nervous alarm system.',
'Rule one: the crew moves together.',
"Rule two: somebody's setting off the alarms. Make sure it's not on you.",
"Rule three… no matter what happens… don't get left behind."
]);for(let i=0;i<6;i++)assert.equal(introCaption(i),INTRO_SHOTS[i].caption);});
test('shot boundaries never leave an undefined frame',()=>{for(const [t,shot] of [[0,0],[4.99,0],[5,1],[9,2],[13,3],[17,4],[23,5],[28,5]])assert.equal(introFrame(t).shot,shot);});
test('revision-qualified clips cannot select old narration',()=>{assert.equal(introClip(3,false,'mp4'),'/cinematics/intro-v3/six-shot-04-landscape.mp4');assert.equal(introClip(5,true,'webm'),'/cinematics/intro-v3/six-shot-06-portrait.webm');assert.ok(INTRO_SEGMENTS.every(s=>s.offset===0));});
test('separate portrait art and matching depth passes have stable paths',()=>{assert.equal(introAsset(2,true),'/cinematics/intro-v3/shot-03-portrait.webp');assert.equal(introAsset(2,true,true),'/cinematics/intro-v3/shot-03-portrait-depth.webp');});
test('reduced motion and slow connections use the calm fallback',()=>{assert.equal(allowIntroVideo(true),false);for(const connection of [{saveData:true},{effectiveType:'3g'},{effectiveType:'2g'},{downlink:1}])assert.equal(allowIntroVideo(false,connection),false);assert.equal(allowIntroVideo(false,{effectiveType:'4g',downlink:10}),true);});
test('clip audio requires a click and follows SFX mute',()=>{assert.equal(shouldUseClipAudio(false,false),false);assert.equal(shouldUseClipAudio(true,true),false);assert.equal(shouldUseClipAudio(true,false),true);});
test('ending cannot reveal the menu during the final shot or black hold',()=>{for(const t of [-5,-.1,0,.2,.35])assert.equal(endingOpacity(t),1);assert.ok(endingOpacity(.6)>0&&endingOpacity(.6)<1);assert.equal(endingOpacity(1),0);assert.equal(endingOpacity(2),0);});
test('camera motion is bounded and differs between shots',()=>{for(let shot=0;shot<6;shot++){assert.notDeepEqual(cameraAt(shot,0),cameraAt(shot,1));for(let t=0;t<=1;t+=.1){const [x,y,z]=cameraAt(shot,t);assert.ok(Math.abs(x)<=.01&&Math.abs(y)<=.01&&z<=.03);}}assert.deepEqual(cameraAt(0,-1),cameraAt(0,0));});
test('alarm light and audio share a two Hz pulse',()=>{assert.equal(alarmPulse(0),.5);assert.ok(Math.abs(alarmPulse(.125)-1)<1e-10);assert.ok(Math.abs(alarmPulse(.5)-.5)<1e-10);});
