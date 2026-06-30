/**
 * Context-menu duplicate: copy transform, visibility, erasures into a new timeline object (memory only).
 */

import { getGsplatResourceFromEntity, writePlyBinary } from '../export/exportPly.js';

/**
 * 타임라인 오브젝트에서 복제할 대표 entity 반환 (단일/멀티/시퀀스 공통)
 */
function getPrimaryEntity(obj) {
  if (!obj) return null;
  if (obj.isMultiFile && obj.files?.length > 0) {
    return obj.files[0].entity || obj.entity || null;
  }
  return obj.entity;
}

/**
 * entity 하나에 대해 지우기 반영 PLY 바이트 생성 (월드 베이크 없음, 로컬 좌표 유지)
 */
function buildPlyBytesForEntity(selectionTool, entity) {
  if (!entity?.gsplat || !selectionTool) return null;
  const resource = getGsplatResourceFromEntity(entity, selectionTool);
  const gsplatData = resource?.gsplatData;
  if (!gsplatData?.elements?.length) return null;
  const erasedSet = selectionTool._getErasedIndicesForEntity(entity);
  const keepMask = (i) => !erasedSet.has(i);
  return writePlyBinary(gsplatData, keepMask, { bakeWorldTransform: false });
}

/**
 * 소스 entity의 transform을 대상 entity에 복사
 */
function copyTransform(sourceEntity, targetEntity) {
  if (!sourceEntity || !targetEntity) return;
  try {
    const pos = sourceEntity.getLocalPosition();
    const rot = sourceEntity.getLocalEulerAngles();
    const scl = sourceEntity.getLocalScale();
    targetEntity.setLocalPosition(pos.x, pos.y, pos.z);
    targetEntity.setLocalEulerAngles(rot.x, rot.y, rot.z);
    targetEntity.setLocalScale(scl.x, scl.y, scl.z);
  } catch (e) {
    console.warn('[duplicateObject] copyTransform failed', e);
  }
}

/**
 * 빈 Transform 오브젝트 복제
 */
async function duplicateEmpty(viewer, timeline, obj) {
  const entity = getPrimaryEntity(obj);
  if (!entity) {
    alert('복제할 엔티티가 없습니다.');
    return null;
  }
  viewer.ensureScene?.();
  const cloneEnt = viewer.createEmptyObjectEntity?.();
  if (!cloneEnt) {
    alert('빈 오브젝트를 만들 수 없습니다.');
    return null;
  }
  copyTransform(entity, cloneEnt);
  const baseName = (obj.name || 'Empty').trim();
  const newName = `${baseName} (복제)`;
  const addFn = timeline.addObject || timeline.add;
  const added = addFn.call(timeline, newName, cloneEnt, null, { objectType: 'empty' });
  if (!added) return null;
  added.visible = obj.visible !== false;
  if (typeof timeline.renderObjects === 'function') timeline.renderObjects();
  else if (typeof timeline.render === 'function') timeline.render();
  const objs = timeline.objects ?? timeline._objects?.objects;
  (timeline.onObjectsChange || timeline._objects?.onObjectsChange)?.(objs ?? timeline.objects);
  return added;
}

/**
 * OBJ / GLB 충돌 블로커 복제 (meshBase64 재사용)
 */
async function duplicateMeshBlocker(viewer, timeline, obj) {
  const entity = getPrimaryEntity(obj);
  if (!entity) {
    alert('복제할 엔티티가 없습니다.');
    return null;
  }
  if (!obj.meshBase64) {
    alert('메시 데이터가 없어 복제할 수 없습니다. 파일을 다시 불러오세요.');
    return null;
  }
  const meshFormat = obj.meshFormat || obj.objectType || 'glb';
  const ext = meshFormat === 'obj' ? 'obj' : 'glb';
  const mime = ext === 'obj' ? 'model/obj' : 'model/gltf-binary';
  const bin = atob(obj.meshBase64);
  const u8 = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
  const baseName = (obj.name || 'Mesh').replace(/\.[^/.]+$/, '');
  const file = new File([u8], `${baseName}_copy.${ext}`, { type: mime });
  const loaded = await viewer.loadMeshModelFromFile?.(file, { append: true });
  if (!loaded?.entity) {
    alert('메시 복제에 실패했습니다.');
    return null;
  }
  copyTransform(entity, loaded.entity);
  const addFn = timeline.addObject || timeline.add;
  const added = addFn.call(timeline, `${baseName} (복제)`, loaded.entity, loaded.meshId, {
    objectType: obj.objectType === 'obj' ? 'obj' : 'glb',
    isCollisionBlocker: true,
    meshFormat: loaded.meshFormat || meshFormat,
    meshBase64: loaded.meshBase64 || obj.meshBase64,
  });
  if (!added) return null;
  added.visible = obj.visible !== false;
  loaded.entity.enabled = added.visible;
  if (typeof timeline.renderObjects === 'function') timeline.renderObjects();
  else if (typeof timeline.render === 'function') timeline.render();
  const objs = timeline.objects ?? timeline._objects?.objects;
  (timeline.onObjectsChange || timeline._objects?.onObjectsChange)?.(objs ?? timeline.objects);
  return added;
}

/**
 * 기본 큐브 오브젝트 복제
 */
async function duplicateCube(viewer, timeline, obj) {
  const entity = getPrimaryEntity(obj);
  if (!entity) {
    alert('복제할 엔티티가 없습니다.');
    return null;
  }
  viewer.ensureScene?.();
  const cloneEnt = viewer.createCubeObjectEntity?.();
  if (!cloneEnt) {
    alert('큐브 오브젝트를 만들 수 없습니다.');
    return null;
  }
  copyTransform(entity, cloneEnt);
  const baseName = (obj.name || 'Cube').trim();
  const newName = `${baseName} (복제)`;
  const addFn = timeline.addObject || timeline.add;
  const added = addFn.call(timeline, newName, cloneEnt, null, { objectType: 'cube' });
  if (!added) return null;
  added.visible = obj.visible !== false;
  cloneEnt.enabled = added.visible;
  if (typeof timeline.renderObjects === 'function') timeline.renderObjects();
  else if (typeof timeline.render === 'function') timeline.render();
  const objs = timeline.objects ?? timeline._objects?.objects;
  (timeline.onObjectsChange || timeline._objects?.onObjectsChange)?.(objs ?? timeline.objects);
  return added;
}

/**
 * 단일 오브젝트 복제
 */
async function duplicateSingle(viewer, timeline, selectionTool, obj) {
  const entity = getPrimaryEntity(obj);
  if (!entity?.gsplat) {
    alert('복제할 수 있는 엔티티가 없습니다.');
    return null;
  }

  const bytes = buildPlyBytesForEntity(selectionTool, entity);
  if (!bytes || bytes.length === 0) {
    alert('복제할 점 데이터가 없습니다.');
    return null;
  }

  const file = new File([bytes], 'duplicate.ply', { type: 'application/octet-stream' });
  const result = await viewer.loadSplatFromFile(file, {
    append: true,
    rotationFixZ180: false,
    disableNormalize: true,
    skipReorder: true,
  });

  if (!result?.entity || !result?.splatId) {
    alert('복제 로드에 실패했습니다.');
    return null;
  }

  copyTransform(entity, result.entity);

  const baseName = (obj.name || obj.id || 'object').trim();
  const newName = `${baseName} (복제)`;
  const sourcePathForDuplicate = obj.sourcePath || obj.duplicatedFromSourcePath || null;
  const addFn = timeline.addObject || timeline.add;
  const added = addFn.call(timeline, newName, result.entity, result.splatId, {
    sourcePath: null,
    duplicatedFromSourcePath: sourcePathForDuplicate,
    sourceFileName: obj.sourceFileName || null,
  });

  added.visible = obj.visible !== false;
  if (typeof timeline.renderObjects === 'function') timeline.renderObjects();
  else if (typeof timeline.render === 'function') timeline.render();
  const objs = timeline.objects ?? timeline._objects?.objects;
  (timeline.onObjectsChange || timeline._objects?.onObjectsChange)?.(objs ?? timeline.objects);
  return added;
}

/**
 * 멀티파일(비시퀀스) 오브젝트 복제: 파일별로 PLY 생성 후 한 번에 addMultiFile
 */
async function duplicateMultiFile(viewer, timeline, selectionTool, obj) {
  const files = obj.files;
  if (!Array.isArray(files) || files.length === 0) {
    alert('복제할 멀티파일 데이터가 없습니다.');
    return null;
  }

  const results = [];
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    const entity = f.entity;
    if (!entity?.gsplat) continue;

    const bytes = buildPlyBytesForEntity(selectionTool, entity);
    if (!bytes || bytes.length === 0) continue;

    const file = new File([bytes], `duplicate_${i}.ply`, { type: 'application/octet-stream' });
    const result = await viewer.loadSplatFromFile(file, {
      append: true,
      rotationFixZ180: false,
      disableNormalize: true,
      skipReorder: true,
    });
    if (result?.entity && result?.splatId) {
      copyTransform(entity, result.entity);
      const src = (f.sourcePath || f.duplicatedFromSourcePath || '').trim() || null;
      results.push({
        entity: result.entity,
        splatId: result.splatId,
        fileName: f.fileName || f.name || `frame_${i}.ply`,
        sourcePath: src,
        sourceFileName: f.sourceFileName || f.fileName || f.name || null,
      });
    }
  }

  if (results.length === 0) {
    alert('멀티파일 복제에 실패했습니다.');
    return null;
  }

  // 첫 프레임만 보이게
  results.forEach((r, idx) => {
    r.entity.enabled = idx === 0;
  });

  const baseName = (obj.name || obj.id || 'set').trim();
  const newName = `${baseName} (복제)`;
  const addMulti = timeline.addMultiFileObject || timeline.addMultiFile;
  const added = addMulti.call(timeline, results);
  if (!added) return null;

  added.name = newName;
  added.visible = obj.visible !== false;
  if (typeof timeline.renderObjects === 'function') timeline.renderObjects();
  else if (typeof timeline.render === 'function') timeline.render();
  const objs = timeline.objects ?? timeline._objects?.objects;
  (timeline.onObjectsChange || timeline._objects?.onObjectsChange)?.(objs ?? timeline.objects);
  return added;
}

/**
 * Run duplicate (single or multi-file). No disk write.
 *
 * @param {Object} obj - 타임라인 오브젝트 (timeline.objects 항목)
 * @param {{ viewer: Object, timeline: Object, selectionTool: Object }} deps
 * @returns {Promise<Object|null>} 추가된 타임라인 오브젝트 또는 null
 */
export async function runDuplicateObject(obj, deps) {
  const { viewer, timeline, selectionTool } = deps || {};
  if (!viewer?.loadSplatFromFile || !(timeline?.addObject || timeline?.add)) {
    alert('뷰어 또는 타임라인을 사용할 수 없습니다.');
    return null;
  }

  const isMultiFile = !!(obj.isMultiFile && Array.isArray(obj.files) && obj.files.length > 0);

  if (isMultiFile) {
    return duplicateMultiFile(viewer, timeline, selectionTool, obj);
  }
  if (obj.objectType === 'empty') {
    return duplicateEmpty(viewer, timeline, obj);
  }
  if (obj.objectType === 'cube') {
    return duplicateCube(viewer, timeline, obj);
  }
  if (obj.objectType === 'obj' || obj.objectType === 'glb') {
    return duplicateMeshBlocker(viewer, timeline, obj);
  }
  return duplicateSingle(viewer, timeline, selectionTool, obj);
}
