import {STUN_SERVERS} from './peer-policy.ts';
export type StunObservation={server:string;address:string;port:number;local:string;protocol:string};
export function mappingSummary(xs:StunObservation[]){
 const comparable=xs.flatMap((a,i)=>xs.slice(i+1).filter(b=>a.local&&a.local===b.local&&a.protocol===b.protocol&&a.server!==b.server).map(b=>[a,b]));
 if(!comparable.length)return 'Not enough comparable replies from two STUN servers. Your browser may combine identical candidates; NAT type is unknown.';
 if(comparable.some(([a,b])=>a.address!==b.address||a.port!==b.port))return 'Different public ports or addresses from two STUN servers: restrictive mapping is likely. Direct may need TURN.';
 return 'Two STUN servers saw the same public port: promising for Direct, but the other player’s network and firewall still matter.';
}
export async function probeStun(signal?:AbortSignal){
 const pc=new RTCPeerConnection({iceServers:STUN_SERVERS}),observations:StunObservation[]=[];let srflx=false;
 let finish:()=>void=()=>{};const done=new Promise<void>(resolve=>{finish=resolve;});const timer=setTimeout(finish,12000);
 const stop=()=>{pc.close();finish();};signal?.addEventListener('abort',stop,{once:true});
 try{if(signal?.aborted)throw Error('Cancelled');pc.createDataChannel('stun-probe');pc.onicecandidate=e=>{const c=e.candidate;if(!c){finish();return;}if(c.type==='srflx'){srflx=true;const server=(e as RTCPeerConnectionIceEvent&{url?:string}).url||(c as RTCIceCandidate&{url?:string}).url;if(server&&c.address&&c.port&&c.relatedAddress&&c.relatedPort)observations.push({server,address:c.address,port:c.port,local:c.relatedAddress+':'+c.relatedPort,protocol:c.protocol||'udp'});}};pc.onicegatheringstatechange=()=>{if(pc.iceGatheringState==='complete')finish();};await pc.setLocalDescription(await pc.createOffer());await done;return{srflx,mapping:mappingSummary(observations)};}finally{clearTimeout(timer);signal?.removeEventListener('abort',stop);pc.close();}
}
export async function probeLoopback(signal?:AbortSignal){
 const a=new RTCPeerConnection({iceServers:[]}),b=new RTCPeerConnection({iceServers:[]}),pendingA:RTCIceCandidateInit[]=[],pendingB:RTCIceCandidateInit[]=[];
 let timer:ReturnType<typeof setTimeout>|undefined,stop=()=>{};
 try{return await new Promise<string>((resolve,reject)=>{let settled=false;const finish=(error?:Error)=>{if(settled)return;settled=true;error?reject(error):resolve('Passed: this browser sent and received a DataChannel message locally. This does not test the route to your friend.');};stop=()=>finish(Error('Cancelled'));signal?.addEventListener('abort',stop,{once:true});if(signal?.aborted){stop();return;}timer=setTimeout(()=>finish(Error('Local DataChannel timed out after 12 seconds.')),12000);
 a.onicecandidate=e=>{if(e.candidate){if(b.remoteDescription)void b.addIceCandidate(e.candidate).catch(()=>{});else pendingB.push(e.candidate.toJSON());}};
 b.onicecandidate=e=>{if(e.candidate){if(a.remoteDescription)void a.addIceCandidate(e.candidate).catch(()=>{});else pendingA.push(e.candidate.toJSON());}};
 const message='velmont-loopback';b.ondatachannel=e=>{e.channel.onmessage=m=>{if(m.data===message)e.channel.send(message);};};const c=a.createDataChannel('loopback');c.onopen=()=>c.send(message);c.onmessage=e=>{if(e.data===message)finish();};c.onerror=()=>finish(Error('Local DataChannel failed.'));
 void(async()=>{await a.setLocalDescription(await a.createOffer());await b.setRemoteDescription(a.localDescription!);for(const c of pendingB)await b.addIceCandidate(c);await b.setLocalDescription(await b.createAnswer());await a.setRemoteDescription(b.localDescription!);for(const c of pendingA)await a.addIceCandidate(c);})().catch(e=>finish(e));
 });}finally{clearTimeout(timer);signal?.removeEventListener('abort',stop);a.close();b.close();}
}
