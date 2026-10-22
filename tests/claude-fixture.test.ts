import test from 'node:test';
import assert from 'node:assert/strict';
import {verify} from '../scripts/verify-noise-v21.ts';
test('exact Claude v21 fixture: scripted advance, guards[0] approach, hold and exit across 40 seeds',()=>{
 const r=verify();
 console.log('Claude v21 fixture',JSON.stringify(r));
 assert.equal(r.captures,40);
 assert.ok(r.heldCaught<=4,`heldCaught ${r.heldCaught}/40`);
 assert.ok(r.afterCaught<=4,`afterCaught ${r.afterCaught}/40`);
 assert.ok(r.rescued>=16,`rescued ${r.rescued}/40`);
});
