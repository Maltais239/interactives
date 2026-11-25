// Dive adaptation of “Tribal-class Destroyer (1936)” by kriss50, CC BY 4.0.
// Source and modification credits are in README.md. Local +X runs toward the bow.
import { placeWreck } from "./wreck-placement.js?v=1";

const origin = [-69, -45.55, -75];
const heading = (165 * Math.PI) / 180,
  roll = (-24 * Math.PI) / 180,
  pitch = 0.013;
const ch = Math.cos(heading),
  sh = Math.sin(heading);
const cr = Math.cos(roll),
  sr = Math.sin(roll),
  cp = Math.cos(pitch),
  sp = Math.sin(pitch);
function orient(x, y, z) {
  const h = cr * y - sr * z,
    v = sr * y + cr * z,
    u = cp * x - sp * h;
  return [ch * u - sh * v, sp * x + cp * h, sh * u + ch * v];
}
// Site coordinates are horizontal distances along/across the keel and height above its origin.
function sitePoint(u, h, v) {
  return [origin[0] + ch * u - sh * v, origin[1] + h, origin[2] + sh * u + ch * v];
}
export const destroyer = {
  origin,
  waypoint: sitePoint(14, 7.8, 10.6),
  view: [...sitePoint(3, 15, 18), ...sitePoint(14, 7, 0)],
};
const clamp = (x) => Math.max(0, Math.min(1, x));
function width(u) {
  const taper = u > 0 ? 1 - (u / 58) ** 3.5 : 1 - (-u / 58) ** 5;
  return 5.7 * Math.sqrt(Math.max(0, taper));
}

export async function readHull() {
  const response = await fetch(new URL("./tribal-destroyer.mesh.gz?v=1", import.meta.url));
  if (!response.ok) throw Error("Destroyer mesh HTTP " + response.status);
  // Some static hosts send .gz as HTTP content-encoding, others as file bytes.
  let bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes[0] === 31 && bytes[1] === 139) {
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
    bytes = new Uint8Array(await new Response(stream).arrayBuffer());
  }
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const count = view.getUint32(4, true),
    indexCount = view.getUint32(8, true);
  const indexStart = 12 + count * 10;
  if (
    view.getUint32(0, false) !== 0x54443031 ||
    !count ||
    indexCount % 3 ||
    bytes.length !== indexStart + indexCount * 2
  )
    throw Error("Invalid destroyer mesh");
  const vb = new ArrayBuffer(count * 16),
    positions = new Float32Array(vb),
    normals = new Int8Array(vb);
  for (let i = 0; i < count; i++) {
    const n = 12 + i * 10;
    const p = orient(
      view.getInt16(n, true) / 256,
      view.getInt16(n + 2, true) / 256,
      view.getInt16(n + 4, true) / 256,
    );
    const normal = orient(view.getInt8(n + 6), view.getInt8(n + 7), view.getInt8(n + 8));
    for (let k = 0; k < 3; k++) {
      positions[i * 4 + k] = p[k];
      normals[i * 16 + 12 + k] = Math.round(Math.max(-127, Math.min(127, normal[k])));
    }
    normals[i * 16 + 15] = 127;
  }
  const ib = Uint32Array.from(new Uint16Array(bytes.buffer, bytes.byteOffset + indexStart, indexCount));
  return { vb, ib, nv: count };
}

// Move the existing seabed surface. Terrain shading, shadows, wildlife navigation and
// the diver's collision field all use these same samples, including the shallow scour off the bow.
export function settleSand(field, nx, ny, nz, x0, y0, z0, spacing) {
  const column = new Float32Array(ny);
  const bounds = (centre, base, radius, n) => [
    Math.max(1, Math.floor((centre - base - radius) / spacing)),
    Math.min(n - 2, Math.ceil((centre - base + radius) / spacing)),
  ];
  const [left, right] = bounds(origin[0], x0, 69, nx),
    [front, back] = bounds(origin[2], z0, 36, nz);
  const gauss = (t) => Math.exp(-t * t);
  for (let iz = front; iz <= back; iz++)
    for (let ix = left; ix <= right; ix++) {
      const dx = x0 + ix * spacing - origin[0],
        dz = z0 + iz * spacing - origin[2];
      const u = ch * dx + sh * dz,
        v = -sh * dx + ch * dz;
      if (Math.abs(u) > 64 || Math.abs(v) > 16) continue;
      const fade = clamp((64 - Math.abs(u)) / 10),
        edge = width(u);
      const drift =
        (1.24 + 0.53 * Math.cos(0.096 * u) + 0.27 * Math.sin(0.23 * u)) *
        gauss((v + edge + 0.58 * Math.sin(u * 0.14)) / 3.3);
      const lee = 0.34 * gauss((v - edge) / 2.8) * (1 + 0.45 * Math.sin(0.15 * u));
      const scour = -0.78 * gauss((u - 49) / 10) * gauss((v - edge - 2.8) / 3.0);
      const offset = fade * (drift + lee + scour);
      if (Math.abs(offset) < 0.015) continue;
      const base = ix + nx * ny * iz;
      for (let iy = 0; iy < ny; iy++) column[iy] = field[base + iy * nx];
      for (let iy = 1; iy < ny - 1; iy++) {
        const h = y0 + iy * spacing;
        if (h < -52 || h > -35) continue;
        const blend = clamp((h + 52) / 3) * clamp((-35 - h) / 3);
        const q = iy - (offset * blend) / spacing,
          a = Math.floor(q),
          f = q - a;
        field[base + iy * nx] = column[a] * (1 - f) + column[a + 1] * f;
      }
    }
}

// Giant kelp needs a firm holdfast. The drift of loose sediment leaves an irregular
// opening around the ship, with short ground cover and tall fronds around its margins.
export function onSiltBank(x, z) {
  const dx = x - origin[0], dz = z - origin[2];
  if (Math.abs(dx) > 64 || Math.abs(dz) > 40) return false;
  const u = ch * dx + sh * dz, v = -sh * dx + ch * dz;
  const bank = 1 - (u / 61) ** 4;
  const fringe = 1.8 * Math.sin(u * 0.13) + 1.1 * Math.sin(u * 0.31);
  return bank > 0 && Math.abs(v + 2) < 19 * Math.sqrt(bank) + fringe;
}

// Filter the completed instance lists to preserve the random sequence elsewhere on the reef.
export function clearFootprint(strands, weeds, props, chunks, solids) {
  function trim(records) {
    let write = 0;
    for (let i = 0; i < records.length; i += 12) {
      const dx = records[i] - origin[0],
        dz = records[i + 2] - origin[2];
      if (Math.abs(dx) < 60 && Math.abs(dz) < 24) {
        const u = ch * dx + sh * dz,
          v = -sh * dx + ch * dz;
        if (Math.abs(u) < 57.5 && Math.abs(v + 0.8) < width(u) + 0.3) continue;
      }
      if (write !== i) for (let j = 0; j < 12; j++) records[write + j] = records[i + j];
      write += 12;
    }
    records.length = write;
  }
  for (const cells of [strands, weeds, ...props, ...chunks]) for (const records of cells) trim(records);
  for (const records of solids.slice(0, 4)) if (records) trim(records);
}

// Seed small colonies directly on surviving metal. Weight the choice of attachment
// triangle by exposed surface area so finely tessellated fittings do not attract every colony.
function colonise(Mesh, hull, ground) {
  const shells = new Mesh(),
    sponge = new Mesh();
  const vertices = new Float32Array(hull.vb),
    ib = hull.ib,
    patches = [];
  let seed = 194203,
    total = 0;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (let i = 0; i < ib.length; i += 3) {
    const a = ib[i] * 4,
      b = ib[i + 1] * 4,
      c = ib[i + 2] * 4;
    const ax = vertices[b] - vertices[a],
      ay = vertices[b + 1] - vertices[a + 1],
      az = vertices[b + 2] - vertices[a + 2];
    const bx = vertices[c] - vertices[a],
      by = vertices[c + 1] - vertices[a + 1],
      bz = vertices[c + 2] - vertices[a + 2];
    const nx = ay * bz - az * by,
      ny = az * bx - ax * bz,
      nz = ax * by - ay * bx,
      area = Math.hypot(nx, ny, nz);
    if (area < 0.26 || ny < area * 0.24) continue;
    const x = (vertices[a] + vertices[b] + vertices[c]) / 3,
      y = (vertices[a + 1] + vertices[b + 1] + vertices[c + 1]) / 3,
      z = (vertices[a + 2] + vertices[b + 2] + vertices[c + 2]) / 3;
    if (y < ground(x, z) + 0.35) continue;
    total += Math.min(area, 9);
    patches.push({ a, b, c, n: [nx / area, ny / area, nz / area], weight: total });
  }
  if (!patches.length) return [];
  for (let group = 0; group < 84; group++) {
    const pick = random() * total;
    let lo = 0,
      hi = patches.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (patches[mid].weight < pick) lo = mid + 1;
      else hi = mid;
    }
    const { a, b, c, n } = patches[lo],
      u = 0.14 + 0.34 * random(),
      v = 0.14 + 0.34 * random();
    const centre = [0, 1, 2].map(
      (k) => vertices[a + k] * (1 - u - v) + vertices[b + k] * u + vertices[c + k] * v,
    );
    const edge = [0, 1, 2].map((k) => vertices[b + k] - vertices[a + k]),
      len = Math.hypot(...edge);
    const e = edge.map((x) => x / len),
      f = [n[1] * e[2] - n[2] * e[1], n[2] * e[0] - n[0] * e[2], n[0] * e[1] - n[1] * e[0]];
    const tall = group % 5 === 0,
      mesh = tall ? sponge : shells;
    const cluster = Math.min(0.28, 0.1 * len),
      count = 3 + Math.floor(random() * 5);
    for (let j = 0; j < count; j++) {
      const theta = random() * Math.PI * 2,
        radial = cluster * Math.sqrt(random()),
        r = (tall ? 0.055 : 0.038) + random() * (tall ? 0.061 : 0.06);
      const h = tall ? 0.15 + random() * 0.27 : 0.032 + random() * 0.052;
      const point = (radius, height, t) =>
        centre.map(
          (p, k) =>
            p +
            e[k] * (radial * Math.cos(theta) + radius * Math.cos(t)) +
            f[k] * (radial * Math.sin(theta) + radius * Math.sin(t)) +
            n[k] * height,
        );
      const sides = tall ? 9 : 7,
        rings = [];
      for (const [radius, height] of [
        [r * (tall ? 0.67 : 1.28), -0.026],
        [r, h],
        [r * (tall ? 0.68 : 0.37), h - 0.009],
        [r * 0.25, h * 0.33],
      ]) {
        const ring = [];
        for (let k = 0; k < sides; k++)
          ring.push(mesh.v(...point(radius, height, (2 * Math.PI * k) / sides), height < h * 0.4 ? 0.45 : 1));
        rings.push(ring);
      }
      for (let k = 0; k < sides; k++) {
        const q = (k + 1) % sides;
        for (let j = 0; j < 3; j++) mesh.quad(rings[j][k], rings[j][q], rings[j + 1][q], rings[j + 1][k]);
      }
    }
  }
  return [shells.build(), sponge.build()];
}

export function placeDestroyer(Mesh, hull, groundAt, meshes, solids) {
  const heights = new Map();
  function ground(x, z) {
    const wx = origin[0] + x,
      wz = origin[2] + z;
    const key = Math.round(wx / 0.75) + 512 * Math.round(wz / 0.75);
    if (!heights.has(key)) heights.set(key, groundAt(wx, wz) - origin[1]);
    return heights.get(key);
  }
  // The last vertex byte carries a smooth sediment-contact mask for the fragment shader.
  const xyz = new Float32Array(hull.vb),
    bytes = new Int8Array(hull.vb);
  for (let i = 0; i < hull.nv; i++) {
    const j = i * 4,
      clearance = xyz[j + 1] - ground(xyz[j], xyz[j + 2]);
    bytes[i * 16 + 15] = Math.round(127 * clamp((2.15 - clearance) / 2.3));
  }
  const growth = colonise(Mesh, hull, ground);
  return placeWreck([hull, ...growth], [11, 12, 13], origin, meshes, solids);
}
