import {W,H,crewScores,vanFor,vanFacing,type Game,type View} from './engine.ts';
export const GETAWAY_MS=1500;
export function getawayEligible(g:Game|View){return !g.training&&g.phase==='finished'&&!g.finishReason.startsWith('Host left')&&g.seats.some(s=>s.escaped);}
/** Presentation clock only. Never changes game time, bank, escape status or position. */
export function departingVan(g:Game|View,team:number,elapsed:number){
 const aboard=g.seats.some(s=>s.team===team&&s.escaped);if(!aboard)return null;
 const scores=crewScores(g),best=Math.max(...scores.map(s=>s.bank)),winner=scores.find(s=>s.team===team)!.bank===best;
 const delay=g.crewMode==='coop'||winner?0:250,t=Math.max(0,elapsed-delay),doors=Math.min(1,t/250),progress=Math.max(0,Math.min(1,(t-250)/1000)),v=vanFor(g,team);
 const facing=vanFacing(g,team),exitDistance=(facing==='west'?v.x:facing==='east'?W-v.x:facing==='north'?v.y:H-v.y)+70,distance=exitDistance*progress*progress;return {x:v.x+(facing==='east'?distance:facing==='west'?-distance:0),y:v.y+(facing==='north'?-distance:facing==='south'?distance:0),doors,progress,delay};
}
