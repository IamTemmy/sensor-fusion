'use client';
import {winningResult} from '../../lib/noise/recap-result';
import {normalArtSecured} from '../../lib/noise/clarity';
import type {CSSProperties} from 'react';
import {crewScores,stars,difficultyOf,LAYOUT_NAMES,COOP_GOAL,recapTip,type View} from '../../lib/noise/engine';
import type {RunRecord} from '../../lib/noise/records';
import {COLORS} from '../../lib/noise/draw';
import {Portrait,GoldStars} from './presentation';
import {CountHaul} from './visual-ui';
const money=(n:number)=>'$'+n.toLocaleString();
export function HeistRecap({v,reduced,record,recordStatus='existing',host,busy,onReplay,onLeave}:{v:View;reduced:boolean;record:RunRecord|null;recordStatus?:'first'|'new'|'existing';host:boolean;busy:boolean;onReplay:()=>void;onLeave:()=>void}){
 const me=v.seats.find(s=>s.id===v.you),team=me?.team||0,scores=crewScores(v),own=scores.find(t=>t.team===team),haul=own?.bank||0;
 const best=Math.max(0,...scores.map(s=>s.bank)),winners=scores.filter(s=>s.bank===best&&best>0),coop=v.crewMode==='coop';
 const won=coop?v.success:winners.some(s=>s.team===team),tied=!coop&&winners.length>1;
 const result=winningResult(v);
 const title=v.training?'Practice complete':coop?(won?'A clean getaway!':'One more shot?'):result.title;
 const crew=v.seats.filter(s=>s.team===team),jackpot=v.loot.some(l=>(l.locked||l.value===1200)&&l.banked&&l.bankedBy===team);
 const rating=stars(v,team);
 const goals=coop?[{label:money(COOP_GOAL)+' + escape',done:rating>=1},{label:'All normal art',done:rating>=2},{label:'Full collection + jackpot',done:rating>=3}]:[{label:'Won the haul',done:rating>=1},{label:'Win + crew escaped',done:won&&crew.every(s=>s.escaped)},{label:'Win + jackpot',done:rating>=3}];

 const highlight=[...v.seats].sort((a,b)=>b.bestThrow-a.bestThrow)[0];
 const escape=me?.escaped?(((me.escapedAt||v.finishedAt||v.now)-v.start)/1000).toFixed(1)+'s':'Left behind';
 const escapedCount=crew.filter(s=>s.escaped).length;
 const outcome=escapedCount===crew.length?'Everyone escaped':escapedCount===0?'No one escaped':`${escapedCount} of ${crew.length} escaped`;
 const note=coop&&jackpot&&rating<3?(normalArtSecured(v,team)?'Jackpot collected. Reach the haul goal and escape to earn the collection stars.':'Jackpot collected. Bank every normal exhibit, reach the goal and escape for three stars.'):coop?'Each star builds on the last: reach the goal, collect all normal art, then add the jackpot.':'Win the haul. Escape together for two stars. Win with the jackpot for three.';
 return <section className={'heist-recap recap-redesign '+(!won?'heist-recap-loss':'')} role="dialog" aria-modal="true" aria-labelledby="recap-title">
  <div className="results-scroll">
   <div className="results-backdrop" aria-hidden="true"><img className="results-art" src={won&&team===0?'/art/v34/getaway.webp':'/art/v24/recap.webp'} alt=""/></div>
   <div className="results-hero">
    <div className="results-victory">
     <div className="results-meta">{coop?'CO-OP':'RIVALS'} · {difficultyOf(v)} · {v.layout<0?'Job not started':LAYOUT_NAMES[v.layout]}</div>
     <h2 id="recap-title" style={{color:coop?COLORS[team]:COLORS[winners[0]?.team||team]}}>{title}</h2>
     <div className="results-caption">{coop?'YOUR CREW’S HAUL':result.tied?'TIED HAUL · EACH CREW':'WINNING HAUL · '+result.teams.join(' & ')}</div>
     <div className="results-haul"><CountHaul key={v.match} value={coop?haul:result.amount} reduced={reduced}/></div>
     {!coop&&<div className="results-your-haul">Your crew banked {money(haul)}</div>}
     <span className={'results-outcome '+(escapedCount===0?'missed':'')}>{escapedCount===crew.length?'✓':'◇'} {outcome}</span>
    </div>
   </div>
   {!v.training&&<section className="results-awards" aria-label="Star requirements"><h3>{rating} / 3 STARS</h3><GoldStars count={rating}/><div className="results-goals">{goals.map(g=><span key={g.label} className={g.done?'earned':''}><i aria-label={g.done?'Earned':'Not earned'}>{g.done?'✓':'○'}</i>{g.label}</span>)}</div><p className={'results-note '+(coop&&jackpot&&rating<3?'jackpot-note':'')}>{note}</p></section>}
   <div className={'results-crews '+(coop?'cooperative':'')}>{scores.filter(t=>!coop||t.team===team).map(t=><section className="results-crew" key={t.team} style={{'--crew':COLORS[t.team]} as CSSProperties}><h3>{coop?'THE CREW':t.name+' CREW'}<span>{money(t.bank)}</span></h3><div className="results-roster">{v.seats.filter(s=>s.team===t.team).map(s=><div className="results-player" key={s.id}><Portrait team={s.team} echo={s.bot}/><div className="results-identity"><b title={s.name}>{s.name}</b><span>{money(s.bank)} banked</span><small className="results-penalty">{!s.escaped&&(s.penalty||0)>0?`−${money(s.penalty||0)} left-behind penalty`:' '}</small></div><div className="results-status"><span className={'result-badge '+(!s.escaped?'missed':'')}>{s.escaped?'ESCAPED':'LEFT BEHIND'}</span><span>{s.captures} {s.captures===1?'alarm grabbed':'alarms grabbed'}</span></div></div>)}</div></section>)}</div>

  </div>
   <div className="results-record-row"><div className="results-time"><span>{v.layout<0?'JOB NOT STARTED':me?.escaped?'YOU ESCAPED AT':'VAN LEFT AT'}</span><b>{v.layout<0?'—':me?.escaped?escape:(((v.finishedAt||v.now)-v.start)/1000).toFixed(1)+'s'}</b></div>{record&&<div className={"recap-record-card "+(recordStatus==='new'?'is-new':'')}><strong>{recordStatus==='new'?'★ NEW DEVICE BEST!':recordStatus==='first'?'FIRST RECORDED RUN':'SAVED DEVICE BEST'}</strong><span>{record.stars}★ · {money(record.bank)} · {record.time.toFixed(1)}s · {LAYOUT_NAMES[v.layout]} · {difficultyOf(v)}</span></div>}</div>
  <footer className="results-footer"><div className="results-tip"><strong>{highlight?.bestThrow>0?'HIGHLIGHT':'PRO TIP'}</strong><span>{highlight?.bestThrow>0?`${highlight.name} distracted ${highlight.bestThrow} ${highlight.bestThrow===1?'guard':'guards'}.`:recapTip(v,team)}</span></div>{host?<button className="primary" disabled={busy} onClick={onReplay}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M4 10a8 8 0 1 1 1 7M4 4v6h6"/></svg>RUN IT BACK</button>:<span className="recap-wait">Waiting for the host to start the next job</span>}<button className="secondary hideout-button" onClick={onLeave}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m3 11 9-8 9 8M5 9v11h5v-6h4v6h5V9"/></svg>BACK TO HIDEOUT</button></footer>
 </section>;
}
