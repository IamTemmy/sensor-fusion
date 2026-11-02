'use client';
import {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {VelmontWordmark} from './velmont-wordmark';
const SEEN='velmont-opening-v1';
const shots=[
 {label:'01 · AFTER HOURS',title:'The museum is closed.',line:'Your night is just beginning.'},
 {label:'02 · THE PLAN',title:'One crew. One chance.',line:'Find the art. Make a plan. Leave together.'},
 {label:'03 · THE DISTRACTION',title:'Steal the art. Pass the noise.',line:'An alarm in the wrong place is a very good distraction.'},
 {label:'04 · YOUR TURN',title:'Steal art. Throw trouble.',line:'A 90-second museum heist. One very loud getaway.'},
];
export function OpeningFilm(){
 const [open,Open]=useState(false),[shot,Shot]=useState(0),[ready,Ready]=useState(false);
 const skip=useRef<HTMLButtonElement>(null),replay=useRef<HTMLButtonElement>(null),previous=useRef<HTMLElement|null>(null);
 const finish=()=>{try{localStorage.setItem(SEEN,'seen');}catch{}Open(false);requestAnimationFrame(()=>{(previous.current?.isConnected?previous.current:replay.current)?.focus();});};
 useEffect(()=>{Ready(true);const q=new URLSearchParams(location.search);let seen=true;try{seen=!!localStorage.getItem(SEEN);}catch{}if(!seen&&!q.has('crew')&&!q.has('visualReview')&&!matchMedia('(prefers-reduced-motion: reduce)').matches){previous.current=document.activeElement as HTMLElement;Open(true);}},[]);
 useEffect(()=>{if(!open)return;const app=document.querySelector<HTMLElement>('.noise-app');const wasInert=app?.inert;if(app)app.inert=true;skip.current?.focus();const tick=window.setInterval(()=>{if(!document.hidden)Shot(s=>s+1);},4000);return()=>{clearInterval(tick);if(app)app.inert=!!wasInert;};},[open]);
 useEffect(()=>{if(open&&shot>=shots.length)finish();},[shot,open]);
 const scene=shots[Math.min(shot,3)];
 return <><button ref={replay} onClick={()=>{previous.current=document.activeElement as HTMLElement;Shot(0);Open(true);}}>Watch intro</button>{ready&&open&&createPortal(<div className="opening-film" role="dialog" aria-modal="true" aria-label="Velmont illustrated opening" onKeyDown={e=>{e.stopPropagation();if(e.key==='Escape'){e.preventDefault();finish();}if(e.key==='Tab'){e.preventDefault();skip.current?.focus();}}}>
 <div key={Math.min(shot,3)} className={'opening-shot shot-'+Math.min(shot,3)} aria-hidden="true">{shot<3?<div className="opening-illustration"/>:<img src="/art/concept/museum-getaway.webp" alt=""/>}</div>
 <div className="opening-shade"/>
 <header className="opening-top"><span>VELMONT <small>· AN AFTER-HOURS JOB</small></span><button ref={skip} onClick={finish}>Skip intro <span aria-hidden="true">×</span></button></header>
 <div className={'opening-copy '+(shot>=3?'opening-finale':'')} key={'copy-'+Math.min(shot,3)} aria-live="polite"><small>{scene.label}</small>{shot>=3&&<VelmontWordmark/>}<h2>{scene.title}</h2><p>{scene.line}</p></div>
 <div className="opening-progress" aria-label={`Scene ${Math.min(shot+1,4)} of 4`}>{shots.map((s,i)=><span key={s.label} className={i<shot?'complete':i===shot?'current':''}/>)}</div>
 </div>,document.body)}</>;
}
