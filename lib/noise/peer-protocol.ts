import {advance,type Game} from './engine.ts';
import {applyPacket,packet,type InputPacket} from './network.ts';
export type Envelope={id:string;seat:string;token:string;payload:Record<string,unknown>};
export type Signal={epoch:string;offer?:RTCSessionDescriptionInit;answer?:RTCSessionDescriptionInit;offerIce?:RTCIceCandidateInit[];answerIce?:RTCIceCandidateInit[]};
export type PeerMeta={version:1;heartbeat:number;closed:boolean;lease?:string;signals:Record<string,Signal>;mail:Envelope[];acks:string[]};
export type PeerGame=Game&{peer?:PeerMeta};
export function enablePeer(g:Game,now:number){(g as PeerGame).peer={version:1,heartbeat:now,closed:false,signals:{},mail:[],acks:[]};}
export function endHost(g:Game){g.phase='finished';g.finishReason='Host left. Job ended';g.finishedAt=g.now;g.seats.forEach(s=>{s.dx=s.dy=0;});}
export function validEnvelope(g:Game,e:Envelope){
 if(!e||typeof e.id!=='string'||e.id.length>100||!e.payload||typeof e.payload!=='object'||JSON.stringify(e).length>16000)return false;
 if(!g.seats.some(s=>!s.bot&&s.id===e.seat&&s.token===e.token))return false;
 const p=e.payload as InputPacket;if(!['leave','input','ready','start','configure','fill','preset','team','bot','remove','difficulty','replay','endJob'].includes(p.type))return false;
 if(p.type==='input'&&(!Number.isSafeInteger(p.seq)||![p.dx,p.dy,p.aim?.x,p.aim?.y].every(Number.isFinite)||Math.abs(p.dx)>2||Math.abs(p.dy)>2))return false;
 return true;
}
export class HostAuthority{
 lastError='';game:Game;seen=new Set<string>();
 constructor(g:Game){this.game=structuredClone(g);delete (this.game as PeerGame).peer;}
 presence(id:string,now=this.game.now){if(this.game.phase!=='lobby')return;const s=this.game.seats.find(s=>s.id===id&&!s.bot);if(s)s.lastSeen=Math.max(s.lastSeen,now);}
 input(e:Envelope){this.lastError='';if(!validEnvelope(this.game,e))return false;this.presence(e.seat);if(this.seen.has(e.id))return true;try{if((this.game as Game&{hostAway?:boolean}).hostAway&&e.payload.type==='input')return false;applyPacket(this.game,e.seat,e.payload);}catch(e){this.lastError=e instanceof Error?e.message:'That action is unavailable.';return false;}this.game.revision++;this.seen.add(e.id);if(this.seen.size>4096)this.seen.delete(this.seen.values().next().value!);return true;}
 tick(){advance(this.game,this.game.now+40);this.game.revision++;}
 snapshot(id:string,known?:string){return packet(this.game,id,known);}
}
export function directReady(open:boolean,lastState:number,now:number){return open&&now-lastState<2000;}
export function signalValid(s:unknown):s is Signal{const x=s as Signal;return !!x&&typeof x.epoch==='string'&&x.epoch.length<100&&[x.offer,x.answer].every(d=>!d||(typeof d.sdp==='string'&&d.sdp.length<24000&&['offer','answer'].includes(d.type)))&&[x.offerIce,x.answerIce].every(cs=>!cs||(Array.isArray(cs)&&cs.length<=48&&cs.every(c=>!!c&&typeof c.candidate==='string'&&c.candidate.length<=2000)));}
// D1 owns seat admission; a host snapshot must not erase a concurrent join or reuse its ID.
export function mergeAdmissions(stored:Game,next:Game){next.lobbyExitReasons={...next.lobbyExitReasons,...stored.lobbyExitReasons};next.lobbyExitTokens={...next.lobbyExitTokens,...stored.lobbyExitTokens};next.blockedLobbyDevices=[...new Set([...(stored.blockedLobbyDevices||[]),...(next.blockedLobbyDevices||[])])];next.lobbyDepartures=[...new Set([...(stored.lobbyDepartures||[]),...(next.lobbyDepartures||[])])];for(const h of stored.seats){if(next.lobbyExitReasons?.[h.id]==='removed'){if(h.deviceKey&&!next.blockedLobbyDevices.includes(h.deviceKey))next.blockedLobbyDevices.push(h.deviceKey);if(h.token)next.lobbyExitTokens[h.token]='removed';}}for(const h of stored.seats){if(h.id!==stored.host&&!next.seats.some(s=>s.id===h.id)&&!h.bot&&h.deviceKey&&next.blockedLobbyDevices.includes(h.deviceKey)){next.lobbyExitReasons[h.id]='removed';if(h.token)next.lobbyExitTokens[h.token]='removed';if(!next.lobbyDepartures.includes(h.id))next.lobbyDepartures.push(h.id);}}const departed=new Set(next.lobbyDepartures);const humans=stored.seats.filter(s=>!s.bot&&!departed.has(s.id));next.seats=next.seats.filter(s=>s.bot||humans.some(h=>h.id===s.id));for(const h of humans){const ns=next.seats.find(s=>s.id===h.id);if(ns){ns.token=h.token;ns.deviceKey=h.deviceKey;ns.bot=false;ns.lastSeen=Math.max(ns.lastSeen,h.lastSeen);}else next.seats.push(structuredClone(h));}next.serial=Math.max(next.serial,stored.serial);return next;}

/** Coalesce movement during relay stalls; retain one-shot commands and unacked actions. */
export function queueRelayInput(mail:Envelope[],incoming:Envelope){
 const movement=(e:Envelope)=>e.payload.type==='input'&&e.payload.protocol===2;
 if(!movement(incoming))return [...mail,incoming];
 const same=(e:Envelope)=>movement(e)&&e.seat===incoming.seat&&e.payload.match===incoming.payload.match;
 const group=[...mail.filter(same),incoming];
 const latest=group.reduce((a,b)=>Number(a.payload.seq)>Number(b.payload.seq)?a:b);
 const actions=new Map<number,InputPacket['actions'][number]>();
 for(const e of group)for(const a of (Array.isArray(e.payload.actions)?e.payload.actions:[]).slice(0,16))if(Number.isSafeInteger(a.id)&&!actions.has(a.id))actions.set(a.id,a);
 return [...mail.filter(e=>!same(e)),{...latest,payload:{...latest.payload,actions:[...actions.values()].sort((a,b)=>a.id-b.id).slice(0,16)}}];
}
