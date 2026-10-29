// Server-only TURN credential broker. Long-lived provider secrets never enter snapshots.
import {configuredIce} from './peer-policy.ts';
type Config={iceServers:RTCIceServer[];turnAvailable:boolean};
const cache=new Map<string,{until:number;value:Config}>();
export async function sessionIce(env:Record<string,unknown>,seat:string,fetcher:typeof fetch=fetch,now=Date.now()):Promise<Config>{
 const fallback=configuredIce(env),base={iceServers:fallback,turnAvailable:fallback.some(s=>(Array.isArray(s.urls)?s.urls:[s.urls]).some(u=>/^turns?:/.test(u)))};
 const id=env.VELMONT_TURN_KEY_ID,token=env.VELMONT_TURN_API_TOKEN;
 if(typeof id!=='string'||typeof token!=='string'||!id||!token)return base;
 const key=id+':'+seat,old=cache.get(key);if(old&&old.until>now)return old.value;
 try{
  const response=await fetcher('https://rtc.live.cloudflare.com/v1/turn/keys/'+encodeURIComponent(id)+'/credentials/generate-ice-servers',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({ttl:3600}),signal:AbortSignal.timeout(4000)});
  if(!response.ok)return base;
  const data=await response.json() as {iceServers?:RTCIceServer[]};
  const servers=(Array.isArray(data.iceServers)?data.iceServers:[]).slice(0,8).flatMap(s=>{
   const urls=(Array.isArray(s.urls)?s.urls:[s.urls]).filter(u=>typeof u==='string'&&/^turns?:[a-z0-9.-]+:\d+(\?transport=(udp|tcp))?$/i.test(u)&&!/:53(?:\?|$)/.test(u));
   return urls.length&&typeof s.username==='string'&&typeof s.credential==='string'?[{urls,username:s.username,credential:s.credential}]:[];
  });
  if(!servers.length)return base;
  const value={iceServers:[...fallback,...servers],turnAvailable:true};
  if(cache.size>=512)cache.delete(cache.keys().next().value!);cache.set(key,{until:now+25*60*1000,value});return value;
 }catch{return base;}
}
