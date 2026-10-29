import {museumIdentity} from './museum-identity';
import {arenaDefinition,staffDoors,hidingSpots,distance,type View,type Game,type Vec} from './engine.ts';
const cache=new Map<string,{x:number;y:number;name:string}[]>();
/** Deterministic open-floor placement, shared by canvas and map. Dock names live only in bays. */
export function roomLabels(g:Game|View,unit=7){
 const key=JSON.stringify([g.crewMode,g.layout,unit,g.walls,g.loot.map(l=>l.home||l),g.plate,hidingSpots(g),g.guards.map(h=>h.sentry)]);const cached=cache.get(key);if(cached)return cached;
 const used:{x:number;y:number;w:number;h:number}[]=[];
 const result=arenaDefinition(g).rooms.filter(r=>!r.name.includes('DOCK')).flatMap((r,index)=>{
  const label=g.arena?museumIdentity(g.layout).rooms[index%8].toUpperCase():r.name.replace(/^(MINT|VIOLET|WEST|EAST) /,'');const width=label.length*unit,height=16;const choices:Vec[]=[];
  for(let dy=-140;dy<=140;dy+=20)for(let dx=-180;dx<=180;dx+=20)choices.push({x:r.x+dx,y:r.y+dy});
  choices.sort((a,b)=>distance(a,r)-distance(b,r));
  const p=choices.find(p=>p.x-width/2>30&&p.x+width/2<930&&p.y>55&&p.y<555&&
   g.walls.every(w=>p.x+width/2<w.x-8||p.x-width/2>w.x+w.w+8||p.y+4<w.y-8||p.y-height>w.y+w.h+8)&&
   staffDoors(g).every(d=>Math.abs(d.x-p.x)>width/2+30||Math.abs(d.y-p.y)>35)&&
   [...g.loot.map(l=>l.home||l),g.plate,...hidingSpots(g),...g.guards.flatMap(h=>h.sentry?[h.sentry]:[])].every(q=>Math.abs(q.x-p.x)>width/2+30||Math.abs(q.y-p.y)>55)&&
   used.every(b=>Math.abs(b.x-p.x)>(b.w+width)/2+10||Math.abs(b.y-p.y)>height+8));
  if(!p)return [];used.push({...p,w:width,h:height});return [{...p,name:label}];
 });
 if(cache.size>24)cache.clear();cache.set(key,result);return result;
}
