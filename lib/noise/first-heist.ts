import type {View} from './engine.ts';
export type Lesson = 'grab'|'alarm'|'bank'|'board'|'done';
/** Observation only: never injects commands or changes the simulation. */
export function firstHeistStep(v:View,step:Lesson):Lesson {
 const me=v.seats.find(s=>s.id===v.you);if(!me||step==='done')return step;
 if(me.escaped)return 'done';
 if(v.seats.some(s=>s.team===me.team&&s.bank>0))return 'board';
 const art=v.loot.find(l=>l.id===me.hand);
 if(step==='grab'&&art)return 'alarm';
 if(step==='alarm'&&(!art||!v.noises.some(n=>n.source===art.id&&n.attached===me.id)))return 'bank';
 if(step==='bank'&&!art&&!v.loot.some(l=>l.flight?.thrower===me.id||v.seats.some(s=>s.team===me.team&&s.id===l.holder)))return 'grab';
 return step;
}
export const firstHeistCopy:Record<Exclude<Lesson,'done'>,string>={
 grab:'Grab your first exhibit: walk close and use Grab (E).',
 alarm:'F passes art to a nearby teammate. No one near? F shakes its alarm off. Echo can also take the alarm.',
 bank:'Bring art to your coloured dock. It banks automatically; your teammate can deliver a pass too.',
 board:'Loot secured! Return to your dock and Board (R) to escape. You can keep collecting first.'
};
