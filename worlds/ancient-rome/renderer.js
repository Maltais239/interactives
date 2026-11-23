import {makeTextures} from './texture.js';

const shader=`
struct Scene { vp:mat4x4f, light:mat4x4f, eye:vec4f, front:vec4f, right:vec4f, up:vec4f, sun:vec4f }
@group(0) @binding(0) var<uniform> s:Scene;
@group(0) @binding(1) var materials:texture_2d_array<f32>;
@group(0) @binding(2) var paint:sampler;
@group(0) @binding(3) var shadowMap:texture_depth_2d;
@group(0) @binding(4) var shade:sampler_comparison;
@group(0) @binding(5) var contact:texture_2d<f32>;
struct Attr { @location(0) pos:vec3f, @location(1) norm:vec3f, @location(2) uv:vec2f, @location(3) color:vec3f, @location(4) layer:f32 }
struct Vary { @builtin(position) clip:vec4f, @location(0) world:vec3f, @location(1) norm:vec3f, @location(2) uv:vec2f, @location(3) color:vec3f, @location(4) @interpolate(flat) layer:u32 }
@vertex fn geometry(i:Attr)->Vary{
  var o:Vary; o.world=i.pos;o.norm=i.norm;o.uv=i.uv;o.color=i.color;o.layer=u32(i.layer+.5);o.clip=s.vp*vec4f(i.pos,1);return o;
}
struct ShadowVary { @builtin(position) clip:vec4f,@location(0) uv:vec2f,@location(1) @interpolate(flat) layer:u32 }
@vertex fn shadowVertex(i:Attr)->ShadowVary{var o:ShadowVary;o.clip=s.light*vec4f(i.pos,1);o.uv=i.uv;o.layer=u32(i.layer+.5);return o;}
@fragment fn shadowFragment(i:ShadowVary){if(i.layer==21u && textureSampleLevel(materials,paint,i.uv,21,0.).a<.38){discard;}}
fn hash(p:vec2f)->f32{var a=fract(vec3f(p.x,p.y,p.x)*.1031);a+=dot(a,a.yzx+33.33);return fract((a.x+a.y)*a.z);}
fn noise(p:vec2f)->f32{let i=floor(p);let f=fract(p);let u=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2f(1,0)),u.x),mix(hash(i+vec2f(0,1)),hash(i+vec2f(1,1)),u.x),u.y);}
fn clouds(p:vec2f)->f32{return noise(p)*.52+noise(p*2.11+8.)*.31+noise(p*4.26)*.17;}
struct Sky { @builtin(position) clip:vec4f,@location(0) p:vec2f }
@vertex fn skyVert(@builtin(vertex_index) id:u32)->Sky{
  var xy=array<vec2f,3>(vec2f(-1,-1),vec2f(3,-1),vec2f(-1,3));var o:Sky;o.clip=vec4f(xy[id],.999999,1);o.p=xy[id];return o;
}
@fragment fn skyFrag(i:Sky)->@location(0) vec4f{
  let ray=normalize(s.front.xyz+i.p.x*s.front.w*s.right.w*s.right.xyz+i.p.y*s.front.w*s.up.xyz);
  let altitude=max(0.,ray.y);
  var col=mix(vec3f(.92,.846,.705),vec3f(.36,.62,.76),smoothstep(-.04,.63,altitude));col=mix(col,vec3f(.29,.52,.70),smoothstep(.4,1.,altitude)*.44);
  let plane=ray.xz/max(.07,ray.y+.09);let vapor=clouds(plane*vec2f(.75,1.35)+vec2f(8.3,11.6));
  col=mix(col,vec3f(.99,.94,.82),smoothstep(.50,.79,vapor)*.47*smoothstep(.025,.21,altitude));
  let glow=max(dot(ray,s.sun.xyz),0.);col+=vec3f(.30,.19,.06)*pow(glow,14.)+vec3f(.90,.72,.46)*smoothstep(.99945,.99988,glow);
  let az=atan2(ray.x,ray.z);let ridgeline=.045+.026*sin(az*6.)+.012*sin(az*13.)+.010*sin(az*31.);
  col=mix(col,vec3f(.60,.64,.56),(1.-smoothstep(ridgeline-.002,ridgeline+.004,ray.y))*.50);return vec4f(col,1);
}
@fragment fn surface(i:Vary)->@location(0) vec4f{
  let n=normalize(i.norm);let p=i.world;let view=normalize(s.eye.xyz-p);let layer=i.layer;
  let sampleColor=textureSample(materials,paint,i.uv,layer);
  if(layer==21u && sampleColor.a<.31){discard;}let tex=sampleColor.rgb;
  var base=i.color*tex;
  let patina=noise(p.xz*.58+vec2f(p.y*.35,p.y*.7));
  if(layer<=2u){base*=.93+.09*patina+.045*noise(p.xz*2.4+p.y);
    let damp=(1.-smoothstep(.10,1.2,p.y))*(.48+.48*patina);base=mix(base,base*vec3f(.77,.78,.68),damp);}
  let light=s.light*vec4f(p+n*.026,1);let suv=light.xy*vec2f(.5,-.5)+.5;let bias=.00014+.00045*(1.-abs(dot(n,s.sun.xyz)));
  var sun=0.;let pixel=1./f32(textureDimensions(shadowMap).x);
  for(var x=-1;x<=1;x++){for(var y=-1;y<=1;y++){sun+=textureSampleCompareLevel(shadowMap,shade,suv+vec2f(f32(x),f32(y))*pixel*.95,light.z-bias);}}
  sun/=9.;if(any(suv<vec2f(0))||any(suv>vec2f(1))){sun=1.;}
  let diffuse=max(0.,dot(n,s.sun.xyz));let hemi=.5+.5*n.y;
  let contactShade=textureSampleLevel(contact,paint,p.xz/128.+.5,0.).r;
  let occlusion=mix(contactShade,1.,smoothstep(.10,2.6,p.y));
  let skylight=mix(vec3f(.46,.436,.414),vec3f(.78,.80,.83),hemi)*occlusion;
  var out=base*(skylight+vec3f(.58,.50,.37)*sun*diffuse);
  if(layer==7u){out+=vec3f(.26,.21,.12)*pow(max(dot(reflect(-s.sun.xyz,n),view),0.),26.)*sun;}
  if(layer==10u){
    let waves=sin(p.x*9.+s.eye.w*2.3+p.z*3.2)+sin(p.z*11.-s.eye.w*2.9-p.x);
    let slope=normalize(n+vec3f(.09*waves,0,.11*cos(p.z*8.+s.eye.w*2.)));
    let fres=pow(1.-max(0.,dot(slope,view)),2.);out=mix(base*vec3f(.63,.94,.87),vec3f(.69,.83,.85),fres*.72);
    out+=vec3f(.30,.31,.24)*max(waves-1.13,0.)*sun;
    if(p.y>.74){out=mix(vec3f(.48,.56,.54),vec3f(.91,.93,.85),.38+.40*sin(p.y*24.+s.eye.w*9.+p.x*3.));}
  }
  let dist=distance(p,s.eye.xyz);let mist=1.-exp(-dist*dist*.000015);
  return vec4f(mix(out,vec3f(.855,.795,.688),mist*.79),1);
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
  const mod=device.createShaderModule({code:shader}),info=await mod.getCompilationInfo();
  const err=info.messages.filter(i=>i.type==='error');if(err.length)throw Error(err.map(i=>i.lineNum+' '+i.message).join('\n'));
  const buffers=[{arrayStride:48,attributes:[{shaderLocation:0,offset:0,format:'float32x3'},{shaderLocation:1,offset:12,format:'float32x3'},
    {shaderLocation:2,offset:24,format:'float32x2'},{shaderLocation:3,offset:32,format:'float32x3'},{shaderLocation:4,offset:44,format:'float32'}]}];
  const samples=4,shSize=2048;
  const pipelines=await Promise.all([
    device.createRenderPipelineAsync({layout:'auto',vertex:{module:mod,entryPoint:'geometry',buffers},fragment:{module:mod,entryPoint:'surface',targets:[{format}]},
      multisample:{count:samples},depthStencil:{format:'depth24plus',depthWriteEnabled:true,depthCompare:'less'}}),
    device.createRenderPipelineAsync({layout:'auto',vertex:{module:mod,entryPoint:'shadowVertex',buffers},fragment:{module:mod,entryPoint:'shadowFragment',targets:[]},depthStencil:{format:'depth24plus',depthWriteEnabled:true,depthCompare:'less',depthBias:2,depthBiasSlopeScale:1.1}}),
    device.createRenderPipelineAsync({layout:'auto',vertex:{module:mod,entryPoint:'skyVert'},fragment:{module:mod,entryPoint:'skyFrag',targets:[{format}]},
      multisample:{count:samples},depthStencil:{format:'depth24plus',depthWriteEnabled:false,depthCompare:'always'}})
  ]);
  function buffer(array,usage){const b=device.createBuffer({size:array.byteLength,usage,mappedAtCreation:true});new Uint8Array(b.getMappedRange()).set(new Uint8Array(array.buffer));b.unmap();return b;}
  const vertices=buffer(new Float32Array(mesh.data),GPUBufferUsage.VERTEX),indices=buffer(new Uint32Array(mesh.indices),GPUBufferUsage.INDEX);
  const count=mesh.indices.length;mesh.data.length=0;mesh.indices.length=0;
  const uniform=device.createBuffer({size:208,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST});
  const material=makeTextures(device);
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
  const bind=()=>({binding:0,resource:{buffer:uniform}});
  const bindGroups=pipelines.map((p,i)=>device.createBindGroup({layout:p.getBindGroupLayout(0),entries:[bind(),...(i===2?[]:[{binding:1,resource:material.createView({dimension:'2d-array'})},{binding:2,resource:filtered}]),...(i===0?[{binding:3,resource:shadowView},{binding:4,resource:compare},{binding:5,resource:contact.createView()}]:[])]}));
  const sun=normalize([-.68,.82,.50]),f=sun.map(v=>-v),r=normalize(cross(f,[0,1,0])),u=cross(r,f);
  const sunEye=sun.map((v,i)=>v*88+[3,2,-6][i]);
  const ortho=[1/55,0,0,0,0,1/53,0,0,0,0,-1/164,0,0,0,0,1];
  const params=new Float32Array(52);params.set(multiply(ortho,view(sunEye,f,r,u)),16);params.set(sun,48);device.queue.writeBuffer(uniform,0,params);
  const enc=device.createCommandEncoder(),depthPass=enc.beginRenderPass({colorAttachments:[],depthStencilAttachment:{view:shadowView,depthClearValue:1,depthLoadOp:'clear',depthStoreOp:'store'}});
  depthPass.setPipeline(pipelines[1]);depthPass.setBindGroup(0,bindGroups[1]);depthPass.setVertexBuffer(0,vertices);depthPass.setIndexBuffer(indices,'uint32');depthPass.drawIndexed(count);depthPass.end();device.queue.submit([enc.finish()]);
  const validation=await device.popErrorScope();if(validation)throw Error(validation.message);
  let color,depth,cv,dv;
  return function render(cam,time){
    const w=canvas.clientWidth,h=canvas.clientHeight;if(!w||!h)return;
    const scale=Math.min(devicePixelRatio||1,1.6,Math.sqrt(1440000/(w*h))),width=Math.max(1,Math.floor(w*scale)),height=Math.max(1,Math.floor(h*scale));
    if(!color||canvas.width!==width||canvas.height!==height){
      color?.destroy();depth?.destroy();canvas.width=width;canvas.height=height;
      color=device.createTexture({size:[width,height],format,sampleCount:samples,usage:GPUTextureUsage.RENDER_ATTACHMENT});cv=color.createView();
      depth=device.createTexture({size:[width,height],format:'depth24plus',sampleCount:samples,usage:GPUTextureUsage.RENDER_ATTACHMENT});dv=depth.createView();
    }
    const a=width/height,t=Math.tan((a<1?70:61)*Math.PI/360),near=.08,far=220;
    const front=[Math.sin(cam.yaw)*Math.cos(cam.pitch),Math.sin(cam.pitch),-Math.cos(cam.yaw)*Math.cos(cam.pitch)],right=[Math.cos(cam.yaw),0,Math.sin(cam.yaw)],up=cross(right,front),eye=[cam.x,cam.eye,cam.z];
    const proj=[1/(t*a),0,0,0,0,1/t,0,0,0,0,far/(near-far),-1,0,0,near*far/(near-far),0];
    params.set(multiply(proj,view(eye,front,right,up)),0);params.set([...eye,time],32);params.set([...front,t],36);params.set([...right,a],40);params.set(up,44);
    device.queue.writeBuffer(uniform,0,params);
    const cmd=device.createCommandEncoder(),pass=cmd.beginRenderPass({colorAttachments:[{view:cv,resolveTarget:ctx.getCurrentTexture().createView(),loadOp:'clear',clearValue:{r:.7,g:.8,b:.83,a:1},storeOp:'discard'}],
      depthStencilAttachment:{view:dv,depthClearValue:1,depthLoadOp:'clear',depthStoreOp:'discard'}});
    pass.setPipeline(pipelines[2]);pass.setBindGroup(0,bindGroups[2]);pass.draw(3);
    pass.setPipeline(pipelines[0]);pass.setBindGroup(0,bindGroups[0]);pass.setVertexBuffer(0,vertices);pass.setIndexBuffer(indices,'uint32');pass.drawIndexed(count);pass.end();device.queue.submit([cmd.finish()]);
  };
}
