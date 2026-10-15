import {env} from 'cloudflare:workers';
import {createRoom,addSeat,intent,project,tick,type Room} from '../../../lib/game/engine';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store'};
function response(data:any,status=200){return Response.json(data,{status,headers});}
async function load(code:string){return await env.DB!.prepare('SELECT state,revision,expires FROM rooms WHERE code=?').bind(code).first<{state:string;revision:number;expires:number}>();}
export async function POST(req:Request){try{
 if(req.headers.get('origin')&&req.headers.get('origin')!==new URL(req.url).origin)return response({error:'Origin rejected'},403);
 const raw=await req.text();if(raw.length>2048)return response({error:'Request too large'},413);
 const a=JSON.parse(raw);const now=Date.now();
 if(a.type==='create'){
 const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let code='';const bytes=crypto.getRandomValues(new Uint8Array(6));for(const b of bytes)code+=alphabet[b%alphabet.length];
 const r=createRoom(code,now);const token=crypto.randomUUID();const s=addSeat(r,String(a.name||''),token,now);
 await env.DB!.prepare('INSERT INTO rooms(code,state,revision,expires) VALUES(?,?,?,?)').bind(code,JSON.stringify(r),0,now+7200000).run();return response({token,view:project(r,s.id,now)});
 }
 const code=String(a.code||'').toUpperCase();for(let attempt=0;attempt<5;attempt++){
 const row=await load(code);if(!row||row.expires<now)return response({error:'Room not found or expired. Create a new room.'},404);
 const r:Room=JSON.parse(row.state);tick(r,now);let s=r.seats.find(x=>x.token===a.token);let token=a.token;
 if(a.type==='join'){token=crypto.randomUUID();s=addSeat(r,String(a.name||''),token,now);}else{if(!s)return response({error:'Seat expired. Rejoin from the lobby.'},401);if(now-s.last<150)return response({error:'Please wait a moment before another action.'},429);intent(r,s.id,a,now);}
 r.revision=row.revision+1;const result=await env.DB!.prepare('UPDATE rooms SET state=?,revision=? WHERE code=? AND revision=?').bind(JSON.stringify(r),r.revision,code,row.revision).run();if(result.meta.changes)return response({token,view:project(r,s!.id,now)});
 }return response({error:'Room is busy. Try again.'},409);
 }catch(e){return response({error:e instanceof Error?e.message:'Action failed'},400);}}
export async function GET(req:Request){try{const u=new URL(req.url);const code=u.searchParams.get('code')||'';const token=req.headers.get('Authorization')?.replace(/^Bearer /,'');const now=Date.now();const row=await load(code);if(!row||row.expires<now)return response({error:'Room expired or not found.'},404);const r:Room=JSON.parse(row.state);const s=r.seats.find(x=>x.token===token);if(!s)return response({error:'Invalid seat token.'},401);const phase=r.phase;tick(r,now);if(phase!==r.phase){r.revision=row.revision+1;await env.DB!.prepare('UPDATE rooms SET state=?,revision=? WHERE code=? AND revision=?').bind(JSON.stringify(r),r.revision,code,row.revision).run();}return response({view:project(r,s.id,now)});}catch{return response({error:'Connection unavailable. Retrying…'},503);}}
