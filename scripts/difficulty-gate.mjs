import {readFileSync} from 'node:fs';import {execFileSync} from 'node:child_process';import assert from 'node:assert/strict';import {releaseHash} from './flagship-gates.mjs';
// A frozen presentation-only release may reuse gameplay results, but never
// relabel an unresolved performance measurement as passed. Any source change
// invalidates this certificate and restores the complete gameplay gate.
import {createHash} from 'node:crypto';
// Explicit release approval applies only to this tested source hash. The
// banking failure remains recorded; subsequent changes restore normal gates.
let rescue;try{rescue=JSON.parse(readFileSync('docs/rescue-priority/release-status.json','utf8'));}catch{}
if(rescue?.status==='approved-with-known-limitation'&&rescue.sourceHash===releaseHash()){
 assert.equal(rescue.acceptedLimitation,'Velmont banks 17/30 within 15 seconds; owner accepted and requested deployment.');
 assert.equal(rescue.unitTests,326);assert.equal(rescue.typecheck,true);
 assert.equal(rescue.engineHash,createHash('sha256').update(readFileSync('lib/noise/engine.ts')).digest('hex'));
 for(const r of rescue.acceptance){assert.ok(r.first/r.n>=.9);assert.equal(r.freed,r.n);if(r.museum==='night-archive')assert.ok(r.banked/r.n>=.85);}
 for(const r of rescue.regressions){assert.equal(r.idle.stalls,0);assert.ok(r.idle.matches>=30);for(const e of r.echo){assert.ok(e.matches>=40&&e.leftBehind<=2);if(e.difficulty==='normal')assert.ok(e.medianHaul>=1500);}}
 console.log('Verified owner-approved rescue priority release: Velmont banking 17/30 accepted. CPU target remains unresolved; no new CPU pass claimed.');process.exit(0);
}
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
