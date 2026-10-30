from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import json,math
base=Path(__file__).parent
fontpath='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
def font(n):return ImageFont.truetype(fontpath,n)
for name in ['flagship-velmont','night-archive']:
 d=json.loads((base/(name+'.json')).read_text());s=1.5;ox=30;oy=110
 im=Image.new('RGB',(1500,1130),'#091725');p=ImageDraw.Draw(im)
 p.text((30,24),d['name'].upper()+' — CROWN ACCESS',font=font(28),fill='#f7d997')
 p.text((30,66),'Gold: inbound route    Mint: unlocked escape    Pink: lasers    H: hiding recess',font=font(19),fill='#c1d2d8')
 def xy(a):return (ox+a['x']*s,oy+a['y']*s)
 def box(r,c,outline=None):p.rectangle((ox+r['x']*s,oy+r['y']*s,ox+(r['x']+r['w'])*s,oy+(r['y']+r['h'])*s),fill=c,outline=outline,width=2)
 box(dict(x=0,y=0,w=960,h=600),'#1b3036' if name=='flagship-velmont' else '#302e29')
 for r in d['walls']:box(r,'#74818d')
 for r in d['sensors']:box(r,'#ff637c')
 for key,color in [('approach','#f7c963'),('escape','#5de1c0')]:
  pts=[xy(a) for a in d[key]['path']];p.line(pts,fill=color,width=5)
  for i in range(8,len(pts),18):
   a,b=pts[i-4],pts[i];ang=math.atan2(b[1]-a[1],b[0]-a[0]);p.polygon([b,(b[0]-14*math.cos(ang-.45),b[1]-14*math.sin(ang-.45)),(b[0]-14*math.cos(ang+.45),b[1]-14*math.sin(ang+.45))],fill=color)
 for a in d['loot']:
  x,y=xy(a);p.ellipse((x-11,y-11,x+11,y+11),fill='#e7c47a');p.text((x+15,y-14),'CROWN' if a['value']==1200 else '$'+str(a['value']),font=font(16),fill='#fff2c7')
 c=d['loot'][2];x,y=xy(c);p.rectangle((x-45*s,y-45*s,x+45*s,y+45*s),outline='#f9dc83',width=2)
 for a in d['niches']:
  x,y=xy(a);p.ellipse((x-13,y-13,x+13,y+13),fill='#185f5d');p.text((x-7,y-11),'H',font=font(17),fill='white')
 for i,a in enumerate(d['docks']):
  x,y=xy(a);p.rectangle((x-35,y-25,x+35,y+25),fill=['#28786d','#735496'][i]);p.text((x-29,y-10),['MINT','VIOLET'][i],font=font(15),fill='white')
 x,y=xy(d['plate']);p.rectangle((x-13,y-13,x+13,y+13),fill='#92c6f2');p.text((x-36,y+20),'PLATE',font=font(16),fill='#c5e4ff')
 box(d['crownExit'],None,'#5de1c0');x,y=xy(d['crownExit']);p.text((max(40,x-180),y-30),'STAFF EXIT →',font=font(16),fill='#5de1c0')
 p.text((30,1030),'Crown unlocks at 1:00 • Two vault entrances • 90 × 90 pedestal clearance • Nearby hide',font=font(20),fill='#f7d997')
 p.text((30,1070),f"Return distance: {d['closed']['length']:.0f}u → {d['escape']['length']:.0f}u. Opens on pickup; remains open to everyone.",font=font(18),fill='#b9d1d8')
 im.save(base/(name+'-routes.png'))
