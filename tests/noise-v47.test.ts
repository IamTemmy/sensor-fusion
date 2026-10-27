import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../lib/noise/engine.ts';
import {radioEvents,normalArtSecured} from '../lib/noise/clarity.ts';
import {runLocalFrame,newLocalLoop} from '../lib/noise/client-loop.ts';
function job(seed=2,mode:E.CrewMode='duos'){const g=E.create('V47',0,seed);E.add(g,'Human','tok');E.configure(g,mode);E.fillCrews(g);E.setup(g);E.command(g,g.host,{type:'ready'});return g;}
test('Archive guards skip forbidden dock waypoints and continue moving without entering a dock',()=>{
 const g=job();assert.equal(g.layout,1);g.seats.forEach(s=>{s.bot=false;s.safe=200000;});g.noises=[];g.sensors=[];g.jobEvent=undefined;g.loot.forEach(l=>l.claimed=true);g.now=20000;g.start=0;g.end=90000;
 const guard=g.guards[0];Object.assign(guard,{x:80,y:300,entered:true,sentry:undefined,sentryArt:undefined,mode:'patrol',route:[{x:80,y:490},{x:280,y:490}],way:0,target:{x:80,y:490},attention:0});g.guards=[guard];const before={x:guard.x,y:guard.y};
 for(let i=0;i<150;i++){E.advance(g,g.now+40);assert.equal(E.anySafe(g,guard),false);}
 assert.ok(E.distance(before,guard)>80);assert.ok(guard.way===0||guard.way===1);
});
test('hiding and stashing work at all authored niches across both modes and seeds',()=>{
 let checked=0;
 for(const mode of ['coop','duos'] as const)for(let seed=1;seed<=12;seed++){
 const base=job(seed,mode);
 for(let i=0;i<E.hidingSpots(base).length;i++){
 const g=structuredClone(base),s=g.seats[0],l=g.loot[0],p=E.hidingSpots(g)[i];g.guards=[];g.sensors=[];g.jobEvent=undefined;g.seats.forEach(s=>{s.bot=false;});Object.assign(s,{...p,hand:l.id});Object.assign(l,{...p,holder:s.id,claimed:true});E.action(g,s,'grab');assert.equal(l.stashedAt,i);assert.equal(s.hand,null);assert.ok(!g.noises.some(n=>n.attached===s.id));s.sneak=true;E.advance(g,g.now+280);assert.ok(E.hidden(g,s));E.action(g,s,'grab');assert.equal(l.holder,s.id);assert.ok(g.noises.some(n=>n.attached===s.id));assert.equal(E.hidden(g,s),false);checked++;
 }}assert.equal(checked,96);
});
test('recap never awards all normal art for an empty aborted lobby',()=>{const g=E.create('T');assert.equal(normalArtSecured(g,0),false);const g2=job();g2.loot.forEach(l=>{l.banked=true;l.bankedBy=0;});assert.equal(normalArtSecured(g2,0),true);g2.loot.find(l=>l.value!==1200)!.banked=false;assert.equal(normalArtSecured(g2,0),false);});
test('radio deduplicates staff messages and removes repeated tutorial prose',()=>{const g=job();g.events=[];E.event(g,'Staff door opened. Security entering.');g.now+=1000;E.event(g,'Staff door opened. Security entering.');E.event(g,'The art sets off an alarm! G drops it');E.event(g,'Echo tripped a sensor. Shift sneaks past empty-handed; art always trips it.');assert.deepEqual(radioEvents(g).map(e=>e.text),['Staff door opened. Security entering.','Echo tripped a sensor']);});
test('local RAF driver and direct fixed ticks make the same bot decisions for a full job',()=>{
 const a=job(2,'coop'),b=structuredClone(a),loop=newLocalLoop();
 for(let i=0;i<2250&&a.phase==='playing';i++){
  runLocalFrame(a,loop,40,{x:0,y:0},{x:480,y:300});E.command(b,b.host,{type:'input',seq:b.seats[0].lastSeq+1,dx:0,dy:0,aim:{x:480,y:300}});E.advance(b,b.now+40);
  assert.deepEqual(a.seats.map(s=>[s.x,s.y,s.hand,s.bank]),b.seats.map(s=>[s.x,s.y,s.hand,s.bank]));
 }
});
test('Echo gathers an available safe alarm for an exposed plate job instead of staying blocked',()=>{
 const g=job(1,'duos'),[h,e]=g.seats;g.phase='playing';g.start=0;g.now=20000;g.end=90000;g.walls=[];g.sensors=[];g.jobEvent=undefined;g.hideSpots=[];g.plate={x:200,y:300};Object.assign(h,{x:200,y:300});Object.assign(e,{x:330,y:300,bot:true,mode:'auto'});
 const l=g.loot.find(l=>l.locked)!;g.loot=[l];Object.assign(l,{x:600,y:300,home:{x:600,y:300}});
 g.guards=[{id:'watch',x:650,y:300,angle:Math.PI,mode:'patrol',sentry:{x:650,y:300},sentryArt:l.id,route:[{x:650,y:300}],target:{x:650,y:300},way:0,attention:0,victim:null}];
 g.noises=[{id:'bait',x:280,y:300,holder:null,kind:'alarm',born:g.now,expires:g.now+10000,source:null,vx:0,vy:0,flight:0}];
 E.advance(g,g.now+40);assert.equal(e.hand,'bait');assert.equal(e.task,'jackpot-decoy');
 for(let t=0;t<800;t+=40)E.advance(g,g.now+40);assert.ok(g.noises.some(n=>n.thrownBy===e.id));assert.notEqual(e.hand,'bait');
});
