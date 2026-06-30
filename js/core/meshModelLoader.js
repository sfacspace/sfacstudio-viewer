/**
 * OBJ / GLB / GLTF → PlayCanvas 엔티티 (충돌 블로커·씬 메시)
 */

export function getMeshFileKind(fileName) {
  const ext = (fileName || '').split('.').pop()?.toLowerCase();
  if (ext === 'obj') return 'obj';
  if (ext === 'glb' || ext === 'gltf') return 'glb';
  return null;
}

export function isMeshModelFileName(fileName) {
  return getMeshFileKind(fileName) != null;
}

/** cube와 동일: 비조명 emissive + 양면 (뒷면 컬링 없음) */
export function createMeshBlockerMaterial(pc) {
  const material = new pc.StandardMaterial();
  material.diffuse = new pc.Color(0.5, 0.5, 0.5, 1);
  material.emissive = new pc.Color(0.5, 0.5, 0.5, 1);
  material.emissiveIntensity = 1;
  material.useLighting = false;
  material.cull = pc.CULLFACE_NONE;
  material.update();
  return material;
}

/**
 * GLB 등 로드된 계층의 모든 render 머티리얼에 양면·밝기 적용
 * @param {object} rootEntity
 */
export function applyMeshBlockerRenderStyle(rootEntity) {
  const pc = window.pc;
  if (!pc || !rootEntity) return;

  const visit = (ent) => {
    if (!ent) return;
    const render = ent.render;
    if (render?.meshInstances?.length) {
      for (const mi of render.meshInstances) {
        const mat = mi.material;
        if (!mat) continue;
        mat.cull = pc.CULLFACE_NONE;
        mat.useLighting = false;
        if (!mat.emissive) {
          mat.emissive = new pc.Color(0.5, 0.5, 0.5);
        } else {
          mat.emissive.set(0.5, 0.5, 0.5);
        }
        mat.emissiveIntensity = 1;
        mat.update();
      }
    }
    for (const ch of ent.children || []) {
      visit(ch);
    }
  };

  visit(rootEntity);
}

/**
 * 단순 OBJ (v / vn / f) 파서
 * @param {string} text
 */
export function parseObjText(text) {
  const positions = [];
  const normals = [];
  const posOut = [];
  const nrmOut = [];
  const indices = [];
  let hasAnyNormal = false;

  const pushVertex = (pi, ni) => {
    const pIdx = (pi < 0 ? positions.length + pi : pi - 1) | 0;
    const p = positions[pIdx];
    if (!p) return;
    const outIdx = posOut.length / 3;
    posOut.push(p[0], p[1], p[2]);
    if (ni != null && ni !== 0) {
      const nIdx = (ni < 0 ? normals.length + ni : ni - 1) | 0;
      const n = normals[nIdx];
      if (n) {
        nrmOut.push(n[0], n[1], n[2]);
        hasAnyNormal = true;
      } else {
        nrmOut.push(0, 1, 0);
      }
    } else {
      nrmOut.push(0, 1, 0);
    }
    indices.push(outIdx);
  };

  const lines = text.split(/\r?\n/);
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const parts = line.split(/\s+/);
    const tag = parts[0];
    if (tag === 'v' && parts.length >= 4) {
      positions.push([parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])]);
    } else if (tag === 'vn' && parts.length >= 4) {
      normals.push([parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])]);
    } else if (tag === 'f' && parts.length >= 4) {
      const verts = parts.slice(1).map((tok) => {
        const seg = tok.split('/');
        return {
          pi: parseInt(seg[0], 10),
          ni: seg[2] ? parseInt(seg[2], 10) : null,
        };
      });
      for (let i = 1; i < verts.length - 1; i++) {
        pushVertex(verts[0].pi, verts[0].ni);
        pushVertex(verts[i].pi, verts[i].ni);
        pushVertex(verts[i + 1].pi, verts[i + 1].ni);
      }
    }
  }

  if (posOut.length < 9 || indices.length < 3) {
    throw new Error('OBJ에서 유효한 삼각형 메시를 찾지 못했습니다.');
  }

  const posArr = new Float32Array(posOut);
  const idxArr = new Uint32Array(indices);
  let normalsArr;
  if (hasAnyNormal && nrmOut.length === posOut.length) {
    normalsArr = new Float32Array(nrmOut);
  } else {
    normalsArr = computeFlatNormals(posArr, idxArr);
  }

  return {
    positions: posArr,
    normals: normalsArr,
    indices: idxArr,
  };
}

function computeFlatNormals(positions, indices) {
  const normals = new Float32Array(positions.length);
  const add = (vi, nx, ny, nz) => {
    const o = vi * 3;
    normals[o] += nx;
    normals[o + 1] += ny;
    normals[o + 2] += nz;
  };
  for (let t = 0; t < indices.length; t += 3) {
    const i0 = indices[t];
    const i1 = indices[t + 1];
    const i2 = indices[t + 2];
    const x0 = positions[i0 * 3];
    const y0 = positions[i0 * 3 + 1];
    const z0 = positions[i0 * 3 + 2];
    const x1 = positions[i1 * 3];
    const y1 = positions[i1 * 3 + 1];
    const z1 = positions[i1 * 3 + 2];
    const x2 = positions[i2 * 3];
    const y2 = positions[i2 * 3 + 1];
    const z2 = positions[i2 * 3 + 2];
    const ax = x1 - x0;
    const ay = y1 - y0;
    const az = z1 - z0;
    const bx = x2 - x0;
    const by = y2 - y0;
    const bz = z2 - z0;
    let nx = ay * bz - az * by;
    let ny = az * bx - ax * bz;
    let nz = ax * by - ay * bx;
    const len = Math.hypot(nx, ny, nz) || 1;
    nx /= len;
    ny /= len;
    nz /= len;
    add(i0, nx, ny, nz);
    add(i1, nx, ny, nz);
    add(i2, nx, ny, nz);
  }
  const vCount = positions.length / 3;
  for (let i = 0; i < vCount; i++) {
    const o = i * 3;
    const len = Math.hypot(normals[o], normals[o + 1], normals[o + 2]) || 1;
    normals[o] /= len;
    normals[o + 1] /= len;
    normals[o + 2] /= len;
  }
  return normals;
}

/**
 * @param {import('playcanvas').Application} app
 * @param {string} url
 * @param {string} fileName
 */
async function loadContainerFromUrl(app, url, fileName) {
  const pc = window.pc;
  const asset = new pc.Asset(fileName || 'model', 'container', { url });
  app.assets.add(asset);
  await new Promise((resolve, reject) => {
    const onErr = (err) => reject(err || new Error('container load failed'));
    asset.once('load', resolve);
    asset.once('error', onErr);
    app.assets.load(asset);
  });
  const entity = asset.resource.instantiateRenderEntity();
  entity.name = fileName || 'MeshModel';
  applyMeshBlockerRenderStyle(entity);
  return { entity, asset, blobUrl: url };
}

/**
 * @param {import('playcanvas').Application} app
 * @param {File} file
 * @param {(pct: number, msg?: string) => void} [onProgress]
 */
async function loadObjToEntity(app, file, onProgress) {
  const pc = window.pc;
  onProgress?.(15, 'OBJ 파싱…');
  const text = await file.text();
  const { positions, normals, indices } = parseObjText(text);

  onProgress?.(60, 'GPU 메시 업로드…');
  const device = app.graphicsDevice;
  const mesh = new pc.Mesh(device);
  mesh.setPositions(positions);
  mesh.setNormals(normals);
  mesh.setIndices(indices);
  mesh.update(pc.PRIMITIVE_TRIANGLES);

  const material = createMeshBlockerMaterial(pc);
  const meshInstance = new pc.MeshInstance(mesh, material);
  const entity = new pc.Entity(file.name || 'OBJ');
  entity.addComponent('render', {
    meshInstances: [meshInstance],
    castShadows: true,
    receiveShadows: true,
  });
  onProgress?.(100, '완료');
  return { entity, asset: null, blobUrl: null };
}

/**
 * @param {import('playcanvas').Application} app
 * @param {File} file
 * @param {(pct: number, msg?: string) => void} [onProgress]
 * @returns {Promise<{ entity: object, asset: object|null, blobUrl: string|null, meshFormat: string }>}
 */
export async function importMeshFileToEntity(app, file, onProgress) {
  const pc = window.pc;
  if (!pc || !app?.graphicsDevice) {
    throw new Error('PlayCanvas가 준비되지 않았습니다.');
  }

  const kind = getMeshFileKind(file.name);
  if (!kind) {
    throw new Error('지원하는 메시 확장자가 아닙니다 (.obj .glb .gltf)');
  }

  if (kind === 'obj') {
    const r = await loadObjToEntity(app, file, onProgress);
    r.entity._objectType = 'obj';
    r.entity._meshFormat = 'obj';
    return { ...r, meshFormat: 'obj' };
  }

  onProgress?.(10, 'GLB 로드…');
  const url = URL.createObjectURL(file);
  try {
    const r = await loadContainerFromUrl(app, url, file.name);
    r.entity._objectType = 'glb';
    r.entity._meshFormat = 'glb';
    onProgress?.(100, '완료');
    return { ...r, meshFormat: 'glb' };
  } catch (e) {
    URL.revokeObjectURL(url);
    throw e;
  }
}
