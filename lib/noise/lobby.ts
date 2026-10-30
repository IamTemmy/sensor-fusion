import {archiveArena} from './archive-arena.ts';
import {flagshipArena} from './flagship-arena.ts';
import {museumArena} from './arenas.ts';
import type {Game,View} from './engine.ts';
/** Preview the same first RNG draw setup() uses, without consuming the room seed. */
export function plannedMuseum(g:Game|View){
 if(g.seats.length<=4&&g.crewMode!=='trios')return g.match%2?archiveArena(g.seats.length):flagshipArena(g.seats.length);
 const seed=(Math.imul(1664525,g.seed)+1013904223)>>>0,roll=seed/4294967296;
 const layout=g.layout<0?Math.floor(roll*3):(g.layout+1+Math.floor(roll*2))%3;
 return museumArena(layout,g.crewMode==='trios'?6:g.seats.length);
}
