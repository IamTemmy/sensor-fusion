import {recordKey} from '../lib/noise/records.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import {create,add,setup,configure,fillCrews,command,advance,action,interaction,difficultyOf,tuning,RIVAL_LAYOUTS,wideX,routeLength,vanFor,distance,type Difficulty} from '../lib/noise/engine.ts';
function job(seed=1,mode:'coop'|'duos'='coop',difficulty:Difficulty='normal'){const g=create('V16',1000,seed);g.difficulty=difficulty;const human=add(g,'Human','h'),echo=add(g,'Echo','b',true);if(mode==='duos'){configure(g,mode);echo.team=human.team;fillCrews(g);}setup(g);command(g,human.id,{type:'ready'});return {g,human,echo};}
test('E prefers reachable art unless a capturable alarm is strictly closer',()=>{const {g,human:s}=job();g.walls=[];s.x=300;s.y=300;const l=g.loot[0];Object.assign(l,{x:320,y:300,locked:false});g.noises=[{id:'n',x:390,y:300,holder:null,expires:g.now+5000,born:g.now,flight:0,vx:0,vy:0,kind:'alarm',source:null}];assert.equal(interaction(g,s).kind,'loot');g.noises[0].x=305;assert.equal(interaction(g,s).kind,'noise');g.noises[0].x=320;assert.equal(interaction(g,s).kind,'loot');});
test('Auto is default, manual orders persist and carrying-human switches Auto to cover',()=>{const {g,human,echo}=job();assert.equal(echo.mode,'auto');g.guards=[];g.jobEvent=undefined;human.hand=g.loot[0].id;g.loot[0].holder=human.id;human.x=400;human.y=300;advance(g,g.now+40);assert.equal(echo.task,'cover');action(g,human,'help:follow');advance(g,g.now+40);assert.equal(echo.mode,'follow');});
test('difficulty changes count and tuning; rival human crews are forced to Normal',()=>{const runs=(['rookie','normal','pro'] as const).map(d=>job(1,'duos',d));assert.ok(runs[0].g.guards.length<runs[1].g.guards.length);assert.ok(runs[1].g.guards.length<runs[2].g.guards.length);assert.ok(tuning(runs[0].g).speed<tuning(runs[2].g).speed);const g=runs[2].g;g.seats.find(s=>s.team===1)!.bot=false;assert.equal(difficultyOf(g),'normal');});
// Historical mirror-specific case replaced by museum-arenas.test.ts.

test('device bests are isolated by difficulty, mode and arena',()=>{const keys=new Set();for(const d of ['rookie','normal','pro'])for(const m of ['coop','duos','trios'])for(const l of [0,1,2])keys.add(recordKey(d,m,l));assert.equal(keys.size,27);});

test('online JSON round-trip preserves rival navigation fairness',()=>{for(let seed=1;seed<=9;seed++){const {g}=job(seed,'duos');const stored=JSON.parse(JSON.stringify(g));for(const team of [0,1])for(const l of g.loot)assert.equal(routeLength(g,vanFor(g,team),l),routeLength(stored,vanFor(stored,team),l));}});
