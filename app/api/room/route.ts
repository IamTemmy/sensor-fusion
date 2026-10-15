import {env} from 'cloudflare:workers';
import {createRoom,addSeat,intent,project,tick,heartbeat,type Room} from '../../../lib/game/engine';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store'};
function response(data:any,status=200){return Response.json(data,{status,headers});}
async function load(code:string){return await env.DB!.prepare('SELECT state,revision,expires FROM rooms WHERE code=?').bind(code).first<{state:string;revision:number;expires:number}>();}
export async function POST(req:Request){try{
 if(req.headers.get('origin')&&req.headers.get('origin')!==new URL(req.url).origin)return response({error:'Origin rejected'},403);
 const raw=await req.text();if(raw.length>2048)return response({error:'Request too large'},413);
 let a:any;try{a=JSON.parse(raw);}catch{return response({error:'Invalid request'},400);}if(!a||typeof a!=='object'||Array.isArray(a)||typeof a.type!=='string')return response({error:'Choose a valid action'},400);const now=Date.now();
 if(a.type==='create'){
 await env.DB!.prepare('DELETE FROM rooms WHERE expires<?').bind(now).run();
 for(let attempt=0;attempt<5;attempt++){const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let code='';for(const b of crypto.getRandomValues(new Uint8Array(6)))code+=alphabet[b%alphabet.length];
 const r=createRoom(code,now);const token=crypto.randomUUID();const s=addSeat(r,String(a.name||''),token,now);
 const inserted=await env.DB!.prepare('INSERT OR IGNORE INTO rooms(code,state,revision,expires) VALUES(?,?,?,?)').bind(code,JSON.stringify(r),0,now+7200000).run();if(inserted.meta.changes)return response({token,view:project(r,s.id,now)});
 }return response({error:'Please try creating a room again.'},409);
 }
 const code=String(a.code||'').toUpperCase();if(!/^[A-Z2-9]{6}$/.test(code))return response({error:'Enter the six-character room code'},400);
 for(let attempt=0;attempt<6;attempt++){
 const row=await load(code);if(!row||row.expires<now)return response({error:'Room expired. Start a new session.'},404);
 const r:Room=JSON.parse(row.state);let s=r.seats.find(x=>x.token===a.token);let token=a.token;
 if(a.type==='join'){tick(r,now);token=crypto.randomUUID();s=addSeat(r,String(a.name||''),token,now);}else{if(!s)return response({error:'Seat expired. Rejoin from the lobby.'},401);if(now-s.last<120)return response({error:'One moment—try that again.'},429);intent(r,s.id,a,now);}
 r.revision=row.revision+1;const result=await env.DB!.prepare('UPDATE rooms SET state=?,revision=? WHERE code=? AND revision=?').bind(JSON.stringify(r),r.revision,code,row.revision).run();if(result.meta.changes)return response({token,view:project(r,s!.id,now)});
 }return response({error:'The room is busy. Try again.'},409);
 }catch(e){return response({error:e instanceof Error?e.message:'Action failed'},400);}}
export async function GET(req:Request){try{const u=new URL(req.url);const code=(u.searchParams.get('code')||'').toUpperCase();const token=req.headers.get('Authorization')?.replace(/^Bearer /,'');const now=Date.now();for(let attempt=0;attempt<6;attempt++){const row=await load(code);if(!row||row.expires<now)return response({error:'Room expired or not found.'},404);const r:Room=JSON.parse(row.state);const s=r.seats.find(x=>x.token===token);if(!s)return response({error:'Invalid seat token.'},401);const before=JSON.stringify(r);if(now-(s.lastSeen||0)>5000)heartbeat(r,s.id,now);tick(r,now);if(before===JSON.stringify(r))return response({view:project(r,s.id,now)});r.revision=row.revision+1;const result=await env.DB!.prepare('UPDATE rooms SET state=?,revision=? WHERE code=? AND revision=?').bind(JSON.stringify(r),r.revision,code,row.revision).run();if(result.meta.changes)return response({view:project(r,s.id,now)});}return response({error:'Reconnecting to the latest room state…'},409);}catch(e){return response({error:e instanceof Error?e.message:'Connection unavailable. Retrying…'},503);}}
