'use client';
import {useEffect,useState} from 'react';
import type {View} from '../../lib/noise/engine';
import {firstHeistStep,firstHeistCopy,type Lesson} from '../../lib/noise/first-heist';
import {ContextTip} from './presentation';
import {useTouchControls} from '../../hooks/use-touch-controls';
import {touchCopy} from '../../lib/noise/input-copy';
const KEY='velmont-first-heist-v1';
export function FirstHeist({v}:{v:View}){
 const [enabled,setEnabled]=useState<boolean|null>(null),[step,setStep]=useState<Lesson>('grab');
 const touch=useTouchControls();
 useEffect(()=>{try{const fresh=!localStorage.getItem(KEY);setEnabled(fresh);if(fresh)localStorage.setItem(KEY,'started');}catch{setEnabled(true);}},[]);
 const finish=()=>{setEnabled(false);try{localStorage.setItem(KEY,'done');}catch{}};
 useEffect(()=>{if(!enabled)return;const next=firstHeistStep(v,step);if(next!==step)setStep(next);if(next==='done')finish();},[v,step,enabled]);
 if(enabled===null)return null;
 if(!enabled||step==='done')return <ContextTip v={v}/>;
 const me=v.seats.find(s=>s.id===v.you);
 const message=me&&me.stun>v.now?'A teammate can untie you. Stay still until they finish.':firstHeistCopy[step];
 return <aside className="context-tip first-heist" role="status"><span><b>FIRST HEIST · {['grab','alarm','bank','board'].indexOf(step)+1}/4</b>{touch?message.replace('Grab (E)','Grab').replace('F passes','Tap Pass to send').replace('F shakes','tap Shake off to fling').replace('Board (R)','Board'):message}</span><button onClick={finish} aria-label="Skip guided first heist">Skip ×</button></aside>;
}
