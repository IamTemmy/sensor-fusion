import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../lib/noise/engine.ts';
import {archiveArena} from '../lib/noise/archive-arena.ts';
function fixture(){const g=E.create('SHAKE',0,1001),s=E.add(g,'Player','p'),b=E.add(g,'Partner','b');E.setup(g);for(const p of g.seats)E.command(g,p.id,{type:'ready'});g.walls=[];g.guards=[];g.sensors=[];g.jobEvent=undefined;Object.assign(s,{x:400,y:300});Object.assign(b,{x:420,y:300});const l=g.loot[0];g.loot.slice(1).forEach(l=>l.sealed=true);Object.assign(l,{x:400,y:300,holder:s.id});s.hand=l.id;g.noises=[{id:'alarm-test',x:400,y:300,holder:null,attached:s.id,source:l.id,kind:'alarm',born:g.now,expires:g.now+15000,flight:0,vx:0,vy:0}];return {g,s,b,l};}
function tick(g:E.Game,ms:number){for(let i=0;i<ms;i+=40)E.advance(g,g.now+40);}
test('self shake takes 1s, preserves art, uses frozen aim, quiets for exactly 6s',()=>{
 const {g,s,l}=fixture();E.action(g,s,'shake:'+l.id,{x:600,y:300});const until=s.shakeAlarm!.until;
 E.action(g,s,'shake:'+l.id,{x:200,y:300});assert.equal(s.shakeAlarm!.until,until);
 tick(g,960);assert.equal(g.noises[0].attached,s.id);assert.equal(s.hand,l.id);
 s.aim={x:200,y:300};tick(g,40);assert.equal(s.shakeAlarm,undefined);assert.equal(s.hand,l.id);assert.equal(l.holder,s.id);assert.equal(l.quietUntil,g.now+6000);assert.ok(g.noises[0].vx>0);assert.equal(g.noises[0].attached,null);
 tick(g,5960);assert.equal(g.noises.some(n=>n.source===l.id&&n.attached===s.id),false);tick(g,40);assert.equal(g.noises.some(n=>n.source===l.id&&n.attached===s.id),true);
});
test('teammate removes alarm instantly during wind-up; no delayed duplicate throw',()=>{
 const {g,s,b,l}=fixture();E.action(g,s,'shake:'+l.id,{x:600,y:300});E.action(g,b,'grab');assert.equal(b.hand,'alarm-test');assert.equal(g.noises[0].attached,null);assert.equal(l.quietUntil,g.now+8000);tick(g,1200);assert.equal(s.shakeAlarm,undefined);assert.equal(b.hand,'alarm-test');assert.equal(s.hand,l.id);assert.equal(g.noises[0].thrownBy,undefined);
});
for(const cancel of ['drop','caught','bank','pass'] as const)test(`shake cancels on ${cancel}`,()=>{
 const {g,s,b,l}=fixture();E.action(g,s,'shake:'+l.id,{x:600,y:300});
 if(cancel==='drop')E.action(g,s,'drop');if(cancel==='caught')s.stun=g.now+6000;if(cancel==='bank')Object.assign(s,E.vanFor(g,0));if(cancel==='pass')E.action(g,s,'throw:'+l.id,b);
 tick(g,1200);assert.equal(s.shakeAlarm,undefined);assert.equal(g.events.some(e=>e.text.includes('shook off')),false);
});
test('stale item-bound shake cannot act on a newly acquired exhibit',()=>{const {g,s}=fixture();E.action(g,s,'shake:wrong',{x:600,y:300});assert.equal(s.shakeAlarm,undefined);});
test('both Archive shelf cuts have an 80u opening traversable by radius-13 thieves',()=>{
 const a=archiveArena(4);for(const [x,start] of [[250,263],[470,203]]){for(let y=start;y<=start+54;y+=2)for(let xx=x-15;xx<=x+33;xx+=2)assert.equal(E.clear({x:xx,y},13,a.walls),true,`${x}: blocked at ${xx},${y}`);}
});
test('movement continues during the one-second wind-up',()=>{
 const {g,s,l}=fixture(),x=s.x;E.action(g,s,'shake:'+l.id,{x:600,y:300});for(let i=0;i<20;i++){E.command(g,s.id,{type:'input',seq:i+1,dx:1,dy:0});E.advance(g,g.now+40);}assert.ok(s.x>x+50);assert.equal(g.noises[0].attached,s.id);assert.equal(s.hand,l.id);
});
