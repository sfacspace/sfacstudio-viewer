/**
 * 플레이 모드·Playing HTML export용 충돌 블로커 (cube / OBJ / GLB).
 */

/** 충돌 박스를 메시에 맞게 살짝 키움 (플레이어 캡슐 vs AABB 틈) */
export const COLLISION_AABB_PADDING = 0.08;

const CORNER_SIGNS = [
  [-1, -1, -1],
  [1, -1, -1],
  [1, 1, -1],
  [-1, 1, -1],
  [-1, -1, 1],
  [1, -1, 1],
  [1, 1, 1],
  [-1, 1, 1],
];

/** @param {object} obj */
export function isMeshBlockerObject(obj) {
  if (!obj?.entity) return false;
  const t = obj.objectType;
  return (
    t === 'obj' ||
    t === 'glb' ||
    obj.entity._objectType === 'obj' ||
    obj.entity._objectType === 'glb' ||
    obj.entity._objectType === 'mesh'
  );
}

/** @param {object} obj */
export function isCollisionBlockerObject(obj) {
  if (!obj?.entity) return false;
  const t = obj.objectType;
  return (
    t === 'cube' ||
    t === 'obj' ||
    t === 'glb' ||
    obj.isCube === true ||
    obj.isCollisionBlocker === true ||
    obj.entity._objectType === 'cube' ||
    obj.entity._objectType === 'mesh' ||
    obj.entity._objectType === 'obj' ||
    obj.entity._objectType === 'glb'
  );
}

/**
 * @param {object} bounds
 * @param {number} [pad]
 */
export function inflateAabb(bounds, pad = COLLISION_AABB_PADDING) {
  if (!bounds) return null;
  return {
    minX: bounds.minX - pad,
    maxX: bounds.maxX + pad,
    minY: bounds.minY - pad,
    maxY: bounds.maxY + pad,
    minZ: bounds.minZ - pad,
    maxZ: bounds.maxZ + pad,
  };
}

/**
 * @param {object} entity
 * @param {{ padding?: number }} [opts]
 * @returns {{ minX: number, maxX: number, minY: number, maxY: number, minZ: number, maxZ: number } | null}
 */
export function computeEntityWorldAabb(entity, opts = {}) {
  const pc = typeof window !== 'undefined' ? window.pc : null;
  if (!pc || !entity) return null;

  if (typeof entity.syncHierarchy === 'function') {
    entity.syncHierarchy();
  }

  let minX = Infinity;
  let minY = Infinity;
  let minZ = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let maxZ = -Infinity;
  let found = false;

  const tmp = new pc.Vec3();
  const out = new pc.Vec3();

  const includePoint = (x, y, z) => {
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
    minZ = Math.min(minZ, z);
    maxZ = Math.max(maxZ, z);
    found = true;
  };

  /** PlayCanvas meshInstance.aabb getter — 이미 월드 AABB (재변환 금지) */
  const expandMeshInstance = (mi, ownerEnt) => {
    if (!mi) return;
    if (!mi.node && ownerEnt) {
      mi.node = ownerEnt;
    }
    let aabb;
    try {
      aabb = mi.aabb;
    } catch (e) {
      return;
    }
    if (!aabb?.center || !aabb?.halfExtents) return;
    const c = aabb.center;
    const h = aabb.halfExtents;
    const hx = Math.abs(h.x);
    const hy = Math.abs(h.y);
    const hz = Math.abs(h.z);
    if (hx + hy + hz < 1e-8) return;
    includePoint(c.x - hx, c.y - hy, c.z - hz);
    includePoint(c.x + hx, c.y + hy, c.z + hz);
  };

  /** PlayCanvas box(1x1) — 엔티티 월드 행렬로 8꼭짓 변환 */
  const expandUnitBox = (worldMat) => {
    for (const s of CORNER_SIGNS) {
      tmp.set(s[0] * 0.5, s[1] * 0.5, s[2] * 0.5);
      worldMat.transformPoint(tmp, out);
      includePoint(out.x, out.y, out.z);
    }
  };

  const visit = (ent) => {
    if (!ent) return;

    const render = ent.render;
    if (render?.meshInstances?.length) {
      for (const mi of render.meshInstances) {
        expandMeshInstance(mi, ent);
      }
    } else if (render?.type === 'box') {
      expandUnitBox(ent.getWorldTransform());
    }

    for (const ch of ent.children || []) {
      if (ch?.name === 'CubeObjectOutline') continue;
      visit(ch);
    }
  };

  visit(entity);

  if (!found) {
    expandUnitBox(entity.getWorldTransform());
  }

  const pad = opts.padding ?? COLLISION_AABB_PADDING;
  return inflateAabb({ minX, maxX, minY, maxY, minZ, maxZ }, pad);
}

/** @param {object} entity */
export function extractWorldTransformForExport(entity) {
  const pos = entity.getPosition();
  const rot = entity.getRotation();
  const scl = entity.getScale();
  return {
    position: { x: pos.x, y: pos.y, z: pos.z },
    rotation: { x: rot.x, y: rot.y, z: rot.z, w: rot.w },
    scale: { x: scl.x, y: scl.y, z: scl.z },
  };
}

/**
 * @param {object[]} objects
 * @param {object} [splatRoot]
 */
export function collectCollisionBlockersForExport(objects, splatRoot = null) {
  const seen = new Set();
  const out = [];

  const pushFromEntity = (entity, obj) => {
    if (!entity || seen.has(entity)) return;
    seen.add(entity);

    const transform = extractWorldTransformForExport(entity);
    const isBox =
      obj?.objectType === 'cube' ||
      obj?.isCube === true ||
      entity._objectType === 'cube';

    if (isBox) {
      out.push({ kind: 'box', ...transform });
      return;
    }

    const meshFormat =
      obj?.meshFormat ||
      (obj?.objectType === 'obj' ? 'obj' : obj?.objectType === 'glb' ? 'glb' : null) ||
      entity._meshFormat ||
      'glb';

    out.push({
      kind: 'mesh',
      meshFormat,
      meshBase64: obj?.meshBase64 || null,
      ...transform,
    });
  };

  for (const obj of objects || []) {
    if (!isCollisionBlockerObject(obj)) continue;
    pushFromEntity(obj.entity, obj);
  }

  if (splatRoot) {
    const walk = (entity) => {
      if (!entity) return;
      if (
        entity._objectType === 'cube' ||
        entity._objectType === 'mesh' ||
        entity._objectType === 'obj' ||
        entity._objectType === 'glb'
      ) {
        pushFromEntity(entity, null);
      }
      for (const child of entity.children || []) {
        if (child?.name === 'CubeObjectOutline') continue;
        walk(child);
      }
    };
    walk(splatRoot);
  }

  return out;
}

/** @deprecated alias */
export const collectCollisionCubesForExport = collectCollisionBlockersForExport;
