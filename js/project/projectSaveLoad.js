/**
 * 프로젝트 저장/불러오기 (.liam)
 * - PLY 경로, 인스펙터(transform), 타임라인(visible, start/end), 코멘트 저장
 * - 경로는 프로젝트 파일 저장 위치 기준 상대경로로 저장 가능 (브라우저에서는 저장 시 경로 그대로)
 */

import { syncSceneHierarchy } from '../timeline/objectHierarchy.js';

const LIAM_VERSION = 1;
const LIAM_EXT = '.liam';
const LIAM_MIME = 'application/json';

/** FileLoader._fileKind와 동일 계열 확장자 (경로 로드 시 표시용 이름이 확장자 없을 때 대비) */
const LOADABLE_MESH_NAME_RE = /\.(compressed\.ply|ply|step|stp|iges|igs)$/i;

/**
 * @param {string} pathBasename - URL/디스크 경로의 파일명만
 * @param {{ fileName?: string, name?: string }} ob - 프로젝트 JSON 오브젝트
 */
function resolveLoadableFileName(pathBasename, ob) {
  const base = (pathBasename || '').trim();
  if (base && LOADABLE_MESH_NAME_RE.test(base)) return base;
  const fromOb = (ob.fileName || ob.name || '').trim();
  if (fromOb && LOADABLE_MESH_NAME_RE.test(fromOb)) return fromOb;
  return base || fromOb || 'model.ply';
}

/**
 * 타임라인 오브젝트에서 대표 entity 반환 (inspector와 동일)
 */
function getPrimaryEntity(obj) {
  if (!obj) return null;
  if (obj.isMultiFile && obj.files?.length > 0) {
    return obj.files[0].entity || obj.entity || null;
  }
  return obj.entity;
}

/**
 * 복제된 오브젝트의 PLY 바이트를 base64로 인코딩
 * @param {Object} obj - 타임라인 오브젝트
 * @param {Object} entity - 엔티티
 * @param {Object} selectionTool - SelectionTool (지우기 반영용)
 * @returns {Promise<string|null>} base64 인코딩된 PLY 데이터 또는 null
 */
async function getDuplicatedObjectBase64(obj, entity, selectionTool) {
  if (!entity?.gsplat || !selectionTool) return null;
  try {
    const { getGsplatResourceFromEntity, writePlyBinary } = await import('../export/exportPly.js');
    const resource = getGsplatResourceFromEntity(entity, selectionTool);
    const gsplatData = resource?.gsplatData;
    if (!gsplatData?.elements?.length) return null;
    const erasedSet = selectionTool._getErasedIndicesForEntity?.(entity);
    const keepMask = erasedSet instanceof Set ? (i) => !erasedSet.has(i) : () => true;
    const bytes = writePlyBinary(gsplatData, keepMask, { bakeWorldTransform: false });
    if (!bytes || bytes.length === 0) return null;
    // Uint8Array를 base64로 변환
    const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
    let binary = '';
    const chunkSize = 0x8000;
    for (let i = 0; i < u8.length; i += chunkSize) {
      binary += String.fromCharCode.apply(null, u8.subarray(i, i + Math.min(chunkSize, u8.length - i)));
    }
    return btoa(binary);
  } catch (e) {
    console.warn('[buildProjectData] getDuplicatedObjectBase64 failed', e);
    return null;
  }
}

/**
 * 현재 뷰어/타임라인/코멘트 데이터로 프로젝트 JSON 생성
 * @param {{ timeline: Object, objectDescription: Object, selectionTool?: Object }} deps
 * @returns {Promise<Object>} { version, objects, comments }
 */
export async function buildProjectData(deps) {
  const { timeline, objectDescription, selectionTool } = deps;
  const objects = timeline?.objects ?? [];
  const comments = objectDescription?.comments ?? [];

  const outObjects = [];

  for (const obj of objects) {
    const entity = getPrimaryEntity(obj);
    let position = { x: 0, y: 0, z: 0 };
    let rotation = { x: 0, y: 0, z: 0 };
    let scale = { x: 1, y: 1, z: 1 };
    if (entity) {
      const pos = entity.getLocalPosition();
      const rot = entity.getLocalEulerAngles();
      const scl = entity.getLocalScale();
      position = { x: pos.x, y: pos.y, z: pos.z };
      rotation = { x: rot.x, y: rot.y, z: rot.z };
      scale = { x: scl.x, y: scl.y, z: scl.z };
    }

    const path = obj.sourcePath ?? null;
    let base64 = null;
    // 복제된 오브젝트(디스크에 없음)를 .liam 파일에 base64로 직접 저장
    if (!path && obj.duplicatedFromSourcePath && entity && selectionTool) {
      base64 = await getDuplicatedObjectBase64(obj, entity, selectionTool);
    }

    const entry = {
      id: obj.id,
      name: obj.name ?? '',
      path,
      fileName: obj.name ?? '',
      transform: { position, rotation, scale },
      startSeconds: obj.startSeconds ?? 0,
      endSeconds: obj.endSeconds ?? 0,
      visible: obj.visible !== false,
      parentId: obj.parentId && !obj.isMultiFile ? obj.parentId : null,
    };
    if (obj.objectType === 'empty') {
      entry.isEmpty = true;
    }
    if (base64) {
      entry.base64 = base64;
    } else if (obj.duplicatedFromSourcePath && !path) {
      // base64 생성 실패 시 fallback으로 duplicatedFromSourcePath 유지
      entry.duplicatedFromSourcePath = obj.duplicatedFromSourcePath;
    }

    if (obj.isMultiFile && obj.files?.length) {
      entry.isMultiFile = true;
      entry.files = obj.files.map((f) => ({
        path: f.sourcePath ?? null,
        fileName: f.fileName ?? f.name ?? '',
      }));
    } else {
      entry.isMultiFile = false;
    }
    outObjects.push(entry);
  }

  const outComments = comments.map((c) => ({
    id: c.id,
    objectId: c.objectId,
    objectName: c.objectName ?? '',
    title: c.title ?? '',
    worldPosition: c.worldPosition ? { ...c.worldPosition } : { x: 0, y: 0, z: 0 },
    cameraState: c.cameraState ? { ...c.cameraState } : null,
    description: c.description ?? '',
  }));

  return {
    version: LIAM_VERSION,
    objects: outObjects,
    comments: outComments,
  };
}

/**
 * 프로젝트 저장
 * - fileHandle 이 있으면 해당 파일에 덮어쓰기 (저장)
 * - 없으면 파인더 열어서 저장 (처음 저장 / 다른 이름으로 저장)
 * @param {Object} data - buildProjectData() 결과
 * @param {{ fileHandle?: FileSystemFileHandle, getSuggestedName?: () => string }} [opts]
 * @returns {Promise<{ saved: boolean, fileHandle?: FileSystemFileHandle }>}
 */
export async function saveProjectToFile(data, opts = {}) {
  const suggestedName = opts?.getSuggestedName?.() ?? `project${LIAM_EXT}`;
  const json = JSON.stringify(data, null, 2);
  const existingHandle = opts?.fileHandle ?? null;

  if (existingHandle && typeof existingHandle.createWritable === 'function') {
    try {
      const writable = await existingHandle.createWritable();
      await writable.write(json);
      await writable.close();
      return { saved: true, fileHandle: existingHandle };
    } catch (e) {
      if (e.name === 'AbortError') return { saved: false };
      throw e;
    }
  }

  if (typeof window.showSaveFilePicker === 'function') {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName,
        types: [
          { description: 'Liam Project', accept: { [LIAM_MIME]: [LIAM_EXT] } },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(json);
      await writable.close();
      return { saved: true, fileHandle: handle };
    } catch (e) {
      if (e.name === 'AbortError') return { saved: false };
      throw e;
    }
  }

  const blob = new Blob([json], { type: LIAM_MIME });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = suggestedName.endsWith(LIAM_EXT) ? suggestedName : `${suggestedName}${LIAM_EXT}`;
  a.click();
  URL.revokeObjectURL(a.href);
  return { saved: true };
}

/**
 * 프로젝트 불러오기: 파일 선택 → JSON 파싱 → 오브젝트/코멘트 복원
 * @param {Object} deps - { fileLoader, timeline, viewer, objectDescription, getLocalFileServerBaseUrl }
 * @param {Object} [opts] - { onProgress?(text), signal? }
 * @returns {Promise<{ success: boolean, error?: string, fileHandle?: FileSystemFileHandle }>}
 */
export async function loadProjectFromFile(deps, opts = {}) {
  const { fileLoader, timeline, viewer, objectDescription, getLocalFileServerBaseUrl } = deps;
  const { onProgress, signal } = opts || {};

  if (!fileLoader || !timeline || !viewer) {
    return { success: false, error: '뷰어/타임라인을 사용할 수 없습니다.' };
  }

  let file;
  /** @type {FileSystemFileHandle|undefined} - 저장 시 같은 파일에 덮어쓸 수 있도록 반환 */
  let projectFileHandle;
  if (typeof window.showOpenFilePicker === 'function') {
    try {
      const [handle] = await window.showOpenFilePicker({
        types: [{ description: 'Liam Project', accept: { [LIAM_MIME]: [LIAM_EXT] } }],
        multiple: false,
      });
      projectFileHandle = handle;
      file = await handle.getFile();
    } catch (e) {
      if (e.name === 'AbortError') return { success: false };
      throw e;
    }
  } else {
    file = await new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = LIAM_EXT;
      input.onchange = () => resolve(input.files?.[0] ?? null);
      input.click();
    });
  }
  if (!file) return { success: false };

  onProgress?.('프로젝트 파일 읽는 중...');
  let data;
  try {
    const text = await file.text();
    data = JSON.parse(text);
  } catch (e) {
    return { success: false, error: '프로젝트 파일 형식이 올바르지 않습니다.' };
  }
  if (signal?.aborted) return { success: false };

  const objects = Array.isArray(data?.objects) ? data.objects : [];
  const comments = Array.isArray(data?.comments) ? data.comments : [];
  const baseUrl = typeof getLocalFileServerBaseUrl === 'function' ? await getLocalFileServerBaseUrl() : '';

  timeline.clearObjects();
  viewer.clearSplat();
  deps.inspector?.hide?.("idle");
  if (objectDescription) {
    objectDescription.comments = [];
    objectDescription._rebuildMarkers?.();
  }
  fileLoader.clearLoadedFiles?.();

  const idMap = {};
  /** @type {{ childId: string, oldParentId: string }[]} */
  const pendingParents = [];
  let loadedCount = 0;

  for (let i = 0; i < objects.length; i++) {
    if (signal?.aborted) return { success: false };
    const ob = objects[i];
    const path = ob.path ?? (ob.isMultiFile && ob.files?.[0]?.path) ?? null;
    const base64 = ob.base64 ?? null;
    const loadPath = path ?? ob.duplicatedFromSourcePath ?? null;

    if (ob.isEmpty === true || ob.objectType === 'empty') {
      onProgress?.(`로드 중: ${ob.name ?? 'Empty'} (${loadedCount + 1}/${objects.length})`);
      const ent = viewer.createEmptyObjectEntity?.();
      if (!ent) {
        onProgress?.(`"${ob.name ?? ''}" 빈 오브젝트 생성 실패 – 건너뜀`);
        continue;
      }
      const added = timeline.addObject(ob.name || 'Empty Object', ent, null, { objectType: 'empty' });
      if (added) {
        idMap[ob.id] = added.id;
        const t = ob.transform;
        if (t && added.entity) {
          added.entity.setLocalPosition(t.position?.x ?? 0, t.position?.y ?? 0, t.position?.z ?? 0);
          added.entity.setLocalEulerAngles(t.rotation?.x ?? 0, t.rotation?.y ?? 0, t.rotation?.z ?? 0);
          const sx = t.scale?.x ?? 1;
          const sy = t.scale?.y ?? 1;
          const sz = t.scale?.z ?? 1;
          added.entity.setLocalScale(sx, sy, sz);
        }
        if (typeof ob.startSeconds === 'number') added.startSeconds = ob.startSeconds;
        if (typeof ob.endSeconds === 'number') added.endSeconds = ob.endSeconds;
        if (typeof ob.visible === 'boolean') added.visible = ob.visible;
        added.entity.enabled = added.visible;
        const oldPid = ob.parentId;
        if (typeof oldPid === 'string' && oldPid && !ob.isMultiFile) {
          pendingParents.push({ childId: added.id, oldParentId: oldPid });
        }
        loadedCount++;
      }
      continue;
    }

    let fileObj = null;
    const pathHintBasename = (loadPath || path || ob.path || '')
      .replace(/^.*[/\\]/, '')
      .trim();
    let fileName = resolveLoadableFileName(pathHintBasename, ob);

    // base64가 있으면 .liam 파일에서 직접 로드
    if (base64) {
      try {
        const binary = atob(base64);
        const u8 = new Uint8Array(binary.length);
        for (let j = 0; j < binary.length; j++) {
          u8[j] = binary.charCodeAt(j);
        }
        fileObj = new File([u8], fileName, { type: 'application/octet-stream' });
      } catch (e) {
        onProgress?.(`"${ob.name}" base64 디코딩 실패 – 건너뜀`);
        continue;
      }
    } else if (loadPath) {
      // 경로로 로드
      onProgress?.(`로드 중: ${ob.name} (${loadedCount + 1}/${objects.length})`);
      const url = `${baseUrl}/local-file?path=${encodeURIComponent(loadPath)}`;
      let res;
      try {
        res = await fetch(url, { signal: signal || undefined });
      } catch (e) {
        if (e.name === 'AbortError') return { success: false };
        onProgress?.(`"${ob.name}" 요청 실패 – 건너뜀`);
        continue;
      }
      if (!res.ok) {
        onProgress?.(`"${ob.name}" HTTP ${res.status} – 건너뜀`);
        continue;
      }
      const blob = await res.blob();
      const pathBasename = loadPath.replace(/^.*[/\\]/, '') || '';
      fileName = resolveLoadableFileName(pathBasename, ob);
      fileObj = new File([blob], fileName, { type: 'application/octet-stream' });
    } else {
      onProgress?.(`"${ob.name}" 경로/base64 없음 – 건너뜀`);
      continue;
    }

    if (!fileObj) continue;

    const result = await fileLoader.loadFiles([fileObj], { append: true });
    if (!result?.success || !result.results?.length) continue;

    const loaded = result.results[0];
    const isDuplicate = !!base64 || (!!ob.duplicatedFromSourcePath && !path);
    const added = timeline.addObject(loaded.fileName, loaded.entity, loaded.splatId, {
      sourcePath: path ?? null,
      duplicatedFromSourcePath: isDuplicate && !base64 ? ob.duplicatedFromSourcePath : null,
    });
    if (added) {
      idMap[ob.id] = added.id;
      const t = ob.transform;
      if (t && added.entity) {
        added.entity.setLocalPosition(t.position?.x ?? 0, t.position?.y ?? 0, t.position?.z ?? 0);
        added.entity.setLocalEulerAngles(t.rotation?.x ?? 0, t.rotation?.y ?? 0, t.rotation?.z ?? 0);
        const sx = t.scale?.x ?? 1, sy = t.scale?.y ?? 1, sz = t.scale?.z ?? 1;
        added.entity.setLocalScale(sx, sy, sz);
      }
      if (typeof ob.startSeconds === 'number') added.startSeconds = ob.startSeconds;
      if (typeof ob.endSeconds === 'number') added.endSeconds = ob.endSeconds;
      if (typeof ob.visible === 'boolean') added.visible = ob.visible;
      added.entity.enabled = added.visible;
      const oldPid = ob.parentId;
      if (typeof oldPid === 'string' && oldPid && !ob.isMultiFile) {
        pendingParents.push({ childId: added.id, oldParentId: oldPid });
      }
      loadedCount++;
    }
  }

  for (const p of pendingParents) {
    const newPid = idMap[p.oldParentId];
    if (!newPid) continue;
    const child = timeline.objects.find((o) => o.id === p.childId);
    const par = timeline.objects.find((o) => o.id === newPid);
    if (child && par && !child.isMultiFile && !par.isMultiFile && child.entity && par.entity) {
      child.parentId = newPid;
    }
  }
  try {
    syncSceneHierarchy(viewer, timeline.objects);
  } catch (e) {
    console.warn('[loadProject] syncSceneHierarchy', e);
  }

  const mappedComments = comments.map((c) => ({
    ...c,
    objectId: idMap[c.objectId] ?? c.objectId,
  }));
  if (objectDescription) {
    objectDescription.comments = mappedComments;
    objectDescription._rebuildMarkers?.();
  }

  onProgress?.('완료');
  return { success: true, fileHandle: projectFileHandle };
}

export { LIAM_EXT, LIAM_VERSION };
