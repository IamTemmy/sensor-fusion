// Historical map-specific regression fixtures retain their authored architecture.
// Production callers never pass a factory; flagship tests import engine directly.
import * as E from '../../lib/noise/engine.ts';
import {museumArena} from '../../lib/noise/arenas.ts';
export * from '../../lib/noise/engine.ts';
export const setup=(g:E.Game)=>E.setup(g,museumArena);
export const command=(g:E.Game,id:string,a:Parameters<typeof E.command>[2])=>E.command(g,id,a,museumArena);
