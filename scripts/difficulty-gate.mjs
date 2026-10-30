import {readFileSync} from 'node:fs';import {execFileSync} from 'node:child_process';import assert from 'node:assert/strict';import {releaseHash} from './flagship-gates.mjs';
const file='docs/playtests/flagship-velmont/release.json';let report;try{report=JSON.parse(readFileSync(file,'utf8'));}catch{}
if(report?.sourceHash!==releaseHash()||!report.passed){execFileSync(process.execPath,['scripts/flagship-gates.mjs'],{stdio:'inherit'});report=JSON.parse(readFileSync(file,'utf8'));}
assert.ok(report.sourceHash===releaseHash()&&report.passed,'Both museums must pass current-source playability gates');console.log('Both museums pass playability gates; win rates are reported independently.');
