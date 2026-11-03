import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
const manifest=JSON.parse(readFileSync('.openai/hosting.json','utf8'));
assert.equal(manifest.project_id,'appgprj_6ae6f13dfc708191875cde1e84d8bfc3','Wrong target: only the next preview may deploy');
assert.equal(execFileSync('git',['branch','--show-current'],{encoding:'utf8'}).trim(),'next','Use the next branch');
for(const p of ['lib/noise/engine.ts','lib/noise/network.ts','lib/noise/peer-client.ts','lib/noise/online-client.ts','lib/noise/arenas.ts','lib/noise/flagship-arena.ts','lib/noise/archive-arena.ts','lib/noise/compact-wire.ts','lib/noise/peer-protocol.ts']){
 if(p==='lib/noise/engine.ts'){assert.equal(createHash('sha256').update(readFileSync(p)).digest('hex'),'c8c95d3bbc03558599965662daf098435b948545d91ec93738ec8a01ae8db22e','Engine differs from approved four-thief crew-format revision');continue;}
 const baseline=execFileSync('git',['show','ce1ce1f:'+p]);assert.ok(baseline.equals(readFileSync(p)),p+' changed');
}
console.log('Preview project and next branch verified; approved four-thief crew-format engine revision pinned; maps and networking unchanged.');
