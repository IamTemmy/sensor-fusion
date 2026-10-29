import test from 'node:test';
import assert from 'node:assert/strict';
import {create,add,command,view} from '../lib/noise/engine.ts';
import {HostAuthority,queueRelayInput,type Envelope} from '../lib/noise/peer-protocol.ts';
import {PeerRoom} from '../lib/noise/peer-client.ts';
import {OnlinePrediction} from '../lib/noise/online-client.ts';
const channel=(label:string)=>({label,readyState:'open',bufferedAmount:0,sent:[] as any[],send(x:string){this.sent.push(JSON.parse(x));},close(){},onmessage:null as any});
function fixture(){const g=create('LAGFIX',1000,4);add(g,'Host','host');add(g,'Guest','guest');command(g,g.host,{type:'start'});for(const s of g.seats)command(g,s.id,{type:'ready'});return new HostAuthority(g);}
const input=(h:HostAuthority,seq:number,dx=1,actions:any[]=[]):Envelope=>({id:'i'+seq,seat:'p2',token:'guest',payload:{type:'input',protocol:2,match:h.game.match,seq,dx,dy:0,aim:{x:400,y:300},actions}});
test('relay stall keeps newest direction, preserves commands and contiguous actions',()=>{
 const h=fixture(),ready:Envelope={id:'ready',seat:'p2',token:'guest',payload:{type:'ready'}};let mail=[ready];
 for(let i=1;i<=100;i++)mail=queueRelayInput(mail,input(h,i,i===100?0:1,i===1?[{id:1,action:'drop'}]:i===2?[{id:2,action:'grab'}]:[]));
 assert.equal(mail.length,2);assert.equal(mail[0],ready);assert.equal(mail[1].payload.dx,0);assert.deepEqual(mail[1].payload.actions.map((a:any)=>a.id),[1,2]);
 mail=queueRelayInput(mail,input(h,50,-1));assert.equal(mail[1].payload.seq,100);assert.equal(mail[1].payload.dx,0);
 h.input(mail[1]);assert.equal(h.game.seats[1].dx,0);assert.equal(h.snapshot('p2').ack,2);
});
test('unreliable input rejects unauthenticated senders and old directions, without losing action retry',()=>{
 const h=fixture(),p=new PeerRoom({code:h.game.code,token:'host',view:view(h.game,'p1'),input:()=>({}),onView:()=>{},onStatus:()=>{},onError:()=>{}});p.authority=h;
 const state=channel('state'),link:any={authenticated:false,pc:{close(){}},started:0,last:0};(p as any).bind(link,'p2',state);
 const send=(e:Envelope)=>state.onmessage({data:JSON.stringify({kind:'input',message:e})});send(input(h,1));assert.equal(h.seen.size,0);
 link.authenticated=true;send(input(h,3,0,[{id:1,action:'drop'}]));send(input(h,2,-1,[{id:1,action:'drop'}]));assert.equal(h.game.seats[1].dx,0);assert.equal(h.snapshot('p2').ack,1);
 send({...input(h,4),payload:{type:'bot'}});assert.equal(h.game.seats.length,2);assert.equal(state.sent.length,0);
});
test('guest movement bypasses blocked reliable commands and drops congested state sends',()=>{
 const h=fixture(),v=view(h.game,'p2'),p=new PeerRoom({code:v.code,token:'guest',view:v,input:()=>input(h,1).payload,onView:()=>{},onStatus:()=>{},onError:()=>{}});
 const state=channel('state'),reliable=channel('inputs');reliable.bufferedAmount=70000;
 const link:any={authenticated:true,state,input:reliable,pc:{},started:performance.now(),last:performance.now()};p.links.set('p1',link);p.lastStats=performance.now();p.lastPing=performance.now();p.sendAt=-1000;(p as any).step();
 assert.equal(state.sent[0].message.payload.type,'input');assert.equal(reliable.sent.length,0);
 state.bufferedAmount=9000;p.sendAt=-1000;(p as any).step();assert.equal(state.sent.length,1);
});
test('duplicate snapshots cannot repeatedly rewind predicted movement',()=>{
 const h=fixture(),p=new OnlinePrediction(),v=view(h.game,'p2');p.accept(v);p.frame(40,{x:1,y:0},{x:400,y:300});const before=p.game!.now;
 assert.equal(p.accept(v),false);assert.equal(p.game!.now,before);
});
