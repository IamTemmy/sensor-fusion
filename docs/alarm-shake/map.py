import json
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
base=Path(__file__).parent
m=json.loads((base.parent/'crown-access/night-archive.json').read_text())
im=Image.new('RGB',(1440,1040),'#0b1822');d=ImageDraw.Draw(im);s=1.4;ox=48;oy=120
font=lambda n:ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',n)
xy=lambda x,y:(ox+x*s,oy+y*s)
def rect(r,fill):d.rectangle((*xy(r['x'],r['y']),*xy(r['x']+r['w'],r['y']+r['h'])),fill=fill)
d.text((48,30),'NIGHT ARCHIVE · TWO CROSS-AISLE ESCAPES',font=font(29),fill='#f0d18b')
d.text((48,78),'Exact collision plan · mint arrows mark 80-unit shelf openings',font=font(20),fill='#bfded9')
rect(dict(x=0,y=0,w=960,h=600),'#39342c')
for r in m['walls']:rect(r,'#8d887c')
for r in m['sensors']:rect(r,'#eb6681')
for room in m['rooms']:
 d.text(xy(room['x']-40,room['y']),room['name'].replace(' ','\n'),font=font(12),fill='#d5c4aa')
for l in m['loot']:
 x,y=xy(l['x'],l['y']);d.ellipse((x-8,y-8,x+8,y+8),fill='#ffd478');d.text((x+12,y-9),'CROWN' if l['value']==1200 else '$'+str(l['value']),font=font(15),fill='#fff0bd')
for i,(x,y) in enumerate([(250,250),(470,190)],1):
 a,b=xy(x-10,y-3),xy(x+28,y+83);d.rounded_rectangle((*a,*b),radius=10,outline='#5cf4c5',width=4)
 left,right=xy(x-42,y+40),xy(x+60,y+40);d.line((left,right),fill='#5cf4c5',width=5)
 for p,sign in [(left,1),(right,-1)]:d.polygon((p,(p[0]+sign*12,p[1]-8),(p[0]+sign*12,p[1]+8)),fill='#5cf4c5')
 d.text(xy(x-50,y-23),f'{i} · 80u',font=font(19),fill='#5cf4c5')
d.text((48,990),'Walls, art, plate, doors and lasers retain their existing placements except these two shelf cuts.',font=font(18),fill='#bfded9')
im.save(base/'archive-cross-aisles.png')
