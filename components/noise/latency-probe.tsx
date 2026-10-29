'use client';
import {useState,useEffect,useRef} from 'react';
import type {OnlinePrediction} from '../../lib/noise/online-client';
import type {PeerRoom} from '../../lib/noise/peer-client';
/** Local-only acceptance probe. Uses the actual page's keyboard handlers and renderer. */
export function LatencyProbe({prediction,peer}:{prediction:{current:OnlinePrediction};peer:{current:PeerRoom|null}}){
 const [enabled,enable]=useState(false),[report,R]=useState(''),[connection,C]=useState(''),running=useRef(false);
 useEffect(()=>{enable(process.env.NODE_ENV==='development'&&new URLSearchParams(location.search).has('lag'));return()=>{running.current=false;};},[]);
 useEffect(()=>{if(!enabled)return;const t=setInterval(()=>C([...peer.current?.links.values()||[]].map(l=>`${l.pc.connectionState}/${l.pc.iceConnectionState}/${l.pc.signalingState} local=${l.pc.localDescription?.type} remote=${l.pc.remoteDescription?.type} auth=${l.authenticated} ICE=${l.localIce.length}/${l.remoteIce.size}`).join('; ')),1000);return()=>clearInterval(t);},[enabled]);
 function run(){if(running.current||!peer.current?.direct()||prediction.current.game?.phase!=='playing'){R('Start a match with a Direct guest first.');return;}running.current=true;
  const p=prediction.current;const x=()=>p.positions().get(p.you)?.x||0;const start=performance.now(),initial=x();let releaseAt=0,releaseX=0,overshoot=0,firstMove=0,firstStop:number|null=null,maxPending=0,taps=0,frames=0;
  const key=(type:string,k:string)=>window.dispatchEvent(new KeyboardEvent(type,{key:k,bubbles:true}));key('keydown','d');R('Running actual guest keyboard input: 300ms movement + 50 action taps…');
  const tick=(now:number)=>{if(!running.current)return;frames++;if(!firstMove&&x()>initial+.1)firstMove=frames;
   if(!releaseAt&&now-start>=300){releaseAt=now;releaseX=x();key('keyup','d');}
   else if(releaseAt){if(firstStop===null)firstStop=Math.abs(x()-releaseX);overshoot=Math.max(overshoot,x()-releaseX);}
   if(taps<50&&now-start>=taps*150){key('keydown','g');key('keyup','g');taps++;}maxPending=Math.max(maxPending,p.pending.length);
   if(now-start<9000){requestAnimationFrame(tick);return;}running.current=false;R(JSON.stringify({mode:peer.current?.mode,lag:peer.current?.lag,firstMoveFrames:firstMove,firstReleaseFrameDisplacement:firstStop,overshootPx:overshoot,pendingMax:maxPending,pending:p.pending.length,ack:p.ack,taps},null,2));
  };requestAnimationFrame(tick);
 }
 if(!enabled)return null;
 return <aside style={{position:'fixed',right:8,bottom:8,zIndex:10000,background:'#101825',color:'white',padding:8,maxWidth:350,fontSize:12}}><button onClick={run}>Run latency acceptance</button><p>{connection}</p><pre style={{whiteSpace:'pre-wrap'}}>{report}</pre></aside>;
}
