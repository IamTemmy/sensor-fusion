import {create,add,configure,fillCrews,setup,command,advance,action,steer,distance,EXIT,VAN_RADIUS,vanFor,homeSafe,stars,thiefWalls,crewScores,sight,clear,interaction,type Game,type Thief,type Vec} from '../lib/noise/engine.ts';
function go(g:Game,s:Thief,target:Vec){const n=steer(s,target,thiefWalls(g,s)),d=distance(s,n)||1;command(g,s.id,{type:'input',match:g.match,seq:s.lastSeq+1,dx:(n.x-s.x)/d,dy:(n.y-s.y)/d});}
function throwSpot(g:Game,s:Thief){const crew=g.seats.filter(p=>p.team===s.team&&!p.escaped);const pts=[{x:s.x-240,y:s.y},{x:s.x+240,y:s.y},{x:s.x,y:s.y-240},{x:s.x,y:s.y+240}].filter(p=>clear(p,12,g.walls)&&sight(s,p,g.walls));return pts.sort((a,b)=>Math.min(...crew.map(c=>distance(c,b)))-Math.min(...crew.map(c=>distance(c,a))))[0]||{x:s.x+200,y:s.y-200};}
function simulate(mode:'coop'|'duos',policy:'naive'|'noise'|'fetch'|'teamwork',seed:number,cover=false){const g=create('SIM',1000,seed),s=add(g,'Human','human');add(g,'Echo','bot',true);if(mode==='duos'){configure(g,mode);g.seats[1].team=0;fillCrews(g);}setup(g);command(g,s.id,{type:'ready'});action(g,s,'help:'+ (policy==='fetch'?'fetch':cover||policy==='teamwork'?'cover':'follow'));const home=vanFor(g,s.team);let catches=0,oldStun=0;let recover:string|null=null;let stage='';let botPlants=0,lastEvent=0;
 for(let i=0;i<3000&&g.phase==='playing';i++){
 if(s.stun>g.now&&s.stun!==oldStun){catches++;oldStun=s.stun;recover=null;stage='';}
 if(policy==='fetch'&&g.seats.some(p=>p.bot&&p.team===s.team&&p.mode==='follow'))action(g,s,'help:fetch');
 if(!s.escaped&&s.stun<=g.now){command(g,s.id,{type:'input',seq:s.lastSeq+1,match:g.match,dx:0,dy:0});
 const held=g.loot.find(l=>l.id===s.hand),bottle=g.noises.find(n=>n.id===s.hand);
 const loot=g.loot.filter(l=>!l.banked&&!l.holder&&!l.locked&&!l.sealed).sort((a,b)=>distance(a,s)-distance(b,s))[0];
 if(policy==='noise'&&bottle){action(g,s,'throw',throwSpot(g,s));if(!s.hand)stage='pickup';}
 else if(policy==='noise'&&recover&&stage==='capture'){action(g,s,'grab');}
 else if(policy==='noise'&&recover&&stage==='pickup'){const l=g.loot.find(l=>l.id===recover);if(l&&!l.banked&&!l.holder){go(g,s,l);if(distance(s,l)<50)action(g,s,'grab');if(s.hand===l.id){recover=null;stage='';}}else {recover=null;stage='';}}
 else if(held){const scream=g.noises.find(n=>n.attached===s.id);if(policy==='noise'&&scream&&distance(s,home)>100){const id=held.id;action(g,s,'drop');if(!s.hand){recover=id;stage='capture';}}else go(g,s,home);}
 else if(policy==='teamwork'&&!loot&&g.loot.some(l=>l.value===1200&&!l.banked)&&g.end-g.now>12000){go(g,s,g.plate);}
 else if(g.end-g.now<7000||!loot){go(g,s,home);if(homeSafe(g,s))action(g,s,'extract');}
 else {go(g,s,loot);if(distance(s,loot)<50&&interaction(g,s).kind==='loot')action(g,s,'grab');}
 }
 advance(g,g.now+40);for(const e of g.events){if(e.id>lastEvent&&e.text.includes('planted an alarm')&&!e.text.startsWith('Human'))botPlants++;}lastEvent=g.events.at(-1)?.id||lastEvent;
 }
 const scores=crewScores(g),own=scores.find(x=>x.team===s.team)!.bank,other=Math.max(0,...scores.filter(x=>x.team!==s.team).map(x=>x.bank));return {win:mode==='coop'?g.success:own>other,bank:own,lockdown:g.lockdown,catches,captures:s.captures,layout:g.layout,stars:stars(g,s.team),botPlants};}
const results=[];
for(const mode of ['coop','duos'] as const)for(const policy of ['naive','noise','fetch','teamwork'] as const)for(const cover of mode==='coop'&&policy==='naive'?[false,true]:[false]){if(process.env.SIM_MODE&&process.env.SIM_MODE!==mode)continue;const runs=Array.from({length:20},(_,i)=>simulate(mode,policy,1001+i,cover)),avg=(key:'bank'|'catches'|'captures')=>runs.reduce((a,r)=>a+r[key],0)/runs.length,mean=avg('bank');results.push({mode,policy,echo:policy==='fetch'?'repeated-fetch':cover||policy==='teamwork'?'cover':'follow',n:runs.length,winRate:runs.filter(r=>r.win).length/20,meanBank:mean,minBank:Math.min(...runs.map(r=>r.bank)),maxBank:Math.max(...runs.map(r=>r.bank)),bankStdDev:Math.round(Math.sqrt(runs.reduce((a,r)=>a+(r.bank-mean)**2,0)/20)),lockdownRate:runs.filter(r=>r.lockdown).length/20,meanCatches:avg('catches'),meanHumanAlarms:avg('captures'),starRates:[0,1,2,3].map(n=>runs.filter(r=>r.stars===n).length/runs.length),runsWithBotPlants:runs.filter(r=>r.botPlants>0).length});}
console.log(JSON.stringify({seeds:'1001–1020',note:'Equal pathfinding, full visible map; noise policy drops/captures/throws its scream; Fetch repeatedly orders one-piece Fetch; teamwork uses Cover then holds the plate. Bot plants counted over the complete match event stream. Not a human skill benchmark. All wins strict; ties not wins.',results},null,2));
