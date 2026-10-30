import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
import {hostLeaseExpired} from '../lib/noise/peer-policy.ts';
// Exercise the real HTTP handler with an isolated database and credential broker.
const source=readFileSync(new URL('../app/api/noise/peer/route.ts',import.meta.url),'utf8').replace(/^import .*;$/gm,'').replace('const relayEncoder=new RelayEncoder();','').replace(/export /g,'');
const compiled=ts.transpile(source,{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.None});
function handler(opts:{closed?:boolean;finished?:boolean;expired?:boolean;staleHost?:boolean;bot?:boolean}={}){
 let calls=0;
 const g:any={code:'ABC234',phase:opts.finished?'finished':'lobby',host:'p1',seats:[{id:'p2',token:'test-seat',bot:!!opts.bot}],peer:{closed:!!opts.closed,heartbeat:Date.now()-(opts.staleHost?60000:0),mail:[],acks:[],signals:{}}};
 const env={DB:{prepare:()=>({bind:()=>({first:async()=>({state:JSON.stringify(g),revision:0,expires:Date.now()+(opts.expired?-1000:60000)}),run:async()=>({meta:{changes:1}})})})}};
 const post=new Function('env','packet','endHost','mergeAdmissions','signalValid','validEnvelope','queueRelayInput','sessionIce','hostLeaseExpired','relayEncoder',compiled+'; return POST;')(env,()=>({}),()=>{g.phase='finished'},()=>{},()=>true,()=>true,()=>[],async()=>{calls++;return{iceServers:[{urls:'turn:example.test:80',username:'fixture',credential:'fixture'}]}},hostLeaseExpired,{});
 return{post,calls:()=>calls};
}
for(const [label,opts,token,status,allowed] of [
 ['active human seat',{},'test-seat',200,true],['missing token',{},undefined,401,false],['wrong token',{},'wrong',401,false],['bot seat',{bot:true},'test-seat',401,false],['closed room',{closed:true},'test-seat',200,false],['finished match',{finished:true},'test-seat',200,false],['expired room',{expired:true},'test-seat',404,false],['expired host lease',{staleHost:true},'test-seat',200,false]
] as const)test('ICE credentials: '+label,async()=>{const h=handler(opts);const r=await h.post(new Request('https://example.test/api/noise/peer',{method:'POST',body:JSON.stringify({code:'ABC234',token,bootstrap:true,refreshIce:true})}));const d=await r.json();assert.equal(r.status,status);assert.equal('iceServers' in d,allowed);assert.equal(h.calls(),allowed?1:0);assert.equal(r.headers.get('Cache-Control'),'no-store');});
