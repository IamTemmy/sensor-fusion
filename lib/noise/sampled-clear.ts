type Point={x:number;y:number};type Wall=Point&{w:number;h:number};
/** Same sampled collision test, but reject walls outside the segment bounds once. */
export function sampledClear(a:Point,b:Point,r:number,n:number,first:number,last:number,walls:Wall[]){
 if(first>last)return true;
 const dx=b.x-a.x,dy=b.y-a.y,x0=a.x+dx*first/n,x1=a.x+dx*last/n,y0=a.y+dy*first/n,y1=a.y+dy*last/n;
 const minX=Math.min(x0,x1),maxX=Math.max(x0,x1),minY=Math.min(y0,y1),maxY=Math.max(y0,y1);
 if(minX<24+r||maxX>936-r||minY<24+r||maxY>576-r)return false;
 for(const w of walls){const left=w.x-r,right=w.x+w.w+r,top=w.y-r,bottom=w.y+w.h+r;if(maxX<=left||minX>=right||maxY<=top||minY>=bottom)continue;
  for(let i=first;i<=last;i++){const x=a.x+dx*i/n,y=a.y+dy*i/n;if(x>left&&x<right&&y>top&&y<bottom)return false;}
 }
 return true;
}
