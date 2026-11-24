// Bin the actual surfaces so holes in spokes and breaches in planking remain
// navigable. The diver is a sphere, just as in the terrain collision pass.
function hullCollision(meshes, origin) {
  const low = [Infinity, Infinity, Infinity], high = [-Infinity, -Infinity, -Infinity];
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
    for (let i = 0; i < v.length; i += 4) {
      for (let axis = 0; axis < 3; axis++) {
        low[axis] = Math.min(low[axis], v[i + axis] - 0.5);
        high[axis] = Math.max(high[axis], v[i + axis] + 0.5);
      }
    }
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
    const [ox, oy, oz] = origin;
    const x = state[ix] - ox,
      y = state[iy] - oy,
      z = state[iz] - oz;
    if (x < low[0] || x > high[0] || y < low[1] || y > high[1] || z < low[2] || z > high[2]) return;
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

export function placeWreck(parts, materials, origin, catalog, solids) {
  const first = catalog.length,
    old = solids.data;
  catalog.push(...parts);
  solids.meshIndices ??= solids.ranges.map((_, i) => i);
  const data = new Float32Array(old.length + parts.length * 12);
  data.set(old);
  for (let i = 0; i < parts.length; i++) {
    const index = old.length / 12 + i;
    data.set(
      [...origin, 1, 0, 0, 0, 1, materials[i], 0.3, 1, 0],
      index * 12,
    );
    solids.ranges.push([index, 1]);
    solids.meshIndices.push(first + i);
  }
  solids.data = data;
  return hullCollision(parts, origin);
}
