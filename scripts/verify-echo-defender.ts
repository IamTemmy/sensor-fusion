import * as E from '../lib/noise/engine.ts';
const rows=[];
for(const cover of [false,true]){let banked=0,captured=0,calls=0;for(let seed=1001;seed<=1040;seed++){
 const g=E.create('COVER',0,seed),a=E.add(g,'Carrier','a'),b=E.add(g,'Echo','b',true);g.difficulty='normal';E.setup(g);E.command(g,a.id,{type:'ready'});g.now=g.start+20000;g.end=g.now+30000;g.jobEvent=undefined;g.sensors=[];g.hideSpots=[];g.walls=E.WALLS.slice(0,4);g.alarmAt=Infinity;
 Object.assign(a,{x:700+(seed%5)*8,y:220,hand:'fixture-art',safe:0});Object.assign(b,{x:a.x+65,y:185,mode:'cover',escaped:!cover});
 const art={...g.loot[0],id:'fixture-art',value:500,holder:a.id,banked:false,locked:false,x:a.x,y:a.y,home:{x:a.x,y:a.y}};g.loot=[art];g.noises=[{id:'carrier-alarm',x:a.x,y:a.y,holder:null,attached:a.id,source:art.id,expires:g.end,born:g.now-1000,vx:0,vy:0,flight:0,kind:'alarm',alerted:true}];
 // Two seconds of carrier movement separate thief and pursuer at the start.
 const lead=E.carrySpeed(500)*2,guard={...g.guards[0],x:a.x+lead*.8,y:a.y-lead*.6,angle:Math.atan2(.6,-.8),mode:'chase' as const,victim:a.id,target:{x:a.x,y:a.y},attention:g.now+1600,entered:true,entryAt:undefined,sentry:undefined,sentryArt:undefined,route:[{x:800,y:80},{x:800,y:500}],way:0};g.guards=[guard];
 const until=g.now+16000;while(g.now<until&&!art.banked&&a.stun<=g.now){const home=E.vanFor(g,a.team),d=E.distance(a,home)||1;E.command(g,a.id,{type:'input',seq:a.lastSeq+1,dx:(home.x-a.x)/d,dy:(home.y-a.y)/d});E.advance(g,g.now+40);}
 if(art.banked)banked++;if(a.stun>g.now)captured++;if(b.defendAt!==undefined)calls++;
 }rows.push({cover,n:40,banked,captured,interventions:calls,bankRate:banked/40});}
console.log(JSON.stringify(rows,null,2));if(rows[1].bankRate<.7||rows[1].bankRate<=rows[0].bankRate)process.exitCode=1;
