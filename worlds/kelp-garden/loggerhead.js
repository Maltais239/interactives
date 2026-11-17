const modelUrl = "https://files.innerscene.com/library/loggerhead-sea-turtle-0f7b7b89/c31a8799bcbb09b75c4b/loggerhead-sea-turtle.glb";
const shader = `
@group(1) @binding(0) var loggerheadColor: texture_2d<f32>;
@group(1) @binding(1) var loggerheadSampler: sampler;
@group(1) @binding(2) var<uniform> loggerheadTint: vec4f;
@group(1) @binding(3) var loggerheadNormal: texture_2d<f32>;

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

fn loggerheadSweep(v: vec3f, angle: f32) -> vec3f {
  let c = cos(angle);
  let s = sin(angle);
  return vec3f(c*v.x + s*v.z, v.y, c*v.z - s*v.x);
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
  let bob = a * 1.3 + phase;
  let center = route.xyz + vec3f(cos(a) * route.w, sin(bob) * 0.65, sin(a) * route.w * 0.65);
  let forward = normalize(vec3f(-sin(a) * route.w, cos(bob) * 0.845,
    cos(a) * route.w * 0.65)) * sign(motion.y);
  let right = normalize(cross(vec3f(0., 1., 0.), forward));
  let up = cross(forward, right);

  let sideSign = sign(position.x);
  let pivot = vec3f(sideSign * 0.24, -0.03, 0.15);
  let finWeight = smoothstep(0.25, 0.52, abs(position.x)) * smoothstep(-0.2, 0.09, position.z);
  let beat = time * 1.6 + phase - abs(position.x) * 0.8;
  let stroke = (sin(beat) + 0.23 * sin(beat * 2.)) * 0.54 * sideSign * finWeight;
  let sweep = (0.11 + 0.24 * cos(beat)) * sideSign * finWeight;
  let bank = -0.16 * sign(motion.y) + 0.06 * sin(time * 1.6 + phase);
  let p = loggerheadRoll(pivot + loggerheadSweep(loggerheadRoll(position - pivot, stroke), sweep), bank);
  let n = loggerheadRoll(loggerheadSweep(loggerheadRoll(normal, stroke), sweep), bank);

  var result: LoggerheadVertex;
  result.world = center + (right * p.x + up * p.y + forward * p.z) * motion.z;
  result.clip = g.vp * vec4f(result.world, 1.);
  result.normal = right * n.x + up * n.y + forward * n.z;
  result.uv = uv;
  return result;
}

@fragment fn fsLoggerhead(i: LoggerheadVertex) -> @location(0) vec4f {
  let baseNormal = normalize(i.normal);
  let normalTexel = textureSample(loggerheadNormal, loggerheadSampler, i.uv).xyz * 2. - 1.;
  let worldX = dpdx(i.world);
  let worldY = dpdy(i.world);
  let uvX = dpdx(i.uv);
  let uvY = dpdy(i.uv);
  let det = uvX.x * uvY.y - uvX.y * uvY.x;
  let tangent = (worldX * uvY.y - worldY * uvX.y) * sign(det);
  let bitangent = (worldY * uvX.x - worldX * uvY.x) * sign(det);
  let relief = tangent * (normalTexel.x * inverseSqrt(max(dot(tangent, tangent), 1e-16)))
    + bitangent * (normalTexel.y * inverseSqrt(max(dot(bitangent, bitangent), 1e-16)));
  let N = normalize(baseNormal * max(normalTexel.z, .35) + relief * .48);
  let L = g.sun.xyz;
  let V = normalize(g.cam.xyz - i.world);
  let z = zone(i.world);
  let vv = vol(i.world);
  let ca = caus(i.world, length(i.world - g.cam.xyz));
  let alb = textureSample(loggerheadColor, loggerheadSampler, i.uv).rgb * loggerheadTint.rgb;
  let E = sunE(i.world.y, z) * shadow4(i.world + baseNormal * .14);
  let direct = sat(dot(N, L));
  let sky = amb(i.world, vec3f(0., 1., 0.), vv.g, z);
  let rim = pow(1. - sat(dot(baseNormal, V)), 3.);
  var c = alb * (E * direct * (.36 + ca * .55)
    + amb(i.world, baseNormal, vv.g, z) * 1.02 + side(i.world, baseNormal, 1., z) * .3);
  let gloss = 1. - loggerheadTint.a;
  let specular = pow(sat(dot(N, normalize(V + L))), mix(14., 56., gloss));
  c += E * specular * direct * mix(.07, .28, gloss) * (.4 + ca * .45);
  c += sky * rim * .24;
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

async function resizeTextures(meshes, resized) {
  if (typeof createImageBitmap !== "function") return;
  const limits = new Map();
  for (const { material } of meshes) {
    const color = material.map?.image;
    const normal = material.normalMap?.image;
    if (color) limits.set(color, Math.max(limits.get(color) ?? 0, normal ? 1024 : 256));
    if (normal) limits.set(normal, 1024);
  }
  for (const [image, limit] of limits) {
    const scale = limit / Math.max(image.width, image.height);
    if (scale >= 1) continue;
    try {
      resized.set(image, await createImageBitmap(image, {
        resizeWidth: Math.max(1, Math.round(image.width * scale)),
        resizeHeight: Math.max(1, Math.round(image.height * scale)),
        resizeQuality: "high",
        colorSpaceConversion: "none",
        premultiplyAlpha: "none",
      }));
    } catch {
      // Some browsers can upload the source image without resizing it.
    }
  }
}

const mipShader = `
@group(0) @binding(0) var mipImage: texture_2d<f32>;
@group(0) @binding(1) var mipSampler: sampler;
struct MipVertex {
  @builtin(position) clip: vec4f,
  @location(0) uv: vec2f,
}
@vertex fn mipVertex(@builtin(vertex_index) index: u32) -> MipVertex {
  let uv = vec2f(f32((index << 1u) & 2u), f32(index & 2u));
  return MipVertex(vec4f(uv * vec2f(2., -2.) + vec2f(-1., 1.), 0., 1.), uv);
}
@fragment fn mipFragment(i: MipVertex) -> @location(0) vec4f {
  return textureSample(mipImage, mipSampler, i.uv);
}
`;

function upload({ device, meshes, resized, pipeline, materialLayout, makeBuffer }) {
  const colorViews = new Map();
  const normalViews = new Map();
  const materials = new Map();
  const resources = [];
  const mipPipelines = new Map();
  const mipEncoder = device.createCommandEncoder();
  const mipModule = device.createShaderModule({ code: mipShader });
  const usage = GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST;
  const sampler = device.createSampler({
    magFilter: "linear", minFilter: "linear", mipmapFilter: "linear", maxAnisotropy: 4,
    addressModeU: "repeat", addressModeV: "repeat",
  });
  const mipSampler = device.createSampler({ minFilter: "linear", magFilter: "linear" });

  function viewFor(original, isNormal = false) {
    const views = isNormal ? normalViews : colorViews;
    if (views.has(original)) return views.get(original);
    const image = resized.get(original) ?? original;
    const size = image ? [image.width, image.height] : [1, 1];
    const format = isNormal ? "rgba8unorm" : "rgba8unorm-srgb";
    const mipLevelCount = 1 + Math.floor(Math.log2(Math.max(...size)));
    const texture = device.createTexture({
      size, format, mipLevelCount, usage: usage | GPUTextureUsage.RENDER_ATTACHMENT,
    });
    resources.push(texture);
    if (image) {
      device.queue.copyExternalImageToTexture({ source: image }, { texture }, size);
    } else {
      const pixel = isNormal ? [128, 128, 255, 255] : [255, 255, 255, 255];
      device.queue.writeTexture({ texture }, new Uint8Array(pixel), {}, size);
    }
    if (mipLevelCount > 1) {
      let mips = mipPipelines.get(format);
      if (!mips) {
        mips = device.createRenderPipeline({
          layout: "auto",
          vertex: { module: mipModule, entryPoint: "mipVertex" },
          fragment: { module: mipModule, entryPoint: "mipFragment", targets: [{ format }] },
        });
        mipPipelines.set(format, mips);
      }
      for (let level = 1; level < mipLevelCount; level++) {
        const source = texture.createView({ baseMipLevel: level - 1, mipLevelCount: 1 });
        const target = texture.createView({ baseMipLevel: level, mipLevelCount: 1 });
        const input = device.createBindGroup({
          layout: mips.getBindGroupLayout(0),
          entries: [{ binding: 0, resource: source }, { binding: 1, resource: mipSampler }],
        });
        const pass = mipEncoder.beginRenderPass({
          colorAttachments: [{ view: target, loadOp: "clear", storeOp: "store" }],
        });
        pass.setPipeline(mips);
        pass.setBindGroup(0, input);
        pass.draw(3);
        pass.end();
      }
    }
    const view = texture.createView();
    views.set(original, view);
    return view;
  }

  function bindMaterial(material) {
    if (materials.has(material)) return materials.get(material);
    const { r, g, b } = material.color;
    const tint = makeBuffer(new Float32Array([r, g, b, material.roughness ?? .55]), GPUBufferUsage.UNIFORM);
    resources.push(tint);
    const group = device.createBindGroup({
      layout: materialLayout,
      entries: [
        { binding: 0, resource: viewFor(material.map?.image) },
        { binding: 1, resource: sampler },
        { binding: 2, resource: { buffer: tint } },
        { binding: 3, resource: viewFor(material.normalMap?.image, true) },
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
    device.queue.submit([mipEncoder.finish()]);

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
      { binding: 3, visibility: GPUShaderStage.FRAGMENT, texture: {} },
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
  const resized = new Map();
  await resizeTextures(meshes, resized);
  device.pushErrorScope("out-of-memory");
  device.pushErrorScope("validation");
  let turtles;
  let uploadError;
  try {
    turtles = upload({ device, meshes, resized, pipeline, materialLayout, makeBuffer });
  } catch (error) {
    uploadError = error;
  } finally {
    for (const image of resized.values()) image.close();
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
