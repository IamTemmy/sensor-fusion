/** Quiet synthesized score and effects, local Web Audio only. No third-party audio or keys. */
export class IntroSound {
  readonly context:AudioContext;
  private master:GainNode;
  private nodes:AudioScheduledSourceNode[]=[];
  private voice:AudioBufferSourceNode|null=null;
  private buffers=new Map<number,AudioBuffer>();
  constructor(){this.context=new AudioContext();this.master=this.context.createGain();this.master.gain.value=.65;this.master.connect(this.context.destination);void this.context.resume();}
  mute(muted:boolean){this.master.gain.setTargetAtTime(muted?0:.65,this.context.currentTime,.025);}
  async suspend(hidden:boolean){if(this.context.state==='closed')return;try{if(hidden)await this.context.suspend();else await this.context.resume();}catch{}}
  async prepareVoice(shot:number,data:ArrayBuffer|null){if(data&&!this.buffers.has(shot))try{this.buffers.set(shot,await this.context.decodeAudioData(data));}catch{}}
  stop(){for(const n of this.nodes){try{n.stop();n.disconnect();}catch{}}this.nodes=[];this.voice=null;}
  private tone(hz:number,start:number,duration:number,gain:number,type:OscillatorType='sine'){
    const ctx=this.context,osc=ctx.createOscillator(),volume=ctx.createGain();osc.type=type;osc.frequency.value=hz;volume.gain.setValueAtTime(.0001,start);volume.gain.exponentialRampToValueAtTime(Math.max(.0002,gain),start+.04);volume.gain.exponentialRampToValueAtTime(.0001,start+duration);osc.connect(volume).connect(this.master);osc.start(start);osc.stop(start+duration+.03);this.nodes.push(osc);return {osc,volume};
  }
  scene(shot:number,offset:number,duration:number){
    this.stop();const ctx=this.context,now=ctx.currentTime;
    // A sparse D-minor bed; the edit points are the downbeats, not an unrelated loop.
    for(const hz of [73.416,110,146.832])this.tone(hz,now,duration+.05,.012);
    this.tone(55,now,.32,.035); // quiet edit accent
    const buffer=this.buffers.get(shot);
    if(buffer&&offset<buffer.duration){const source=ctx.createBufferSource();source.buffer=buffer;source.connect(this.master);source.start(now,offset,Math.min(duration,buffer.duration-offset));this.nodes.push(source);this.voice=source;}
    if(shot===0){
      const rain=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*(duration+.1)),ctx.sampleRate),data=rain.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*.035;
      const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter();source.buffer=rain;filter.type='highpass';filter.frequency.value=950;source.connect(filter).connect(this.master);source.start(now);this.nodes.push(source);
      this.tone(35,now+Math.max(0,2-offset),1.2,.035,'triangle');this.tone(120,now,duration,.008);
    }
    if(shot===1||shot===3)for(let t=.4;t<duration;t+=shot===3?.34:.9)this.tone(85,now+t,.09,.018,'triangle');
    if(shot===3){
      const {osc,volume}=this.tone(610,now,duration,.035,'triangle');
      // Same 2 Hz phase as the renderer. Absolute shot offset keeps 03a/03b continuous.
      for(let t=0;t<duration;t+=.025){const pulse=.5+.5*Math.sin(Math.PI*4*(offset+t));volume.gain.setValueAtTime(.006+pulse*.022,now+t);osc.frequency.setValueAtTime(540+pulse*180,now+t);}
    }
  }
  endHit(){this.stop();this.tone(42,this.context.currentTime,.7,.13);this.tone(84,this.context.currentTime,.3,.035,'triangle');}
  close(){this.stop();void this.context.close().catch(()=>{});}
}
