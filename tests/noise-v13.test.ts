import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {RIVAL_LAYOUTS,RIVAL_REINFORCEMENTS,sight,clear,distance,create,add,configure,setup} from '../lib/noise/engine.ts';
test('all layouts: separated plate/jackpot, clear non-rectangular distinct patrols including lockdown',()=>{
 for(const [index,m] of RIVAL_LAYOUTS.entries()){
 assert.ok(distance(m.plate,m.jackpot)>250);assert.equal(sight(m.plate,m.jackpot,m.walls),false);
 const routes=[...m.routes,RIVAL_REINFORCEMENTS[index]];
 assert.equal(new Set(routes.map(r=>JSON.stringify([...r].sort((a,b)=>a.x-b.x||a.y-b.y)))).size,routes.length);
 for(const r of routes){assert.ok(r.length>=4);assert.ok(new Set(r.map(p=>p.x)).size>2||new Set(r.map(p=>p.y)).size>2||r.some((p,i)=>p.x!==r[(i+1)%r.length].x&&p.y!==r[(i+1)%r.length].y));for(let i=0;i<r.length;i++){const a=r[i],b=r[(i+1)%r.length],n=Math.ceil(distance(a,b));for(let j=0;j<=n;j++)assert.ok(clear({x:a.x+(b.x-a.x)*j/n,y:a.y+(b.y-a.y)*j/n},12,m.walls),`blocked patrol ${index} ${i}`);}}
 }
});
test('actual navigation distances: every wing pair and shared objective has <40-unit two-crew spread',()=>{
 const report=JSON.parse(execFileSync(process.execPath,['--experimental-strip-types','scripts/audit-noise-v13.ts'],{encoding:'utf8',env:{...process.env,NOISE_AUDIT_DIR:'/tmp/noise-v13-regression'}}));
 for(const m of report)for(const r of m.rows)assert.ok(r.spread<40,JSON.stringify(r));
});
test('all three wing pairs appear across seeded matches on each layout',()=>{
 const sets=[new Set(),new Set(),new Set()];for(let seed=1;seed<=90;seed++){const g=create('R',0,seed);for(let i=0;i<4;i++)add(g,'P',''+i);configure(g,'duos');setup(g);sets[g.layout].add(g.loot[0].x+','+g.loot[0].y);}for(const s of sets)assert.equal(s.size,3);
});
