// Presentation identities only. Never change loot IDs, values or engine names.
export type ArtSpec={name:string;kind:string;glow:string};
export function artwork(id:string,value:number,layout=0):ArtSpec{
 const n=[...id].reduce((a,c)=>a*31+c.charCodeAt(0),0)>>>0;
 if(value!==1200&&layout===1)return value>=500?{name:['The Last Expedition','Amber Coast','The Forgotten Cartographer'][n%3],kind:['portrait','sea','sunset'][n%3],glow:'#a9d4b5'}:{name:'Archivist’s Music Box',kind:'box',glow:'#d9bd8c'};
 if(value!==1200&&layout===2)return value>=500?{name:['A Map of Midnight','Orbit in Blue','The Seventh Eclipse'][n%3],kind:['abstract','vase','sea'][n%3],glow:'#a8ccff'}:{name:'Celestial Idol',kind:'idol',glow:'#c2aaff'};
 if(value===1200)return {name:'The Crown Mask',kind:'crown',glow:'#ffd579'};
 if(value>=1000)return {name:n%2?'Golden Muse':'Marble Poet',kind:n%2?'gold':'bust',glow:'#f5cc7d'};
 if(value>=500){const names=['Last Sunset','The Visitor','Colour Study','Moonlit Sea','Blue Moon Vase'];return {name:names[n%5],kind:['sunset','portrait','abstract','sea','vase'][n%5],glow:'#a6beff'};}
 return {name:['Lucky Cat','Little Idol','Music Box'][n%3],kind:['cat','idol','box'][n%3],glow:'#8ef2d2'};
}
export function drawArtwork(ctx:CanvasRenderingContext2D,id:string,value:number,x:number,y:number,scale=1,layout=0){const {kind}=artwork(id,value,layout);ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);
 const rect=(x:number,y:number,w:number,h:number,c:string,r=0)=>{ctx.fillStyle=c;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();};const dot=(x:number,y:number,r:number,c:string)=>{ctx.fillStyle=c;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();};const path=(p:number[][],c:string)=>{ctx.fillStyle=c;ctx.beginPath();p.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();};
 if(kind==='crown'){rect(-14,-13,28,24,'#f4c351',7);path([[-14,-12],[-18,-25],[-6,-18],[0,-28],[6,-18],[18,-25],[14,-12]],'#ffe8a1');dot(-6,-3,3,'#372e46');dot(6,-3,3,'#372e46');rect(-4,5,8,2,'#8a4c25');dot(0,-18,3,'#e57777');}
 else if(kind==='bust'||kind==='gold'){const c=kind==='gold'?'#f5c45d':'#e8e6db';rect(-15,10,30,6,kind==='gold'?'#99662c':'#889ba9',2);path([[-14,8],[-9,-2],[-3,-5],[3,-5],[10,-2],[14,8]],c);rect(-4,-6,8,8,c);dot(0,-15,10,c);path([[-10,-15],[-8,-23],[0,-26],[9,-21],[10,-14],[3,-19]],kind==='gold'?'#d89b3b':'#aebec7');rect(2,-15,3,5,kind==='gold'?'#9d6328':'#a1aeb4');}
 else if(kind==='vase'){path([[-6,-24],[6,-24],[5,-16],[13,-1],[10,11],[-10,11],[-13,-1],[-5,-16]],'#6c9ee7');rect(-7,-25,14,4,'#d4deed',2);ctx.strokeStyle='#cbdfff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,-1,7,.5,5);ctx.stroke();rect(-7,11,14,3,'#d4deed');}
 else if(['sunset','portrait','abstract','sea'].includes(kind)){rect(-19,-24,38,40,'#8f5d2e',2);rect(-18,-25,36,38,'#edc575',2);rect(-14,-21,28,30,'#183553');if(kind==='sunset'){rect(-14,-21,28,30,'#a75966');dot(4,-9,8,'#f9d68c');path([[-14,4],[-4,-2],[5,3],[14,0],[14,9],[-14,9]],'#263c54');}if(kind==='portrait'){rect(-14,-21,28,30,'#345956');path([[-11,9],[-7,-2],[5,-2],[12,9]],'#131f3a');dot(0,-9,7,'#e4b78a');path([[-7,-9],[-7,-17],[3,-19],[8,-12],[2,-14]],'#25263a');}if(kind==='abstract'){path([[-14,-21],[6,-21],[-14,9]],'#f2b568');path([[14,-21],[14,9],[-4,9]],'#dc6d77');dot(0,-8,6,'#83cdbc');}if(kind==='sea'){dot(5,-14,6,'#f7e7be');rect(-14,-3,28,12,'#5489a7');ctx.strokeStyle='#b1dfdc';ctx.lineWidth=1;for(let a=0;a<3;a++){ctx.beginPath();ctx.moveTo(-11,a*3);ctx.lineTo(10,a*3-1);ctx.stroke();}}}
 else if(kind==='cat'){rect(-9,-6,18,20,'#e9bd74',7);dot(0,-13,10,'#f2d391');path([[-10,-15],[-10,-26],[-2,-20]],'#f2d391');path([[10,-15],[10,-26],[2,-20]],'#f2d391');dot(-4,-14,1.5,'#263149');dot(4,-14,1.5,'#263149');rect(-5,-5,10,3,'#d77768');dot(0,0,3,'#fae6ac');}
 else if(kind==='box'){rect(-15,-5,30,18,'#735153',3);rect(-17,-9,34,6,'#e9c27f',2);rect(-10,0,20,8,'#a87c55',2);dot(0,-15,5,'#f6d693');rect(-2,-11,4,4,'#e0b777');dot(0,4,2,'#ffe1a5');}
 else{rect(-11,10,22,5,'#8b6f48',2);rect(-7,-8,14,20,'#bcae7d',4);dot(0,-17,9,'#dec18a');rect(-12,-8,24,4,'#cfae70',2);dot(-3,-18,2,'#344043');dot(3,-18,2,'#344043');}
 ctx.restore();}
export type LabelBox={x:number;y:number;width:number;height:number};
export function stackLabel(x:number,y:number,width:number,height:number,used:LabelBox[]):LabelBox{let box={x,y,width,height};while(used.some(p=>Math.abs(p.x-box.x)<(p.width+width)/2+5&&Math.abs(p.y-box.y)<(p.height+height)/2+4))box.y-=height+5;used.push(box);return box;}

/** Keep pops local to their event; distant labels sharing x must never pull them across the arena. */
export function stackPopLabel(x:number,y:number,width:number,height:number,used:LabelBox[]){return stackLabel(x,y-65,width,height,used);}
