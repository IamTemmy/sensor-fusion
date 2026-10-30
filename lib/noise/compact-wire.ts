import type {Wire} from './network.ts';
type Path=(string|number)[];
type Scalar=string|number|boolean|null|{c:0|1};
const OBJECT={c:0 as const},ARRAY={c:1 as const};
type Flat=Map<number,Scalar>;
export type CompactFrame={kind:'delta';s:string;n:number;b:number;k:number;v:(number|Scalar)[];d:number[]};
export type CompactKeys={kind:'keys';s:string;at:number;paths:Path[]};
const bytes=(v:unknown)=>new TextEncoder().encode(JSON.stringify(v)).length;
// Loss-safe deltas reference an acknowledged frame, never the previous send.
// Dictionary additions and event-bearing frames use the reliable channel.
export class CompactSender{
 stream=crypto.randomUUID().slice(0,8);
 window:number;constructor(window=64){this.window=window;}
 paths:Path[]=[];ids=new Map<string,number>();frames=new Map<number,Flat>();ack=0;serial=0;
 acknowledge(n:number){if(this.frames.has(n)&&n>this.ack)this.ack=n;}
 encode(wire:Wire){
  const before=this.paths.length,flat:Flat=new Map();
  const walk=(v:any,p:Path)=>{
   if(v===undefined)return;
   if(v!==null&&typeof v==='object'){
    put(p,Array.isArray(v)?ARRAY:OBJECT);
    if(Array.isArray(v))v.forEach((x,i)=>walk(x,[...p,i]));else for(const k of Object.keys(v).sort())walk(v[k],[...p,k]);
   }else put(p,typeof v==='number'&&(p.at(-1)==='x'||p.at(-1)==='y')?Math.round(v):typeof v==='number'&&p.at(-1)==='angle'?Math.round(((v%(2*Math.PI)+2*Math.PI)%(2*Math.PI))*255/(2*Math.PI)):v);
  };
  const put=(p:Path,v:Scalar)=>{const key=JSON.stringify(p);let id=this.ids.get(key);if(id===undefined){id=this.paths.length;this.ids.set(key,id);this.paths.push(p);}flat.set(id,v);};
  walk(wire,[]);
  const base=this.frames.get(this.ack)||new Map(),v:(number|Scalar)[]=[],d:number[]=[];let events=false;const reliablePath=(id:number)=>{const p=this.paths[id];return p[0]==='arena'||p.includes('events')||['name','value','home','route','roomLabels','docks','arenaKey','layout','crewMode','phase','match'].some(k=>p.includes(k));};
  for(const [id,value] of flat)if(!base.has(id)||base.get(id)!==value){v.push(id,value);if(reliablePath(id))events=true;}
  for(const id of base.keys())if(!flat.has(id)){d.push(id);if(reliablePath(id))events=true;}
  const frame:CompactFrame={kind:'delta',s:this.stream,n:++this.serial,b:this.frames.has(this.ack)?this.ack:0,k:this.paths.length,v,d};
  this.frames.set(frame.n,flat);
  for(const n of this.frames.keys())if(n<this.serial-this.window&&n!==this.ack)this.frames.delete(n);
  return {keys:before<this.paths.length?{kind:'keys',s:this.stream,at:before,paths:this.paths.slice(before)} as CompactKeys:undefined,frame,reliable:frame.b===0||events||bytes(frame)>3000,bytes:bytes(frame)};
 }
}
export class CompactReceiver{
 stream='';
 paths:Path[]=[];frames=new Map<number,Flat>();latest=0;
 keys(m:CompactKeys){if(m.at===0&&m.s!==this.stream){this.stream=m.s;this.paths=[];this.frames.clear();this.latest=0;}if(m.s!==this.stream)return false;if(m.at!==this.paths.length||!Array.isArray(m.paths)||this.paths.length+m.paths.length>20000)return false;this.paths.push(...m.paths);return true;}
 decode(m:CompactFrame):Wire|undefined{
  if(m.s!==this.stream||m.n<=this.latest||m.k>this.paths.length||m.v.length%2)return;
  const base=m.b?this.frames.get(m.b):new Map<number,Scalar>();if(!base)return;
  const flat=new Map(base);for(const id of m.d)flat.delete(id);
  for(let i=0;i<m.v.length;i+=2){const id=m.v[i] as number;if(!Number.isInteger(id)||id<0||id>=m.k)return;flat.set(id,m.v[i+1] as Scalar);}
  let root:any;
  // Parents precede children in the shared dictionary, including newly introduced fields.
  for(const [id,value] of [...flat].sort((a,b)=>this.paths[a[0]].length-this.paths[b[0]].length)){
   const path=this.paths[id];if(path.some(k=>k==='__proto__'||k==='constructor'||k==='prototype'))return;
   const val=value!==null&&typeof value==='object'?(value.c===1?[]:{}):value;
   if(!path.length){root=val;continue;}let target=root;
   for(let j=0;j<path.length-1;j++){target=target?.[path[j]];if(target===undefined)return;}
   target[path.at(-1)!]=path.at(-1)==='angle'&&typeof val==='number'?val*2*Math.PI/255:val;
  }
  if(root?.protocol!==2||!root.view)return;
  this.frames.set(m.n,flat);this.latest=m.n;
  // Keep frames the sender can still reference during delayed acknowledgments.
  for(const n of this.frames.keys())if(n<m.n-256)this.frames.delete(n);
  return root as Wire;
 }
}
