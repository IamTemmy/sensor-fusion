import {writeFileSync,mkdirSync} from 'node:fs';
import {create,add,configure,setup,RIVAL_LAYOUTS,RIVAL_REINFORCEMENTS,PEDESTALS,mirrorPoint,rotatePoint,vanFor,steer,move,distance,thiefWalls,type Game,type Vec} from '../lib/noise/engine.ts';
const dir=process.env.NOISE_AUDIT_DIR||'docs/playtests/v13';mkdirSync(dir,{recursive:true});
function job(layout:number,rival:boolean){for(let seed=1;;seed++){const g=create('AUDIT',1000,seed);for(let i=0;i<(rival?4:2);i++)add(g,'P'+i,''+i);if(rival)configure(g,'duos');setup(g);if(g.layout===layout)return g;}}
function length(g:Game,team:number,t:Vec){const walls=thiefWalls(g,{team}),p={...vanFor(g,team)};let total=0;for(let i=0;i<6000&&distance(p,t)>1;i++){const old={...p},n=steer(p,t,walls),d=distance(p,n);if(!d)break;move(p,(n.x-p.x)/d,(n.y-p.y)/d,.01,Math.min(100,d/.01),walls);total+=distance(old,p);}if(distance(p,t)>1)throw Error(`unreachable ${g.layout} ${team} ${JSON.stringify(t)}`);return Math.round(total);}
const report=[];
for(let layout=0;layout<3;layout++)for(const rival of [true,false]){
 const g=job(layout,rival),m=RIVAL_LAYOUTS[layout],transform=m.symmetry==='rotate'?rotatePoint:mirrorPoint;
 const slots=rival?[...m.slots,...m.slots.map(transform)]:PEDESTALS;
 let svg=`<svg xmlns="http://www.w3.org/2000/svg" width="960" height="680" viewBox="0 0 960 680"><rect width="960" height="680" fill="#101d28"/><style>text{font-family:monospace;fill:#e5edf2;font-size:12px}</style><text x="24" y="625">${rival?'RIVALS':'CO-OP'} / ${['ECHO GALLERY','NIGHT ARCHIVE','CROSSROADS'][layout]}</text><text x="24" y="650">Grey walls · Red sensors · Dashed patrols · Hollow gold slots · J jackpot · P plate · I idol</text>`;
 for(const w of g.walls)svg+=`<rect x="${w.x}" y="${w.y}" width="${w.w}" height="${w.h}" fill="#526879"/>`;
 for(const h of [...g.guards,...(rival?[{route:RIVAL_REINFORCEMENTS[layout]}]:[])]){const color=['#ff8d92','#bc9bff','#66c9f0'][g.guards.indexOf(h as typeof g.guards[number])]||'#dfe29b';svg+=`<polyline points="${[...h.route,h.route[0]].map(p=>p.x+','+p.y).join(' ')}" fill="none" stroke="${color}" stroke-width="2" stroke-dasharray="8 5"/>`;}
 for(const a of g.sensors!)svg+=`<rect x="${a.x}" y="${a.y}" width="${a.w}" height="${a.h}" fill="#ff5555" opacity=".65"/>`;
 for(const p of slots)svg+=`<circle cx="${p.x}" cy="${p.y}" r="12" fill="none" stroke="#ffcf70" stroke-width="2"/>`;
 for(const l of g.loot)svg+=`<circle cx="${l.x}" cy="${l.y}" r="7" fill="#ffcf70"/><text x="${l.x+14}" y="${l.y+5}">${l.value===1200?'J':l.value===1000?'I':l.value}</text>`;
 svg+=`<rect x="${g.plate.x-10}" y="${g.plate.y-10}" width="20" height="20" fill="#b69bff"/><text x="${g.plate.x+16}" y="${g.plate.y+5}">P</text>`;
 for(const team of [...new Set(g.seats.map(s=>s.team))]){const v=vanFor(g,team);svg+=`<rect x="${v.x-35}" y="${v.y-35}" width="70" height="70" fill="${team?'#9364bb':'#33866d'}"/><text x="${v.x-28}" y="${v.y+4}">${team?'VIOLET':'MINT'}</text>`;}
 writeFileSync(`${dir}/${rival?'rivals':'coop'}-${layout}.svg`,svg+'</svg>');
 if(rival){const rows=m.slots.map((p,i)=>({target:'own wing pair '+(i+1),mint:length(g,0,p),violet:length(g,1,transform(p))}));for(const [target,p] of [['idol',m.idol],['jackpot',m.jackpot],['plate',m.plate]] as [string,Vec][])rows.push({target,mint:length(g,0,p),violet:length(g,1,p)});report.push({layout,rows:rows.map(r=>({...r,spread:Math.abs(r.mint-r.violet)}))});}
}
writeFileSync(`${dir}/routes.json`,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
