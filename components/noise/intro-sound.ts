/** Small synthesized cues, generated locally; no downloads or keys. */
export function introSound(ctx:AudioContext,shot:number):()=>void{
 const nodes:AudioScheduledSourceNode[]=[];const now=ctx.currentTime;
 function tone(hz:number,at:number,seconds:number,gain:number,type:OscillatorType='sine'){
  const source=ctx.createOscillator(),volume=ctx.createGain();source.type=type;source.frequency.value=hz;volume.gain.setValueAtTime(.0001,now+at);volume.gain.exponentialRampToValueAtTime(gain,now+at+.035);volume.gain.exponentialRampToValueAtTime(.0001,now+at+seconds);source.connect(volume).connect(ctx.destination);source.start(now+at);source.stop(now+at+seconds+.01);nodes.push(source);
 }
 if(shot===0||shot===3){const buffer=ctx.createBuffer(1,ctx.sampleRate*5,ctx.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*.055;const rain=ctx.createBufferSource(),filter=ctx.createBiquadFilter();rain.buffer=buffer;filter.type='highpass';filter.frequency.value=1200;rain.connect(filter).connect(ctx.destination);rain.start();nodes.push(rain);tone(80,0,shot===0?4.8:2.8,.018);}
 if(shot===2)for(let i=0;i<8;i++)tone(i%2?720:540,.8+i*.45,.35,.025,'triangle');
 if(shot===3){tone(65,.2,.18,.08,'triangle');tone(100,.6,1.5,.035,'sawtooth');}
 if(shot===4){tone(220,0,.25,.025);tone(440,.1,.5,.018);}
 return()=>nodes.forEach(n=>{try{n.stop();n.disconnect();}catch{}});
}
