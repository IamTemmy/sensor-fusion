import test from 'node:test';
import assert from 'node:assert/strict';
import {CompactSender,CompactReceiver} from '../lib/noise/compact-wire.ts';
import {RelayEncoder,RelayDecoder} from '../lib/noise/compact-relay.ts';
import {create,add,setup,command} from '../lib/noise/engine.ts';
import {packet} from '../lib/noise/network.ts';
const json=<T>(v:T):T=>JSON.parse(JSON.stringify(v));
function wire(){const g=create('COMPACT',0,1001);add(g,'Host','secret');add(g,'Guest','other');setup(g);command(g,g.host,{type:'ready'});return packet(g,'p2');}
const normalized=(w:any):any=>JSON.parse(JSON.stringify(w,(k,v)=>typeof v==='number'&&(k==='x'||k==='y')?Math.round(v):typeof v==='number'&&k==='angle'?Math.round(((v%(2*Math.PI)+2*Math.PI)%(2*Math.PI))*255/(2*Math.PI))*2*Math.PI/255:v));
test('compact roundtrip retains every public field, no tokens, deletion and literal marker strings',()=>{
 const s=new CompactSender(),r=new CompactReceiver(),w=wire();
 for(let i=0;i<8;i++){w.view.now+=50;w.view.seats[0].name=i%2?'{}':'[]';w.view.seats[0].x+=.33;if(i===3)w.view.noises=[];if(i===4)w.view.events=[];const e=s.encode(w);if(e.keys)assert.ok(r.keys(json(e.keys)));assert.deepEqual(r.decode(json(e.frame)),normalized(w));s.acknowledge(e.frame.n);assert.ok(!JSON.stringify(e).includes('secret'));}
});
test('loss and reordering reconstruct from acknowledged frame, not previous send',()=>{
 const s=new CompactSender(),r=new CompactReceiver(),w=wire();const a=s.encode(w);r.keys(json(a.keys!));r.decode(json(a.frame));s.acknowledge(a.frame.n);
 w.view.now+=50;const lost=s.encode(w);w.view.now+=50;const next=s.encode(w);if(next.keys)r.keys(json(next.keys));assert.deepEqual(r.decode(json(next.frame)),normalized(w));assert.equal(r.decode(lost.frame),undefined);
});
test('new stream rejects delayed packets from previous stream',()=>{
 const a=new CompactSender(),b=new CompactSender(),r=new CompactReceiver(),w=wire(),old=a.encode(w),fresh=b.encode(w);r.keys(old.keys!);r.decode(old.frame);r.keys(fresh.keys!);assert.ok(r.decode(fresh.frame));assert.equal(r.decode(old.frame),undefined);
});
test('HTTP compact recovery survives lost response, lost dictionary, and cold worker',()=>{
 let s=new RelayEncoder();const r=new RelayDecoder(),w=wire();assert.deepEqual(r.decode(json(s.encode('seat',w,r.known))),normalized(w));
 w.view.now+=50;(w.view as any).newField={value:123};s.encode('seat',w,r.known);w.view.now+=50;assert.deepEqual(r.decode(json(s.encode('seat',w,r.known))),normalized(w));
 s=new RelayEncoder();assert.deepEqual(r.decode(json(s.encode('seat',w,r.known))),normalized(w));
});

import {HostAuthority,type Envelope} from '../lib/noise/peer-protocol.ts';
import {OnlinePrediction} from '../lib/noise/online-client.ts';
import {unpack} from '../lib/noise/network.ts';
function lagFixture(){const g=create('LATENC',10000,3);add(g,'Host','h');add(g,'Guest','g');command(g,g.host,{type:'start'});for(const s of g.seats)command(g,s.id,{type:'ready'});g.walls=[];g.guards=[];g.sensors=[];g.seats[1].x=300;g.seats[1].y=450;return new HostAuthority(g);}
for(const lag of [200,400])test(`compact prediction with ${lag}ms round trip stops without RTT slide; 50 actions acknowledged`,t=>{
 const h=lagFixture();const sender=new CompactSender(),receiver=new CompactReceiver();let now=0,seq=0;const p=new OnlinePrediction(()=>now);p.accept(unpack(h.snapshot('p2')));
 const messages:{at:number;e:Envelope}[]=[],snaps:{at:number;p:ReturnType<HostAuthority['snapshot']>}[]=[];let released=0,maxOvershoot=0,maxPending=0;
 for(now=0;now<=8000;now+=10){
  const dir={x:now<1000?1:0,y:0};
  if(now%100===0&&now<5000)p.predict('drop');
  p.frame(10,dir,{x:400,y:300});
  if(now%50===0){const payload={type:'input',protocol:2,match:h.game.match,seq:++seq,dx:dir.x,dy:0,sneak:false,aim:{x:400,y:300},actions:p.actions()};p.recordMovement(payload);messages.push({at:now+lag/2,e:{id:String(seq),seat:'p2',token:'g',payload}});}
  for(const item of messages.filter(x=>x.at===now))h.input(item.e);
  if(now%40===0)h.tick();
  if(now%50===0)snaps.push({at:now+lag/2,p:structuredClone(h.snapshot('p2'))});
  for(const item of snaps.filter(x=>x.at===now)){const e=sender.encode(item.p);if(e.keys)receiver.keys(json(e.keys));const w=receiver.decode(json(e.frame))!;sender.acknowledge(e.frame.n);p.accept(unpack(w),w.ack,lag);}
  const x=p.positions().get('p2')!.x;if(now===1000)released=x;if(now>=1000&&now<=2000)maxOvershoot=Math.max(maxOvershoot,x-released);maxPending=Math.max(maxPending,p.pending.length);
 }
 t.diagnostic(JSON.stringify({rtt:lag,overshootPx:maxOvershoot,pendingMax:maxPending,pendingFinal:p.pending.length,ack:h.snapshot('p2').ack}));
 assert.ok(maxOvershoot<4,`overshoot ${maxOvershoot}`);assert.ok(maxPending<5,`pending max ${maxPending}`);assert.equal(h.snapshot('p2').ack,50);assert.equal(p.pending.length,0);
});
