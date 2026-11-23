import { buildKelpFish, kelpFishSchools } from "./kelp-fish.js?v=1";
export {kelpFishSchools};

const swimShader = `
struct SwimProfile {
  // Body length, envelope exponent (negative for exponential), head gain, type (1 shark, 0 goldfish, negative for kelp fish).
  shape: vec4f,
  // Body lengths per second, beats per second, peak-to-peak amplitude, wavelength.
  wave: array<vec4f,6>,
}
@group(1) @binding(0) var<uniform> profile: SwimProfile;

struct MarineVertex {
  @builtin(position) clip: vec4f,
  @location(0) world: vec3f,
  @location(1) normal: vec3f,
  @location(2) color: vec4f,
  @location(3) local: vec3f,
  @location(4) @interpolate(flat) species: f32,
}

fn waveAt(speed: f32) -> vec3f {
  var value = profile.wave[0].yzw;
  for (var row = 1u; row < 6u; row++) {
    let a = profile.wave[row-1u];
    let b = profile.wave[row];
    let t = clamp((speed-a.x)/max(.001,b.x-a.x),0.,1.);
    value = mix(value,b.yzw,t);
  }
  return value;
}

// The upstream swimmer's speed table and body wave, sampled by position along the mesh.
fn motionAt(z: f32, time: f32, phase: f32, wave: vec3f) -> vec2f {
  let body = .5-z/profile.shape.x;
  let u = clamp(body,0.,1.);
  let exponent = profile.shape.y;
  let k = TAU/wave.z;
  let exponential = exp(abs(exponent)*(u-1.));
  let power = pow(max(u,.00001),max(exponent,.01));
  let envelope = select(exponential,power,exponent>0.);
  let taper = select(exponential*abs(exponent),power*exponent/max(u,.00001),exponent>0.);
  let angle = TAU*time*wave.x - k*u + phase;
  let t = clamp(u/.35,0.,1.);
  let headGain = profile.shape.z * .025;
  let head = headGain*(1.-t*t*(3.-2.*t));
  let headSlope = -headGain*6.*t*(1.-t)/.35;
  let delta = envelope*sin(angle)+head*sin(angle+.8);
  let derivative = taper*sin(angle)-k*envelope*cos(angle) +
    headSlope*sin(angle+.8)-k*head*cos(angle+.8);
  let slope = select(0.,-derivative,body>0. && body<1.);
  return .5*wave.y*vec2f(profile.shape.x*delta,slope);
}

@vertex fn vsMarine(
  @location(0) p: vec3f,
  @location(1) n: vec3f,
  @location(4) color: vec4f,
  @location(2) route: vec4f,
  @location(3) motion: vec4f,
) -> MarineVertex {
  let time = g.cam.w;
  let phase = fract(motion.w)*TAU;
  let a = time*motion.y+motion.x;
  let bob = a*1.3+phase;
  let center = route.xyz+vec3f(cos(a)*route.w,.65*sin(bob),sin(a)*route.w*.65);
  let forward = normalize(vec3f(-sin(a)*route.w,.845*cos(bob),cos(a)*route.w*.65))*sign(motion.y);
  let right = normalize(cross(vec3f(0.,1.,0.),forward));
  let up = cross(forward,right);
  let bodyLength = profile.shape.x*motion.z;
  let meanSpeed = abs(motion.y)*route.w*.835/bodyLength;
  let fish = profile.shape.w<.5;
  let individual = select(1., .94+.12*fract(motion.x*11.79),fish);
  let wave = waveAt(meanSpeed*individual);
  // The ellipse is slowest at its ends. A periodic phase correction varies
  // cadence continuously, including after a long dive.
  let swimTime = time*individual-.055*sin(2.*a)/motion.y;
  let stroke = motionAt(p.z,swimTime,phase,wave);
  let tangent = normalize(vec2f(stroke.y,1.));
  // Rotate each cross-section into the local spine frame. This makes the
  // caudal fin change its angle of attack instead of sliding broadside.
  var finPos=p;
  var finNormal=n;
  if(profile.shape.w<0. && abs(color.a-.44)<.002){
    // The paired pectoral fins scull most visibly on damselfish. The sardines
    // propel themselves chiefly with their tails.
    let width=select(select(.051,.085,profile.shape.w> -2.5),.119,profile.shape.w> -1.5);
    let pivot=vec3f(sign(p.x)*width,-.030,.18)*profile.shape.x;
    let reach=smoothstep(.012,.15,length(p-pivot)/profile.shape.x);
    let gain=select(select(.09,.22,profile.shape.w> -2.5),.45,profile.shape.w> -1.5);
    let angle=sign(p.x)*gain*reach*sin(time*TAU*wave.x+phase-p.z/profile.shape.x*2.);
    let cs=cos(angle);let sn=sin(angle);
    let q=p-pivot;
    finPos=pivot+vec3f(cs*q.x+sn*q.z,q.y,-sn*q.x+cs*q.z);
    finNormal=vec3f(cs*n.x+sn*n.z,n.y,-sn*n.x+cs*n.z);
  }
  let bendX = stroke.x+finPos.x*tangent.y;
  let bendZ = finPos.z-finPos.x*tangent.x;
  let bentNormal = vec3f(finNormal.x*tangent.y+finNormal.z*tangent.x,finNormal.y,finNormal.z*tangent.y-finNormal.x*tangent.x);
  let ellipseSpeed = length(vec2f(sin(a),.65*cos(a)));
  let acceleration = motion.y*motion.y*route.w*.65/ellipseSpeed;
  let bank = sign(motion.y)*min(.20,acceleration*select(.64,1.6,fish));
  let cs = cos(bank);
  let sn = sin(bank);
  let px = cs*bendX-sn*p.y;
  let py = sn*bendX+cs*p.y;
  let normal = normalize(right*(cs*bentNormal.x-sn*bentNormal.y)
    +up*(sn*bentNormal.x+cs*bentNormal.y)+forward*bentNormal.z);
  var result: MarineVertex;
  result.world = center+(right*px+up*py+forward*bendZ)*motion.z;
  result.clip = g.vp*vec4f(result.world,1.);
  result.normal = normal;
  result.color = color;
  result.local = p;
  result.species = profile.shape.w;
  return result;
}

@fragment fn fsMarine(i: MarineVertex) -> @location(0) vec4f {
  let N = normalize(i.normal);
  let V = normalize(g.cam.xyz-i.world);
  let L = g.sun.xyz;
  let dist = length(g.cam.xyz-i.world);
  let z = zone(i.world);
  let ca = caus(i.world,dist);
  let sky = vol(i.world).g;
  let E = sunE(i.world.y,z)*shadow4(i.world+N*.075);
  let up = amb(i.world,vec3f(0.,1.,0.),sky,z);
  let texture = textureSample(tD,sR,i.local.xz*vec2f(23.,15.)+i.local.y*9.);
  let alb = i.color.rgb*mix(.92,1.08,texture.g);
  let lit = sat(dot(N,L));
  let rim = pow(1.-sat(dot(N,V)),3.);
  let sharkSkin = i.species > .5 && i.color.a < .8;
  let fillY = select(.20+.65*abs(N.y), .20+.65*N.y, sharkSkin);
  let fillNormal = normalize(vec3f(N.x,fillY,N.z));
  var c = alb*(E*lit*(.44+ca*.63)+amb(i.world,fillNormal,sky,z)*1.28
    +side(i.world,N,1.,z)*.55);
  let spec = pow(sat(dot(N,normalize(V+L))),mix(21.,90.,i.color.a));
  c += E*spec*lit*mix(.11,.47,i.color.a)*(.32+ca*.54);
  let edge = select(.19,.12,sharkSkin);
  c += up*rim*select(edge,.09,i.color.a>.8);
  let scatter = smoothstep(0.,.45,sg(z).g*max(0.,dist-2.5));
  return vec4f(fin(fog(c,i.world,z)).rgb,select(1.,1.-scatter,i.species<0.));
}
`;

function buildInWorker(detailed) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL("./marine-worker.js?v=2", import.meta.url), { type: "module" });
    const deadline = setTimeout(() => finish(reject, new Error("Marine life build timed out")), 45000);
    function finish(callback, result) {
      clearTimeout(deadline);
      worker.terminate();
      callback(result);
    }
    worker.onmessage = ({ data }) => {
      if (data.error) finish(reject, new Error(data.error));
      else finish(resolve, data.meshes);
    };
    worker.onerror = event => finish(reject, new Error(event.message || "Marine life worker unavailable"));
    worker.postMessage({ detailed });
  });
}

export async function loadMarineLife({
  device, sharedShader, sceneLayout, instanceLayout, makeBuffer, colorFormat, depthFormat,
  samples, detailed, build = buildInWorker,
}) {
  const meshes = [...await build(detailed), ...buildKelpFish(detailed)];
  const layout = device.createBindGroupLayout({
    entries: [{ binding: 0, visibility: GPUShaderStage.VERTEX, buffer: {} }],
  });
  const module = device.createShaderModule({ code: sharedShader + swimShader });
  const pipeline = await device.createRenderPipelineAsync({
    layout: device.createPipelineLayout({ bindGroupLayouts: [sceneLayout, layout] }),
    vertex: {
      module, entryPoint: "vsMarine",
      buffers: [{
        arrayStride: 40,
        attributes: [
          { shaderLocation: 0, offset: 0, format: "float32x3" },
          { shaderLocation: 1, offset: 12, format: "float32x3" },
          { shaderLocation: 4, offset: 24, format: "float32x4" },
        ],
      }, instanceLayout],
    },
    fragment: { module, entryPoint: "fsMarine", targets: [{ format: colorFormat }] },
    depthStencil: { format: depthFormat, depthWriteEnabled: true, depthCompare: "greater" },
    multisample: { count: samples },
  });

  device.pushErrorScope("out-of-memory");
  device.pushErrorScope("validation");
  const buffers = [];
  function buffer(data, usage) {
    const value = makeBuffer(data, usage);
    buffers.push(value);
    return value;
  }
  let failure;
  let animals;
  try {
    animals = meshes.map(({ vertices, indices, motion }) => {
      const vertex = buffer(vertices, GPUBufferUsage.VERTEX);
      const index = buffer(indices, GPUBufferUsage.INDEX);
      const profile = buffer(motion, GPUBufferUsage.UNIFORM);
      const group = device.createBindGroup({
        layout, entries: [{ binding: 0, resource: { buffer: profile } }],
      });
      return { vertex, index, group, count: indices.length };
    });
  } catch (error) {
    failure = error;
  }
  const checks = await Promise.all([device.popErrorScope(), device.popErrorScope()]);
  failure ??= checks.find(Boolean);
  if (failure) {
    for (const resource of buffers) resource.destroy();
    throw failure;
  }
  return {
    draw(pass, routes, counts) {
      pass.setPipeline(pipeline);
      for (let i = 0; i < animals.length; i++) {
        if (!counts[i]) continue;
        const { vertex, index, group, count } = animals[i];
        pass.setBindGroup(1, group);
        pass.setVertexBuffer(0, vertex);
        pass.setVertexBuffer(1, routes[i]);
        pass.setIndexBuffer(index, "uint32");
        pass.drawIndexed(count, counts[i]);
      }
    },
  };
}
