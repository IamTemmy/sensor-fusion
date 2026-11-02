import {heistScoreStep,HEIST_EIGHTH_SECONDS} from './heist-score.ts';
import type {ScoreNote} from './heist-score.ts';
/** Original tense procedural underscore: no samples, downloads or third-party compositions.
 * Bounded look-ahead scheduler, independent of simulation and networking. */
export class HeistMusic {
 private next=0;private step=0;private bus:GainNode;private active=false;private audio:AudioContext;
 private sources=new Set<AudioScheduledSourceNode>();private noise:AudioBuffer;
 constructor(audio:AudioContext){
  this.audio=audio;this.bus=audio.createGain();this.bus.gain.value=0;
  const filter=audio.createBiquadFilter();filter.type='lowpass';filter.frequency.value=1800;this.bus.connect(filter).connect(audio.destination);
  this.noise=audio.createBuffer(1,Math.ceil(audio.sampleRate*.08),audio.sampleRate);const data=this.noise.getChannelData(0);let seed=37;
  for(let i=0;i<data.length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;data[i]=seed/4294967296*2-1;}
 }
 update(enabled:boolean,pressure:number,lastCall:boolean){
  const a=this.audio;
  if(!enabled||a.state!=='running'){if(this.active){this.bus.gain.cancelScheduledValues(a.currentTime);this.bus.gain.setTargetAtTime(0,a.currentTime,.04);}this.active=false;this.next=0;return;}
  if(!this.active){this.next=a.currentTime+.02;this.active=true;this.bus.gain.setTargetAtTime(.5,a.currentTime,.2);}
  if(this.next<a.currentTime-.1)this.next=a.currentTime+.02;
  for(let n=0;n<3&&this.next<a.currentTime+.13;n++){
   for(const note of heistScoreStep(this.step++,pressure,lastCall))this.note(note,this.next);
   this.next+=HEIST_EIGHTH_SECONDS;
  }
 }
 private note(note:ScoreNote,at:number){
  const a=this.audio,g=a.createGain(),filter=a.createBiquadFilter();let source:AudioScheduledSourceNode;
  if(note.voice==='tick'){const noise=a.createBufferSource();noise.buffer=this.noise;source=noise;filter.type='bandpass';filter.frequency.value=950;filter.Q.value=.6;}
  else{const o=a.createOscillator();o.type=note.voice==='drone'?'sawtooth':'triangle';o.frequency.value=440*2**((note.midi-69)/12);if(note.voice==='pulse')o.frequency.exponentialRampToValueAtTime(o.frequency.value*.96,at+note.seconds);source=o;filter.type='lowpass';filter.frequency.value=note.voice==='drone'?260:480;filter.Q.value=.5;}
  const attack=note.voice==='drone'?.25:note.voice==='tension'?.08:.012;
  g.gain.setValueAtTime(.0001,at);g.gain.exponentialRampToValueAtTime(note.gain,at+attack);g.gain.exponentialRampToValueAtTime(.0001,at+note.seconds);
  source.connect(filter).connect(g).connect(this.bus);this.sources.add(source);
  source.onended=()=>{source.disconnect();filter.disconnect();g.disconnect();this.sources.delete(source);};source.start(at);source.stop(at+note.seconds+.02);
 }
 dispose(){for(const source of this.sources){try{source.stop();source.disconnect();}catch{}}this.sources.clear();this.bus.gain.value=0;this.bus.disconnect();}
}
