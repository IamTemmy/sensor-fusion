import {CREW_NAMES,distance,type Game,type View,type Thief} from './engine.ts';
/** Only display confirmed decisions. Engine botCall already rate-limits to 2.5s. */
export function decisionBubble(g:Game|View,s:Thief){
 if(!s.bot||s.escaped||s.stun>g.now||s.task!==s.announcedTask||s.taskAt===undefined||g.now-s.taskAt<0||g.now-s.taskAt>2300)return null;
 const incoming=g.loot.some(l=>l.flight?.team===s.team&&distance(l.flight.to,s)<=70);
 const held=g.loot.some(l=>l.holder===s.id);
 const tied=g.seats.some(p=>p.id!==s.id&&p.team===s.team&&p.stun>g.now&&!p.escaped);
 const loose=g.loot.some(l=>!l.banked&&!l.holder&&!l.guardCarrier&&!l.flight&&l.droppedAt!==undefined&&distance(l,s)<=220&&g.events.some(e=>e.text.startsWith(CREW_NAMES[s.team]+' dropped '+l.name+' at ')||g.seats.some(p=>p.team===s.team&&e.text.startsWith(p.name+' passed '+l.name+' toward '))));
 if(s.task==='recover-pass')return incoming?'Catching your pass':held?'Securing your art':loose?'Recovering your art':null;
 if(s.task==='bank-rescue')return held&&tied?'Banking first, then rescuing':null;
 if(s.task==='hold-plate')return distance(s,g.plate)<30?'Holding the plate':'Heading to the plate';
 if(s.task==='jackpot')return g.loot.some(l=>l.value===1200&&!l.banked)?'Going for the Crown':null;
 if(s.task==='receive')return !s.hand&&g.seats.some(p=>!p.bot&&p.id!==s.id&&p.team===s.team&&!p.escaped&&g.loot.some(l=>l.id===p.hand))?'Ready for your pass':null;
 if(s.task==='rescue')return tied?'Coming to free you':null;
 if(s.task==='bank')return held?'Taking art to the dock':null;
 return null;
}
