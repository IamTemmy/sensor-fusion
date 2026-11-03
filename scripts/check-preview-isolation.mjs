import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
const manifest=JSON.parse(readFileSync('.openai/hosting.json','utf8'));
assert.equal(manifest.project_id,'appgprj_6ae6f13dfc708191875cde1e84d8bfc3','Wrong target: only the next preview may deploy');
assert.equal(execFileSync('git',['branch','--show-current'],{encoding:'utf8'}).trim(),'next','Use the next branch');
for(const p of ['lib/noise/engine.ts','lib/noise/network.ts','lib/noise/peer-client.ts','lib/noise/online-client.ts','lib/noise/arenas.ts','lib/noise/flagship-arena.ts','lib/noise/archive-arena.ts','lib/noise/compact-wire.ts','lib/noise/peer-protocol.ts']){
 if(p==='lib/noise/engine.ts'){assert.equal(createHash('sha256').update(readFileSync(p)).digest('hex'),'8ec6b37465352e16cf6f755a427076d6daa2bcf0e3c5d109056552de05bf8059','Engine differs from approved friends-lobby crew-rule revision');continue;}
 const baseline=execFileSync('git',['show','ce1ce1f:'+p]);assert.ok(baseline.equals(readFileSync(p)),p+' changed');
}
console.log('Preview project and next branch verified; approved friends-lobby crew-rule engine revision pinned; maps and networking unchanged.');
