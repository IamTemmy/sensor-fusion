'use client';
import {useEffect,useRef,useState} from 'react';
import {distance,type View} from '../../lib/noise/engine';
import {artwork} from '../../lib/noise/artwork';
import {museumIdentity} from '../../lib/noise/museum-identity';
export function MuseumPlacard({v}:{v:View}){
 const seen=useRef(new Set<string>()),match=useRef(''),until=useRef(0);const [card,S]=useState<{name:string;line:string}|null>(null);
 useEffect(()=>{const key=v.code+':'+v.match;if(match.current!==key){match.current=key;seen.current.clear();until.current=0;S(null);}const me=v.seats.find(s=>s.id===v.you);if(!me||me.hand||me.escaped||me.stun>v.now||v.training){S(null);return;}if(v.now<until.current)return;S(null);
 const decor=v.arena?.decor.find(d=>Math.hypot(Math.max(d.x-me.x,0,me.x-d.x-d.w),Math.max(d.y-me.y,0,me.y-d.y-d.h))<60&&!seen.current.has(d.kind));
 const art=v.loot.find(l=>!l.banked&&!l.holder&&!l.flight&&distance(me,l)<60&&!seen.current.has(l.id));
 if(decor||art){seen.current.add(decor?.kind||art!.id);until.current=v.now+4500;S(decor?{name:museumIdentity(['sculpture','fossil','orrery'].indexOf(decor.kind)).center,line:museumIdentity(['sculpture','fossil','orrery'].indexOf(decor.kind)).line}:{name:artwork(art!.id,art!.value,v.layout).name,line:['The collection remembers its owners; it never remembers their excuses.','Catalogued by candlelight, this treasure outlived every keeper of its secrets.','Its maker charted distant worlds without ever leaving this room.'][v.layout]});}
 },[v]);
 return <div className={'museum-placard '+(card?'visible':'')} role="status">{card&&<><strong>{card.name}</strong><span>{card.line}</span></>}</div>;
}
export function MuseumRadio({v}:{v:View}){const elapsed=v.now-v.start,index=[18000,43000,68000].findIndex(at=>elapsed>=at&&elapsed<at+6000);return index<0||v.training?null:<p className="museum-radio"><small>SECURITY RADIO</small>“{museumIdentity(v.layout).radio[index]}”</p>;}
