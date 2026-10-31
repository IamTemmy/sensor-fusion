import {passTarget,type Game,type View,type Thief,type Vec} from './engine.ts';
/** Client input mapping only; all execution stays in the existing engine actions. */
export function throwIntent(g:Game|View,s:Thief,aim:Vec){
 const art=g.loot.find(l=>l.id===s.hand);
 if(!art)return {action:s.hand?'throw:'+s.hand:null,aim,label:'Throw alarm',detail:'Throw alarm',hint:null};
 const ringing=g.noises.some(n=>n.source===art.id&&n.attached===s.id);
 const receiver=passTarget(g,s,aim);
 if(receiver)return {action:'throw:'+art.id,aim:{x:receiver.x,y:receiver.y},label:'Pass to '+receiver.name,detail:ringing?'Pass art + alarm':'Pass quiet art',hint:null};
 if(ringing)return {action:'shake:'+art.id,aim,label:'Shake off alarm',detail:'Shake off alarm',hint:null};
 return {action:null,aim,label:'No one to pass to',detail:'No one to pass to',hint:'No teammate in range to pass.'};
}
