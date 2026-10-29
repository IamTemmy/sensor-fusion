/** Original procedural score: no samples, downloads or third-party compositions.
 * Bounded look-ahead scheduler, independent of simulation and networking. */
export class HeistMusic {
 private next=0; private step=0; private bus:GainNode; private active=false; private audio:AudioContext;
 constructor(audio:AudioContext){this.audio=audio;this.bus=audio.createGain();this.bus.gain.value=0;this.bus.connect(audio.destination);}
 update(enabled:boolean,pressure:number,lastCall:boolean){
  const a=this.audio;
  if(!enabled||a.state!=='running'){if(this.active){this.bus.gain.cancelScheduledValues(a.currentTime);this.bus.gain.setTargetAtTime(0,a.currentTime,.04);}this.active=false;this.next=0;return;}
  if(!this.active){this.next=a.currentTime+.02;this.active=true;this.bus.gain.setTargetAtTime(.55,a.currentTime,.15);}
  // Never replay missed beats after a backgrounded tab.
  if(this.next<a.currentTime-.1)this.next=a.currentTime+.02;
  const beat=lastCall ? .19 : pressure>=60 ? .23 : .27;
  for(let n=0;n<3&&this.next<a.currentTime+.13;n++){
   const i=this.step++%32,root=[45,45,41,43][Math.floor(i/8)];
   if(i%2===0)this.note(root+(i%8===6?7:0),this.next,.17,.018,'triangle');
   const melody=[12,null,19,15,null,22,19,null,12,15,null,19,22,null,15,10];
   const pitch=melody[i%16];if(pitch!==null)this.note(root+pitch,this.next,.10,.009,'sine');
   if((pressure>=30||lastCall)&&i%2===1)this.note(root+24,this.next,.035,.004,'triangle');
   this.next+=beat;
  }
 }
 private note(midi:number,at:number,duration:number,volume:number,type:OscillatorType){
  const a=this.audio,o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.value=440*2**((midi-69)/12);
  g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(volume,at+.008);g.gain.exponentialRampToValueAtTime(.0001,at+duration);
  o.connect(g);g.connect(this.bus);o.onended=()=>{o.disconnect();g.disconnect();};o.start(at);o.stop(at+duration+.02);
 }
 dispose(){this.bus.gain.value=0;this.bus.disconnect();}
}
