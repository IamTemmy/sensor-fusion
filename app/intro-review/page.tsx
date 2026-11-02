'use client';
import {useEffect,useState} from 'react';
import {IntroScene} from '../../components/noise/intro-scenes';
import {INTRO_SHOTS} from '../../lib/noise/intro-story';
/** Deterministic presentation harness, no simulation or networking. */
export default function IntroReview(){const [shot,Shot]=useState(0),[calm,Calm]=useState(false),[portrait,Portrait]=useState(false),[elapsed,Elapsed]=useState(0);
 useEffect(()=>{const q=new URLSearchParams(location.search),s=Math.max(0,Math.min(4,Number(q.get('shot'))||0));Shot(s);Calm(q.has('calm'));Portrait(innerHeight>innerWidth);if(q.has('frame')){Elapsed(Number(q.get('time'))||INTRO_SHOTS[s].seconds*.65);return;}let frame=0,start=performance.now();const tick=(now:number)=>{Elapsed(((now-start)/1000)%INTRO_SHOTS[s].seconds);frame=requestAnimationFrame(tick);};frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame);},[]);
 return <main className="cinema-film"><div className="cinema-stage"><IntroScene shot={shot} elapsed={elapsed} calm={calm} portrait={portrait}/></div><header className="cinema-top"><span>VELMONT · AFTER HOURS</span><div><button onClick={()=>location.href=`/intro-review?shot=${(shot+1)%5}&frame`}>Next shot</button></div></header><div className="cinema-caption"><p>{INTRO_SHOTS[shot].caption}</p></div><div className="cinema-skip-hint">Any key or click to skip</div></main>;}
