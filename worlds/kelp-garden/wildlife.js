const TAU = 2 * Math.PI;

const part = {
  shell: 0, skin: 1, foreflipper: 2, hindflipper: 3, eye: 4, iris: 5, groove: 6,
  sharkBody: 0, sharkFin: 1, sharkTail: 2,
};

function interpolate(points, t) {
  const segment = Math.min(Math.floor(t), points.length - 2);
  const f = t - segment;
  const p0 = points[Math.max(0, segment - 1)];
  const p1 = points[segment];
  const p2 = points[segment + 1];
  const p3 = points[Math.min(points.length - 1, segment + 2)];
  return p1.map((v, i) => .5 * (2 * v + f * (p2[i] - p0[i] +
    f * (2 * p0[i] - 5 * v + 4 * p2[i] - p3[i] +
    f * (3 * (v - p2[i]) + p3[i] - p0[i])))));
}

function shape() {
  const vertices = [];
  const indices = [];

  function surface(sample, lengthSegments, radialSegments, material) {
    const start = vertices.length / 7;
    for (let row = 0; row <= lengthSegments; row++) {
      const t = row / lengthSegments;
      for (let column = 0; column <= radialSegments; column++) {
        const a = TAU * column / radialSegments;
        const p = sample(t, a);
        const low = sample(Math.max(0, t - .001), a);
        const high = sample(Math.min(1, t + .001), a);
        const left = sample(t, a - .003);
        const right = sample(t, a + .003);
        const u = right.map((v, i) => v - left[i]);
        const v = high.map((value, i) => value - low[i]);
        let normal = [u[1]*v[2] - u[2]*v[1], u[2]*v[0] - u[0]*v[2], u[0]*v[1] - u[1]*v[0]];
        const opposite = sample(t, a + Math.PI);
        if (normal.reduce((sum, n, i) => sum + n * (p[i] - opposite[i]), 0) < 0) {
          normal = normal.map(n => -n);
        }
        const magnitude = Math.hypot(...normal) || 1;
        vertices.push(...p, ...normal.map(n => n / magnitude), material);
        if (row < lengthSegments && column < radialSegments) {
          const i = start + row * (radialSegments + 1) + column;
          const next = i + radialSegments + 1;
          indices.push(i, i + 1, next, next, i + 1, next + 1);
        }
      }
    }
  }

  function ellipsoid(x, y, z, rx, ry, rz, material) {
    surface((t, a) => {
      const p = .001 + t * (Math.PI - .002);
      return [x + rx*Math.cos(a)*Math.sin(p), y + ry*Math.sin(a)*Math.sin(p), z + rz*Math.cos(p)];
    }, 14, 24, material);
  }

  function fin(sections, vertical, material) {
    surface((t, a) => {
      const [x, y, z, chord, thickness] = interpolate(sections, t * (sections.length - 1));
      const across = Math.max(.0006, thickness) * Math.sin(a);
      const along = Math.max(.0007, chord) * Math.cos(a);
      return [x + (vertical ? across : 0), y + (vertical ? 0 : across), z + along];
    }, 25, 22, material);
  }

  function seam(points, radius) {
    // Tiny shaded ridges define the mouth and gills at close range.
    surface((t, a) => {
      const at = progress => interpolate(points, progress * (points.length - 1));
      const p = at(t);
      const start = at(Math.max(0, t - .002));
      const end = at(Math.min(1, t + .002));
      const direction = end.map((v, i) => v - start[i]);
      const length = Math.hypot(...direction) || 1;
      const [x, y, z] = direction.map(v => v / length);
      const side = Math.abs(y) < .7 ? [-z, 0, x] : [y, -x, 0];
      const width = Math.hypot(...side) || 1;
      const up = [y*side[2] - z*side[1], z*side[0] - x*side[2], x*side[1] - y*side[0]];
      const r = radius * (.22 + .78 * Math.sin(Math.PI*t) ** .35);
      return p.map((v, i) => v + r * (side[i]*Math.cos(a) + up[i]*Math.sin(a)) / width);
    }, 14, 8, part.groove);
  }

  return {
    surface, fin, ellipsoid, seam,
    build: () => ({ vertices: new Float32Array(vertices), indices: new Uint32Array(indices) }),
  };
}

function turtleMesh() {
  const m = shape();
  // The oval shell has a high back, flat marginal plates, and a shallow plastron.
  const shell = [
    [-.93, .004, .003], [-.86, .251, .132], [-.68, .433, .215],
    [-.40, .533, .265], [-.11, .558, .286], [.18, .53, .261],
    [.44, .444, .195], [.61, .286, .112], [.68, .003, .004],
  ];
  m.surface((t, a) => {
    const [z, width, high] = interpolate(shell, t * (shell.length - 1));
    const rise = Math.sin(a);
    const belly = rise < 0 ? .42 : 1;
    return [Math.cos(a)*Math.max(.002, width), .025 + rise*belly*Math.max(.002, high), z];
  }, 48, 48, part.shell);

  // A broad loggerhead skull with a shorter beak and a neck recessed into the shell.
  const head = [
    [.36, .017, .17, .13], [.58, .02, .148, .125], [.70, .017, .128, .104],
    [.80, .043, .169, .128], [.94, .033, .174, .118], [1.06, .005, .135, .088],
    [1.14, -.029, .092, .050], [1.175, -.044, .003, .003],
  ];
  m.surface((t, a) => {
    const [z, y, width, height] = interpolate(head, t * (head.length - 1));
    return [Math.max(.002, width)*Math.cos(a), y + Math.max(.002,height)*Math.sin(a), z];
  }, 36, 38, part.skin);
  m.ellipsoid(0, -.062, -.87, .095, .062, .23, part.skin);

  for (const side of [-1, 1]) {
    const mirrored = sections => sections.map(([x, ...rest]) => [side*x, ...rest]);
    m.fin(mirrored([
      [.28, -.055, .33, .137, .054], [.49, -.087, .39, .198, .050],
      [.70, -.122, .33, .194, .042], [.94, -.154, .19, .145, .029],
      [1.15, -.180, -.02, .085, .017], [1.30, -.211, -.25, .002, .001],
    ]), false, part.foreflipper);
    m.fin(mirrored([
      [.24, -.056, -.63, .106, .041], [.42, -.075, -.72, .127, .035],
      [.57, -.095, -.85, .090, .022], [.61, -.111, -.988, .002, .001],
    ]), false, part.hindflipper);
    m.ellipsoid(side*.157, .089, .913, .029, .044, .051, part.skin);
    m.ellipsoid(side*.174, .092, .92, .019, .030, .034, part.iris);
    m.ellipsoid(side*.186, .093, .926, .011, .021, .023, part.eye);
    m.ellipsoid(side*.054, .024, 1.118, .017, .010, .014, part.groove);
    m.seam(mirrored([
      [.157, -.023, .905], [.159, -.043, .947], [.137, -.056, 1.014],
      [.102, -.061, 1.089], [.005, -.068, 1.156],
    ]), .006);
  }
  return m.build();
}

const sharkProfile = [
  [-1.67, .014, .022, .038], [-1.49, .007, .064, .084], [-1.21, .006, .102, .129],
  [-.87, .005, .163, .179], [-.42, 0, .233, .238], [.08, -.018, .302, .291],
  [.49, -.036, .335, .267], [.88, -.047, .294, .213], [1.15, -.065, .240, .155],
  [1.39, -.065, .151, .092], [1.54, -.056, .078, .037], [1.57, -.054, .002, .002],
];

function sharkSection(t, a) {
  const [z, y, width, height] = interpolate(sharkProfile, t * (sharkProfile.length - 1));
  const sy = Math.sin(a);
  return [Math.max(.002, width)*Math.cos(a), y + sy*Math.max(.002,height)*(sy < 0 ? .83 : 1), z];
}

function sharkAt(z, a, offset = 0) {
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 21; i++) {
    const t = (lo + hi) * .5;
    if (sharkSection(t, 0)[2] < z) lo = t;
    else hi = t;
  }
  const p = sharkSection((lo + hi) * .5, a);
  return [p[0]+offset*Math.cos(a), p[1]+offset*Math.sin(a), p[2]];
}

function sharkMesh() {
  const m = shape();
  m.surface(sharkSection, 58, 50, part.sharkBody);
  // Swept first dorsal, small second dorsal, and unequal lobes on the tail.
  m.fin([[0,.12,.19,.39,.085],[0,.32,.12,.28,.063],[0,.51,.055,.162,.036],
    [0,.69,-.105,.066,.017],[0,.81,-.232,.002,.001]], true, part.sharkFin);
  m.fin([[0,.062,-1.08,.19,.033],[0,.19,-1.15,.107,.024],[0,.29,-1.27,.041,.011],
    [0,.32,-1.34,.002,.001]], true, part.sharkFin);
  m.fin([[0,0,-1.52,.136,.058],[0,.22,-1.68,.155,.043],[0,.43,-1.83,.139,.029],
    [0,.65,-2.014,.092,.018],[0,.82,-2.21,.001,.001]], true, part.sharkTail);
  m.fin([[0,-.007,-1.52,.129,.056],[0,-.18,-1.69,.129,.04],[0,-.34,-1.82,.092,.021],
    [0,-.515,-1.995,.001,.001]], true, part.sharkTail);
  m.fin([[0,-.04,-1.16,.126,.034],[0,-.15,-1.20,.09,.021],
    [0,-.223,-1.31,.002,.001]], true, part.sharkFin);

  for (const side of [-1,1]) {
    const mirrored = sections => sections.map(([x,...rest]) => [side*x,...rest]);
    m.fin(mirrored([[.17,-.11,.47,.309,.064],[.344,-.126,.34,.267,.063],
      [.54,-.168,.24,.224,.046],[.74,-.223,.025,.129,.029],
      [.91,-.293,-.219,.045,.015],[1.00,-.315,-.378,.002,.001]]), false, part.sharkFin);
    m.fin(mirrored([[.115,-.10,-.67,.181,.039],[.23,-.118,-.75,.142,.024],
      [.41,-.192,-.961,.004,.002]]), false, part.sharkFin);
    const [x,y,z] = sharkAt(1.16, side===1 ? .32 : Math.PI-.32, .005);
    m.ellipsoid(x,y,z,.023,.032,.052,part.iris);
    m.ellipsoid(x+side*.018,y,z+.011,.013,.022,.029,part.eye);

    for (let g=0; g<5; g++) {
      const front=.738-g*.075;
      const slit = [[front+.025,.34],[front,.105],[front-.012,-.15],
        [front-.003,-.375],[front+.024,-.55]];
      m.seam(slit.map(([gz,a]) => sharkAt(gz,side===1?a:Math.PI-a,.002)), .008);
    }
    const mouth = [[1.04,-.26],[1.09,-.45],[1.16,-.66],[1.24,-.89],[1.31,-1.14],[1.335,-Math.PI/2]];
    m.seam(mouth.map(([mz,a]) => sharkAt(mz,side===1?a:Math.PI-a,.002)), .009);
  }
  return m.build();
}

const shader = `
struct WildlifeVertex {
  @builtin(position) clip: vec4f,
  @location(0) world: vec3f,
  @location(1) normal: vec3f,
  @location(2) local: vec3f,
  @location(3) @interpolate(flat) material: f32,
  @location(4) @interpolate(flat) species: f32,
}

fn rollAnimal(v: vec3f, angle: f32) -> vec3f {
  let c = cos(angle);
  let s = sin(angle);
  return vec3f(c*v.x - s*v.y, s*v.x + c*v.y, v.z);
}

fn yawAnimal(v: vec3f, angle: f32) -> vec3f {
  let c = cos(angle);
  let s = sin(angle);
  return vec3f(c*v.x + s*v.z, v.y, c*v.z - s*v.x);
}

fn sharkWave(z: f32, time: f32, phase: f32) -> vec2f {
  let t = clamp((.75 - z) / 3.0, 0., 1.);
  let envelope = t*t;
  let angle = time*2.85 + z*2.8 + phase;
  let taper = select(-2.*t/3., 0., t <= 0. || t >= 1.);
  return .32 * vec2f(envelope * sin(angle), taper*sin(angle) + 2.8*envelope*cos(angle));
}

@vertex fn vsWildlife(
  @location(0) position: vec3f,
  @location(1) normal: vec3f,
  @location(4) material: f32,
  @location(2) route: vec4f,
  @location(3) motion: vec4f,
) -> WildlifeVertex {
  let species = floor(motion.w);
  let phase = fract(motion.w) * TAU;
  let time = g.cam.w;
  let azimuth = time * motion.y + motion.x;
  let bob = azimuth * 1.3 + phase;
  let center = route.xyz + vec3f(cos(azimuth)*route.w, .65*sin(bob), sin(azimuth)*route.w*.65);
  let forward = normalize(vec3f(-sin(azimuth)*route.w, .845*cos(bob),
    cos(azimuth)*route.w*.65)) * sign(motion.y);
  let right = normalize(cross(vec3f(0.,1.,0.),forward));
  let up = cross(forward,right);
  var p = position;
  var n = normal;
  var bank: f32;
  if (species < .5) {
    let a = time*1.6 + phase;
    bank = -.12*sign(motion.y) + .055*sin(a);
    let front = material > 1.5 && material < 2.5;
    let rear = material > 2.5 && material < 3.5;
    if (front || rear) {
      let side = sign(p.x);
      let pivot = vec3f(side*select(.28,.33,front), -.058, select(-.65,.34,front));
      let weight = smoothstep(.26,select(.50,.68,front),abs(p.x));
      let beat = a - abs(p.x)*.9 + select(1.3,0.,front);
      let stroke = (sin(beat) + .22*sin(beat*2.))*select(.17,.49,front)*weight*side;
      let sweep = (.13 + .30*cos(beat))*select(.32,1.,front)*weight*side;
      p = pivot + yawAnimal(rollAnimal(p-pivot,stroke),sweep);
      n = yawAnimal(rollAnimal(n,stroke),sweep);
    }
  } else {
    let wave = sharkWave(p.z,time,phase);
    p.x += wave.x;
    n = normalize(vec3f(n.x,n.y,n.z - wave.y*n.x));
    bank = -.19*sign(motion.y) + .05*sin(time*2.85 + phase);
  }
  p = rollAnimal(p,bank);
  n = rollAnimal(n,bank);
  var result: WildlifeVertex;
  let size = motion.z * select(.46,.48,species<.5);
  result.world = center + (right*p.x + up*p.y + forward*p.z)*size;
  result.clip = g.vp * vec4f(result.world,1.);
  result.normal = normalize(right*n.x + up*n.y + forward*n.z);
  result.local = position;
  result.material = material;
  result.species = species;
  return result;
}

// Scute borders follow the elongated shell and branch along paired side plates.
fn shellPattern(p: vec3f) -> vec2f {
  let x = abs(p.x);
  let z = p.z;
  let row = z*3.25 + .15 + sin(z*6.)*.085 + sin(p.x*24.+z*8.)*.027;
  let plate = abs(fract(row + .5) - .5);
  let bend = .168 + .061*plate - .032*abs(z+.12);
  let centerSeam = abs(x-bend + sin(z*31.)*.006);
  let sideRow = row + .82*(x-bend)*sin(z*2.1+1.4);
  let sideSeam = abs(fract(sideRow+.5)-.5)/3.25;
  let ridge = select(plate/3.25,sideSeam,x>bend);
  let edge = length(vec2f(x/.552,(z+.11)/.82));
  let marginals = abs(fract(atan2(x,z+.111)*3.9+.5)-.5)*.14;
  let distance = select(min(centerSeam,ridge),marginals,edge>.92);
  let border = min(distance,abs(edge-.91)*.52);
  let aa = clamp(fwidth(border),.0015,.018);
  let seam = 1.-smoothstep(.0025,.0045+aa,border);
  let plateTone = hs(floor(row+.5)*3.7 + select(0.,3.,x>bend) + select(4.,0.,p.x>0.));
  return vec2f(seam,plateTone);
}

fn turtleSurface(p: vec3f, material: f32) -> vec4f {
  let skinNoise = textureSample(tD,sR,p.xz*2.1 + vec2f(p.y*.91,p.y*1.7));
  let skinFine = textureSample(tD,sR,p.zy*7.2 + vec2f(p.x*2.1,p.x*5.4));
  let mottling = smoothstep(.27,.73,skinNoise.a*.63 + skinNoise.b*.37);
  var alb = mix(vec3f(.078,.103,.058),vec3f(.37,.32,.18),mottling);
  var q = vec2f(p.z*27. + p.y*4., p.x*23. + p.y*24.);
  q += vec2f(sin(q.y*.59+sin(q.x*.13)),sin(q.x*.52+sin(q.y*.18)))*.35;
  let footprint = max(length(dpdx(q)),length(dpdy(q)));
  let row = floor(q.y);
  q.x += fract(row*.5);
  let cell = floor(q);
  let cellColor = hs(dot(cell,vec2f(3.3,9.1)));
  let outline = abs(fract(q)-.5);
  let gap = max(outline.x, outline.y*.9 + outline.x*.23);
  let scales = smoothstep(.35,.48,gap) * (1.-smoothstep(.17,.71,footprint));
  alb *= (.82 + .24*skinFine.g) * (1. - scales*(.15+.23*cellColor));
  var relief = skinFine.b*.0012 - scales*.0016;
  let underside = smoothstep(-.075,.048,p.y);
  alb = mix(vec3f(.44,.35,.215)*(.82 + .24*skinNoise.g),alb,underside);
  let plates = shellPattern(p);
  if (material < .5) {
    let streak = .5+.5*sin(p.z*65. + sin(p.x*17.)*1.4 + skinFine.r*3.1);
    let warm = mix(vec3f(.10,.048,.019),vec3f(.40,.186,.062),
      clamp(.20+plates.y*.27+skinNoise.g*.36+streak*.09,0.,1.));
    let edge = smoothstep(.017,.045,p.y);
    let back = mix(warm,vec3f(.048,.026,.013),plates.x*.57);
    let belly = vec3f(.53,.424,.236) * (.77+.23*skinNoise.g) * (1.-plates.x*.21);
    alb = mix(belly,back,edge);
    relief = .0019*skinFine.g - .0045*plates.x*edge;
  }
  return vec4f(alb,relief);
}

fn reefSharkSurface(p: vec3f, normal: vec3f, material: f32) -> vec4f {
  let tx = textureSample(tD,sR,p.xz*1.35 + vec2f(p.y*2.,p.y*.98));
  let shoulder = smoothstep(-.105,.025,p.y + (tx.g-.5)*.053 + .02*normal.y);
  let back = mix(vec3f(.104,.137,.146),vec3f(.175,.199,.193),tx.r);
  let pale = vec3f(.48,.54,.48)*(.86+tx.g*.22);
  let fin = material > .5;
  let darkFin = max(smoothstep(.61,.79,p.y), smoothstep(.74,.98,abs(p.x)));
  let tail = smoothstep(.36,.76,abs(p.y))*smoothstep(1.69,2.15,-p.z);
  let ink = select(0.,max(darkFin*.84,tail*.87),fin);
  let alb = mix(mix(pale,back,shoulder),vec3f(.023,.032,.036),ink);
  return vec4f(alb,tx.a*.00065);
}

@fragment fn fsWildlife(i: WildlifeVertex) -> @location(0) vec4f {
  let turtle = i.species < .5;
  let geometricNormal = normalize(i.normal);
  let material = select(reefSharkSurface(i.local,geometricNormal,i.material),
    turtleSurface(i.local,i.material),turtle);
  var albedo = material.rgb;
  var gloss = select(.46,.32,turtle);
  if (i.material > 3.5 && i.material < 4.5) {
    albedo = vec3f(.0045,.007,.008);
    gloss = .86;
  } else if (i.material > 4.5 && i.material < 5.5) {
    albedo = select(vec3f(.12,.083,.039),vec3f(.28,.128,.036),turtle);
    gloss = .68;
  } else if (i.material > 5.5) {
    albedo = select(vec3f(.046,.056,.058),vec3f(.049,.031,.016),turtle);
    gloss = .16;
  }
  let dx = dpdx(i.world);
  let dy = dpdy(i.world);
  let qx = cross(dy,geometricNormal);
  let qy = cross(geometricNormal,dx);
  let det = dot(dx,qx);
  let gradient = (dpdx(material.w)*qx + dpdy(material.w)*qy) * sign(det);
  let n = normalize(geometricNormal - gradient / max(abs(det),.000015));
  let V = normalize(g.cam.xyz-i.world);
  let L = g.sun.xyz;
  let z = zone(i.world);
  let ca = caus(i.world,length(i.world-g.cam.xyz));
  let vv = vol(i.world);
  let E = sunE(i.world.y,z)*shadow4(i.world+geometricNormal*.10);
  let sky = amb(i.world,vec3f(0.,1.,0.),vv.g,z);
  let fillNormal = normalize(vec3f(n.x, .17 + abs(n.y)*.62,n.z));
  let lit = sat(dot(n,L));
  let highlight = pow(sat(dot(n,normalize(V+L))),mix(19.,98.,gloss));
  let rim = pow(1.-sat(dot(geometricNormal,V)),3.);
  var c = albedo * (E*lit*(.43 + ca*.58) + amb(i.world,fillNormal,vv.g,z)*1.04
    + side(i.world,n,1.,z)*.45);
  c += E*highlight*lit*mix(.12,.5,gloss)*(.31+ca*.62);
  c += sky*rim*select(.29,.22,turtle) * select(1.,.3,i.material>3.5);
  return fin(fog(c,i.world,z));
}
`;

export async function loadProceduralWildlife({
  device, sharedShader, sceneLayout, instanceLayout, makeBuffer, colorFormat, depthFormat, samples,
}) {
  const module = device.createShaderModule({ code: sharedShader + shader });
  const layout = device.createPipelineLayout({ bindGroupLayouts: [sceneLayout] });
  const pipeline = await device.createRenderPipelineAsync({
    layout,
    vertex: {
      module, entryPoint: "vsWildlife",
      buffers: [{
        arrayStride: 28,
        attributes: [
          { shaderLocation: 0, offset: 0, format: "float32x3" },
          { shaderLocation: 1, offset: 12, format: "float32x3" },
          { shaderLocation: 4, offset: 24, format: "float32" },
        ],
      }, instanceLayout],
    },
    fragment: { module, entryPoint: "fsWildlife", targets: [{ format: colorFormat }] },
    depthStencil: { format: depthFormat, depthWriteEnabled: true, depthCompare: "greater" },
    multisample: { count: samples },
  });

  const resources = [];
  device.pushErrorScope("out-of-memory");
  device.pushErrorScope("validation");
  let failure;
  let meshes;
  try {
    meshes = [turtleMesh(), sharkMesh()].map(({ vertices, indices }) => {
      const vertex = makeBuffer(vertices, GPUBufferUsage.VERTEX);
      resources.push(vertex);
      const index = makeBuffer(indices, GPUBufferUsage.INDEX);
      resources.push(index);
      return { vertex, index, count: indices.length };
    });
  } catch (error) {
    failure = error;
  }
  const checks = await Promise.all([device.popErrorScope(), device.popErrorScope()]);
  failure ??= checks.find(Boolean);
  if (failure) {
    for (const resource of resources) resource.destroy();
    throw failure;
  }
  return {
    draw(pass, routes, counts) {
      pass.setPipeline(pipeline);
      for (let species = 0; species < meshes.length; species++) {
        if (!counts[species]) continue;
        const { vertex, index, count } = meshes[species];
        pass.setVertexBuffer(0, vertex);
        pass.setVertexBuffer(1, routes[species]);
        pass.setIndexBuffer(index, "uint32");
        pass.drawIndexed(count, counts[species]);
      }
    },
  };
}
