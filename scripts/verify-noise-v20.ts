import {pathToFileURL} from 'node:url';
import {mkdirSync,writeFileSync} from 'node:fs';
import {create,add,setup,command,advance,distance,steer,thiefWalls,vanFor,type Game,type Thief,type Vec} from '../lib/noise/engine.ts';
const go=(g:Game,s:Thief,p:Vec)=>{const n=steer(s,p,thiefWalls(g,s)),d=distance(s,n)||1;command(g,s.id,{type:'input',match:g.match,seq:s.lastSeq+1,dx:(n.x-s.x)/d,dy:(n.y-s.y)/d});};
export function claudeFixture(seed:number,warmup=false){
 const g=create('CLAUDE',1000,seed),human=add(g,'Human','h'),echo=add(g,'Echo','e',true);setup(g);command(g,human.id,{type:'ready'});
 // Normal, Auto, events ON. Start capture scenario at 13s with crew at spawn.
 // Optional warmup runs those first 13s instead, as a separate interpretation.
 if(!warmup)g.now=g.start+13000;
 let capturedAt=0,releasedAt=0,deadline=0,heldCaught=false,postCaught=false,echoBefore=echo.captures;
 for(let i=0;i<1800;i++){
  if(g.now-g.start>=13000&&!capturedAt){const patrol=g.guards.filter(h=>h.mode==='patrol').sort((a,b)=>distance(human,a)-distance(human,b))[0];if(patrol)go(g,human,patrol);}
  else if(releasedAt)go(g,human,vanFor(g,human.team));
  else command(g,human.id,{type:'input',match:g.match,seq:human.lastSeq+1,dx:0,dy:0});
  const wasHeld=human.stun>g.now;advance(g,g.now+40);
  if(!capturedAt&&human.stun>g.now){capturedAt=g.now;deadline=human.stun;}
  if(echo.captures>echoBefore){if(wasHeld||human.stun>g.now)heldCaught=true;else if(releasedAt&&g.now-releasedAt<=3000)postCaught=true;}
  echoBefore=echo.captures;
  if(capturedAt&&!releasedAt&&human.stun<=g.now)releasedAt=g.now;
  if(releasedAt&&g.now-releasedAt>=3000)break;
 }
 return {seed,layout:g.layout,capturedAt,releasedAt,rescued:!!releasedAt&&releasedAt<deadline,heldCaught,postCaught};
}
export function verify(){const runs=Array.from({length:40},(_,i)=>claudeFixture(i+1));return {n:40,captures:runs.filter(r=>r.capturedAt).length,rescues:runs.filter(r=>r.rescued).length,heldCaught:runs.filter(r=>r.heldCaught).length,postCaught:runs.filter(r=>r.postCaught).length,runs};}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){const r=verify();mkdirSync('docs/playtests/v20',{recursive:true});writeFileSync('docs/playtests/v20/'+(process.env.BASELINE?'baseline':'claude-fixture')+'.json',JSON.stringify(r,null,2));console.log(JSON.stringify({...r,runs:undefined}));}
