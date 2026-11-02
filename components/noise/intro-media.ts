import {INTRO_ROOT,introAsset,introClip} from '../../lib/noise/intro-story';
export type ShotImages={color:HTMLImageElement;depth:HTMLImageElement|null};
export class IntroMedia {
  private controller=new AbortController();
  private images=new Map<string,Promise<ShotImages>>();
  private clips=new Map<string,Promise<string|null>>();
  private voices=new Map<number,Promise<ArrayBuffer|null>>();
  private videos:HTMLVideoElement[]=[];
  close(){this.controller.abort();for(const video of this.videos){video.pause();video.removeAttribute('src');video.load();}this.videos=[];this.images.clear();this.clips.clear();this.voices.clear();}
  private image(src:string):Promise<HTMLImageElement> {
    return new Promise((resolve,reject)=>{
      const image=new Image();image.decoding='async';
      const abort=()=>{image.src='';reject(new Error('Intro closed'));};
      this.controller.signal.addEventListener('abort',abort,{once:true});
      const done=()=>this.controller.signal.removeEventListener('abort',abort);
      image.onload=()=>{done();resolve(image);};image.onerror=()=>{done();reject(new Error('Missing intro image'));};image.src=src;
    });
  }
  loadShot(shot:number,portrait:boolean,depth=true) {
    const key=`${shot}/${portrait}/${depth}`;
    if(!this.images.has(key))this.images.set(key,Promise.all([this.image(introAsset(shot,portrait)),depth?this.image(introAsset(shot,portrait,true)).catch(()=>null):Promise.resolve(null)]).then(([color,map])=>({color,depth:map})));
    return this.images.get(key)!;
  }
  async clip(segment:number,portrait:boolean):Promise<string|null> {
    const key=`${segment}/${portrait}`;
    if(!this.clips.has(key))this.clips.set(key,(async()=>{
      const formats=(['mp4','webm'] as const).filter(ext=>document.createElement('video').canPlayType(`video/${ext}`));
      for(const orientation of portrait?[true,false]:[false])for(const ext of formats) {
        const url=introClip(segment,orientation,ext);
        try {
          const r=await fetch(url,{method:'HEAD',signal:AbortSignal.any([this.controller.signal,AbortSignal.timeout(1200)])});
          if(r.ok&&r.headers.get('content-type')?.startsWith('video/')) {
            if(this.controller.signal.aborted)return null;
            const video=document.createElement('video');video.preload='auto';video.src=url;this.videos.push(video);video.load();return url;
          }
        }catch{if(this.controller.signal.aborted)return null;}
      }
      return null;
    })());
    return this.clips.get(key)!;
  }
  voice(shot:number):Promise<ArrayBuffer|null> {
    if(!this.voices.has(shot))this.voices.set(shot,(async()=>{
      try {
        const url=`${INTRO_ROOT}/vo-${String(shot+1).padStart(2,'0')}.mp3`;
        const head=await fetch(url,{method:'HEAD',signal:this.controller.signal});
        if(!head.ok||!head.headers.get('content-type')?.startsWith('audio/'))return null;
        const r=await fetch(url,{signal:this.controller.signal});return r.ok?await r.arrayBuffer():null;
      }catch{return null;}
    })());
    return this.voices.get(shot)!;
  }
}
