import test from 'node:test';import assert from 'node:assert/strict';
import {create,add,command,view} from '../lib/noise/engine.ts';
import {HostAuthority,type Envelope} from '../lib/noise/peer-protocol.ts';
import {OnlinePrediction} from '../lib/noise/online-client.ts';
import {unpack} from '../lib/noise/network.ts';
function fixture(){const g=create('LATENC',10000,3);add(g,'Host','h');add(g,'Guest','g');command(g,g.host,{type:'start'});for(const s of g.seats)command(g,s.id,{type:'ready'});g.walls=[];g.guards=[];g.sensors=[];g.seats[1].x=300;g.seats[1].y=450;return new HostAuthority(g);}
for(const lag of [200,400])test(`prediction with ${lag}ms round trip stops without RTT slide; 50 actions acknowledged`,t=>{
 const h=fixture();let now=0,seq=0;const p=new OnlinePrediction(()=>now);p.accept(unpack(h.snapshot('p2')));
 const messages:{at:number;e:Envelope}[]=[],snaps:{at:number;p:ReturnType<HostAuthority['snapshot']>}[]=[];let released=0,maxOvershoot=0,maxPending=0;
 for(now=0;now<=8000;now+=10){
  const dir={x:now<1000?1:0,y:0};
  if(now%100===0&&now<5000)p.predict('drop');
  p.frame(10,dir,{x:400,y:300});
  if(now%50===0){const payload={type:'input',protocol:2,match:h.game.match,seq:++seq,dx:dir.x,dy:0,sneak:false,aim:{x:400,y:300},actions:p.actions()};p.recordMovement(payload);messages.push({at:now+lag/2,e:{id:String(seq),seat:'p2',token:'g',payload}});}
  for(const item of messages.filter(x=>x.at===now))h.input(item.e);
  if(now%40===0)h.tick();
  if(now%50===0)snaps.push({at:now+lag/2,p:structuredClone(h.snapshot('p2'))});
  for(const item of snaps.filter(x=>x.at===now))p.accept(unpack(item.p),item.p.ack,lag);
  const x=p.positions().get('p2')!.x;if(now===1000)released=x;if(now>=1000&&now<=2000)maxOvershoot=Math.max(maxOvershoot,x-released);maxPending=Math.max(maxPending,p.pending.length);
 }
 t.diagnostic(JSON.stringify({rtt:lag,overshootPx:maxOvershoot,pendingMax:maxPending,pendingFinal:p.pending.length,ack:h.snapshot('p2').ack}));
 assert.ok(maxOvershoot<4,`overshoot ${maxOvershoot}`);assert.ok(maxPending<5,`pending max ${maxPending}`);assert.equal(h.snapshot('p2').ack,50);assert.equal(p.pending.length,0);
});
test('remote humans and guards interpolate without extrapolating during a gap',()=>{let now=0;const h=fixture(),p=new OnlinePrediction(()=>now);p.accept(view(h.game,'p2'));now=100;h.game.seats[0].x+=10;h.game.revision++;p.accept(view(h.game,'p2'));now=150;assert.equal(p.positions().get('p1')!.x,h.game.seats[0].x-5);now=900;assert.equal(p.positions().get('p1')!.x,h.game.seats[0].x);});

import {PeerRoom} from '../lib/noise/peer-client.ts';
test('50 actions through authenticated peer state messages carry per-seat ack and prune prediction',()=>{
 const h=fixture(),p=new OnlinePrediction();p.accept(unpack(h.snapshot('p2')));
 const room=new PeerRoom({code:h.game.code,token:'h',view:view(h.game,'p1'),input:()=>({}),onView:()=>{},onStatus:()=>{},onError:()=>{}});room.authority=h;
 const state:any={label:'state',readyState:'open',bufferedAmount:0,send(){},close(){}};
 (room as any).bind({authenticated:true,pc:{close(){}},last:0},'p2',state);
 for(let i=1;i<=50;i++){p.predict('drop');state.onmessage({data:JSON.stringify({kind:'input',message:{id:'tap'+i,seat:'p2',token:'g',payload:{type:'input',protocol:2,match:h.game.match,seq:i,dx:0,dy:0,aim:{x:400,y:300},actions:p.actions()}}})});const snap=h.snapshot('p2');assert.equal(snap.ack,i);p.accept(unpack(snap),snap.ack);assert.equal(p.pending.length,0);assert.equal(h.snapshot('p1').ack,0);}
});
test('redundant inputs cannot change another match or resurrect a stale direction',()=>{const h=fixture();h.input({id:'redundant',seat:'p2',token:'g',payload:{type:'input',protocol:2,match:h.game.match,seq:3,dx:0,dy:0,aim:{x:400,y:300},previous:[{seq:1,match:h.game.match,dx:1,dy:0,aim:{x:400,y:300}},{seq:2,match:h.game.match,dx:-1,dy:0,aim:{x:400,y:300}}],actions:[]}});assert.equal(h.game.seats[1].lastSeq,3);assert.equal(h.game.seats[1].dx,0);});
