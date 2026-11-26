import {makeTextures} from './texture.js?v=street1';

const shader=riverTown=>`
const riverTown=${riverTown};
struct Scene { vp:mat4x4f, light:mat4x4f, eye:vec4f, front:vec4f, right:vec4f, up:vec4f, sun:vec4f }
@group(0) @binding(0) var<uniform> s:Scene;
@group(0) @binding(1) var materials:texture_2d_array<f32>;
@group(0) @binding(2) var paint:sampler;
@group(0) @binding(3) var shadowMap:texture_depth_2d;
@group(0) @binding(4) var shade:sampler_comparison;
@group(0) @binding(5) var contact:texture_2d<f32>;
@group(0) @binding(6) var relief:texture_2d_array<f32>;
struct SkyField { vp:array<mat4x4f,5>, direction:array<vec4f,5> }
@group(0) @binding(7) var<uniform> field:SkyField;
@group(0) @binding(8) var openSky:texture_depth_2d_array;
@group(0) @binding(9) var daylight:texture_2d<f32>;
@group(0) @binding(10) var forumReflection:texture_cube<f32>;
@group(0) @binding(11) var reflectionFace:texture_2d<f32>;
struct Attr { @location(0) pos:vec3f, @location(1) norm:vec3f, @location(2) uv:vec2f, @location(3) color:vec3f, @location(4) layer:f32 }
struct Vary { @builtin(position) clip:vec4f, @location(0) world:vec3f, @location(1) norm:vec3f, @location(2) uv:vec2f, @location(3) color:vec3f, @location(4) @interpolate(flat) layer:u32 }
@vertex fn geometry(i:Attr)->Vary{
  var o:Vary;var pos=i.pos;
  if(i.layer==27.){
    let head=smoothstep(.41,1.08,i.uv.x)*smoothstep(.41,.85,i.uv.y);
    let phase=s.eye.w*.71+floor(i.pos.x*.17);
    pos.y+=head*.034*sin(phase)+.008*sin(phase*1.73)*smoothstep(.65,1.27,i.uv.y);
  }
  if(riverTown && i.layer==10. && pos.y< -7.5){
    pos.y+=.075*sin(dot(pos.xz,vec2f(.16,.49))-s.eye.w*.90)+.035*sin(dot(pos.xz,vec2f(-.37,.19))-s.eye.w*.57);
  }
  if(i.layer==24.||i.layer==26.||i.layer==21.){
    let breeze=sin(s.eye.w*1.6+pos.x*.74+pos.z*.52)+.38*sin(s.eye.w*3.1+pos.y*1.24);
    pos.x+=.032*breeze*(1.-i.uv.y);pos.z+=.018*breeze*(1.-i.uv.y);
  }
  o.world=pos;o.norm=i.norm;o.uv=i.uv;o.color=i.color;o.layer=u32(i.layer+.5);o.clip=s.vp*vec4f(pos,1);return o;
}
struct ShadowVary { @builtin(position) clip:vec4f,@location(0) uv:vec2f,@location(1) @interpolate(flat) layer:u32 }
@vertex fn shadowVertex(i:Attr)->ShadowVary{var o:ShadowVary;o.clip=s.light*vec4f(i.pos,1);o.uv=i.uv;o.layer=u32(i.layer+.5);return o;}
@fragment fn shadowFragment(i:ShadowVary){if((i.layer==21u || i.layer==24u||i.layer==26u) && textureSampleLevel(materials,paint,i.uv,i.layer,0.).a<.28){discard;}}
fn hash(p:vec2f)->f32{var a=fract(vec3f(p.x,p.y,p.x)*.1031);a+=dot(a,a.yzx+33.33);return fract((a.x+a.y)*a.z);}
fn noise(p:vec2f)->f32{let i=floor(p);let f=fract(p);let u=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2f(1,0)),u.x),mix(hash(i+vec2f(0,1)),hash(i+vec2f(1,1)),u.x),u.y);}
struct Sky { @builtin(position) clip:vec4f,@location(0) p:vec2f }
@vertex fn skyVert(@builtin(vertex_index) id:u32)->Sky{
  var xy=array<vec2f,3>(vec2f(-1,-1),vec2f(3,-1),vec2f(-1,3));var o:Sky;o.clip=vec4f(xy[id],.999999,1);o.p=xy[id];return o;
}
@fragment fn filterFace(i:Sky)->@location(0) vec4f{
  let uv=i.p*vec2f(.5,-.5)+.5;
  return textureSampleLevel(reflectionFace,paint,uv,0.);
}
fn skyColor(ray:vec3f)->vec3f{
  let elevation=asin(clamp(ray.y,-1.,1.));let az=atan2(ray.z,ray.x);let sunAz=atan2(s.sun.z,s.sun.x);
  let uv=vec2f(fract(.602+(az-sunAz)/6.283185),clamp(1.-max(0.,elevation)/1.570796,.003,.973));
  let photo=textureSampleLevel(daylight,paint,uv,0).rgb;
  let air=vec3f(.84,.85,.84);let blue=mix(vec3f(.86,.865,.84),vec3f(.38,.58,.79),smoothstep(0.,.92,ray.y));
  let sky=mix(blue,mix(photo,vec3f(.78,.84,.91),.12),s.sun.w);
  return mix(air,sky,smoothstep(-.028,.105,ray.y)*.94);
}
@fragment fn skyFrag(i:Sky)->@location(0) vec4f{
  let ray=normalize(s.front.xyz+i.p.x*s.front.w*s.right.w*s.right.xyz+i.p.y*s.front.w*s.up.xyz);
  let az=atan2(ray.x,ray.z);let ridge=.034+.019*sin(az*6.)+.013*sin(az*13.)+.007*sin(az*31.);
  return vec4f(mix(skyColor(ray),vec3f(.59,.63,.59),(1.-smoothstep(ridge-.001,ridge+.002,ray.y))*.67),1);
}
fn visibility(p:vec3f,n:vec3f)->f32{
  var available=.0;var total=.0;
  for(var j=0;j<5;j++){
    let q=field.vp[j]*vec4f(p+n*.085,1);let uv=q.xy*vec2f(.5,-.5)+.5;
    let weight=.16+max(dot(n,field.direction[j].xyz),0.);
    let spread=.0052;let depth=q.z-.00145;
    var v:f32;
    if(s.up.w>.5){
      v=.34*textureSampleCompareLevel(openSky,shade,uv+vec2f(.81,.35)*spread,j,depth)
        +.33*textureSampleCompareLevel(openSky,shade,uv+vec2f(-.73,.61)*spread,j,depth)
        +.33*textureSampleCompareLevel(openSky,shade,uv+vec2f(-.19,-.83)*spread,j,depth);
    }else{v=textureSampleCompareLevel(openSky,shade,uv,j,depth);}
    if(any(uv<vec2f(0))||any(uv>vec2f(1))){v=1.;}
    available+=weight*v;total+=weight;
  }
  return available/total;
}
fn sunlight(p:vec3f,n:vec3f)->f32{
  let q=s.light*vec4f(p+n*.024,1);let uv=q.xy*vec2f(.5,-.5)+.5;
  let bias=.00012+.00038*(1.-abs(dot(n,s.sun.xyz)));let pixel=1./f32(textureDimensions(shadowMap).x);
  var sum=0.;for(var x=-1;x<=1;x++){for(var y=-1;y<=1;y++){sum+=textureSampleCompareLevel(shadowMap,shade,uv+vec2f(f32(x),f32(y))*pixel*.91,q.z-bias);}}
  return select(sum/9.,1.,any(uv<vec2f(0))||any(uv>vec2f(1)));
}
fn weather(color:vec3f,p:vec3f,layer:u32)->vec3f{
  if(layer>2u){return color;}
  let u=p.xz+vec2f(p.y*.41,p.y*.79);let blotch=noise(u*.65)*.62+noise(u*2.7)*.27+noise(u*7.3)*.11;
  let damp=(1.-smoothstep(.02,1.04+.48*blotch,p.y))*(.18+.58*blotch);
  let dust=select(.0,smoothstep(.59,.81,blotch)*.35,layer==1u);
  return mix(color,vec3f(.82,.76,.65),dust)*mix(vec3f(.99),vec3f(.68,.71,.65),damp);
}
fn illuminate(base:vec3f,p:vec3f,n:vec3f,access:f32,sun:f32,leaf:bool)->vec3f{
  let hemi=clamp(n.y*.5+.5,0.,1.);
  let sky=mix(vec3f(.20,.245,.305),vec3f(.40,.51,.66),hemi)*(.18+.82*access);
  let ground=vec3f(.20,.148,.10)*(.35+.65*(1.-hemi))*(.67+.33*access);
  var direct=max(.0,dot(n,s.sun.xyz));if(leaf){direct=.27+.67*abs(dot(n,s.sun.xyz));}
  let irradiance=sky+ground+sun*direct*vec3f(1.18,.99,.75);
  // Inputs are display-encoded. Illuminate in linear light and roll off sunlit highlights.
  let radiance=pow(max(base,vec3f(0)),vec3f(2.2))*irradiance;
  return pow(radiance/(1.+.23*radiance)*1.10,vec3f(1./2.2));
}
fn airColor(color:vec3f,p:vec3f)->vec3f{
  let d=distance(s.eye.xyz,p);
  let haze=1.-exp(-d*.00135-max(d-33.,0.)*.00085);
  return mix(color,vec3f(.80,.83,.845),min(haze,.62));
}
// The house fronts and individually modeled flags share the plaster and limestone scans.
fn colorLayer(layer:u32)->u32{
  if(layer==28u){return 1u;} if(layer==29u){return 0u;} return min(layer,26u);
}
fn stoneUV(uv:vec2f,layer:u32)->vec2f{
  if(layer==3u){return uv*.55;} if(layer==22u){return uv*.83;} return uv;
}
// The reflection probe is rendered only once from the fountain, with the basin omitted.
@fragment fn capture(i:Vary)->@location(0) vec4f{
  let c=select(textureSample(materials,paint,stoneUV(i.uv,i.layer),colorLayer(i.layer)),vec4f(1),i.layer==27u);let leaf=i.layer==21u||i.layer==24u||i.layer==26u;
  if((leaf&&c.a<.20)||i.layer==10u||(!riverTown && distance(i.world.xz,vec2f(7.4,1.2))<2.52&&i.world.y<4.3)){discard;}
  let n=normalize(i.norm);
  return vec4f(airColor(illuminate(i.color*c.rgb,i.world,n,visibility(i.world,n),sunlight(i.world,n),leaf),i.world),1);
}
@fragment fn surface(i:Vary)->@location(0) vec4f{
  let p=i.world;let layer=i.layer;let geometric=normalize(i.norm);var n=geometric;
  let view=normalize(s.eye.xyz-p);let leaf=layer==21u||layer==24u||layer==26u;
  let c=select(textureSample(materials,paint,stoneUV(i.uv,layer),colorLayer(layer)),vec4f(1),layer==27u);
  let surfaceLayer=colorLayer(layer);
  let detailLayer=select(min(surfaceLayer,3u),4u,layer==22u);
  let detail=textureSample(relief,paint,stoneUV(i.uv,layer),detailLayer).rgb;
  let hasRelief=surfaceLayer<=3u || layer==22u;
  let du=dpdx(i.uv);let dv=dpdy(i.uv);
  let a=cross(dpdy(p),n);let b=cross(n,dpdx(p));
  let tangent=a*du.x+b*dv.x;let bitangent=a*du.y+b*dv.y;
  if(hasRelief){
    let xy=detail.rg*2.-1.;let strength=select(select(.76,.27,layer==0u && abs(geometric.y)<.82),1.12,layer==3u);
    let inv=inverseSqrt(max(max(dot(tangent,tangent),dot(bitangent,bitangent)),.0000000001));
    n=normalize(n*sqrt(max(.08,1.-dot(xy,xy)))+(tangent*xy.x+bitangent*xy.y)*inv*strength);
  }
  if(leaf&&c.a<.10){discard;}
  let sun=sunlight(p,geometric);let ground=textureSampleLevel(contact,paint,p.xz/128.+.5,0.).r;
  let access=visibility(p,geometric)*mix(ground,1.,smoothstep(.06,2.4,p.y));
  var pigment=c.rgb;
  if(layer==0u && abs(geometric.y)<.82){pigment=mix(vec3f(.88),pigment,.39);}
  var base=weather(pigment*i.color,p,surfaceLayer);
  if(layer==28u){
    let wall=vec2f(select(p.z,p.x,abs(geometric.z)>abs(geometric.x)),p.y);
    let wash=noise(wall*vec2f(.88,1.31))*.52+noise(wall*3.9)*.33+noise(wall*12.)*.15;
    let splashes=1.-smoothstep(.18,1.22,p.y);
    let fleck=smoothstep(.62,.80,wash+splashes*.10);
    base=mix(base*(.94+.12*wash),vec3f(.68,.60,.49),fleck*(.13+.22*splashes));
    // Small losses in the lower coat reveal rough aggregate under the limewash.
    let grit=textureSampleGrad(materials,paint,i.uv*1.8,2u,du*1.8,dv*1.8).rgb;
    let broken=noise(wall*2.4)*.56+noise(wall*8.)*.28+grit.r*.16;
    let chip=smoothstep(.66,.74,broken)*splashes;
    base=mix(base,vec3f(.64,.54,.43)*(.51+.54*grit),chip*.75);
  }
  if(layer==29u){
    // The scan supplies the fine grain. Broad wear follows each flag's near-flat face.
    let grain=noise(p.xz*1.85);
    base*=.93+.10*grain;
  }
  if(riverTown && (layer==3u || layer==0u || layer==22u)){
    // Low-frequency variation crosses texture tiles. Damp masonry follows the waterline.
    let warp=vec2f(noise(p.xz*.075),noise(p.zx*.091+4.))*1.8;
    let large=noise(p.xz*.17+warp+p.y*.19);
    let wet=(1.-smoothstep(-8.5,-7.32+large*.51,p.y));
    base*=mix(vec3f(1.),vec3f(.58,.66,.59),wet);
    if(layer==3u){
      let lane=abs(p.x-13.-.09*p.z);
      let dust=(1.-smoothstep(.72,2.05,abs(lane-1.18)))*(.36+.44*large);
      base=mix(base*(.90+.16*large),vec3f(.68,.585,.454),dust*.47);
    }
  }
  var out=illuminate(base,p,n,access,sun,leaf);
  let halfVec=normalize(s.sun.xyz+view);
  if(hasRelief){out+=vec3f(.034,.029,.020)*pow(max(dot(n,halfVec),0.),mix(55.,10.,detail.b))*sun*(1.-detail.b);}
  if(riverTown && layer==22u){
    let tide=1.-smoothstep(-8.56,-7.93+.28*noise(p.xz*.71),p.y);
    out+=tide*sun*vec3f(.21,.19,.16)*pow(max(dot(n,halfVec),0.),42.);
  }
  if(layer==7u){
    let reflected=textureSampleLevel(forumReflection,paint,reflect(-view,n),2.7).rgb;
    let facing=1.-clamp(dot(n,view),0.,1.);
    out=mix(out,reflected*vec3f(.77,.65,.44),.19+.29*facing*facing);
    out+=vec3f(.43,.32,.16)*pow(max(dot(n,halfVec),0.),68.)*sun;
  }
  if(riverTown && layer==10u){
    let t=s.eye.w;let xz=p.xz;
    let warp=noise(xz*.096-vec2f(0.,t*.034))*4.8+noise(xz*.28+t*.04)*1.25;
    let d=distance(p,s.eye.xyz);let micro=1.-smoothstep(16.,76.,d);
    let dx=.030*cos(dot(xz,vec2f(.16,.49))+warp*.47-t*.9)+.022*cos(dot(xz,vec2f(-.37,.19))-t*.57);
    let dz=.054*cos(dot(xz,vec2f(.16,.49))+warp*.47-t*.9)+.048*cos(dot(xz,vec2f(.7,1.6))+warp-t*1.23);
    let slope=normalize(vec3f(dx+micro*.048*cos(xz.x*2.8+xz.y*4.1+warp-t*2.3),1.,
      dz+micro*.074*sin(xz.y*4.9+xz.x*.84+warp-t*2.5)));
    let ray=reflect(-view,slope);let reflection=textureSampleLevel(forumReflection,paint,ray,1.1+1.6*smoothstep(26.,125.,d)).rgb;
    let fres=.055+.945*pow(1.-max(0.,dot(slope,view)),4.);
    let sediment=mix(vec3f(.216,.276,.213),vec3f(.30,.34,.24),noise(xz*.065+warp));
    out=mix(sediment*(.65+.35*sun),reflection,.21+.76*fres)+vec3f(.49,.45,.32)*pow(max(dot(slope,halfVec),0.),94.)*sun;
  }else if(layer==10u){
    let t=s.eye.w;let basin=p.xz-vec2f(7.4,1.2);let r=length(basin);
    let spacing=.7853982;let angle=round(atan2(basin.y,basin.x)/spacing)*spacing;
    let fromJet=basin-1.67*vec2f(cos(angle),sin(angle));let dist=max(length(fromJet),.002);
    let wave=sin(dist*34.-t*6.8)*exp(-dist*2.45);
    let small=vec2f(sin(p.x*8.9+t*1.9+p.z*3.2),cos(p.z*9.1-t*1.63+p.x*4.));
    let slope=normalize(n+vec3f(.019*small.x,0.,.019*small.y)+vec3f(fromJet.x,0.,fromJet.y)*(.076*wave/dist));
    let env=textureSampleLevel(forumReflection,paint,reflect(-view,slope),1.25).rgb;
    let fres=.035+.965*pow(1.-max(0.,dot(slope,view)),4.);
    let bottom=mix(vec3f(.20,.37,.32),vec3f(.36,.49,.37),clamp(r*.34+.12*sin(dist*27.-t*5.)*exp(-dist),0.,1.))*(.69+.31*sun);
    out=mix(bottom,env,.12+.84*fres);
    if(p.y>.74 && abs(p.y-2.077)>.004){out=mix(env,vec3f(.78,.85,.84),.36+.12*sin(p.y*43.-t*8.+p.x*4.));}
    out+=vec3f(.68,.64,.50)*pow(max(dot(slope,halfVec),0.),130.)*sun;
    out+=vec3f(.16,.18,.16)*exp(-dist*18.)*(.55+.45*wave);
  }
  return vec4f(airColor(out,p),select(1.,smoothstep(.10,.58,c.a),leaf));
}`;
const normalize=a=>{const d=Math.hypot(...a);return a.map(n=>n/d);};
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const dot=(a,b)=>a.reduce((n,x,i)=>n+x*b[i],0);
function view(eye,f,r,u){return [r[0],u[0],-f[0],0,r[1],u[1],-f[1],0,r[2],u[2],-f[2],0,-dot(r,eye),-dot(u,eye),dot(f,eye),1];}
function multiply(a,b){const o=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++)for(let k=0;k<4;k++)o[c*4+r]+=a[k*4+r]*b[c*4+k];return o;}

export async function createRenderer(canvas,mesh,onLost){
  if(!navigator.gpu)throw Error('This walk needs WebGPU. Open it in a WebGPU-enabled browser.');
  const adapter=await navigator.gpu.requestAdapter() ?? await navigator.gpu.requestAdapter({forceFallbackAdapter:true});if(!adapter)throw Error('This browser could not start WebGPU. Check that graphics acceleration is enabled, then reload.');
  const device=await adapter.requestDevice(),ctx=canvas.getContext('webgpu'),format=navigator.gpu.getPreferredCanvasFormat();
  if(!ctx)throw Error('This browser could not open a WebGPU canvas.');
  device.lost.then(info=>onLost(info.message||'The graphics device was disconnected. Reload to resume.'));
  device.pushErrorScope('validation');
  ctx.configure({device,format,alphaMode:'opaque'});
  const mod=device.createShaderModule({code:shader(!!mesh.reflectionOrigin)}),info=await mod.getCompilationInfo();
  const err=info.messages.filter(i=>i.type==='error');if(err.length)throw Error(err.map(i=>i.lineNum+' '+i.message).join('\n'));
  const buffers=[{arrayStride:48,attributes:[{shaderLocation:0,offset:0,format:'float32x3'},{shaderLocation:1,offset:12,format:'float32x3'},
    {shaderLocation:2,offset:24,format:'float32x2'},{shaderLocation:3,offset:32,format:'float32x3'},{shaderLocation:4,offset:44,format:'float32'}]}];
  const samples=4,shSize=2048;
  const pipelines=await Promise.all([
    device.createRenderPipelineAsync({layout:'auto',vertex:{module:mod,entryPoint:'geometry',buffers},fragment:{module:mod,entryPoint:'surface',targets:[{format}]},
      multisample:{count:samples,alphaToCoverageEnabled:true},depthStencil:{format:'depth24plus',depthWriteEnabled:true,depthCompare:'less'}}),
    device.createRenderPipelineAsync({layout:'auto',vertex:{module:mod,entryPoint:'shadowVertex',buffers},fragment:{module:mod,entryPoint:'shadowFragment',targets:[]},depthStencil:{format:'depth24plus',depthWriteEnabled:true,depthCompare:'less',depthBias:2,depthBiasSlopeScale:1.1}}),
    device.createRenderPipelineAsync({layout:'auto',vertex:{module:mod,entryPoint:'skyVert'},fragment:{module:mod,entryPoint:'skyFrag',targets:[{format}]},
      multisample:{count:samples},depthStencil:{format:'depth24plus',depthWriteEnabled:false,depthCompare:'always'}})
  ]);
  function buffer(array,usage){const b=device.createBuffer({size:array.byteLength,usage,mappedAtCreation:true});new Uint8Array(b.getMappedRange()).set(new Uint8Array(array.buffer));b.unmap();return b;}
  const vertices=buffer(new Float32Array(mesh.data),GPUBufferUsage.VERTEX),indices=buffer(new Uint32Array(mesh.indices),GPUBufferUsage.INDEX);
  const count=mesh.indices.length;mesh.data.length=0;mesh.indices.length=0;
  const uniform=device.createBuffer({size:208,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST});
  const {material,detail,sky,hasSky}=await makeTextures(device);
  const filtered=device.createSampler({addressModeU:'repeat',addressModeV:'repeat',magFilter:'linear',minFilter:'linear',mipmapFilter:'linear',maxAnisotropy:4});
  const shadow=device.createTexture({size:[shSize,shSize],format:'depth24plus',usage:GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.TEXTURE_BINDING});
  const shadowView=shadow.createView(),compare=device.createSampler({compare:'less-equal',magFilter:'linear',minFilter:'linear'});
  const ground=document.createElement('canvas');ground.width=ground.height=512;
  const gc=ground.getContext('2d');gc.fillStyle='white';gc.fillRect(0,0,512,512);
  for(const b of mesh.blocks){
    if(b.bottom>1.75||b.top<.6)continue;
    gc.save();gc.translate(256+b.x*4,256+b.z*4);gc.rotate(-Math.atan2(b.s,b.c));
    gc.shadowColor='rgba(0,0,0,.52)';gc.shadowBlur=6;gc.fillStyle='rgba(0,0,0,.25)';
    gc.fillRect(-b.hx*4,-b.hz*4,b.hx*8,b.hz*8);gc.restore();
  }
  const contact=device.createTexture({size:[512,512],format:'rgba8unorm',usage:GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.COPY_DST});
  device.queue.writeTexture({texture:contact},gc.getImageData(0,0,512,512).data,{bytesPerRow:2048},[512,512]);
  const sun=normalize([.77,.91,.34]);
  const skyDirections=[[.04,1,.03],[.86,.66,.1],[-.86,.66,-.1],[.1,.61,.88],[-.1,.61,-.88]].map(normalize);
  function lightMatrix(direction){
    const forward=direction.map(x=>-x),right=normalize(cross(forward,[0,1,0])),up=cross(right,forward);
    const extent=mesh.shadowRadius??55,focus=mesh.reflectionOrigin?[-29,1,-7]:[3,2,-6];
    const eye=direction.map((v,i)=>v*(extent+38)+focus[i]);
    const ortho=[1/extent,0,0,0,0,1/(extent-2),0,0,0,0,-1/(extent*2+68),0,0,0,0,1];
    return multiply(ortho,view(eye,forward,right,up));
  }
  const skyMatrices=skyDirections.map(lightMatrix),skyData=new Float32Array(100);
  for(let j=0;j<5;j++){skyData.set(skyMatrices[j],j*16);skyData.set(skyDirections[j],80+j*4);}
  const skyUniform=buffer(skyData,GPUBufferUsage.UNIFORM);
  const skyDepth=device.createTexture({label:'Static sky visibility',size:[640,640,5],format:'depth24plus',usage:GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.TEXTURE_BINDING});
  const probeSize=192,probe=device.createTexture({label:'Forum reflected in fountain',size:[probeSize,probeSize,6],mipLevelCount:8,format,usage:GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.TEXTURE_BINDING});
  const oneLayer=(texture,j,mip=0)=>texture.createView({dimension:'2d',baseArrayLayer:j,arrayLayerCount:1,baseMipLevel:mip,mipLevelCount:1});
  const resources=[null,material.createView({dimension:'2d-array'}),filtered,shadowView,compare,contact.createView(),detail.createView({dimension:'2d-array'}),
    {buffer:skyUniform},skyDepth.createView({dimension:'2d-array'}),sky.createView(),probe.createView({dimension:'cube'})];
  function group(pipeline,ubo,bindings){
    return device.createBindGroup({layout:pipeline.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:ubo}},
      ...bindings.map(binding=>({binding,resource:resources[binding]}))]});
  }
  const bindGroups=[group(pipelines[0],uniform,[1,2,3,4,5,6,7,8,10]),group(pipelines[1],uniform,[1,2]),group(pipelines[2],uniform,[2,9])];
  const params=new Float32Array(52);params.set(lightMatrix(sun),16);params.set([...sun,Number(hasSky)],48);
  device.queue.writeBuffer(uniform,0,params);
  function draw(pass,pipeline,bindings){
    pass.setPipeline(pipeline);pass.setBindGroup(0,bindings);pass.setVertexBuffer(0,vertices);pass.setIndexBuffer(indices,'uint32');pass.drawIndexed(count);
  }
  const enc=device.createCommandEncoder(),temporary=[];
  function staticUniform(values){const u=buffer(values,GPUBufferUsage.UNIFORM);temporary.push(u);return u;}
  function depthPass(target,bindings){
    const pass=enc.beginRenderPass({colorAttachments:[],depthStencilAttachment:{view:target,depthClearValue:1,depthLoadOp:'clear',depthStoreOp:'store'}});
    draw(pass,pipelines[1],bindings);pass.end();
  }
  depthPass(shadowView,bindGroups[1]);
  for(let j=0;j<skyMatrices.length;j++){
    const values=new Float32Array(params);values.set(skyMatrices[j],16);
    depthPass(oneLayer(skyDepth,j),group(pipelines[1],staticUniform(values),[1,2]));
  }
  const [probeScene,probeSky,probeFilter]=await Promise.all([
    device.createRenderPipelineAsync({layout:'auto',vertex:{module:mod,entryPoint:'geometry',buffers},fragment:{module:mod,entryPoint:'capture',targets:[{format}]},
      depthStencil:{format:'depth24plus',depthWriteEnabled:true,depthCompare:'less'}}),
    device.createRenderPipelineAsync({layout:'auto',vertex:{module:mod,entryPoint:'skyVert'},fragment:{module:mod,entryPoint:'skyFrag',targets:[{format}]},
      depthStencil:{format:'depth24plus',depthWriteEnabled:false,depthCompare:'always'}}),
    device.createRenderPipelineAsync({layout:'auto',vertex:{module:mod,entryPoint:'skyVert'},fragment:{module:mod,entryPoint:'filterFace',targets:[{format}]}})
  ]);
  const probeDepth=device.createTexture({size:[probeSize,probeSize],format:'depth24plus',usage:GPUTextureUsage.RENDER_ATTACHMENT});
  const near=.12,far=180,projection=[1,0,0,0,0,1,0,0,0,0,far/(near-far),-1,0,0,near*far/(near-far),0];
  const axes=[[[1,0,0],[0,0,-1],[0,1,0]],[[-1,0,0],[0,0,1],[0,1,0]],[[0,1,0],[1,0,0],[0,0,-1]],
    [[0,-1,0],[1,0,0],[0,0,1]],[[0,0,1],[1,0,0],[0,1,0]],[[0,0,-1],[-1,0,0],[0,1,0]]];
  const origin=mesh.reflectionOrigin??[7.4,.93,1.2];
  axes.forEach(([front,right,up],j)=>{
    const values=new Float32Array(params);values.set(multiply(projection,view(origin,front,right,up)));values.set(origin,32);
    values.set([...front,1],36);values.set([...right,1],40);values.set(up,44);
    const u=staticUniform(values),pass=enc.beginRenderPass({colorAttachments:[{view:oneLayer(probe,j),loadOp:'clear',clearValue:{r:.6,g:.7,b:.8,a:1},storeOp:'store'}],
      depthStencilAttachment:{view:probeDepth.createView(),depthClearValue:1,depthLoadOp:'clear',depthStoreOp:'discard'}});
    pass.setPipeline(probeSky);pass.setBindGroup(0,group(probeSky,u,[2,9]));pass.draw(3);
    draw(pass,probeScene,group(probeScene,u,[1,2,3,4,7,8]));pass.end();
  });
  for(let level=1;level<8;level++)for(let j=0;j<6;j++){
    const pass=enc.beginRenderPass({colorAttachments:[{view:oneLayer(probe,j,level),loadOp:'clear',clearValue:{r:0,g:0,b:0,a:1},storeOp:'store'}]});
    const bindings=device.createBindGroup({layout:probeFilter.getBindGroupLayout(0),entries:[{binding:2,resource:filtered},{binding:11,resource:oneLayer(probe,j,level-1)}]});
    pass.setPipeline(probeFilter);pass.setBindGroup(0,bindings);pass.draw(3);pass.end();
  }
  device.queue.submit([enc.finish()]);for(const u of temporary)u.destroy();probeDepth.destroy();
  const validation=await device.popErrorScope();if(validation)throw Error(validation.message);
  let color,depth,cv,dv,lastFrame=0,elapsed=0,timedFrames=0,resolution=1;
  // Change resolution only after sustained pressure. Ignore time spent in the map or a hidden tab.
  function frameBudget(now){
    const frame=now-lastFrame;lastFrame=now;
    if(frame>250||frame<3){timedFrames=0;elapsed=0;return;}
    elapsed+=frame;timedFrames++;
    if(timedFrames<48)return;
    const mean=elapsed/timedFrames;elapsed=0;timedFrames=0;
    if(mean>29)resolution=Math.max(.72,resolution-.09);
    else if(mean<18)resolution=Math.min(1,resolution+.06);
  }
  return function render(cam,time){
    const w=canvas.clientWidth,h=canvas.clientHeight;if(!w||!h)return;
    frameBudget(performance.now());
    const compact=w<700;
    const scale=resolution*Math.min(devicePixelRatio||1,compact?1.35:1.6,Math.sqrt(1440000/(w*h))),width=Math.max(1,Math.floor(w*scale)),height=Math.max(1,Math.floor(h*scale));
    if(!color||canvas.width!==width||canvas.height!==height){
      color?.destroy();depth?.destroy();canvas.width=width;canvas.height=height;
      color=device.createTexture({size:[width,height],format,sampleCount:samples,usage:GPUTextureUsage.RENDER_ATTACHMENT});cv=color.createView();
      depth=device.createTexture({size:[width,height],format:'depth24plus',sampleCount:samples,usage:GPUTextureUsage.RENDER_ATTACHMENT});dv=depth.createView();
    }
    const a=width/height,t=Math.tan((a<1?70:61)*Math.PI/360),near=.08,far=mesh.reflectionOrigin?350:220;
    const front=[Math.sin(cam.yaw)*Math.cos(cam.pitch),Math.sin(cam.pitch),-Math.cos(cam.yaw)*Math.cos(cam.pitch)],right=[Math.cos(cam.yaw),0,Math.sin(cam.yaw)],up=cross(right,front),eye=[cam.x,cam.eye,cam.z];
    const proj=[1/(t*a),0,0,0,0,1/t,0,0,0,0,far/(near-far),-1,0,0,near*far/(near-far),0];
    params.set(multiply(proj,view(eye,front,right,up)),0);params.set([...eye,time],32);params.set([...front,t],36);params.set([...right,a],40);params.set([...up,Number(!compact && resolution>.83)],44);
    device.queue.writeBuffer(uniform,0,params);
    const cmd=device.createCommandEncoder(),pass=cmd.beginRenderPass({colorAttachments:[{view:cv,resolveTarget:ctx.getCurrentTexture().createView(),loadOp:'clear',clearValue:{r:.7,g:.8,b:.83,a:1},storeOp:'discard'}],
      depthStencilAttachment:{view:dv,depthClearValue:1,depthLoadOp:'clear',depthStoreOp:'discard'}});
    pass.setPipeline(pipelines[2]);pass.setBindGroup(0,bindGroups[2]);pass.draw(3);
    pass.setPipeline(pipelines[0]);pass.setBindGroup(0,bindGroups[0]);pass.setVertexBuffer(0,vertices);pass.setIndexBuffer(indices,'uint32');pass.drawIndexed(count);pass.end();device.queue.submit([cmd.finish()]);
  };
}
