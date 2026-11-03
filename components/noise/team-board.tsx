import {useState, type ReactNode} from 'react';
import type {View} from '../../lib/noise/engine';
import {plannedMuseum} from '../../lib/noise/lobby';
import {Portrait} from './presentation';
export function TeamBoard({v,host,busy,connectionMode,seatModes,send}:{v:View;host:boolean;busy:boolean;connectionMode:string;seatModes:Record<string,string>;send:(type:string,data?:Record<string,unknown>)=>unknown}){
 const cap=v.crewMode==='coop'?4:2,humans=v.seats.filter(s=>!s.bot),move=host&&v.crewMode!=='coop'&&humans.length>=2;
 return <div className={"team-board"+(v.crewMode==='coop'?' single-crew':'')}>{(v.crewMode==='coop'?[0]:[0,1]).map(team=><section key={team} className={'team-column '+(team===0?'mint':'violet')} aria-label={team===0?'Mint crew':'Violet crew'}><h3>{team===0?'MINT':'VIOLET'} <small>{v.seats.filter(s=>s.team===team).length}/{cap}</small></h3><div className="team-seats">{v.seats.filter(s=>s.team===team).map(s=>{const content=<><Portrait team={team} echo={s.bot}/><span><b>{s.name}</b><small>{s.bot?'BOT':s.id===v.you?'YOU · '+connectionMode:s.id===v.host?'HOST':seatModes[s.id]||'Connecting…'}</small>{move&&!s.bot&&<em>Move to {team===0?'Violet':'Mint'}</em>}</span></>;return <div key={s.id} className="team-seat">{move&&!s.bot?<button className="seat-move" disabled={busy} onClick={()=>send('team',{seatId:s.id,team:1-team})}>{content}</button>:<div className="seat-move">{content}</div>}{host&&s.id!==v.host&&(!s.bot||v.crewMode==='coop')&&<button className="seat-remove" aria-label={'Remove '+s.name} disabled={busy} onClick={()=>send('remove',{seatId:s.id})}>×</button>}</div>})}{!v.seats.some(seat=>seat.team===team)&&<p className="open-seat">Open seat</p>}</div>{host&&humans.length>=2&&v.crewMode==='coop'&&v.seats.length<4&&<button className="team-add" disabled={busy} onClick={()=>send('bot',{team:0})}>+ Echo helper</button>}</section>)}</div>;

}

export function MuseumPhoto({museum}:{museum:ReturnType<typeof plannedMuseum>}) {
 const photos: Record<string,string> = {'night-archive':'archive','flagship-velmont':'gallery'};
 const photo = photos[museum.id] || (museum.name.toLowerCase().includes('archive')?'archive':museum.name.toLowerCase().includes('cross')?'crossroads':'gallery');
 return <figure className="museum-photo">
   <img src={'/art/v24/'+photo+'.webp'} alt=""/>
   <figcaption><small>Next museum</small><strong>{museum.name}</strong><span>{'2–4'} thieves</span></figcaption>
 </figure>;
}

export function LobbySettings({mode,difficulty,host,children}:{mode:View['crewMode'];difficulty:string;host:boolean;children:ReactNode}) {
 const [expanded,setExpanded]=useState(false);
 const format=mode==='coop'?'One crew':'1v1 / 2v2';
 return <section className="folio-settings">
   <button className="setup-summary" aria-expanded={expanded} aria-controls="crew-settings" onClick={()=>setExpanded(!expanded)}>
     <span>{format} · {difficulty}</span><b>{expanded?'Close setup':host?'Edit setup':'View setup'}</b>
   </button>
   <div id="crew-settings" className={'setup-fields'+(expanded?' expanded':'')}>{children}</div>
 </section>;
}
