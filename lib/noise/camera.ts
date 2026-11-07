import type {Vec} from './engine.ts';
export type Camera={x:number;y:number;scale:number;w:number;h:number};
/** World-to-screen is shared by painting and pointer aiming. Insets protect carried art. */
export function museumCamera(width:number,height:number,me?:Vec,overview=true):Camera {
 const availableW=Math.max(1,width-20),availableH=Math.max(1,height-24);
 const fit=Math.min(availableW/960,availableH/600);
 const scale=overview?fit:Math.max(fit,Math.min(width/510,height/390));
 const w=width/scale,h=height/scale;
 const axis=(value:number,span:number,world:number)=>span>=world?-(span-world)/2:Math.max(-16/scale,Math.min(world-span+16/scale,value-span/2));
 return {x:axis(me?.x??480,w,960),y:axis((me?.y??300)-22,h,600),scale,w,h};
}

/** Locate the van indicator inside the canvas when closer view clips the dock. */
export function offscreenVan(camera:Camera,van:Vec): (Vec & {angle:number}) | undefined {
 const width=camera.w*camera.scale,height=camera.h*camera.scale;
 const x=(van.x-camera.x)*camera.scale,y=(van.y-camera.y)*camera.scale;
 const dockRadius=34*camera.scale;
 if(x>=dockRadius&&x<=width-dockRadius&&y>=dockRadius&&y<=height-dockRadius)return;
 const dx=x-width/2,dy=y-height/2;
 const edge=Math.min(1,dx===0?Infinity:Math.max(0,width/2-38)/Math.abs(dx),dy===0?Infinity:Math.max(0,height/2-16)/Math.abs(dy));
 return {x:width/2+dx*edge,y:height/2+dy*edge,angle:Math.atan2(dy,dx)};
}
