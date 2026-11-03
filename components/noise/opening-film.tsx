'use client';
import {forwardRef,useCallback,useEffect,useImperativeHandle,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {INTRO_SEEN,INTRO_SHOTS,INTRO_SEGMENTS,allowIntroVideo,endingOpacity,shouldUseClipAudio} from '../../lib/noise/intro-story';
import {narratedSegmentSeconds} from '../../lib/noise/intro-audio';
import {IntroScene} from './intro-scenes';
import {IntroSound} from './intro-sound';
import {IntroMedia} from './intro-media';
import {VelmontWordmark} from './velmont-wordmark';
export type OpeningFilmHandle={playFirst:()=>void};
export const OpeningFilm=forwardRef<OpeningFilmHandle,{muted?:boolean;onMutedChange?:(muted:boolean)=>void}>(function OpeningFilm({muted=true,onMutedChange},ref){
 const [open,Open]=useState(false),[segment,Segment]=useState(0),[displayShot,DisplayShot]=useState(0),[elapsed,Elapsed]=useState(0),[ending,Ending]=useState(0),[calm,Calm]=useState(false),[portrait,Portrait]=useState(false),[clip,Clip]=useState(''),[playing,Playing]=useState(false),[ready,Ready]=useState(false),[loadError,LoadError]=useState(false),[soundMuted,SoundMuted]=useState(muted),[audioBlocked,AudioBlocked]=useState(false);
 const video=useRef<HTMLVideoElement>(null),skip=useRef<HTMLButtonElement>(null),replay=useRef<HTMLButtonElement>(null),previous=useRef<HTMLElement|null>(null),media=useRef<IntroMedia|null>(null),sound=useRef<IntroSound|null>(null),mutedRef=useRef(muted),clickAt=useRef(0);
 const finish=useCallback(()=>{try{localStorage.setItem(INTRO_SEEN,'seen');}catch{}video.current?.pause();media.current?.close();media.current=null;const fading=sound.current;sound.current=null;fading?.close();Open(false);requestAnimationFrame(()=>{(previous.current?.isConnected?previous.current:replay.current)?.focus();});},[]);
 useEffect(()=>{SoundMuted(muted);},[muted]);
 useEffect(()=>{mutedRef.current=soundMuted;sound.current?.mute(soundMuted);if(video.current)video.current.muted=!shouldUseClipAudio(true,soundMuted);},[soundMuted]);
 const play=useCallback(()=>{
  previous.current=document.activeElement as HTMLElement;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  Calm(!allowIntroVideo(reduce,(navigator as Navigator&{connection?:{saveData?:boolean;effectiveType?:string;downlink?:number}}).connection));
  Portrait(innerHeight>innerWidth);Segment(0);DisplayShot(0);Elapsed(0);Ending(0);Ready(false);LoadError(false);Clip('');Playing(false);AudioBlocked(false);SoundMuted(muted);mutedRef.current=muted;
  media.current?.close();media.current=new IntroMedia();sound.current?.close();try{sound.current=new IntroSound();sound.current.mute(muted);}catch{sound.current=null;}
  clickAt.current=performance.now();Open(true);
 },[muted]);
 useImperativeHandle(ref,()=>({playFirst:()=>{try{if(localStorage.getItem(INTRO_SEEN))return;}catch{}play();}}),[play]);
 useEffect(()=>{
  if(!open)return;
  const app=document.querySelector<HTMLElement>('.noise-app'),was=app?.inert;if(app)app.inert=true;skip.current?.focus();
  const key=(e:KeyboardEvent)=>{e.preventDefault();e.stopImmediatePropagation();finish();};window.addEventListener('keydown',key,true);
  const orientation=()=>Portrait(innerHeight>innerWidth);window.addEventListener('resize',orientation);
  return()=>{window.removeEventListener('keydown',key,true);window.removeEventListener('resize',orientation);if(app)app.inert=!!was;};
 },[open,finish]);
 useEffect(()=>{
  if(!open)return;
  if(segment>=INTRO_SEGMENTS.length){
   sound.current?.endHit();let frame=0,last=performance.now(),time=0;
   const tick=(now:number)=>{if(!document.hidden)time+=(now-last)/1000;last=now;Ending(time);if(endingOpacity(time)<=0){finish();return;}frame=requestAnimationFrame(tick);};
   frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame);
  }
  const assets=media.current;if(!assets)return;
  const info=INTRO_SEGMENTS[segment];let alive=true,frame=0,last=performance.now(),time=0,started=false,mode:'pending'|'video'|'illustration'='pending',stall=0,lastVideo=-1,budget:number=info.seconds;
  const wait=(ms:number)=>new Promise<null>(resolve=>setTimeout(()=>resolve(null),ms));
  // Probe optional media concurrently. Missing videos never impose the former 900ms serial pause.
  const clipReady=calm?Promise.resolve(null):assets.clip(segment,portrait);
  const voiceReady=assets.voice(info.shot).then(data=>data?sound.current?.prepareVoice(info.shot,data):undefined).catch(()=>{});
  const prepare=(s:number)=>{const part=INTRO_SEGMENTS[s];if(!part)return;void assets.loadShot(part.shot,portrait,!calm).catch(()=>{});if(!calm)void assets.clip(s,portrait);void assets.voice(part.shot).then(data=>{if(data&&alive)return sound.current?.prepareVoice(part.shot,data);}).catch(()=>{});};
  prepare(segment+1);
  const fallback=()=>{
   if(!alive)return;video.current?.pause();Clip('');Playing(false);mode='illustration';started=true;last=performance.now();
   budget=narratedSegmentSeconds(info.seconds,0,info.seconds,sound.current?.voiceDuration(info.shot)??0);
   sound.current?.scene(info.shot,time,Math.max(.1,budget-time));
  };
  void (async()=>{
   try{await assets.loadShot(info.shot,portrait,false);}catch{if(alive)LoadError(true);return;}
   if(!alive)return;
   // Keep the menu visible until the first poster is decoded; keep the previous shot during later loads.
   DisplayShot(info.shot);Elapsed(0);Ready(true);LoadError(false);Clip('');Playing(false);AudioBlocked(false);
   const el=document.querySelector<HTMLElement>('.cinema-film');if(el&&segment===0)el.dataset.firstFrameMs=String(Math.round(performance.now()-clickAt.current));
   // The decoded poster is already visible. Wait for the bounded voice load so
   // narration cannot arrive after scene() has scheduled a silent shot.
   const [url]=await Promise.all([Promise.race([clipReady,wait(100)]),voiceReady]);
   if(!alive)return;
   if(url){mode='video';Clip(url);last=performance.now();}else fallback();
  })();
  const advance=()=>{if(alive){alive=false;sound.current?.stop();Segment(s=>s+1);}};
  const tick=(now:number)=>{
   if(!alive)return;const delta=Math.max(0,(now-last)/1000);last=now;
   if(!document.hidden){
    if(mode==='video'){
     const v=video.current;
     if(v&&v.readyState>=2){
      if(!started){started=true;v.muted=mutedRef.current;void v.play().catch(()=>{if(!alive)return;v.muted=true;AudioBlocked(!mutedRef.current);void v.play().catch(fallback);});}
      if(!v.paused){time=v.currentTime;Playing(true);}if(v.ended){advance();return;}
      if(time===lastVideo)stall+=delta;else stall=0;lastVideo=time;if(stall>4)fallback();
     }else{stall+=delta;if(stall>2.5)fallback();}
    }else if(mode==='illustration'&&started){time+=delta;if(time>=budget){advance();return;}}
    if(mode!=='pending')Elapsed(time);
   }
   frame=requestAnimationFrame(tick);
  };frame=requestAnimationFrame(tick);
  const visibility=()=>{last=performance.now();void sound.current?.suspend(document.hidden);if(document.hidden)video.current?.pause();else if(mode==='video'&&started)void video.current?.play().catch(fallback);};document.addEventListener('visibilitychange',visibility);
  return()=>{alive=false;cancelAnimationFrame(frame);document.removeEventListener('visibilitychange',visibility);sound.current?.stop();video.current?.pause();};
 },[open,segment,calm,portrait,finish]);
 useEffect(()=>()=>{media.current?.close();sound.current?.close();},[]);
 const end=segment>=INTRO_SEGMENTS.length;
 const enableAudio=()=>{if(audioBlocked){const v=video.current;if(v){v.muted=false;void v.play().then(()=>AudioBlocked(false)).catch(()=>{});}}else{SoundMuted(!soundMuted);onMutedChange?.(!soundMuted);}};
 return <><button ref={replay} onClick={play}>Watch intro</button>{open&&createPortal(<div className={`cinema-film cinema-player ${ready?'is-ready':'is-preparing'}`} role="dialog" aria-modal="true" aria-label="Velmont opening story" data-click-at={clickAt.current} data-shot={displayShot+1} data-segment={segment} data-mode={clip?'video':calm?'calm':'depth'} data-ending={end} style={{opacity:end?endingOpacity(ending):1}} onPointerDown={e=>{e.preventDefault();e.stopPropagation();finish();}}>
 {!end&&<>
  <div className="cinema-stage"><IntroScene key={`${displayShot}/${portrait}`} shot={displayShot} elapsed={elapsed} calm={calm} portrait={portrait} media={media.current??undefined}/><video ref={video} className="cinema-video" aria-hidden={!clip} src={clip||undefined} muted={soundMuted} playsInline preload="auto" style={{opacity:playing?1:0}} onError={()=>Playing(false)}/></div>
  <header className="cinema-top"><span>VELMONT · AFTER HOURS</span><div onPointerDown={e=>e.stopPropagation()}><button onClick={enableAudio}>{audioBlocked?'Enable sound':soundMuted?'SFX OFF':'SFX ON'}</button><button ref={skip} onClick={finish}>Skip ×</button></div></header>
  {ready&&<div className="cinema-caption" aria-live="polite"><p>{INTRO_SHOTS[displayShot].caption}</p></div>}
  {displayShot===5&&elapsed>=3.6&&<div className="cinema-title-reveal"><VelmontWordmark/></div>}
  {(!ready||loadError)&&<div className="cinema-loading" role="status">{loadError?'Story unavailable. Select Skip to return to the hideout.':'Opening story…'}</div>}
  <div className="cinema-skip-hint">Press any key or click to skip</div>
 </>}
 </div>,document.body)}</>;
});
