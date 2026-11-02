/** Presentation timeline. No simulation state or network dependencies. */
export const INTRO_SEEN = 'velmont-opening-v2';
export const INTRO_SHOTS = [
 {name:'After hours',seconds:5,caption:'Velmont closes at nine.'},
 {name:'The plan',seconds:4,caption:'Ninety seconds. In and out.'},
 {name:'The distraction',seconds:5,caption:'Steal the art. Throw trouble.'},
 {name:'The getaway',seconds:3,caption:"Don’t be the one left behind."},
 {name:'Your turn',seconds:3,caption:'Velmont: After Hours'},
] as const;
export const INTRO_DURATION = INTRO_SHOTS.reduce((n,s)=>n+s.seconds,0);
export function introFrame(seconds:number){let start=0;for(let i=0;i<INTRO_SHOTS.length;i++){const s=INTRO_SHOTS[i];if(seconds<start+s.seconds)return {shot:i,elapsed:Math.max(0,seconds-start)};start+=s.seconds;}return {shot:4,elapsed:3};}
export function introClip(shot:number,portrait:boolean,extension:'mp4'|'webm'){return `/cinematics/intro-v2/shot-${String(shot+1).padStart(2,'0')}-${portrait?'portrait':'landscape'}.${extension}`;}
export function allowIntroVideo(reduced:boolean,connection?:{saveData?:boolean;effectiveType?:string;downlink?:number}){return !reduced&&!connection?.saveData&&!['slow-2g','2g','3g'].includes(connection?.effectiveType??'')&&(connection?.downlink===undefined||connection.downlink>=1.5);}
