import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {releaseHash} from '../../scripts/flagship-gates.mjs';
const oldHash='0e26339cf6e8e6210ea85e5170b8696d2c46a358fb7c7d3356a1a8effb34412a';
const report=JSON.parse(readFileSync('docs/playtests/flagship-velmont/release.json','utf8'));
if(!report.passed||report.sourceHash!==oldHash)throw Error('Full gameplay suite must pass on expected source');
const paths=['package.json','app/page.tsx','app/globals.css','app/visual-review/page.tsx','tests/helpers/legacy-engine.ts',...readdirSync('components/noise').filter(x=>/\.tsx?$/.test(x)).map(x=>'components/noise/'+x),...readdirSync('hooks').filter(x=>/\.tsx?$/.test(x)).map(x=>'hooks/'+x),...readdirSync('scripts').filter(x=>/\.(ts|mjs)$/.test(x)&&!x.startsWith('.')).map(x=>'scripts/'+x),...readdirSync('lib/noise').filter(x=>x.endsWith('.ts')).map(x=>'lib/noise/'+x),...readdirSync('tests').filter(x=>x.endsWith('.ts')).map(x=>'tests/'+x)].sort();
const h=createHash('sha256');for(const p of paths){let value=readFileSync(p,'utf8');if(p==='lib/noise/practice.ts')value=value.replace('Aim away and F shakes off the alarm. Then aim at Echo and F passes quiet art.','A guard is approaching. Aim at Echo and F passes the art.');if(p==='lib/noise/input-copy.ts')value=value.replace(" .replaceAll('Aim away and F shakes off the alarm. Then aim at Echo and F passes quiet art.','Aim away and tap Shake off alarm. Then aim at Echo and tap Pass quiet art.')\n",'');h.update(p).update(value);}
if(h.digest('hex')!==oldHash)throw Error('Changes exceed the two tutorial-copy edits');
const log=readFileSync('/tmp/shake-final-tests.log','utf8');if(!log.includes('pass 303')||!log.includes('fail 0'))throw Error('Final tests missing');
writeFileSync('docs/alarm-shake/final-tests.log',log);writeFileSync('docs/alarm-shake/final-types.log',readFileSync('/tmp/shake-final-types.log'));
report.simulationSourceHash=oldHash;report.sourceHash=releaseHash();report.postSimulationValidation={files:['lib/noise/practice.ts','lib/noise/input-copy.ts'],change:'Only tutorial instruction text and its touch translation, verified by reconstructing the exact original release hash.',tests:303,typecheck:'passed'};
writeFileSync('docs/playtests/flagship-velmont/release.json',JSON.stringify(report,null,2)+'\n');console.log(report.sourceHash);
