import * as E from '../lib/noise/engine.ts';
import {flagshipArena} from '../lib/noise/flagship-arena.ts';
import {archiveArena} from '../lib/noise/archive-arena.ts';
export function rescuePassRuns(engine:typeof E=E,count=30){const rows=[];for(const museum of ['flagship-velmont','night-archive']){const runs=[];for(let seed=1001;seed<1001+count;seed++){
 const g=engine.create('RESCUE',0,seed);engine.add(g,'Human','h');engine.add(g,'Echo','b',true);engine.setup(g,(_,n)=>museum==='night-archive'?archiveArena(n):flagshipArena(n));engine.command(g,g.host,{type:'ready'});g.now=32000;g.start=0;g.end=90000;g.jobEvent=undefined;
 const [h,b]=g.seats;const pairs:Array<{a:E.Vec;b:E.Vec}>=[];for(let y=80;y<=520;y+=40)for(let x=80;x<=840;x+=40)for(const d of [{x:120,y:0},{x:0,y:120}]){const a={x,y},p={x:x+d.x,y:y+d.y};if(engine.clear(a,13,g.walls)&&engine.clear(p,13,g.walls)&&engine.sight(a,p,g.walls)&&!engine.homeSafe(g,{...h,...a})&&!engine.homeSafe(g,{...b,...p}))pairs.push({a,b:p});}
 const pair=pairs[(seed-1001)*17%pairs.length];Object.assign(h,pair.a,{stun:0,hand:null,cooldown:0});Object.assign(b,pair.b,{stun:0,hand:null,mode:'auto'});
 // Isolate the reported pass/rescue decision: no guards in the 300u vicinity.
 g.guards=g.guards.filter(q=>engine.distance(q,h)>300&&engine.distance(q,b)>300);
 const art=g.loot.find(l=>l.value===500)!;Object.assign(art,{holder:h.id,x:h.x,y:h.y,claimed:true,locked:false,sealed:false});h.hand=art.id;engine.action(g,h,'throw:'+art.id,b);if(!art.flight)throw Error('fixture pass failed');h.stun=g.now+6000;const start=g.now;let first:number|null=null,bank:number|null=null,freed=false,freedAt:number|null=null,ground=false;
 while(g.now-start<15000){engine.advance(g,g.now+40);if(art.holder===b.id&&first===null)first=g.now-start;if(art.droppedAt!==undefined)ground=true;if(art.banked&&bank===null)bank=g.now-start;if(h.stun<=g.now){freed=true;if(freedAt===null)freedAt=g.now-start;}}
 runs.push({seed,from:pair.a,to:pair.b,first,bank,freed,freedAt,ground,end:{x:b.x,y:b.y,hand:b.hand,stun:b.stun,holder:art.holder},events:g.events});
 }rows.push({museum,n:runs.length,first:runs.filter(r=>r.first!==null&&r.first<=(r.freedAt??15000)).length,banked:runs.filter(r=>r.bank!==null).length,freed:runs.filter(r=>r.freed).length,runs});}return rows;}
