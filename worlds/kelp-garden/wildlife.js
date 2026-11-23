const TAU = 2 * Math.PI;

const part = {
  shell: 0, skin: 1, foreflipper: 2, hindflipper: 3, eye: 4, iris: 5, groove: 6, plastron: 7,
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

  function seam(points, radius, material = part.groove) {
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
    }, 18, 8, material);
  }

  return {
    surface, fin, ellipsoid, seam,
    build: () => ({ vertices: new Float32Array(vertices), indices: new Uint32Array(indices) }),
  };
}

function turtleMesh() {
  const m = shape();
  // These sections run from the tapered rear to the wide shoulders. The
  // marginal plates turn out into a lip before meeting the recessed belly.
  const shell = [
    [-.99,.007,.018],[-.90,.20,.094],[-.72,.36,.18],[-.47,.49,.245],
    [-.16,.574,.29],[.13,.586,.30],[.38,.535,.26],[.55,.433,.192],
    [.66,.265,.112],[.69,.008,.035],
  ];
  m.surface((t, a) => {
    const [z, width, height] = interpolate(shell, t*(shell.length-1));
    const rise = Math.sin(a);
    const rim = Math.exp(-((rise/.14)**2));
    const keel = Math.exp(-((Math.cos(a)/.19)**2));
    const x = width*Math.cos(a)*(1+.037*rim);
    const y = .025 + (rise>=0 ? height*rise*(1+.05*keel) : .145*rise*width/.59) - .009*rim;
    const neckNotch = .057*Math.exp(-((x/.13)**2))*Math.max(0,t*6-5);
    return [x, y, z-neckNotch];
  }, 56, 64, part.shell);

  // The ventral shield is narrower than the carapace. Its two bridges
  // leave space for the soft shoulder and hip pockets on either side.
  const plastron = [
    [-.87,.012,.017],[-.78,.155,.042],[-.60,.254,.062],[-.43,.350,.074],
    [-.20,.439,.075],[.11,.448,.076],[.32,.394,.068],[.47,.279,.060],
    [.57,.175,.046],[.61,.018,.018],
  ];
  m.surface((t,a)=>{
    const [z,w,h]=interpolate(plastron,t*(plastron.length-1));
    return [w*Math.cos(a),-.065+h*Math.sin(a),z];
  },38,40,part.plastron);

  // Neck widens into the bony cheeks. The upper bill turns down over the
  // small lower jaw. Angled cross-sections flatten the crown and jaw sides.
  const head = [
    [.37,-.034,.17,.13],[.56,-.025,.153,.122],[.68,-.006,.136,.12],
    [.77,.030,.177,.15],[.88,.049,.200,.158],[.99,.048,.188,.139],
    [1.085,.026,.144,.105],[1.155,.006,.092,.073],[1.198,-.013,.044,.048],
    [1.212,-.040,.004,.009],
  ];
  const skull = (t,a) => {
    const [z,y,w,h] = interpolate(head,t*(head.length-1));
    const s = Math.sin(a), c=Math.cos(a);
    return [w*Math.sign(c)*Math.pow(Math.abs(c),.79),
      y+h*Math.sign(s)*Math.pow(Math.abs(s),.84),z];
  };
  m.surface(skull,42,40,part.skin);
  // A separate mandible and throat make the beak overhang readable in profile.
  const jaw = [[.60,-.056,.133,.085],[.75,-.055,.151,.100],
    [.87,-.058,.171,.101],[.98,-.064,.161,.082],[1.08,-.054,.125,.058],
    [1.155,-.049,.075,.036],[1.189,-.048,.018,.018],[1.195,-.045,.003,.005]];
  m.surface((t,a)=>{
    const [z,y,w,h]=interpolate(jaw,t*(jaw.length-1));
    return [w*Math.cos(a),y+h*Math.sin(a),z];
  },32,30,part.skin);
  m.ellipsoid(0,-.074,-.91,.063,.046,.145,part.skin);

  const at = (z, angle, side, lift=0) => {
    let lo=0, hi=1;
    for (let i=0;i<18;i++) {
      const mid=(lo+hi)/2;
      if (skull(mid,0)[2]<z) lo=mid; else hi=mid;
    }
    const [x,y] = skull((lo+hi)/2,angle);
    return [side*(x+lift*Math.cos(angle)), y+lift*Math.sin(angle),z];
  };
  for (const side of [-1,1]) {
    const mirror = sections => sections.map(([x,...section]) => [side*x,...section]);
    // Leading edge is thick at the shoulder. The narrow trailing edge
    // widens into a swept paddle before the rounded, downturned tip.
    const paddle = [
      [.29,-.058,.375,.096,.062],[.44,-.059,.430,.130,.068],
      [.59,-.071,.463,.144,.054],[.76,-.092,.443,.167,.042],
      [.95,-.11,.352,.159,.032],[1.13,-.141,.203,.131,.026],
      [1.25,-.165,.047,.096,.019],[1.31,-.18,-.077,.050,.012],
      [1.324,-.189,-.135,.003,.002],
    ];
    m.surface((t,a)=>{
      const [span,y,z,chord,h]=interpolate(paddle,t*(paddle.length-1));
      const chordPos=Math.cos(a);
      return [side*span, y+h*Math.sin(a)*(.83+.30*chordPos)+.017*t*chordPos,
        z+chord*chordPos];
    },34,20,part.foreflipper);
    m.fin(mirror([[.25,-.075,-.56,.094,.043],[.37,-.083,-.68,.132,.047],
      [.48,-.109,-.81,.151,.037],[.54,-.133,-.933,.129,.028],
      [.565,-.139,-1.018,.064,.013],[.566,-.141,-1.056,.004,.002]]),false,part.hindflipper);

    const [ex,ey,ez]=at(.960,.38,side);
    m.ellipsoid(ex,ey,ez,.019,.030,.039,part.iris);
    m.ellipsoid(ex+side*.013,ey+.002,ez+.002,.008,.021,.024,part.eye);
    const brow=[[.915,.40],[.935,.56],[.960,.59],[.982,.51],[.996,.37]];
    m.seam(brow.map(([z,a])=>at(z,a,side,.004)),.010,part.skin);
    const [nx,ny,nz]=at(1.151,.72,side,.002);
    m.ellipsoid(nx,ny,nz,.010,.006,.013,part.groove);
    const mouth=[[.892,-.38],[.955,-.48],[1.018,-.41],[1.091,-.34],
      [1.15,-.42],[1.184,-.74],[1.198,-1.12],[1.201,-Math.PI/2]];
    m.seam(mouth.map(([z,a])=>at(z,a,side,.002)),.0055);
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
  @location(5) restUp: f32,
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
    let cycle = time*(1.92+.17*sin(phase))+phase;
    let effort = smoothstep(-.54,.40,sin(time*.49+phase));
    let turn = sign(motion.y);
    bank = .075*turn + .025*effort*sin(cycle);
    let front = material > 1.5 && material < 2.5;
    let rear = material > 2.5 && material < 3.5;
    if (front || rear) {
      let side = sign(p.x);
      let pivot = vec3f(side*select(.255,.315,front), -.06, select(-.58,.39,front));
      let span = abs(position.x)-abs(pivot.x);
      let flex = smoothstep(0.,select(.22,.45,front),span);
      let beat = cycle-.58*span + side*.048*turn;
      let lift = select(.07*sin(cycle*.52+side),.12+effort*(.75*sin(beat)+.12*sin(2.*beat)),front);
      let rake = select(.07*sin(cycle*.46+phase),.12+effort*.27*cos(beat),front);
      let pitch = select(.15*turn,.08+effort*.47*cos(beat-.28),front)*flex;
      // Feather the blade around its own span. The shoulder stays buried
      // while the distal paddle changes its angle of attack on recovery.
      let cs=cos(pitch);
      let sn=sin(pitch);
      let axisZ=select(-.58-.68*span,.39+.16*span-.63*span*span,front);
      let axis=vec3f(p.x, -.06-.13*span,axisZ);
      let q=p-axis;
      p=axis+vec3f(q.x,cs*q.y-sn*q.z,sn*q.y+cs*q.z);
      n=vec3f(n.x,cs*n.y-sn*n.z,sn*n.y+cs*n.z);
      p=pivot+yawAnimal(rollAnimal(p-pivot,lift*side*flex),rake*side*flex);
      n=yawAnimal(rollAnimal(n,lift*side*flex),rake*side*flex);
    }
  } else {
    let wave = sharkWave(p.z,time,phase);
    p.x += wave.x;
    n = normalize(vec3f(n.x,n.y,n.z - wave.y*n.x));
    bank = .14*sign(motion.y) + .05*sin(time*2.85 + phase);
  }
  p = rollAnimal(p,bank);
  n = rollAnimal(n,bank);
  var result: WildlifeVertex;
  let size = motion.z * select(.46,.48,species<.5);
  result.world = center + (right*p.x + up*p.y + forward*p.z)*size;
  result.clip = g.vp * vec4f(result.world,1.);
  result.normal = normalize(right*n.x + up*n.y + forward*n.z);
  result.local = position;
  result.restUp = normal.y;
  result.material = material;
  result.species = species;
  return result;
}

// The vertebral scutes interlock with two staggered costal rows. Marginal
// plates wrap around the lip. Work in shell space so growth lines follow
// each plate as the animal rolls.
fn carapace(p: vec3f, grain: vec4f) -> vec4f {
  let v = (p.z+.15)/.84;
  let u = p.x/(.592+.095*clamp(v,-1.,1.));
  let radial = length(vec2f(u,v));
  let width = sqrt(max(.022,1.-v*v));
  let across = abs(u)/width;
  let row = 2.51*v+.45+.065*sin(4.5*v);
  let zig = 1.-2.*abs(fract(row)-.5);
  let boundary = .245+.205*zig;
  let centre = across<boundary;
  let angle = atan2(abs(u)+.0001,v);
  let sideRow = row+.48 + (.23-v*.24)*(across-.45);
  let transverse = select(abs(fract(sideRow+.5)-.5),abs(fract(row+.5)-.5),centre)*.31;
  let seam = min(transverse,abs(across-boundary)*width*.45);
  let edge = .892+.014*sin(angle*9.);
  let marginal = radial>edge;
  let marginRow = angle*3.79+.13;
  let gap = select(seam,abs(fract(marginRow+.5)-.5)*.165,marginal);
  let d = min(gap,abs(radial-edge)*.64);
  let aa = clamp(fwidth(d),.0008,.014);
  let line = 1.-smoothstep(.001,.0033+aa,d);
  let panelId = select(select(floor(sideRow+.5)+10.+select(5.,0.,u<0.),floor(row+.5),centre),floor(marginRow+.5)+28.,marginal);
  let variation = hs(panelId+11.);
  let age = d*105.+grain.r*.55;
  let rings = (.5+.5*cos(age))*exp(-11.*d)*(1.-smoothstep(.4,2.5,fwidth(age)));
  let ray = atan2(v+.22,abs(u)+.15);
  let amber = .5+.5*sin(ray*38.+v*7.+grain.b*2.8+sin(ray*15.));
  let amberWash = smoothstep(.07,.94,.28*grain.a+.38*variation+.16*amber+.18*rings);
  var color = mix(vec3f(.105,.044,.023),vec3f(.385,.177,.069),amberWash);
  color *= .90+.13*rings+.10*grain.g;
  color = mix(color,vec3f(.11,.055,.027),line*.80);
  let wear = exp(-120.*abs(d-.008))*(1.-line);
  color += vec3f(.052,.029,.010)*wear;
  return vec4f(color,.00055*grain.b+.0014*rings-.0034*line);
}

// Scale islands with uneven, cream-coloured borders. Using the two nearest
// centres keeps adjacent plates joined, even around the cheek and the wrists.
fn scaleIslands(uv: vec2f) -> vec2f {
  let grid = floor(uv);
  let f = fract(uv);
  var near = 10.;
  var next = 10.;
  var id = 0.;
  for (var y=-1;y<=1;y++) {
    for (var x=-1;x<=1;x++) {
      let k=vec2f(f32(x),f32(y));
      let h=dot(grid+k,vec2f(17.31,49.73));
      let offset=vec2f(hs(h+.37),hs(h+5.19));
      let delta=k+.20+.60*offset-f;
      let dd=dot(delta,delta);
      if (dd<near) { next=near; near=dd; id=offset.x; }
      else { next=min(next,dd); }
    }
  }
  let border=sqrt(next)-sqrt(near);
  let aa=clamp(fwidth(border),.012,.14);
  return vec2f(smoothstep(.012,.055+aa,border),id);
}

fn turtleSurface(p: vec3f, material: f32, restUp: f32) -> vec4f {
  let grain=textureSample(tD,sR,p.xz*1.65+vec2f(p.y*1.3,p.y*2.3));
  // Angular projection wraps a continuous scale field around the head.
  let faceAngle=atan2(p.y-.04,max(.0001,abs(p.x)));
  let faceUV=vec2f(p.z*14.,faceAngle*2.7);
  let paddleUV=vec2f(abs(p.x)*16.+p.z*3.,p.z*18.+p.y*1.5);
  let isPaddle=material>1.5 && material<3.5;
  let scales=scaleIslands(select(faceUV,paddleUV,isPaddle));
  let back=carapace(p,grain);
  let middle=abs(p.x+.012*sin(4.*p.z));
  let pair=abs(fract((p.z+.73)*3.45+.20*sin(middle*5.)+.5)-.5)*.29;
  let seam=min(middle,pair);
  let line=1.-smoothstep(.002,.006+clamp(fwidth(seam),.001,.015),seam);
  if (material<.5 || material>6.5) {
    let belly=mix(vec3f(.51,.345,.147),vec3f(.66,.525,.295),grain.g)*(1.-line*.21);
    if (material>6.5) { return vec4f(belly,.0007*grain.g-line*.0014); }
    let lip=smoothstep(-.003,.027,p.y);
    let bridge = mix(vec3f(.265,.183,.104),vec3f(.42,.31,.19),grain.g);
    return mix(vec4f(bridge,.00055*grain.g),back,lip);
  }
  let rust=mix(vec3f(.17,.064,.024),vec3f(.36,.164,.062),scales.y*.56+grain.a*.44);
  let honey=vec3f(.46,.310,.157)*(.88+.20*grain.g);
  let pattern=mix(honey,rust,scales.x)*(.84+.26*grain.b);
  let chin=select(p.y,p.y+.11+.065*abs(p.x),isPaddle);
  var mask=smoothstep(-.06,.03,chin);
  if (isPaddle) { mask=smoothstep(-.55,.45,restUp); }
  if (!isPaddle) {
    // Soft neck skin and the horn at the tip of the beak carry fewer scales.
    mask*=smoothstep(.65,.81,p.z)*(1.-smoothstep(1.075,1.165,p.z));
  }
  let neutral=mix(vec3f(.37,.263,.135),vec3f(.56,.432,.265),grain.g);
  return vec4f(mix(neutral,pattern,mask),mix(.00045*grain.g,.0011*scales.x,mask));
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
    turtleSurface(i.local,i.material,i.restUp),turtle);
  var albedo = material.rgb;
  var gloss = select(.46,.21,turtle);
  if (i.material > 3.5 && i.material < 4.5) {
    albedo = vec3f(.0045,.007,.008);
    gloss = .86;
  } else if (i.material > 4.5 && i.material < 5.5) {
    albedo = select(vec3f(.12,.083,.039),vec3f(.19,.111,.042),turtle);
    gloss = .68;
  } else if (i.material > 5.5 && i.material < 6.5) {
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
  c += sky*rim*select(.23,.11,turtle) * select(1.,.3,i.material>3.5);
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
