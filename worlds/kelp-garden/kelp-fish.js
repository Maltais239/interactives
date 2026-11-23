// Lengths are metres. Each longitudinal station specifies z, centre height,
// half-width and half-height as fractions of the species' total length.
const species = [
  {
    key: "garibaldi",
    name: "Garibaldi",
    length: 0.32,
    depth: 0.216,
    eye: 0.345,
    tempo: 2.15,
    body: [
      [-0.34, 0.015, 0.012, 0.036],
      [-0.27, 0.012, 0.034, 0.06],
      [-0.18, 0.018, 0.083, 0.14],
      [-0.02, 0.025, 0.126, 0.209],
      [0.16, 0.03, 0.12, 0.216],
      [0.31, 0.026, 0.09, 0.175],
      [0.39, 0.016, 0.066, 0.13],
      [0.46, -0.01, 0.041, 0.066],
      [0.49, -0.017, 0.004, 0.009],
    ],
    dorsal: [
      [-0.29, 0.065],
      [-0.26, 0.16],
      [-0.19, 0.235],
      [-0.11, 0.25],
      [0.04, 0.28],
      [0.21, 0.25],
      [0.28, 0.18],
    ],
    tail: [
      [-0.499, 0.12],
      [-0.493, 0.09],
      [-0.472, 0.02],
      [-0.475, -0.053],
      [-0.498, -0.114],
    ],
    fin: [0.6, 0.18, 0.018],
  },
  {
    key: "kelp-bass",
    name: "Kelp bass",
    length: 0.58,
    depth: 0.143,
    eye: 0.323,
    tempo: 1.7,
    body: [
      [-0.36, 0.002, 0.012, 0.036],
      [-0.27, 0.002, 0.042, 0.052],
      [-0.16, 0.018, 0.071, 0.105],
      [0.01, 0.016, 0.091, 0.143],
      [0.17, 0.017, 0.087, 0.146],
      [0.3, 0.004, 0.07, 0.116],
      [0.39, -0.009, 0.062, 0.085],
      [0.46, -0.023, 0.042, 0.048],
      [0.5, -0.027, 0.006, 0.017],
    ],
    dorsal: [
      [-0.31, 0.077],
      [-0.28, 0.16],
      [-0.21, 0.19],
      [-0.09, 0.17],
      [-0.055, 0.122],
      [0.015, 0.201],
      [0.14, 0.217],
      [0.205, 0.177],
    ],
    tail: [
      [-0.5, 0.102],
      [-0.49, 0.07],
      [-0.455, 0.01],
      [-0.48, -0.064],
      [-0.5, -0.101],
    ],
    fin: [0.19, 0.215, 0.085],
  },
  {
    key: "sardine",
    name: "Pacific sardine",
    length: 0.26,
    depth: 0.083,
    eye: 0.342,
    tempo: 3.05,
    body: [
      [-0.34, 0.002, 0.01, 0.015],
      [-0.26, 0.004, 0.022, 0.03],
      [-0.12, 0.005, 0.042, 0.06],
      [0.05, 0.005, 0.055, 0.082],
      [0.2, 0.001, 0.054, 0.079],
      [0.33, -0.003, 0.037, 0.063],
      [0.415, -0.008, 0.025, 0.04],
      [0.495, -0.011, 0.003, 0.005],
    ],
    dorsal: [
      [-0.15, 0.06],
      [-0.108, 0.092],
      [-0.014, 0.15],
      [0.021, 0.125],
      [0.046, 0.084],
    ],
    tail: [
      [-0.51, 0.117],
      [-0.45, 0.07],
      [-0.383, 0.001],
      [-0.448, -0.062],
      [-0.51, -0.109],
    ],
    fin: [0.12, 0.22, 0.24],
  },
];
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const saturate = (x) => Math.min(1, Math.max(0, x));
function smooth(a, b, x) {
  const t = saturate((x - a) / (b - a));
  return t * t * (3 - 2 * t);
}
function sample(points, t) {
  const n = points.length - 1,
    at = saturate(t) * n,
    i = Math.min(n - 1, Math.floor(at)),
    f = at - i;
  const a = points[Math.max(i - 1, 0)],
    b = points[i],
    c = points[i + 1],
    d = points[Math.min(n, i + 2)];
  return b.map(
    (v, k) =>
      0.5 *
      (2 * v +
        f * (-a[k] + c[k] + f * (2 * a[k] - 5 * v + 4 * c[k] - d[k] + f * (-a[k] + 3 * v - 3 * c[k] + d[k])))),
  );
}
function pigment(key, z, y, angle) {
  const up = Math.sin(angle),
    flank = Math.abs(Math.cos(angle));
  const stipple = Math.sin(150 * z + 3 * Math.sin(29 * y)) * Math.cos(133 * y + Math.sin(z * 80));
  let rgb;
  if (key === "garibaldi") {
    rgb = mix([0.99, 0.23, 0.016], [0.64, 0.12, 0.012], smooth(-0.3, 1, up));
    rgb = mix(rgb, [0.95, 0.38, 0.045], smooth(-0.3, -1, up) * 0.63);
  } else if (key === "kelp-bass") {
    rgb = mix([0.62, 0.62, 0.41], [0.128, 0.167, 0.061], smooth(-0.82, 0.52, up));
    const blotch = Math.sin(z * 49 + 3.0 * Math.sin(y * 43)) + Math.cos(44 * y - 2 * Math.sin(z * 46));
    rgb = mix(
      rgb,
      [0.7, 0.67, 0.46],
      smooth(0.45, 1.18, blotch) * smooth(-0.25, 0.4, up) * smooth(0.35, 0.12, z) * 0.83,
    );
  } else {
    rgb = mix([0.75, 0.82, 0.8], [0.055, 0.155, 0.175], smooth(-0.22, 0.66, up));
    const row = Math.round((z + 0.2) / 0.067);
    const spot = Math.hypot(z + 0.2 - row * 0.067, (y - 0.023 - 0.005 * Math.sin(row)) * 1.35);
    rgb = mix(
      rgb,
      [0.033, 0.059, 0.06],
      (1 - smooth(0.006, 0.012, spot)) * flank * (row >= 0 && row <= 6 ? 1 : 0),
    );
  }
  // Arc of the gill cover and a short mouth crease under the projecting snout.
  const gill =
    (1 - smooth(0.002, 0.009, Math.abs(z - (0.235 + 0.04 * (y / 0.16) ** 2)))) *
    smooth(0.11, 0.025, Math.abs(y)) *
    flank;
  const lip =
    (1 - smooth(0.002, 0.008, Math.abs(y + 0.029 + 0.1 * (z - 0.39)))) * smooth(0.375, 0.435, z) * flank;
  return rgb.map((v) => v * (1 - 0.32 * gill - 0.4 * lip + 0.034 * stipple * flank));
}
function buildFish(spec, index, detailed) {
  const vertices = [],
    indices = [],
    L = spec.length;
  // A parametrized patch carries both the body surface and each face of a fin.
  function patch(rows, cols, point, color, facing, gloss = 0.5) {
    const start = vertices.length / 10;
    for (let i = 0; i <= rows; i++)
      for (let j = 0; j <= cols; j++) {
        const u = i / rows,
          v = j / cols,
          p = point(u, v);
        const a = point(Math.min(1, u + 0.001), v),
          b = point(Math.max(0, u - 0.001), v);
        const c = point(u, Math.min(1, v + 0.001)),
          d = point(u, Math.max(0, v - 0.001));
        const x = a[0] - b[0],
          y = a[1] - b[1],
          z = a[2] - b[2],
          h = c[0] - d[0],
          k = c[1] - d[1],
          m = c[2] - d[2];
        let nx = y * m - z * k,
          ny = z * h - x * m,
          nz = x * k - y * h;
        const dir = facing(u, v, p),
          len = Math.hypot(nx, ny, nz) || 1;
        const sign = nx * dir[0] + ny * dir[1] + nz * dir[2] < 0 ? -1 : 1;
        vertices.push(
          p[0] * L,
          p[1] * L,
          p[2] * L,
          (nx * sign) / len,
          (ny * sign) / len,
          (nz * sign) / len,
          ...color(u, v, p),
          gloss,
        );
        if (i < rows && j < cols) {
          const n = start + i * (cols + 1) + j,
            next = n + cols + 1;
          indices.push(n, next, n + 1, n + 1, next, next + 1);
        }
      }
  }
  function body(u, v) {
    const [z, cy, w, h] = sample(spec.body, u),
      a = v * 2 * Math.PI;
    return [Math.max(0.002, w) * Math.cos(a), cy + Math.max(0.003, h) * Math.sin(a), z];
  }
  const fine = detailed && spec.key !== "sardine";
  patch(
    fine ? 48 : 34,
    fine ? 36 : 24,
    body,
    (u, v, p) => pigment(spec.key, p[2], p[1], v * 2 * Math.PI),
    (u, v) => [Math.cos(v * 2 * Math.PI), Math.sin(v * 2 * Math.PI), 0],
  );
  function blade(base, edge, normal, rays, gloss = 0.36) {
    for (const side of [-1, 1]) {
      const point = (u, v) => {
        const a = base(u),
          b = edge(u);
        const width = 0.0036 * Math.sin(Math.PI * v) * Math.sin(Math.PI * u) * side;
        return a.map((n, k) => n + (b[k] - n) * v + width * normal[k]);
      };
      patch(
        rays * (fine ? 3 : 2),
        fine ? 4 : 2,
        point,
        (u, v) => spec.fin.map((x) => x * (1.12 - 0.22 * v + 0.14 * Math.cos(u * Math.PI * 2 * rays) * v)),
        () => normal.map((x) => x * side),
        gloss,
      );
    }
  }
  const isBass = spec.key === "kelp-bass",
    thin = spec.key === "sardine";
  const dorsal = spec.dorsal;
  blade(
    (u) => {
      const [z, h] = sample(dorsal, u);
      return [0, h * 0.42, z];
    },
    (u) => {
      const [z, h] = sample(dorsal, u);
      return [0, h + (isBass ? 0.018 : 0.008) * Math.sin(u * Math.PI * 14) ** 2, z];
    },
    [1, 0, 0],
    15,
  );
  blade(
    (u) => [0, (u - 0.5) * 0.052, -0.293],
    (u) => {
      const [z, y] = sample(spec.tail, 1 - u);
      return [0, y, z];
    },
    [1, 0, 0],
    12,
  );
  blade(
    (u) => [0, -spec.depth * 0.38, -0.28 + u * 0.23],
    (u) => [0, -spec.depth * (0.46 + 0.56 * Math.sin(Math.PI * u)), -0.32 + u * 0.25],
    [1, 0, 0],
    8,
  );
  for (const side of [-1, 1]) {
    const width = thin ? 0.051 : isBass ? 0.085 : 0.119;
    blade(
      (u) => [side * width, -0.015 - u * 0.024, 0.21 - u * 0.05],
      (u) => [
        side * (width + 0.052 * Math.sin(Math.PI * u)),
        -0.026 - 0.053 * Math.sin(Math.PI * u),
        0.16 - 0.16 * Math.sin(u * Math.PI * 0.86),
      ],
      [side, 0, 0],
      7,
      0.44,
    );
    blade(
      (u) => [side * width * 0.38, -spec.depth * 0.6, 0.12 - 0.039 * u],
      (u) => [
        side * (width * 0.57 + 0.016 * Math.sin(Math.PI * u)),
        -spec.depth * (0.7 + 0.43 * Math.sin(Math.PI * u)),
        0.108 - 0.098 * u,
      ],
      [0, -1, 0],
      5,
    );
    const eyeU = spec.body.findIndex((row) => row[0] >= spec.eye);
    const fraction = (spec.eye - spec.body[eyeU - 1][0]) / (spec.body[eyeU][0] - spec.body[eyeU - 1][0]);
    const [, cy, w, h] = sample(spec.body, (eyeU - 1 + fraction) / (spec.body.length - 1));
    const ey = cy + h * 0.28,
      ex = side * w * 0.95,
      rad = thin ? 0.021 : isBass ? 0.024 : 0.027;
    const eye = (u, v) => {
      const t = 0.002 + u * (Math.PI - 0.004),
        a = v * Math.PI * 2;
      return [
        ex + side * rad * 0.48 * Math.cos(t),
        ey + rad * Math.sin(t) * Math.sin(a),
        spec.eye + rad * Math.sin(t) * Math.cos(a),
      ];
    };
    patch(
      fine ? 10 : 7,
      fine ? 15 : 10,
      eye,
      (u) => mix([0.004, 0.007, 0.007], thin ? [0.49, 0.57, 0.5] : [0.37, 0.26, 0.084], smooth(0.19, 0.29, u)),
      (u, v, p) => [p[0] - ex, p[1] - ey, p[2] - spec.eye],
      0.91,
    );
  }
  const wave = [0, 0.45, 0.9, 1.5, 2.4, 4].flatMap((s) => [
    s,
    spec.tempo * (0.52 + 0.32 * s),
    0.075 + 0.027 * s,
    0.96 + 0.03 * s,
  ]);
  return {
    vertices: new Float32Array(vertices),
    indices: new Uint32Array(indices),
    motion: new Float32Array([L, 1.65, 0.45, -(index + 1), ...wave]),
  };
}
export function buildKelpFish(detailed) {
  return species.map((spec, i) => buildFish(spec, i, detailed));
}
export function kelpFishSchools() {
  const garibaldi = new Float32Array([
    10, -8, -4, 3.4, 0.8, 0.085, 1.2, 0.14, -12, -15, 0, 3.0, 2.4, -0.095, 1.12, 0.49, 20, -13, 8, 3.8, 4.1,
    0.079, 0.95, 0.71, -8, -17, -15, 4.2, 3.4, 0.073, 1.08, 0.38,
  ]);
  const bass = new Float32Array([
    8, -12, 2, 6, 0.5, 0.077, 1.02, 0.34, 18, -15, -10, 7, 2.3, -0.071, 0.97, 0.57, -6, -14, 8, 5.5, 1.8, 0.083,
    1.19, 0.81, -18, -19, -8, 8, 4.6, -0.066, 1.05, 0.65, 27, -19, 3, 6.4, 3.5, 0.075, 0.89, 0.42,
  ]);
  const sardines = [];
  for (let i = 0; i < 24; i++) {
    const row = Math.floor(i / 4),
      a = i * 2.39996;
    sardines.push(
      11 + 0.21 * Math.sin(a),
      -8.7 + 0.25 * Math.sin(a * 1.37),
      2 + 0.18 * Math.cos(a),
      6.6 + 0.29 * Math.cos(a),
      0.35 + row * 0.065 + (i % 4) * 0.018,
      0.105,
      0.88 + 0.17 * (0.5 + 0.5 * Math.sin(i * 11)),
      0.3 + 0.065 * Math.sin(a),
    );
  }
  return [garibaldi, bass, new Float32Array(sardines)].map((data, i) => ({
    data,
    key: species[i].key,
    name: species[i].name,
    school: i === 2,
    clearance: species[i].length * 0.75,
  }));
}
