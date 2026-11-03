'use client';
import {useEffect,useRef,useState} from 'react';
import {introAsset,INTRO_SHOTS} from '../../lib/noise/intro-story';
import {IntroMedia} from './intro-media';
import {IntroRenderer} from './intro-renderer';
export function IntroScene({shot,elapsed=0,calm=false,portrait=false,media}:{shot:number;elapsed?:number;calm?:boolean;portrait?:boolean;media?:IntroMedia}){
 const canvas=useRef<HTMLCanvasElement>(null),renderer=useRef<IntroRenderer|null>(null),clock=useRef(elapsed);useEffect(()=>{clock.current=elapsed;},[elapsed]);
 const [ready,Ready]=useState(false),[kind,Kind]=useState('poster'),[error,ErrorMessage]=useState('');
 useEffect(()=>{let cleanup:void|(()=>void);const mountFrame=requestAnimationFrame(()=>{cleanup=(()=>{const assets=media??new IntroMedia();let alive=true;Ready(false);Kind(calm?'calm-still':'poster');
 assets.loadShot(shot,portrait,!calm).then(images=>{if(!alive||calm||!canvas.current)return;try{renderer.current=new IntroRenderer(canvas.current,images);renderer.current.draw(shot,clock.current,portrait);Ready(true);Kind('depth-webgl');}catch(error){ErrorMessage(error instanceof Error?error.message:'Renderer unavailable');Kind('calm-still');}}).catch(()=>Kind('poster'));
 const lost=(e:Event)=>{e.preventDefault();Ready(false);Kind('calm-still');};const c=canvas.current;c?.addEventListener('webglcontextlost',lost);
 return()=>{alive=false;c?.removeEventListener('webglcontextlost',lost);renderer.current?.close();renderer.current=null;if(!media)assets.close();};})();});return()=>{cancelAnimationFrame(mountFrame);if(cleanup)cleanup();};},[shot,portrait,calm,media]);
 useEffect(()=>{renderer.current?.draw(shot,elapsed,portrait);},[shot,elapsed,portrait]);
 return <div className="cinema-scene" data-renderer={kind} data-renderer-error={error} aria-hidden="true">
 <img className="cinema-poster" src={introAsset(shot,portrait)} alt="" onLoad={()=>{const film=canvas.current?.closest<HTMLElement>('.cinema-film');if(film&&shot===0&&!film.dataset.shotFrameMs){const click=Number(film.dataset.clickAt);if(click)film.dataset.shotFrameMs=String(Math.round(performance.now()-click));}}} style={{transform:!ready?`scale(${1+Math.min(1,elapsed/INTRO_SHOTS[shot].seconds)*.012})`:undefined}}/>
 <canvas ref={canvas} className="cinema-depth" style={{opacity:ready?1:0}}/>
 </div>;
}
