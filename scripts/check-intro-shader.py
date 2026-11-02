import ctypes as C, os,re,math
os.environ['EGL_PLATFORM']='surfaceless'
e=C.CDLL('libEGL.so.1');e.eglGetDisplay.restype=C.c_void_p;e.eglGetDisplay.argtypes=[C.c_void_p]
d=e.eglGetDisplay(None)
def sig(name,result,args):
 f=getattr(e,name);f.restype=result;f.argtypes=args;return f
I=C.c_int;P=C.c_void_p
sig('eglInitialize',I,[P,C.POINTER(I),C.POINTER(I)])
a,b=I(),I();assert e.eglInitialize(d,C.byref(a),C.byref(b)),hex(e.eglGetError())
sig('eglBindAPI',I,[I])(0x30A0)
attrs=(I*13)(0x3024,8,0x3023,8,0x3022,8,0x3033,1,0x3040,4,0x3038,0,0)
config=P();n=I();sig('eglChooseConfig',I,[P,C.POINTER(I),C.POINTER(P),I,C.POINTER(I)])(d,attrs,C.byref(config),1,C.byref(n));assert n.value
ctx=sig('eglCreateContext',P,[P,P,P,C.POINTER(I)])(d,config,None,(I*3)(0x3098,2,0x3038));assert ctx
surf=sig('eglCreatePbufferSurface',P,[P,P,C.POINTER(I)])(d,config,(I*5)(0x3057,16,0x3056,16,0x3038));assert surf
assert sig('eglMakeCurrent',I,[P,P,P,P])(d,surf,surf,ctx)
sig('eglGetProcAddress',P,[C.c_char_p])
def gl(name,result,*args):return C.CFUNCTYPE(result,*args)(e.eglGetProcAddress(name.encode()))
create=gl('glCreateShader',C.c_uint,C.c_uint);source=gl('glShaderSource',None,C.c_uint,I,C.POINTER(C.c_char_p),C.POINTER(I));compile=gl('glCompileShader',None,C.c_uint);get=gl('glGetShaderiv',None,C.c_uint,C.c_uint,C.POINTER(I));log=gl('glGetShaderInfoLog',None,C.c_uint,I,C.POINTER(I),C.c_char_p)
s=open('components/noise/intro-renderer.ts').read();shaders=[]
for name,kind in [('vertex',0x8B31),('fragment',0x8B30)]:
 code=re.search(r'const '+name+r'=`(.*?)`;',s,re.S).group(1).encode();shader=create(kind);text=C.c_char_p(code);source(shader,1,C.byref(text),None);compile(shader);ok=I();get(shader,0x8B81,C.byref(ok));buf=C.create_string_buffer(4096);log(shader,4096,None,buf);assert ok.value,buf.value.decode();shaders.append(shader);print(name+': COMPILE PASS')
p=gl('glCreateProgram',C.c_uint)();attach=gl('glAttachShader',None,C.c_uint,C.c_uint)
for shader in shaders:attach(p,shader)
gl('glLinkProgram',None,C.c_uint)(p);ok=I();gl('glGetProgramiv',None,C.c_uint,C.c_uint,C.POINTER(I))(p,0x8B82,C.byref(ok));assert ok.value;print('GLES2 software context: LINK PASS')
# Reference frames from the production GLSL, not browser screenshots or generated video.
from PIL import Image,ImageDraw,ImageFont,ImageStat
from pathlib import Path
out=Path('docs/next-preview/intro-v3');out.mkdir(parents=True,exist_ok=True)
gl('glUseProgram',None,C.c_uint)(p)
buffer=C.c_uint();gl('glGenBuffers',None,I,C.POINTER(C.c_uint))(1,C.byref(buffer));gl('glBindBuffer',None,C.c_uint,C.c_uint)(0x8892,buffer.value)
vertices=(C.c_float*8)(-1,-1,1,-1,-1,1,1,1);gl('glBufferData',None,C.c_uint,C.c_ssize_t,P,C.c_uint)(0x8892,C.sizeof(vertices),vertices,0x88E4)
loc=gl('glGetAttribLocation',I,C.c_uint,C.c_char_p)(p,b'position');gl('glEnableVertexAttribArray',None,C.c_uint)(loc);gl('glVertexAttribPointer',None,C.c_uint,I,C.c_uint,C.c_ubyte,I,P)(loc,2,0x1406,0,0,None)
uniform=gl('glGetUniformLocation',I,C.c_uint,C.c_char_p);u1=gl('glUniform1f',None,I,C.c_float);u2=gl('glUniform2f',None,I,C.c_float,C.c_float);u3=gl('glUniform3f',None,I,C.c_float,C.c_float,C.c_float)
tex=(C.c_uint*2)();gl('glGenTextures',None,I,C.POINTER(C.c_uint))(2,tex)
for i in range(2):
 gl('glActiveTexture',None,C.c_uint)(0x84C0+i);gl('glBindTexture',None,C.c_uint,C.c_uint)(0x0DE1,tex[i])
 for key,val in [(0x2801,0x2601),(0x2800,0x2601),(0x2802,0x812F),(0x2803,0x812F)]:gl('glTexParameteri',None,C.c_uint,C.c_uint,I)(0x0DE1,key,val)
 gl('glUniform1i',None,I,I)(uniform(p,b'depthMap' if i else b'colorMap'),i)
frames=[]
for portrait in [False,True]:
 w,h=(390,844) if portrait else (1280,536)
 surface=sig('eglCreatePbufferSurface',P,[P,P,C.POINTER(I)])(d,config,(I*5)(0x3057,w,0x3056,h,0x3038));assert surface
 assert e.eglMakeCurrent(d,surface,surface,ctx)
 for shot in range(6):
  orientation='portrait' if portrait else 'landscape'
  for i in range(2):
   path=Path('public/cinematics/intro-v3')/f"shot-{shot+1:02d}-{orientation}{'-depth' if i else ''}.webp"
   im=Image.open(path).convert('RGBA').transpose(Image.Transpose.FLIP_TOP_BOTTOM);data=im.tobytes();gl('glActiveTexture',None,C.c_uint)(0x84C0+i);gl('glBindTexture',None,C.c_uint,C.c_uint)(0x0DE1,tex[i]);gl('glTexImage2D',None,C.c_uint,I,I,I,I,I,C.c_uint,C.c_uint,P)(0x0DE1,0,0x1908,im.width,im.height,0,0x1908,0x1401,C.c_char_p(data))
  progress=.65;eased=progress*progress*(3-2*progress)
  camera=[((eased-.5)*.003,0,.025*eased),((eased-.5)*.018,.002,.008),(.002,(eased-.5)*.013,.018*eased),((eased-.5)*.008,0,.006),((eased-.5)*.014,-.001,.012*eased),((eased-.5)*.004,0,.028*math.sin(math.pi*progress))][shot]
  u3(uniform(p,b'camera'),*camera);u2(uniform(p,b'size'),w,h)
  for name,value in [('time',progress*[5,4,4,4,6,5][shot]),('shot',shot),('portrait',int(portrait)),('progress',progress)]:u1(uniform(p,name.encode()),value)
  gl('glViewport',None,I,I,I,I)(0,0,w,h);gl('glDrawArrays',None,C.c_uint,I,I)(5,0,4);raw=C.create_string_buffer(w*h*4);gl('glReadPixels',None,I,I,I,I,C.c_uint,C.c_uint,P)(0,0,w,h,0x1908,0x1401,raw)
  assert gl('glGetError',C.c_uint)()==0
  image=Image.frombytes('RGBA',(w,h),raw.raw).transpose(Image.Transpose.FLIP_TOP_BOTTOM).convert('RGB');assert min(ImageStat.Stat(image).mean)>12, 'Unexpected black renderer output';frames.append(image)
  print(f'{orientation} shot {shot+1}: DRAW PASS')
 gl('glFinish',None)()
strip=Image.new('RGB',(1500,1040),'#0b121c');draw=ImageDraw.Draw(strip);font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',20)
draw.text((18,12),'Production GLSL reference renders · software GLES2 (not browser screenshots)',font=font,fill='white')
for i,im in enumerate(frames[:6]):
 x=18+(i%3)*420;y=50+(i//3)*200;im.thumbnail((406,174));strip.paste(im,(x,y));draw.text((x,y+175),f'Shot {i+1}',font=font,fill='#eed9a0')
for i,im in enumerate(frames[6:]):
 im.thumbnail((235,508));strip.paste(im,(18+i*245,455))
strip.save(out/'depth-reference-strip.jpg',quality=90)
