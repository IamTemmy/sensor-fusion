import {hidden,type Game,type View,type Vec,type Guard} from './engine.ts';
/** Guided rehearsal only. Ordinary matches never enter this controller. */
export type Lesson={step:number;part:number;covered:boolean;lured:boolean;passed:boolean;stashed:boolean;at:number};
type PracticeGame=Game&{lesson?:Lesson};
export const lessonOf=(g:Game|View)=>(g as PracticeGame).lesson;
const item=(id:string,x:number,y:number,value=500)=>({id,name:id==='lesson'?'Practice exhibit':'Guarded exhibit',value,x,y,home:{x,y},holder:null,banked:false});
const guard=(x:number,y:number):Guard=>({id:'practice-sentry',x,y,angle:0,mode:'patrol',target:{x,y},route:[{x,y},{x:x+65,y:y-50},{x:x+70,y:y+50}],way:0,attention:0,victim:null,entered:true});
export function preparePractice(g:Game,step=0){
 if(!g.training)return;
 const p=g as PracticeGame;p.lesson={step,part:0,covered:false,lured:false,passed:false,stashed:false,at:g.now};g.practiceStage=10+step;
 g.layout=0;g.walls=[{x:0,y:0,w:960,h:24},{x:0,y:576,w:960,h:24},{x:0,y:0,w:24,h:600},{x:936,y:0,w:24,h:600},{x:290,y:350,w:20,h:100},{x:290,y:350,w:70,h:20}];g.hideSpots=[{x:265,y:400}];g.sensors=[];g.plate={x:850,y:470};g.jobEvent=undefined;g.alert=0;g.noises=[];g.events=[];g.boardingAt=0;g.end=g.now+86400000;g.guards=[];g.events=[{id:++g.serial,x:0,y:0,at:g.now,kind:'info',text:'Practice annex · Learn one move at a time. Retry any lesson whenever you want.'}];
 const [s,e]=g.seats;for(const a of g.seats)Object.assign(a,{hand:null,stun:0,safe:g.now+500,escaped:false,dx:0,dy:0,mode:'follow',rescueId:null,hiddenAt:undefined,hideId:undefined,hideCooldown:0,cooldown:0});
 e.bot=step===0||step===1;Object.assign(s,{x:120,y:440});Object.assign(e,{x:150,y:480});
 if(step===0||step===1){g.loot=[item('lesson',180,400)];if(step===1){g.loot[0].holder=s.id;s.hand=g.loot[0].id;s.bank=0;e.bot=true;}}
 if(step===2){Object.assign(s,{x:350,y:280});Object.assign(e,{x:150,y:480});g.loot=[item('guarded',540,300,600)];const h=guard(590,300);h.sentry={x:590,y:300};h.sentryArt='guarded';g.guards=[h];supplyAlarm(g);}
 if(step===3){Object.assign(s,{x:430,y:420});Object.assign(e,{x:600,y:420});g.loot=[item('pass-art',430,420)];g.loot[0].holder=s.id;s.hand=g.loot[0].id;const h=guard(430,190);h.target={x:430,y:420};h.route=[{x:430,y:190},{x:430,y:420}];h.way=1;h.angle=Math.PI/2;g.guards=[h];}
 if(step===4){Object.assign(s,{x:245,y:430});Object.assign(e,{x:150,y:480});g.loot=[item('stash-art',s.x,s.y)];g.loot[0].holder=s.id;s.hand=g.loot[0].id;}
 if(step===5){g.loot=[];Object.assign(s,{x:150,y:510});Object.assign(e,{x:88,y:510,escaped:true});}
 if(step===6){g.phase='finished';g.finishReason='Practice complete';g.guards=[];}
}
function supplyAlarm(g:Game){g.noises.push({id:'practice-alarm-'+(++g.serial),x:360,y:230,holder:null,expires:g.now+60000,born:g.now-1000,vx:0,vy:0,flight:0,kind:'alarm',source:null});}
export function practiceBefore(g:Game){const l=lessonOf(g);if(!g.training||!l||g.phase!=='playing')return;g.end=g.now+86400000;g.events=g.events.filter(e=>!e.text.startsWith('Practice: grab art'));g.practiceStage=10+l.step;if(l.step!==1){const e=g.seats[1];e.bot=false;e.dx=e.dy=0;}if(l.step===2&&!g.noises.some(n=>!n.attached))supplyAlarm(g);}
export function practiceAction(g:Game,a:string|undefined){const l=lessonOf(g);if(!g.training||!l)return;if(a==='help:cover'&&l.step===1)l.covered=true;}
export function practiceAfter(g:Game){const l=lessonOf(g);if(!g.training||!l)return;const [s,e]=g.seats;
 if(l.step===0&&g.loot.some(a=>a.holder===s.id)){l.step=1;l.at=g.now;g.practiceStage=11;e.bot=true;return;}
 if(l.step===1&&l.covered&&s.bank>0){preparePractice(g,2);return;}
 if(l.step===2){if(g.noises.some(n=>n.thrownBy===s.id&&n.heardBy?.includes('practice-sentry')))l.lured=true;if(l.lured&&g.loot.some(a=>a.id==='guarded'&&a.holder===s.id)){preparePractice(g,3);return;}}
 if(l.step===3){if(g.loot.some(a=>a.flight?.thrower===s.id))l.passed=true;if(l.passed&&g.loot.some(a=>a.holder===e.id)){preparePractice(g,4);return;}}
 if(l.step===4){if(g.loot.some(a=>a.stashedAt!==undefined))l.stashed=true;if(l.stashed&&hidden(g,s)){preparePractice(g,5);return;}}
 if(l.step===5&&s.escaped){preparePractice(g,6);return;}
 // Boarding is the final lesson, not an accidental way to skip the course.
 if(l.step<5&&s.escaped){s.escaped=false;g.phase='playing';s.safe=g.now+3000;}
 if(g.phase==='finished'&&l.step<6)g.phase='playing';
}
export function practiceText(g:Game|View){const l=lessonOf(g);if(!l)return 'Grab an exhibit to begin.';const s=g.seats[0];return [
 'Grab the glowing exhibit with E. It sets off an alarm.',
 l.covered?'Carry the exhibit into your dock. Art banks automatically.':'Open Your bot → Cover me. Then carry the art to your dock.',
 l.lured?'The sentry moved! Grab its guarded exhibit with E.':s.hand&&g.noises.some(n=>n.id===s.hand)?'Aim above the sentry, then F throws the alarm to lure it away.':'E grabs the highlighted alarm. Throw it away from the exhibit to lure the sentry.',
 'A guard is approaching. Aim at Echo and F passes the art.',
 l.stashed?'Now hold Shift (or tap Sneak) and move into the glowing niche.':'Carry art to the glowing niche. E stashes it safely.',
 'Enter your dock and press R to board. Everyone aboard ends the job.',
 'Practice complete. You are ready for a real heist.'
 ][l.step];}
export function practiceTarget(g:Game|View):Vec|undefined{const l=lessonOf(g);if(!l||l.step===6)return;const s=g.seats[0];if(l.step===0)return g.loot[0];if(l.step===1)return l.covered?{x:88,y:510}:g.seats[1];if(l.step===2)return l.lured?g.loot[0]:s.hand?{x:590,y:140}:g.noises.find(n=>!n.holder&&!n.attached);if(l.step===3)return g.seats[1];if(l.step===4)return g.hideSpots?.[0];return {x:88,y:510};}
