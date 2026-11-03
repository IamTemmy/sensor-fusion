import test from 'node:test';
import assert from 'node:assert/strict';
import {rejoinLobby,seatUnavailable} from '../lib/noise/lobby-recovery.ts';
import {PeerRoom} from '../lib/noise/peer-client.ts';
import {create,add,command,view} from '../lib/noise/engine.ts';
import {HostAuthority} from '../lib/noise/peer-protocol.ts';
(globalThis as any).document={removeEventListener:()=>{}};
(globalThis as any).window={removeEventListener:()=>{}};
import {packet} from '../lib/noise/network.ts';
function guest(){const g=create('MKYR5X',1000);g.friendsLobby=true;add(g,'Host','host');const s=add(g,'Raven','guest');let lost=0,shown=0;const p=new PeerRoom({code:g.code,token:s.token!,view:view(g,s.id),input:()=>({}),onView:()=>shown++,onStatus:()=>{},onError:()=>{},onSeatLost:()=>lost++});return {g,s,p,counts:()=>({lost,shown})};}
test('returning guest rejoins the same lobby with the same name and a fresh seat',async()=>{const {g,s}=guest();command(g,s.id,{type:'leave'});const next=await rejoinLobby({code:g.code,name:s.name},async payload=>{assert.deepEqual(payload,{type:'join',peerMode:true,code:g.code,name:s.name});return add(g,String(payload.name),'fresh');});assert.equal(next.name,'Raven');assert.notEqual(next.id,s.id);});
for(const reason of ['This crew is full (4 thieves).','This job has started. Join the next one.','Crew not found or expired.'])
test('recovery failure can be shown without substituting a new room: '+reason,async()=>{await assert.rejects(()=>rejoinLobby({code:'MKYR5X',name:'Raven'},async()=>{throw Error(reason);}),new RegExp(reason.replace(/[.*+?^$()|[\]\\]/g,'\\$&')));});
test('missing-seat snapshot stops old transport and requests recovery exactly once',()=>{const {g,s,p,counts}=guest();command(g,s.id,{type:'leave'});(p as any).accept(packet(g,s.id),0);assert.equal(p.closed,true);assert.deepEqual(counts(),{lost:1,shown:0});(p as any).seatLost();assert.equal(counts().lost,1);});
test('authenticated 401 invokes recovery instead of retrying a broken seat',async()=>{const {p,counts}=guest();const oldFetch=globalThis.fetch;globalThis.fetch=async()=>Response.json({error:'Seat unavailable'},{status:401});try{await assert.rejects(()=>(p as any).request({bootstrap:true}),/You left the crew/);assert.equal(p.closed,true);assert.equal(counts().lost,1);}finally{globalThis.fetch=oldFetch;}});
test('seat unavailability is distinguished from temporary network failures',()=>{assert.equal(seatUnavailable({status:401}),true);assert.equal(seatUnavailable(Error('Seat unavailable')),true);assert.equal(seatUnavailable({status:503}),false);});
test('bfcache backgrounding does not explicitly leave the crew',()=>{const {p}=guest();(p as any).pageHide({persisted:true});assert.equal(p.closed,false);});

test('authenticated direct ping and acknowledgments refresh lobby presence; unauthenticated traffic does not',()=>{const {g,s,p}=guest();p.host=true;p.authority=new HostAuthority(g);const c:any={label:'inputs',readyState:'closed'};const link:any={pc:{},authenticated:false};(p as any).bind(link,s.id,c);const clock=Date.now;Date.now=()=>45000;try{c.onmessage({data:JSON.stringify({kind:'ping',at:1})});assert.equal(p.authority.game.seats.find(t=>t.id===s.id)!.lastSeen,1000);link.authenticated=true;for(const kind of ['ping','delta-ack','arena']){p.authority.game.seats.find(t=>t.id===s.id)!.lastSeen=1000;c.onmessage({data:JSON.stringify({kind,at:1})});assert.equal(p.authority.game.seats.find(t=>t.id===s.id)!.lastSeen,45000);}}finally{Date.now=clock;}});
