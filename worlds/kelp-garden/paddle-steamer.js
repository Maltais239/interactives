// The Alder. Length runs along X, the paddle shaft runs along Z, and Y is up.
export function buildSteamer(Mesh) {
  const iron = new Mesh(),
    wood = new Mesh(),
    brass = new Mesh();
  const up = () => [0, 1, 0];
  const width = (x) =>
    3.35 *
    Math.pow(
      Math.max(0.003, 1 - Math.pow(Math.abs(x / 13), x < 0 ? 4.8 : 2.5)),
      0.6,
    );
  const sheer = (x) => 3.65 + (x > 0 ? 1.15 : 0.42) * (x / 13) ** 4;
  const hull = (x, level, side) => [
    x,
    0.32 + level * (sheer(x) - 0.32),
    side * width(x) * (0.14 + 0.86 * Math.sin((level * Math.PI) / 2) ** 0.8),
  ];
  function plank(points, breadth, thickness) {
    wood.sweep(points, breadth, thickness, up);
  }
  function pipe(mesh, path, radius, facets = 10) {
    mesh.tube(path, radius, facets, true, () => 0.87);
  }
  function ring(mesh, center, radius, rod, axis, start = 0, end = Math.PI * 2) {
    const steps = Math.ceil((end - start) * radius * 2.7) + 5;
    const path = Array.from({ length: steps + 1 }, (_, n) => {
      const a = start + ((end - start) * n) / steps;
      const du = radius * Math.cos(a),
        dv = radius * Math.sin(a);
      const [x, y, z] = center;
      return axis === "z" ? [x + du, y + dv, z] : [x, y + du, z + dv];
    });
    pipe(mesh, path, rod, 7);
  }
  // Full-width breaches beneath the surviving quarterdeck. Low floors and the
  // remaining knees keep the open passage visually connected to the hull.
  const spine = [];
  for (let x = -13; x <= 13; x++)
    spine.push([x, 0.38 + (x / 13) ** 6 * 0.9, 0]);
  plank(spine, 0.52, 0.53);
  for (let x = -12.4; x <= 12.5; x += 1.18) {
    const limit = x > -8.8 && x < -3.1 ? 0.2 : 1;
    const path = [];
    for (let n = -7; n <= 7; n++)
      path.push(hull(x, Math.abs(n / 7) * limit, Math.sign(n)));
    iron.sweep(path, 0.17, 0.21, () => [1, 0, 0]);
  }
  for (const side of [-1, 1]) {
    for (let row = 0; row < 9; row++) {
      // Staggered ends leave recognizable broken planks at the openings.
      const gapStart = -8.7 + 0.38 * Math.sin(row * 1.73 + side);
      const gapEnd = -3.1 + 0.52 * Math.sin(row * 2.1);
      const intervals =
        row < 2
          ? [[-12.9, 12.95]]
          : [
              [-12.9, gapStart],
              [gapEnd, 12.95],
            ];
      for (const [a, b] of intervals) {
        let prev;
        const count = Math.ceil((b - a) / 0.8);
        for (let n = 0; n <= count; n++) {
          const x = a + ((b - a) * n) / count;
          const low = hull(x, (row + 0.04) / 9, side);
          const high = hull(x, (row + 0.96) / 9, side);
          const pair = [wood.v(...low), wood.v(...high)];
          if (prev) {
            if (side > 0) wood.quad(prev[0], pair[0], pair[1], prev[1]);
            else wood.quad(prev[0], prev[1], pair[1], pair[0]);
          }
          prev = pair;
        }
      }
    }
    // A short aft deck and a few surviving forward rails.
    plank(
      [
        [-11.8, 3.94, side * 2.46],
        [-8.6, 3.82, side * 3.0],
        [-3, 3.72, side * 3.1],
      ],
      0.28,
      0.28,
    );
    const rail = [];
    for (let x = 5.4; x < 13; x += 0.6) rail.push(hull(x, 1, side));
    plank(rail, 0.25, 0.24);
  }
  for (let x = -11.75; x <= -3.25; x += 0.42) {
    const w = width(x) - 0.18,
      board = Math.round((x + 11.75) / 0.42);
    // Broken ends step back from the deck edge in two patches.
    const cut = board >= 12 && board <= 15 ? 0.62 + (board % 3) * 0.26 : 0;
    const far = board < 3 ? w * 0.57 : w;
    plank(
      [
        [x, sheer(x), -far],
        [x, sheer(x) + 0.1, 0],
        [x + 0.035 * Math.sin(board), sheer(x) - cut * 0.09, w - cut],
      ],
      0.395,
      0.16,
    );
  }
  // The aft deckhouse has lost its roof. Three window bays and the ragged
  // remnants of its siding give the upper works a human scale.
  const posts = [-11.0, -9.38, -7.76, -6.14];
  for (const [i, x] of posts.entries()) {
    plank(
      [
        [x, 3.87, -1.91],
        [x - 0.04, 4.82, -1.91],
        [x - 0.1, 6.02 - i * 0.07, -1.98],
      ],
      0.16,
      0.17,
    );
  }
  plank(
    [
      [-11.2, 6.05, -1.98],
      [-9.4, 6.02, -1.98],
      [-7.85, 5.93, -1.98],
      [-6.14, 5.82, -1.98],
      [-5.75, 5.73, -2.02],
    ],
    0.24,
    0.17,
  );
  plank(
    [
      [-11.15, 4.73, -1.94],
      [-8.27, 4.7, -1.94],
      [-5.99, 4.65, -1.97],
    ],
    0.2,
    0.14,
  );
  for (let i = 0; i < 4; i++) {
    const h = 4.05 + i * 0.18;
    plank(
      [
        [-11.0, h, -1.92],
        [-8.4, h - 0.03, -1.92],
        [-6.08 - i * 0.22, h - 0.04, -1.95],
      ],
      0.12,
      0.16,
    );
  }
  for (const z of [-0.52, 0.94]) {
    plank(
      [
        [-11, 3.9, z],
        [-11.04, 4.82, z + 0.04],
        [-11.23, 5.91, z + 0.12],
      ],
      0.16,
      0.18,
    );
  }
  plank(
    [
      [-11.13, 6.0, -2.03],
      [-11.18, 5.98, -0.4],
      [-11.25, 5.9, 1.15],
    ],
    0.22,
    0.18,
  );
  plank(
    [
      [-11.03, 4.75, -1.97],
      [-11.08, 4.73, 0.08],
      [-11.12, 4.65, 1.17],
    ],
    0.16,
    0.13,
  );
  plank(
    [
      [-9.42, 3.95, 0.45],
      [-8.14, 4.06, 0.65],
      [-5.16, 3.92, 1.12],
    ],
    0.24,
    0.13,
  );
  for (const x of [-10.8, -8.8, -3.0]) {
    const w = width(x) - 0.18;
    plank(
      [
        [x, 3.54, -w],
        [x, 3.6, 0],
        [x, 3.54, w],
      ],
      0.26,
      0.28,
    );
  }
  // Longitudinal fire-tube boilers, iron bands and bronze fire-door fittings.
  for (const z of [-1.12, 1.12]) {
    pipe(
      iron,
      [
        [-2.0, 2.02, z],
        [-1.82, 2.02, z],
        [3.8, 2.02, z],
        [4.0, 2.02, z],
      ],
      (n) => [0.82, 1, 1, 0.82][n],
      22,
    );
    for (const x of [-1.72, -0.25, 1.38, 3.65])
      ring(iron, [x, 2.02, z], 1.01, 0.055, "x");
    const end = iron.v(-2.0, 2.02, z);
    const fireplate = Array.from({ length: 23 }, (_, i) => {
      const a = (i * Math.PI) / 11;
      return iron.v(-2, 2.02 + 0.82 * Math.cos(a), z + 0.82 * Math.sin(a));
    });
    for (let i = 0; i < 22; i++) iron.tri(end, fireplate[i + 1], fireplate[i]);
    ring(brass, [-2.03, 2.0, z], 0.49, 0.075, "x");
    pipe(
      iron,
      [
        [-2.06, 2.02, z],
        [-1.98, 2.02, z],
      ],
      0.45,
      18,
    );
    pipe(
      brass,
      [
        [-1.1, 2.92, z],
        [-1.1, 3.22, z],
        [-0.94, 3.35, z],
        [0.32, 3.35, z],
        [0.49, 3.23, z],
        [0.49, 2.94, z],
      ],
      0.075,
    );
  }
  // The bearing blocks hold a continuous axle. The near wheel is mostly
  // intact. On the far wheel the upper rim and several floats tore away.
  const wx = 1.65,
    wy = 3.28,
    radius = 3.05;
  pipe(
    iron,
    [
      [wx, wy, -5.2],
      [wx, wy, 5.2],
    ],
    0.22,
    14,
  );
  for (const side of [-1, 1]) {
    const wheel = (r, a, z) => [
      wx + r * Math.cos(a),
      wy + r * Math.sin(a),
      side * z,
    ];
    for (const z of [3.64, 4.98]) {
      const c = [wx, wy, side * z];
      ring(iron, c, 0.52, 0.11, "z");
      ring(
        iron,
        c,
        radius,
        0.115,
        "z",
        side > 0 ? 0 : 2.14,
        side > 0 ? 2 * Math.PI : 7.05,
      );
      pipe(
        brass,
        [
          [wx, wy, side * (z - 0.12)],
          [wx, wy, side * (z + 0.12)],
        ],
        0.31,
        14,
      );
      for (let n = 0; n < 12; n++) {
        const a = (n * Math.PI) / 6 + 0.14;
        if (side < 0 && (n === 2 || n === 3)) continue;
        pipe(iron, [wheel(0.42, a - 0.15, z), wheel(radius, a, z)], 0.083, 7);
        pipe(iron, [wheel(1.5, a, z), wheel(radius, a + 0.45, z)], 0.046, 6);
      }
    }
    for (let n = 0; n < 12; n++) {
      if (n === 7 || (side < 0 && [1, 2, 3, 9].includes(n))) continue;
      const a = (n * Math.PI) / 6 + 0.14;
      wood.sweep(
        [wheel(radius - 0.17, a, 3.48), wheel(radius - 0.17, a, 5.15)],
        0.62,
        0.14,
        () => [-Math.sin(a), Math.cos(a), 0],
      );
    }
  }
  // A hollow torn funnel. Its folded lip, dark bore and missing sector are
  // visible from overhead, where a capped cylinder would give the wrong silhouette.
  function stackPoint(n, height, r) {
    const a = (n / 28) * Math.PI * 2;
    return [
      4.18 + height * 0.29 + r * Math.cos(a),
      2.58 + height,
      0.1 - height * 0.095 + r * Math.sin(a),
    ];
  }
  const lip = (n) =>
    4.96 +
    0.095 * Math.sin(n * 1.42) +
    0.07 * Math.cos(n * 0.73) -
    (n >= 14 && n <= 20 ? 0.86 * (1 - Math.abs(n - 17) / 4) : 0);
  let prev;
  for (let n = 0; n <= 28; n++) {
    const h = lip(n % 28);
    const ids = [
      [0, 0.88],
      [0.28, 0.9],
      [0.38, 0.77],
      [h, 0.67],
      [h, 0.57],
      [0.15, 0.63],
    ].map(([v, r]) => iron.v(...stackPoint(n, v, r)));
    if (prev)
      for (let k = 0; k < ids.length - 1; k++)
        iron.quad(prev[k], prev[k + 1], ids[k + 1], ids[k]);
    prev = ids;
  }
  for (const h of [0.44, 2.2, 4.23]) {
    const band = Array.from({ length: 29 }, (_, i) =>
      stackPoint(i, h, 0.787 - 0.019 * h),
    );
    pipe(iron, band, 0.046, 7);
  }
  // Upright stem, a bent iron bow rail and a short run of raised foredeck.
  for (let x = 8.0; x < 12.8; x += 0.43) {
    const w = width(x) - 0.15;
    plank(
      [
        [x, sheer(x), -w],
        [x, sheer(x) + 0.06, 0],
        [x, sheer(x), w],
      ],
      0.407,
      0.16,
    );
  }
  for (const side of [-1, 1]) {
    const z = side * 1.36;
    pipe(
      iron,
      [
        [9.1, 3.94, z],
        [9.1, 4.26, z],
        [9.1, 4.32, z],
      ],
      (n) => [0.17, 0.14, 0.2][n],
      10,
    );
    const rail = [];
    for (let x = 8.25; x < 12.96; x += 0.58) {
      const [a, y, b] = hull(x, 1, side);
      rail.push([a, y + 0.78, b]);
      if (rail.length % 3 === 1)
        pipe(
          iron,
          [
            [a, y, b],
            [a, y + 0.78, b],
          ],
          0.055,
          7,
        );
    }
    pipe(iron, rail, 0.061, 7);
  }
  return [wood.build(), iron.build(), brass.build()];
}

// This surveyed shelf is southwest of the original sailing wreck. Both waypoint
// and entry view use the same origin as the render and collision instances.
export const alder = {
  origin: [-60, -16.75, 67.5],
  passage: [-66, -14.35, 67.5],
  view: [-54.2, -7.5, 84.3, -60, -13.1, 67.5],
};

// Bin the actual surfaces so holes in spokes and breaches in planking remain
// navigable. The diver is a sphere, just as in the terrain collision pass.
function hullCollision(meshes) {
  const bins = new Map(),
    step = 2;
  const cell = (x) => Math.floor(x / step);
  const key = (x, y, z) => (x + 16) * 1024 + (y + 8) * 32 + (z + 16);
  // Flat XYZ corners, plane normal, and three inverse squared edge lengths.
  // Thousands of faces share this one buffer on memory-constrained devices.
  const stride = 15;
  const faces = new Float32Array(
    meshes.reduce((n, m) => n + m.ib.length / 3, 0) * stride,
  );
  let faceCount = 0;
  for (const mesh of meshes) {
    const v = new Float32Array(mesh.vb);
    for (let i = 0; i < mesh.ib.length; i += 3) {
      const f = faceCount * stride;
      for (let corner = 0; corner < 3; corner++) {
        const j = 4 * mesh.ib[i + corner],
          k = f + corner * 3;
        faces[k] = v[j];
        faces[k + 1] = v[j + 1];
        faces[k + 2] = v[j + 2];
      }
      const ax = faces[f + 3] - faces[f],
        ay = faces[f + 4] - faces[f + 1],
        az = faces[f + 5] - faces[f + 2];
      const bx = faces[f + 6] - faces[f],
        by = faces[f + 7] - faces[f + 1],
        bz = faces[f + 8] - faces[f + 2];
      const nx = ay * bz - az * by,
        ny = az * bx - ax * bz,
        nz = ax * by - ay * bx;
      const length = Math.hypot(nx, ny, nz);
      if (length < 1e-6) continue;
      faces[f + 9] = nx / length;
      faces[f + 10] = ny / length;
      faces[f + 11] = nz / length;
      faces[f + 12] = 1 / (ax * ax + ay * ay + az * az);
      faces[f + 13] = 1 / ((bx - ax) ** 2 + (by - ay) ** 2 + (bz - az) ** 2);
      faces[f + 14] = 1 / (bx * bx + by * by + bz * bz);
      const lower = (k) =>
        cell(Math.min(faces[f + k], faces[f + 3 + k], faces[f + 6 + k]) - 0.5);
      const upper = (k) =>
        cell(Math.max(faces[f + k], faces[f + 3 + k], faces[f + 6 + k]) + 0.5);
      const x0 = lower(0),
        y0 = lower(1),
        z0 = lower(2),
        x1 = upper(0),
        y1 = upper(1),
        z1 = upper(2);
      for (let x = x0; x <= x1; x++)
        for (let y = y0; y <= y1; y++)
          for (let z = z0; z <= z1; z++) {
            const k = key(x, y, z);
            if (!bins.has(k)) bins.set(k, []);
            bins.get(k).push(f);
          }
      faceCount++;
    }
  }
  function pushOut(f, p) {
    const nx = faces[f + 9],
      ny = faces[f + 10],
      nz = faces[f + 11];
    const distance =
      (p[0] - faces[f]) * nx +
      (p[1] - faces[f + 1]) * ny +
      (p[2] - faces[f + 2]) * nz;
    if (Math.abs(distance) >= 0.5) return;
    let inside = true,
      nearest = Infinity,
      dx,
      dy,
      dz;
    for (let i = 0; i < 3; i++) {
      const a = f + i * 3,
        b = f + ((i + 1) % 3) * 3;
      const ex = faces[b] - faces[a],
        ey = faces[b + 1] - faces[a + 1],
        ez = faces[b + 2] - faces[a + 2];
      const x = p[0] - faces[a],
        y = p[1] - faces[a + 1],
        z = p[2] - faces[a + 2];
      if (
        (ey * z - ez * y) * nx +
          (ez * x - ex * z) * ny +
          (ex * y - ey * x) * nz <
        0
      )
        inside = false;
      const t = Math.max(
        0,
        Math.min(1, (x * ex + y * ey + z * ez) * faces[f + 12 + i]),
      );
      const u = x - t * ex,
        v = y - t * ey,
        w = z - t * ez,
        sq = u * u + v * v + w * w;
      if (sq < nearest) {
        nearest = sq;
        dx = u;
        dy = v;
        dz = w;
      }
    }
    if (inside || nearest < 1e-12) {
      const move = (distance < 0 ? -0.5 : 0.5) - distance;
      p[0] += nx * move;
      p[1] += ny * move;
      p[2] += nz * move;
    } else if (nearest < 0.25) {
      const scale = 0.5 / Math.sqrt(nearest) - 1;
      p[0] += dx * scale;
      p[1] += dy * scale;
      p[2] += dz * scale;
    }
  }
  const p = [0, 0, 0];
  return function collide(state, ix, iy, iz, vx, vy, vz) {
    const [ox, oy, oz] = alder.origin;
    const x = state[ix] - ox,
      y = state[iy] - oy,
      z = state[iz] - oz;
    if (Math.abs(x) > 14 || y < -0.6 || y > 8.7 || Math.abs(z) > 6) return;
    p[0] = x;
    p[1] = y;
    p[2] = z;
    for (let pass = 0; pass < 2; pass++) {
      const faces = bins.get(key(cell(p[0]), cell(p[1]), cell(p[2])));
      if (!faces) break;
      for (const f of faces) pushOut(f, p);
    }
    const dx = p[0] - x,
      dy = p[1] - y,
      dz = p[2] - z;
    const sq = dx * dx + dy * dy + dz * dz;
    if (sq < 1e-14) return;
    state[ix] += dx;
    state[iy] += dy;
    state[iz] += dz;
    const inward = Math.min(
      0,
      (state[vx] * dx + state[vy] * dy + state[vz] * dz) / sq,
    );
    state[vx] -= inward * dx;
    state[vy] -= inward * dy;
    state[vz] -= inward * dz;
  };
}

export function placeSteamer(Mesh, catalog, solids) {
  const parts = buildSteamer(Mesh);
  const first = catalog.length,
    old = solids.data;
  catalog.push(...parts);
  solids.meshIndices = solids.ranges.map((_, i) => i);
  const data = new Float32Array(old.length + parts.length * 12);
  data.set(old);
  const materials = [8, 6, 7];
  for (let i = 0; i < parts.length; i++) {
    const index = old.length / 12 + i;
    data.set(
      [...alder.origin, 1, 0, 0, 0, 1, materials[i], 0.3, 1, 0],
      index * 12,
    );
    solids.ranges.push([index, 1]);
    solids.meshIndices.push(first + i);
  }
  solids.data = data;
  return hullCollision(parts);
}
