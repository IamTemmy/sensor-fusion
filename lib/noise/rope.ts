/** Layered rope sprite drawn at actor scale; no gameplay state or collision. */
export function drawRope(ctx:CanvasRenderingContext2D,x:number,y:number,loosen:number,wiggle:number,fall=0){
 ctx.save();ctx.translate(x+wiggle,y+fall*30);ctx.rotate(wiggle*.025+fall*.25);ctx.globalAlpha=1-fall;
 const spread=loosen*10+fall*14;
 const cord=(path:()=>void)=>{ctx.beginPath();path();ctx.strokeStyle='#654326';ctx.lineWidth=5;ctx.stroke();ctx.strokeStyle='#cda36a';ctx.lineWidth=3.5;ctx.stroke();ctx.strokeStyle='#f0d39a';ctx.lineWidth=1;ctx.setLineDash([2,3]);ctx.stroke();ctx.setLineDash([]);};
 for(let i=0;i<3;i++)cord(()=>ctx.ellipse(0,-7+i*6,18+spread,5+loosen*3,loosen*.15,0,Math.PI*2));
 cord(()=>{ctx.moveTo(14+spread,-4);ctx.bezierCurveTo(24+spread,-15,29+spread,5,15+spread,4);ctx.bezierCurveTo(8+spread,12,29+spread,15,24+spread,0);ctx.moveTo(19+spread,4);ctx.quadraticCurveTo(28+spread,17,17+spread,24);});
 ctx.restore();
}
