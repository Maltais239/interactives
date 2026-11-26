// Connected, interpretive reconstruction around AD 100, in local metres east and south.
import { surface as M, seeded } from './texture.js?v=city1';
import { growTree, herbBed } from './street.js?v=city1';
const pi = Math.PI,
  stone = 0xdfd1b6,
  pale = 0xeee3cf,
  roof = 0xb77b53,
  red = 0x9e503a;
const clamp = (x) => Math.max(0, Math.min(1, x));
const ease = (x) => {
  const t = clamp(x);
  return t * t * (3 - 2 * t);
};
export const colosseum = { x: 944, z: -134, yaw: -0.38 };
export const cityStops = [
  { name: 'Roman Forum', x: 365, z: -424, yaw: -1.12, pitch: 0.12 },
  { name: 'Palatine palace', x: 507, z: 69, yaw: 2.23, pitch: 0.12 },
  { name: 'Colosseum', x: 816, z: -213, yaw: 2.12, pitch: 0.24 },
  { name: 'Colosseum arena', x: 944, z: -134, yaw: -0.4, pitch: 0.28 },
];
export function cityHeight(x, z) {
  const base = 4 * ease((x - 70) / 145);
  const hill =
    35 *
    ease((x - 245) / 190) *
    (1 - ease((x - 660) / 175)) *
    ease((z + 310) / 180) *
    (1 - ease((z - 145) / 170));
  return base + hill + 0.025;
}
const routes = [
  [
    [18, -58],
    [33, -92],
    [80, -149],
    [163, -242],
    [264, -365],
    [314, -434],
  ],
  [
    [496, -391],
    [552, -373],
    [600, -300],
    [650, -235],
    [790, -180],
    [818, -184],
    [944, -134],
  ],
  [
    [600, -300],
    [620, -221],
    [640, -147],
    [632, -72],
    [580, -17],
    [560, 40],
    [536, 47],
    [507, 69],
  ],
];
export function cityInside(x, z) {
  if (x > 204 && x < 570 && z > -570 && z < -263) return true;
  if (x > 382 && x < 695 && z > -170 && z < 177) return true;
  if (Math.hypot((x - colosseum.x) / 1.1, z - colosseum.z) < 215) return true;
  return routes.some((points) =>
    points.some((a, i) => {
      if (!i) return false;
      const b = points[i - 1],
        dx = a[0] - b[0],
        dz = a[1] - b[1];
      const t = clamp(((x - b[0]) * dx + (z - b[1]) * dz) / (dx * dx + dz * dz));
      return Math.hypot(x - b[0] - dx * t, z - b[1] - dz * t) < 23;
    }),
  );
}
export function cityPlace(x, z) {
  if (Math.hypot(x - 944, z + 134) < 46) return 'Colosseum arena';
  if (Math.hypot(x - 944, z + 134) < 215) return 'Colosseum';
  if (x > 382 && x < 695 && z > -170 && z < 177) return 'Palatine Hill';
  if (x > 204 && x < 570 && z > -570 && z < -263) return 'Roman Forum';
  if (x > 500) return 'Via Sacra';
  return 'Vicus Tuscus';
}
export { routes as cityRoutes };
function road(g, points, width, color) {
  for (let i = 1; i < points.length; i++) {
    const [ax, az] = points[i - 1],
      [bx, bz] = points[i],
      len = Math.hypot(bx - ax, bz - az),
      n = Math.ceil(len / 4);
    const ex = ((-(bz - az) / len) * width) / 2,
      ez = (((bx - ax) / len) * width) / 2;
    for (let k = 0; k < n; k++) {
      const a = k / n,
        b = (k + 1) / n,
        p = (u, side) => {
          const x = ax + (bx - ax) * u + ex * side,
            z = az + (bz - az) * u + ez * side;
          return [x, cityHeight(x, z) + 0.012, z];
        };
      g.face([p(a, 1), p(b, 1), p(b, -1), p(a, -1)], color, M.paving);
    }
  }
}
function terrain(g) {
  // Fine enough to follow the long gradients of the hill at walking height.
  const step = 10;
  for (let x = -29; x < 1131; x += step)
    for (let z = -655; z < 315; z += step) {
      if (x < 101 && z >= -135 && z < 145) continue;
      const point = (a, b) => [a, cityHeight(a, b) - 0.014, b];
      const tint = Math.sin(x * 0.037) * Math.sin(z * 0.041) > 0.45 ? 0xb7b08e : 0xc1b89d;
      const a = point(x, z + step),
        b = point(x + step, z + step),
        c = point(x + step, z),
        d = point(x, z);
      g.face([a, b, c], tint, M.garden);
      g.face([a, c, d], tint, M.garden);
    }
}
function column(g, x, y, z, h, r, fancy) {
  g.box(x, y, z, r * 2.5, 0.18, r * 2.5, pale);
  g.post(
    x,
    y + 0.18,
    z,
    [
      [0, r * 1.22],
      [0.11, r * 1.2],
      [0.2, r],
      [h - 0.77, r * 0.83],
      [h - 0.64, r * 1.02],
      [h - 0.5, r * 1.25],
      [h - 0.33, r * 1.34],
      [h - 0.18, r * 1.3],
    ],
    pale,
    M.lime,
    fancy ? 28 : 18,
    fancy ? 12 : 0,
  );
  g.box(x, y + h - 0.17, z, r * 2.8, 0.17, r * 2.7, pale);
  if (fancy)
    for (const side of [-1, 1]) {
      for (let j = 0; j < 10; j++) {
        const at = (k) => {
          const t = k / 10,
            a = t * pi * 2.0,
            rr = r * (0.25 * (1 - t) + 0.035);
          return [x + side * r * 0.85 + Math.sin(a) * rr, y + h - 0.35 + Math.cos(a) * rr, z + r * 0.88];
        };
        g.beam(at(j), at(j + 1), r * 0.043, pale, M.lime, 5);
      }
    }
}
function temple(g, kit, w, d, h, columns, tint = stone) {
  const floor = 2.4,
    depth = d / 2;
  g.box(0, 0, 0, w + 1.3, floor, d + 1.2, 0xc0ae8e, M.ashlar);
  g.block(0, 0, w + 1.3, d + 1.2, 0, floor);
  g.ramp(0, 0, w + 1.3, d + 1.2, floor, floor);
  for (let j = 0; j < 13; j++)
    g.box(0, 0, depth + 5.5 - j * 0.42, w * 0.72, ((j + 1) * floor) / 13, 0.44, tint);
  g.ramp(0, depth + 3, w * 0.72, 5.5, 0, floor);
  g.wall(0, floor, -d * 0.12, w * 0.66, h - 1.2, d * 0.64, tint, M.facade);
  for (let j = 0; j < columns; j++)
    column(g, -w * 0.44 + (j * w * 0.88) / (columns - 1), floor, depth - 0.7, h, 0.5, true);
  const ranks = Math.max(4, Math.round(d / 3.1));
  for (const side of [-1, 1])
    for (let j = 1; j < ranks; j++)
      column(g, side * w * 0.44, floor, depth - 0.7 - (j * (d - 1.4)) / (ranks - 1), h, 0.5, true);
  g.box(0, h + floor, 0, w + 1.05, 0.48, d + 0.75, pale);
  g.box(0, h + floor + 0.48, 0, w + 1.15, 0.6, d + 0.8, tint, M.facade);
  g.box(0, h + floor + 0.91, 0, w + 1.55, 0.28, d + 1.2, pale);
  kit.roof(0, h + floor + 1.19, 0, w + 1.85, d + 1.55, w * 0.19, roof);
  g.box(0, h + floor + 0.54, depth + 0.43, w * 0.78, 0.065, 0.025, red, M.facade);
  g.box(0, floor, depth * 0.45, 2.65, 4.5, 0.15, 0x72563b, M.wood);
}
function basilica(g, kit, w, d, h, tint) {
  g.wall(0, 0, -d / 2, w, h, 0.42, tint, M.facade);
  for (const side of [-1, 1]) g.wall((side * w) / 2, 0, 0, 0.44, h, d, tint, M.facade);
  const n = Math.round(w / 3.6);
  for (let j = 0; j <= n; j++) {
    const x = -w / 2 + (j * w) / n;
    column(g, x, 0.13, d / 2, h * 0.51, 0.36, false);
    column(g, x, h * 0.55, d / 2, h * 0.33, 0.29, false);
    for (const z of [-d * 0.21, d * 0.12]) column(g, x, 0.13, z, h * 0.89, 0.37, false);
  }
  g.box(0, h * 0.52, d / 2, w + 0.7, 0.45, 0.91, stone);
  g.box(0, h * 0.9, 0, w + 0.8, 0.41, d + 1, pale);
  g.box(0, 0.025, 0, w, 0.06, d, 0xe0d4be, M.lime);
  kit.roof(0, h * 0.94, 0, w + 1.4, d + 1.9, 3.3, roof);
  g.box(0, h * 0.54, 0, w, 0.2, d, 0x7b6249, M.wood);
  g.block(0, 0, w, d, h * 0.54, h * 0.54 + 0.2);
}
function forum(g, kit) {
  g.frame(
    390,
    -405,
    -0.48,
    () => {
      g.box(0, -0.05, 0, 240, 0.07, 74, 0xd5c7ac, M.lime);
      for (let i = -29; i <= 29; i++)
        for (let j = -8; j <= 8; j++) {
          const x = i * 4.0,
            z = j * 4.0,
            shift = ((i * 17 + j * 19) % 11) * 0.0008;
          g.face(
            [
              [x - 1.98, 0.026 + shift, z + 1.97],
              [x + 1.98, 0.026 + shift, z + 1.97],
              [x + 1.98, 0.026 + shift, z - 1.97],
              [x - 1.98, 0.026 + shift, z - 1.97],
            ],
            (i + j) % 5 ? 0xd8ccb8 : 0xc9bea9,
            M.flagstone,
          );
        }
      g.frame(-132, -2, pi / 2, () => temple(g, kit, 20, 36, 12.9, 6), 0);
      g.frame(-22, 60, pi, () => basilica(g, kit, 101, 39, 16, 0xd9c6a7));
      g.frame(42, -58, 0, () => basilica(g, kit, 91, 30, 14.8, 0xdbc8a7));
      g.frame(82, 58, pi, () => temple(g, kit, 24, 37, 13.0, 8, pale));
      g.frame(124, 0, -pi / 2, () => temple(g, kit, 18, 24, 9.1, 6, 0xe5d4b4));
      // Curia: its tall brick mass differs from the long columned basilicas.
      g.frame(-58, -71, 0.02, () => {
        g.wall(0, 0, -8, 27, 20, 30, 0xc59c78, M.brick);
        g.box(0, 0, 7.1, 7.3, 11, 0.5, 0x6d5a42, M.wood);
        for (const x of [-8.2, 0, 8.2]) g.box(x, 14.8, 7.13, 3.0, 3.0, 0.12, 0x514d41, M.wood);
        kit.roof(0, 20, -8, 28.4, 31.8, 3.8, roof);
      });
      // Rostra and honorary columns leave a broad central path through the square.
      g.wall(-89, 0, -10, 13, 2.0, 6, stone, M.lime);
      g.ramp(-89, -10, 13, 6, 2, 2);
      for (let i = 0; i < 5; i++)
        g.post(
          -108 + i * 10,
          0.12,
          30,
          [
            [0, 0.85],
            [0.5, 0.88],
            [0.8, 0.53],
            [10.8, 0.43],
            [11.1, 0.67],
            [11.6, 0.7],
          ],
          i % 2 ? 0xd2b891 : pale,
          M.lime,
          20,
        );
      for (const [x, z] of [
        [-17, -9],
        [39, 19],
        [60, -18],
      ]) {
        g.post(
          x,
          0.03,
          z,
          [
            [0, 1.2],
            [0.2, 1.1],
            [1.9, 0.97],
            [2.1, 1.16],
          ],
          0xbfa782,
          M.lime,
          4,
        );
        g.post(
          x,
          2.1,
          z,
          [
            [0, 0.23],
            [1.8, 0.31],
            [2.2, 0.19],
            [2.6, 0.12],
          ],
          0x8b805f,
          M.metal,
          9,
        );
      }
      // Vesta's small circular sanctuary is tucked toward the eastern end.
      const vx = 137,
        vz = 48;
      g.post(
        vx,
        0,
        vz,
        [
          [0, 8.3],
          [0.8, 8.3],
          [1.4, 7.7],
        ],
        pale,
        M.lime,
        48,
      );
      for (let j = 0; j < 20; j++) {
        const a = (j * pi) / 10;
        column(g, vx + Math.cos(a) * 6.7, 1.4, vz + Math.sin(a) * 6.7, 7.3, 0.29, true);
      }
      g.post(
        vx,
        8.7,
        vz,
        [
          [0, 7.1],
          [0.55, 7.3],
          [2.1, 3.4],
          [2.9, 0.01],
        ],
        roof,
        M.roof,
        48,
      );
    },
    cityHeight(390, -405) - 0.025,
  );
}
function palace(g, kit) {
  const y = 39.025;
  g.frame(
    525,
    83,
    0.04,
    () => {
      // A terraced platform joins the peristyle, reception halls and garden.
      g.box(0, -16, 0, 171, 16, 169, 0xaa987b, M.ashlar);
      g.block(0, 0, 171, 169, -16, 0);
      g.ramp(0, 0, 171, 169, 0, 0);
      g.box(0, 0.005, 0, 165, 0.06, 161, 0xddcfb3, M.lime);
      for (const side of [-1, 1]) {
        g.frame(side * 58, 0, (-side * pi) / 2, () => basilica(g, kit, 97, 24, 13.5, 0xd5bd92));
        for (let j = 0; j < 11; j++) column(g, side * 42, 0.08, -45 + j * 8.7, 9, 0.4, true);
        g.box(side * 50, 9.1, 0, 20, 0.32, 99, pale);
        kit.roof(side * 50, 9.42, 0, 21, 101, 2, roof);
      }
      // The Aula Regia faces the courtyard across a deep columned porch.
      g.frame(0, -61, 0, () => {
        g.wall(0, 0, -9, 44, 24, 39, 0xd6ba93, M.facade);
        g.box(0, 0, 10.8, 10, 16, 0.18, 0x746447, M.metal);
        for (let i = -2; i <= 2; i++) column(g, i * 8.5, 0.13, 17.8, 17.0, 0.66, true);
        g.box(0, 17.3, 17.8, 47, 0.45, 8, pale);
        kit.roof(0, 24, -9, 46, 41, 4.2, roof);
      });
      g.frame(0, 66, pi, () => basilica(g, kit, 57, 29, 17, 0xd6bd97));
      // Octagonal fountain: water is below its modeled marble lip.
      const profile = [
        [0, 10.6],
        [0.33, 10.6],
        [0.7, 10.1],
        [0.8, 10.1],
        [0.8, 8.8],
        [0.22, 8.5],
      ];
      g.post(0, 0.05, 0, profile, pale, M.lime, 8);
      g.post(
        0,
        0.29,
        0,
        [
          [0, 8.5],
          [0.008, 8.5],
          [0.009, 0],
        ],
        0x609082,
        34,
        8,
      );
      g.block(0, 0, 21.3, 21.3, 0, 0.9);
      for (const [x, z] of [
        [-25, -22],
        [25, -22],
        [-25, 24],
        [25, 24],
      ]) {
        g.box(x, 0.04, z, 11, 0.34, 14, 0xc7ad85, M.lime);
        g.box(x, 0.38, z, 10.5, 0.02, 13.5, 0x988765, M.garden);
        herbBed(g, x, z, 9.5, 12.5, Math.round(x * z + 3300));
        g.block(x, z, 11, 14, 0, 0.8);
      }
      for (const x of [-32, 32]) {
        g.box(x, 0.05, 0, 3.2, 0.5, 3.2, 0xb99a71, M.lime);
        growTree(g, x, 0, 7.0, 'cypress');
      }
      // Palace terrace overlooks the Circus valley.
      for (let i = 0; i < 24; i++)
        g.post(
          -79 + i * 6.8,
          0.1,
          84,
          [
            [0, 0.19],
            [1.6, 0.17],
            [1.72, 0.27],
          ],
          pale,
          M.lime,
          10,
        );
      g.box(0, 1.8, 84, 164, 0.19, 0.37, pale);
    },
    y,
  );
}
function streetLinks(g, kit) {
  const r = seeded(182003);
  // Short, irregular frontages enclose the bend between the market and the Forum.
  for (let i = 0; i < 12; i++) {
    const t = i / 11,
      x = 38 + 171 * t,
      z = -102 - 201 * t,
      angle = -0.7;
    for (const side of [-1, 1]) {
      const xx = x + side * 12,
        zz = z + side * 10,
        h = 6.0 + r() * 5.5;
      g.frame(
        xx,
        zz,
        side > 0 ? angle - pi / 2 : angle + pi / 2,
        () => kit.house(6.4 + r() * 3, 6.0 + r() * 2, h, true),
        cityHeight(xx, zz),
      );
    }
  }
  // Fewer buildings along the sacred way allow the amphitheatre to emerge ahead.
  for (const [x, z] of [
    [552, -416],
    [632, -299],
    [746, -231],
    [796, -258],
  ]) {
    g.frame(x, z, 0.2, () => kit.house(10, 9, 6.6 + r() * 2.2, true), cityHeight(x, z));
  }
  for (const [x, z] of [
    [238, -303],
    [212, -335],
    [569, -177],
    [669, -69],
    [711, -102],
    [779, -299],
  ]) {
    g.frame(x, z, 0, () => growTree(g, 0, 0, 9 + r() * 3, 'pine', false), cityHeight(x, z));
  }
}
export function buildCity(g, kit) {
  terrain(g);
  {
    for (let i = 0; i < 120; i++) {
      const a = (i * pi) / 60,
        b = ((i + 1) * pi) / 60,
        y = cityHeight(944, -134) + 0.015;
      g.face(
        [
          [944, y, -134],
          [944 + Math.cos(a) * 175, y, -134 + Math.sin(a) * 155],
          [944 + Math.cos(b) * 175, y, -134 + Math.sin(b) * 155],
        ],
        0xcbbca1,
        M.paving,
      );
    }
  }
  for (const route of routes) road(g, route, route === routes[0] ? 6.2 : 7.8, 0xb7ab94);
  forum(g, kit);
  palace(g, kit);
  streetLinks(g, kit);
  g.skyRadius = 740;
  g.skyFocus = [480, 21, -150];
  g.cityShadows = true;
  g.viewDistance = 1500;
}
export async function installColosseum(g) {
  const response = await fetch(
    new URL('./assets/landmarks/colosseum/colosseum-walk.mesh.gz?v=city1', import.meta.url),
  );
  if (!response.ok) throw Error('The Colosseum model could not be loaded. Reload to try again.');
  let bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes[0] === 31 && bytes[1] === 139)
    bytes = new Uint8Array(
      await new Response(
        new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip')),
      ).arrayBuffer(),
    );
  const v = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (v.getUint32(0) !== 0x434f4c31) throw Error('Invalid Colosseum model.');
  const nv = v.getUint32(4, true),
    ni = v.getUint32(8, true),
    ib = 12 + nv * 14;
  if (ib + ni * 4 !== bytes.length || ni % 3) throw Error('Incomplete Colosseum model.');
  const first = g.data.length / 12,
    c = Math.cos(colosseum.yaw),
    s = Math.sin(colosseum.yaw),
    floor = cityHeight(944, -134);
  for (let i = 0; i < nv; i++) {
    const o = 12 + i * 14,
      x = v.getInt16(o, true) / 128,
      y = v.getInt16(o + 2, true) / 128,
      z = v.getInt16(o + 4, true) / 128;
    const nx = v.getInt8(o + 6) / 127,
      ny = v.getInt8(o + 7) / 127,
      nz = v.getInt8(o + 8) / 127;
    const u = Math.abs(ny) > 0.6 ? x : Math.abs(nz) > 0.6 ? x : z,
      t = Math.abs(ny) > 0.6 ? z : -y;
    g.data.push(
      944 + x * c + z * s,
      floor + y,
      -134 + z * c - x * s,
      nx * c + nz * s,
      ny,
      nz * c - nx * s,
      u / 2.8,
      t / 2.8,
      v.getUint8(o + 9) / 255,
      v.getUint8(o + 10) / 255,
      v.getUint8(o + 11) / 255,
      v.getUint8(o + 12),
    );
  }
  for (let i = 0; i < ni; i++) g.indices.push(first + v.getUint32(ib + i * 4, true));
}
export function citySolid(x, z) {
  const c = Math.cos(colosseum.yaw),
    s = Math.sin(colosseum.yaw),
    dx = x - 944,
    dz = z + 134;
  const u = dx * c - dz * s,
    v = dx * s + dz * c,
    r = Math.hypot(u / 94, v / 78);
  // The arena and the four axial entrance passages are open at ground level.
  return r < 1.017 && r > 0.43 && Math.abs(v) > 3.3 && Math.abs(u) > 3.3;
}
export function drawCityPlan(ctx, w, h, cam) {
  const scale = Math.min((w - 44) / 1420, (h - 55) / 1040),
    ox = 39 + 210 * scale,
    oy = h * 0.58;
  const pt = (x, z) => [ox + x * scale, oy + z * scale];
  ctx.fillStyle = '#eee1c9';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#9bb5a6';
  ctx.lineWidth = 20 * scale;
  ctx.beginPath();
  ctx.moveTo(...pt(-100, -620));
  ctx.lineTo(...pt(-30, 240));
  ctx.stroke();
  ctx.fillStyle = '#c5be9c';
  ctx.beginPath();
  ctx.ellipse(...pt(530, 48), 170 * scale, 183 * scale, 0, 0, 2 * pi);
  ctx.fill();
  ctx.strokeStyle = '#bba883';
  ctx.lineWidth = 6;
  for (const points of routes) {
    ctx.beginPath();
    points.forEach((p, i) => (i ? ctx.lineTo(...pt(...p)) : ctx.moveTo(...pt(...p))));
    ctx.stroke();
  }
  ctx.fillStyle = '#b8a58b';
  ctx.fillRect(...pt(225, -520), 340 * scale, 238 * scale);
  ctx.fillStyle = '#9c876c';
  ctx.fillRect(...pt(442, 0), 167 * scale, 164 * scale);
  ctx.strokeStyle = '#947f64';
  ctx.lineWidth = 9 * scale;
  ctx.beginPath();
  ctx.ellipse(...pt(944, -134), 98 * scale, 79 * scale, 0.38, 0, 2 * pi);
  ctx.stroke();
  ctx.fillStyle = '#b59c78';
  ctx.fillRect(...pt(-15, -32), 20 * scale, 23 * scale);
  ctx.beginPath();
  ctx.arc(...pt(-6, 29), 10 * scale, 0, 2 * pi);
  ctx.fill();
  ctx.font = '16px Georgia';
  ctx.textAlign = 'center';
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#eee1c9';
  for (const [name, x, z] of [
    ['Forum Boarium', 35, 83],
    ['Roman Forum', 370, -555],
    ['Palatine', 525, 207],
    ['Colosseum', 944, -264],
  ]) {
    ctx.strokeText(name, ...pt(x, z));
    ctx.fillStyle = '#4c4332';
    ctx.fillText(name, ...pt(x, z));
  }
  ctx.fillStyle = '#4c4332';
  ctx.textAlign = 'left';
  ctx.font = '14px system-ui';
  ctx.fillText('N ↑', w - 44, 25);
  ctx.fillRect(22, h - 23, 100 * scale, 2);
  ctx.fillText('100 m', 22, h - 31);
  ctx.save();
  ctx.translate(...pt(cam.x, cam.z));
  ctx.rotate(cam.yaw);
  ctx.beginPath();
  ctx.moveTo(0, -10);
  ctx.lineTo(6, 7);
  ctx.lineTo(0, 4);
  ctx.lineTo(-6, 7);
  ctx.closePath();
  ctx.fillStyle = '#a84e32';
  ctx.strokeStyle = '#fff5de';
  ctx.lineWidth = 2;
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}
