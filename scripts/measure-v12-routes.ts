import {create,add,configure,fillCrews,setup,vanFor,steer,move,distance,thiefWalls,type Game} from '../lib/noise/engine.ts';
const out=[];
for(let layout=0;layout<3;layout++){
 let g:Game;for(let seed=1;;seed++){g=create('ROUTES',1000,seed);for(let i=0;i<6;i++)add(g,'Human'+i,'t'+i);configure(g,'duos');fillCrews(g);setup(g);if(g.layout===layout)break;}
 const targets=[...g.loot.map(l=>({name:l.name,x:l.x,y:l.y})),{name:'Plate',...g.plate}];
 const rows=targets.map(t=>{const ds=[0,1,2].map(team=>{const walls=thiefWalls(g,{team}),p={...vanFor(g,team)};let d=0;for(let i=0;i<4000&&distance(p,t)>1;i++){const before={...p},next=steer(p,t,walls),len=distance(p,next);if(!len)throw Error('Unreachable route');move(p,(next.x-p.x)/len,(next.y-p.y)/len,.01,Math.min(100,len/.01),walls);d+=distance(p,before);}if(distance(p,t)>1)throw Error('Route did not converge');return Math.round(d);});return {target:t.name,x:t.x,y:t.y,mint:ds[0],violet:ds[1],amber:ds[2],spread:Math.max(...ds)-Math.min(...ds)};});out.push({layout,rows});
}
console.log(JSON.stringify({units:'world units; actual steer/move path length, van center to target; 100 units/s carrying',layouts:out},null,2));
