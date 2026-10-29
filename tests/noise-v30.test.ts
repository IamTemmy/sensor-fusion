import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../lib/noise/engine.ts';
import {readFileSync} from 'node:fs';
function job(seed:number){const g=E.create('DOORS',0,seed);for(let i=0;i<4;i++)E.add(g,'P'+i,''+i);E.configure(g,'duos');E.setup(g);E.command(g,g.seats[0].id,{type:'ready'});return g;}
// Historical mirror-specific case replaced by museum-arenas.test.ts.

test('hide prompt is available at 40 units only for a quiet, free thief and available cover',()=>{
 const g=job(1),s=g.seats[0],spot=E.hidingSpots(g)[0];Object.assign(s,{x:spot.x+39,y:spot.y});assert.ok(E.nearbyHide(g,s));s.x=spot.x+41;assert.equal(E.nearbyHide(g,s),undefined);s.x=spot.x;
 g.noises.push({id:'scream',...spot,kind:'alarm',attached:s.id,holder:null,source:null,expires:g.now+9000,born:g.now,flight:0,vx:0,vy:0});assert.equal(E.nearbyHide(g,s),undefined);g.noises=[];s.hideCooldown=g.now+100;assert.equal(E.nearbyHide(g,s),undefined);s.hideCooldown=0;s.stun=g.now+100;assert.equal(E.nearbyHide(g,s),undefined);
});
test('hiding is explained in the guide, action bar and first-time spotted tip',()=>{
 const ui=readFileSync('components/noise/presentation.tsx','utf8'),page=readFileSync('app/page.tsx','utf8'),draw=readFileSync('lib/noise/draw.ts','utf8');
 assert.match(ui,/Sneak into wall niches to hide\. Art with a sounding alarm gives you away\./);assert.match(ui,/h\.victim===me\.id/);assert.match(ui,/\['hide','Spotted near cover!/);assert.match(page,/hidePrompt&&<kbd>SHIFT<\/kbd>/);assert.match(draw,/nearbyHide\(g,me\)/);
});
