import frames from '../../public/art/v25/frames.json' with {type:'json'};
type Frame={x:number;y:number;w:number;h:number};
const images=new Map<string,HTMLImageElement>();
let started=false;
const filteredSprites=new Map<string,HTMLCanvasElement>();
/** Browser-only lazy preloader: failed assets retain primitive fallback, never block play. */
export function preloadSprites(){if(started||typeof Image==='undefined')return;started=true;for(const [key,src] of [['atlas','/art/v25/museum-atlas.webp'],['floor','/art/v25/floor.webp']]){const im=new Image();im.decoding='async';im.onload=()=>images.set(key,im);im.onerror=()=>{};im.src=src;}}
export function spriteReady(){return images.has('atlas');}
export function sprite(ctx:CanvasRenderingContext2D,key:string,x:number,y:number,w:number,h:number,flip=false,stretch=false,withoutBase=false){const im=images.get('atlas'),f=(frames as Record<string,Frame>)[key];if(!im||!f)return false;const fh=withoutBase?f.h*.84:f.h;const scale=Math.min(w/f.w,h/fh),dw=stretch?w:f.w*scale,dh=stretch?h:fh*scale;ctx.save();ctx.translate(x,y);if(flip)ctx.scale(-1,1);// Bake constant actor rims/tints once, rather than running four drop-shadow
 // filters per actor per frame on a high-DPI canvas.
 const filter=ctx.filter;
 if(filter&&filter!=='none'&&typeof document!=='undefined'){
  const cacheKey=[key,dw,dh,withoutBase,filter].join(':');let cached=filteredSprites.get(cacheKey);const pad=12,ratio=2;
  if(!cached){cached=document.createElement('canvas');cached.width=Math.ceil((dw+pad*2)*ratio);cached.height=Math.ceil((dh+pad*2)*ratio);const bake=cached.getContext('2d');if(bake){bake.scale(ratio,ratio);bake.filter=filter;bake.drawImage(im,f.x,f.y,f.w,fh,pad,pad,dw,dh);if(filteredSprites.size>=128)filteredSprites.delete(filteredSprites.keys().next().value!);filteredSprites.set(cacheKey,cached);}else cached=undefined;}
  if(cached){ctx.filter='none';ctx.drawImage(cached,-dw/2-pad,-dh/2-pad,cached.width/ratio,cached.height/ratio);}else ctx.drawImage(im,f.x,f.y,f.w,fh,-dw/2,-dh/2,dw,dh);
 }else ctx.drawImage(im,f.x,f.y,f.w,fh,-dw/2,-dh/2,dw,dh);ctx.restore();return true;}
export function paintedFloor(ctx:CanvasRenderingContext2D){const im=images.get('floor');if(!im)return false;ctx.save();ctx.globalAlpha=.3;for(let y=24;y<576;y+=192)for(let x=24;x<936;x+=192)ctx.drawImage(im,x,y,192,192);ctx.restore();return true;}
export function actorPose(dx:number,dy:number,carrying=false){if(carrying)return {pose:'carry',flip:false};if(Math.abs(dx)>Math.abs(dy))return {pose:'side',flip:dx<0};return {pose:dy<0?'back':'front',flip:false};}
export function artSpriteKey(kind:string){return 'art-'+(kind==='gold'?'bust':kind==='idol'?'cat':kind);}
