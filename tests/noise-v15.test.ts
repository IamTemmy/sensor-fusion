import test from 'node:test';
import assert from 'node:assert/strict';
import {create,add,configure,setup,routeLength,vanFor,mirrorPoint,rotatePoint,RIVAL_LOOT_SLOTS,RIVAL_LAYOUTS,clear,distance,rescueApproachUnsafe,command,advance,sight,type Game} from '../lib/noise/engine.ts';
const job=(seed:number)=>{const g=create('V15',0,seed);for(let i=0;i<4;i++)add(g,'P'+i,''+i);configure(g,'duos');setup(g);return g;};
// Historical mirror-specific case replaced by museum-arenas.test.ts.

test('Follow uses the safe captor retreat window, but respects an active facing captor',()=>{
 const g=job(1);g.walls=[];g.jobEvent=undefined;g.crewMode='coop';g.seats=g.seats.slice(0,2);const [human,echo]=g.seats;echo.team=human.team=0;echo.bot=true;echo.mode='follow';for(const s of g.seats)command(g,s.id,{type:'ready'});
 human.x=450;human.y=300;human.stun=g.now+6000;human.capturedBy='guard';echo.x=550;echo.y=300;
 const h={...g.guards[0],id:'guard',x:470,y:300,angle:0,retreatUntil:g.now+3500};g.guards=[h];assert.equal(rescueApproachUnsafe(g,echo,human,h),false);
 const before=distance(echo,human);advance(g,g.now+40);assert.equal(echo.rescueId,null);assert.ok(distance(echo,human)<before);
 h.retreatUntil=0;h.angle=Math.atan2(echo.y-h.y,echo.x-h.x);assert.equal(rescueApproachUnsafe(g,echo,human,h),true);
 h.angle+=Math.PI;assert.equal(rescueApproachUnsafe(g,echo,human,h),false);
});
