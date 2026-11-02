/** Shared presentation sound: identical to the game's original alarm chirp. */
export function alarmChirp(ctx:BaseAudioContext,destination:AudioNode,start=ctx.currentTime){
 const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type='sine';
 osc.frequency.setValueAtTime(1150,start);osc.frequency.exponentialRampToValueAtTime(100,start+.2);
 gain.gain.setValueAtTime(.035,start);gain.gain.exponentialRampToValueAtTime(.001,start+.25);
 osc.connect(gain);gain.connect(destination);osc.onended=()=>{osc.disconnect();gain.disconnect();};
 osc.start(start);osc.stop(start+.26);return osc;
}
