// Kestrel, a fictional WWII harbour tug. Dimensions and deck arrangement
// reference the 114-foot Army LT-5. Local +X is the bow and Y is up.
import { placeWreck } from "./wreck-placement.js?v=1";

const origin = [70.5, -43.65, 88.5];
const list = 0.157;
function heel([x, y, z]) {
  return [x, y * Math.cos(list) - z * Math.sin(list), z * Math.cos(list) + y * Math.sin(list)];
}
function world(point) {
  return heel(point).map((v, i) => v + origin[i]);
}
export const tug = {
  origin,
  waypoint: world([-3.4, 2.85, 3.65]),
  view: [...world([-13.5, 10.3, 18.0]), ...world([-4.55, 4.75, 0])],
};

const stations = [
  // Distance along keel, half beam at deck, sheer height, rise of keel.
  [-17.3, 0.06, 4.4, 3.42],
  [-16.9, 1.28, 4.37, 3.13],
  [-15.8, 2.42, 4.28, 2.66],
  [-13.8, 3.14, 4.12, 1.56],
  [-10, 3.6, 4.03, 0.32],
  [-5, 3.83, 4.04, 0],
  [0, 3.85, 4.23, 0],
  [5, 3.69, 4.62, 0.04],
  [10, 3.07, 5.08, 0.18],
  [13.5, 1.99, 5.52, 0.39],
  [16, 0.82, 5.92, 0.64],
  [17.55, 0.04, 6.23, 1.04],
];
function section(x) {
  let i = 1;
  while (i < stations.length - 1 && stations[i][0] < x) i++;
  const a = stations[i - 1],
    b = stations[i];
  const t = Math.max(0, Math.min(1, (x - a[0]) / (b[0] - a[0])));
  return [1, 2, 3].map((k) => a[k] + (b[k] - a[k]) * t);
}
function shell(x, h, side) {
  const [beam, sheer, keel] = section(x);
  const rake = Math.max(0, -10 - x) * 0.41 - Math.max(0, x - 9) * 0.26;
  const flare = 0.046 + 0.954 * Math.sin(h * Math.PI * 0.5) ** 0.69;
  return [
    x + rake * (1 - h),
    keel + (sheer - keel) * h,
    side * beam * flare * (1 + 0.028 * Math.sin(h * Math.PI)),
  ];
}
const tau = 2 * Math.PI;
const mixPoint = (a, b, t) => a.map((v, i) => v + t * (b[i] - v));
function skin(mesh, ...points) {
  mesh.quad(...points.map((p) => mesh.v(...p)));
}
function rod(mesh, path, radius, facets = 8, cap = true) {
  mesh.tube(path, radius, facets, cap, () => 1);
}
function loop(n, point) {
  return Array.from({ length: n + 1 }, (_, i) => point(((i % n) * tau) / n));
}
// Loft paired contours with shared normals along a curved face.
function join(mesh, a, b) {
  let previous;
  for (let n = 0; n < a.length; n++) {
    const pair = [mesh.v(...a[n]), mesh.v(...b[n])];
    if (previous) mesh.quad(previous[0], pair[0], pair[1], previous[1]);
    previous = pair;
  }
}
function hull(steel, iron) {
  for (const side of [-1, 1]) {
    // Torn edges change with each strake. The starboard tear runs from the
    // bilge almost to the gunwale; the smaller far-side tear admits light.
    for (let row = 0; row < 9; row++) {
      const h0 = row / 9,
        h1 = (row + 1) / 9;
      const torn = side > 0 ? row >= 2 && row <= 7 : row >= 4 && row <= 6;
      const edge = (h) =>
        side > 0
          ? [-5.8 + 0.65 * Math.sin(17 * h) + 0.44 * h, 0.7 + 1.12 * Math.sin(7 * h)]
          : [-4.4 + 0.42 * Math.cos(19 * h), -1.8 + 0.54 * Math.sin(11 * h)];
      const bands = torn
        ? [
            [-17.3, edge(h0)[0], -17.3, edge(h1)[0]],
            [edge(h0)[1], 17.55, edge(h1)[1], 17.55],
          ]
        : [[-17.3, 17.55, -17.3, 17.55]];
      for (const [a, b, c, d] of bands) {
        const n = Math.ceil(Math.max(b - a, d - c) / 0.55);
        const low = [],
          high = [];
        for (let i = 0; i <= n; i++) {
          const t = i / n;
          low.push(shell(a + (b - a) * t, h0, side));
          high.push(shell(c + (d - c) * t, h1, side));
        }
        join(steel, side > 0 ? low : high, side > 0 ? high : low);
      }
    }
    for (let i = 0; i < 26; i++) {
      const x = -15.6 + i * 1.21;
      const broken = side > 0 && x > -5.4 && x < 1.4;
      const top = broken && i % 3 !== 0 ? 0.26 + 0.065 * (i % 3) : 0.99;
      const path = Array.from({ length: 9 }, (_, j) => {
        const p = shell(x, (j * top) / 8, side);
        p[2] *= 0.961;
        return p;
      });
      iron.sweep(path, 0.105, 0.15, () => [1, 0, 0]);
    }
    for (const [a, b] of side > 0
      ? [
          [-17.3, -4.95],
          [-1.6, 17.55],
        ]
      : [[-17.3, 17.55]]) {
      const n = Math.ceil((b - a) / 0.4),
        guard = [];
      for (let i = 0; i <= n; i++) {
        const x = a + ((b - a) * i) / n,
          p = shell(x, 0.87, side);
        const curl = side > 0 ? Math.max(0, 1 - Math.min(Math.abs(x + 4.95), Math.abs(x + 1.6))) : 0;
        p[1] -= 0.42 * curl * curl;
        p[2] += side * (0.035 + 0.36 * curl * curl);
        guard.push(p);
      }
      rod(iron, guard, 0.095);
    }
    // Low wraparound bulwark with bent and missing stretches of its cap.
    for (const [a, b] of [
      [-17.3, -10.8],
      [-9.2, -6.8],
      [7.8, 17.55],
    ]) {
      const base = [],
        cap = [],
        n = Math.ceil((b - a) / 0.5);
      for (let i = 0; i <= n; i++) {
        const x = a + ((b - a) * i) / n,
          p = shell(x, 1, side);
        base.push(p);
        cap.push([p[0], p[1] + 0.54 + 0.09 * Math.cos(x), p[2] * 1.012]);
      }
      join(steel, base, cap);
      rod(iron, cap, 0.064);
    }
  }
  // Deck plates have camber, an open engine hatch, and a broken starboard edge.
  const deckPoint = (x, t) => {
    const [w, h] = section(x);
    return [x, h + 0.13 * (1 - t * t), w * t];
  };
  for (let i = 0; i < 64; i++) {
    const x = -17.3 + (34.85 * i) / 64,
      next = -17.3 + (34.85 * (i + 1)) / 64;
    const edges =
      x >= -5.8 && x < 0.6
        ? [
            [-1, -0.66],
            [0.72, 1],
          ]
        : [
            [-1, 0],
            [0, 1],
          ];
    for (const [u, v] of edges) {
      if (x < -2.5 && x > -4.9 && u > 0) continue;
      skin(steel, deckPoint(x, u), deckPoint(x, v), deckPoint(next, v), deckPoint(next, u));
    }
  }
  for (const x of [-17.3, 17.55]) {
    const a = [],
      b = [];
    for (let i = 0; i <= 10; i++) {
      a.push(shell(x, i / 10, -1));
      b.push(shell(x, i / 10, 1));
    }
    join(iron, a, b);
  }
}

function deckhouse(steel, pale, iron, bronze) {
  // Side plates have real round apertures. Each radial strip terminates against
  // the rectangular plate edge, leaving open water behind the bronze coaming.
  for (const side of [-1, 1]) {
    for (let i = 0; i < 6; i++) {
      const x = -4.2 + i * 1.8,
        z = side * 2.3,
        y = 5.78;
      if (side === 1 && i === 0) continue; // engine-room doorway
      const hole = loop(24, (a) => [x + 0.255 * Math.cos(a), y + 0.255 * Math.sin(a), z]);
      const surround = loop(24, (a) => {
        const c = Math.cos(a),
          s = Math.sin(a),
          k = Math.min(
            0.9 / Math.max(0.0001, Math.abs(c)),
            (s > 0 ? 1.1 : 1.7) / Math.max(0.0001, Math.abs(s)),
          );
        return [x + c * k, y + s * k, z];
      });
      // Insert the four rectangular corners explicitly between adjacent rays.
      const outer = [
        [-0.9, -1.7],
        [0.9, -1.7],
        [0.9, 1.1],
        [-0.9, 1.1],
      ];
      for (const [dx, dy] of outer) {
        const j = Math.floor((((Math.atan2(dy, dx) + tau) % tau) * 24) / tau);
        steel.tri(steel.v(...surround[j]), steel.v(x + dx, y + dy, z), steel.v(...surround[j + 1]));
      }
      join(steel, surround, hole);
      rod(bronze, hole, 0.043, 7);
    }
  }
  // Roof overhangs the walkway. A sloping front breaks the rectangular outline.
  skin(steel, [5.7, 4.35, -2.3], [6.15, 6.88, -2.3], [6.15, 6.88, 2.3], [5.7, 4.35, 2.3]);
  skin(iron, [-5.1, 4.1, -2.3], [-5.1, 6.88, -2.3], [-5.1, 6.88, 0.45], [-5.1, 4.1, 0.45]);
  skin(steel, [-5.4, 6.89, -2.56], [-5.4, 6.89, 2.56], [6.5, 6.89, 2.56], [6.5, 6.89, -2.56]);

  const bridge = [
    [0.6, -1.94],
    [4.95, -1.94],
    [6.12, -1.16],
    [6.12, 1.16],
    [4.95, 1.94],
    [0.6, 1.94],
  ];
  const at = (p, y) => [p[0] + 0.1 * (y - 7), y, p[1]];
  for (let i = 0; i < bridge.length; i++) {
    const a = bridge[i],
      b = bridge[(i + 1) % bridge.length];
    skin(pale, at(a, 6.92), at(b, 6.92), at(b, 7.88), at(a, 7.88));
    skin(pale, at(a, 9.05), at(b, 9.05), at(b, 9.28), at(a, 9.28));
    const n = Math.ceil(Math.hypot(a[0] - b[0], a[1] - b[1]) / 1.35);
    for (let j = 0; j < n; j++) {
      const p = mixPoint(a, b, j / n);
      rod(iron, [at(p, 7.84), at(p, 9.13)], 0.071, 8);
    }
    // Forward half of the bridge roof survived; the rear edge peeled away.
    const over = (p) => [3.5 + (p[0] - 3.5) * 1.08 + 0.23, 9.32, p[1] * 1.11];
    const centre = [3.65, 9.48, 0];
    if (i > 0 && i < 5) pale.tri(pale.v(...centre), pale.v(...over(b)), pale.v(...over(a)));
    rod(iron, [over(a), over(b)], 0.071, 8);
  }
  // Wheel visible through the forward windows.
  rod(
    iron,
    [
      [4.9, 6.98, 0],
      [5.07, 7.72, 0],
    ],
    0.115,
  );
  const wheel = loop(24, (a) => [
    5.04 + 0.12 * Math.cos(a),
    7.95 + 0.4 * Math.cos(a),
    0.4 * Math.sin(a),
  ]);
  rod(bronze, wheel, 0.043, 8);
  for (let i = 0; i < 6; i++) rod(bronze, [[5.04, 7.95, 0], wheel[4 * i]], 0.024, 6);
  for (const side of [-1, 1]) {
    const z = side * 2.66;
    const posts = side > 0 ? [-4.9, -3.25, -1.6, 0.05] : [-4.9, -3.25, -1.6, 0.05, 1.7, 3.35, 5, 6.25];
    const top = posts.map((x) => [x, 7.77, z + 0.025 * Math.cos(x)]);
    if (side > 0) top.push([1.2, 7.52, z + 0.27], [2, 7.12, z + 0.56]);
    rod(iron, top, 0.043, 7);
    for (const x of posts)
      rod(
        iron,
        [
          [x, 6.89, z],
          [x, 7.77, z],
        ],
        0.039,
        7,
      );
  }
  // Ladder has enough room between the rails for a person.
  for (const z of [0.56, 1.12])
    rod(
      iron,
      [
        [-5.48, 4.14, z],
        [-5.59, 7.14, z],
      ],
      0.038,
      7,
    );
  for (let i = 0; i < 9; i++)
    rod(
      iron,
      [
        [-5.54, 4.46 + i * 0.29, 0.56],
        [-5.54, 4.46 + i * 0.29, 1.12],
      ],
      0.033,
      7,
    );
}

function machinery(steel, pale, iron, bronze) {
  // Elliptical, raked funnel. The interior descends below the folded rim.
  function funnel(a, h, inset = 0) {
    return [
      -1.85 - 0.28 * h + (1.02 - 0.04 * h - inset) * Math.cos(a),
      6.91 + h,
      0.04 * h + (0.75 - 0.028 * h - inset) * Math.sin(a),
    ];
  }
  const bottom = loop(48, (a) => funnel(a, 0));
  const rim = loop(48, (a) => {
    const notch = Math.max(0, 1 - Math.abs(a - 1.7) / 0.86);
    return funnel(a, 3.67 - 1.31 * notch + 0.13 * Math.sin(7 * a) + 0.06 * Math.sin(11 * a));
  });
  const inside = rim.map(([x, y, z]) => [
    x + 0.065 * (-1.85 - 0.28 * (y - 6.91) - x),
    y - 0.045,
    z * 0.93,
  ]);
  join(steel, bottom, rim);
  join(iron, rim, inside);
  join(
    iron,
    inside,
    loop(48, (a) => funnel(a, 0.06, 0.09)),
  );
  for (const h of [0.15, 0.34, 1.78, 2.12])
    rod(
      h === 2.12 ? pale : iron,
      loop(36, (a) => funnel(a, h)),
      0.045,
      7,
    );
  // Broken signal mast and surviving shroud with a relaxed curve.
  rod(
    iron,
    [
      [0.18, 6.89, -0.76],
      [-0.14, 9.38, -0.71],
      [-0.63, 11.42, -0.49],
    ],
    (i) => [0.17, 0.132, 0.093][i],
    12,
    false,
  );
  rod(
    iron,
    [
      [-0.44, 10.55, -1.82],
      [-0.43, 10.56, 0.24],
    ],
    0.063,
  );
  rod(
    iron,
    [
      [-0.63, 11.37, -0.49],
      [0.45, 9.23, -1.55],
      [2.72, 6.92, -2.53],
    ],
    0.025,
    6,
  );
  rod(
    iron,
    [
      [-0.5, 10.56, 0.16],
      [-1.85, 8.89, 1.11],
      [-4.68, 6.91, 2.45],
    ],
    0.028,
    6,
  );

  // Towing winch on two cheek plates, with wire wound around the drum.
  const x = -8.05,
    y = 5.16;
  for (const z of [-1.24, 1.24]) {
    skin(iron, [x - 1.02, 4.14, z], [x + 1.02, 4.14, z], [x + 0.52, 5.57, z], [x - 0.52, 5.57, z]);
    rod(
      iron,
      [
        [x, y, z - 0.09],
        [x, y, z + 0.09],
      ],
      0.95,
      24,
    );
  }
  rod(
    iron,
    [
      [x, y, -1.44],
      [x, y, 1.44],
    ],
    0.49,
    24,
  );
  const wire = [];
  for (let i = 0; i <= 260; i++) {
    const a = (i / 20) * tau;
    wire.push([x + 0.54 * Math.cos(a), y + 0.54 * Math.sin(a), -1.1 + (2.2 * i) / 260]);
  }
  rod(iron, wire, 0.071, 6);
  // A curved towing bow lifted the hawser clear of the rounded stern.
  rod(
    iron,
    [
      [-10.5, 4.18, -2.77],
      [-10.5, 5.03, -2.56],
      [-10.5, 5.47, -1.7],
      [-10.5, 5.58, 0],
      [-10.5, 5.44, 1.7],
      [-10.3, 4.96, 2.52],
      [-10.05, 4.14, 2.7],
    ],
    0.096,
    10,
  );
  for (const [bx, bz] of [
    [-12.35, 1.42],
    [-12.35, -1.42],
    [10.7, 1.45],
    [10.7, -1.45],
  ]) {
    const h = section(bx)[1] + 0.09;
    for (const dx of [-0.34, 0.34])
      rod(
        iron,
        [
          [bx + dx, h - 0.07, bz],
          [bx + dx, h + 0.1, bz],
          [bx + dx, h + 0.64, bz],
          [bx + dx, h + 0.73, bz],
        ],
        (i) => [0.25, 0.182, 0.185, 0.248][i],
        12,
      );
  }
  // Exposed diesel block, heads and the pipe running the length of the engine.
  iron.sweep(
    [
      [-5.6, 1.32, -0.77],
      [0.25, 1.32, -0.77],
    ],
    1.47,
    0.73,
  );
  for (let i = 0; i < 6; i++) {
    const cx = -5.02 + i * 0.86;
    rod(
      iron,
      [
        [cx, 1.44, -0.75],
        [cx, 2.35, -0.75],
        [cx, 2.55, -0.75],
      ],
      (j) => [0.42, 0.45, 0.39][j],
      12,
    );
    iron.sweep(
      [
        [cx - 0.33, 2.59, -0.75],
        [cx + 0.33, 2.59, -0.75],
      ],
      0.77,
      0.19,
    );
    rod(
      bronze,
      [
        [cx, 2.66, -0.49],
        [cx + 0.14, 2.81, -0.3],
        [cx + 0.18, 2.81, 0.1],
        [cx + 0.23, 2.45, 0.18],
      ],
      0.042,
      7,
    );
  }
  rod(
    iron,
    [
      [-5.45, 2.4, 0.14],
      [-4.9, 2.33, 0.19],
      [-0.4, 2.33, 0.19],
      [0.24, 2.18, -0.08],
    ],
    0.125,
    10,
  );
  // Cast screw under the counter. Blade sections change pitch and sweep from root to tip.
  rod(
    bronze,
    [
      [-15.63, 1.72, 0],
      [-15.35, 1.72, 0],
      [-14.85, 1.72, 0],
      [-13.4, 1.72, 0],
    ],
    (i) => [0.1, 0.28, 0.3, 0.15][i],
    18,
  );
  for (let i = 0; i < 3; i++) {
    const angle = 0.6 + (tau * i) / 3;
    const left = [],
      ridge = [],
      right = [];
    for (const [r, w, twist, sweep] of [
      [0.2, 0.15, 0.27, 0],
      [0.52, 0.32, 0.24, 0.025],
      [1, 0.48, 0.18, 0.13],
      [1.39, 0.34, 0.11, 0.26],
      [1.49, 0.075, 0.04, 0.39],
    ]) {
      for (const [edge, arr] of [
        [-1, left],
        [0, ridge],
        [1, right],
      ]) {
        const t = edge * w + sweep;
        arr.push([
          -15.17 + edge * twist - (1 - Math.abs(edge)) * 0.064,
          1.72 + r * Math.cos(angle) - t * Math.sin(angle),
          r * Math.sin(angle) + t * Math.cos(angle),
        ]);
      }
    }
    join(bronze, left, ridge);
    join(bronze, ridge, right);
  }
  rod(
    iron,
    [
      [-16.02, 0.43, 0],
      [-16.02, 3.46, 0],
    ],
    0.113,
    10,
  );
  iron.sweep(
    [
      [-16.94, 1.61, 0.13],
      [-16.18, 1.7, 0],
    ],
    0.17,
    2.18,
  );
}

function salvageDetails(steel, pale, iron) {
  // Rolled edge of a torn plate; the bitten free edge has a different profile
  // from the crease still welded to the hull.
  const crease = [],
    fold = [],
    torn = [];
  for (const [x, level, drop, flare] of [
    [0.75, 0.68, 0.2, 0.21],
    [1.08, 0.57, 0.47, 0.52],
    [1.15, 0.49, 0.34, 0.65],
    [1.52, 0.43, 0.65, 0.49],
    [1.91, 0.36, 0.38, 0.34],
    [2.27, 0.31, 0.27, 0.16],
  ]) {
    const p = shell(x, level, 1);
    crease.push(p);
    fold.push([p[0] - 0.17, p[1] - 0.13, p[2] + 0.32]);
    torn.push([p[0] - 0.26 - flare, p[1] - drop, p[2] + flare + 0.31]);
  }
  join(steel, crease, fold);
  join(iron, fold, torn);
  // Stockless anchor against the bow, with its chain looped over the windlass.
  // Seating points follow the taper of the bow plating.
  const pin = shell(13.2, 0.91, 1);
  pin[2] += 0.13;
  const [x, y, z] = pin;
  const crown = [x - 0.58, y - 1.35, z + 0.54];
  rod(iron, [pin, crown], 0.116, 10);
  for (const side of [-1, 1]) {
    const elbow = [crown[0] + side * 0.43, crown[1] + 0.16, crown[2] + 0.04];
    const tip = [crown[0] + side * 0.77, crown[1] + 0.71, crown[2] + 0.14];
    rod(iron, [crown, elbow, tip], (i) => [0.13, 0.16, 0.036][i], 8);
    iron.tri(
      iron.v(...tip),
      iron.v(elbow[0] - 0.2, elbow[1] - 0.02, elbow[2]),
      iron.v(elbow[0] + 0.2, elbow[1] - 0.02, elbow[2] + 0.08),
    );
  }
  rod(
    iron,
    [
      [10.9, 5.54, -0.79],
      [10.9, 5.54, 0.79],
    ],
    0.28,
    14,
  );
  for (const cz of [-0.65, 0.65])
    rod(
      iron,
      [
        [10.9, 5.54, cz - 0.07],
        [10.9, 5.54, cz + 0.07],
      ],
      0.42,
      16,
    );
  const chain = [
    pin,
    [x + 0.35, y + 0.22, z - 0.04],
    [13.68, 6.1, 1.97],
    [13.36, 5.76, 1.65],
    [12.6, 5.58, 1.31],
    [11, 5.48, 0.69],
  ];
  for (let i = 1, n = 0; i < chain.length; i++) {
    const a = chain[i - 1],
      b = chain[i],
      delta = b.map((v, k) => v - a[k]),
      length = Math.hypot(...delta);
    const along = delta.map((v) => v / length),
      cross = [along[2], 0, -along[0]],
      norm = Math.hypot(...cross) || 1;
    const side = cross.map((v) => v / norm);
    const up = [along[1] * side[2], along[2] * side[0] - along[0] * side[2], -along[1] * side[0]];
    const links = Math.ceil(length / 0.135);
    for (let j = 0; j < links; j++, n++) {
      const p = mixPoint(a, b, (j + 0.5) / links),
        axis = n % 2 ? side : up;
      const link = loop(10, (t) =>
        p.map((v, k) => v + 0.109 * Math.cos(t) * along[k] + 0.061 * Math.sin(t) * axis[k]),
      );
      rod(iron, link, 0.022, 5);
    }
  }

  // A few hanging rusticles under the broken gunwale. Growth follows gravity
  // after the hull has listed.
  for (const [cx, count] of [
    [-12.6, 10],
    [-5.7, 13],
    [1.6, 13],
    [8.5, 7],
  ]) {
    for (let i = 0; i < count; i++) {
      const p = shell(cx + 0.065 * i + 0.11 * Math.sin(i * 2.3), 0.87, 1);
      const h = 0.1 + 0.3 * (0.5 + 0.5 * Math.sin(i * 4.3 + cx));
      rod(
        iron,
        [
          [p[0], p[1], p[2] + 0.055],
          [p[0] + 0.023, p[1] - 0.065, p[2] + 0.09],
          [p[0] + 0.019, p[1] - h, p[2] + 0.09 + h * 0.15],
        ],
        (j) => [0.037, 0.047, 0.006][j],
        5,
      );
    }
  }
  // Narrow painted draft marks on the stem; the texture breaks up the paint.
  for (const side of [-1, 1]) {
    for (let i = 0; i < 10; i++) {
      const h = 0.26 + i * 0.063,
        left = 15.1 + i * 0.094,
        right = left + (i % 2 ? 0.18 : 0.3);
      const mark = (x, y) => {
        const p = shell(x, y, side);
        p[2] += side * 0.019;
        return p;
      };
      skin(pale, mark(left, h), mark(right, h), mark(right, h + 0.008), mark(left, h + 0.008));
    }
  }
}

// Small clusters of tube sponges establish the scale of openings and railings.
// Each open mouth shares a rim with a dark, recessed inner wall.
function colonies(pale, iron) {
  for (const [x, y, z, count] of [
    [5, 9.3, 1.88, 7],
    [-4.8, 6.89, 2.2, 9],
    [-10.6, 4.16, 2.51, 8],
    [10.8, 5.31, 1.37, 7],
    [-1.3, 6.89, -1.69, 6],
  ]) {
    for (let i = 0; i < count; i++) {
      const t = i * 2.4,
        r = 0.155 * Math.sqrt(i),
        cx = x + r * Math.cos(t),
        cz = z + r * Math.sin(t);
      const h = 0.14 + 0.25 * (0.5 + 0.5 * Math.sin(i * 3.7 + x)),
        radius = 0.064 + 0.03 * (0.5 + 0.5 * Math.sin(i * 2.1));
      const ring = (dy, size) =>
        loop(9, (a) => [
          cx + (0.08 * dy) / h + radius * size * Math.cos(a),
          y + dy,
          cz + radius * size * Math.sin(a),
        ]);
      const foot = ring(-0.064, 0.69),
        lip = ring(h, 1),
        bore = ring(h - 0.012, 0.68);
      join(pale, foot, lip);
      join(pale, lip, bore);
      join(iron, bore, ring(h - 0.087, 0.36));
    }
  }
}

export function buildTug(Mesh) {
  const steel = new Mesh(),
    pale = new Mesh(),
    iron = new Mesh(),
    bronze = new Mesh();
  hull(steel, iron);
  deckhouse(steel, pale, iron, bronze);
  machinery(steel, pale, iron, bronze);
  colonies(pale, iron);
  salvageDetails(steel, pale, iron);
  return [steel, pale, iron, bronze].map((mesh) => {
    // Bake the list before deriving the normals and collision triangles. Every
    // rendering and navigation pass then sees the same grounded surfaces.
    for (let i = 0; i < mesh.p.length; i += 3) {
      const y = mesh.p[i + 1],
        z = mesh.p[i + 2];
      mesh.p[i + 1] = y * Math.cos(list) - z * Math.sin(list);
      mesh.p[i + 2] = z * Math.cos(list) + y * Math.sin(list);
    }
    return mesh.build();
  });
}
export function placeTug(Mesh, catalog, solids) {
  return placeWreck(buildTug(Mesh), [9, 10, 6, 7], origin, catalog, solids);
}
