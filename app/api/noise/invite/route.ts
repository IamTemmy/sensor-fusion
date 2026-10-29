import {env} from 'cloudflare:workers';
import {hostLeaseExpired} from '../../../../lib/noise/peer-policy';
import type {PeerGame} from '../../../../lib/noise/peer-protocol';
export const dynamic='force-dynamic';
/** Read-only invite availability. Never simulate, join or mutate a room here. */
export async function GET(req:Request){
 const reply=(open:boolean)=>Response.json({open},{headers:{'Cache-Control':'no-store'}});
 try{const code=new URL(req.url).searchParams.get('crew')||'';if(!/^[A-Z2-9]{6}$/.test(code))return reply(false);
 const row=await env.DB!.prepare('SELECT state,expires FROM rooms WHERE code=?').bind(code).first<{state:string;expires:number}>();if(!row||row.expires<Date.now())return reply(false);
 const g=JSON.parse(row.state) as PeerGame;return reply(g.version===4&&g.phase==='lobby'&&g.seats.length<6&&!g.peer?.closed&&(!g.peer||!hostLeaseExpired(Date.now(),g.peer.heartbeat,!!(g as PeerGame&{hostAway?:boolean}).hostAway)));
 }catch{return reply(false);}
}
