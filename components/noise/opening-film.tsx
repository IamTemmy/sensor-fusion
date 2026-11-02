'use client';
import {forwardRef,useCallback,useEffect,useImperativeHandle,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {INTRO_DURATION,INTRO_SEEN,INTRO_SHOTS,allowIntroVideo,introClip,introFrame} from '../../lib/noise/intro-story';
import {IntroScene} from './intro-scenes';
import {introSound} from './intro-sound';
export type OpeningFilmHandle={playFirst:()=>void};
/** Real clips are optional. The illustrated scene remains underneath throughout decoding. */
function Clip({shot,elapsed}:{shot:number;elapsed:number}){
 const [url,Url]=useState(''),[visible,Visible]=useState(false);const video=useRef<HTMLVideoElement>(null),time=useRef(elapsed);time.current=elapsed;
 useEffect(()=>{const controller=new AbortController();let alive=true;Url('');Visible(false);const portrait=innerHeight>innerWidth;
 (async()=>{for(const orientation of portrait?[true,false]:[false])for(const ext of ['webm','mp4'] as const){if(!document.createElement('video').canPlayType(ext==='webm'?'video/webm':'video/mp4'))continue;const src=introClip(shot,orientation,ext);try{const r=await fetch(src,{method:'HEAD',signal:controller.signal});if(r.ok&&r.headers.get('content-type')?.startsWith('video/')){if(alive)Url(src);return;}}catch{if(controller.signal.aborted)return;}}})();return()=>{alive=false;controller.abort();};},[shot]);
 return url?<video ref={video} className={'story-video '+(visible?'is-ready':'')} src={url} muted playsInline preload="auto" onLoadedData={()=>{const v=video.current;if(!v)return;v.currentTime=Math.min(time.current,Math.max(0,v.duration-.1));v.play().then(()=>Visible(true)).catch(()=>Visible(false));}} onPlaying={()=>Visible(true)} onWaiting={()=>Visible(false)} onStalled={()=>Visible(false)} onEnded={()=>Visible(false)} onError={()=>Visible(false)}/>:null;
}
export const OpeningFilm=forwardRef<OpeningFilmHandle,{muted?:boolean}>(function OpeningFilm({muted=true},ref){
 const [open,Open]=useState(false),[time,Time]=useState(0),[calm,Calm]=useState(false),[video,Video]=useState(false);
 const skip=useRef<HTMLButtonElement>(null),replay=useRef<HTMLButtonElement>(null),previous=useRef<HTMLElement|null>(null),voice=useRef<HTMLAudioElement|null>(null),audio=useRef<AudioContext|null>(null);
 const finish=useCallback(()=>{try{localStorage.setItem(INTRO_SEEN,'seen');}catch{}voice.current?.pause();audio.current?.close().catch(()=>{});audio.current=null;Open(false);requestAnimationFrame(()=>{(previous.current?.isConnected?previous.current:replay.current)?.focus();});},[]);
 const play=useCallback(()=>{previous.current=document.activeElement as HTMLElement;const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;Calm(reduce);Video(allowIntroVideo(reduce,(navigator as Navigator&{connection?:{saveData?:boolean;effectiveType?:string;downlink?:number}}).connection));Time(0);performance.mark('velmont-intro-click');Open(true);for(const src of ['/cinematics/intro-v2/museum.webp','/cinematics/intro-v2/van.webp','/cinematics/intro-v2/hand.webp','/art/concept/planning-desk.webp','/art/v25/museum-atlas.webp']){const image=new Image();image.src=src;}if(!muted){try{audio.current=new AudioContext();void audio.current.resume();}catch{}}},[muted]);
 useImperativeHandle(ref,()=>({playFirst:()=>{try{if(localStorage.getItem(INTRO_SEEN))return;}catch{}play();}}),[play]);
 useEffect(()=>{if(!open)return;const app=document.querySelector<HTMLElement>('.noise-app');const was=app?.inert;if(app)app.inert=true;skip.current?.focus();let last=performance.now(),elapsed=0,frame=0;const tick=(now:number)=>{if(!document.hidden)elapsed+=(now-last)/1000;last=now;Time(elapsed);if(elapsed>=INTRO_DURATION){finish();return;}frame=requestAnimationFrame(tick);};frame=requestAnimationFrame(tick);const visibility=()=>{last=performance.now();document.querySelectorAll<HTMLElement>('.story-scene *').forEach(el=>el.style.animationPlayState=document.hidden?'paused':'running');if(document.hidden)voice.current?.pause();};document.addEventListener('visibilitychange',visibility);const key=(e:KeyboardEvent)=>{e.preventDefault();e.stopImmediatePropagation();finish();};window.addEventListener('keydown',key,true);requestAnimationFrame(()=>{performance.mark('velmont-intro-first-frame');const click=performance.getEntriesByName('velmont-intro-click').at(-1);const el=document.querySelector<HTMLElement>('.story-film');if(el&&click)el.dataset.firstFrameMs=String(Math.round(performance.now()-click.startTime));});return()=>{cancelAnimationFrame(frame);document.removeEventListener('visibilitychange',visibility);window.removeEventListener('keydown',key,true);if(app)app.inert=!!was;};},[open,finish]);
 const {shot,elapsed}=introFrame(time);
 useEffect(()=>{if(!open||muted)return;const controller=new AbortController();let disposed=false;const src=`/cinematics/intro-v2/voice-${String(shot+1).padStart(2,'0')}.mp3`;
 fetch(src,{method:'HEAD',signal:controller.signal}).then(r=>{if(disposed||!r.ok||!r.headers.get('content-type')?.startsWith('audio/'))return;const a=new Audio(src);voice.current=a;void a.play().catch(()=>{});}).catch(()=>{});
 const stopSound=audio.current?introSound(audio.current,shot):()=>{};
 return()=>{disposed=true;controller.abort();voice.current?.pause();stopSound();};},[shot,open,muted]);
 useEffect(()=>()=>{voice.current?.pause();void audio.current?.close().catch(()=>{});},[]);
 return <><button ref={replay} onClick={play}>Watch intro</button>{open&&createPortal(<div className={'story-film '+(calm?'story-reduced':'')} role="dialog" aria-modal="true" aria-label="Velmont opening story" data-shot={shot+1} data-renderer={video?'video-if-available':'layered-animation'} style={{opacity:shot===4&&elapsed>2.5?Math.max(0,(3-elapsed)*2):1}} onPointerDown={e=>{e.preventDefault();e.stopPropagation();finish();}}>
 <IntroScene key={shot} shot={shot} calm={calm}/>{video&&<Clip key={'clip'+shot} shot={shot} elapsed={elapsed}/>}
 <header className="story-top"><span>VELMONT · AFTER HOURS</span><button ref={skip} onClick={finish}>Skip intro ×</button></header>
 <div className="story-caption" aria-live="polite"><small>{String(shot+1).padStart(2,'0')} / 05 · {INTRO_SHOTS[shot].name}</small><p>{INTRO_SHOTS[shot].caption}</p></div>
 <div className="story-progress" aria-hidden="true">{INTRO_SHOTS.map((s,i)=><i key={s.name} style={{opacity:i<=shot?1:.25}}/>)}</div>
 </div>,document.body)}</>;
});
