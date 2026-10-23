/** Presentation-only sweep during protected grace; never alters simulation positions. */
export function openingSweep(g:{now:number;start:number;crewMode:string},h:{id:string;x:number;y:number},reduced=false){
 const active=g.now-g.start>=0&&g.now-g.start<12000&&(h.id==='g-core'||h.id==='g-pro'&&g.crewMode==='coop'||h.id==='g0'||g.crewMode!=='coop'&&h.id==='g1');
 if(!active||reduced)return h;
 const phase=(g.now-g.start)%4000/4000,offset=Math.sin(Math.PI*phase)**2*24;
 return {...h,x:h.x+(h.x>480?-offset:offset)};
}
