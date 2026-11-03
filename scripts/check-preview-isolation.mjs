import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
const manifest=JSON.parse(readFileSync('.openai/hosting.json','utf8'));
assert.equal(manifest.project_id,'appgprj_6ae6f13dfc708191875cde1e84d8bfc3','Wrong target: only the next preview may deploy');
assert.equal(execFileSync('git',['branch','--show-current'],{encoding:'utf8'}).trim(),'next','Use the next branch');
for(const p of ['lib/noise/engine.ts','lib/noise/network.ts','lib/noise/peer-client.ts','lib/noise/online-client.ts','lib/noise/arenas.ts','lib/noise/flagship-arena.ts','lib/noise/archive-arena.ts','lib/noise/compact-wire.ts','lib/noise/peer-protocol.ts']){
 const approved={"lib/noise/engine.ts": "dc2fabc7377dc59e5bd974b08ffe5f6d4b3c5fa8986d7ab1a5349cf4d7a91287", "lib/noise/peer-client.ts": "b7e30599fc923954a45412fff7fae504a3340b65f323399294e0f9fe918c67a2", "lib/noise/peer-protocol.ts": "d09a948e38a838aaf227321794520fda78dbb228c88bfd9a9e9fba4518258a1b"};
 if(p in approved){assert.equal(createHash('sha256').update(readFileSync(p)).digest('hex'),approved[p],p+' differs from approved lobby lifecycle revision');continue;}
 const baseline=execFileSync('git',['show','ce1ce1f:'+p]);assert.ok(baseline.equals(readFileSync(p)),p+' changed');
}
console.log('Preview project and next branch verified; approved friends-lobby crew-rule engine revision pinned; maps and gameplay networking unchanged; approved lobby lifecycle transport pinned.');
