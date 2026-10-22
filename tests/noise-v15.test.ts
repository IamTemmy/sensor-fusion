import test from 'node:test';
import assert from 'node:assert/strict';
import {create,add,configure,setup,routeLength,vanFor,mirrorPoint,rotatePoint,RIVAL_LOOT_SLOTS,RIVAL_LAYOUTS,clear,distance,rescueApproachUnsafe,command,advance,sight,type Game} from '../lib/noise/engine.ts';
const job=(seed:number)=>{const g=create('V15',0,seed);for(let i=0;i<4;i++)add(g,'P'+i,''+i);configure(g,'duos');setup(g);return g;};
test('v15 equal deep wing pairs, fixed budget, central separation and route fairness across 120 seeds',()=>{
 const deep=[new Set(),new Set(),new Set()],centre=[new Set(),new Set(),new Set()];let early=false,late=false;
 for(let seed=1;seed<=120;seed++){
 const g=job(seed),m=RIVAL_LAYOUTS[g.layout],transform=m.symmetry==='rotate'?rotatePoint:mirrorPoint;
 assert.equal(g.loot.length,6);assert.equal(g.loot.reduce((v,l)=>v+l.value,0),3300);
 for(const [a,b] of [[g.loot[0],g.loot[1]],[g.loot[4],g.loot[5]]]){assert.equal(a.value,b.value);assert.deepEqual(transform(a),{x:b.x,y:b.y});assert.ok(Math.abs(routeLength(g,vanFor(g,0),a)-routeLength(g,vanFor(g,1),b))<40,JSON.stringify({seed,layout:g.layout,a,b,d0:routeLength(g,vanFor(g,0),a),d1:routeLength(g,vanFor(g,1),b)}));}
 assert.equal(g.loot[4].value,600);assert.equal(g.loot[0].value,200);
 for(const l of g.loot){assert.ok(clear(l,12,g.walls));if(l.value>300)for(const t of [0,1])assert.ok(routeLength(g,vanFor(g,t),l)>=250);}
 for(let i=0;i<g.loot.length;i++)for(let j=i+1;j<g.loot.length;j++)assert.ok(distance(g.loot[i],g.loot[j])>=65);assert.notEqual(g.loot[2].x,g.loot[3].x);
 for(const l of [g.loot[2],g.loot[3],g.plate])assert.ok(Math.abs(routeLength(g,vanFor(g,0),l)-routeLength(g,vanFor(g,1),l))<40);
 // Valuable wing sites sit on (or within one actor width of) a wing patrol segment.
 const p=g.loot[4],route=m.routes[0];const near=route.some((a,i)=>{const b=route[(i+1)%route.length],dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy)));return distance(p,{x:a.x+t*dx,y:a.y+t*dy})<15;});assert.ok(near);
 assert.ok(distance(g.plate,g.loot[2])>250);assert.equal(sight(g.plate,g.loot[2],g.walls),false);
 deep[g.layout].add(JSON.stringify(g.loot[4].home));centre[g.layout].add(JSON.stringify(g.loot[2].home));
 assert.ok(g.jobEvent!.at>=20000&&g.jobEvent!.at<=65000);early ||=g.jobEvent!.at<30000;late ||=g.jobEvent!.at>55000;
 if(g.jobEvent!.kind==='vault'){assert.equal(g.loot[3].sealed,true);assert.equal(g.loot[4].sealed,undefined);assert.equal(g.loot[5].sealed,undefined);}
 }for(let l=0;l<3;l++){assert.equal(deep[l].size,3);assert.equal(centre[l].size,3);}assert.ok(early&&late);
});
test('Follow waits outside the facing captor before rescue, even during captor retreat',()=>{
 const g=job(1);g.walls=[];g.jobEvent=undefined;g.crewMode='coop';g.seats=g.seats.slice(0,2);const [human,echo]=g.seats;echo.team=human.team=0;echo.bot=true;echo.mode='follow';for(const s of g.seats)command(g,s.id,{type:'ready'});
 human.x=450;human.y=300;human.stun=g.now+6000;human.capturedBy='guard';echo.x=550;echo.y=300;
 const h={...g.guards[0],id:'guard',x:470,y:300,angle:0,retreatUntil:g.now+3500};g.guards=[h];assert.equal(rescueApproachUnsafe(g,echo,human,h),true);
 const before=distance(echo,human);advance(g,g.now+40);assert.equal(echo.rescueId,null);assert.ok(distance(echo,human)>=before);
 h.angle=Math.PI;assert.equal(rescueApproachUnsafe(g,echo,human,h),false);
});
