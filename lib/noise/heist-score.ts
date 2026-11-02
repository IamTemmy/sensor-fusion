/** Original suspense arrangement. Inputs only select musical density, never game rules. */
export type ScoreVoice='pulse'|'drone'|'tick'|'tension';
export type ScoreNote={voice:ScoreVoice;midi:number;seconds:number;gain:number};
export const HEIST_EIGHTH_SECONDS=.3; // 100 BPM, stable tempo even when alert rises.
export function heistScoreStep(step:number,pressure:number,lastCall:boolean):ScoreNote[]{
 const i=((step%32)+32)%32,hot=pressure>=60||lastCall,notes:ScoreNote[]=[];
 // Low D pedal, an uneven heartbeat; deliberately no bright tune or resolving arpeggio.
 if(i%8===0||i%8===3||(hot&&i%8===5))notes.push({voice:'pulse',midi:38,seconds:.24,gain:.034});
 if(i%16===0)notes.push({voice:'drone',midi:50,seconds:2.15,gain:.009});
 if(i%16===12)notes.push({voice:'tension',midi:hot?51:45,seconds:.8,gain:hot?.009:.006});
 if((i%4===2&&pressure>=30)||(lastCall&&i%2===1))notes.push({voice:'tick',midi:0,seconds:.055,gain:.009});
 return notes;
}
