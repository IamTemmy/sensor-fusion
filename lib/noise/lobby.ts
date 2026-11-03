import {archiveArena} from './archive-arena.ts';
import {flagshipArena} from './flagship-arena.ts';
import type {Game,View} from './engine.ts';
export function plannedMuseum(g:Game|View){return g.match%2?archiveArena(Math.min(4,g.seats.length)):flagshipArena(Math.min(4,g.seats.length));}
