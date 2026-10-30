from PIL import Image,ImageDraw,ImageFont
from pathlib import Path
import json,math
p=Path(__file__).parent
for museum,shot in [('flagship-velmont','velmont-desktop.jpg'),('night-archive','archive-desktop.jpg')]:
 im=Image.open(p/shot).convert('RGBA');layer=Image.new('RGBA',im.size);c=ImageDraw.Draw(layer);d=json.loads((p/(museum+'.json')).read_text());ox=141;oy=133;s=760/960
 for key,col in [('approach',(255,209,91,235)),('escape',(78,247,205,235))]:
  pts=[(ox+a['x']*s,oy+a['y']*s) for a in d[key]['path']];c.line(pts,fill=col,width=3)
  for i in range(8,len(pts),20):
   a,b=pts[i-4],pts[i];t=math.atan2(b[1]-a[1],b[0]-a[0]);c.polygon([b,(b[0]-9*math.cos(t-.5),b[1]-9*math.sin(t-.5)),(b[0]-9*math.cos(t+.5),b[1]-9*math.sin(t+.5))],fill=col)
 c.rounded_rectangle((140,745,1010,824),radius=10,fill='#0b1b28');font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',18)
 c.text((160,758),'GOLD → Crown approach     MINT → Staff exit after pickup',font=font,fill='#ffe0a0');c.text((160,791),'Annotated frozen layout screenshot — paths measured from collision geometry.',font=font,fill='#b8d3d7')
 Image.alpha_composite(im,layer).convert('RGB').save(p/(museum+'-annotated.jpg'),quality=92)
