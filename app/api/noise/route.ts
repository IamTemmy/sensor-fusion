import {env} from 'cloudflare:workers';
import {create,add,command,advance,view,type Game} from '../../../lib/noise/engine';
export const dynamic='force-dynamic';
const reply=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export async function POST(req:Request){try{
 if(req.headers.get('origin')&&req.headers.get('origin')!==new URL(req.url).origin)return reply({error:'Origin rejected'},403);
 const raw=await req.text();if(raw.length>2048)return reply({error:'Request too large'},413);const a=JSON.parse(raw);if(!a||typeof a.type!=='string')return reply({error:'Invalid action'},400);const now=Date.now();
 if(a.type==='create'){
  for(let i=0;i<5;i++){const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';const code=Array.from(crypto.getRandomValues(new Uint8Array(6)),b=>chars[b%chars.length]).join('');const g=create(code,now,crypto.getRandomValues(new Uint32Array(1))[0]);const token=crypto.randomUUID();const s=add(g,String(a.name||'Rookie'),token);const r=await env.DB!.prepare('INSERT OR IGNORE INTO rooms(code,state,revision,expires) VALUES(?,?,0,?)').bind(code,JSON.stringify(g),now+7200000).run();if(r.meta.changes)return reply({token,view:view(g,s.id)});}
  return reply({error:'Try creating the crew again.'},409);
 }
 const code=String(a.code||'').toUpperCase();if(!/^[A-Z2-9]{6}$/.test(code))return reply({error:'Enter a six-character crew code.'},400);
 for(let attempt=0;attempt<8;attempt++){
  const row=await env.DB!.prepare('SELECT state,revision,expires FROM rooms WHERE code=?').bind(code).first<{state:string;revision:number;expires:number}>();if(!row||row.expires<now)return reply({error:'Crew not found or expired.'},404);const g=JSON.parse(row.state) as Game;if(g.version!==1||!Array.isArray(g.noises))return reply({error:'That code belongs to an older game. Create a Noise Thieves crew.'},400);
  let s=g.seats.find(s=>!s.bot&&typeof a.token==='string'&&s.token===a.token),token=a.token;if(a.type!=='join'&&!s)return reply({error:'Seat unavailable. Join a new crew.'},401);
  advance(g,now);
  if(a.type==='join'){token=crypto.randomUUID();s=add(g,String(a.name||'Rookie'),token);}else command(g,s!.id,a);
  g.revision=row.revision+1;const result=await env.DB!.prepare('UPDATE rooms SET state=?,revision=? WHERE code=? AND revision=?').bind(JSON.stringify(g),g.revision,code,row.revision).run();if(result.meta.changes)return reply({token,view:view(g,s!.id)});
 }return reply({error:'Room busy. Retrying…'},409);
 }catch(e){return reply({error:e instanceof Error?e.message:'Connection interrupted'},400);}}
