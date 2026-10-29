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
