# HISTORICAL v82 generator. Current Crown-access geometry lives in lib/noise/*-arena.ts.
# Render current routes with docs/crown-access/export.ts and render.py; do not regenerate over it.
"""Generate the flagship arena and its review blueprint from one geometry source."""
import json, math, heapq
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

OUT=Path(__file__).parent
walls=[]; doors=[]
def rect(x,y,w,h): walls.append(dict(x=x,y=y,w=w,h=h))
def wall(axis,at,start,end,gaps=()):
    cursor=start
    for a,b in sorted(gaps):
        if a>cursor:
            rect(cursor,at,a-cursor,12) if axis=='h' else rect(at,cursor,12,a-cursor)
        doors.append(dict(axis=axis,at=at,start=a,end=b,width=b-a)); cursor=b
    if cursor<end:
        rect(cursor,at,end-cursor,12) if axis=='h' else rect(at,cursor,12,end-cursor)

rect(0,0,960,24);rect(0,576,960,24);rect(0,24,24,552);rect(936,24,24,552)
wall('h',108,24,684,[(80,160),(530,610)])
wall('h',250,24,684,[(70,150),(320,400),(540,620)])
wall('h',420,24,684,[(64,144),(340,420),(560,640)])
wall('v',278,120,250);wall('v',448,120,250)
wall('v',212,262,420,[(300,380)])
wall('v',484,262,420,[(300,380)])
wall('v',304,432,576,[(450,530)])
wall('v',516,432,576,[(450,530)])
wall('v',684,24,576,[(400,480),(500,576)])
wall('h',190,696,936,[(844,924)])
rect(780,120,156,12) # Vault return forces the final left-right switchback.
# Secure wing: alternating wall returns force decisions at blind corners.
rect(696,290,152,12);rect(784,390,152,12);rect(696,490,152,12)
# Archive shelving and gallery L-return, attached to existing room fabric.
rect(184,120,12,32);rect(140,224,138,12)
rect(280,262,12,35);rect(280,285,65,12)
# Keep a clear shared approach and two open approaches to the L-shaped docks.

hides=[]
def niche(x,y,side):
    # A 48x72 recess: mouth supports the existing 20u navigation grid.
    if side=='right': rect(x,y,8,72);rect(x,y,48,8);rect(x,y+64,48,8);p=(x+28,y+36)
    else: rect(x+40,y,8,72);rect(x,y,48,8);rect(x,y+64,48,8);p=(x+20,y+36)
    hides.append(dict(x=p[0],y=p[1]))
niche(24,310,'right');niche(230,126,'left');niche(460,126,'right')
niche(496,346,'right');niche(528,500,'right');niche(696,212,'right')

rooms=[('NORTH WALK',24,24,660,84),('ARCHIVE STACKS',24,120,254,130),
('PORTRAIT GALLERY',290,120,158,130),('OBSERVATORY',460,120,224,130),
('FOSSIL HALL',24,262,188,158),('SCULPTURE COURT',224,262,260,158),
('SECURITY OFFICE',496,262,188,158),('LOADING BAY',24,432,280,144),
('CLOCK ROOM',316,432,200,144),('SERVICE LOOP',528,432,156,144),
('CROWN VAULT',696,24,240,166),('HALL OF MIRRORS',696,202,240,374)]
arts=[dict(name=n,x=x,y=y,value=v) for n,x,y,v in [
('Bay relic',140,470,200),('Clockwork',450,550,200),('Fossil folio',170,350,500),
('Sculpture',420,320,500),('Star atlas',640,160,500),('Archive masterwork',212,190,600),
('Portrait masterwork',370,165,600),('Crown',810,85,1200)]]
plate=dict(x=640,y=350); docks=[dict(x=60,y=480),dict(x=180,y=540)]
lasers=[dict(x=690,y=400,w=6,h=80),dict(x=320,y=250,w=80,h=5),
dict(x=696,y=390,w=88,h=5),dict(x=850,y=290,w=86,h=5),dict(x=360,y=24,w=5,h=84)]
guards=[[(110,285),(170,285),(170,335),(260,335),(260,390),(370,390),(370,475),(370,390),(370,335),(170,335),(110,285)],
[(120,65),(570,65),(570,165),(640,220),(580,220),(580,335),(640,335),(580,335),(580,220),(570,165),(570,65),(120,65)],
[(740,450),(740,350),(890,350),(890,245),(890,350),(740,350),(740,450)]]
guards.append([(120,65),(120,160),(150,180),(210,180),(150,180),(110,180),(110,285),(110,180),(120,160),(120,65)])
sentries=[dict(x=410,y=215),dict(x=910,y=230)]
decor=[dict(x=24,y=278,w=44,h=22,kind='fossil'),dict(x=425,y=278,w=59,h=20,kind='sculpture'),dict(x=525,y=195,w=34,h=30,kind='orrery')]
for d in decor: rect(d['x'],d['y'],d['w'],d['h'])
data=dict(decor=decor,width=960,height=600,walls=walls,doors=doors,rooms=rooms,arts=arts,plate=plate,docks=docks,hides=hides,lasers=lasers,guardRoutes=guards,sentries=sentries)
(OUT/'blueprint.json').write_text(json.dumps(data,indent=2)+'\n')
module='''// Authored flagship geometry; source: docs/flagship-velmont/blueprint.py.
import type {MuseumArena} from './arenas.ts';
const design = '''+json.dumps(data,separators=(',',':'))+''';
export function flagshipArena(players:number):MuseumArena {
 const d=structuredClone(design), point=(p:number[])=>({x:p[0],y:p[1]});
 const order=[0,1,7,2,5,6,3,4];
 const routes=d.guardRoutes.map(r=>r.map(point));
 return {id:'flagship-velmont',name:'The Velmont',capacity:players<=2?2:4,theme:'sculpture',
 brief:'A building of blind corners. Crown opens at 1:00. Hold Security’s plate; a teammate can take its alarm. Noise on you brings guards to you. Noise elsewhere sends them there.',
 walls:d.walls,slots:order.map(i=>({x:d.arts[i].x,y:d.arts[i].y})),plate:d.plate,
 routes:[routes[0],routes[3],routes[1],routes[2],routes[0],routes[1]],
 niches:d.hides.map(p=>({...p,back:'left',kind:'recess'})),
 rooms:d.rooms.map(r=>({name:String(r[0]),x:Number(r[1])+Number(r[3])/2,y:Number(r[2])+25,bounds:{x:Number(r[1]),y:Number(r[2]),w:Number(r[3]),h:Number(r[4])}})),
 sensors:d.lasers,decor:d.decor,doors:[{x:120,y:65},{x:570,y:65},{x:890,y:245}],
 docks:d.docks,dockFacings:['west','south'],posts:d.sentries};
}
'''
(OUT.parent.parent/'lib/noise/flagship-arena.ts').write_text(module)

# Conservative square-inflated clearance exactly matches engine clear(p,13).
def clear(p,extra=()):
    x,y=p
    return 37<=x<=923 and 37<=y<=563 and not any(w['x']-13<x<w['x']+w['w']+13 and w['y']-13<y<w['y']+w['h']+13 for w in walls+list(extra))
def closest(p,extra=()):
    cells=[(x,y) for x in range(round(p[0]/4)*4-24,round(p[0]/4)*4+25,4) for y in range(round(p[1]/4)*4-24,round(p[1]/4)*4+25,4) if clear((x,y),extra)]
    return min(cells,key=lambda q:math.dist(p,q))
def path(a,b,extra=()):
    start,end=closest(a,extra),closest(b,extra); queue=[(0,start)]; dist={start:0}; prev={}
    while queue:
        d,p=heapq.heappop(queue)
        if d!=dist[p]:continue
        if p==end:
            route=[p]
            while route[-1]!=start:route.append(prev[route[-1]])
            return d,list(reversed(route))
        for dx,dy in [(4,0),(-4,0),(0,4),(0,-4),(4,4),(4,-4),(-4,4),(-4,-4)]:
            q=(p[0]+dx,p[1]+dy)
            if not clear(q,extra) or not clear((p[0]+dx,p[1]),extra) or not clear((p[0],p[1]+dy),extra):continue
            nd=d+math.hypot(dx,dy)
            if nd<dist.get(q,float('inf')):dist[q]=nd;prev[q]=p;heapq.heappush(queue,(nd,q))
    return None,[]
xy=lambda p:(p['x'],p['y'])
start=xy(docks[0]);crown=xy(arts[-1]);opponentDock=dict(x=docks[1]['x']-35,y=docks[1]['y']-35,w=70,h=70)
fast,fast_route=path(start,crown,[opponentDock])
safe,safe_route=path(start,crown,[opponentDock,dict(x=684,y=400,w=12,h=80)])
plate_distance,plate_route=path(xy(plate),crown)
metrics=dict(method='4u eight-neighbour grid, square wall inflation 13u; approximate path lengths, not gameplay simulations',
    fastCrownDistance=round(fast,1),longCrownDistance=round(safe,1),plateToCrownDistance=round(plate_distance,1),
    unobstructedFastRoundTripSeconds=round(fast/150+fast/((110-1000*30/1300)*.8),1),
    targets=[dict(name=p.get('name',f'target{i}'),clear=clear(xy(p)),distance=path(start,xy(p))[0]) for i,p in enumerate(arts+[plate]+docks+hides)])
# Interior-only wall overlap under left-right reflection (outer frame excluded).
occupied={(x,y) for x in range(24,936,2) for y in range(24,576,2) if any(w['x']<=x<w['x']+w['w'] and w['y']<=y<w['y']+w['h'] for w in walls[4:])}
metrics['mirroredInteriorOverlapPercent']=round(100*sum((958-x,y) in occupied for x,y in occupied)/len(occupied),1)
(OUT/'measurements.json').write_text(json.dumps(metrics,indent=2)+'\n')

# Exact geometry rendered at 2x; presentation margins are outside the 960x600 map.
S=2;W=1280;H=850;im=Image.new('RGB',(W*S,H*S),'#091521');d=ImageDraw.Draw(im)
font='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf';bold='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
def text(x,y,t,size=12,color='#d9e5ee',heavy=False):d.text((x*S,y*S),t,font=ImageFont.truetype(bold if heavy else font,size*S),fill=color)
def box(x,y,w,h,c,outline=None):d.rectangle((x*S,y*S,(x+w)*S,(y+h)*S),fill=c,outline=outline,width=S)
def line(points,color,width=2):d.line([(int((x+28)*S),int((y+128)*S)) for x,y in points],fill=color,width=width*S,joint='curve')
def dot(x,y,r,c):d.ellipse(((x+28-r)*S,(y+128-r)*S,(x+28+r)*S,(y+128+r)*S),fill=c)
text(28,22,'THE VELMONT',32,'#f4d79b',True)
text(29,67,'FLAGSHIP / VISIBILITY + DECOR REVISION 04',13,'#71d7c8',True)
text(29,94,'960 × 600 world units   •   2–4 thieves   •   solid exhibits + shared loading bay',13)
colors=['#1b303b','#25312f','#372c33','#26313f','#28343b','#303339','#28372f','#20393b','#31333b','#21333a','#40342b','#27283c']
for (name,x,y,w,h),c in zip(rooms,colors):box(x+28,y+128,w,h,c)
for x in range(24,937,20):line([(x,24),(x,576)],'#30404a',1)
for y in range(24,577,20):line([(24,y),(936,y)],'#30404a',1)
for r in guards:
    for a,b in zip(r,r[1:]):
        n=max(1,int(math.dist(a,b)/10))
        for i in range(0,n,2):line([(a[0]+(b[0]-a[0])*i/n,a[1]+(b[1]-a[1])*i/n),(a[0]+(b[0]-a[0])*min(i+1,n)/n,a[1]+(b[1]-a[1])*min(i+1,n)/n)],'#a4aeb7',1)
line(safe_route,'#65c5be',3);line(fast_route,'#e4b86b',3)
for w in walls:box(w['x']+28,w['y']+128,w['w'],w['h'],'#a2b0b9','#d4e0e5')
for l in lasers:box(l['x']+28,l['y']+128,l['w'],l['h'],'#ff617b')
for p in hides:dot(p['x'],p['y'],10,'#1e746f');text(p['x']+23,p['y']+120,'H',11,'#d7fff4',True)
labels=[(40,39,'NORTH WALK'),(38,132,'ARCHIVE'),(308,130,'PORTRAITS'),(524,130,'OBSERVATORY'),(58,274,'FOSSIL HALL'),(306,365,'SCULPTURE COURT'),(524,274,'SECURITY'),(44,442,'LOADING BAY'),(352,443,'CLOCK ROOM'),(540,443,'SERVICE LOOP'),(734,39,'CROWN VAULT')]
for x,y,t in labels:text(x+28,y+128,t,11,'#c7d4dd',True)
for x,y,t in [(716,270,'HALL OF MIRRORS'),(715,318,'BLIND RETURN'),(802,420,'LASER SHORTCUT'),(715,547,'LONG APPROACH')]:text(x+28,y+128,t,9,'#b8accf',True)
for p in arts:
    dot(p['x'],p['y'],13,'#eac773');text(p['x']+18,p['y']+121,'C' if p['value']==1200 else 'A',12,'#17212b',True)
    text(p['x']+9,p['y']+(102 if p['y']>535 else 145),f"${p['value']:,}",11,'#ffe2a4',True)
for i,p in enumerate(docks):
    box(p['x']+28-34,p['y']+128-26,68,52,'#256f68' if i==0 else '#62467d');text(p['x']+3,p['y']+122,'MINT' if i==0 else 'VIOLET',11,'#ffffff',True)
box(plate['x']+16,plate['y']+116,24,24,'#90cbff');text(plate['x']+23,plate['y']+121,'P',12,'#17212b',True)
for p in sentries:dot(p['x'],p['y'],10,'#e57f69');text(p['x']+23,p['y']+120,'G',11,'#18232a',True)
text(1010,140,'READ THE BUILDING',15,'#f4d79b',True)
notes=[('01  TAKE THE LOOP','Public rooms connect through','offset doorways. Break pursuit','at a corner; choose another exit.'),('02  COMMIT FOR VALUE','Portraits and the Crown are','deliberate dead ends. A sentry','makes the retreat part of the job.'),('03  SPLIT THE CREW','Hold P in Security while the','other thief takes the Crown.','Plate can release after pickup.'),('04  PASS AT A DOOR','Clear sight + free hands.','Transfer art across the junction;','then diverge to split pursuit.')]
y=178
for title,*body in notes:
    text(1010,y,title,12,'#71d7c8',True)
    for j,t in enumerate(body):text(1010,y+25+j*18,t,11)
    y+=110
text(1010,632,'KEY',12,'#f4d79b',True)
for j,(t,c) in enumerate([('A / C  Art / Crown','#eac773'),('P  Remote pressure plate','#90cbff'),('H  Wall recess','#71d7c8'),('G / dotted  Sentry / patrol','#e57f69'),('Pink  Laser beam','#ff617b')]):text(1010,656+j*19,t,11,c)
text(28,752,f"SHORT LASER ROUTE  ≈ {fast:.0f}u       LONG APPROACH  ≈ {safe:.0f}u       PLATE → CROWN  ≈ {plate_distance:.0f}u",15,'#f4d79b',True)
text(28,784,'Gold = shortest Crown route   •   Teal = longer approach   •   both converge in the laser maze',12)
text(28,807,'13u clearance measured. Candidate implementation: release requires passing balance, idle, escape and CPU gates.',12,'#9dacb7')
im.save(OUT/'blueprint.png')
print(json.dumps(metrics,indent=2))
