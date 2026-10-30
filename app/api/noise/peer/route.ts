import {RelayEncoder} from '../../../../lib/noise/compact-relay';
const relayEncoder=new RelayEncoder();
import {env} from 'cloudflare:workers';
import {packet} from '../../../../lib/noise/network';
import {endHost,mergeAdmissions,signalValid,validEnvelope,queueRelayInput,type PeerGame,type Envelope} from '../../../../lib/noise/peer-protocol';
import {sessionIce} from '../../../../lib/noise/turn-service';
import {hostLeaseExpired} from '../../../../lib/noise/peer-policy';
export const dynamic='force-dynamic';
const reply=(x:unknown,status=200)=>Response.json(x,{status,headers:{'Cache-Control':'no-store'}});
export async function POST(req:Request){try{
 if(req.headers.get('origin')&&req.headers.get('origin')!==new URL(req.url).origin)return reply({error:'Origin rejected'},403);
 const raw=await req.text();if(raw.length>350000)return reply({error:'Message too large'},413);const a=JSON.parse(raw),now=Date.now();
 if(!/^[A-Z2-9]{6}$/.test(a.code||''))return reply({error:'Invalid room'},400);
 for(let retry=0;retry<8;retry++){
 const row=await env.DB!.prepare('SELECT state,revision,expires FROM rooms WHERE code=?').bind(a.code).first<{state:string;revision:number;expires:number}>();if(!row||row.expires<now)return reply({error:'Crew expired'},404);
 let g=JSON.parse(row.state) as PeerGame;const original=JSON.stringify(g);const p=g.peer,s=g.seats.find(s=>!s.bot&&s.token===a.token);if(!p||!s)return reply({error:'Seat unavailable'},401);const host=s.id===g.host;
 if(p.closed||hostLeaseExpired(now,p.heartbeat,!!(g as PeerGame&{hostAway?:boolean}).hostAway)){p.closed=true;endHost(g);}
 if(host&&!p.closed){
  if(typeof a.lease!=='string'||a.lease.length>80)return reply({error:'Host lease required'},400);
  if(p.lease&&p.lease!==a.lease)return reply({error:'This host is already open in another tab.'},409);p.lease=a.lease;p.heartbeat=now;
  if(typeof a.visibilityAway==='boolean'){(g as PeerGame&{hostAway?:boolean}).hostAway=a.visibilityAway;g.revision++;}
  if(a.close){p.closed=true;endHost(g);}
  else if(a.game){
   if(a.game.code!==g.code||a.game.version!==4||a.game.host!==g.host||!Array.isArray(a.game.seats)||a.game.seats.length>6)return reply({error:'Invalid host snapshot'},400);
   const next=a.game as PeerGame;
   if(next.revision>=g.revision){mergeAdmissions(g,next);next.peer=p;g=next;}
  }
  const ack=new Set(Array.isArray(a.acks)?a.acks.slice(0,256):[]);p.mail=p.mail.filter(e=>!ack.has(e.id));p.acks=[...p.acks,...ack].slice(-512) as string[];
  for(const [id,sig] of Object.entries(a.signals||{})){if(id!==s.id&&g.seats.some(s=>s.id===id&&!s.bot)&&signalValid(sig)){const old=p.signals[id];p.signals[id]=old?.epoch===sig.epoch?{...old,...sig}:sig;}}
 }else if(!host&&!p.closed){
  if(a.signal){if(!signalValid(a.signal)||a.signal.offer||a.signal.offerIce)return reply({error:'Invalid answer'},400);const old=p.signals[s.id];if(old?.epoch===a.signal.epoch)p.signals[s.id]={...old,answer:a.signal.answer,answerIce:a.signal.answerIce};}
  for(const e of (Array.isArray(a.messages)?a.messages:[]).slice(0,20) as Envelope[]){if(e.seat!==s.id||!validEnvelope(g,e))return reply({error:'Invalid seat input'},400);if(!p.acks.includes(e.id)&&!p.mail.some(x=>x.id===e.id)){const mail=queueRelayInput(p.mail,e);if(mail.length>256)return reply({error:'Host mailbox busy'},429);p.mail=mail;}}
 }
 if(JSON.stringify(g)!==original){const result=await env.DB!.prepare('UPDATE rooms SET state=?,revision=? WHERE code=? AND revision=?').bind(JSON.stringify(g),row.revision+1,a.code,row.revision).run();if(!result.meta.changes)continue;}
 return reply({...(!p.closed&&g.phase!=='finished'&&(a.bootstrap||a.refreshIce)?await sessionIce(env as unknown as Record<string,unknown>,g.code+':'+s.id):{}),closed:p.closed,...(host||p.closed||!a.compactRelay?packet(g,s.id,a.arenaKey):a.snapshot===false?{}:{compact:relayEncoder.encode(g.code+':'+s.id,packet(g,s.id),a.relayKnown)}),...(host?{game:a.bootstrap?g:undefined,humans:g.seats.filter(s=>!s.bot),serial:g.serial,signals:p.signals,mail:p.mail}:{signal:p.signals[s.id],received:p.acks})});
 }return reply({error:'Room busy'},409);
 }catch(e){return reply({error:e instanceof Error?e.message:'Connection interrupted'},400);}}
