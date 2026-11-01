// Local regression only. The guest is raw Chromium/CDP, never a Playwright page.
import {chromium} from '@playwright/test';
import {spawn} from 'node:child_process';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import assert from 'node:assert/strict';
const base=process.env.PREVIEW_TEST_URL||'http://terminal.local:4173';
assert.ok(['localhost','127.0.0.1','terminal.local'].includes(new URL(base).hostname),'Local server required');
const pause=ms=>new Promise(r=>setTimeout(r,ms));
async function until(fn,message,timeout=20000){const end=Date.now()+timeout;while(Date.now()<end){const result=await fn();if(result)return result;await pause(100);}throw Error(message);}
async function cdp(url){const socket=new WebSocket(url);await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true});});let serial=0;const pending=new Map();socket.addEventListener('message',e=>{const r=JSON.parse(e.data);if(!r.id)return;const p=pending.get(r.id);if(!p)return;pending.delete(r.id);clearTimeout(p.timer);r.error?p.reject(Error(r.error.message)):p.resolve(r.result);});return {close:()=>socket.close(),send:(method,params={})=>new Promise((resolve,reject)=>{const id=++serial,timer=setTimeout(()=>{pending.delete(id);reject(Error('CDP timeout: '+method));},10000);pending.set(id,{resolve,reject,timer});socket.send(JSON.stringify({id,method,params}));})};}
let hostBrowser,raw,client,profile;let stage='launch';
try{
 profile=await mkdtemp(join(tmpdir(),'velmont-guest-'));
 const executable=process.env.CHROMIUM_EXECUTABLE||chromium.executablePath();
 hostBrowser=await chromium.launch({executablePath:executable,headless:true});
 stage='test';
 const host=await hostBrowser.newPage({baseURL:base});
 await host.goto('/');await host.getByRole('button',{name:/Play with friends/}).click();await host.getByRole('button',{name:/Host a room/}).click();
 const code=(await host.locator('.crew-code').innerText()).match(/[A-Z0-9]{6}/)[0];
 stage='launch';
 raw=spawn(executable,['--remote-debugging-address=127.0.0.1','--remote-debugging-port=0','--remote-allow-origins=http://localhost',`--user-data-dir=${profile}`,'--no-first-run','--no-default-browser-check',...(process.env.RAW_CHROMIUM_HEADED==='1'?[]:['--headless=new']),...(process.getuid?.()===0?['--no-sandbox']:[]),'about:blank'],{stdio:'ignore'});
 let launchError;raw.on('error',e=>{launchError=e;});
 const port=await until(async()=>{if(launchError)throw launchError;try{return Number((await readFile(join(profile,'DevToolsActivePort'),'utf8')).split('\n')[0]);}catch{return false;}},'Raw Chromium did not start');
 const endpoint='http://127.0.0.1:'+port;
 const json=async(path,method='GET')=>{const r=await fetch(endpoint+path,{method});assert.ok(r.ok,'CDP HTTP '+r.status);return r.json();};
 const guestTarget=await json('/json/new?'+encodeURIComponent(base+'/?crew='+code),'PUT');
 client=await cdp(guestTarget.webSocketDebuggerUrl);stage='test';
 const evaluate=async expression=>{const r=await client.send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error('Guest DOM evaluation failed');return r.result.value;};
 const click=async text=>{const p=await until(()=>evaluate(`(()=>{const e=[...document.querySelectorAll('button')].find(e=>e.textContent.includes(${JSON.stringify(text)})&&!e.disabled);if(!e)return null;const r=e.getBoundingClientRect();return r.width&&r.height?{x:r.x+r.width/2,y:r.y+r.height/2}:null;})()`),'Guest button missing: '+text);await client.send('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...p});await client.send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...p});};
 await click('Join crew');await until(()=>evaluate("!!document.querySelector('.crew-code')"),'Guest did not join');
 await host.getByRole('button',{name:/Enter the gallery/}).click();await host.getByRole('button',{name:/LET’S GO/}).click();await click('LET’S GO');
 await until(()=>evaluate("!!document.querySelector('.active-heist')"),'Guest match did not start');await host.locator('.active-heist').waitFor();
 const cover=await json('/json/new?about:blank','PUT');await fetch(endpoint+'/json/activate/'+cover.id);
 await until(async()=>await evaluate('document.visibilityState')==='hidden','Guest never became hidden');
 const began=Date.now();let samples=0;
 while(Date.now()-began<20000){assert.equal(await evaluate('document.visibilityState'),'hidden','Guest became visible before 20 seconds');samples++;await pause(100);}
 await fetch(endpoint+'/json/activate/'+guestTarget.id);await until(async()=>await evaluate('document.visibilityState')==='visible','Guest did not become visible');
 const state=await until(async()=>{const s=await evaluate(`({playing:!!document.querySelector('.active-heist'),connection:document.querySelector('.connection')?.textContent||'',clock:document.querySelector('.clock b')?.textContent||'',ended:document.body.innerText.includes('The host left, so the job ended.')})`);return s.playing&&/Direct|Relay/.test(s.connection)&&s.clock?s:null;},'Guest did not resume connected heist');
 const seconds=t=>{const m=t.match(/(\d+):(\d{2})/);assert.ok(m,'Clock missing');return Number(m[1])*60+Number(m[2]);};
 const hostClock=await host.locator('.clock b').innerText();assert.ok(Math.abs(seconds(state.clock)-seconds(hostClock))<=2,'Guest clock differs by more than two seconds');assert.equal(state.ended,false);
 console.log(JSON.stringify({status:'PASS',hiddenMs:Date.now()-began,hiddenSamples:samples,restored:true,clockDifferenceSeconds:Math.abs(seconds(state.clock)-seconds(hostClock)),hostEnded:false}));
}catch(e){console.error(JSON.stringify({status:stage==='launch'?'BLOCKED':'FAIL',reason:String(e.message).split('\n')[0]}));process.exitCode=1;}
finally{client?.close();raw?.kill('SIGTERM');await hostBrowser?.close();if(profile)await rm(profile,{recursive:true,force:true,maxRetries:5,retryDelay:200});}
