import {exhibitAvailable,type View} from './engine.ts';
import {artwork} from './artwork.ts';
/** Final-state audit: do not invent a loss history that snapshots do not contain. */
export function lootRecap(v:View,team:number){
 const pieces=v.loot.filter(l=>exhibitAvailable(v,l)).map(l=>{
  const holder=v.seats.find(s=>s.id===l.holder);
  const status=l.banked?(l.bankedBy===team?'Banked by your crew':'Banked by rivals'):l.guardCarrier?'With security':holder?(holder.team===team?'Carried, not banked':'Carried by rivals'):l.flight?'Still airborne':l.stashedAt!==undefined?'Left in a stash':l.droppedAt!==undefined?'Left on the floor':l.claimed?'Returned to display':'Not collected';
  return {id:l.id,name:artwork(l.id,l.value,v.layout).name,value:l.value,status,crown:l.value===1200};
 });
 const penalty=v.seats.filter(s=>s.team===team).reduce((sum,s)=>sum+(s.penalty||0),0);
 const crown=v.loot.filter(l=>l.value===1200&&l.banked&&l.bankedBy===team).reduce((sum,l)=>sum+l.value,0);
 const tip=penalty?'You lost money by finishing outside your dock. Leave time to return before Last Call.':pieces.some(p=>p.status==='Carried, not banked')?'Carrying art is not banking it. Return to your dock before time runs out.':pieces.some(p=>p.status==='Left on the floor'||p.status==='Still airborne')?'Art was still loose when the job ended. Recover dropped art and wait for the receiver ring before passing.':pieces.some(p=>p.status==='Left in a stash')?'Your stash stayed in the museum. Plan time to collect it on the way back.':crown?'Your crew banked the Crown. Its staff exit gives you a shorter return route.':'Your crew did not bank the Crown. Coordinate the pressure plate after the 1:00 unlock.';
 return {pieces,penalty,crown,tip};
}
