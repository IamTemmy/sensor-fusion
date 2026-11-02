/** Presentation-only narration timing and PCM preparation. No game state. */
export const VOICE_DELAY=.3;
export function narrationWindow(offset:number,duration:number){
 return {delay:Math.max(0,VOICE_DELAY-offset),seek:Math.max(0,offset-VOICE_DELAY),remaining:Math.max(0,duration-Math.max(0,offset-VOICE_DELAY))};
}
export function narratedSegmentSeconds(base:number,offset:number,seconds:number,voiceSeconds:number){
 return offset+seconds<base?seconds:Math.max(base,VOICE_DELAY+voiceSeconds+.15)-offset;
}
/** Trim only leading/trailing silence, retain 30ms breath margin, normalize RMS with peak headroom. */
export function prepareNarration(channels:Float32Array[],sampleRate:number){
 const length=channels[0]?.length??0;let first=length,last=-1;
 for(const data of channels)for(let i=0;i<data.length;i++)if(Math.abs(data[i])>.003){first=Math.min(first,i);last=Math.max(last,i);}
 if(last<first)return null;
 const margin=Math.round(sampleRate*.03),start=Math.max(0,first-margin),end=Math.min(length,last+margin+1);
 let energy=0,peak=0;for(const data of channels)for(let i=start;i<end;i++){energy+=data[i]*data[i];peak=Math.max(peak,Math.abs(data[i]));}
 const rms=Math.sqrt(energy/((end-start)*channels.length));
 const gain=Math.min(4,.12/Math.max(rms,.0001),.8/Math.max(peak,.0001));
 return {start,end,gain};
}
