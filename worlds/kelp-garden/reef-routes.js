// One conservative chart of the rendered reef. A cell records the highest
// piece of solid geometry that reaches it, including arches and placed rocks.
const step = 1.5,
  width = 256,
  origin = -192;
const cell = (n) => Math.floor((n - origin) / step);
const limit = (n) => Math.max(0, Math.min(width - 1, n));

function bounds(mesh) {
  const v = new Float32Array(mesh.vb);
  const half = [0, 0, 0];
  let radius = 0;
  for (let i = 0; i < v.length; i += 4) {
    for (let k = 0; k < 3; k++) half[k] = Math.max(half[k], Math.abs(v[i + k]));
    radius = Math.max(radius, Math.hypot(v[i], v[i + 1], v[i + 2]));
  }
  return { half, radius };
}

export function chartReef(terrain, scene, meshes) {
  const floor = new Float32Array(width * width).fill(-56);
  function mark(x0, x1, z0, z1, top) {
    const left = limit(cell(x0)),
      right = limit(cell(x1)),
      front = limit(cell(z0)),
      back = limit(cell(z1));
    for (let z = front; z <= back; z++)
      for (let x = left; x <= right; x++) {
        const i = z * width + x;
        if (top > floor[i]) floor[i] = top;
      }
  }
  function triangles(v, indices, stride, heave = 0) {
    for (let i = 0; i < indices.length; i += 3) {
      const a = indices[i] * stride,
        b = indices[i + 1] * stride,
        c = indices[i + 2] * stride;
      mark(
        Math.min(v[a], v[b], v[c]),
        Math.max(v[a], v[b], v[c]),
        Math.min(v[a + 2], v[b + 2], v[c + 2]),
        Math.max(v[a + 2], v[b + 2], v[c + 2]),
        Math.max(v[a + 1], v[b + 1], v[c + 1]) + heave,
      );
    }
  }
  triangles(new Float32Array(terrain.vb), terrain.ib, 4);
  const shapes = meshes.map(bounds);
  function objects(meshIndex, instances, first = 0, count = instances.length / 12) {
    const mesh = meshes[meshIndex],
      shape = shapes[meshIndex],
      v = new Float32Array(mesh.vb);
    for (let n = first; n < first + count; n++) {
      const j = n * 12,
        x = instances[j],
        y = instances[j + 1],
        z = instances[j + 2],
        scale = instances[j + 3];
      const radius = shape.radius * scale,
        heave = Math.abs(instances[j + 11]);
      if (radius < 3) {
        mark(x - radius, x + radius, z - radius, z + radius, y + radius + heave);
        continue;
      }
      // For large boulders and wrecks, keep the actual shape rather than
      // reserving a whole rectangular region around the set piece.
      const qx = instances[j + 4],
        qy = instances[j + 5],
        qz = instances[j + 6],
        qw = instances[j + 7];
      const placed = new Float32Array(mesh.nv * 3);
      for (let k = 0; k < mesh.nv; k++) {
        const a = v[k * 4] * scale,
          b = v[k * 4 + 1] * scale,
          c = v[k * 4 + 2] * scale;
        const u = 2 * (qy * c - qz * b),
          w = 2 * (qz * a - qx * c),
          t = 2 * (qx * b - qy * a);
        placed[3 * k] = x + a + qw * u + qy * t - qz * w;
        placed[3 * k + 1] = y + b + qw * w + qz * u - qx * t;
        placed[3 * k + 2] = z + c + qw * t + qx * w - qy * u;
      }
      triangles(placed, mesh.ib, 3, heave);
    }
  }
  scene.solids.ranges.forEach(([start, count], i) => objects(scene.solids.meshIndices[i], scene.solids.data, start, count));
  scene.props.forEach((set, i) => {
    objects(4 + i, set.data);
    if (i === 3 || i === 4) objects(18 + i, set.data);
  });
  scene.chunks.forEach((set, i) => {
    objects(14 + i, set.data);
    if (i >= 3 && i <= 5) objects(20 + i, set.data);
  });
  // Each wider chart is a sliding maximum over the previous 3x3 neighbourhood.
  // An entire body, and the gap between route samples, fits inside the checked area.
  const margins = [floor];
  function chartFor(radius) {
    const cells = Math.ceil(radius / step);
    while (margins.length <= cells) {
      const prev = margins[margins.length - 1],
        next = new Float32Array(prev.length);
      for (let z = 0; z < width; z++)
        for (let x = 0; x < width; x++) {
          let top = -56;
          for (let dz = -1; dz <= 1; dz++)
            for (let dx = -1; dx <= 1; dx++) {
              top = Math.max(top, prev[limit(z + dz) * width + limit(x + dx)]);
            }
          next[z * width + x] = top;
        }
      margins.push(next);
    }
    return margins[cells];
  }

  // Paths keep their phase, stroke and direction. Try a nearby open corridor,
  // a shallower depth, or a tighter loop if the original swept volume hits rock.
  function place(data, kind, bodyRadius, group = false) {
    if (!data.length) return;
    if (!group && data.length > 8) {
      for (let i = 0; i < data.length; i += 8) place(data.subarray(i, i + 8), kind, bodyRadius, true);
      return;
    }
    const x0 = data[0],
      y0 = data[1],
      z0 = data[2],
      r0 = data[3],
      a0 = data[4],
      phase = (data[7] % 1) * 2 * Math.PI;
    let size = 0,
      spread = 0,
      spreadY = 0;
    for (let i = 0; i < data.length; i += 8) {
      size = Math.max(size, data[i + 6]);
      spread = Math.max(spread, Math.hypot(data[i] - x0, data[i + 2] - z0) + Math.abs(data[i + 3] - r0));
      spreadY = Math.max(spreadY, Math.abs(data[i + 1] - y0));
    }
    const school = kind === "shoal",
      manta = kind === "manta",
      green = kind === "green";
    const aspect = school ? 0.6 : manta ? 0.75 : 0.65;
    const body = bodyRadius * size;
    const horizontal = body + spread + (school ? 3.65 : 0);
    const chart = chartFor(horizontal + 0.55);
    let best = null;
    const minRadius = manta
      ? Math.max(5.5, size * 1.65)
      : school
        ? Math.min(r0, 8)
        : Math.min(r0, Math.max(r0 * 0.46, body * 2.2));
    const radii = new Set([1, 0.82, 0.62, 0.46, 0.26].map((f) => Math.max(r0 * f, minRadius)));
    for (const r of radii) {
      const shrink = r / r0;
      const pitch = manta ? 5 / Math.hypot(0.75 * r, 5) : 0;
      const height = manta
        ? Math.min(
            body,
            (shapes[12].half[1] + 0.47 + 0.28 * (shapes[12].half[0] + 0.12) + pitch * shapes[12].half[2]) *
              size,
          )
        : body;
      const vertical = height + spreadY + (school ? 4.2 : manta ? 2.5 : kind === "jelly" ? 0.76 : 0.65) + 0.28;
      const low = green ? Math.min(-vertical, -body - 3.6) : -vertical;
      const high = -low;
      const maxY = -0.65 - high;
      const pts = [];
      // The longest horizontal step is <1 m, including the warped turtle curve.
      const steps = Math.ceil((2 * Math.PI * r * (green ? 2.15 : 1)) / 0.9) + 1;
      for (let j = 0; j < steps; j++) {
        const a = (2 * Math.PI * j) / steps,
          x = r * Math.cos(a),
          z = r * aspect * Math.sin(a);
        pts.push(x, z);
        if (green)
          pts.push(
            x + r * 0.17 * (Math.sin(2 * a + phase) - Math.sin(2 * a0 + phase)),
            r *
              (0.66 * Math.sin(a) +
                0.135 * (Math.sin(3 * a + phase) - Math.sin(3 * a0 + phase)) -
                0.01 * Math.sin(a0)),
          );
      }
      function tryAt(dx, dz) {
        const cost = dx * dx + dz * dz + ((r0 - r) * 1.4) ** 2;
        if (best && cost >= best.cost) return;
        let top = -56;
        for (let j = 0; j < pts.length; j += 2) {
          const x = cell(x0 + dx + pts[j]),
            z = cell(z0 + dz + pts[j + 1]);
          if (x < 12 || x >= width - 12 || z < 12 || z >= width - 12) return;
          const wx = x0 + dx + pts[j],
            wz = z0 + dz + pts[j + 1];
          if (wx * wx + wz * wz > 148 * 148) return;
          top = Math.max(top, chart[z * width + x]);
          if (top - low > maxY) return;
        }
        const y = Math.max(top - low, Math.min(maxY, y0));
        const total = cost + 1.1 * (y - y0) ** 2;
        if (!best || total < best.cost) best = { dx, dz, y, shrink, cost: total };
      }
      tryAt(0, 0);
      if (best?.cost === 0) break;
      for (let ring = 1; ring <= 36; ring++) {
        const d = ring * 4;
        if (best && d * d >= best.cost) break;
        for (let n = -ring; n <= ring; n++) {
          tryAt(4 * n, d);
          tryAt(4 * n, -d);
          if (Math.abs(n) < ring) {
            tryAt(d, 4 * n);
            tryAt(-d, 4 * n);
          }
        }
      }
    }
    if (!best) throw Error("No navigable water for " + kind);
    for (let i = 0; i < data.length; i += 8) {
      data[i] += best.dx;
      data[i + 1] += best.y - y0;
      data[i + 2] += best.dz;
      data[i + 3] *= best.shrink;
      data[i + 5] /= best.shrink;
    }
  }
  return { place, shapes };
}
