/**
 * 타임라인 오브젝트 부모/자식: 단일 PLY 엔티티만 (멀티파일 제외).
 * PlayCanvas 부모-자식으로 월드 변환 보존(addChildAndSaveTransform).
 */

/**
 * @param {object} obj
 * @returns {boolean}
 */
export function supportsHierarchy(obj) {
  return !!(obj && !obj.isMultiFile && obj.entity);
}

/**
 * @param {object[]} objects
 * @param {string} childId
 * @param {string|null} parentId
 * @returns {string|null} 오류 코드
 */
export function validateParentAssignment(objects, childId, parentId) {
  if (!childId || childId === parentId) return "invalid";
  const child = objects.find((o) => o.id === childId);
  if (!child) return "notfound";
  if (!supportsHierarchy(child)) return "type";
  if (!parentId) return null;
  const parent = objects.find((o) => o.id === parentId);
  if (!parent || !supportsHierarchy(parent)) return "type";
  let walk = parent;
  let guard = 0;
  while (walk && guard++ < 128) {
    if (walk.id === childId) return "cycle";
    if (!walk.parentId) break;
    walk = objects.find((o) => o.id === walk.parentId);
  }
  return null;
}

/**
 * @param {object[]} objects
 * @param {string} objectId
 * @returns {number}
 */
export function getHierarchyDepth(objects, objectId) {
  let d = 0;
  let cur = objects.find((o) => o.id === objectId);
  const guard = 64;
  let n = 0;
  while (cur?.parentId && n++ < guard) {
    d += 1;
    cur = objects.find((o) => o.id === cur.parentId);
  }
  return d;
}

/**
 * 씬 그래프를 parentId에 맞게 맞춘 뒤, 루트 엔티티 순서만 splatRoot에 반영한다.
 * @param {object} viewer
 * @param {object[]} objects
 */
export function syncSceneHierarchy(viewer, objects) {
  if (!viewer?.splatRoot || !Array.isArray(objects)) return;

  for (const obj of objects) {
    if (!supportsHierarchy(obj) || !obj.entity) continue;
    if (obj.parentId) {
      const po = objects.find((o) => o.id === obj.parentId);
      if (!po || !supportsHierarchy(po)) {
        obj.parentId = null;
      }
    }
    const parentObj = obj.parentId ? objects.find((o) => o.id === obj.parentId) : null;
    const parentEnt =
      parentObj && supportsHierarchy(parentObj) && parentObj.entity ? parentObj.entity : null;
    const ent = obj.entity;
    try {
      if (parentEnt) {
        if (ent.parent !== parentEnt) {
          parentEnt.addChildAndSaveTransform(ent);
        }
      } else if (ent.parent !== viewer.splatRoot) {
        viewer.splatRoot.addChildAndSaveTransform(ent);
      }
    } catch (e) {
      console.warn("[objectHierarchy] reparent failed", obj.id, e);
    }
  }

  const byParent = new Map();
  for (const o of objects) {
    if (!o.parentId || !supportsHierarchy(o) || !o.entity) continue;
    if (!byParent.has(o.parentId)) byParent.set(o.parentId, []);
    byParent.get(o.parentId).push(o);
  }

  for (const [pid, kids] of byParent) {
    const pObj = objects.find((x) => x.id === pid);
    if (!pObj?.entity) continue;
    kids.sort((a, b) => objects.indexOf(a) - objects.indexOf(b));
    kids.forEach((child, i) => {
      if (!child.entity || child.entity.parent !== pObj.entity) return;
      try {
        child.entity.reparent(pObj.entity, i);
      } catch (e) {
        console.warn("[objectHierarchy] sibling reorder failed", child.id, e);
      }
    });
  }

  viewer.syncSplatRootOrderFromObjects?.(objects);
}

/**
 * 부모 오브젝트 삭제 전: 자식 타임라인 항목은 parentId 제거 + 엔티티를 splatRoot로 이동(월드 유지).
 * @param {object[]} objects
 * @param {string} deletedParentId
 * @param {object} viewer
 */
export function detachChildrenBeforeParentDelete(objects, deletedParentId, viewer) {
  if (!viewer?.splatRoot || !Array.isArray(objects) || !deletedParentId) return;
  const root = viewer.splatRoot;
  for (const o of objects) {
    if (o.parentId !== deletedParentId) continue;
    o.parentId = null;
    if (supportsHierarchy(o) && o.entity && o.entity.parent !== root) {
      try {
        root.addChildAndSaveTransform(o.entity);
      } catch (e) {
        console.warn("[objectHierarchy] orphan detach failed", o.id, e);
      }
    }
  }
}
