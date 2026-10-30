import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {releaseHash} from './flagship-gates.mjs';
const file='docs/playtests/flagship-velmont/release.json';let report;
try{report=JSON.parse(readFileSync(file,'utf8'));}catch{}
if(report?.sourceHash!==releaseHash()||!report.passed){execFileSync(process.execPath,['scripts/flagship-gates.mjs'],{stdio:'inherit'});report=JSON.parse(readFileSync(file,'utf8'));}
assert.ok(report.passed&&report.sourceHash===releaseHash(),'Flagship release gates must pass for the current source');
console.log('Flagship release gates passed for current source, including both rivals dock assignments.');
