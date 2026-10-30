import type {Game,View,Vec} from './engine.ts';
export const ARCHIVE_LAMPS=[{x:120,y:120,r:85},{x:840,y:120,r:85},{x:480,y:210,r:75},{x:290,y:420,r:75},{x:670,y:420,r:75}];
export const archiveSight=(g:Pick<Game|View,'arena'|'layout'>,p:Vec)=>g.arena&&g.layout===1?(ARCHIVE_LAMPS.some(l=>Math.hypot(l.x-p.x,l.y-p.y)<=l.r)?1.3:.85):1;
