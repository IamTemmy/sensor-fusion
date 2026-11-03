'use client';
import {useEffect,useState} from 'react';
export function CountHaul({value,reduced}:{value:number;reduced:boolean}){
 const [n,N]=useState(reduced?value:0);
 useEffect(()=>{let cleanup:void|(()=>void);const mountFrame=requestAnimationFrame(()=>{cleanup=(()=>{if(reduced){N(value);return;}let id=0;const start=performance.now();const frame=(t:number)=>{const f=Math.max(0,Math.min(1,(t-start)/850));N(Math.round(value*(1-(1-f)**3)));if(f<1)id=requestAnimationFrame(frame);};id=requestAnimationFrame(frame);return()=>cancelAnimationFrame(id);})();});return()=>{cancelAnimationFrame(mountFrame);if(cleanup)cleanup();};},[value,reduced]);
 return <span>{'$'+n.toLocaleString()}</span>;
}
