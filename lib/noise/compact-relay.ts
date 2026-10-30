import {CompactSender,CompactReceiver,type CompactFrame,type CompactKeys} from './compact-wire.ts';
import type {Wire} from './network.ts';
export type RelayFrame={stream:string;keys?:CompactKeys;frame:CompactFrame};
// Disposable process cache: a cold worker sends a new reliable HTTP baseline.
// No correctness dependency on worker affinity or persistent cache storage.
export class RelayEncoder{
 clients=new Map<string,{stream:string;sender:CompactSender}>();
 encode(id:string,wire:Wire,known?:{stream?:string;n?:number;keys?:number;reset?:boolean}):RelayFrame{
  let c=this.clients.get(id);if(!c||known?.reset){c={stream:crypto.randomUUID(),sender:new CompactSender(2)};this.clients.set(id,c);}
  this.clients.delete(id);this.clients.set(id,c);if(this.clients.size>32)this.clients.delete(this.clients.keys().next().value!);
  const same=c.stream===known?.stream;
  if(same)c.sender.acknowledge(known?.n||0);
  const e=c.sender.encode(wire),start=same?Math.max(0,Math.min(c.sender.paths.length,known?.keys||0)):0;
  return {stream:c.stream,keys:start<c.sender.paths.length?{kind:'keys',s:c.sender.stream,at:start,paths:c.sender.paths.slice(start)}:undefined,frame:e.frame};
 }
}
export class RelayDecoder{
 stream='';receiver=new CompactReceiver();reset=false;
 get known(){return {stream:this.stream,n:this.receiver.latest,keys:this.receiver.paths.length,reset:this.reset};}
 decode(m:RelayFrame){if(m.stream!==this.stream){this.stream=m.stream;this.receiver=new CompactReceiver();}if(m.keys)this.receiver.keys(m.keys);const wire=this.receiver.decode(m.frame);this.reset=!wire;return wire;}
}
