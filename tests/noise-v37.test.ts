import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import * as E from '../lib/noise/engine.ts';
// Exercise the actual canvas renderer with a no-op canvas, including extensionless client imports.
const require=createRequire(import.meta.url),Module=require('node:module'),ts=require('typescript');
const previous=Module._extensions['.ts'];Module._extensions['.ts']=(m:any,f:string)=>m._compile(ts.transpileModule(readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true,resolveJsonModule:true}}).outputText,f);
const {draw}=require('../lib/noise/draw.ts');
if(previous)Module._extensions['.ts']=previous;else delete Module._extensions['.ts'];
const ctx:any=new Proxy({canvas:{width:1280,height:720},measureText:(t:string)=>({width:t.length*8}),createRadialGradient:()=>({addColorStop(){}}),createLinearGradient:()=>({addColorStop(){}})},{get:(o:any,k)=>k in o?o[k]:()=>{},set:(o,k,v)=>{o[k]=v;return true;}});
function render(g:E.Game,id:string){const v=JSON.parse(JSON.stringify(E.view(g,id)));assert.doesNotThrow(()=>draw(ctx,v,1280,720,0,id,new Map(),{x:480,y:300},false,true));}
test('online lifecycle: host lobby, joined lobby, start first frame, finished and replay render',()=>{
 const g=E.create('ABCDEF',0,42),a=E.add(g,'Host','host');assert.equal(g.layout,-1);assert.ok(E.arenaDefinition(g));assert.deepEqual(E.hidingSpots(g),[]);render(g,a.id);
 const b=E.add(g,'Guest','guest');render(g,b.id);render(g,a.id);
 E.command(g,a.id,{type:'start'});render(g,a.id);E.command(g,a.id,{type:'ready'});E.command(g,b.id,{type:'ready'});E.advance(g,g.now+40);render(g,a.id);render(g,b.id);
 E.finish(g,'Fixture finished');render(g,a.id);E.command(g,a.id,{type:'replay'});assert.equal(g.phase,'ready');render(g,a.id);render(g,b.id);
});
test('invalid layout is safe in both crew modes and terminal presentation',()=>{for(const mode of ['coop','duos'] as const){const g=E.create('ABCDEF',0,42),s=E.add(g,'Host','tok');g.crewMode=mode;g.phase='finished';assert.ok(E.arenaDefinition(g));render(g,s.id);}});
