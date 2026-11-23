// Adapted from tevy's CC0 Sea Turtle v1. The mesh includes the original skin
// weights, both clips sampled as joint matrices, and mipmapped colour and normal maps.
const shader = `
@group(1) @binding(0) var<storage,read> joints: array<mat4x4f>;
@group(1) @binding(1) var coat: texture_2d<f32>;
@group(1) @binding(2) var relief: texture_2d<f32>;
@group(1) @binding(3) var surfaceSampler: sampler;
const boneCount = 10u;
struct TurtleVertex {
  @builtin(position) clip: vec4f,
  @location(0) world: vec3f,
  @location(1) normal: vec3f,
  @location(2) uv: vec2f,
}
@vertex fn vsGreen(
  @builtin(instance_index) inst: u32,
  @location(0) pos: vec4f, @location(1) norm: vec4f,
  @location(2) route: vec4f, @location(3) motion: vec4f,
  @location(4) uv: vec2f, @location(5) indices: vec4u, @location(6) weights: vec4f,
) -> TurtleVertex {
  let base = inst * boneCount;
  let skin = joints[base+indices.x]*weights.x + joints[base+indices.y]*weights.y
           + joints[base+indices.z]*weights.z + joints[base+indices.w]*weights.w;
  let p = (skin * vec4f(pos.xyz,1.)).xyz;
  let normal = (skin * vec4f(norm.xyz,0.)).xyz;
  let a = g.cam.w*motion.y+motion.x;
  let bob = a*1.3+fract(motion.w)*TAU;
  let center = route.xyz+vec3f(cos(a)*route.w,.65*sin(bob),sin(a)*route.w*.65);
  let forward = normalize(vec3f(-sin(a)*route.w,.845*cos(bob),cos(a)*route.w*.65))*sign(motion.y);
  let right = normalize(cross(vec3f(0.,1.,0.),forward));
  let up = cross(forward,right);
  let basis = mat3x3f(right,up,forward);
  var out: TurtleVertex;
  out.world = center + basis*p*(motion.z*.94);
  out.clip = g.vp*vec4f(out.world,1.);
  out.normal = normalize(basis*normal);
  out.uv = uv;
  return out;
}
@fragment fn fsGreen(i: TurtleVertex) -> @location(0) vec4f {
  let geo = normalize(i.normal);
  let dx = dpdx(i.world); let dy = dpdy(i.world);
  let ux = dpdx(i.uv); let uy = dpdy(i.uv);
  let c1 = cross(dy,geo); let c2 = cross(geo,dx);
  let tangent = c1*ux.x+c2*uy.x; let bitangent = c1*ux.y+c2*uy.y;
  let scale = inverseSqrt(max(1e-14,max(dot(tangent,tangent),dot(bitangent,bitangent))));
  let bump = textureSample(relief,surfaceSampler,i.uv).xyz*2.-1.;
  let N = normalize(geo*max(.2,bump.z)+(tangent*bump.x+bitangent*bump.y)*scale*.68);
  let alb = textureSample(coat,surfaceSampler,i.uv).rgb;
  let z = zone(i.world); let sky = vol(i.world).g;
  let ca = caus(i.world,length(i.world-g.cam.xyz));
  let sun = sunE(i.world.y,z)*shadow4(i.world+geo*.075);
  // Water scatters some skylight into shadow even on the ventral plates.
  let diffuseSky = mix(amb(i.world,N,sky,z),amb(i.world,vec3f(0.,1.,0.),sky,z),.28);
  let bounce = diffuseSky*1.36+side(i.world,N,1.,z)*.62;
  let direct = sat(dot(g.sun.xyz,N));
  let view = normalize(g.cam.xyz-i.world);
  let shine = pow(sat(dot(N,normalize(g.sun.xyz+view))),37.);
  let c = alb*(bounce*1.22+sun*direct*(.62+ca*.81))+sun*direct*shine*(.018+.033*ca);
  return fin(fog(c,i.world,z));
}
`;

async function readTurtle(device, data, makeBuffer, count, allocated) {
  const view = new DataView(data);
  let offset = 0;
  function word() { const n = view.getUint32(offset,true); offset += 4; return n; }
  function take(size) { const bytes = new Uint8Array(data,offset,size); offset += size; return bytes; }
  const version = word(), vertexCount = word(), indexCount = word(), bones = word();
  const swimFrames = word(), glideFrames = word();
  if (version !== 1 || bones !== 10) throw Error('Unknown green turtle mesh');
  function buffer(data, usage) {
    const b = makeBuffer(data,usage);
    allocated.push(b);
    return b;
  }
  const vertex = buffer(take(vertexCount*24),GPUBufferUsage.VERTEX);
  const index = buffer(take(indexCount*2),GPUBufferUsage.INDEX);
  const stride = bones*16;
  const clipBytes = take((swimFrames+glideFrames)*stride*4);
  const clips = new Float32Array(data,clipBytes.byteOffset,clipBytes.byteLength/4);
  const pose = new Float32Array(count*stride);
  const skin = buffer(pose,GPUBufferUsage.STORAGE);
  async function texture(format) {
    const levels = word();
    const width = 2**(levels-1);
    const tex = device.createTexture({size:[width,width],mipLevelCount:levels,format,
      usage:GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.COPY_DST|GPUTextureUsage.RENDER_ATTACHMENT});
    allocated.push(tex);
    for(let level=0;level<levels;level++){
      const img = await createImageBitmap(new Blob([take(word())],{type:'image/webp'}),{colorSpaceConversion:'none'});
      try { device.queue.copyExternalImageToTexture({source:img},{texture:tex,mipLevel:level},[img.width,img.height]); }
      finally { img.close(); }
    }
    return tex.createView();
  }
  const coat = await texture('rgba8unorm-srgb');
  const normal = await texture('rgba8unorm');
  return {vertex,index,indexCount,skin,pose,clips,stride,swimFrames,glideFrames,coat,normal};
}

function sampleFrames(time, seconds, frames, start, stride) {
  const pos = (time/seconds % 1)*frames;
  const a = Math.floor(pos);
  return [(start+a)*stride,(start+(a+1)%frames)*stride,pos-a];
}

export async function loadGreenTurtles({device,sharedShader,sceneLayout,instanceLayout,
  makeBuffer,colorFormat,depthFormat,samples,routes}) {
  const response = await fetch(new URL('./green-turtle.mesh',import.meta.url));
  if (!response.ok) throw Error('Green turtle download failed ('+response.status+')');
  const groupLayout = device.createBindGroupLayout({entries:[
    {binding:0,visibility:GPUShaderStage.VERTEX,buffer:{type:'read-only-storage'}},
    {binding:1,visibility:GPUShaderStage.FRAGMENT,texture:{}},
    {binding:2,visibility:GPUShaderStage.FRAGMENT,texture:{}},
    {binding:3,visibility:GPUShaderStage.FRAGMENT,sampler:{}},
  ]});
  const module = device.createShaderModule({code:sharedShader+shader});
  const pipeline = await device.createRenderPipelineAsync({
    layout:device.createPipelineLayout({bindGroupLayouts:[sceneLayout,groupLayout]}),
    vertex:{module,entryPoint:'vsGreen',buffers:[{arrayStride:24,attributes:[
      {shaderLocation:0,offset:0,format:'snorm16x4'}, {shaderLocation:1,offset:8,format:'snorm8x4'},
      {shaderLocation:4,offset:12,format:'unorm16x2'},{shaderLocation:5,offset:16,format:'uint8x4'},
      {shaderLocation:6,offset:20,format:'unorm8x4'},
    ]},instanceLayout]},
    fragment:{module,entryPoint:'fsGreen',targets:[{format:colorFormat}]},
    depthStencil:{format:depthFormat,depthWriteEnabled:true,depthCompare:'greater'},multisample:{count:samples},
  });
  const count = routes.length/8;
  const allocated = [];
  try {
    const mesh = await readTurtle(device,await response.arrayBuffer(),makeBuffer,count,allocated);
    const {stride,swimFrames,glideFrames,clips,pose} = mesh;
    const sampler = device.createSampler({magFilter:'linear',minFilter:'linear',mipmapFilter:'linear'});
    const group = device.createBindGroup({layout:groupLayout,entries:[
      {binding:0,resource:{buffer:mesh.skin}},{binding:1,resource:mesh.coat},
      {binding:2,resource:mesh.normal},{binding:3,resource:sampler},
    ]});
    return {draw(pass,routeBuffer,time) {
      // Interpolate the ten bones once per animal, then skin all four in one draw.
      for(let i=0;i<count;i++){
        const phase=routes[8*i+7]*Math.PI*2;
        const clock=time+phase;
        const [a,b,u]=sampleFrames(clock,76/30,swimFrames,0,stride);
        const [c,d,v]=sampleFrames(clock,91/30,glideFrames,swimFrames,stride);
        const t=Math.min(1,Math.max(0,.5+1.7*Math.sin(time*.55+phase)));
        const effort=t*t*(3-2*t);
        for(let j=0;j<stride;j++){
          const swim=clips[a+j]+u*(clips[b+j]-clips[a+j]);
          const glide=clips[c+j]+v*(clips[d+j]-clips[c+j]);
          pose[i*stride+j]=glide+effort*(swim-glide);
        }
      }
      device.queue.writeBuffer(mesh.skin,0,pose);
      pass.setPipeline(pipeline); pass.setBindGroup(1,group);
      pass.setVertexBuffer(0,mesh.vertex); pass.setVertexBuffer(1,routeBuffer);
      pass.setIndexBuffer(mesh.index,'uint16'); pass.drawIndexed(mesh.indexCount,count);
    }};
  } catch (error) {
    for(const resource of allocated) resource.destroy();
    throw error;
  }
}
