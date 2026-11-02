import {narrationWindow,prepareNarration} from '../../lib/noise/intro-audio.ts';
/** Original sparse suspense ambience/effects. No song, downloaded samples, or paid keys. */
export class IntroSound {
  readonly context:AudioContext|OfflineAudioContext;
  private master:GainNode;
  private ambience:GainNode;
  private nodes:AudioScheduledSourceNode[]=[];
  private buffers=new Map<number,AudioBuffer>();
  private closing=false;
  constructor(context?:OfflineAudioContext){
    this.context=context??new AudioContext();const ctx=this.context;
    this.master=ctx.createGain();this.master.gain.value=.65;
    this.ambience=ctx.createGain();this.ambience.connect(this.master);
    const limiter=ctx.createDynamicsCompressor();limiter.threshold.value=-3;limiter.knee.value=3;limiter.ratio.value=20;limiter.attack.value=.003;limiter.release.value=.15;
    this.master.connect(limiter).connect(ctx.destination);if(!context&&'resume' in ctx)void ctx.resume();
  }
  mute(muted:boolean){if(!this.closing)this.master.gain.setTargetAtTime(muted?0:.65,this.context.currentTime,.025);}
  async suspend(hidden:boolean){const ctx=this.context;if(!('close' in ctx)||ctx.state==='closed')return;try{if(hidden)await ctx.suspend();else await ctx.resume();}catch{}}
  async prepareVoice(shot:number,data:ArrayBuffer|null){
    if(!data||this.buffers.has(shot))return;
    try{const raw=await this.context.decodeAudioData(data),channels=Array.from({length:raw.numberOfChannels},(_,i)=>raw.getChannelData(i)),edit=prepareNarration(channels,raw.sampleRate);if(!edit)return;
      const buffer=this.context.createBuffer(raw.numberOfChannels,edit.end-edit.start,raw.sampleRate);
      channels.forEach((data,c)=>{const out=buffer.getChannelData(c);for(let i=0;i<out.length;i++)out[i]=data[edit.start+i]*edit.gain;});this.buffers.set(shot,buffer);
    }catch{/* Invalid/missing recordings leave captions only. */}
  }
  voiceDuration(shot:number){return this.buffers.get(shot)?.duration??0;}
  stop(){for(const n of this.nodes){try{n.stop();n.disconnect();}catch{}}this.nodes=[];this.ambience.gain.cancelScheduledValues(this.context.currentTime);this.ambience.gain.value=1;}
  private tone(hz:number,start:number,duration:number,gain:number,type:OscillatorType='sine'){
    const ctx=this.context,osc=ctx.createOscillator(),volume=ctx.createGain();osc.type=type;osc.frequency.value=hz;volume.gain.setValueAtTime(.0001,start);volume.gain.exponentialRampToValueAtTime(Math.max(.0002,gain),start+.04);volume.gain.exponentialRampToValueAtTime(.0001,start+Math.max(.05,duration));osc.connect(volume).connect(this.ambience);osc.start(start);osc.stop(start+duration+.03);this.nodes.push(osc);return {osc,volume};
  }
  scene(shot:number,offset:number,duration:number,start=this.context.currentTime){
    this.stop();const ctx=this.context,now=start;
    // Preserve the existing subtle tension, with no melodic score added.
    for(const hz of [73.416,110,146.832])this.tone(hz,now,duration+.05,.012);
    this.tone(55,now,.32,.035);
    const buffer=this.buffers.get(shot),window=buffer?narrationWindow(offset,buffer.duration):null;
    if(buffer&&window&&window.remaining>0){
      const source=ctx.createBufferSource();source.buffer=buffer;source.connect(this.master);
      // A short, low-level synthetic room reflection. Original procedural impulse.
      const reverb=ctx.createConvolver(),wet=ctx.createGain(),impulse=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*.16),ctx.sampleRate),samples=impulse.getChannelData(0);
      for(let i=0;i<samples.length;i++)samples[i]=(Math.sin(i*12.9898)*.5)*Math.pow(1-i/samples.length,3);
      reverb.buffer=impulse;wet.gain.value=.045;source.connect(reverb).connect(wet).connect(this.master);
      const at=now+window.delay,play=Math.min(window.remaining,Math.max(0,duration-window.delay));
      this.ambience.gain.setValueAtTime(1,now);this.ambience.gain.setTargetAtTime(Math.pow(10,-10/20),Math.max(now,at-.08),.04);
      this.ambience.gain.setTargetAtTime(1,at+play,.16);
      source.start(at,window.seek,play);this.nodes.push(source);
    }
    if(shot===0||shot===5){
      const rain=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*(duration+.1)),ctx.sampleRate),data=rain.getChannelData(0);let seed=193;
      for(let i=0;i<data.length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;data[i]=(seed/4294967296*2-1)*.035;}
      const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter();source.buffer=rain;filter.type='highpass';filter.frequency.value=950;source.connect(filter).connect(this.ambience);source.start(now);this.nodes.push(source);
      this.tone(35,now+Math.max(0,2-offset),1.2,.035,'triangle');this.tone(120,now,duration,.008);
    }
    if(shot===1||shot===4)for(let t=.4;t<duration;t+=shot===4?.34:.9)this.tone(85,now+t,.09,.018,'triangle');
    if(shot===4){const {osc,volume}=this.tone(610,now,duration,.035,'triangle');
      for(let t=0;t<duration;t+=.025){const pulse=.5+.5*Math.sin(Math.PI*4*(offset+t));volume.gain.setValueAtTime(.006+pulse*.022,now+t);osc.frequency.setValueAtTime(540+pulse*180,now+t);}
    }
  }
  endHit(start=this.context.currentTime){this.stop();this.tone(42,start,.7,.13);this.tone(84,start,.3,.035,'triangle');}
  close(){if(this.closing)return;this.closing=true;const ctx=this.context;if(!('close' in ctx))return;
    this.master.gain.cancelScheduledValues(ctx.currentTime);this.master.gain.setTargetAtTime(0,ctx.currentTime,.035);
    setTimeout(()=>{this.stop();void ctx.close().catch(()=>{});},160);
  }
}
