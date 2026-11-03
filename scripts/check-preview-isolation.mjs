import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
const manifest=JSON.parse(readFileSync('.openai/hosting.json','utf8'));
assert.equal(manifest.project_id,'appgprj_6ae6f13dfc708191875cde1e84d8bfc3','Wrong target: only the next preview may deploy');
assert.equal(execFileSync('git',['branch','--show-current'],{encoding:'utf8'}).trim(),'next','Use the next branch');
for(const p of ['lib/noise/engine.ts','lib/noise/network.ts','lib/noise/peer-client.ts','lib/noise/online-client.ts','lib/noise/arenas.ts','lib/noise/flagship-arena.ts','lib/noise/archive-arena.ts','lib/noise/compact-wire.ts','lib/noise/peer-protocol.ts']){
 const approved={"lib/noise/engine.ts": "396bda03b59bb2c472779936f4f337666824feb5f72aacd77f37818c6d2a3a69", "lib/noise/peer-client.ts": "d3c7150cd8787fd20573d823a0e4ebb928df806cd787beaa91d853e73836c28c", "lib/noise/peer-protocol.ts": "704c4113ff72ce1628ecc5107e87aca48ca25af33cd6ddc4a8b29849f9aef4ad"};
 if(p in approved){assert.equal(createHash('sha256').update(readFileSync(p)).digest('hex'),approved[p],p+' differs from approved lobby lifecycle revision');continue;}
 const baseline=execFileSync('git',['show','ce1ce1f:'+p]);assert.ok(baseline.equals(readFileSync(p)),p+' changed');
}
console.log('Preview project and next branch verified; approved friends-lobby crew-rule engine revision pinned; maps and gameplay networking unchanged; approved lobby lifecycle transport pinned.');
