import{readFileSync,writeFileSync}from'node:fs';
const read=p=>JSON.parse(readFileSync(p,'utf8')),dir='docs/alarm-shake/';
const report=read('docs/playtests/flagship-velmont/release.json'),first=read(dir+'cpu-recheck-1.json'),second=read('docs/playtests/night-archive/cpu.json');
if(report.sourceHash!=='0e26339cf6e8e6210ea85e5170b8696d2c46a358fb7c7d3356a1a8effb34412a')throw Error('Unexpected full suite');
if([first,second].some(r=>r.p95>=8||r.max>=40||r.engineAndGeometryHash!==report.museums['night-archive'].idle.engineAndGeometryHash))throw Error('CPU repeats must pass on identical engine/geometry');
writeFileSync(dir+'cpu-recheck-2.json',JSON.stringify(second,null,2)+'\n');
report.rechecks=[{gate:'night-archive/cpu',initial:read(dir+'release-first-run.json').museums['night-archive'].cpu,reason:'Two serial repetitions of all six identical CPU fixtures after the initial threshold miss; no engine or geometry changes. The original timing variation is not attributed to a proven cause.',samples:[first,second].map(r=>({p95:r.p95,max:r.max}))}];
report.museums['night-archive'].cpu={p95:Math.max(first.p95,second.p95),max:Math.max(first.max,second.max),passed:true,rechecked:true};report.failed=report.failed.filter(x=>x!=='night-archive/cpu');report.passed=report.failed.length===0;
writeFileSync('docs/playtests/flagship-velmont/release.json',JSON.stringify(report,null,2)+'\n');console.log({passed:report.passed,failed:report.failed});
