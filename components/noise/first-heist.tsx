'use client';
import {useEffect,useRef,useState} from 'react';
import type {View} from '../../lib/noise/engine';
import {firstHeistStep,guideCopy,resumeGuide,GUIDE_KEY,type GuideProgress} from '../../lib/noise/first-heist';
import {ContextTip} from './presentation';
import {useTouchControls} from '../../hooks/use-touch-controls';
export function FirstHeist({v,solo=false}:{v:View;solo?:boolean}){
 const [progress,setProgress]=useState<GuideProgress|null>(null);
 const held=useRef(new Set<string>()),touch=useTouchControls();
 const soloStart=solo?v.start:undefined;
 const me=v.seats.find(s=>s.id===v.you);
 // Observe each rendered hand, including a hand that changes before an effect runs.
 useEffect(()=>{if(me?.hand&&v.loot.some(l=>l.id===me.hand))held.current.add(me.hand);},[me?.hand,v.loot]);
 useEffect(()=>{let cleanup:void|(()=>void);const mountFrame=requestAnimationFrame(()=>{cleanup=(()=>{let raw=null;try{raw=localStorage.getItem(GUIDE_KEY);}catch{}const restored=resumeGuide(raw,v.code,v.match,soloStart);restored.heldIds.forEach(id=>held.current.add(id));setProgress(restored);})();});return()=>{cancelAnimationFrame(mountFrame);if(cleanup)cleanup();};},[v.code,v.match,soloStart]);
 useEffect(()=>{if(!progress)return;const step=firstHeistStep(v,progress.step,held.current),heldIds=[...held.current];const next={...progress,step,heldIds};try{localStorage.setItem(GUIDE_KEY,JSON.stringify(next));}catch{}if(step!==progress.step||heldIds.length!==progress.heldIds.length)setProgress(next);},[v,progress]);
 const finish=()=>{if(!progress)return;const next={...progress,step:'done' as const};try{localStorage.setItem(GUIDE_KEY,JSON.stringify(next));}catch{}setProgress(next);};
 if(!progress)return null;
 if(progress.step==='done')return <ContextTip v={v}/>;
 const message=me&&me.stun>v.now?'A teammate can untie you. Stay still until they finish.':guideCopy(progress.step,touch,v.seats.some(s=>s.bot&&s.team===me?.team));
 return <aside className="context-tip first-heist" role="status"><span><b>FIRST HEIST · {['grab','alarm','bank','board'].indexOf(progress.step)+1}/4</b>{message}</span><button onClick={finish} aria-label="Skip guided first heist">Skip ×</button></aside>;
}
