import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
test('opening uses real door deployment, never a drawing-only guard sweep',()=>{const draw=readFileSync(new URL('../lib/noise/draw.ts',import.meta.url),'utf8');assert.doesNotMatch(draw,/openingSweep/);assert.match(draw,/guardActive/);assert.match(draw,/staffDoors/);});
