import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
const manifest=JSON.parse(readFileSync('.openai/hosting.json','utf8'));
assert.equal(manifest.project_id,'appgprj_6ae6f13dfc708191875cde1e84d8bfc3','Wrong target: only the next preview may deploy');
assert.equal(execFileSync('git',['branch','--show-current'],{encoding:'utf8'}).trim(),'next','Use the next branch');
// Part A explicitly brings in main's verified lifecycle and route-cost fixes.
const approvedMain='9842879e0b1277880a5fb8a3bd9409d9d784981b';
for(const p of ['lib/noise/engine.ts','lib/noise/network.ts','lib/noise/peer-client.ts','lib/noise/online-client.ts','lib/noise/arenas.ts','lib/noise/flagship-arena.ts','lib/noise/archive-arena.ts','lib/noise/compact-wire.ts','lib/noise/peer-protocol.ts']){
 const baseline=execFileSync('git',['show',approvedMain+':'+p]);
 assert.ok(baseline.equals(readFileSync(p)),p+' differs from approved main gameplay/network source');
}
console.log('Preview project and next branch verified; gameplay/network source matches approved main '+approvedMain.slice(0,7)+'.');
