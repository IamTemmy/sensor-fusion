import test from 'node:test';
import assert from 'node:assert/strict';
import {create,add,command,advance,view,onlineStartReason,INVITE_FRIEND} from '../lib/noise/engine.ts';
import {HostAuthority,mergeAdmissions} from '../lib/noise/peer-protocol.ts';
function room(mode:'coop'|'duos'='coop'){const g=create('MKYR5X',1000);g.friendsLobby=true;const host=add(g,'Ghost','host'),guest=add(g,'Raven','guest');command(g,host.id,{type:'configure',crewMode:mode});command(g,host.id,mode==='coop'?{type:'bot'}:{type:'configure',rivalHelpers:true});return {g,host,guest};}
for(const mode of ['coop','duos'] as const){
 test(mode+': explicit departure strips helpers and blocks start',()=>{const {g,host,guest}=room(mode);command(g,guest.id,{type:'leave'});assert.deepEqual(g.seats.map(s=>s.id),[host.id]);assert.equal(onlineStartReason(g),INVITE_FRIEND);assert.throws(()=>command(g,host.id,{type:'start'}),/Invite/);assert.throws(()=>command(g,host.id,{type:'bot'}),/Invite/);});
 test(mode+': stale seat pruned after 15s, active host retained',()=>{const {g,host,guest}=room(mode);host.lastSeen=16001;advance(g,16001);assert.ok(!g.seats.some(s=>s.id===guest.id));assert.equal(g.seats.length,1);assert.equal(onlineStartReason(g),INVITE_FRIEND);});
 test(mode+': host removes human; guest cannot kick host',()=>{const {g,host,guest}=room(mode);assert.throws(()=>command(g,guest.id,{type:'remove',seatId:host.id}));command(g,host.id,{type:'remove',seatId:guest.id});assert.equal(g.seats.length,1);assert.throws(()=>command(g,host.id,{type:'remove',seatId:host.id}));});
}
test('authenticated leave passes through host transport and is not restored by admission merge',()=>{const {g,guest}=room();const authority=new HostAuthority(g);assert.equal(authority.input({id:'leave',seat:guest.id,token:'guest',payload:{type:'leave'}}),true);mergeAdmissions(g,authority.game);assert.equal(authority.game.seats.length,1);assert.ok(!view(authority.game,g.host).seats.some(s=>s.id===guest.id));});
test('server departure survives an older host snapshot; new admissions still merge',()=>{const {g,guest}=room(),old=structuredClone(g);command(g,guest.id,{type:'leave'});const third=add(g,'Fox','third');mergeAdmissions(g,old);assert.ok(!old.seats.some(s=>s.id===guest.id));assert.ok(old.seats.some(s=>s.id===third.id));});
test('active guests do not expire at the 15s boundary',()=>{const {g,host}=room();host.lastSeen=16000;advance(g,16000);assert.equal(g.seats.filter(s=>!s.bot).length,2);});
