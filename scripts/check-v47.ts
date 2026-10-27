import * as E from '../lib/noise/engine.ts';
for(const mode of ['coop','duos'] as const)for(let sd=1;sd<=15;sd++){
 const g=E.create('T',0,sd);E.add(g,'Human','tok');E.configure(g,mode);E.fillCrews(g);E.setup(g);E.command(g,g.host,{type:'ready'});const hist=new Map<string,{x:number,y:number,at:number}>(),printed=new Set<string>();
 while(g.phase==='playing'){
 const s=g.seats[0],l=g.loot.filter(l=>!l.banked&&!l.holder&&!l.locked&&!l.sealed).sort((a,b)=>E.distance(a,s)-E.distance(b,s))[0],target=s.hand||!l?E.vanFor(g,0):l,next=E.steer(s,target,E.thiefWalls(g,s)),d=E.distance(s,next)||1;
 E.command(g,s.id,{type:'input',seq:s.lastSeq+1,dx:(next.x-s.x)/d,dy:(next.y-s.y)/d});if(!s.hand&&l&&E.distance(s,l)<50)E.action(g,s,'grab');E.advance(g,g.now+40);
 for(const h of g.guards){if(!E.guardActive(g,h)||h.sentry)continue;const old=hist.get(h.id);if(!old||E.distance(h,old)>10)hist.set(h.id,{x:h.x,y:h.y,at:g.now});else if(g.now-old.at>6000&&!printed.has(h.id)){printed.add(h.id);console.log(JSON.stringify({mode,sd,layout:g.layout,now:g.now,h}));}}
 }
}
