import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {releaseHash} from './flagship-gates.mjs';
const file='docs/playtests/flagship-velmont/release.json';let report;
try{report=JSON.parse(readFileSync(file,'utf8'));}catch{}
let approval;
try{approval=JSON.parse(readFileSync('docs/playtests/flagship-velmont/playtest-approval.json','utf8'));}catch{}
const approved=()=>report?.sourceHash===releaseHash()&&approval?.sourceHash===report.sourceHash&&report.failed?.length>0&&report.failed.every(f=>approval.allowedFailures?.includes(f));
if(report?.sourceHash!==releaseHash()||(!report.passed&&!approved())){execFileSync(process.execPath,['scripts/flagship-gates.mjs'],{stdio:'inherit'});report=JSON.parse(readFileSync(file,'utf8'));}
assert.ok(report.sourceHash===releaseHash()&&(report.passed||approved()),'Flagship release gates must pass or have an exact-source playtest approval');
console.log(report.passed?'Flagship release gates passed for current source, including both rivals dock assignments.':'User-approved playtest release; known failed gates: '+report.failed.join(', '));
