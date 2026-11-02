/** Presentation-only timeline. It never reads or mutates the simulation. */
export const INTRO_SEEN = 'velmont-opening-v3';
export const INTRO_ROOT = '/cinematics/intro-v3';
export const INTRO_SHOTS = [
  {name:'The doors', seconds:5, caption:'Every night, Velmont locks its doors on things that were never theirs to keep.', camera:'push'},
  {name:'The collection', seconds:5, caption:'Paintings stolen once already. Crowns taken from people who never got them back.', camera:'dolly'},
  {name:'The plan', seconds:5, caption:'So we take them back. Ninety seconds. In and out.', camera:'tilt'},
  {name:'The noise', seconds:6, caption:'The alarms will scream. Let them.', camera:'dolly'},
  {name:'The promise', seconds:5, caption:"Just don't get left behind.", camera:'focus'},
] as const;
/** Legacy clip names 03a/b are retained for the two halves of the heist (now story shot 4). */
export const INTRO_SEGMENTS = [
  {shot:0, offset:0, seconds:5, clip:'shot-01'},
  {shot:1, offset:0, seconds:5, clip:'shot-02'},
  {shot:2, offset:0, seconds:5, clip:'shot-03'},
  {shot:3, offset:0, seconds:3, clip:'shot-03a'},
  {shot:3, offset:3, seconds:3, clip:'shot-03b'},
  {shot:4, offset:0, seconds:5, clip:'shot-05'},
] as const;
export const INTRO_DURATION = 26;
export const END_BLACK_SECONDS = .35;
export const MENU_REVEAL_SECONDS = .65;
export function introFrame(seconds:number) {
  let start=0;
  for(let shot=0;shot<INTRO_SHOTS.length;shot++) {
    if(seconds<start+INTRO_SHOTS[shot].seconds)return {shot,elapsed:Math.max(0,seconds-start)};
    start+=INTRO_SHOTS[shot].seconds;
  }
  return {shot:4,elapsed:5};
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
/** Separate from the last image: no reveal can begin while a shot is still playing. */
export function endingOpacity(secondsSinceLastShotEnded:number) {
  if(secondsSinceLastShotEnded<END_BLACK_SECONDS)return 1;
  return Math.max(0,1-(secondsSinceLastShotEnded-END_BLACK_SECONDS)/MENU_REVEAL_SECONDS);
}
export function shouldUseClipAudio(clicked:boolean,sfxMuted:boolean) {return clicked&&!sfxMuted;}
/** Shared oscillator/render timing for the heist's red alarm pulse. */
export function alarmPulse(seconds:number) {return .5+.5*Math.sin(2*Math.PI*2*seconds);}
export function cameraAt(shot:number,progress:number):[number,number,number] {
  const p=Math.max(0,Math.min(1,progress)),e=p*p*(3-2*p);
  switch(shot) {
    case 0:return [(e-.5)*.003,0,.025*e];
    case 1:return [(e-.5)*.018,.002,.008];
    case 2:return [.002,(e-.5)*.013,.018*e];
    case 3:return [(e-.5)*.014,-.001,.012*e];
    default:return [0,(e-.5)*.003,.027*e];
  }
}
