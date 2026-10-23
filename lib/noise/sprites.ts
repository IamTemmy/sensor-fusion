import frames from '../../public/art/v25/frames.json' with {type:'json'};
type Frame={x:number;y:number;w:number;h:number};
const images=new Map<string,HTMLImageElement>();
let started=false;
/** Browser-only lazy preloader: failed assets retain primitive fallback, never block play. */
export function preloadSprites(){if(started||typeof Image==='undefined')return;started=true;for(const [key,src] of [['atlas','/art/v25/museum-atlas.webp'],['floor','/art/v25/floor.webp']]){const im=new Image();im.decoding='async';im.onload=()=>images.set(key,im);im.onerror=()=>{};im.src=src;}}
export function spriteReady(){return images.has('atlas');}
export function sprite(ctx:CanvasRenderingContext2D,key:string,x:number,y:number,w:number,h:number,flip=false,stretch=false,withoutBase=false){const im=images.get('atlas'),f=(frames as Record<string,Frame>)[key];if(!im||!f)return false;const fh=withoutBase?f.h*.84:f.h;const scale=Math.min(w/f.w,h/fh),dw=stretch?w:f.w*scale,dh=stretch?h:fh*scale;ctx.save();ctx.translate(x,y);if(flip)ctx.scale(-1,1);ctx.drawImage(im,f.x,f.y,f.w,fh,-dw/2,-dh/2,dw,dh);ctx.restore();return true;}
export function paintedFloor(ctx:CanvasRenderingContext2D){const im=images.get('floor');if(!im)return false;ctx.save();ctx.globalAlpha=.3;for(let y=24;y<576;y+=192)for(let x=24;x<936;x+=192)ctx.drawImage(im,x,y,192,192);ctx.restore();return true;}
export function actorPose(dx:number,dy:number,carrying=false){if(carrying)return {pose:'carry',flip:false};if(Math.abs(dx)>Math.abs(dy))return {pose:'side',flip:dx<0};return {pose:dy<0?'back':'front',flip:false};}
export function artSpriteKey(kind:string){return 'art-'+(kind==='gold'?'bust':kind==='idol'?'cat':kind);}
