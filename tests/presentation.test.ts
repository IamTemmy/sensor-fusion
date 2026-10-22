import test from 'node:test';
import assert from 'node:assert/strict';
import {artwork,stackLabel,type LabelBox} from '../lib/noise/artwork.ts';
import {readdirSync,statSync} from 'node:fs';
test('art tiers have distinct visual identities without changing game values',()=>{assert.equal(artwork('a',1200).kind,'crown');const mid=new Set(Array.from({length:20},(_,i)=>artwork('art-'+i,600).kind));assert.equal(mid.size,5);assert.equal(new Set(Array.from({length:20},(_,i)=>artwork('a'+i,200).kind)).size,3);});
test('crowded actor labels never overlap',()=>{const used:LabelBox[]=[];for(const x of [300,310,320,300,305,325])stackLabel(x,200,160,16,used);for(let i=0;i<used.length;i++)for(let j=i+1;j<used.length;j++)assert.ok(Math.abs(used[i].y-used[j].y)>=21);});
test('static WebP set stays under 1.5MB including mobile crops',()=>{const dir='public/art/v24/';const size=readdirSync(dir).filter(f=>f.endsWith('.webp')).reduce((n,f)=>n+statSync(dir+f).size,0);assert.ok(size<=1500000);});
