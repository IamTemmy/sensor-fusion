import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,statSync} from 'node:fs';
import {actorPose,preloadSprites,spriteReady,sprite,artSpriteKey} from '../lib/noise/sprites.ts';
test('sprite sheet frames fit the atlas and every required crew/state has an asset',()=>{
 const f=JSON.parse(readFileSync('public/art/v25/frames.json','utf8'));
 for(const key of ['art-cat','art-box','art-sunset','art-vase','art-bust','art-crown','art-portrait','art-abstract','art-sea','mint-front','mint-back','mint-side','mint-carry','violet-front','violet-back','violet-side','violet-carry','guard-front','guard-back','guard-side','van-mint','van-violet','case-locked','case-open','plate-on','plate-off'])assert.ok(f[key],key);
 for(const a of Object.values(f) as any[])assert.ok(a.x>=0&&a.y>=0&&a.w>0&&a.h>0&&a.x+a.w<=1536&&a.y+a.h<=1536);
 const size=(p:string):number=>readdirSync(p).reduce((n,k)=>n+(statSync(p+'/'+k).isDirectory()?size(p+'/'+k):statSync(p+'/'+k).size),0);
 assert.ok(size('public/art')<3_000_000);
});
test('sprite absence safely leaves primitive fallback enabled',()=>{preloadSprites();assert.equal(spriteReady(),false);assert.equal(sprite({} as any,'mint-front',0,0,40,49),false);});
test('directional and carry poses preserve crew asset routing',()=>{assert.deepEqual(actorPose(-1,0),{pose:'side',flip:true});assert.equal(actorPose(0,-1).pose,'back');assert.equal(actorPose(1,0,true).pose,'carry');assert.equal(artSpriteKey('gold'),'art-bust');});
