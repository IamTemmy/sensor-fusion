'use client';
import {useEffect,useState} from 'react';
// Development-only frames render the actual application at independent viewport sizes.
export default function Review(){
 const [spec,S]=useState<{w:number;h:number;state:string}|'paired'|null>(null);
 useEffect(()=>{if(process.env.NODE_ENV!=='development')return;const q=new URLSearchParams(location.search);if(!q.has('size')&&!q.has('state')){S('paired');return;}S({w:q.get('size')==='landscape'?844:q.get('size')==='small'?360:q.get('size')==='phone'?390:1280,h:q.get('size')==='landscape'?390:q.get('size')==='small'?740:q.get('size')==='phone'?844:720,state:q.get('state')||'home'});},[]);
 if(!spec)return <p>Visual review is available only in local development.</p>;
 if(spec!=='paired')return <div style={{width:spec.w,height:spec.h,background:'#08131e'}}><iframe title={spec.state==='live'?'Live responsive playtest':'Frozen visual review — not a live playtest'} src={spec.state==='live'?'/':'/?visualReview='+spec.state} style={{width:spec.w,height:spec.h,border:0,display:'block'}}/></div>;
 return <main style={{background:'#07101c',color:'#d6eee6',padding:12,minHeight:'100vh'}}><h1 style={{fontSize:20}}>The Velmont · development review</h1><p>Frozen presentation fixtures. These are not match results.</p><div style={{display:'flex',gap:20,alignItems:'flex-start'}}><iframe title="Phone closer view" src="/?visualReview=flagship-mirrors" width="390" height="844" style={{border:'1px solid #5c8e87',flexShrink:0}}/><iframe title="Desktop gameplay" src="/?visualReview=flagship-pass" width="900" height="740" style={{border:'1px solid #5c8e87',flexShrink:0}}/></div></main>;
}
