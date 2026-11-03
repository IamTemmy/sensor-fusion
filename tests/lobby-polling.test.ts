import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdirSync,unlinkSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import {create,add} from '../lib/noise/engine.ts';
import {enablePeer} from '../lib/noise/peer-protocol.ts';
const require=createRequire(import.meta.url);
const {build}=require(require.resolve('esbuild',{paths:['node_modules/.pnpm/node_modules']}));
const cache=process.cwd()+'/node_modules/.cache/lobby-poll-routes.mjs';mkdirSync(process.cwd()+'/node_modules/.cache',{recursive:true});
let row:any,writes=0;
(globalThis as any).__lobbyTestEnv={DB:{prepare:(sql:string)=>({bind:(...args:any[])=>({
 first:async()=>structuredClone(row),
 run:async()=>{if(sql.startsWith('UPDATE')){if(args[3]!==row.revision)return {meta:{changes:0}};row={...row,state:args[0],revision:args[1]};writes++;return {meta:{changes:1}};}throw Error(sql);}
})})}};
await build({stdin:{contents:"export {POST as roomPost} from './app/api/noise/route';export {POST as peerPost} from './app/api/noise/peer/route';",resolveDir:process.cwd()},outfile:cache,bundle:true,platform:'node',format:'esm',plugins:[{name:'test-cloudflare',setup(b:any){b.onResolve({filter:/^cloudflare:workers$/},()=>({path:'env',namespace:'test'}));b.onLoad({filter:/.*/,namespace:'test'},()=>({contents:'export const env=globalThis.__lobbyTestEnv;',loader:'js'}));}}]});
const {roomPost,peerPost}=await import(pathToFileURL(cache).href);unlinkSync(cache);
function room(peer:boolean,phase='lobby'){const g=create('MKYR5X',1000);g.friendsLobby=true;for(let i=0;i<4;i++)add(g,'Guest '+i,'token'+i);if(peer)enablePeer(g,1000);(g as any).phase=phase;row={state:JSON.stringify(g),revision:0,expires:Number.MAX_SAFE_INTEGER};writes=0;return g;}
const req=(body:unknown)=>new Request('https://example.com/api/noise',{method:'POST',body:JSON.stringify(body)});
for(const phase of ['lobby','finished'])test('four peer-mode clients '+phase+' polls remain read-only',async()=>{room(true,phase);for(let i=0;i<10;i++){const responses=await Promise.all([0,1,2,3].map(n=>roomPost(req({type:'poll',code:'MKYR5X',token:'token'+n}))));assert.ok(responses.every(r=>r.status===200));}assert.equal(writes,0);});
test('four legacy clients batch lobby heartbeats and avoid Room busy',async()=>{room(false);const clock=Date.now;Date.now=()=>7000;try{const responses=await Promise.all([0,1,2,3].map(n=>roomPost(req({type:'poll',code:'MKYR5X',token:'token'+n}))));assert.ok(responses.every(r=>r.status===200));assert.equal(writes,4);const before=writes;for(let i=0;i<10;i++)await Promise.all([0,1,2,3].map(n=>roomPost(req({type:'poll',code:'MKYR5X',token:'token'+n}))));assert.equal(writes,before);}finally{Date.now=clock;}});
test('four peer clients sustain lobby traffic without Room busy responses',async()=>{const g=room(true);(JSON.parse(row.state).peer);const clock=Date.now;let now=1000;Date.now=()=>now;try{for(let i=0;i<80;i++){now+=500;const responses=await Promise.all([0,1,2,3].map(n=>peerPost(req({code:g.code,token:'token'+n,lease:'host-test',snapshot:false,compactRelay:true}))));for(const r of responses)assert.equal(r.status,200,JSON.stringify(await r.json()));}assert.ok(writes<140,'Guest reads should not write every poll; writes='+writes);}finally{Date.now=clock;}});
