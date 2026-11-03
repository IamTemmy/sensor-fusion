import {crewDepartureAt,type Game,type View,type Thief} from './engine.ts';
export function aboardInstruction(v:Game|View,me:Thief,seconds:number){
 return `${crewDepartureAt(v,me.team)!==null?'Your crew escaped — watching the remaining crews':'You’re in the van, watching your crew'} · ${seconds}s remaining.`;
}
export function spectatorExplanation(v:Game|View,me:Thief){
 return crewDepartureAt(v,me.team)!==null?'Your crew’s van has left. The job continues for the other crews.':'Other thieves are still on the job. Hop out is available only before your whole crew boards and before Last Call.';
}
