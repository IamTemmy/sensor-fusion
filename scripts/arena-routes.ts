import {clear,distance,sight,type Game,type Vec} from '../lib/noise/engine.ts';
// Body-clear 10-unit navigation grid. The alternative avoids a 45-unit disc
// on the first route: it must use another passage or a genuinely wide hall.
export function routePair(g:Game,start:Vec,end:Vec){
 const size=10,cols=96,valid=(p:Vec)=>clear(p,13,g.walls);
 const snap=(p:Vec)=>{const a:Vec[]=[];for(let y=-20;y<=20;y+=10)for(let x=-20;x<=20;x+=10){const q={x:Math.round(p.x/10)*10+x,y:Math.round(p.y/10)*10+y};if(valid(q)&&sight(p,q,g.walls))a.push(q);}return a.sort((a,b)=>distance(a,p)-distance(b,p))[0];};
 const a=snap(start),b=snap(end);if(!a||!b)return [];
 const key=(p:Vec)=>p.y/size*cols+p.x/size;
 let avoidance=45;const search=(avoid?:Vec)=>{const queue=[a],prev=new Map<number,Vec|null>([[key(a),null]]);for(let i=0;i<queue.length;i++){const p=queue[i];if(key(p)===key(b)){const path:Vec[]=[];let q:Vec|null=p;while(q){path.push(q);q=prev.get(key(q))!;}return path.reverse();}for(const [dx,dy]of [[10,0],[-10,0],[0,10],[0,-10]]){const q={x:p.x+dx,y:p.y+dy};if(!prev.has(key(q))&&valid(q)&&(!avoid||distance(q,avoid)>=avoidance)){prev.set(key(q),p);queue.push(q);}}}return [];};
 const first=search();if(!first.length)return [];
 if(distance(a,b)<180)avoidance=25;const middle=first.filter(p=>distance(p,a)>avoidance+15&&distance(p,b)>avoidance+15);const pivot=middle[Math.floor(middle.length/2)];if(!pivot)return [first];const second=search(pivot);return second.length?[first,second]:[first];
}
