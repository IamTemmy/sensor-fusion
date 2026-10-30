import {artwork} from './artwork.ts';
import type {Game,View,Thief} from './engine.ts';
type Scene=Game|View;
export function botIntention(g:Scene,s:Thief){
 if(s.escaped)return 'Aboard the van';
 if(s.stun>g.now)return 'Tied up · needs help';
 if(s.rescueId)return 'Untying a teammate';
 if(g.loot.some(l=>l.holder===s.id))return s.task==='bank-rescue'?'Banking, then rescuing':'Taking art to the dock';
 const tasks:Record<string,string>={'wait-rescue':'Waiting for a safe rescue',rescue:'Approaching a teammate',receive:'Ready for your pass',jackpot:'Fetching the jackpot','hold-plate':'Opening the jackpot','post-empty':'Taking the unguarded art',reroute:'Finding a safer route',van:'Heading to the van',cover:'Covering your alarm',fetch:'Looking for safe art',follow:'Staying with you','guard-warning':'Watching an approaching guard','fetch-done':'Delivered · staying with you'};
 return tasks[s.task||'']||({auto:'Watching for the next job',cover:'Covering you',follow:'Staying with you',fetch:'Fetching art',plate:'Heading to the plate',van:'Heading to the van'}[s.mode]);
}
export function handStatus(g:Scene,s:Thief){
 if(g.noises.some(n=>n.id===s.hand))return 'ALARM IN HAND · F throws';
 if(['flagship-velmont','night-archive'].includes(g.arena?.id||'')&&g.loot.some(l=>l.id===s.hand&&l.value===1200))return g.noises.some(n=>n.attached===s.id)?'CROWN + ALARM · F shakes off alarm':'QUIET CROWN · Bank or pass';
 if(g.loot.some(l=>l.id===s.hand))return g.noises.some(n=>n.attached===s.id)?'ART + ALARM · F shakes off alarm':'QUIET ART · Bank or pass';
 return 'HANDS FREE · E interacts';
}
/** Engine names remain stable; display the canvas identity in radio prose too. */
export function displayEvent(g:Scene,text:string){
 const names=[...g.loot].sort((a,b)=>b.name.length-a.name.length);let result=text;
 for(const l of names){if(l.name&&result.includes(l.name)){result=result.replaceAll(l.name,artwork(l.id,l.value).name);break;}}
 return result;
}
export function recentLure(g:Scene,guardId:string){return g.noises.find(n=>n.thrownBy&&!n.holder&&n.flight<=0&&n.heardBy?.includes(guardId)&&g.now-(n.heardAt?.[guardId]??-Infinity)<2500);}

/** Keep gameplay radio factual, short and unique over the last ten seconds. */
export function radioEvents(g:Scene){
 const seen=new Map<string,number>();return g.events.filter(e=>{
  if(e.text.startsWith('The art sets off an alarm!')||e.text.startsWith('LESSON'))return false;
  const key=e.text.split('. Shift sneaks')[0];const at=seen.get(key);seen.set(key,e.at);
  return at===undefined||e.at-at>=10000;
 }).slice(-3).map(e=>({...e,text:e.text.split('. Shift sneaks')[0]}));
}

export function normalArtSecured(g:Scene,team:number){const art=g.loot.filter(l=>l.value!==1200);return art.length>0&&art.every(l=>l.banked&&l.bankedBy===team);}
