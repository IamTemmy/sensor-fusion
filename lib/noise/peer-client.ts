import {type Game,type View} from './engine.ts';
import {arenaKey,unpack,type Wire} from './network.ts';
import {HostAuthority,endHost,directReady,type Envelope,type Signal} from './peer-protocol.ts';
type Link={pc:RTCPeerConnection;input?:RTCDataChannel;state?:RTCDataChannel;epoch:string;known?:string;authenticated:boolean;last:number;started:number;localIce:RTCIceCandidateInit[];remoteIce:Set<string>};
type Options={code:string;token:string;view:View;input:()=>Record<string,any>;onView:(v:View,ack:number,rtt:number)=>void;onStatus:(mode:string,ping:number,modes:Record<string,string>)=>void;onError:(s:string)=>void};
const uniqueId=()=>Array.from(crypto.getRandomValues(new Uint8Array(16)),x=>x.toString(16).padStart(2,'0')).join('');
const rtcConfig={iceServers:[{urls:['stun:stun.l.google.com:19302','stun:stun1.l.google.com:19302']}]};
// Candidates are bundled in SDP, avoiding one D1 write per trickled candidate.
async function gathered(pc:RTCPeerConnection){if(pc.iceGatheringState==='complete')return;await new Promise<void>(resolve=>{const done=()=>{clearTimeout(timer);pc.removeEventListener('icegatheringstatechange',check);resolve();};const check=()=>{if(pc.iceGatheringState==='complete')done();};const timer=setTimeout(done,2200);pc.addEventListener('icegatheringstatechange',check);});}
export class PeerRoom{
 options:Options;host:boolean;authority?:HostAuthority;links=new Map<string,Link>();lease=uniqueId();closed=false;timer?:ReturnType<typeof setInterval>;syncTimer?:ReturnType<typeof setTimeout>;base:View;signals:Record<string,Signal>={};acks:string[]=[];pending=new Map<string,Envelope>();commandQueue=new Map<string,Envelope>();latest?:Envelope;counter=0;failures=0;lastHttp=0;tickAt=0;sendAt=0;ping=0;lastState=0;lastPing=0;lastRetry=0;mode='Relay';booted=false;forceRelay=false;stats={snapshots:0,started:performance.now(),latencies:[] as number[],conflicts:0};
 constructor(options:Options){this.options=options;this.base=options.view;this.host=this.base.host===this.base.you;}
 async start(){await this.sync(true);if(this.closed)return;this.timer=setInterval(()=>this.step(),10);this.tickAt=performance.now();this.schedule();window.addEventListener('pagehide',this.pageHide);}
 private pageHide=()=>this.stop(true);
 private async request(body:Record<string,unknown>){const start=performance.now();const r=await fetch('/api/noise/peer',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code:this.options.code,token:this.options.token,arenaKey:arenaKey(this.base),lease:this.lease,...body}),signal:AbortSignal.timeout(8000)});let data:any;try{data=await r.json();}catch{throw Error('Relay interrupted. Retrying…');}if(!r.ok){if(r.status===409)this.stats.conflicts++;throw Error(data.error||'Relay interrupted');}return{data,rtt:performance.now()-start};}
 private schedule(){if(this.closed)return;this.syncTimer=setTimeout(async()=>{try{await this.sync();if(this.failures)this.options.onError('');this.failures=0;}catch(e){this.failures++;this.options.onError(String((e as Error).message));}this.schedule();},this.failures?Math.min(2000,250*this.failures):!this.host&&this.direct()?1000:this.host&&[...this.links.values()].every(l=>l.authenticated&&l.state?.readyState==='open'&&performance.now()-l.last<2000)?850:performance.now()-this.stats.started>8000?0:Math.max(0,300-this.lastHttp));}
 private async sync(bootstrap=false){
 const isDirect=this.direct();const messages=isDirect?[]:[...this.commandQueue.values(),...(this.latest?[this.latest]:[])];
 const ack=this.acks.slice();const {data,rtt}=await this.request(this.host?{bootstrap,game:this.authority?.game,signals:this.signals,acks:ack}:{signal:this.signals[this.base.you],messages});this.lastHttp=rtt;if(this.closed)return;
 if(data.closed){this.accept(data,rtt,true);this.options.onError('Host left. Job ended');this.stop(false);return;}
 if(this.host){
  if(!this.authority&&data.game)this.authority=new HostAuthority(data.game as Game);
  const authority=this.authority;if(!authority)throw Error('Host state unavailable');
  authority.game.serial=Math.max(authority.game.serial,data.serial||0);
  for(const s of data.humans||[])if(!authority.game.seats.some(x=>x.id===s.id))authority.game.seats.push(s);
  this.acks=this.acks.filter(id=>!ack.includes(id));
  for(const e of data.mail||[]){authority.input(e);this.acks.push(e.id);}
  for(const s of authority.game.seats.filter(s=>!s.bot&&s.id!==authority.game.host)){
   const link=this.links.get(s.id);if(!link||(!link.authenticated&&performance.now()-link.started>10000)||link.pc.connectionState==='failed'||performance.now()-link.last>10000)void this.offer(s.id);
   const sig=data.signals?.[s.id];if(link===this.links.get(s.id)&&link&&sig?.epoch===link.epoch&&sig.answer&&!link.pc.remoteDescription)try{await link.pc.setRemoteDescription(sig.answer);}catch{}
   if(link&&sig?.epoch===link.epoch)await this.addIce(link,sig.answerIce);
  }
 }else{
  for(const id of data.received||[])this.commandQueue.delete(id);
  if(!this.direct()){this.ping=rtt;this.stats.latencies.push(rtt);this.accept(data,rtt);}
  const sig=data.signal as Signal|undefined;const link=this.links.get(this.base.host);
  if(sig?.offer&&(!link||link.epoch!==sig.epoch))void this.answer(sig);else if(link&&sig?.epoch===link.epoch)await this.addIce(link,sig.offerIce);
 }
 this.booted=true;
 }
 private newLink(id:string,epoch:string){this.links.get(id)?.pc.close();const pc=new RTCPeerConnection(rtcConfig),link:Link={pc,epoch,authenticated:false,last:performance.now(),started:performance.now(),localIce:[],remoteIce:new Set<string>()};pc.onicecandidate=e=>{if(e.candidate&&link.localIce.length<48){link.localIce.push(e.candidate.toJSON());const key=this.host?id:this.base.you;const sig=this.signals[key];if(sig?.epoch===epoch){if(this.host)sig.offerIce=[...link.localIce];else sig.answerIce=[...link.localIce];}}};this.links.set(id,link);return link;}
 private async offer(id:string){if(this.closed||typeof RTCPeerConnection==='undefined')return;const link=this.newLink(id,uniqueId());this.bind(link,id,link.pc.createDataChannel('inputs',{ordered:true}));this.bind(link,id,link.pc.createDataChannel('state',{ordered:false,maxRetransmits:0}));try{await link.pc.setLocalDescription(await link.pc.createOffer());await gathered(link.pc);if(this.links.get(id)!==link||this.closed)return;this.signals[id]={epoch:link.epoch,offer:link.pc.localDescription!.toJSON(),offerIce:[...link.localIce]};}catch(e){this.options.onError('Direct negotiation: '+String(e));link.pc.close();}}
 private async answer(sig:Signal){if(this.closed||typeof RTCPeerConnection==='undefined')return;const id=this.base.host,link=this.newLink(id,sig.epoch);link.pc.ondatachannel=e=>this.bind(link,id,e.channel);try{await link.pc.setRemoteDescription(sig.offer!);await link.pc.setLocalDescription(await link.pc.createAnswer());await gathered(link.pc);if(this.links.get(id)!==link||this.closed)return;this.signals[this.base.you]={epoch:sig.epoch,answer:link.pc.localDescription!.toJSON(),answerIce:[...link.localIce]};}catch(e){this.options.onError('Direct negotiation: '+String(e));link.pc.close();}}
 private async addIce(l:Link,cs?:RTCIceCandidateInit[]){if(!l.pc.remoteDescription)return;for(const c of cs||[]){const k=JSON.stringify(c);if(l.remoteIce.has(k))continue;try{await l.pc.addIceCandidate(c);l.remoteIce.add(k);}catch{}}}
 private transmit(c:RTCDataChannel|undefined,data:unknown){if(this.forceRelay||c?.readyState!=='open'||c.bufferedAmount>256000)return false;try{c.send(JSON.stringify(data));return true;}catch{return false;}}
 private bind(link:Link,id:string,c:RTCDataChannel){if(!['inputs','state'].includes(c.label)){c.close();return;}if(c.label==='inputs')link.input=c;else link.state=c;
 c.onopen=()=>{if(!this.host&&c.label==='inputs')this.transmit(c,{kind:'hello',seat:this.base.you,token:this.options.token});};
 c.onmessage=e=>{if(this.forceRelay||typeof e.data!=='string'||e.data.length>(this.host?18000:260000))return;try{const m=JSON.parse(e.data);if(this.host){
  if(c.label!=='inputs')return;const seat=this.authority?.game.seats.find(s=>s.id===id&&!s.bot);if(!seat)return;
  if(m.kind==='hello'){if(m.seat!==id||m.token!==seat.token){link.pc.close();return;}link.authenticated=true;this.transmit(c,{kind:'welcome'});return;}
  if(!link.authenticated)return;link.last=performance.now();if(m.kind==='ping'){this.transmit(c,{kind:'pong',at:m.at});return;}if(m.kind==='arena'){link.known=m.key;return;}
  if(m.kind==='input'&&m.message?.seat===id){const ok=this.authority!.input(m.message);this.transmit(c,{kind:'ack',id:m.message.id,ok});}
 }else{
  if(m.kind==='ended'){this.accept(m.packet,0,true);this.options.onError('Host left. Job ended');this.stop(false);return;}
  if(m.kind==='welcome'){link.authenticated=true;return;}
  if(m.kind==='pong'&&Number.isFinite(m.at)){this.ping=Math.max(0,performance.now()-m.at);this.stats.latencies.push(this.ping);return;}
  if(m.kind==='ack'){this.commandQueue.delete(m.id);if(!m.ok)this.options.onError('The host rejected that action.');return;}
  if(m.kind==='snapshot'){this.lastState=performance.now();link.last=this.lastState;this.accept(m.packet,this.ping);this.transmit(link.input,{kind:'arena',key:m.packet.arenaKey});}
 }}catch{/* Malformed peer data never reaches the engine. */}};
 }
 private accept(p:Wire,rtt:number,force=false){try{const v=unpack(p,this.base);if(!force&&v.match===this.base.match&&v.revision<this.base.revision)return;this.base=v;this.stats.snapshots++;this.options.onView(v,p.ack,rtt);}catch{/* Ask again for static geometry after a lost first snapshot. */}}
 direct(){const l=this.links.get(this.base.host);return !this.forceRelay&&!!l&&l.authenticated&&directReady(l.state?.readyState==='open',this.lastState,performance.now());}
 command(type:string,extra:Record<string,unknown>={}){const e=this.envelope({type,...extra});if(this.host){if(!this.authority?.input(e))this.options.onError('That action is unavailable.');}else{this.commandQueue.set(e.id,e);this.transmit(this.links.get(this.base.host)?.input,{kind:'input',message:e});}}
 private envelope(payload:Record<string,any>):Envelope{return{id:`${this.lease}:${++this.counter}`,seat:this.base.you,token:this.options.token,payload};}
 private step(){if(this.closed)return;const now=performance.now();
 if(this.host&&this.authority){let steps=0;while(now-this.tickAt>=40&&steps++<5){this.authority.tick();this.tickAt+=40;}if(now-this.tickAt>200)this.tickAt=now;}
 if(now-this.sendAt<50)return;this.sendAt=now;const e=this.envelope(this.options.input());this.latest=e;
 if(this.host&&this.authority){this.authority.input(e);const g=this.authority.game;(g as Game&{connectionModes?:Record<string,string>}).connectionModes=Object.fromEntries([...this.links].map(([id,l])=>[id,l.authenticated&&l.state?.readyState==='open'&&now-l.last<2000?'Direct':'Relay']));this.accept(this.authority.snapshot(g.host,arenaKey(this.base)),0);for(const [id,l] of this.links){if(l.authenticated)this.transmit(l.state,{kind:'snapshot',packet:this.authority.snapshot(id,l.known)});}}
 else{const l=this.links.get(this.base.host);if(l?.authenticated){this.transmit(l.input,{kind:'input',message:e});for(const cmd of this.commandQueue.values())this.transmit(l.input,{kind:'input',message:cmd});if(now-this.lastPing>1000){this.lastPing=now;this.transmit(l.input,{kind:'ping',at:now});}}}
 const modes:Record<string,string>={...(this.base as View&{connectionModes?:Record<string,string>}).connectionModes};for(const [id,l] of this.links)modes[id]=l.authenticated&&l.state?.readyState==='open'&&now-l.last<2500?'Direct':'Relay';this.mode=this.host?'Host':this.direct()?'Direct':'Relay';this.options.onStatus(this.mode,Math.round(this.ping),modes);
 }
 stop(notify=true){if(this.closed)return;if(notify&&this.host&&this.authority){endHost(this.authority.game);for(const [id,l] of this.links)this.transmit(l.input,{kind:'ended',packet:this.authority.snapshot(id)});}this.closed=true;clearInterval(this.timer);clearTimeout(this.syncTimer);window.removeEventListener('pagehide',this.pageHide);if(notify&&this.host)void fetch('/api/noise/peer',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code:this.options.code,token:this.options.token,lease:this.lease,close:true}),keepalive:true});for(const l of this.links.values())setTimeout(()=>l.pc.close(),100);}
}
