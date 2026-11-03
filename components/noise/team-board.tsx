import {useState, type ReactNode} from 'react';
import type {View} from '../../lib/noise/engine';
import {plannedMuseum} from '../../lib/noise/lobby';
import {Portrait} from './presentation';
export function TeamBoard({v,host,busy,connectionMode,seatModes,send}:{v:View;host:boolean;busy:boolean;connectionMode:string;seatModes:Record<string,string>;send:(type:string,data?:Record<string,unknown>)=>unknown}){
 const cap=v.crewMode==='trios'?3:v.crewMode==='coop'?6:2,humans=v.seats.filter(s=>!s.bot),friendsSelected=v.crewMode!=='coop'&&v.seats.every(s=>!s.bot),botsSelected=v.crewMode!=='coop'&&humans.length>0&&humans.every(s=>s.team===0)&&v.seats.some(s=>s.team===1)&&v.seats.filter(s=>s.team===1).every(s=>s.bot);
 return <><div className="team-presets" role="group" aria-label="Team presets"><button aria-pressed={friendsSelected} disabled={!host||busy} onClick={()=>send('preset',{preset:'friends'})}>Friends vs friends</button><button aria-pressed={botsSelected} disabled={!host||busy||humans.length>3} onClick={()=>send('preset',{preset:'bots'})}>Friends vs bots</button></div><div className={"team-board"+(v.crewMode==='coop'?' single-crew':'')}>{(v.crewMode==='coop'?[0]:[0,1]).map(team=><section key={team} className={'team-column '+(team===0?'mint':'violet')} aria-label={team===0?'Mint crew':'Violet crew'}><h3>{team===0?'MINT':'VIOLET'} <small>{v.seats.filter(s=>s.team===team).length}/{cap}</small></h3><div className="team-seats">{v.seats.filter(s=>s.team===team).map(s=><div key={s.id} className="team-seat"><button className="seat-move" disabled={busy||v.crewMode==='coop'||(!host&&s.id!==v.you)} title={host&&v.crewMode!=='coop'?'Move '+s.name+' to '+(team===0?'Violet':'Mint'):undefined} onClick={()=>send('team',{seatId:s.id,team:1-team})}><Portrait team={team} echo={s.bot}/><span><b>{s.name}</b><small>{s.bot?'BOT':s.id===v.you?'YOU · '+connectionMode:s.id===v.host?'HOST':seatModes[s.id]||'Connecting…'}</small>{host&&v.crewMode!=='coop'&&<em>Move to {team===0?'Violet':'Mint'}</em>}</span></button>{host&&s.bot&&<button className="seat-remove" aria-label={'Remove '+s.name} disabled={busy} onClick={()=>send('remove',{botId:s.id})}>×</button>}</div>)}{!v.seats.some(seat=>seat.team===team)&&<p className="open-seat">Open seat</p>}</div><button className="team-add" disabled={!host||busy||v.seats.length>=6||v.seats.filter(s=>s.team===team).length>=cap} onClick={()=>send('bot',{team})}>+ Bot</button></section>)}</div></>;
}

export function MuseumPhoto({museum}:{museum:ReturnType<typeof plannedMuseum>}) {
 const photos: Record<string,string> = {'night-archive':'archive','flagship-velmont':'gallery'};
 const photo = photos[museum.id] || (museum.name.toLowerCase().includes('archive')?'archive':museum.name.toLowerCase().includes('cross')?'crossroads':'gallery');
 return <figure className="museum-photo">
   <img src={'/art/v24/'+photo+'.webp'} alt=""/>
   <figcaption><small>Next museum</small><strong>{museum.name}</strong><span>{photos[museum.id]?'2–4':museum.capacity} thieves</span></figcaption>
 </figure>;
}

export function LobbySettings({mode,difficulty,host,children}:{mode:View['crewMode'];difficulty:string;host:boolean;children:ReactNode}) {
 const [expanded,setExpanded]=useState(false);
 const format=mode==='coop'?'One crew':mode==='duos'?'1v1 / 2v2':'3 vs 3';
 return <section className="folio-settings">
   <button className="setup-summary" aria-expanded={expanded} aria-controls="crew-settings" onClick={()=>setExpanded(!expanded)}>
     <span>{format} · {difficulty}</span><b>{expanded?'Close setup':host?'Edit setup':'View setup'}</b>
   </button>
   <div id="crew-settings" className={'setup-fields'+(expanded?' expanded':'')}>{children}</div>
 </section>;
}
