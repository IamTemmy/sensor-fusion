import {IntroSound} from './intro-sound';
import {INTRO_SEGMENTS,INTRO_DURATION} from '../../lib/noise/intro-story';
/** Offline export uses the exact live synthesizer, never an imitation soundtrack. */
export async function exportIntroAmbience(){
 const rate=44100,ctx=new OfflineAudioContext(1,rate*(INTRO_DURATION+1),rate);let at=0;
 for(const part of INTRO_SEGMENTS){new IntroSound(ctx).scene(part.shot,part.offset,part.seconds,at);at+=part.seconds;}
 new IntroSound(ctx).endHit(at);
 const buffer=await ctx.startRendering(),pcm=buffer.getChannelData(0),bytes=new ArrayBuffer(44+pcm.length*2),view=new DataView(bytes);
 const text=(offset:number,s:string)=>{for(let i=0;i<s.length;i++)view.setUint8(offset+i,s.charCodeAt(i));};
 text(0,'RIFF');view.setUint32(4,36+pcm.length*2,true);text(8,'WAVE');text(12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);view.setUint32(24,rate,true);view.setUint32(28,rate*2,true);view.setUint16(32,2,true);view.setUint16(34,16,true);text(36,'data');view.setUint32(40,pcm.length*2,true);
 for(let i=0;i<pcm.length;i++)view.setInt16(44+i*2,Math.max(-1,Math.min(1,pcm[i]))*32767,true);
 const url=URL.createObjectURL(new Blob([bytes],{type:'audio/wav'})),a=document.createElement('a');a.href=url;a.download='velmont-intro-ambience.wav';a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);
}
