import {distance,type Game,type View,type Thief} from './engine.ts';
/** Only display confirmed decisions. Engine botCall already rate-limits to 2.5s. */
export function decisionBubble(g:Game|View,s:Thief){
 if(!s.bot||s.escaped||s.stun>g.now||s.task!==s.announcedTask||s.taskAt===undefined||g.now-s.taskAt<0||g.now-s.taskAt>2300)return null;
 const incoming=g.loot.some(l=>l.flight?.team===s.team&&distance(l.flight.to,s)<=70);
 if(s.task==='recover-pass')return incoming?'Catching your pass':'Recovering your art';
 if(s.task==='bank-rescue')return 'Banking first, then rescuing';
 if(s.task==='hold-plate')return distance(s,g.plate)<30?'Holding the plate':'Heading to the plate';
 if(s.task==='jackpot')return 'Going for the Crown';
 if(s.task==='receive')return 'Ready for your pass';
 if(s.task==='rescue')return 'Coming to free you';
 if(s.task==='bank')return 'Taking art to the dock';
 return null;
}
