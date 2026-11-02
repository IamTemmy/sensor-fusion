/** Presentation-only timeline. It never reads or mutates the simulation. */
export const INTRO_SEEN = 'velmont-opening-v3-six';
export const INTRO_ROOT = '/cinematics/intro-v3';
export const INTRO_SHOTS = [
  {name:'The plan is simple', seconds:5, caption:'The plan is simple. Get in. Get the Crown. Get out.', camera:'push'},
  {name:'Every crew', seconds:4, caption:"Every crew in town wants what's behind that glass.", camera:'dolly'},
  {name:'Ninety seconds', seconds:4, caption:'Ninety seconds. One very nervous alarm system.', camera:'tilt'},
  {name:'Together', seconds:4, caption:'Rule one: the crew moves together.', camera:'track'},
  {name:'The alarm', seconds:6, caption:"Rule two: somebody's setting off the alarms. Make sure it's not on you.", camera:'dolly'},
  {name:'Nobody left behind', seconds:5, caption:"Rule three… no matter what happens… don't get left behind.", camera:'push-pull'},
] as const;
/** Revision-qualified clip names prevent old clips/recordings silently playing the previous script. */
export const INTRO_SEGMENTS = INTRO_SHOTS.map((s,shot)=>({shot,offset:0,seconds:s.seconds,clip:`six-shot-${String(shot+1).padStart(2,'0')}`}));
export const INTRO_DURATION = INTRO_SHOTS.reduce((sum,s)=>sum+s.seconds,0);
export const END_BLACK_SECONDS = .35;
export const MENU_REVEAL_SECONDS = .65;
export const INTRO_ENTRY_SECONDS = .45;
export function introFrame(seconds:number) {
 let start=0;
 for(let shot=0;shot<INTRO_SHOTS.length;shot++) {
  if(seconds<start+INTRO_SHOTS[shot].seconds)return {shot,elapsed:Math.max(0,seconds-start)};
  start+=INTRO_SHOTS[shot].seconds;
 }
 return {shot:INTRO_SHOTS.length-1,elapsed:INTRO_SHOTS[INTRO_SHOTS.length-1].seconds};
}
export function introAsset(shot:number,portrait:boolean,depth=false) {
 return `${INTRO_ROOT}/shot-${String(shot+1).padStart(2,'0')}-${portrait?'portrait':'landscape'}${depth?'-depth':''}.webp`;
}
export function introClip(segment:number,portrait:boolean,extension:'mp4'|'webm') {
 return `${INTRO_ROOT}/${INTRO_SEGMENTS[segment].clip}-${portrait?'portrait':'landscape'}.${extension}`;
}
export function allowIntroVideo(reduced:boolean,connection?:{saveData?:boolean;effectiveType?:string;downlink?:number}) {
 return !reduced&&!connection?.saveData&&!['slow-2g','2g','3g'].includes(connection?.effectiveType??'')&&(connection?.downlink===undefined||connection.downlink>=1.5);
}
export function introCaption(segment:number) {return INTRO_SHOTS[INTRO_SEGMENTS[segment].shot].caption;}
export function endingOpacity(secondsSinceLastShotEnded:number) {
 if(secondsSinceLastShotEnded<END_BLACK_SECONDS)return 1;
 return Math.max(0,1-(secondsSinceLastShotEnded-END_BLACK_SECONDS)/MENU_REVEAL_SECONDS);
}
export function shouldUseClipAudio(clicked:boolean,sfxMuted:boolean) {return clicked&&!sfxMuted;}
export function alarmPulse(seconds:number) {return .5+.5*Math.sin(2*Math.PI*2*seconds);}
export function cameraAt(shot:number,progress:number):[number,number,number] {
 const p=Math.max(0,Math.min(1,progress)),e=p*p*(3-2*p);
 switch(shot) {
  case 0:return [(e-.5)*.003,0,.025*e];
  case 1:return [(e-.5)*.018,.002,.008];
  case 2:return [.002,(e-.5)*.013,.018*e];
  case 3:return [(e-.5)*.019,0,.006];
  case 4:return [(e-.5)*.014,-.001,.012*e];
  default:return [(e-.5)*.004,0,.028*Math.sin(Math.PI*p)];
 }
}
