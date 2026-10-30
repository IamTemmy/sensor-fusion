import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../lib/noise/engine.ts';
import {flagshipArena} from '../lib/noise/flagship-arena.ts';
import {archiveArena} from '../lib/noise/archive-arena.ts';

for(const arena of [flagshipArena,archiveArena])test(`${arena.name}: surprise exhibit stays collectible after its arrival window`,()=>{
 const g=E.create('STARS',0,1001),h=E.add(g,'Player','h');E.add(g,'Echo','b',true);
 E.setup(g,(_,n)=>arena(n));E.command(g,h.id,{type:'ready'});
 const loot=g.loot.find(l=>l.value===500)!;loot.sealed=true;loot.eventPiece=true;
 g.jobEvent={kind:'vault',at:g.now+20000,until:g.now+35000,started:false,ended:false,warned:false};
 assert.equal(E.exhibitAvailable(g,loot),false);
 g.now=g.jobEvent.at;E.updateJobEvent(g);
 assert.equal(E.exhibitAvailable(g,loot),true);
 g.now=g.jobEvent.until+1000;E.updateJobEvent(g);
 assert.equal(E.exhibitAvailable(g,loot),true,'Missing the arrival announcement must not permanently prevent three stars');
 // Isolated interaction fixture: arriving late can still claim it through the actual grab rule.
 Object.assign(h,{x:loot.x,y:loot.y});E.action(g,h,'grab');assert.equal(h.hand,loot.id);
 const announcements=g.events.filter(e=>e.text.startsWith('UNEXPECTED LOOT'));assert.equal(announcements.length,1);
 assert.equal(g.loot.reduce((n,l)=>n+l.value,0),4300);
});
