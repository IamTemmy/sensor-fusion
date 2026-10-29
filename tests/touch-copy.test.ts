import test from 'node:test';
import assert from 'node:assert/strict';
import {touchCopy} from '../lib/noise/input-copy.ts';
test('touch guide preserves desktop copy and converts contextual controls',()=>{
 const lines=['Move WASD, aim with the mouse. E grabs, unties and stashes. F throws. G drops. Shift sneaks.','Press R in your dock to board the van. R again hops out','Aim at Echo and F passes the art.','E stashes it safely.','Now hold Shift (or tap Sneak) and move into the niche.','E grabs the highlighted alarm.','Enter your dock and press R to board.'];
 for(const text of lines){assert.equal(touchCopy(text,false),text);assert.doesNotMatch(touchCopy(text,true),/\b(?:WASD|Shift|E|F|G|R)\b/);}
});
