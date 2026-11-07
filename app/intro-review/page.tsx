'use client';
import {useTypePair} from '../../components/noise/type-pair';
import {useEffect,useState} from 'react';
import {VelmontWordmark} from '../../components/noise/velmont-wordmark';
import {IntroScene} from '../../components/noise/intro-scenes';
import {exportIntroAmbience} from '../../components/noise/intro-audio-review';
import {INTRO_SHOTS} from '../../lib/noise/intro-story';
/** Deterministic presentation harness, no simulation or networking. */
export default function IntroReview(){useTypePair();const [shot,Shot]=useState(0),[calm,Calm]=useState(false),[portrait,Portrait]=useState(false),[elapsed,Elapsed]=useState(0);
 useEffect(()=>{let cleanup:void|(()=>void);const mountFrame=requestAnimationFrame(()=>{cleanup=(()=>{const q=new URLSearchParams(location.search),s=Math.max(0,Math.min(5,Number(q.get('shot'))||0));Shot(s);Calm(q.has('calm'));Portrait(innerHeight>innerWidth);if(q.has('frame')){Elapsed(Number(q.get('time'))||INTRO_SHOTS[s].seconds*.65);return;}let frame=0;const start=performance.now();const tick=(now:number)=>{Elapsed(((now-start)/1000)%INTRO_SHOTS[s].seconds);frame=requestAnimationFrame(tick);};frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame);})();});return()=>{cancelAnimationFrame(mountFrame);if(cleanup)cleanup();};},[]);
 return <main className="cinema-film cinema-player is-ready"><div className="cinema-stage"><IntroScene shot={shot} elapsed={elapsed} calm={calm} portrait={portrait}/></div><header className="cinema-top"><span>VELMONT · AFTER HOURS</span><div><button onClick={()=>void exportIntroAmbience()}>Export ambience WAV</button><button onClick={()=>location.href=`/intro-review?shot=${(shot+1)%6}&frame`}>Next shot</button></div></header><div className="cinema-caption"><p>{INTRO_SHOTS[shot].caption}</p></div>{shot===5&&elapsed>=3.6&&<div className="cinema-title-reveal"><VelmontWordmark/></div>}<div className="cinema-skip-hint">Press any key or click to skip</div></main>;}
