export const STUN_SERVERS:RTCIceServer[]=[{urls:['stun:stun.l.google.com:19302','stun:stun1.l.google.com:19302']}];
export const retryDelay=(attempt:number)=>[2000,4000,8000][Math.min(2,Math.max(0,attempt-1))];
export function connectionLabel(authenticated:boolean,open:boolean,age:number,turn=false){return authenticated&&open?(turn?'Direct (TURN)':'Direct'):age<8000?'Connecting…':'Relay';}
export function configuredIce(env:Record<string,unknown>):RTCIceServer[]{
 const urls=typeof env.VELMONT_TURN_URLS==='string'?env.VELMONT_TURN_URLS.split(',').map(s=>s.trim()).filter(Boolean):[];
 if(!urls.length||urls.length>8||urls.some(u=>!/^turns?:[a-z0-9.-]+:\d+(\?transport=(tcp|udp))?$/i.test(u)))return STUN_SERVERS;
 if(typeof env.VELMONT_TURN_USERNAME!=='string'||typeof env.VELMONT_TURN_PASSWORD!=='string'||!env.VELMONT_TURN_USERNAME||!env.VELMONT_TURN_PASSWORD)return STUN_SERVERS;
 return [...STUN_SERVERS,{urls,username:env.VELMONT_TURN_USERNAME,credential:env.VELMONT_TURN_PASSWORD}];
}
export function selectedTurn(stats:RTCStatsReport){let pair:any;stats.forEach((s:any)=>{if(s.type==='transport'&&s.selectedCandidatePairId)pair=stats.get(s.selectedCandidatePairId);});if(!pair)stats.forEach((s:any)=>{if(s.type==='candidate-pair'&&s.state==='succeeded'&&s.nominated)pair=s;});return !!pair&&[stats.get(pair.localCandidateId),stats.get(pair.remoteCandidateId)].some((c:any)=>c?.candidateType==='relay');}
export const hostLeaseExpired=(now:number,heartbeat:number,away:boolean)=>now-heartbeat>(away?120000:12000);
