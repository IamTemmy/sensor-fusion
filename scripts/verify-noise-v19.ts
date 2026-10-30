import {pathToFileURL} from 'node:url';
import {mkdirSync,writeFileSync} from 'node:fs';
import {create,add,setup,command,advance,distance,steer,thiefWalls,vanFor,clear,type Game,type Thief,type Vec} from '../lib/noise/engine.ts';
const go=(g:Game,s:Thief,p:Vec)=>{const n=steer(s,p,thiefWalls(g,s)),d=distance(s,n)||1;command(g,s.id,{type:'input',match:g.match,seq:s.lastSeq+1,dx:(n.x-s.x)/d,dy:(n.y-s.y)/d});};
export function releaseFixture(seed:number){
 const g=create('REJOIN',1000,seed),human=add(g,'Human','h'),echo=add(g,'Echo','e',true);setup(g);command(g,human.id,{type:'ready'});g.jobEvent=undefined;
 // Start both thieves in a seeded patrol area after onboarding grace; captures and
 // releases remain natural. Echo starts 320u away, with no immunity or forced stun.
 g.now=g.start+13000;const patrol=g.guards[seed%g.guards.length];
 const around=(p:Vec,r:number)=>Array.from({length:12},(_,i)=>({x:p.x+Math.cos((i+seed)*Math.PI/6)*r,y:p.y+Math.sin((i+seed)*Math.PI/6)*r}));
 const hp=around(patrol,100).find(p=>clear(p,13,thiefWalls(g,human)));
 if(hp){Object.assign(human,hp);const ep=around(hp,320).find(p=>clear(p,13,thiefWalls(g,echo)));if(ep)Object.assign(echo,ep);}

 let capture=0,deadline=0,release=0,rescued=false,echoCaught=false,echoFreeAtRelease=false;
 for(let i=0;i<1100;i++){
  if(!capture)go(g,human,[...g.guards].sort((a,b)=>distance(a,human)-distance(b,human))[0]);
  else if(release)go(g,human,vanFor(g,human.team));
  else command(g,human.id,{type:'input',match:g.match,seq:human.lastSeq+1,dx:0,dy:0});
  advance(g,g.now+40);
  if(!capture&&human.stun>g.now){capture=g.now;deadline=human.stun;}
  if(capture&&!release&&human.stun<=g.now){release=g.now;rescued=release<deadline;echoFreeAtRelease=echo.stun<=g.now;}
  // captures counts bottled alarms, not arrests; observe the authoritative tied state.
  if(release&&echo.stun>g.now)echoCaught=true;
  if(release&&g.now-release>=3000)break;
 }
 return {seed,layout:g.layout,capture,release,rescued,selfReleased:!!release&&!rescued,echoFreeAtRelease,echoCaught};
}
export function releaseSet(){const runs:ReturnType<typeof releaseFixture>[]=[],other:ReturnType<typeof releaseFixture>[]=[];for(let seed=1;runs.length<40&&seed<=600;seed++){const r=releaseFixture(seed);(r.selfReleased&&r.echoFreeAtRelease?runs:other).push(r);}if(runs.length!==40)throw Error('Need 40 actual self-releases');return {runs,other};}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){const report=releaseSet();mkdirSync('docs/playtests/v19',{recursive:true});writeFileSync('docs/playtests/v19/'+(process.env.BASELINE?'baseline':'release')+'.json',JSON.stringify(report,null,2));console.log(JSON.stringify({selfReleases:report.runs.length,caught:report.runs.filter(r=>r.echoCaught).length,other:report.other.length,seeds:report.runs.map(r=>r.seed)}));}
