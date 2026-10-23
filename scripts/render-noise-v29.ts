import {mkdirSync,writeFileSync} from 'node:fs';
import {create,add,configure,setup,vanFor,RIVAL_LAYOUTS,PEDESTALS,RIVAL_LOOT_SLOTS,mirrorPoint,rotatePoint,LAYOUT_NAMES} from '../lib/noise/engine.ts';
const dir='docs/playtests/v29';mkdirSync(dir,{recursive:true});
const index=[];
for(const mode of ['coop','duos'] as const)for(let layout=0;layout<3;layout++){
 let sample=0;const seen=new Set<string>();for(let seed=1;sample<4;seed++){
 const g=create('RENDER',0,seed);for(let i=0;i<(mode==='coop'?2:4);i++)add(g,'P'+i,''+i);configure(g,mode);setup(g);if(g.layout!==layout)continue;const signature=JSON.stringify(g.loot.map(l=>[l.x,l.y]));if(seen.has(signature))continue;seen.add(signature);
 const r=(x:number,y:number,w:number,h:number,fill:string)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"/>`,c=(x:number,y:number,rad:number,fill:string)=>`<circle cx="${x}" cy="${y}" r="${rad}" fill="${fill}"/>`,t=(x:number,y:number,text:string)=>`<text x="${x}" y="${y}">${text}</text>`;
 let svg=`<svg xmlns="http://www.w3.org/2000/svg" width="960" height="690"><style>text{font:12px monospace;fill:#e6eff4}</style>`+r(0,0,960,690,'#10232c');
 for(const w of g.walls)svg+=r(w.x,w.y,w.w,w.h,'#546877');
 for(const [i,h] of g.guards.entries())svg+=`<polyline points="${[...h.route,h.route[0]].map(p=>`${p.x},${p.y}`).join(' ')}" fill="none" stroke="${['#ff9b91','#c6a3ff','#7cd8ff','#e5d78c'][i]}" stroke-dasharray="6 5"/>`+c(h.x,h.y,7,'#e6c7c0');
 for(const h of g.guards)if(h.sentry)svg+=c(h.sentry.x,h.sentry.y,12,'#75b9d8')+t(h.sentry.x+14,h.sentry.y,'SENTRY');
 for(const q of g.sensors!)svg+=r(q.x,q.y,q.w,q.h,'#ef7171');
 const m=RIVAL_LAYOUTS[layout],slots=mode==='coop'?PEDESTALS:[...m.slots,...RIVAL_LOOT_SLOTS[layout].deep,...RIVAL_LOOT_SLOTS[layout].jack,...RIVAL_LOOT_SLOTS[layout].centre,...[...m.slots,...RIVAL_LOOT_SLOTS[layout].deep].map(m.symmetry==='rotate'?rotatePoint:mirrorPoint)];for(const p of slots)svg+=`<circle cx="${p.x}" cy="${p.y}" r="11" fill="none" stroke="#947948"/>`;
 for(const l of g.loot)svg+=c(l.x,l.y,8,l.sealed?'#9680c1':'#ffd080')+t(l.x+12,l.y+5,`${l.locked?'J ':''}$${l.value}${l.sealed?' VAULT':''}`);
 svg+=r(g.plate.x-10,g.plate.y-10,20,20,'#b49beb')+t(g.plate.x+14,g.plate.y+4,'PLATE');
 for(const team of [...new Set(g.seats.map(s=>s.team))]){const p=vanFor(g,team);svg+=r(p.x-35,p.y-35,70,70,team?'#725b99':'#367d68')+t(p.x-27,p.y+4,team?'VIOLET':'MINT');}
 svg+=t(20,622,`${mode.toUpperCase()} / ${LAYOUT_NAMES[layout]} / SEED ${seed} / ${g.loot.length} PIECES / $4300`)+t(20,646,`MID-JOB: ${g.jobEvent!.kind.toUpperCase()} / WARN AT ${((g.jobEvent!.at-3000)/1000).toFixed(1)}s`)+t(20,670,'Grey walls · red sensors · dashed patrols · dots are guard starts · hollow rings are slots')+'</svg>';
 const file=`${mode}-${layout}-${sample++}.svg`;writeFileSync(`${dir}/${file}`,svg);index.push({file,mode,layout,seed,event:g.jobEvent!.kind,pieces:g.loot.length});
 }}writeFileSync(`${dir}/renders.json`,JSON.stringify(index,null,2));console.log('Rendered '+index.length+' engine-data SVGs.');
