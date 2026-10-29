import {mkdirSync,writeFileSync} from 'node:fs';
import * as E from '../lib/noise/engine.ts';
import {routePair} from './arena-routes.ts';
const dir='docs/playtests/v68';mkdirSync(dir,{recursive:true});const rows=[];
for(const count of [2,4,6])for(let layout=0;layout<3;layout++){
 let g:E.Game|undefined;for(let seed=1;seed<100;seed++){const candidate=E.create('AUDIT',0,seed);for(let i=0;i<count;i++)E.add(candidate,'Player '+i,''+i);E.configure(candidate,count===6?'trios':'duos');E.setup(candidate);if(candidate.layout===layout){g=candidate;break;}}if(!g)throw Error('Missing map');
 const objectives=[...g.loot,{id:'plate',...g.plate,value:0}].map(p=>({id:p.id,value:p.value,x:p.x,y:p.y,routes:[0,1].map(t=>({team:t,length:Math.round(E.routeLength(g!,E.vanFor(g!,t),p)),alternatives:routePair(g!,E.vanFor(g!,t),p).length}))}));
 rows.push({id:g.arena!.id,name:g.arena!.name,players:count,guards:g.guards.length,total:g.lootTotal,objectives,sentryRoutesClear:E.sentryRoutesClear(g)});
 let svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 660"><rect width="960" height="660" fill="#112333"/><style>text{font-family:Arial;font-size:14px;fill:#e9d6a9}</style>`;
 for(const w of g.walls)svg+=`<rect x="${w.x}" y="${w.y}" width="${w.w}" height="${w.h}" fill="#68777d" stroke="#bda877"/>`;
 for(const l of g.loot)svg+=`<circle cx="${l.x}" cy="${l.y}" r="15" fill="${l.locked?'#d3a13d':'#80caba'}"/><text x="${l.x}" y="${l.y+32}" text-anchor="middle">$${l.value}</text>`;
 for(const p of E.hidingSpots(g))svg+=`<circle cx="${p.x}" cy="${p.y}" r="22" fill="#709e5522" stroke="#90c96d"/>`;
 for(const t of [0,1]){const z=E.zoneFor(g,t);svg+=`<rect x="${z.x}" y="${z.y}" width="70" height="70" fill="${t?'#9570ce':'#67cdb4'}"/>`;}
 svg+=`<rect x="${g.plate.x-12}" y="${g.plate.y-12}" width="24" height="24" fill="#ccb17a"/><text x="24" y="630">${g.arena!.name} · ${count} thieves · ${g.loot.length} exhibits · $${g.lootTotal}</text></svg>`;writeFileSync(`${dir}/${g.arena!.id}.svg`,svg);
}
writeFileSync(`${dir}/routes.json`,JSON.stringify(rows,null,2)+'\n');console.log('Nine population plans audited; routes and SVG plans saved.');
