import * as E from '../tests/helpers/legacy-engine.ts';
export function verify(){
let heldCaught=0, afterCaught=0, rescued=0;
const rows:any[]=[];
for (let sd=1; sd<=40; sd++) {
  const g:any=E.create('T',0,sd); E.add(g,'Human','tok'); const H=g.seats[0].id; g.host=H;
  E.command(g,H,{type:'bot'}); E.command(g,H,{type:'start'}); E.command(g,H,{type:'ready'});
  let seq=0; const s=g.seats[0], e=g.seats[1];
  E.advance(g,g.now+13000);
  let cap=-1;
  for (let i=0;i<400&&cap<0;i++){
    const gd=g.guards[0]; const nx=E.steer(s,gd,g.walls);
    const dx=nx.x-s.x, dy=nx.y-s.y, d=Math.hypot(dx,dy)||1;
    E.command(g,H,{type:'input',seq:++seq,dx:dx/d,dy:dy/d}); E.advance(g,g.now+40);
    if (s.stun>g.now) cap=g.now;
  }
  if (cap<0) continue;
  let free=-1, ecap=-1;
  for (let i=0;i<300;i++){
    if (free>=0){ const nx=E.steer(s,E.EXIT,g.walls); const dx=nx.x-s.x, dy=nx.y-s.y, d=Math.hypot(dx,dy)||1;
      E.command(g,H,{type:'input',seq:++seq,dx:dx/d,dy:dy/d}); }
    else E.command(g,H,{type:'input',seq:++seq,dx:0,dy:0});
    E.advance(g,g.now+40);
    if (free<0 && s.stun<=g.now){ free=g.now; if (e.rescues) rescued++; }
    if (ecap<0 && e.stun>g.now) ecap=g.now;
  }
  if (ecap>=0 && (free<0 || ecap<free)) heldCaught++;
  if (ecap>=0 && free>=0 && ecap>=free && ecap-free<=3000) afterCaught++;
  rows.push({seed:sd,cap,free,ecap,rescues:e.rescues});
}
return {heldCaught,afterCaught,rescued,captures:rows.length,rows};
}
if(process.argv[1]?.endsWith('verify-noise-v21.ts'))console.log(JSON.stringify(verify(),null,2));
