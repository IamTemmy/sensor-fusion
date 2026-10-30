import * as E from '../lib/noise/engine.ts';
import {flagshipArena} from '../lib/noise/flagship-arena.ts';
import {archiveArena} from '../lib/noise/archive-arena.ts';
import {readFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
export const museum=process.env.GATE_MUSEUM||'flagship-velmont';
export const gateOut='docs/playtests/'+museum;
mkdirSync(gateOut,{recursive:true});
export const engineHash=createHash('sha256').update(readFileSync('lib/noise/engine.ts')).update(readFileSync('lib/noise/flagship-arena.ts')).update(readFileSync('lib/noise/archive-arena.ts')).digest('hex');
export function setupGate(g:E.Game){E.setup(g,(_,n)=>museum==='night-archive'?archiveArena(n):flagshipArena(n));}
