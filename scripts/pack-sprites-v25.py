"""Crop user-authorized generated sheets; preserve alpha and pack runtime WebP atlas."""
from PIL import Image,ImageOps
from pathlib import Path
import json
root=Path(__file__).resolve().parents[1];src=root.parent/'generated_images';out=root/'public/art/v25';out.mkdir(parents=True,exist_ok=True)
items=[]
def add(im,box,key):
 crop=im.crop(box).convert('RGBA');b=crop.getchannel('A').point(lambda a:255 if a>12 else 0).getbbox();crop=crop.crop(b) if b else crop
 crop.thumbnail((240,240),Image.Resampling.LANCZOS);items.append((key,crop))
im=Image.open(src/'exec-7be630ae-c5b7-4e75-b675-34c858465414.png');w,h=im.size
for i,k in enumerate(['cat','box','sunset','vase','bust','crown','portrait','abstract','sea']):add(im,(i%3*w//3,i//3*h//3,(i%3+1)*w//3,(i//3+1)*h//3),'art-'+k)
im=Image.open(src/'exec-46d0d312-a75b-417e-a6dd-5cabe30631ac.png');w,h=im.size
for r,crew in enumerate(['mint','violet','guard']):
 for c,pose in enumerate(['front','back','side','carry' if crew!='guard' else 'stride']):add(im,(c*w//4,r*h//3,(c+1)*w//4,(r+1)*h//3),crew+'-'+pose)
im=Image.open(src/'exec-ffb4eb87-75a1-4f0e-aeb8-d890d72e9776.png')
boxes={'van-mint':(35,0,350,416),'van-violet':(395,0,695,416),'plant':(708,0,1075,397),'bench':(1076,163,1447,360),'wall-h':(0,470,440,705),'wall-v':(515,411,657,706),'sconce':(775,397,1035,712),'banner':(1115,350,1405,706),'plate-off':(25,735,350,1055),'plate-on':(385,735,710,1055),'case-locked':(735,709,1088,1087),'case-open':(1090,700,1447,1087)}
for k,b in boxes.items():add(im,b,k)
atlas=Image.new('RGBA',(1536,1536));frames={}
for i,(key,im) in enumerate(items):
 x=(i%6)*256+(256-im.width)//2;y=(i//6)*256+(256-im.height)//2;atlas.alpha_composite(im,(x,y));frames[key]={'x':x,'y':y,'w':im.width,'h':im.height}
atlas.save(out/'museum-atlas.webp',quality=86,method=6)
Image.open(src/'exec-78fabbea-430e-4a82-bd67-0b14a29e8664.png').convert('RGB').resize((512,512),Image.Resampling.LANCZOS).save(out/'floor.webp',quality=82,method=6)
(out/'frames.json').write_text(json.dumps(frames,indent=2)+'\n')
print('sprites',len(frames),'v25 bytes',sum(p.stat().st_size for p in out.iterdir()),'all runtime art bytes',sum(p.stat().st_size for p in (root/'public/art').rglob('*') if p.is_file()))
