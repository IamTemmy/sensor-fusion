import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../lib/noise/engine.ts';
import {readFileSync} from 'node:fs';
function job(seed:number){const g=E.create('DOORS',0,seed);for(let i=0;i<4;i++)E.add(g,'P'+i,''+i);E.configure(g,'duos');E.setup(g);E.command(g,g.seats[0].id,{type:'ready'});return g;}
test('all rivals arenas stage central security at centre doors, not in either wing',()=>{
 const layouts=new Set<number>(),archiveSides=new Set<number>();
 for(let seed=1;seed<=40;seed++){const g=job(seed);layouts.add(g.layout);const central=g.guards.filter(h=>h.sentry&&Math.abs(h.sentry.x-480)<144||h.id==='g2');assert.ok(central.length);for(const h of central){assert.equal(h.door?.x,480);assert.ok(E.clear(h.door!,13,g.walls));assert.equal(E.guardActive(g,h),false);if(g.layout===1)archiveSides.add(h.door!.y);}
 // With players in their bays, the entry approach must stay inside the shared centre.
 for(let i=0;i<450;i++){E.advance(g,g.now+40);for(const h of central)if(E.guardActive(g,h))assert.ok(h.x>=336&&h.x<=624,`layout ${g.layout}: centre guard crossed a wing at ${h.x}`);}
 }
 assert.equal(layouts.size,3);assert.equal(archiveSides.size,2);
});
test('hide prompt is available at 40 units only for a quiet, free thief and available cover',()=>{
 const g=job(1),s=g.seats[0],spot=E.hidingSpots(g)[0];Object.assign(s,{x:spot.x+39,y:spot.y});assert.ok(E.nearbyHide(g,s));s.x=spot.x+41;assert.equal(E.nearbyHide(g,s),undefined);s.x=spot.x;
 g.noises.push({id:'scream',...spot,kind:'alarm',attached:s.id,holder:null,source:null,expires:g.now+9000,born:g.now,flight:0,vx:0,vy:0});assert.equal(E.nearbyHide(g,s),undefined);g.noises=[];s.hideCooldown=g.now+100;assert.equal(E.nearbyHide(g,s),undefined);s.hideCooldown=0;s.stun=g.now+100;assert.equal(E.nearbyHide(g,s),undefined);
});
test('hiding is explained in the guide, action bar and first-time spotted tip',()=>{
 const ui=readFileSync('components/noise/presentation.tsx','utf8'),page=readFileSync('app/page.tsx','utf8'),draw=readFileSync('lib/noise/draw.ts','utf8');
 assert.match(ui,/Sneak into tall plants to hide\. Screaming art gives you away\./);assert.match(ui,/h\.victim===me\.id/);assert.match(ui,/\['hide','Spotted near cover!/);assert.match(page,/hidePrompt&&<kbd>SHIFT<\/kbd>/);assert.match(draw,/nearbyHide\(g,me\)/);
});
