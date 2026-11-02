import {test} from 'node:test';
import assert from 'node:assert/strict';
import {INTRO_DURATION,INTRO_SHOTS,introFrame,introClip,allowIntroVideo} from '../lib/noise/intro-story.ts';
test('opening is five shots totalling exactly twenty seconds',()=>{assert.equal(INTRO_DURATION,20);assert.deepEqual(INTRO_SHOTS.map(s=>s.seconds),[5,4,5,3,3]);});
test('shot boundaries never create an empty frame',()=>{for(const [t,shot] of [[0,0],[4.99,0],[5,1],[9,2],[14,3],[17,4],[20,4]])assert.equal(introFrame(t).shot,shot);});
test('drop-in clip names are stable for desktop and phone',()=>{assert.equal(introClip(0,false,'mp4'),'/cinematics/intro-v2/shot-01-landscape.mp4');assert.equal(introClip(4,true,'webm'),'/cinematics/intro-v2/shot-05-portrait.webm');});
test('reduced motion, save data and slow connections use illustrated fallback',()=>{assert.equal(allowIntroVideo(true),false);assert.equal(allowIntroVideo(false,{saveData:true}),false);assert.equal(allowIntroVideo(false,{effectiveType:'3g'}),false);assert.equal(allowIntroVideo(false,{downlink:1}),false);assert.equal(allowIntroVideo(false,{effectiveType:'4g',downlink:10}),true);});
