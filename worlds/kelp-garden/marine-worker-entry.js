import { buildSync } from "procedural-animals/src/core/build/pipeline.js";
import shark from "procedural-animals/src/species/shark/index.js";
import fish from "procedural-animals/src/species/fish/index.js";

// The upstream SDF, region, and coat code builds these meshes from their species and seed.
function packAnimal(species, variant, quality) {
  const data = buildSync(species, { variant, quality, seed: 1 });
  const settings = species.motion.variants[variant];
  const envelope = settings.envelope ?? species.motion.envelope;
  const waves = settings.wave ?? species.motion.wave;
  const render = typeof species.render === "function" ? species.render(data.params) : species.render;
  const markColor = render.markColor ?? [.008, .008, .009];
  let rear = Infinity;
  let nose = -Infinity;
  for (let i = 2; i < data.pos.length; i += 3) {
    rear = Math.min(rear, data.pos[i]);
    nose = Math.max(nose, data.pos[i]);
  }
  const mid = (nose + rear) * .5;
  const centerY = (data.joints.spine0 ?? data.eyes[0].c)[1];
  const vertices = [];
  const indices = Array.from(data.index);

  for (let i = 0; i < data.nV; i++) {
    const p = i * 3;
    const c = i * 4;
    const spot = (1 - smoothstep(-.0011, .0011, data.coat[c])) * Math.max(0, data.pat[c + 3]);
    const mark = 1 - smoothstep(-.0007, .0007, data.coat[c + 1]);
    const rgb = markColor.map((value, k) =>
      mix(mix(data.tint[c + k], data.pat[c + k], spot), value, mark));
    const skinNormal = data.nrm.subarray(p, p + 3);
    const inset = (1 - data.coat[c + 3]) * data.seamSink;
    vertices.push(
      data.pos[p] - skinNormal[0] * inset,
      data.pos[p + 1] - centerY - skinNormal[1] * inset,
      data.pos[p + 2] - mid - skinNormal[2] * inset,
      ...skinNormal, ...rgb, species.id === "shark" ? .30 : .57,
    );
  }
  for (const eye of data.eyes) {
    addEye(eye, [0, centerY, mid], vertices, indices);
  }

  return {
    vertices: new Float32Array(vertices),
    indices: new Uint32Array(indices),
    motion: new Float32Array([
      nose - rear, envelope.pow ?? -envelope.exp, envelope.head ?? 1,
      species.id === "shark" ? 1 : 0,
      ...waves.flatMap(row => row.slice(0, 4)),
    ]),
  };
}

function mix(a, b, t) { return a + (b - a) * t; }

function smoothstep(a, b, x) {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

// The renderer supplies its own glossy eye surface, in the upstream sockets.
function addEye(eye, center, vertices, indices) {
  const start = vertices.length / 10;
  const rows = 10, sides = 16;
  const radius = eye.spec.r * eye.scale;
  const pupil = [.003, .004, .0045];
  const iris = eye.look.iris.mid;
  for (let row = 0; row <= rows; row++) {
    const theta = row / rows * Math.PI;
    const radial = Math.sin(theta);
    const outward = Math.cos(theta);
    for (let column = 0; column <= sides; column++) {
      const angle = column / sides * 2 * Math.PI;
      const n = eye.z.map((v, axis) => v * outward +
        radial * (eye.x[axis] * Math.cos(angle) + eye.y[axis] * Math.sin(angle)));
      const p = n.map((v, axis) => eye.c[axis] - center[axis] + radius * v);
      const edge = smoothstep(.77, .93, outward);
      const color = iris.map((v, axis) => mix(v * .7, pupil[axis], edge));
      vertices.push(...p, ...n, ...color, .91);
      if (row < rows && column < sides) {
        const i = start + row * (sides + 1) + column;
        const next = i + sides + 1;
        indices.push(i, next, i + 1, i + 1, next, next + 1);
      }
    }
  }
}

export function buildMarineLife({ detailed = false } = {}) {
  return [
    packAnimal(shark, "blacktip", detailed ? "medium" : "low"),
    packAnimal(fish, "goldfish", "crowd"),
    packAnimal(shark, "white", "medium"),
  ];
}

if (typeof self !== "undefined") {
  self.onmessage = ({ data }) => {
    try {
      const meshes = buildMarineLife(data);
      const transfer = meshes.flatMap(mesh => [mesh.vertices.buffer, mesh.indices.buffer, mesh.motion.buffer]);
      self.postMessage({ meshes }, transfer);
    } catch (error) {
      self.postMessage({ error: error.message });
    }
  };
}
