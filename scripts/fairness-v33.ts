import * as E from '../lib/noise/engine.ts';
import {writeFileSync} from 'node:fs';
const rows=[];let maxSpread=0;
for(let seed=1;seed<=40;seed++){
 const g=E.create('ROUTES',0,seed);for(let i=0;i<4;i++)E.add(g,'P'+i,''+i);E.configure(g,'duos');E.setup(g);
 const a=E.vanFor(g,0),b=E.vanFor(g,1);
 const objectives=[['cheap',g.loot[0],g.loot[1]],['valuable',g.loot[4],g.loot[5]],['mid',g.loot[6],g.loot[7]],['jackpot',g.loot[2],g.loot[2]],['contested',g.loot[3],g.loot[3]],['plate',g.plate,g.plate]] as const;
 for(const [name,p,q]of objectives){const mint=E.routeLength(g,a,p),violet=E.routeLength(g,b,q),spread=Math.abs(mint-violet);maxSpread=Math.max(maxSpread,spread);rows.push({seed,layout:E.LAYOUT_NAMES[g.layout],objective:name,mint:+mint.toFixed(1),violet:+violet.toFixed(1),spread:+spread.toFixed(1)});}
}
if(maxSpread>=40)throw Error('Fairness gate failed '+maxSpread);
writeFileSync('docs/playtests/v33/routes.json',JSON.stringify({seeds:40,maxSpread,rows},null,2));console.log('Maximum matched route spread:',maxSpread);
