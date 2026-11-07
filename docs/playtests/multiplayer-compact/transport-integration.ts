import {mockLink,mockChannel} from '../../../tests/helpers/peer-mocks.ts';
import assert from 'node:assert/strict';
import {create,add,setup,command,view} from '../../../lib/noise/engine.ts';
import {HostAuthority} from '../../../lib/noise/peer-protocol.ts';
import {PeerRoom} from '../../../lib/noise/peer-client.ts';
const g=create('WIRETEST',0,1001);add(g,'Host','h');for(let i=0;i<3;i++)add(g,'Guest'+i,'g'+i);setup(g);for(const s of g.seats)command(g,s.id,{type:'ready'});
const authority=new HostAuthority(g),accepted=new Map<string,number>();
const options=(id:string,token:string)=>({code:g.code,token,view:view(g,id),input:()=>({type:'input',protocol:2,match:g.match,seq:1,dx:0,dy:0,aim:{x:480,y:300},actions:[]}),onView:(v:ReturnType<typeof view>)=>accepted.set(id,v.revision),onError:(e:string)=>{throw Error(e);},onStatus:()=>{}});
const host=new PeerRoom(options(g.host,'h'));host.authority=authority;host.lastStats=performance.now();
for(let i=0;i<3;i++){
 const id='p'+(i+2),guest=new PeerRoom(options(id,'g'+i));guest.lastStats=performance.now();const h=mockLink({pc:{},authenticated:false,last:performance.now(),started:performance.now()}),c=mockLink({pc:{},authenticated:false,last:performance.now(),started:performance.now()});host.links.set(id,h);guest.links.set(g.host,c);
 for(const label of ['inputs','state']){const a=mockChannel({label,readyState:'open',bufferedAmount:0}),b=mockChannel({label,readyState:'open',bufferedAmount:0});Object.assign(a,{send:(data:string)=>b.onmessage({data})});Object.assign(b,{send:(data:string)=>a.onmessage({data})});host['bind'](h,id,a);guest['bind'](c,g.host,b);if(label==='inputs')b.onopen();}
 assert.ok(h.compact,'negotiated compact');assert.ok(c.authenticated);
 for(let tick=0;tick<30;tick++){authority.tick();host['sendSnapshot'](id,h);assert.equal(accepted.get(id),authority.game.revision);assert.equal(h.compact.ack,h.compact.serial);}
 assert.ok(guest.direct());
}
console.log('PASS: three authenticated compact guests receive current revisions and acknowledge every frame through real PeerRoom channel handlers. In-memory channels; not an ICE/NAT test.');
