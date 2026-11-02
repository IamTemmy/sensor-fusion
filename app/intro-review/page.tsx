'use client';
import {useEffect,useState} from 'react';
import {IntroScene} from '../../components/noise/intro-scenes';
import {INTRO_SHOTS} from '../../lib/noise/intro-story';
/** Presentation-only visual harness: deterministic frames at real viewport dimensions. */
export default function IntroReview(){const [shot,Shot]=useState(0),[calm,Calm]=useState(false),[frozen,Frozen]=useState(false);
 useEffect(()=>{const q=new URLSearchParams(location.search);Shot(Math.max(0,Math.min(4,Number(q.get('shot'))||0)));Calm(q.has('calm'));Frozen(q.has('frame'));},[]);
 useEffect(()=>{if(!frozen)return;const id=requestAnimationFrame(()=>{for(const animation of document.getAnimations()){animation.currentTime=shot===4?800:INTRO_SHOTS[shot].seconds*650;animation.pause();}});return()=>cancelAnimationFrame(id);},[shot,frozen]);
 return <main style={{position:'fixed',inset:0}}><div className="story-film"><IntroScene key={shot} shot={shot} calm={calm}/><header className="story-top"><span>VELMONT · AFTER HOURS</span><button onClick={()=>Shot((shot+1)%5)}>Skip intro ×</button></header><div className="story-caption"><small>{shot+1}/5 · {INTRO_SHOTS[shot].name}</small><p>{INTRO_SHOTS[shot].caption}</p></div></div></main>;}
