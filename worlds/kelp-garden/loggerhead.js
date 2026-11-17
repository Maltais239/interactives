const modelUrl = "https://files.innerscene.com/library/loggerhead-sea-turtle-0f7b7b89/c31a8799bcbb09b75c4b/loggerhead-sea-turtle.glb";
const shader = `
@group(1) @binding(0) var loggerheadColor: texture_2d<f32>;
@group(1) @binding(1) var loggerheadSampler: sampler;
@group(1) @binding(2) var<uniform> loggerheadTint: vec4f;

struct LoggerheadVertex {
  @builtin(position) clip: vec4f,
  @location(0) world: vec3f,
  @location(1) normal: vec3f,
  @location(2) uv: vec2f,
}

fn loggerheadRoll(v: vec3f, angle: f32) -> vec3f {
  let c = cos(angle);
  let s = sin(angle);
  return vec3f(c*v.x - s*v.y, s*v.x + c*v.y, v.z);
}

@vertex fn vsLoggerhead(
  @location(0) position: vec3f,
  @location(1) normal: vec3f,
  @location(4) uv: vec2f,
  @location(2) route: vec4f,
  @location(3) motion: vec4f,
) -> LoggerheadVertex {
  let time = g.cam.w;
  let phase = fract(motion.w) * 6.28318;
  let a = time * motion.y + motion.x;
  let center = route.xyz + vec3f(cos(a) * route.w,
    sin(a * 1.3 + phase) * 0.65, sin(a) * route.w * 0.65);
  let forward = normalize(vec3f(-sin(a), 0., cos(a) * 0.65)) * sign(motion.y);
  let right = cross(vec3f(0., 1., 0.), forward);
  let up = cross(forward, right);

  let sideSign = sign(position.x);
  let pivot = vec3f(sideSign * 0.22, 0., 0.);
  let finWeight = smoothstep(0.25, 0.52, abs(position.x));
  let stroke = (0.75 * sin(time * 1.65 + phase) + 0.25 * sin(time * 3.3 + phase))
    * 0.46 * sideSign * finWeight;
  let bodyRoll = 0.07 * sin(time * 1.65 + phase);
  let p = loggerheadRoll(pivot + loggerheadRoll(position - pivot, stroke), bodyRoll);
  let n = loggerheadRoll(normal, stroke + bodyRoll);

  var result: LoggerheadVertex;
  result.world = center + (right * p.x + up * p.y + forward * p.z) * motion.z;
  result.clip = g.vp * vec4f(result.world, 1.);
  result.normal = right * n.x + up * n.y + forward * n.z;
  result.uv = uv;
  return result;
}

@fragment fn fsLoggerhead(i: LoggerheadVertex) -> @location(0) vec4f {
  let N = normalize(i.normal);
  let L = g.sun.xyz;
  let V = normalize(g.cam.xyz - i.world);
  let z = zone(i.world);
  let vv = vol(i.world);
  let ca = caus(i.world, length(i.world - g.cam.xyz));
  let alb = textureSample(loggerheadColor, loggerheadSampler, i.uv).rgb * loggerheadTint.rgb;
  let E = sunE(i.world.y, z) * shadow4(i.world + N * .1);
  var c = alb * (E * (.18 + .82 * max(0., dot(N, L))) * (.35 + ca)
    + amb(i.world, N, vv.g, z) * 1.25 + side(i.world, N, 1., z) * .5);
  c += E * pow(max(0., dot(N, normalize(V + L))), 32.) * .16;
  return fin(fog(c, i.world, z));
}`;

async function loadModel() {
  const [three, { GLTFLoader }, response] = await Promise.all([
    import("three"),
    import("three/addons/loaders/GLTFLoader.js"),
    fetch(modelUrl, { signal: AbortSignal.timeout(30000) }),
  ]);
  if (!response.ok) throw new Error("Loggerhead download returned " + response.status);
  const bytes = await response.arrayBuffer();
  if (bytes.byteLength !== 6964816) throw new Error("Unexpected loggerhead model download size");
  const model = await new GLTFLoader().parseAsync(bytes, "");
  return { three, scene: model.scene };
}

function flattenModel(three, scene) {
  const { Box3, Matrix3, Vector3 } = three;
  scene.updateMatrixWorld(true);
  const bounds = new Box3().setFromObject(scene);
  if (bounds.isEmpty()) throw new Error("Loggerhead mesh has no bounds");
  const center = bounds.getCenter(new Vector3());
  const span = bounds.getSize(new Vector3());
  const point = new Vector3();
  const normal = new Vector3();
  const meshes = [];
  let headDirection;

  scene.traverse((mesh) => {
    if (!mesh.isMesh || !mesh.visible) return;
    const { geometry, material, matrixWorld } = mesh;
    const { position, normal: normals, uv } = geometry.attributes;
    if (!position || !normals || Array.isArray(material)) {
      throw new Error("Unexpected loggerhead mesh format");
    }

    if (/head/i.test(mesh.name) && !headDirection) {
      geometry.computeBoundingBox();
      headDirection = geometry.boundingBox.getCenter(new Vector3())
        .applyMatrix4(matrixWorld).sub(center);
    }

    const normalMatrix = new Matrix3().getNormalMatrix(matrixWorld);
    const uvSet = material.map?.channel;
    const textureCoordinates = (uvSet ? geometry.getAttribute("uv" + uvSet) : uv) ?? uv;
    const texturePoint = new three.Vector2();
    material.map?.updateMatrix();
    const vertices = new Float32Array(position.count * 8);
    for (let i = 0; i < position.count; i++) {
      point.fromBufferAttribute(position, i).applyMatrix4(matrixWorld).sub(center);
      normal.fromBufferAttribute(normals, i).applyNormalMatrix(normalMatrix);
      const offset = i * 8;
      vertices[offset] = point.x;
      vertices[offset + 1] = point.y;
      vertices[offset + 2] = point.z;
      vertices[offset + 3] = normal.x;
      vertices[offset + 4] = normal.y;
      vertices[offset + 5] = normal.z;
      if (textureCoordinates) {
        texturePoint.fromBufferAttribute(textureCoordinates, i);
        if (material.map) texturePoint.applyMatrix3(material.map.matrix);
        vertices[offset + 6] = texturePoint.x;
        vertices[offset + 7] = texturePoint.y;
      }
    }

    const indices = new Uint32Array(geometry.index?.count ?? position.count);
    for (let i = 0; i < indices.length; i++) indices[i] = geometry.index?.getX(i) ?? i;
    meshes.push({ vertices, indices, material });
  });
  if (!meshes.length) throw new Error("Loggerhead has no drawable meshes");

  // The head lies on the centreline. Use its named mesh when present, or find
  // the taller of the two centreline tips when the asset has generic names.
  const directions = [[0, 1], [0, -1], [2, 1], [2, -1]];
  const scores = new Float32Array(directions.length).fill(-Infinity);
  if (!headDirection || Math.hypot(headDirection.x, headDirection.z) < 0.12) {
    for (const { vertices } of meshes) {
      for (let offset = 0; offset < vertices.length; offset += 8) {
        for (let d = 0; d < directions.length; d++) {
          const [axis, sign] = directions[d];
          const along = vertices[offset + axis] * sign;
          const across = Math.abs(vertices[offset + 2 - axis]);
          const width = axis === 0 ? span.z : span.x;
          const length = axis === 0 ? span.x : span.z;
          if (across < width * 0.14 && along > length * 0.32) {
            scores[d] = Math.max(scores[d], vertices[offset + 1] + along * 0.12);
          }
        }
      }
    }
    headDirection = null;
  }

  let headAxis = 2;
  let headSign = 1;
  if (headDirection) {
    headAxis = Math.abs(headDirection.x) > Math.abs(headDirection.z) ? 0 : 2;
    headSign = Math.sign(headAxis === 0 ? headDirection.x : headDirection.z);
  } else {
    const peak = Math.max(...scores);
    if (Number.isFinite(peak)) [headAxis, headSign] = directions[scores.indexOf(peak)];
  }

  // Rotate the model to face +Z in the same coordinate system as wildlife.
  for (const { vertices } of meshes) {
    for (let offset = 0; offset < vertices.length; offset += 8) {
      for (const base of [offset, offset + 3]) {
        const x = vertices[base];
        const z = vertices[base + 2];
        vertices[base] = headSign * (headAxis === 0 ? -z : x);
        vertices[base + 2] = headSign * (headAxis === 0 ? x : z);
      }
    }
  }
  return meshes;
}

function upload({ device, meshes, pipeline, materialLayout, makeBuffer }) {
  const textures = new Map();
  const materials = new Map();
  const resources = [];
  const usage = GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST;
  const sampler = device.createSampler({
    magFilter: "linear", minFilter: "linear", addressModeU: "repeat", addressModeV: "repeat",
  });

  function viewFor(image) {
    if (textures.has(image)) return textures.get(image);
    const size = image ? [image.width, image.height] : [1, 1];
    const texture = device.createTexture({
      size, format: "rgba8unorm-srgb", usage: usage | GPUTextureUsage.RENDER_ATTACHMENT,
    });
    resources.push(texture);
    if (image) {
      device.queue.copyExternalImageToTexture({ source: image }, { texture }, size);
    } else {
      device.queue.writeTexture({ texture }, new Uint8Array([255, 255, 255, 255]), {}, size);
    }
    const view = texture.createView();
    textures.set(image, view);
    return view;
  }

  function bindMaterial(material) {
    if (materials.has(material)) return materials.get(material);
    const { r, g, b } = material.color;
    const tint = makeBuffer(new Float32Array([r, g, b, 1]), GPUBufferUsage.UNIFORM);
    resources.push(tint);
    const group = device.createBindGroup({
      layout: materialLayout,
      entries: [
        { binding: 0, resource: viewFor(material.map?.image) },
        { binding: 1, resource: sampler },
        { binding: 2, resource: { buffer: tint } },
      ],
    });
    materials.set(material, group);
    return group;
  }

  try {
    const parts = meshes.map(({ vertices, indices, material }) => {
      const vertexBuffer = makeBuffer(vertices, GPUBufferUsage.VERTEX);
      resources.push(vertexBuffer);
      const indexBuffer = makeBuffer(indices, GPUBufferUsage.INDEX);
      resources.push(indexBuffer);
      return { vertexBuffer, indexBuffer, count: indices.length, material: bindMaterial(material) };
    });

    return {
      destroy() {
        for (const resource of resources) resource.destroy();
      },
      draw(pass, routes, count) {
        pass.setPipeline(pipeline);
        pass.setVertexBuffer(1, routes);
        for (const part of parts) {
          pass.setBindGroup(1, part.material);
          pass.setVertexBuffer(0, part.vertexBuffer);
          pass.setIndexBuffer(part.indexBuffer, "uint32");
          pass.drawIndexed(part.count, count);
        }
      },
    };
  } catch (error) {
    for (const resource of resources) resource.destroy();
    throw error;
  }
}

export async function loadLoggerheadTurtles({
  device, sharedShader, sceneLayout, instanceLayout, makeBuffer, colorFormat, depthFormat, samples,
}) {
  const { three, scene } = await loadModel();
  const meshes = flattenModel(three, scene);
  const materialLayout = device.createBindGroupLayout({
    entries: [
      { binding: 0, visibility: GPUShaderStage.FRAGMENT, texture: {} },
      { binding: 1, visibility: GPUShaderStage.FRAGMENT, sampler: {} },
      { binding: 2, visibility: GPUShaderStage.FRAGMENT, buffer: {} },
    ],
  });
  const module = device.createShaderModule({ code: sharedShader + shader });
  const layout = device.createPipelineLayout({ bindGroupLayouts: [sceneLayout, materialLayout] });
  const pipeline = await device.createRenderPipelineAsync({
    layout,
    vertex: {
      module, entryPoint: "vsLoggerhead",
      buffers: [{
        arrayStride: 32,
        attributes: [
          { shaderLocation: 0, offset: 0, format: "float32x3" },
          { shaderLocation: 1, offset: 12, format: "float32x3" },
          { shaderLocation: 4, offset: 24, format: "float32x2" },
        ],
      }, instanceLayout],
    },
    fragment: { module, entryPoint: "fsLoggerhead", targets: [{ format: colorFormat }] },
    depthStencil: { format: depthFormat, depthWriteEnabled: true, depthCompare: "greater" },
    multisample: { count: samples },
  });
  device.pushErrorScope("out-of-memory");
  device.pushErrorScope("validation");
  let turtles;
  let uploadError;
  try {
    turtles = upload({ device, meshes, pipeline, materialLayout, makeBuffer });
  } catch (error) {
    uploadError = error;
  }
  const [validationError, allocationError] = await Promise.all([
    device.popErrorScope(), device.popErrorScope(),
  ]);
  const error = uploadError ?? validationError ?? allocationError;
  if (error) {
    turtles?.destroy();
    throw error;
  }
  return turtles;
}
