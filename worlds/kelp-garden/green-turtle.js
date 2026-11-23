import {createTurtleRoutes} from "./turtle-motion.js?v=1";

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
  @location(4) uv: vec2f, @location(5) indices: vec4u, @location(6) weights: vec4f,
) -> TurtleVertex {
  let base = inst * (boneCount+1u);
  let skin = joints[base+indices.x]*weights.x + joints[base+indices.y]*weights.y
           + joints[base+indices.z]*weights.z + joints[base+indices.w]*weights.w;
  let p = (skin * vec4f(pos.xyz,1.)).xyz;
  let normal = (skin * vec4f(norm.xyz,0.)).xyz;
  let transform = joints[base+boneCount];
  var out: TurtleVertex;
  out.world = (transform*vec4f(p,1.)).xyz;
  out.clip = g.vp*vec4f(out.world,1.);
  out.normal = normalize((transform*vec4f(normal,0.)).xyz);
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
  let dist = length(i.world-g.cam.xyz);
  let z = zone(i.world);
  let scatter = smoothstep(0.,.45,sg(z).g*max(0.,dist-2.5));
  let mipBias = 1.55*scatter;
  let bump = textureSampleBias(relief,surfaceSampler,i.uv,mipBias).xyz*2.-1.;
  let N = normalize(geo*max(.2,bump.z)+(tangent*bump.x+bitangent*bump.y)*scale*mix(.68,.16,scatter));
  let alb = textureSampleBias(coat,surfaceSampler,i.uv,mipBias).rgb;
  let sky = vol(i.world).g;
  let ca = caus(i.world,dist);
  let sun = sunE(i.world.y,z)*shadow4(i.world+geo*.075);
  // Water scatters some skylight into shadow even on the ventral plates.
  let diffuseSky = mix(amb(i.world,N,sky,z),amb(i.world,vec3f(0.,1.,0.),sky,z),.28);
  let bounce = diffuseSky*1.36+side(i.world,N,1.,z)*.62;
  let direct = sat(dot(g.sun.xyz,N));
  let view = normalize(g.cam.xyz-i.world);
  let shine = pow(sat(dot(N,normalize(g.sun.xyz+view))),37.);
  let c = alb*(bounce*1.22+sun*direct*(.62+ca*.81))+sun*direct*shine*(.018+.033*ca);
  // The opaque scene alpha carries forward-scatter strength into the composite.
  return vec4f(fin(fog(c,i.world,z)).rgb,1.-scatter);
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
  const pose = new Float32Array(count*(stride+16));
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
  return {vertex,index,indexCount,skin,pose,clips,stride,swimFrames,coat,normal};
}

// Rest-space hinges from the mesh's inverse bind matrices. The joint order is
// body, two left foreflipper bones, two right, left and right rear, neck, head, tail.
const shoulder=[.26374,-.06642,.29096];
const hip=[.24277,-.08868,-.61783];

function rotateJoints(pose, base, first, last, x,y,z, yaw,pitch,roll) {
  const start=base+first*16;
  const px=pose[start]*x+pose[start+4]*y+pose[start+8]*z+pose[start+12];
  const py=pose[start+1]*x+pose[start+5]*y+pose[start+9]*z+pose[start+13];
  const pz=pose[start+2]*x+pose[start+6]*y+pose[start+10]*z+pose[start+14];
  const cy=Math.cos(yaw), sy=Math.sin(yaw), cp=Math.cos(pitch), sp=Math.sin(pitch);
  const cr=Math.cos(roll), sr=Math.sin(roll);
  for(let bone=first;bone<=last;bone++){
    for(let column=0;column<4;column++){
      const j=base+bone*16+column*4;
      const w=pose[j+3];
      const dx=pose[j]-w*px, dy=pose[j+1]-w*py, dz=pose[j+2]-w*pz;
      const rx=cr*dx-sr*dy, ry=sr*dx+cr*dy;
      const rz=sp*ry+cp*dz;
      pose[j]=cy*rx+sy*rz+w*px;
      pose[j+1]=cp*ry-sp*dz+w*py;
      pose[j+2]=-sy*rx+cy*rz+w*pz;
    }
  }
}

function steerFlippers(pose,base,{steer,climb,stroke}) {
  const beat=stroke*Math.PI*2;
  const sweep=Math.sin(beat-.48), recover=Math.cos(beat+.25);
  for(const side of [1,-1]){
    const fore=side===1?1:3, rear=side===1?5:6;
    const inside=steer*side;
    // Change the reach and blade angle through the turn, moving both bones
    // about the shoulder so the distal joint stays attached.
    rotateJoints(pose,base,fore,fore+1,side*shoulder[0],shoulder[1],shoulder[2],
      steer*(.17+.15*sweep), .24*Math.sin(beat+.1)-.10*inside*sweep, -steer*(.15+.13*recover));
    // The distal blade twists later than the shoulder. It presents its broad
    // face on the power stroke and slices back through the water on recovery.
    rotateJoints(pose,base,fore+1,fore+1,side*.64443,-.09680,.15731,
      0,.24*Math.sin(beat-.2),0);
    // Rear paddles open into the flow and change pitch independently on a bend.
    // Both also trim a climb or dive as the foreflippers come through recovery.
    const effort=.09+.16*Math.abs(steer);
    rotateJoints(pose,base,rear,rear,side*hip[0],hip[1],hip[2],
      -.43*steer+side*effort*recover, .50*climb+.37*inside+effort*sweep,
      -side*.12*sweep-.18*steer);
  }
  rotateJoints(pose,base,7,8,.00009,-.04822,.35325,.15*steer,-.12*climb,0);
}

export async function loadGreenTurtles({device,sharedShader,sceneLayout,
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
    ]}]},
    fragment:{module,entryPoint:'fsGreen',targets:[{format:colorFormat}]},
    depthStencil:{format:depthFormat,depthWriteEnabled:true,depthCompare:'greater'},multisample:{count:samples},
  });
  const count = routes.length/8;
  const allocated = [];
  try {
    const mesh = await readTurtle(device,await response.arrayBuffer(),makeBuffer,count,allocated);
    const {stride,swimFrames,clips,pose} = mesh;
    const sampler = device.createSampler({magFilter:'linear',minFilter:'linear',mipmapFilter:'linear'});
    const group = device.createBindGroup({layout:groupLayout,entries:[
      {binding:0,resource:{buffer:mesh.skin}},{binding:1,resource:mesh.coat},
      {binding:2,resource:mesh.normal},{binding:3,resource:sampler},
    ]});
    const tracks=createTurtleRoutes(routes);
    return {
      positionFor(offset,time,out) {
        const m=tracks[offset/8](time).matrix;
        out[0]=m[12];out[1]=m[13];out[2]=m[14];
      },
      draw(pass,time) {
        for(let i=0;i<count;i++){
          const state=tracks[i](time);
          const cycle=state.stroke-Math.floor(state.stroke);
          const frame=cycle*swimFrames;
          const low=Math.floor(frame), high=(low+1)%swimFrames, mix=frame-low;
          const base=i*(stride+16);
          for(let j=0;j<stride;j++){
            const a=clips[low*stride+j];
            pose[base+j]=a+mix*(clips[high*stride+j]-a);
          }
          steerFlippers(pose,base,state);
          pose.set(state.matrix,base+stride);
        }
        device.queue.writeBuffer(mesh.skin,0,pose);
        pass.setPipeline(pipeline); pass.setBindGroup(1,group);
        pass.setVertexBuffer(0,mesh.vertex);
        pass.setIndexBuffer(mesh.index,'uint16'); pass.drawIndexed(mesh.indexCount,count);
      }
    };
  } catch (error) {
    for(const resource of allocated) resource.destroy();
    throw error;
  }
}
