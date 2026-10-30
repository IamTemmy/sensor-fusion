"""Authored asymmetric Night Archive geometry; no mirrored or rotated template."""
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
root=Path(__file__).resolve().parents[2]
walls=[(0,0,960,24),(0,576,960,24),(0,24,24,552),(936,24,24,552),
# Main stack spine: long alternating shelf ends and two cross aisles.
(250,110,18,245),(360,110,18,160),(470,110,18,245),(580,110,18,160),
# Lower shelves have an east-west cross-passage above them.
(250,435,18,65),(360,355,18,145),(470,435,18,65),(580,355,18,145),
# West wing rooms: Fossil hall above the shared loading bay.
(24,395,115,14),(219,395,31,14),(24,220,115,14),(219,220,31,14),
# East wing contains Reading Room, Map Room, Rare Folio Vault.
(690,24,16,100),(690,204,16,372),
(706,124,84,14),(870,124,66,14),(786,250,64,14),
# Vault switchback: east entry, west return, east Crown.
(706,340,144,14),(786,430,150,14),(706,520,144,14),
# Wall recesses at blind ends / corridor corners.
(24,255,8,72),(24,255,48,8),(24,319,48,8),
(268,110,8,72),(268,110,48,8),(268,174,48,8),
(488,270,8,72),(488,270,48,8),(488,334,48,8),
(706,24,8,72),(706,24,48,8),(706,88,48,8),
(598,345,8,72),(598,345,48,8),(598,409,48,8)]
decor=[dict(x=110,y=280,w=75,h=30,kind='fossil')]
walls += [(d['x'],d['y'],d['w'],d['h']) for d in decor]
rooms=[('FOSSIL HALL',24,234,226,161),('LOADING BAY',24,409,226,167),('MAP ROOM',706,24,230,100),('READING ROOM',706,138,230,112),('RARE FOLIO VAULT',706,264,230,312),('WEST STACKS',268,110,92,245),('CATALOG AISLE',378,24,92,246),('SPECIMEN STACKS',488,110,92,245),('NORTH GALLERY',24,24,336,196),('SOUTH STACKS',268,355,422,221)]
slots=[(140,470),(310,540),(740,550),(200,350),(310,220),(420,70),(630,460),(840,190)]
routes=[[(110,365),(190,365),(210,180),(110,180),(110,65),(310,65),(310,310),(310,395),(210,365)],[(420,310),(530,310),(640,310),(640,65),(530,65),(420,65),(310,65),(310,310),(420,310)],[(890,80),(830,80),(830,160),(640,160),(640,65),(420,65),(310,65),(110,65),(110,180),(210,365),(310,395),(530,395),(640,395),(640,160),(830,160)],[(310,395),(420,310),(530,395),(640,395),(640,535),(640,395),(530,395),(420,310),(310,395)]]
d=dict(walls=[dict(zip(('x','y','w','h'),p)) for p in walls],decor=decor,rooms=[dict(name=n,x=x+w/2,y=y+25,bounds=dict(x=x,y=y,w=w,h=h)) for n,x,y,w,h in rooms],slots=[dict(x=x,y=y) for x,y in slots],plate=dict(x=890,y=80),docks=[dict(x=60,y=480),dict(x=180,y=540)],niches=[dict(x=x,y=y,back='left',kind='recess') for x,y in [(52,291),(296,146),(516,306),(734,60),(626,381)]],sensors=[dict(x=378,y=272,w=92,h=5),dict(x=598,y=270,w=92,h=5),dict(x=852,y=250,w=84,h=5),dict(x=530,y=24,w=5,h=86)],routes=[[dict(x=x,y=y) for x,y in r] for r in routes+[routes[0],routes[1]]],posts=[dict(x=445,y=90),dict(x=900,y=300)],doors=[dict(x=110,y=65),dict(x=820,y=160),dict(x=890,y=190)])
(root/'docs/night-archive/geometry.json').write_text(json.dumps(d,indent=2)+'\n')
text="// Generated from docs/night-archive/blueprint.py; independent asymmetric architecture.\nimport type {MuseumArena} from './arenas.ts';\nconst design = "+json.dumps(d,separators=(',',':'))+";\nexport function archiveArena(players:number):MuseumArena{return {...structuredClone(design),id:'night-archive',name:'The Night Archive',capacity:players<=2?2:4,theme:'fossil',dockFacings:['west','south'],brief:'Long stacks hide short encounters. The Rare Folio Vault opens at 1:00; hold the Map Room plate. Noise on you brings guards to you. Noise elsewhere sends them there.'};}\n"
(root/'lib/noise/archive-arena.ts').write_text(text)
im=Image.new('RGB',(1152,800),'#0c1d24');draw=ImageDraw.Draw(im);scale=1.1;ox=48;oy=85
font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',12);title=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',26)
def box(p,fill): x,y,w,h=p;draw.rectangle((ox+x*scale,oy+y*scale,ox+(x+w)*scale,oy+(y+h)*scale),fill=fill)
def dot(p,color,r=6):x,y=p['x']*scale+ox,p['y']*scale+oy;draw.ellipse((x-r,y-r,x+r,y+r),fill=color)
draw.text((48,22),'THE NIGHT ARCHIVE / ROUTE BLUEPRINT',font=title,fill='#e7d6a6');draw.text((48,57),'960 × 600 · shared loading bay · independent stack aisles · southeast vault',font=font,fill='#9dc9b9')
box((24,24,912,552),'#352b29')
for n,x,y,w,h in rooms:draw.text((ox+(x+8)*scale,oy+(y+8)*scale),n,font=font,fill='#b6b6a1')
for ri,r in enumerate(d['routes']):draw.line([(ox+p['x']*scale,oy+p['y']*scale) for p in r],fill=['#327970','#447c9c','#7c657d','#99854b'][ri%4],width=2)
for w in walls:box(w,'#c9b896')
for p in d['sensors']:box(tuple(p.values()),'#ff6f6f')
for p in d['niches']:dot(p,'#83d9c0',4)
for i,p in enumerate(d['slots']):dot(p,'#ffd773');draw.text((ox+p['x']*scale+8,oy+p['y']*scale-5),['200','200','CROWN 1200','500','600','600','500','500'][i],font=font,fill='#ffdfa0')
dot(d['plate'],'#81b9f2',9);draw.text((ox+800*scale,oy+80*scale),'PLATE',font=font,fill='#81b9f2')
for p,c in zip(d['docks'],['#70ddbd','#c9a4ff']):dot(p,c,18)
for p in d['posts']:dot(p,'#fc8b79',8)
draw.text((48,765),'Gold = art   Blue = plate   Red = laser / sentry   Mint = recess   Lines = patrol routes',font=font,fill='#dfd0ac')
im.save(root/'docs/night-archive/blueprint.png')
