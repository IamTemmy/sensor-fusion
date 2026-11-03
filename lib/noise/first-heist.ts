import type {View} from './engine.ts';
export type Lesson = 'grab'|'alarm'|'bank'|'board'|'done';
export type GuideProgress={step:Lesson;code:string;match:number;attempts:number;heldIds:string[];soloStart?:number};
export const GUIDE_KEY='velmont-first-heist-v1';
export function resumeGuide(raw:string|null,code:string,match:number,soloStart?:number):GuideProgress {
 let old:Partial<GuideProgress>|null=null;try{old=JSON.parse(raw||'null');}catch{if(raw==='done')old={step:'done'};}
 const fresh:GuideProgress={step:'grab',code,match,attempts:1,heldIds:[],...(soloStart===undefined?{}:{soloStart})};
 if(old?.step==='done')return {...fresh,step:'done'};
 if(!old||!['grab','alarm','bank','board'].includes(old.step||''))return fresh;
 const attempts=Math.min(2,Math.max(1,Number(old.attempts)||1));
 if(old.code===code&&old.match===match&&old.soloStart===soloStart)return {...fresh,step:old.step!,attempts,heldIds:Array.isArray(old.heldIds)?old.heldIds.filter(x=>typeof x==='string'):[]};
 return {...fresh,attempts:Math.min(2,attempts+1),step:attempts>=2?'done':'grab'};
}
/** Personal progress only: a crew bank counts only for art this player held. */
export function firstHeistStep(v:View,step:Lesson,heldIds:ReadonlySet<string>=new Set()):Lesson {
 const me=v.seats.find(s=>s.id===v.you);if(!me||step==='done')return step;
 if(me.escaped)return 'done';
 if(me.bank>0||v.loot.some(l=>heldIds.has(l.id)&&l.banked&&l.bankedBy===me.team))return 'board';
 const art=v.loot.find(l=>l.id===me.hand);
 if(step==='grab'&&art)return 'alarm';
 if(step==='alarm'&&(!art||!v.noises.some(n=>n.source===art.id&&n.attached===me.id)))return 'bank';
 if(step==='bank'&&!art&&!v.loot.some(l=>heldIds.has(l.id)&&(l.flight?.team===me.team||v.seats.some(s=>s.team===me.team&&s.id===l.holder))))return 'grab';
 return step;
}
export function guideCopy(step:Exclude<Lesson,'done'>,touch:boolean,hasBot:boolean){
 const desktop={grab:'Grab your first exhibit: walk close and use Grab (E).',alarm:'F passes art to a nearby teammate. No one near? F shakes off its alarm.',bank:'Bring art to your coloured dock. It banks automatically; a teammate can deliver your pass too.',board:'Loot secured! Board (R) at your dock to escape. You can keep collecting first.'};
 const phone={grab:'Walk close to an exhibit. Tap Grab.',alarm:'Tap Pass to hand art to a teammate. Alone? Tap Shake off alarm.',bank:'Bring art to your coloured dock to bank it. A teammate can deliver your pass too.',board:'Loot secured! Tap Board at your dock to escape.'};
 return (touch?phone:desktop)[step]+(step==='alarm'&&hasBot&&!touch?' Echo can also take the alarm.':'');
}
