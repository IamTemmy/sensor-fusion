'use client';
import {useEffect,useState} from 'react';
import {vanFor,type View} from '../../lib/noise/engine';
import {COLORS} from '../../lib/noise/draw';
export function CountHaul({value,reduced}:{value:number;reduced:boolean}){
 const [n,N]=useState(reduced?value:0);
 useEffect(()=>{if(reduced){N(value);return;}let id=0,start=performance.now();const frame=(t:number)=>{const f=Math.min(1,(t-start)/850);N(Math.round(value*(1-(1-f)**3)));if(f<1)id=requestAnimationFrame(frame);};id=requestAnimationFrame(frame);return()=>cancelAnimationFrame(id);},[value,reduced]);
 return <span>{'$'+n.toLocaleString()}</span>;
}
export function MiniMap({v}:{v:View}){return <details className="hud-map"><summary aria-label="Toggle museum map">MAP</summary><svg viewBox="0 0 960 600" role="img" aria-label="Museum overview"><rect width="960" height="600" fill="#152839"/>{v.walls.map((w,i)=><rect key={i} {...w} fill="#879ca5"/>)}{v.loot.filter(l=>!l.banked).map(l=><circle key={l.id} cx={l.x} cy={l.y} r="13" fill="#f5ce80"/>)}{[...new Set(v.seats.map(s=>s.team))].map(team=>{const p=vanFor(v,team);return <rect key={team} x={p.x-22} y={p.y-22} width="44" height="44" fill={COLORS[team]}/>;})}{v.seats.filter(s=>!s.escaped).map(s=><circle key={s.id} cx={s.x} cy={s.y} r={s.id===v.you?16:10} fill={s.id===v.you?'#fff':COLORS[s.team]}/>)}</svg></details>;}
