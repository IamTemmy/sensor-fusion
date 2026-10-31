'use client';
import {RuleEmphasis} from './rule-emphasis';
import {museumIdentity} from '../../lib/noise/museum-identity';
import type {MuseumArena} from '../../lib/noise/arenas';
import type {CSSProperties} from 'react';
import {GuideIcon} from './presentation';
import {COOP_GOAL,type CrewMode} from '../../lib/noise/engine';

const steps=[
 {title:'Grab art',body:'Every exhibit comes with a loud alarm.',key:'E',action:'Grab',touch:'Tap Grab',color:'#95e8cd'},
 {title:'Pass or shake',body:'F passes art to a nearby teammate. No one near? F shakes off its alarm.',key:'F',action:'Pass / Shake off',touch:'Tap Pass / Shake off',color:'#ffa39b'},
 {title:'Throw the alarm',body:'Pull guards away from your route.',key:'F',action:'Throw',touch:'Aim, then tap Throw',color:'#a6d9ef'},
 {title:'Bank & board',body:'Deliver your art. Get everyone aboard.',key:'R',action:'Board van',touch:'Tap Board van',color:'#f3d18b'},
];
export function MovementKeys(){return <span className="movement-keys" aria-label="W A S D">{['W','A','S','D'].map(key=><kbd key={key} aria-hidden="true">{key}</kbd>)}</span>;}
function Clock(){return <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="12" cy="13" r="8"/><path d="M12 9v5l3 2M9 2h6M12 2v3"/></svg>;}
export function HeistBriefing({arena,training,crewMode,duel=false,touch,busy,ready,onReady,onRules}:{arena?:MuseumArena;training:boolean;crewMode:CrewMode;duel?:boolean;touch:boolean;busy:boolean;ready:boolean;onReady:()=>void;onRules:()=>void}){
 return <section className="panel briefing quick-brief" role="dialog" aria-modal="true" aria-labelledby="brief-title">
  <div className="quick-brief-scroll" tabIndex={0} aria-label="Heist briefing">
   <header className="quick-brief-heading">
    <div className="quick-brief-kickers"><span>QUICK START</span><span className="brief-timer"><Clock/><strong>{training?'No timer':'90 seconds'}</strong></span></div>
    <h2 id="brief-title">{['flagship-velmont','night-archive'].includes(arena?.id||'')?'Every corner is a choice.':'The alarm is stealable.'}</h2>
    <p className="quick-brief-tagline">A little teamwork. A very loud getaway.</p>
    <p className="quick-brief-mode"><RuleEmphasis text={training?'Practice · Learn six moves at your own pace':crewMode==='coop'?`Co-op · Bank $${COOP_GOAL.toLocaleString()} and escape`:duel?'1v1 · After the time lock opens, step on the plate to unlock the Crown for both players':'Rivals · Richest crew wins'}/></p>
   </header>
   {arena&&<div className="arena-plan-note"><b>{arena.name} · {arena.capacity===2?'Compact':arena.capacity===4?'Crew':'Grand'} plan</b><span>{['flagship-velmont','night-archive'].includes(arena.id)?<><RuleEmphasis text={`The Crown ($1,200) unlocks at 1:00. One thief stands on the pressure plate in ${arena.id==='night-archive'?'the Map Room':'Security'} to keep the vault open while another grabs the Crown. Solo? Tell Echo: Hold plate.`}/>{duel&&<span className="plate-rule-line">1v1 exception: after 1:00, stepping on the plate unlocks the Crown permanently for both thieves.</span>}<span className="plate-rule-line">Noise on you brings guards to you. Noise elsewhere sends them there.</span></>:<RuleEmphasis text={arena.brief}/>}</span>{' '}<small className="museum-lore">{museumIdentity(['sculpture','fossil','celestial'].indexOf(arena.theme)).lore}</small></div>}
   <ol className="quick-brief-steps">{steps.map((step,i)=><li key={step.title} style={{'--step-color':step.color} as CSSProperties}>
    <span className="quick-step-number" aria-hidden="true">0{i+1}</span><GuideIcon step={i}/><h3>{step.title}</h3><p>{i===1?(touch?'Tap Pass to send art to a nearby teammate. No one near? Tap Shake off alarm.':step.body):duel&&i===3?'Bank your art, then board your own van.':step.body}</p>
    <div className="quick-step-control">{touch?<><span aria-hidden="true">☝</span>{step.touch}</>:<><kbd>{step.key}</kbd>{step.action}</>}</div>
   </li>)}</ol>
   <div className="quick-brief-controls" aria-label="Movement controls">{touch?<><span>Drag to move</span><span>Tap floor to aim</span><span>Tap Sneak for stealth</span></>:<><span><MovementKeys/> Move</span><span><kbd>SHIFT</kbd> Sneak</span><span><kbd>G</kbd> Drop art</span><span><kbd>Q</kbd> Ask for art</span></>}</div>

  </div>
   <div className="quick-brief-warning"><Clock/><div><strong>{training?'Take your time. Learn by doing.':'15s Last Call · Board before time runs out.'}</strong><span><RuleEmphasis text={training?'No timer or loot penalties. Each lesson marks your target.':'Left behind outside your dock? Lose 25% of your bank.'}/></span></div></div>
  <footer className="quick-brief-footer"><button className="quick-more-rules" onClick={onRules}>More rules <span aria-hidden="true">→</span></button><button className="primary" disabled={busy||ready} onClick={onReady}>{ready?'Waiting for the crew…':training?'LET’S PRACTICE →':'I’M IN — LET’S GO →'}</button></footer>
 </section>;
}
