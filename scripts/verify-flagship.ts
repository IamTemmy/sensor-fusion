import * as E from '../lib/noise/engine.ts';
import {writeFileSync,mkdirSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {performance} from 'node:perf_hooks';
const mode=process.env.FLAGSHIP_GATE||'idle',out='docs/playtests/flagship-velmont';mkdirSync(out,{recursive:true});
const hash=createHash('sha256').update(readFileSync('lib/noise/engine.ts')).update(readFileSync('lib/noise/flagship-arena.ts')).digest('hex');
function make(seed:number,n:number,level:E.Difficulty,swap=0){const g=E.create('GATE',0,seed);E.add(g,'Human','h');for(let i=1;i<n;i++)E.add(g,'Bot '+i,'b'+i,true);if(n===4)E.configure(g,'duos');g.difficulty=level;g.match=swap;E.setup(g);E.command(g,g.host,{type:'ready'});return g;}
function go(g:E.Game,s:E.Thief,t:E.Vec){const p=E.steer(s,t,E.thiefWalls(g,s)),d=E.distance(s,p)||1;E.command(g,s.id,{type:'input',seq:s.lastSeq+1,dx:(p.x-s.x)/d,dy:(p.y-s.y)/d});}
function naive(g:E.Game){const s=g.seats[0];if(s.stun>g.now||s.escaped)return;const l=g.loot.filter(l=>!l.banked&&!l.holder&&!l.locked&&!l.sealed).sort((a,b)=>E.distance(s,a)-E.distance(s,b))[0];const t=s.hand||!l||g.end-g.now<7000?E.vanFor(g,0):l;go(g,s,t);if(!s.hand&&l&&E.distance(s,l)<50&&E.interaction(g,s).kind==='loot')E.action(g,s,'grab');if(g.end-g.now<7000&&E.homeSafe(g,s))E.action(g,s,'extract');}
let result:any;
if(mode==='idle'){
 const cases=[];for(let i=0;i<30;i++){if(process.env.FLAGSHIP_CASE&&i!==Number(process.env.FLAGSHIP_CASE))continue;const level=(['rookie','normal','pro'] as const)[Math.floor(i/2)%3],n=i%2?4:2,g=make(1001+i,n,level,Math.floor(i/6)%2);const history=new Map<string,E.Vec&{at:number}>(),stalls:any[]=[],seen=new Set<string>();
 while(g.phase==='playing'){naive(g);E.advance(g,g.now+40);for(const b of g.seats.filter(s=>s.bot)){if(process.env.FLAGSHIP_TRACE&&b.id==='p4'&&g.now>=64000&&g.now%400===0)console.error(JSON.stringify({at:g.now,...b,interaction:E.interaction(g,b).kind,hidden:E.hidden(g,b)}));
 const waiting=b.escaped||b.stun>g.now||E.homeSafe(g,b)||E.hidden(g,b)||(b.rescueId&&g.now-b.rescueAt<1300)||(b.bottleId&&g.now-b.bottleAt<1500)||b.windup>g.now||(b.task==='wait-rescue'&&g.seats.some(p=>p.team===b.team&&!p.escaped&&p.stun>g.now))||(E.vaultReady(g)&&E.distance(b,g.plate)<30&&g.loot.some(l=>l.locked&&!l.banked&&!l.holder));
 if(waiting){history.delete(b.id);continue;}const h=history.get(b.id);if(!h||E.distance(b,h)>10)history.set(b.id,{x:b.x,y:b.y,at:g.now});else if(g.now-h.at>=6000&&!seen.has(b.id)){seen.add(b.id);stalls.push({id:b.id,at:g.now,x:b.x,y:b.y,task:b.task,mode:b.mode,hand:b.hand,rescueId:b.rescueId,crew:g.seats.filter(s=>s.team===b.team).map(s=>({id:s.id,x:s.x,y:s.y,stun:s.stun})),guards:g.guards.map(h=>({id:h.id,x:h.x,y:h.y,mode:h.mode}))});}
 }}cases.push({seed:1001+i,n,level,swap:Math.floor(i/6)%2,stalls});}
 result={matches:cases.length,stalls:cases.reduce((n,c)=>n+c.stalls.length,0),cases};
}else if(mode==='rush'){
 const cases=[];for(const level of ['rookie','normal','pro'] as const)for(let seed=1001;seed<=1040;seed++){
 const g=make(seed,2,level),h=g.seats[0],b=g.seats[1],c=g.loot[2];b.bot=false;let pickup:number|null=null,bank:number|null=null;
 while(g.phase==='playing'){go(g,b,g.plate);go(g,h,h.hand?E.vanFor(g,h.team):c);if(!h.hand&&E.distance(h,c)<50)E.action(g,h,'grab');E.advance(g,g.now+40);if(c.holder===h.id&&pickup===null)pickup=(g.now-g.start)/1000;if(c.banked){bank=(g.now-g.start)/1000;break;}}
 cases.push({seed,level,pickupSeconds:pickup,bankSeconds:bank});}
 result={matches:cases.length,earlyBanks:cases.filter(c=>c.bankSeconds!==null&&c.bankSeconds<45).length,banks:cases.filter(c=>c.bankSeconds!==null).length,earliestBankSeconds:Math.min(...cases.flatMap(c=>c.bankSeconds===null?[]:[c.bankSeconds])),cases};
}else if(mode==='patrol'){
 const cases=[];for(const level of ['rookie','normal','pro'] as const)for(const seed of [1001,1013,1040]){const g=make(seed,2,level);g.sensors=[];g.jobEvent=undefined;g.seats.forEach(s=>{s.bot=false;s.safe=200000;});const hist=new Map<string,E.Vec&{at:number}>(),stalls=new Set<string>();let archivePass=false;
 while(g.phase==='playing'){E.advance(g,g.now+40);for(const h of g.guards){if(h.sentry||!E.guardActive(g,h)){hist.delete(h.id);continue;}if(h.x>24&&h.x<278&&h.y>120&&h.y<250)archivePass=true;const old=hist.get(h.id);if(!old||E.distance(old,h)>10)hist.set(h.id,{x:h.x,y:h.y,at:g.now});else if(g.now-old.at>=6000)stalls.add(h.id);}}cases.push({level,seed,stalls:[...stalls],archivePass});}result={matches:cases.length,stalls:cases.reduce((n,c)=>n+c.stalls.length,0),archivePasses:cases.filter(c=>c.archivePass).length,cases};
}else if(mode==='cpu'){
 const cases=[];for(const n of [2,4])for(const level of ['rookie','normal','pro'] as const){const g=make(1003,n,level),times:number[]=[],slowTicks:{at:number;ms:number}[]=[];while(g.phase==='playing'){naive(g);const at=performance.now();E.advance(g,g.now+40);const ms=performance.now()-at;times.push(ms);if(ms>=20)slowTicks.push({at:g.now-g.start,ms});}times.sort((a,b)=>a-b);cases.push({n,level,ticks:times.length,p95:times[Math.floor(times.length*.95)],max:times.at(-1),slowTicks});}result={cases,p95:Math.max(...cases.map(c=>c.p95)),max:Math.max(...cases.map(c=>c.max!))};
}else throw Error('Unknown gate');
result={engineAndGeometryHash:hash,...result};writeFileSync(out+'/'+mode+'.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));if((mode==='idle'||mode==='patrol')&&result.stalls||mode==='rush'&&result.earlyBanks||mode==='cpu'&&(result.p95>=8||result.max>=40))process.exitCode=1;
