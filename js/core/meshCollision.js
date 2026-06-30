/**
 * OBJ/GLB 메시 블로커 — 삼각형 vs 플레이어 AABB 충돌 (바운딩 박스 대신 면 단위).
 */

import {
  COLLISION_AABB_PADDING,
  computeEntityWorldAabb,
  isMeshBlockerObject,
} from './collisionBlockers.js';

export const COLLISION_MESH_SKIN = 0.02;
const FLOOR_NY = 0.25;
const CEIL_NY = -0.25;

export function triangleIntersectsAabb(aabb, x0, y0, z0, x1, y1, z1, x2, y2, z2) {
  const cx = (aabb.minX + aabb.maxX) * 0.5;
  const cy = (aabb.minY + aabb.maxY) * 0.5;
  const cz = (aabb.minZ + aabb.maxZ) * 0.5;
  const hx = (aabb.maxX - aabb.minX) * 0.5;
  const hy = (aabb.maxY - aabb.minY) * 0.5;
  const hz = (aabb.maxZ - aabb.minZ) * 0.5;

  let v0x = x0 - cx;
  let v0y = y0 - cy;
  let v0z = z0 - cz;
  let v1x = x1 - cx;
  let v1y = y1 - cy;
  let v1z = z1 - cz;
  let v2x = x2 - cx;
  let v2y = y2 - cy;
  let v2z = z2 - cz;

  let e0x = v1x - v0x;
  let e0y = v1y - v0y;
  let e0z = v1z - v0z;
  let e1x = v2x - v1x;
  let e1y = v2y - v1y;
  let e1z = v2z - v1z;
  let e2x = v0x - v2x;
  let e2y = v0y - v2y;
  let e2z = v0z - v2z;

  const axisTestX01 = (a, b, fa, fb) => {
    const p0 = a * v0y - b * v0z;
    const p2 = a * v2y - b * v2z;
    let min = p0 < p2 ? p0 : p2;
    let max = p0 > p2 ? p0 : p2;
    const rad = fa * hy + fb * hz;
    if (min > rad || max < -rad) return false;
    return true;
  };
  const axisTestX2 = (a, b, fa, fb) => {
    const p0 = a * v0y - b * v0z;
    const p1 = a * v1y - b * v1z;
    let min = p0 < p1 ? p0 : p1;
    let max = p0 > p1 ? p0 : p1;
    const rad = fa * hy + fb * hz;
    if (min > rad || max < -rad) return false;
    return true;
  };
  const axisTestY02 = (a, b, fa, fb) => {
    const p0 = -a * v0x + b * v0z;
    const p2 = -a * v2x + b * v2z;
    let min = p0 < p2 ? p0 : p2;
    let max = p0 > p2 ? p0 : p2;
    const rad = fa * hx + fb * hz;
    if (min > rad || max < -rad) return false;
    return true;
  };
  const axisTestY1 = (a, b, fa, fb) => {
    const p0 = -a * v0x + b * v0z;
    const p1 = -a * v1x + b * v1z;
    let min = p0 < p1 ? p0 : p1;
    let max = p0 > p1 ? p0 : p1;
    const rad = fa * hx + fb * hz;
    if (min > rad || max < -rad) return false;
    return true;
  };
  const axisTestZ12 = (a, b, fa, fb) => {
    const p1 = a * v1x - b * v1y;
    const p2 = a * v2x - b * v2y;
    let min = p1 < p2 ? p1 : p2;
    let max = p1 > p2 ? p1 : p2;
    const rad = fa * hx + fb * hy;
    if (min > rad || max < -rad) return false;
    return true;
  };
  const axisTestZ0 = (a, b, fa, fb) => {
    const p0 = a * v0x - b * v0y;
    const p1 = a * v1x - b * v1y;
    let min = p0 < p1 ? p0 : p1;
    let max = p0 > p1 ? p0 : p1;
    const rad = fa * hx + fb * hy;
    if (min > rad || max < -rad) return false;
    return true;
  };

  const fa = Math.abs(e0x);
  const fb = Math.abs(e0y);
  const fc = Math.abs(e0z);
  if (!axisTestX01(e0z, e0y, fc, fb)) return false;
  if (!axisTestY02(e0z, e0x, fc, fa)) return false;
  if (!axisTestZ12(e0y, e0x, fb, fa)) return false;

  const fa1 = Math.abs(e1x);
  const fb1 = Math.abs(e1y);
  const fc1 = Math.abs(e1z);
  if (!axisTestX01(e1z, e1y, fc1, fb1)) return false;
  if (!axisTestY02(e1z, e1x, fc1, fa1)) return false;
  if (!axisTestZ0(e1y, e1x, fb1, fa1)) return false;

  const fa2 = Math.abs(e2x);
  const fb2 = Math.abs(e2y);
  const fc2 = Math.abs(e2z);
  if (!axisTestX2(e2z, e2y, fc2, fb2)) return false;
  if (!axisTestY1(e2z, e2x, fc2, fa2)) return false;
  if (!axisTestZ0(e2y, e2x, fb2, fa2)) return false;

  let min = v0x < v1x ? (v0x < v2x ? v0x : v2x) : v1x < v2x ? v1x : v2x;
  let max = v0x > v1x ? (v0x > v2x ? v0x : v2x) : v1x > v2x ? v1x : v2x;
  if (min > hx || max < -hx) return false;

  min = v0y < v1y ? (v0y < v2y ? v0y : v2y) : v1y < v2y ? v1y : v2y;
  max = v0y > v1y ? (v0y > v2y ? v0y : v2y) : v1y > v2y ? v1y : v2y;
  if (min > hy || max < -hy) return false;

  min = v0z < v1z ? (v0z < v2z ? v0z : v2z) : v1z < v2z ? v1z : v2z;
  max = v0z > v1z ? (v0z > v2z ? v0z : v2z) : v1z > v2z ? v1z : v2z;
  if (min > hz || max < -hz) return false;

  let nx = e0y * e1z - e0z * e1y;
  let ny = e0z * e1x - e0x * e1z;
  let nz = e0x * e1y - e0y * e1x;
  const nLen = Math.hypot(nx, ny, nz);
  if (nLen < 1e-12) return false;
  nx /= nLen;
  ny /= nLen;
  nz /= nLen;
  const d = -(nx * v0x + ny * v0y + nz * v0z);

  const vminx = nx > 0 ? -hx : hx;
  const vmaxx = nx < 0 ? -hx : hx;
  const vminy = ny > 0 ? -hy : hy;
  const vmaxy = ny < 0 ? -hy : hy;
  const vminz = nz > 0 ? -hz : hz;
  const vmaxz = nz < 0 ? -hz : hz;
  if (nx * vminx + ny * vminy + nz * vminz + d > 0) return false;
  if (nx * vmaxx + ny * vmaxy + nz * vmaxz + d >= 0) return true;
  return false;
}

export function aabbIntersects(a, b) {
  return (
    a.minX < b.maxX &&
    a.maxX > b.minX &&
    a.minY < b.maxY &&
    a.maxY > b.minY &&
    a.minZ < b.maxZ &&
    a.maxZ > b.minZ
  );
}

function normalizeMeshStreamData(data) {
  if (Array.isArray(data) && data.length === 1 && (ArrayBuffer.isView(data[0]) || Array.isArray(data[0]))) {
    return data[0];
  }
  return data;
}

export function extractMeshCollisionFromEntity(entity) {
  const pc = typeof window !== 'undefined' ? window.pc : null;
  if (!pc || !entity) return null;

  if (typeof entity.syncHierarchy === 'function') {
    entity.syncHierarchy();
  }

  const tmp = new pc.Vec3();
  const w0 = new pc.Vec3();
  const w1 = new pc.Vec3();
  const w2 = new pc.Vec3();
  const triVerts = [];
  const triNorms = [];
  const triMaxY = [];
  const triMinY = [];
  let triCount = 0;

  const addTriangle = (lx0, ly0, lz0, lx1, ly1, lz1, lx2, ly2, lz2, wt) => {
    if (
      !Number.isFinite(lx0) || !Number.isFinite(ly0) || !Number.isFinite(lz0) ||
      !Number.isFinite(lx1) || !Number.isFinite(ly1) || !Number.isFinite(lz1) ||
      !Number.isFinite(lx2) || !Number.isFinite(ly2) || !Number.isFinite(lz2)
    ) {
      return;
    }
    tmp.set(lx0, ly0, lz0);
    wt.transformPoint(tmp, w0);
    tmp.set(lx1, ly1, lz1);
    wt.transformPoint(tmp, w1);
    tmp.set(lx2, ly2, lz2);
    wt.transformPoint(tmp, w2);

    const e1x = w1.x - w0.x;
    const e1y = w1.y - w0.y;
    const e1z = w1.z - w0.z;
    const e2x = w2.x - w0.x;
    const e2y = w2.y - w0.y;
    const e2z = w2.z - w0.z;
    let nx = e1y * e2z - e1z * e2y;
    let ny = e1z * e2x - e1x * e2z;
    let nz = e1x * e2y - e1y * e2x;
    const len = Math.hypot(nx, ny, nz);
    if (len < 1e-10) return;
    nx /= len;
    ny /= len;
    nz /= len;

    triVerts.push(w0.x, w0.y, w0.z, w1.x, w1.y, w1.z, w2.x, w2.y, w2.z);
    triNorms.push(nx, ny, nz);
    triMaxY.push(Math.max(w0.y, w1.y, w2.y));
    triMinY.push(Math.min(w0.y, w1.y, w2.y));
    triCount += 1;
  };

  const processMeshInstance = (mi, ownerEnt) => {
    const mesh = mi?.mesh;
    if (!mesh) return;
    const node = mi.node || ownerEnt;
    if (!node?.getWorldTransform) return;
    const wt = node.getWorldTransform();

    const rawPositions = [];
    const rawIndices = [];
    const vCount = mesh.getPositions(rawPositions);
    const iCount = mesh.getIndices(rawIndices);
    const positions = normalizeMeshStreamData(rawPositions);
    const indices = normalizeMeshStreamData(rawIndices);
    if (vCount < 3) return;

    if (iCount >= 3) {
      for (let t = 0; t + 2 < iCount; t += 3) {
        const i0 = indices[t];
        const i1 = indices[t + 1];
        const i2 = indices[t + 2];
        addTriangle(
          positions[i0 * 3],
          positions[i0 * 3 + 1],
          positions[i0 * 3 + 2],
          positions[i1 * 3],
          positions[i1 * 3 + 1],
          positions[i1 * 3 + 2],
          positions[i2 * 3],
          positions[i2 * 3 + 1],
          positions[i2 * 3 + 2],
          wt
        );
      }
      return;
    }

    for (let base = 0; base + 2 < vCount; base += 3) {
      const i0 = base;
      const i1 = base + 1;
      const i2 = base + 2;
      addTriangle(
        positions[i0 * 3],
        positions[i0 * 3 + 1],
        positions[i0 * 3 + 2],
        positions[i1 * 3],
        positions[i1 * 3 + 1],
        positions[i1 * 3 + 2],
        positions[i2 * 3],
        positions[i2 * 3 + 1],
        positions[i2 * 3 + 2],
        wt
      );
    }
  };

  const visit = (ent) => {
    if (!ent) return;
    const render = ent.render;
    if (render?.meshInstances?.length) {
      for (const mi of render.meshInstances) {
        processMeshInstance(mi, ent);
      }
    }
    for (const ch of ent.children || []) {
      if (ch?.name === 'CubeObjectOutline') continue;
      visit(ch);
    }
  };

  visit(entity);

  if (triCount === 0) return null;

  const finalTriCount = triNorms.length / 3;
  if (finalTriCount === 0) return null;

  return {
    triCount: finalTriCount,
    verts: new Float32Array(triVerts),
    norms: new Float32Array(triNorms),
    triMaxY: new Float32Array(triMaxY),
    triMinY: new Float32Array(triMinY),
  };
}

export function buildBlockerCollisionCache(getBlockerObjects) {
  const pc = typeof window !== 'undefined' ? window.pc : null;
  const app = pc?.Application?.getApplication?.();
  if (app?.root) {
    app.root.syncHierarchy();
    try {
      app.update(0);
    } catch (e) {
      /* ignore */
    }
  }

  const boxes = [];
  const meshes = [];
  for (const obj of getBlockerObjects?.() || []) {
    if (!obj?.entity || obj.visible === false) continue;
    if (isMeshBlockerObject(obj)) {
      const mesh = extractMeshCollisionFromEntity(obj.entity);
      if (mesh && mesh.triCount > 0) {
        meshes.push(mesh);
      }
    } else {
      const box = computeEntityWorldAabb(obj.entity, { padding: COLLISION_AABB_PADDING });
      if (box) boxes.push(box);
    }
  }
  return { boxes, meshes };
}

export function queryMeshCollision(playerAabb, meshes) {
  let blocked = false;
  let wallBlocked = false;
  let floorY = null;
  let ceilY = null;

  if (!playerAabb || !meshes?.length) {
    return { blocked, wallBlocked, floorY, ceilY };
  }

  for (const mesh of meshes) {
    if (!mesh?.triCount || !mesh.verts || !mesh.norms) continue;

    const n = mesh.triCount;
    const v = mesh.verts;
    const norms = mesh.norms;
    const pMinY = playerAabb.minY;
    const pMaxY = playerAabb.maxY;

    for (let i = 0; i < n; i++) {
      if (mesh.triMaxY[i] < pMinY || mesh.triMinY[i] > pMaxY) continue;
      const o = i * 9;
      if (
        !triangleIntersectsAabb(
          playerAabb,
          v[o],
          v[o + 1],
          v[o + 2],
          v[o + 3],
          v[o + 4],
          v[o + 5],
          v[o + 6],
          v[o + 7],
          v[o + 8]
        )
      ) {
        continue;
      }
      blocked = true;
      const ny = norms[i * 3 + 1];
      if (Math.abs(ny) > FLOOR_NY) {
        const fy = mesh.triMaxY[i] + COLLISION_MESH_SKIN;
        const cy = mesh.triMinY[i] - COLLISION_MESH_SKIN;
        if (floorY == null || fy > floorY) floorY = fy;
        if (ceilY == null || cy < ceilY) ceilY = cy;
      } else {
        wallBlocked = true;
      }
    }
  }

  return { blocked, wallBlocked, floorY, ceilY };
}

export function queryBlockerCollision(playerAabb, collision) {
  let blocked = false;
  let wallBlocked = false;
  let floorY = null;
  let ceilY = null;

  for (const box of collision?.boxes || []) {
    if (!box || !aabbIntersects(playerAabb, box)) continue;
    blocked = true;
    wallBlocked = true;
    if (floorY == null || box.maxY > floorY) floorY = box.maxY;
    if (ceilY == null || box.minY < ceilY) ceilY = box.minY;
  }

  const meshPart = queryMeshCollision(playerAabb, collision?.meshes || []);
  if (meshPart.blocked) blocked = true;
  if (meshPart.wallBlocked) wallBlocked = true;
  if (meshPart.floorY != null) {
    floorY = floorY == null ? meshPart.floorY : Math.max(floorY, meshPart.floorY);
  }
  if (meshPart.ceilY != null) {
    ceilY = ceilY == null ? meshPart.ceilY : Math.min(ceilY, meshPart.ceilY);
  }

  return {
    blocked,
    wallBlocked,
    floorY,
    ceilY,
  };
}

/** @deprecated playMode·export 호환 */
export function findMeshCollisionResponse(playerAabb, meshes) {
  const q = queryBlockerCollision(playerAabb, { boxes: [], meshes: meshes || [] });
  if (!q.blocked) return null;
  if (q.floorY != null) {
    return {
      minX: playerAabb.minX,
      maxX: playerAabb.maxX,
      minY: playerAabb.minY,
      maxY: q.floorY,
      minZ: playerAabb.minZ,
      maxZ: playerAabb.maxZ,
    };
  }
  if (q.ceilY != null) {
    return {
      minX: playerAabb.minX,
      maxX: playerAabb.maxX,
      minY: q.ceilY,
      maxY: playerAabb.maxY,
      minZ: playerAabb.minZ,
      maxZ: playerAabb.maxZ,
    };
  }
  return {
    minX: playerAabb.minX,
    maxX: playerAabb.maxX,
    minY: playerAabb.minY,
    maxY: playerAabb.maxY,
    minZ: playerAabb.minZ,
    maxZ: playerAabb.maxZ,
  };
}
