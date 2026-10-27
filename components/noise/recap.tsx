'use client';
import {normalArtSecured} from '../../lib/noise/clarity';
import type {CSSProperties} from 'react';
import {crewScores,stars,difficultyOf,LAYOUT_NAMES,COOP_GOAL,recapTip,homeSafe,type View} from '../../lib/noise/engine';
import type {RunRecord} from '../../lib/noise/records';
import {COLORS} from '../../lib/noise/draw';
import {Portrait,GoldStars} from './presentation';
import {CountHaul} from './visual-ui';
const money=(n:number)=>'$'+n.toLocaleString();
export function HeistRecap({v,reduced,record,host,busy,onReplay,onLeave}:{v:View;reduced:boolean;record:RunRecord|null;host:boolean;busy:boolean;onReplay:()=>void;onLeave:()=>void}){
 const me=v.seats.find(s=>s.id===v.you),team=me?.team||0,scores=crewScores(v),own=scores.find(t=>t.team===team),haul=own?.bank||0;
 const best=Math.max(0,...scores.map(s=>s.bank)),winners=scores.filter(s=>s.bank===best&&best>0),coop=v.crewMode==='coop';
 const won=coop?v.success:winners.some(s=>s.team===team),tied=!coop&&winners.length>1;
 const title=v.training?'Practice complete':coop?(won?'A clean getaway!':'One more shot?'):best===0?'No haul this time':tied?winners.map(t=>t.name).join(' & ')+' tie!':winners[0].name+' wins!';
 const crew=v.seats.filter(s=>s.team===team),jackpot=v.loot.some(l=>(l.locked||l.value===1200)&&l.banked&&l.bankedBy===team);
 const goals=coop?[{label:money(COOP_GOAL)+' secured',done:haul>=COOP_GOAL&&crew.some(s=>s.escaped||homeSafe(v,s))},{label:'All normal art',done:normalArtSecured(v,team)},{label:'Jackpot secured',done:jackpot}]:[{label:'Won the haul',done:won},{label:'Win + crew escaped',done:won&&crew.every(s=>s.escaped)},{label:'Win + jackpot',done:won&&jackpot}];
 const highlight=[...v.seats].sort((a,b)=>b.bestThrow-a.bestThrow)[0];
 const escape=me?.escaped?(((me.escapedAt||v.finishedAt||v.now)-v.start)/1000).toFixed(1)+'s':'Left behind';
 return <section className={'heist-recap '+(!won?'heist-recap-loss':'')} role="dialog" aria-modal="true" aria-labelledby="recap-title">
  <div className="recap-hero-v34">
   <img className="getaway-art" src={won&&team===0?'/art/v34/getaway.webp':'/art/v24/recap.webp'} alt=""/>
   <div className="recap-meta">{coop?'CO-OP':'RIVALS'} · {difficultyOf(v)} · {LAYOUT_NAMES[v.layout]}</div>
   <div className="recap-victory"><span className="eyebrow">{won?'BEAUTIFULLY CRIMINAL.':'THE JOB IS OVER. THE STORY ISN’T.'}</span><h2 id="recap-title" style={{color:coop?COLORS[team]:COLORS[winners[0]?.team||team]}}>{title}</h2>
    <div className="recap-haul"><CountHaul key={v.match} value={haul} reduced={reduced}/></div><div className="haul-caption">YOUR CREW’S HAUL</div>
    {!v.training&&<div className="recap-awards"><GoldStars count={stars(v,team)}/><div className="award-goals">{goals.map(g=><span key={g.label} className={g.done?'earned':''}><i aria-label={g.done?'Earned':'Not earned'}>{g.done?'✓':'○'}</i>{g.label}</span>)}</div></div>}
    <p className="recap-finish">{v.finishReason}</p>
   </div>
  </div>
  <div className="recap-summary-v34">{scores.map(t=><div className="crew-total" key={t.team} style={{'--crew':COLORS[t.team]} as CSSProperties}><span>{t.name}</span><b>{money(t.bank)}</b></div>)}<div className="recap-escape"><span>YOUR ESCAPE</span><b>{escape}</b></div>{record&&<details className="recap-record"><summary>★ DEVICE BEST</summary><span>{record.stars}★ · {money(record.bank)} · {record.time.toFixed(1)}s<br/>{LAYOUT_NAMES[v.layout]} · {difficultyOf(v)}</span></details>}</div>
  <div className="recap-crews">{scores.map(t=><section className="recap-crew" key={t.team} style={{'--crew':COLORS[t.team]} as CSSProperties}><h3>{t.name} CREW</h3>{v.seats.filter(s=>s.team===t.team).map(s=><div className="recap-player" key={s.id}><Portrait team={s.team} echo={s.bot}/><div className="player-identity"><b>{s.name}</b><span>{money(s.bank)} banked</span></div><span className={'escape-badge '+(!s.escaped?'missed':'')}>{s.escaped?'ESCAPED':'LEFT BEHIND'}{!s.escaped&&(s.penalty||0)>0&&<small>−{money(s.penalty||0)}</small>}</span><span className="alarm-count">{s.captures} {s.captures===1?'alarm grabbed':'alarms grabbed'}</span></div>)}</section>)}</div>
  <footer className="recap-footer-v34"><div className="recap-tip">{highlight?.bestThrow>0&&<p><strong>HIGHLIGHT</strong>{highlight.name} distracted {highlight.bestThrow} {highlight.bestThrow===1?'guard':'guards'}.</p>}<p><strong>PRO TIP</strong>{recapTip(v,team)}</p></div>{host?<button className="primary" disabled={busy} onClick={onReplay}>RUN IT BACK →</button>:<span className="recap-wait">Waiting for the host to start the next job</span>}<button className="secondary" onClick={onLeave}>BACK TO HIDEOUT</button></footer>
 </section>;
}
