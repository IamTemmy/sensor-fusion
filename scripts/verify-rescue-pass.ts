import {rescuePassRuns} from './rescue-pass-scenarios.ts';
import {writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
const rows=rescuePassRuns();
writeFileSync('docs/rescue-priority/candidate.json',JSON.stringify({engineHash:createHash('sha256').update(readFileSync('lib/noise/engine.ts')).digest('hex'),rows},null,2));
console.log(JSON.stringify(rows.map(({runs,...r})=>r)));
for(const row of rows)test(row.museum+' pass-then-capture acceptance (30 seeds)',()=>{
 assert.ok(row.first/row.n>=.9,`Secured first: ${row.first}/${row.n}, target 90%`);
 assert.ok(row.banked/row.n>=.85,`Banked within 15s: ${row.banked}/${row.n}, target 85%`);
 assert.equal(row.freed,row.n,'Every captive must be freed or self-release');
});
