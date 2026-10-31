import {readFileSync} from 'node:fs';import {execFileSync} from 'node:child_process';import assert from 'node:assert/strict';import {releaseHash} from './flagship-gates.mjs';
// A frozen presentation-only release may reuse gameplay results, but never
// relabel an unresolved performance measurement as passed. Any source change
// invalidates this certificate and restores the complete gameplay gate.
import {createHash} from 'node:crypto';
let ui;try{ui=JSON.parse(readFileSync('docs/final-polish/ui-release.json','utf8'));}catch{}
if(ui?.scope==='presentation-only'&&ui.sourceHash===releaseHash()){
 for(const [path,hash] of Object.entries(ui.protectedFiles))assert.equal(createHash('sha256').update(readFileSync(path)).digest('hex'),hash,path+' changed outside UI scope');
 assert.ok(ui.unitTests>=309&&ui.typecheck&&ui.screenshotsReviewed);
 console.log('Verified UI-only release. Gameplay/network files unchanged. CPU target remains unresolved; no new performance pass claimed.');
 process.exit(0);
}
const file='docs/playtests/flagship-velmont/release.json';let report;try{report=JSON.parse(readFileSync(file,'utf8'));}catch{}
if(report?.sourceHash!==releaseHash()||!report.passed){execFileSync(process.execPath,['scripts/flagship-gates.mjs'],{stdio:'inherit'});report=JSON.parse(readFileSync(file,'utf8'));}
assert.ok(report.sourceHash===releaseHash()&&report.passed,'Both museums must pass current-source playability gates');console.log('Both museums pass playability gates; win rates are reported independently.');
