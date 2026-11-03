import {test} from 'node:test';
import assert from 'node:assert/strict';
import {IntroMedia} from '../components/noise/intro-media.ts';
test('empty manifest makes no optional voice/video probes, including repeated calls',async()=>{
 const original=globalThis.fetch,calls:string[]=[];
 globalThis.fetch=(async(url)=>{calls.push(String(url));return new Response(JSON.stringify({files:[]}));}) as typeof fetch;
 try{const m=new IntroMedia();await Promise.all(Array.from({length:6},(_,i)=>Promise.all([m.voice(i),m.clip(i,false),m.clip(i,true)])));assert.deepEqual(calls,['/cinematics/intro-v3/media.json']);m.close();}finally{globalThis.fetch=original;}
});
test('only listed narration is fetched once, without HEAD or fallback 404s',async()=>{
 const original=globalThis.fetch,calls:{url:string;method:string}[]=[];
 globalThis.fetch=(async(url,init)=>{calls.push({url:String(url),method:init?.method??'GET'});return new Response(String(url).endsWith('media.json')?JSON.stringify({files:['vo-01.wav','../unsafe.mp3']}):'audio');}) as typeof fetch;
 try{const m=new IntroMedia();assert.ok(await m.voice(0));assert.equal(await m.voice(1),null);await m.voice(0);assert.deepEqual(calls,[{url:'/cinematics/intro-v3/media.json',method:'GET'},{url:'/cinematics/intro-v3/vo-01.wav',method:'GET'}]);m.close();}finally{globalThis.fetch=original;}
});
test('listed clips load directly and unlisted formats/orientations are never probed',async()=>{
 const original=globalThis.fetch,doc=Object.getOwnPropertyDescriptor(globalThis,'document'),calls:string[]=[],loaded:string[]=[];
 globalThis.fetch=(async(url)=>{calls.push(String(url));return new Response(JSON.stringify({files:['six-shot-01-landscape.mp4']}));}) as typeof fetch;
 Object.defineProperty(globalThis,'document',{configurable:true,value:{createElement:()=>({src:'',canPlayType:()=>true,load(){if(this.src)loaded.push(this.src);},pause(){},removeAttribute(){this.src='';}})}});
 try{const m=new IntroMedia();assert.equal(await m.clip(0,true),'/cinematics/intro-v3/six-shot-01-landscape.mp4');assert.equal(await m.clip(1,true),null);assert.deepEqual(calls,['/cinematics/intro-v3/media.json']);assert.deepEqual(loaded,['/cinematics/intro-v3/six-shot-01-landscape.mp4']);m.close();}finally{globalThis.fetch=original;if(doc)Object.defineProperty(globalThis,'document',doc);else Reflect.deleteProperty(globalThis,'document');}
});
test('poster and depth preparation share a single decoded color image',async()=>{
 const original=Object.getOwnPropertyDescriptor(globalThis,'Image'),loaded:string[]=[],decoded:string[]=[];
 class FakeImage {decoding='';onload:(()=>void)|null=null;onerror:(()=>void)|null=null;private url='';set src(value:string){this.url=value;if(value){loaded.push(value);queueMicrotask(()=>this.onload?.());}}get src(){return this.url;}async decode(){decoded.push(this.url);}}
 Object.defineProperty(globalThis,'Image',{configurable:true,value:FakeImage});
 try{const m=new IntroMedia();const [poster,depth]=await Promise.all([m.loadShot(0,false,false),m.loadShot(0,false,true)]);assert.equal(poster.color,depth.color);assert.equal(loaded.length,2);assert.equal(decoded.length,2);await m.loadShot(0,false,true);assert.equal(loaded.length,2);m.close();}finally{if(original)Object.defineProperty(globalThis,'Image',original);else Reflect.deleteProperty(globalThis,'Image');}
});
