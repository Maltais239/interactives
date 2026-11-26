// An interpretive working quarter. Local +X follows the street and +Z faces out toward it.
import { surface as M, seeded } from './texture.js?v=quarter1';
import { streetFront, paintedBand } from './fronts.js?v=quarter1';
import { balcony, herbBed } from './street.js?v=quarter1';

const pi = Math.PI;
let planBlocks = [];
const plaster = 0xd7c39f,
  stone = 0xd9c8ab,
  wood = 0x796047,
  red = 0x99533c;
const color = (hex, k) =>
  [16, 8, 0].reduce((v, s) => v + (Math.min(255, Math.round(((hex >> s) & 255) * k)) << s), 0);

function ring(g, x, y, z, radius, thickness, tint, vertical = false) {
  const point = (t) =>
    vertical
      ? [x + radius * Math.cos(t), y + radius * Math.sin(t), z]
      : [x + radius * Math.cos(t), y, z + radius * Math.sin(t)];
  for (let i = 0; i < 16; i++)
    g.beam(point((i * pi) / 8), point(((i + 1) * pi) / 8), thickness, tint, M.metal, 5);
}

// Voussoirs, the inner barrel and the wall above share the same curve.
function arch(g, x, z, width, spring, top, depth, tint) {
  const r = width / 2,
    thick = 0.3,
    steps = 20;
  const at = (a, rad, d) => [x + rad * Math.cos(a), spring + rad * Math.sin(a), z + d];
  for (let j = 0; j < steps; j++) {
    const a = (j * pi) / steps + 0.003,
      b = ((j + 1) * pi) / steps - 0.003;
    for (const d of [0, -depth]) {
      const pts = [at(a, r, d), at(b, r, d), at(b, r + thick, d), at(a, r + thick, d)];
      g.face(d === 0 ? pts : pts.reverse(), color(tint, 0.94 + 0.07 * (j % 3)), M.lime);
      const left = at(a, r + thick, d),
        right = at(b, r + thick, d);
      const panel = [left, right, [right[0], top, right[2]], [left[0], top, left[2]]];
      g.face(d === 0 ? panel : panel.reverse(), plaster, M.facade);
    }
    g.face([at(a, r, 0), at(a, r, -depth), at(b, r, -depth), at(b, r, 0)], 0xc1ac8a, M.lime);
  }
  g.box(
    x,
    spring + r + thick,
    z - depth / 2,
    width + thick * 2,
    top - spring - r - thick,
    depth,
    plaster,
    M.facade,
  );
  g.block(x, z - depth / 2, width, depth, spring, top);
}
function gate(g) {
  const spring = 2.35,
    width = 3.2,
    depth = 6.8;
  for (const side of [-1, 1]) {
    g.wall(side * 2.05, 0, -depth / 2, 0.9, 6.4, depth, plaster, M.facade);
    g.box(side * 2.05, 0, 0.075, 1.0, 0.27, 0.65, 0xaa9271);
    for (let j = 0; j < 5; j++)
      g.box(side * 1.84, 0.3 + j * 0.42, 0.06, 0.46, 0.405, 0.4, color(stone, 0.92 + 0.025 * (j % 3)));
    g.box(side * 1.97, spring - 0.12, 0.04, 0.98, 0.21, 0.53, stone);
    // Recessed doors fold against the inner walls, leaving the passage open.
    g.box(side * 1.54, 0.12, -1.19, 0.085, 2.1, 1.46, wood, M.wood);
    for (const h of [0.42, 1.77]) g.box(side * 1.47, h, -1.18, 0.045, 0.075, 1.43, 0x544936, M.metal);
  }
  arch(g, 0, 0, width, spring, 6.4, depth, stone);
  for (let x = -1.25; x <= 1.3; x += 0.5) g.beam([x, 4.59, -0.4], [x, 4.59, -6.4], 0.071, wood, M.wood, 6);
  g.box(0, 6.4, -3.4, 5.24, 0.13, 7.2, 0xc8b18e);
  g.box(0, 6.53, -3.4, 5.3, 0.08, 7.25, stone);
  // A cloth curtain hangs to one side of the passage, with gathered folds.
  for (let j = 0; j < 12; j++) {
    const x = -1.43 + j * 0.04,
      z = -0.55 + 0.05 * Math.cos(j * 1.7);
    g.face(
      [
        [x, 0.3, z],
        [x + 0.04, 0.3, z + 0.016],
        [x + 0.04, 2.12, z + 0.016],
        [x, 2.12, z],
      ],
      0x8b6f53,
      M.linen,
    );
  }
}
function basket(g, x, y, z, r, height, covered = false) {
  g.post(
    x,
    y,
    z,
    [
      [0, r * 0.72],
      [0.035, r * 0.83],
      [height * 0.88, r],
      [height, r],
      [height + 0.025, r * 0.97],
      [height - 0.018, r * 0.87],
      [0.1, r * 0.62],
    ],
    0xb29769,
    M.wood,
    18,
  );
  for (let j = 1; j < 8; j++) {
    const a = j / 8,
      rad = r * (0.79 + 0.21 * a);
    g.post(
      x,
      y + height * a,
      z,
      [
        [0, rad],
        [0.011, rad + 0.006],
        [0.021, rad],
      ],
      j % 2 ? 0x8b744e : 0xcfb285,
      M.wood,
      18,
    );
  }
  if (covered)
    g.post(
      x,
      y + height,
      z,
      [
        [0, r * 0.94],
        [0.07, r * 0.78],
        [0.09, 0.01],
      ],
      0xb49a72,
      M.linen,
      18,
    );
}
function workshop(g, kit, x, z) {
  g.frame(x, z, 0, () => {
    const w = 5.15,
      d = 5.8,
      h = 3.85;
    g.wall(0, 0, -d, w, h, 0.28, plaster, M.facade);
    for (const side of [-1, 1]) {
      g.wall(side * (w / 2 - 0.15), 0, -d / 2, 0.3, h, d, plaster, M.facade);
      g.wall(side * (w / 2 - 0.25), 0, 0, 0.49, 2.9, 0.4, 0xb99270, M.facade);
      g.post(
        side * 2.17,
        0.03,
        0.5,
        [
          [0, 0.075],
          [2.75, 0.062],
        ],
        wood,
        M.wood,
        8,
      );
      g.beam([side * 2.17, 2.75, 0.5], [side * 2.17, 3.2, -0.9], 0.045, wood, M.wood);
    }
    g.box(0, 2.84, 0, w, 0.2, 0.45, wood, M.wood);
    g.box(0, 3.03, -d / 2, w, 0.82, d, plaster, M.facade);
    // The workroom has a single sloping roof, with its low eaves toward the street.
    for (let k = 0; k < 12; k++) {
      const xx = -w / 2 + (k * w) / 12,
        ww = w / 12;
      g.face(
        [
          [xx, 3.83, 0.3],
          [xx + ww, 3.83, 0.3],
          [xx + ww, 4.81, -d - 0.25],
          [xx, 4.81, -d - 0.25],
        ],
        0xb77d59,
        M.roof,
      );
    }
    g.box(0, 3.7, 0.28, w + 0.14, 0.13, 0.12, 0xc68a61);
    for (let i = 0; i < 8; i++) g.box(-2.07 + i * 0.15, 0.1, -0.08, 0.14, 2.64, 0.064, wood, M.wood);
    // Folded closing planks occupy one jamb while the potter works.
    g.wall(0.65, 0, -1.1, 2.6, 0.77, 0.88, 0x907255, M.wood);
    g.box(0.65, 0.77, -1.1, 2.75, 0.09, 1.0, 0xbaa07a, M.wood);
    for (let i = 0; i < 5; i++)
      kit.pot(-0.32 + i * 0.4, 0.86, -1.1, 0.11 + (i % 3) * 0.025, [0xc59164, 0xd1aa7d, 0xb57b55][i % 3]);
    for (let j = 0; j < 3; j++) {
      g.box(0, 1.04 + j * 0.6, -d + 0.24, 4.3, 0.09, 0.34, wood, M.wood);
      for (let k = 0; k < 7; k++)
        kit.pot(-1.82 + k * 0.58, 1.14 + j * 0.6, -d + 0.27, 0.14 + ((k + j) % 3) * 0.016, 0xbc936a);
    }
    g.post(
      -0.88,
      0.03,
      -2.7,
      [
        [0, 0.21],
        [0.4, 0.16],
        [0.43, 0.37],
        [0.48, 0.38],
      ],
      0x967655,
      M.wood,
      20,
    );
    // A small terracotta oil lamp and its filling hole sit beside the finished pots.
    g.post(
      0.92,
      0.86,
      -0.92,
      [
        [0, 0.085],
        [0.032, 0.11],
        [0.065, 0.105],
        [0.075, 0.042],
        [0.061, 0.024],
      ],
      0xc6986b,
      M.plaster,
      16,
    );
    g.beam([0.96, 0.91, -0.92], [1.12, 0.905, -0.92], 0.034, 0xc6986b, M.plaster, 8);
    ring(g, 0.83, 0.94, -0.92, 0.036, 0.009, 0xb78b63, true);
    basket(g, 1.98, 0.03, 0.69, 0.25, 0.4, true);
    g.block(1.98, 0.69, 0.55, 0.55, 0, 0.46);
  });
}
function residence(g, kit) {
  // Two narrow premises share the taller residence above, with an offset rear roof.
  for (const [x, id] of [
    [-2.72, 4],
    [2.72, 1],
  ])
    g.frame(x, 0, 0, () => kit.shop(5.44, 7.6, 5.34, id, false));
  const openings = [
    { x: -3.47, y: 6.03, w: 0.91, h: 1.43 },
    { x: -0.85, y: 6.03, w: 0.88, h: 1.43 },
    { x: 2.55, y: 6.03, w: 1.14, h: 1.43 },
    { x: -3.52, y: 9.02, w: 0.68, h: 1.04 },
    { x: -1.1, y: 9.02, w: 0.72, h: 1.04 },
    { x: 1.38, y: 9.02, w: 0.69, h: 1.04 },
    { x: 3.65, y: 9.02, w: 0.71, h: 1.04 },
  ];
  streetFront(g, 10.88, 7.6, 5.34, 11.28, 0xd4b48e, openings, 4);
  g.box(0, 8.2, 0.02, 10.95, 0.1, 0.2, 0xc3a27e);
  g.box(0, 11.22, -3.8, 11.15, 0.2, 7.88, stone);
  kit.roof(0, 11.42, -3.8, 11.5, 8.3, 1.15, 0xab785b);
  balcony(g, 2.54, 5.84, 0.09, 2.33, 0xb38661);
  // The upper house has a rear extension, visible above the courtyard wall.
  g.frame(-1.95, -7.54, pi, () => kit.house(6.36, 3.3, 8.7, true));
}
function courtyard(g, kit) {
  g.box(0, -0.06, -13.3, 15.8, 0.073, 13.0, 0xb7a58c, M.lime);
  g.box(0, 0.014, -13.25, 2.65, 0.023, 12.7, 0xc2b396, M.paving);
  for (const side of [-1, 1]) {
    g.wall(side * 8.0, 0, -13.2, 0.37, 5.35, 13.5, 0xbba480, M.facade);
    g.box(side * 7.97, 5.31, -13.2, 0.51, 0.18, 13.65, stone);
    // Covered storage bays shelter the jars and leave the centre for carrying loads.
    for (const z of [-9.0, -13.5, -18]) {
      g.post(
        side * 5.47,
        0,
        z,
        [
          [0, 0.14],
          [3.0, 0.12],
        ],
        0x8c7353,
        M.wood,
        9,
      );
      g.block(side * 5.47, z, 0.32, 0.32, 0, 3.12);
    }
    g.face(
      [
        [side * 8.0, 3.91, -6.9],
        [side * 5.4, 3.1, -6.9],
        [side * 5.4, 3.1, -19.4],
        [side * 8.0, 3.91, -19.4],
      ],
      0x9c7958,
      M.roof,
    );
    for (const z of [-8.1, -11.3, -15.7, -17.7]) {
      const xx = side * 6.85;
      kit.pot(xx, 0.05, z, 0.29 + (Math.round(z * 10) % 3) * 0.018, 0xb7845e);
      kit.pot(xx + side * 0.65, 0.05, z + 0.45, 0.24, 0xc4976b);
    }
  }
  // A modest rear gallery has three true openings, with a narrow store behind.
  const rear = -18.6;
  for (const x of [-7.1, -2.4, 2.4, 7.1]) {
    g.wall(x, 0, rear - 1.3, 0.69, 4.56, 2.6, 0xc8af87, M.facade);
    g.box(x, 2.27, rear + 0.04, 0.91, 0.18, 0.38, stone);
  }
  for (const x of [-4.74, 0, 4.74]) arch(g, x, rear, 4.0, 2.37, 5.15, 2.6, 0xc8b08b);
  g.wall(0, 0, -21.4, 15.0, 5.15, 0.35, 0xbca27d, M.facade);
  kit.roof(0, 5.15, -20.04, 15.5, 3.1, 0.64, 0xb7855d);
  // Roof runoff gathers in a lined cistern. A work pail rests on its broad lip.
  g.post(
    4.1,
    0.03,
    -10.5,
    [
      [0, 0.77],
      [0.45, 0.77],
      [0.57, 0.82],
      [0.68, 0.82],
      [0.68, 0.59],
      [0.18, 0.57],
    ],
    stone,
    M.lime,
    24,
  );
  g.block(4.1, -10.5, 1.65, 1.65, 0, 0.74);
  g.post(
    4.1,
    0.23,
    -10.5,
    [
      [0, 0.565],
      [0.008, 0.565],
      [0.009, 0],
    ],
    0x557b70,
    M.water,
    24,
  );
  basket(g, 4.75, 0.7, -10.6, 0.17, 0.25, true);
  g.beam([4.78, 1.14, -10.6], [4.98, 2.5, -10.59], 0.023, wood, M.wood, 7);
  for (const [x, z, r] of [
    [-4.1, -9.2, 0.34],
    [-3.7, -9.65, 0.29],
    [-4.7, -9.9, 0.26],
  ])
    basket(g, x, 0.04, z, r, 0.47);
  g.block(-4.2, -9.6, 1.5, 1.5, 0, 0.65);
  g.wall(-4.5, 0, -15.4, 2.1, 0.46, 0.67, 0xc9ae85, M.lime);
  g.box(-4.5, 0.46, -15.4, 2.25, 0.12, 0.81, stone);
  basket(g, -5.2, 0.59, -15.4, 0.19, 0.24, true);
  // Kitchen herbs sit where the courtyard receives direct light.
  g.box(3.25, 0.025, -15.6, 2.1, 0.18, 1.55, 0xab8f68, M.lime);
  g.box(3.25, 0.205, -15.6, 1.92, 0.02, 1.36, 0x8b7858, M.garden);
  herbBed(g, 3.25, -15.6, 1.73, 1.2, 87214);
  g.block(3.25, -15.6, 2.1, 1.55, 0, 0.52);
  // Water runs down a shallow stone channel, with a perforated cover at the drain.
  g.box(6.0, 0.018, -14.6, 0.23, 0.025, 6.2, 0x8e806a, M.lime);
  for (let j = 0; j < 6; j++) g.box(6.0, 0.044, -17.36 + j * 0.043, 0.23, 0.018, 0.016, 0x776e5a);
  for (const [x, z] of [
    [-5.8, -20],
    [5.9, -20.2],
  ]) {
    for (let i = 0; i < 3; i++)
      basket(g, x + (i % 2) * 0.49, 0.025, z + Math.floor(i / 2) * 0.48, 0.23, 0.57, true);
  }
  g.post(
    -2.4,
    0.04,
    -13.6,
    [
      [0, 0.055],
      [0.46, 0.055],
    ],
    wood,
    M.wood,
    9,
  );
  for (let j = 0; j < 3; j++) {
    const a = (j * 2 * pi) / 3;
    g.beam(
      [-2.4 + Math.cos(a) * 0.26, 0.03, -13.6 + Math.sin(a) * 0.26],
      [-2.4 + Math.cos(a) * 0.12, 0.44, -13.6 + Math.sin(a) * 0.12],
      0.029,
      wood,
      M.wood,
      7,
    );
  }
  g.post(
    -2.4,
    0.45,
    -13.6,
    [
      [0, 0.29],
      [0.065, 0.3],
      [0.07, 0.001],
    ],
    0xa08258,
    M.wood,
    18,
  );
  // Linen is pegged on a sagging line. The top edge stays pinned while its hem catches the air.
  const line = (t) => [-5.3 + 10.7 * t, 4.55 - 0.45 * Math.sin(pi * t), -12.6];
  for (let k = 0; k < 24; k++) g.beam(line(k / 24), line((k + 1) / 24), 0.009, 0x90795a, M.wood, 4);
  for (const [a, b, h, tint] of [
    [0.17, 0.32, 1.32, 0xd9cdb4],
    [0.45, 0.57, 0.77, 0x9a7a60],
    [0.66, 0.86, 1.55, 0xe0d5bc],
  ]) {
    for (let j = 0; j < 16; j++) {
      const at = (k, t) => {
        const u = a + ((b - a) * k) / 16,
          p = line(u);
        return [p[0], p[1] - 0.025 - h * t, -12.6 + 0.038 * Math.sin(k * 1.7) * (t + 0.12)];
      };
      g.face([at(j, 1), at(j + 1, 1), at(j + 1, 0), at(j, 0)], tint, M.hanging, [
        [j / 16, 1],
        [(j + 1) / 16, 1],
        [(j + 1) / 16, 0],
        [j / 16, 0],
      ]);
    }
    for (const t of [a + 0.014, b - 0.014]) {
      const p = line(t);
      g.box(p[0], p[1] - 0.035, p[2], 0.025, 0.085, 0.035, 0xa88e63, M.wood);
    }
  }
}
function loadingPorch(g, kit) {
  const w = 13.7,
    depth = 6.0,
    back = -depth;
  g.wall(0, 0, back, w, 4.7, 0.31, 0xd2bd98, M.facade);
  for (const side of [-1, 1]) g.wall((side * w) / 2, 0, -depth / 2, 0.32, 4.7, depth, 0xd2bd98, M.facade);
  for (const x of [-6.8, -2.25, 2.25, 6.8]) {
    g.post(
      x,
      0.02,
      0.48,
      [
        [0, 0.25],
        [0.15, 0.29],
        [0.25, 0.2],
        [3.47, 0.18],
        [3.55, 0.27],
        [3.69, 0.28],
      ],
      stone,
      M.lime,
      15,
    );
    g.block(x, 0.48, 0.54, 0.54, 0, 3.72);
  }
  g.box(0, 3.74, -2.61, w + 0.7, 0.2, 6.8, wood, M.wood);
  kit.roof(0, 3.94, -2.61, w + 0.91, 7.0, 0.78, 0xaf805f);
  for (const x of [-4.4, 0.6, 4.7]) {
    g.box(x, 0.06, -3.0, 1.65, 0.12, 1.07, wood, M.wood);
    for (let j = 0; j < 5; j++) g.box(x - 0.7 + j * 0.35, 0.17, -3, 0.3, 0.033, 1.07, 0xa38660, M.wood);
    for (let j = 0; j < 3; j++) kit.pot(x - 0.5 + j * 0.5, 0.21, -3, 0.21, 0xb78963);
    g.block(x, -3, 1.8, 1.25, 0, 0.9);
  }
  basket(g, -5.2, 0.04, -0.85, 0.42, 0.62, true);
  basket(g, -4.27, 0.04, -0.91, 0.35, 0.55, true);
  g.block(-4.7, -0.88, 1.9, 0.9, 0, 0.7);
  // A carrying frame leans against the side. Lashings follow the two wooden uprights.
  for (const x of [5.1, 5.76]) g.beam([x, 0.04, -4.9], [x, 1.68, -5.3], 0.027, wood, M.wood, 6);
  for (let j = 0; j < 5; j++)
    g.beam(
      [5.1, 0.3 + j * 0.27, -4.96 - j * 0.065],
      [5.76, 0.3 + j * 0.27, -4.96 - j * 0.065],
      0.025,
      wood,
      M.wood,
      6,
    );
}
export function buildMarketQuarter(g, kit) {
  const random = seeded(821031),
    firstBlock = g.blocks.length;
  // The wider northern and southern ends meet a densely joined middle block.
  for (const [x, z, w, d, h, id] of [
    [25.2, -47, 8.2, 6.1, 5.6, 0],
    [25.0, -38.9, 7.9, 6.9, 4.8, 3],
    [27.1, 37.8, 7.3, 7.1, 5.9, 5],
  ]) {
    g.frame(x, z, -pi / 2, () => kit.shop(w, d, h, id));
  }
  g.frame(25.7, -29.7, -pi / 2, () => kit.house(9.1, 7.5, 8.7, true));
  g.frame(27.5, -21.25, -pi / 2, () => workshop(g, kit, 0, 0));
  g.frame(27.4, 24.4, -pi / 2, () => loadingPorch(g, kit));
  // Every element in the middle shares one frame, keeping party walls and the passage aligned.
  g.frame(27.5, 0, -pi / 2, () => {
    g.frame(-11.75, -0.45, 0, () => residence(g, kit));
    workshop(g, kit, -3.13, -0.06);
    // A narrow arch is framed by the workshop and a quieter dwelling.
    g.frame(2.22, 0, 0, gate.bind(null, g));
    g.frame(8.67, -0.22, 0, () => kit.house(8.15, 7.7, 7.78, true));
    g.frame(14.05, -0.62, 0, () => kit.shop(2.8, 6.5, 5.3, 2));
    g.frame(2.22, 0, 0, () => courtyard(g, kit));
    // A householder has left an oil jar and a narrow bench beside the doorway.
    g.box(9.2, 0.27, 0.18, 1.56, 0.1, 0.41, wood, M.wood);
    for (const x of [8.62, 9.78]) g.box(x, 0, 0.18, 0.11, 0.3, 0.33, wood, M.wood);
    kit.pot(10.5, 0.02, 0.35, 0.26, 0xba825b);
    g.block(9.2, 0.18, 1.58, 0.5, 0, 0.4);
    for (const x of [-6.35, 5.1]) {
      for (let i = 0; i < 3; i++)
        g.box(x, 0.005 + i * 0.011, 0.33 + i * 0.08, 0.74, 0.022, 0.2, 0xb49d7c, M.lime);
    }
    // Shallow wheel grooves cross the gateway. Smoother strips mark the threshold.
    for (const side of [-1, 1])
      g.face(
        [
          [2.22 + side * 0.7 - 0.028, 0.023, 0.3],
          [2.22 + side * 0.7 + 0.028, 0.023, 0.3],
          [2.22 + side * 0.7 + 0.028, 0.023, -6.8],
          [2.22 + side * 0.7 - 0.028, 0.023, -6.8],
        ],
        0x8f8068,
        M.lime,
      );
    for (let j = 0; j < 6; j++) {
      const x = -4.8 + random() * 1.1,
        z = 0.65 + random() * 0.45;
      g.post(
        x,
        0.025,
        z,
        [
          [0, 0.09],
          [0.04, 0.13],
          [0.1, 0.08],
          [0.11, 0.02],
        ],
        0xba966a,
        M.plaster,
        7,
      );
    }
  });
  planBlocks = g.blocks.slice(firstBlock).filter((b) => b.bottom < 0.6 && b.top > 0.5);
}
export function drawMarketPlan(p, pt) {
  p.fillStyle = '#b7a285';
  for (const b of planBlocks) {
    const corners = [
      [-b.hx, -b.hz],
      [b.hx, -b.hz],
      [b.hx, b.hz],
      [-b.hx, b.hz],
    ];
    p.beginPath();
    corners.forEach(([x, z], i) => {
      const a = pt(b.x + x * b.c + z * b.s, b.z + z * b.c - x * b.s);
      if (i) p.lineTo(...a);
      else p.moveTo(...a);
    });
    p.closePath();
    p.fill();
  }
}
