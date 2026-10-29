// Isolated experiment only; does not modify production engine sources.
import {readFileSync,writeFileSync,mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const here=dirname(fileURLToPath(import.meta.url)),root=resolve(here,'../../..'),temp=mkdtempSync(join(tmpdir(),'patrol-v72-'));
const original=readFileSync(join(root,'lib/noise/engine.ts'),'utf8');
const engine=original.replace("'./arenas.ts'",JSON.stringify(join(root,'lib/noise/arenas.ts'))).replace('if(d>3)move(p,','if(d>(g.guards.includes(p as Guard)?.05:3))move(p,');
if(engine===original||!engine.includes('if(d>(g.guards.includes(p as Guard)?.05:3))move(p,'))throw Error('Expected baseline walk condition missing');
writeFileSync(join(temp,'engine.ts'),engine);
writeFileSync(join(temp,'audit.ts'),readFileSync(join(here,'patrol-audit.ts'),'utf8').replace("'../../../lib/noise/engine.ts'","'./engine.ts'"));
const result=spawnSync(process.execPath,['--experimental-strip-types',join(temp,'audit.ts')],{stdio:'inherit'});process.exit(result.status??1);
