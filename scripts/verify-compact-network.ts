import * as E from '../lib/noise/engine.ts';
import {flagshipArena} from '../lib/noise/flagship-arena.ts';
import {archiveArena} from '../lib/noise/archive-arena.ts';
import {packet} from '../lib/noise/network.ts';
import {CompactSender,CompactReceiver} from '../lib/noise/compact-wire.ts';
import {writeFileSync,mkdirSync} from 'node:fs';
import assert from 'node:assert/strict';
const rows:any[]=[];
for(const [museum,arena] of [['Velmont',flagshipArena],['Archive',archiveArena]] as const)for(const humans of [3,4])for(const delay of [200,400]){
 const g=E.create('COMPACT',0,1001);for(let n=0;n<4;n++)E.add(g,n===3&&humans===3?'Echo':'Human '+n,'token'+n,n===3&&humans===3);E.setup(g,(_,n)=>arena(n));for(const s of g.seats)E.command(g,s.id,{type:'ready'});
 const encoder=new CompactSender(),decoder=new CompactReceiver(),acks:{at:number;n:number}[]=[],sizes:number[]=[],raw:number[]=[];let bytes=0,keyBytes=0,decoded=0,reliable=0,heartbeatBytes=0;const encodeMs:number[]=[];
 for(let frame=0;frame<1800;frame++){
  for(const ack of acks.filter(a=>a.at===frame))encoder.acknowledge(ack.n);
  for(const [i,s] of g.seats.entries())if(!s.bot){s.safe=g.now+1000;const goal=g.loot[(Math.floor(frame/120)+i)%g.loot.length];const p=E.steer(s,goal,E.thiefWalls(g,s)),d=E.distance(s,p)||1;E.command(g,s.id,{type:'input',seq:s.lastSeq+1,dx:(p.x-s.x)/d,dy:(p.y-s.y)/d,aim:goal});}
  E.advance(g,g.now+50);const w=packet(g,'p2');raw.push(JSON.stringify(packet(g,'p2',w.arenaKey)).length);
  if(encoder.serial&&!encoder.ack)continue;
  if(frame%17===0)heartbeatBytes+=new TextEncoder().encode(JSON.stringify({code:g.code,token:'host-token',lease:'host-lease',game:g,signals:{},acks:[]})).length;const at=performance.now();const e=encoder.encode(w);encodeMs.push(performance.now()-at);if(e.keys){keyBytes+=new TextEncoder().encode(JSON.stringify(e.keys)).length;decoder.keys(JSON.parse(JSON.stringify(e.keys)));}
  const size=e.bytes+30;bytes+=size;if(e.frame.b)sizes.push(size);if(e.reliable)reliable++;
  if(e.reliable||frame%4!==0){const v=decoder.decode(JSON.parse(JSON.stringify(e.frame)));assert.ok(v,'Decode after packet loss');assert.equal(v.view.revision,w.view.revision);acks.push({at:frame+delay/50,n:e.frame.n});decoded++;}
 }
 encodeMs.sort((a,b)=>a-b);sizes.sort((a,b)=>a-b);raw.sort((a,b)=>a-b);const row={museum,humans,echo:4-humans,ackDelay:delay,loss:'25% of unreliable frames',median:sizes[Math.floor(sizes.length/2)],max:sizes.at(-1),oldMedian:raw[Math.floor(raw.length/2)],threeGuestUploadBytesPerSec:Math.ceil(((bytes+keyBytes)*3+heartbeatBytes)/90),encoderP95:encodeMs[Math.floor(encodeMs.length*.95)],reliableFrames:reliable,decoded};rows.push(row);console.log(row);assert.ok(row.median<=1100);assert.ok(row.max!<=3000);assert.ok(row.threeGuestUploadBytesPerSec<=80000);
}
mkdirSync('docs/playtests/multiplayer-compact',{recursive:true});writeFileSync('docs/playtests/multiplayer-compact/packet-sizes.json',JSON.stringify({method:'90s production engine, full geometry; scripted human path inputs, capture immunity only for continuous traffic stress. 20Hz, delayed acknowledgments and 25% unreliable loss. Three-guest application payload includes reliable dictionaries/baselines/events, includes host HTTP heartbeat at 850ms; excludes transport headers and signaling ICE negotiation.',rows},null,2)+'\n');
