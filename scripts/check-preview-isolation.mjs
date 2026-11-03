import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
const manifest=JSON.parse(readFileSync('.openai/hosting.json','utf8'));
assert.equal(manifest.project_id,'appgprj_6ae6f13dfc708191875cde1e84d8bfc3','Wrong target: only the next preview may deploy');
assert.equal(execFileSync('git',['branch','--show-current'],{encoding:'utf8'}).trim(),'next','Use the next branch');
for(const p of ['lib/noise/engine.ts','lib/noise/network.ts','lib/noise/peer-client.ts','lib/noise/online-client.ts','lib/noise/arenas.ts','lib/noise/flagship-arena.ts','lib/noise/archive-arena.ts','lib/noise/compact-wire.ts','lib/noise/peer-protocol.ts']){
 const approved={"lib/noise/engine.ts": "05c4d44919d41d20a2e92faed8dfaa7de199a6c1d6521e53e5816472c31402c7", "lib/noise/peer-client.ts": "01c9d3642b91b18c296ebf8ce5246af3ee305ad4a9798f6582da3ee116f7149a", "lib/noise/peer-protocol.ts": "2bf3601b94d916eabe6bc5f9d44fd2c40acab841ccf296bcab741d3640558a6f"};
 if(p in approved){assert.equal(createHash('sha256').update(readFileSync(p)).digest('hex'),approved[p],p+' differs from approved lobby lifecycle revision');continue;}
 const baseline=execFileSync('git',['show','ce1ce1f:'+p]);assert.ok(baseline.equals(readFileSync(p)),p+' changed');
}
console.log('Preview project and next branch verified; approved friends-lobby crew-rule engine revision pinned; maps and gameplay networking unchanged; approved lobby lifecycle transport pinned.');
