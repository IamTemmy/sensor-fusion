import {cameraAt,INTRO_SHOTS} from '../../lib/noise/intro-story';
import type {ShotImages} from './intro-media';
const vertex=`attribute vec2 position;varying vec2 uv;void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}`;
const fragment=`precision highp float;
varying vec2 uv;uniform sampler2D colorMap;uniform sampler2D depthMap;uniform vec3 camera;uniform vec2 size;uniform float time;uniform float shot;uniform float portrait;uniform float progress;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float beam(vec2 p,vec2 origin,float angle,float width){vec2 d=p-origin;float a=atan(d.y,d.x);float delta=atan(sin(a-angle),cos(a-angle));return exp(-delta*delta/width)*exp(-length(d)*1.8);}
void main(){
 vec2 p=uv;float target=size.x/size.y;float source=mix(16./9.,9./16.,portrait);
 vec2 cover=vec2(min(1.,target/source),min(1.,source/target));
 vec2 base=(p-.5)*cover/(1.04+camera.z)+.5;
 // Two depth samples refine the ray displacement. White foreground moves more than distant architecture.
 float d=texture2D(depthMap,base).r;vec2 q=base+camera.xy*(d-.25);
 d=texture2D(depthMap,q).r;q=clamp(base+camera.xy*(d-.25),.015,.985);
 vec3 c=texture2D(colorMap,q).rgb;
 // Rack focus moves from the background to the eyes in the final shot.
 float focus=mix(.25,.84,smoothstep(0.,.65,progress));float blur=shot>4.5?abs(d-focus)*.0035:0.;
 c=(c*2.+texture2D(colorMap,q+vec2(blur,0.)).rgb+texture2D(colorMap,q-vec2(blur,0.)).rgb+texture2D(colorMap,q+vec2(0.,blur)).rgb+texture2D(colorMap,q-vec2(0.,blur)).rgb)/6.;
 if(shot<.5||shot>4.5){
  float cone=beam(p,vec2(.69,.48),2.1+sin(time*.42)*.7,.026);if(shot<.5)c+=vec3(.43,.56,.72)*cone*(1.-d)*.38;
  for(int i=0;i<3;i++){float layer=float(i)+1.;vec2 rain=p*vec2(92.,24.)/layer+vec2(time*3.,time*19./layer);vec2 cell=floor(rain);vec2 f=fract(rain);float streak=(1.-smoothstep(.01,.045,abs(f.x-.5)))*(1.-smoothstep(.05,.8,f.y))*step(.67,hash(cell));c+=vec3(.38,.48,.58)*streak*.25;}
  vec2 floorp=p*vec2(40.,18.);float splash=abs(length(fract(floorp)-.5)-fract(time*1.7+hash(floor(floorp)))*.4);c+=vec3(.1,.15,.18)*(1.-smoothstep(.0,.025,splash))*step(p.y,.22)*.22;
 }else if(shot<1.5){c+=vec3(.66,.58,.39)*beam(p,vec2(.70,.35),3.0+sin(time*.48)*.55,.015)*(1.-d)*.22;
 }else if(shot<2.5){c*=1.+sin(time*13.)*.008+sin(time*7.1)*.006;
 }else if(shot>3.5&&shot<4.5){vec2 jar=mix(vec2(.675,.44),vec2(.63,.425),portrait);vec2 delta=(p-jar)*vec2(target,1.);float glow=exp(-dot(delta,delta)*70.);c+=vec3(.22,.008,.004)*glow*(.5+.5*sin(time*12.56637));}
 float flare=exp(-length((p-vec2(.75,.84))*vec2(target,1.))*22.);c+=vec3(.09,.065,.025)*flare;
 float vignette=1.-.21*smoothstep(.24,.77,length((p-.5)*vec2(1.,.85)));c*=vignette;
 c+=(hash(gl_FragCoord.xy+floor(time*24.))-.5)*.013;
 gl_FragColor=vec4(c,1.);
}`;
/** Approximate depth-image renderer; bounded displacement avoids exposing image edges. */
export class IntroRenderer {
 private gl:WebGLRenderingContext;private program:WebGLProgram;private textures:WebGLTexture[]=[];private buffer:WebGLBuffer;private uniforms:Record<string,WebGLUniformLocation|null>={};
 constructor(private canvas:HTMLCanvasElement,images:ShotImages){
  const gl=canvas.getContext('webgl',{alpha:false,antialias:false,powerPreference:'low-power'});if(!gl||!images.depth)throw new Error('Depth renderer unavailable');this.gl=gl;
  const compile=(type:number,source:string)=>{const shader=gl.createShader(type)!;gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){const error=gl.getShaderInfoLog(shader);gl.deleteShader(shader);throw new Error(error??'Shader compilation failed');}return shader;};
  const vs=compile(gl.VERTEX_SHADER,vertex),fs=compile(gl.FRAGMENT_SHADER,fragment);const program=gl.createProgram()!;gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);gl.deleteShader(vs);gl.deleteShader(fs);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('Shader linking failed');this.program=program;gl.useProgram(program);
  this.buffer=gl.createBuffer()!;gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);const position=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
  [images.color,images.depth].forEach((image,i)=>{const texture=gl.createTexture()!;this.textures.push(texture);gl.activeTexture(gl.TEXTURE0+i);gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);gl.uniform1i(gl.getUniformLocation(program,i?'depthMap':'colorMap'),i);});
  for(const key of ['camera','size','time','shot','portrait','progress'])this.uniforms[key]=gl.getUniformLocation(program,key);
 }
 draw(shot:number,elapsed:number,portrait:boolean){const gl=this.gl,c=this.canvas,r=c.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,1.5),scale=Math.min(dpr,1920/Math.max(1,r.width));const w=Math.max(1,Math.round(r.width*scale)),h=Math.max(1,Math.round(r.height*scale));if(c.width!==w||c.height!==h){c.width=w;c.height=h;}gl.viewport(0,0,w,h);gl.useProgram(this.program);gl.uniform3fv(this.uniforms.camera,cameraAt(shot,elapsed/INTRO_SHOTS[shot].seconds));gl.uniform2f(this.uniforms.size,w,h);gl.uniform1f(this.uniforms.time,elapsed);gl.uniform1f(this.uniforms.shot,shot);gl.uniform1f(this.uniforms.portrait,portrait?1:0);gl.uniform1f(this.uniforms.progress,elapsed/INTRO_SHOTS[shot].seconds);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);}
 close(){for(const t of this.textures)this.gl.deleteTexture(t);this.gl.deleteBuffer(this.buffer);this.gl.deleteProgram(this.program);}
}
