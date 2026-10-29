import {env} from 'cloudflare:workers';
import {hostLeaseExpired} from '../../../lib/noise/peer-policy';
import {create,add,command,advance,view,type Game} from '../../../lib/noise/engine';
import {applyPacket,packet} from '../../../lib/noise/network';
import {enablePeer,type PeerGame} from '../../../lib/noise/peer-protocol';
export const dynamic='force-dynamic';
const reply=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export async function POST(req:Request){try{
 if(req.headers.get('origin')&&req.headers.get('origin')!==new URL(req.url).origin)return reply({error:'Origin rejected'},403);
 const raw=await req.text();if(raw.length>8192)return reply({error:'Request too large'},413);const a=JSON.parse(raw);if(!a||typeof a.type!=='string')return reply({error:'Invalid action'},400);const now=Date.now();
 const response=(g:Game,id:string,token:string,retries=0)=>reply({token,retries,...((g as PeerGame).peer?{peerMode:true}:{}),...(a.protocol===2?packet(g,id,a.arenaKey):{view:Object.fromEntries(Object.entries(view(g,id)).filter(([k])=>k!=='peer'&&k!=='net'))})});
 if(a.type==='create'){
  for(let i=0;i<5;i++){const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';const code=Array.from(crypto.getRandomValues(new Uint8Array(6)),b=>chars[b%chars.length]).join('');const g=create(code,now,crypto.getRandomValues(new Uint32Array(1))[0]);const token=crypto.randomUUID();const s=add(g,String(a.name||'Rookie'),token);if(a.peerMode===true)enablePeer(g,now);const r=await env.DB!.prepare('INSERT OR IGNORE INTO rooms(code,state,revision,expires) VALUES(?,?,0,?)').bind(code,JSON.stringify(g),now+7200000).run();if(r.meta.changes)return response(g,s.id,token);}
  return reply({error:'Try creating the crew again.'},409);
 }
 const code=String(a.code||'').toUpperCase();if(!/^[A-Z2-9]{6}$/.test(code))return reply({error:'Enter a six-character crew code.'},400);
 for(let attempt=0;attempt<8;attempt++){
  const row=await env.DB!.prepare('SELECT state,revision,expires FROM rooms WHERE code=?').bind(code).first<{state:string;revision:number;expires:number}>();if(!row||row.expires<now)return reply({error:'Crew not found or expired.'},404);const g=JSON.parse(row.state) as Game;if(g.version!==4||!Array.isArray(g.noises))return reply({error:'That code belongs to an older game. Create a Velmont: After Hours crew.'},400);
  let s=g.seats.find(s=>!s.bot&&typeof a.token==='string'&&s.token===a.token),token=a.token;if(a.type!=='join'&&!s)return reply({error:'Seat unavailable. Join a new crew.'},401);
  if(a.type==='poll'&&g.phase!=='playing')return response(g,s!.id,token);
  if(!(g as PeerGame).peer)advance(g,Math.max(g.now,Date.now()));
  if(a.type==='join'){token=crypto.randomUUID();s=add(g,String(a.name||'Rookie'),token);}else if(!(g as PeerGame).peer)applyPacket(g,s!.id,a);else if(a.type!=='poll')return reply({error:'Reconnect to the host transport.'},409);
  g.revision++;const result=await env.DB!.prepare('UPDATE rooms SET state=?,revision=? WHERE code=? AND revision=?').bind(JSON.stringify(g),row.revision+1,code,row.revision).run();if(result.meta.changes)return response(g,s!.id,token,attempt);
  // Desynchronize cross-isolate writers rather than immediately colliding again.
  await new Promise(r=>setTimeout(r,8+Math.random()*24*(attempt+1))); 
 }return reply({error:'Room busy. Retrying…'},409);
 }catch(e){return reply({error:e instanceof Error?e.message:'Connection interrupted'},400);}}

/** Read-only saved-seat check: never advances or writes an online room. */
export async function GET(req:Request){try{
 const code=new URL(req.url).searchParams.get('crew')||'',token=req.headers.get('X-Crew-Token');
 if(!/^[A-Z2-9]{6}$/.test(code)||!token)return reply({available:false});
 const row=await env.DB!.prepare('SELECT state,expires FROM rooms WHERE code=?').bind(code).first<{state:string;expires:number}>();
 if(!row||row.expires<Date.now())return reply({available:false});
 const g=JSON.parse(row.state) as PeerGame;
 return reply({available:g.version===4&&g.phase!=='finished'&&!g.peer?.closed&&(!g.peer||!hostLeaseExpired(Date.now(),g.peer.heartbeat,!!(g as PeerGame&{hostAway?:boolean}).hostAway))&&g.seats.some(s=>!s.bot&&s.token===token)});
 }catch{return reply({available:false},503);}}
