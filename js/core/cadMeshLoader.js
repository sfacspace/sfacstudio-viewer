/**
 * STEP / STP / IGES / IGS → OpenCascade WASM(occt-import-js) → PlayCanvas 메시
 * @see https://github.com/kovacsv/occt-import-js (LGPL-2.1)
 */

import initOcct from "occt-import-js";
import occtWasmUrl from "occt-import-js/dist/occt-import-js.wasm?url";

/** @type {Promise<unknown>|null} */
let _occtPromise = null;

export function getCadFileKind(fileName) {
  const lower = (fileName || "").toLowerCase();
  if (lower.endsWith(".step") || lower.endsWith(".stp")) return "step";
  if (lower.endsWith(".iges") || lower.endsWith(".igs")) return "iges";
  return null;
}

export function isCadFileName(fileName) {
  return getCadFileKind(fileName) != null;
}

async function ensureOcct() {
  if (!_occtPromise) {
    _occtPromise = initOcct({
      locateFile: (path) => (path.endsWith(".wasm") ? occtWasmUrl : path),
    });
  }
  return _occtPromise;
}

/** STEP/STP용 (큰 어셈블리 성능 우선) */
const OCCT_PARAMS_STEP = {
  linearUnit: "millimeter",
  linearDeflectionType: "bounding_box_ratio",
  linearDeflection: 0.08,
  angularDeflection: 0.35,
};

/**
 * IGES는 단위·형상 크기 편차가 커서 linearDeflection 비율이 크면(예: 0.08)
 * 작은 solid/셸에서 BRep 메시가 비거나 면이 빠지는 경우가 많다.
 * 라이브러리 기본(0.001)보다는 느슨하게 두되 STEP보다 촘촘하게 잡는다.
 */
const OCCT_PARAMS_IGES = {
  linearUnit: "millimeter",
  linearDeflectionType: "bounding_box_ratio",
  linearDeflection: 0.012,
  angularDeflection: 0.28,
};

/**
 * embind 배열에서 length와 숫자 키 범위가 어긋나는 경우 보완
 * @param {object} meshes
 * @returns {number}
 */
function occtMeshesSlotCount(meshes) {
  if (meshes == null) return 0;
  const len = typeof meshes.length === "number" ? meshes.length | 0 : 0;
  let maxKey = -1;
  try {
    const keys = Object.keys(meshes);
    for (let k = 0; k < keys.length; k++) {
      const i = parseInt(keys[k], 10);
      if (!Number.isNaN(i) && i > maxKey) maxKey = i;
    }
  } catch (_) {
    /* ignore */
  }
  return Math.max(len, maxKey + 1);
}

/**
 * @param {Float32Array} positions length n*3
 * @param {Uint32Array|Uint16Array} indices
 * @returns {Float32Array} length n*3
 */
function computeFlatNormals(positions, indices) {
  const vCount = positions.length / 3;
  const normals = new Float32Array(positions.length);
  const add = (vi, nx, ny, nz) => {
    const o = vi * 3;
    normals[o] += nx;
    normals[o + 1] += ny;
    normals[o + 2] += nz;
  };
  const triCount = indices.length / 3;
  for (let t = 0; t < triCount; t++) {
    const i0 = indices[t * 3];
    const i1 = indices[t * 3 + 1];
    const i2 = indices[t * 3 + 2];
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
 * occt-import-js는 embind 배열을 쓰는데, 환경에 따라 `for...of`/`new Float32Array(arr)`만으로는
 * 원소가 일부만 복사되거나 length가 기대와 다를 수 있어 인덱스 기반으로 평탄화한다.
 * @param {unknown} arr
 * @returns {Float32Array}
 */
function flatFloat3Array(arr) {
  if (arr == null) return new Float32Array(0);
  const len =
    typeof arr.length === "number"
      ? arr.length
      : ArrayBuffer.isView(arr)
        ? arr.length
        : 0;
  if (!len) return new Float32Array(0);

  if (Array.isArray(arr?.[0])) {
    const out = [];
    for (let i = 0; i < len; i++) {
      const t = arr[i];
      if (t && t.length >= 3) out.push(t[0], t[1], t[2]);
    }
    return new Float32Array(out);
  }

  if (ArrayBuffer.isView(arr)) {
    const n = arr.length;
    const out = new Float32Array(n);
    for (let i = 0; i < n; i++) out[i] = arr[i];
    return out;
  }

  const out = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    const v = arr[i];
    out[i] = typeof v === "number" ? v : Number(v) || 0;
  }
  return out;
}

/**
 * @param {unknown} arr
 * @returns {number[]}
 */
function flatIndexArray(arr) {
  if (arr == null) return [];
  const len =
    typeof arr.length === "number"
      ? arr.length
      : ArrayBuffer.isView(arr)
        ? arr.length
        : 0;
  if (!len) return [];

  if (Array.isArray(arr?.[0])) {
    const out = [];
    for (let i = 0; i < len; i++) {
      const tri = arr[i];
      if (tri && tri.length >= 3) out.push(tri[0], tri[1], tri[2]);
    }
    return out;
  }

  const out = [];
  for (let i = 0; i < len; i++) {
    const v = arr[i];
    out.push(typeof v === "number" ? v : Number(v) | 0);
  }
  return out;
}

/**
 * result.meshes를 인덱스 순으로 나열하고, root 트리에 등장하는 메시 참조 순서를 반영한다.
 * (일부 바인딩/파일에서 평탄 배열 순회만으로는 누락이 생기는 경우 방지)
 * @param {object} result
 * @returns {object[]}
 */
function collectOcctMeshesInOrder(result) {
  const all = result?.meshes;
  const slotCount = occtMeshesSlotCount(all);
  if (!all || slotCount <= 0) return [];

  const ordered = [];
  const seen = new Set();

  function visitNode(node) {
    if (!node) return;
    const refs = node.meshes;
    if (refs != null && typeof refs.length === "number") {
      for (let i = 0; i < refs.length; i++) {
        const idx = refs[i];
        if (typeof idx !== "number" || idx < 0) continue;
        const gm = all[idx];
        if (!gm || seen.has(idx)) continue;
        seen.add(idx);
        ordered.push(gm);
      }
    }
    const children = node.children;
    if (children != null && typeof children.length === "number") {
      for (let c = 0; c < children.length; c++) {
        visitNode(children[c]);
      }
    }
  }

  visitNode(result?.root);

  if (ordered.length > 0) {
    for (let i = 0; i < slotCount; i++) {
      if (!seen.has(i) && all[i]) {
        ordered.push(all[i]);
        seen.add(i);
      }
    }
    return ordered;
  }

  const list = [];
  for (let i = 0; i < slotCount; i++) {
    if (all[i]) list.push(all[i]);
  }
  return list;
}

/**
 * occt 결과의 meshes[]를 하나의 삼각형 메시로 병합
 * @param {object} result ReadStepFile / ReadIgesFile 반환
 */
export function mergeOcctMeshes(result) {
  const meshes = collectOcctMeshesInOrder(result);
  const posChunks = [];
  const nrmChunks = [];
  const idxChunks = [];
  let offset = 0;
  let anyNormals = true;
  let skippedEmptyMesh = 0;

  for (const gm of meshes) {
    const posSrc = gm.attributes?.position?.array ?? gm.attributes?.position;
    const pa = flatFloat3Array(posSrc);
    const naSrc = gm.attributes?.normal?.array ?? gm.attributes?.normal;
    const na = naSrc != null ? flatFloat3Array(naSrc) : null;
    const idxSrc = gm.index?.array ?? gm.index;
    const ia = flatIndexArray(idxSrc);
    if (pa.length < 9 || ia.length < 3) {
      skippedEmptyMesh += 1;
      const label =
        typeof gm?.name === "string" && gm.name.trim()
          ? `"${gm.name.trim()}"`
          : "(이름 없음)";
      console.warn(
        `[CAD] 삼각 메시가 없어 스킵: ${label} (정점 ${pa.length / 3 | 0}, 인덱스 ${ia.length})`
      );
      continue;
    }

    const vCount = pa.length / 3;
    posChunks.push(pa);
    if (na && na.length === pa.length) {
      nrmChunks.push(na);
    } else {
      anyNormals = false;
    }
    const idxArr = new Uint32Array(ia.length);
    for (let i = 0; i < ia.length; i++) {
      idxArr[i] = offset + (ia[i] | 0);
    }
    idxChunks.push(idxArr);
    offset += vCount;
  }

  if (posChunks.length === 0) {
    throw new Error("CAD 파일에서 유효한 메시를 찾지 못했습니다.");
  }

  if (skippedEmptyMesh > 0) {
    console.warn(
      `[CAD] ${skippedEmptyMesh}개 메시는 삼각형이 없어 병합에서 제외되었습니다. (와이어/곡면 실패 등)`
    );
  }

  let totalPos = 0;
  for (const c of posChunks) totalPos += c.length;
  const positions = new Float32Array(totalPos);
  let w = 0;
  for (const c of posChunks) {
    positions.set(c, w);
    w += c.length;
  }

  let indicesFlat = [];
  for (const c of idxChunks) {
    for (let i = 0; i < c.length; i++) indicesFlat.push(c[i]);
  }
  const maxIdx = indicesFlat.reduce((m, v) => (v > m ? v : m), 0);
  const IndexArray = maxIdx > 65535 ? Uint32Array : Uint16Array;
  const indices = new IndexArray(indicesFlat.length);
  for (let i = 0; i < indicesFlat.length; i++) indices[i] = indicesFlat[i];

  let normals = null;
  if (anyNormals && nrmChunks.length === posChunks.length) {
    normals = new Float32Array(totalPos);
    w = 0;
    for (const c of nrmChunks) {
      normals.set(c, w);
      w += c.length;
    }
  } else {
    normals = computeFlatNormals(positions, indices);
  }

  return { positions, normals, indices };
}

/**
 * @param {import('playcanvas').Application} app
 * @param {File} file
 * @param {(pct: number, msg?: string) => void} [onProgress]
 * @returns {Promise<import('playcanvas').Entity>}
 */
export async function importCadFileToEntity(app, file, onProgress) {
  const pc = window.pc;
  if (!pc || !app?.graphicsDevice) {
    throw new Error("PlayCanvas가 준비되지 않았습니다.");
  }

  const kind = getCadFileKind(file.name);
  if (!kind) {
    throw new Error("지원하는 CAD 확장자가 아닙니다 (.step .stp .iges .igs)");
  }

  onProgress?.(8, "CAD 엔진 로드…");
  const occt = await ensureOcct();

  const buf = new Uint8Array(await file.arrayBuffer());
  onProgress?.(20, "CAD 파싱…");

  const params = kind === "step" ? OCCT_PARAMS_STEP : OCCT_PARAMS_IGES;

  let result;
  if (kind === "step") {
    result = occt.ReadStepFile(buf, params);
  } else {
    result = occt.ReadIgesFile(buf, params);
  }

  if (!result?.success) {
    throw new Error(result?.error || "CAD 가져오기에 실패했습니다.");
  }

  onProgress?.(55, "메시 생성…");
  const { positions, normals, indices } = mergeOcctMeshes(result);

  onProgress?.(75, "GPU 메시 업로드…");
  const device = app.graphicsDevice;
  const mesh = new pc.Mesh(device);
  mesh.setPositions(positions);
  mesh.setNormals(normals);
  mesh.setIndices(indices);
  mesh.update(pc.PRIMITIVE_TRIANGLES);

  const material = new pc.StandardMaterial();
  material.diffuse = new pc.Color(0.65, 0.68, 0.72);
  material.metalness = 0.15;
  material.gloss = 0.45;
  material.useMetalness = true;
  material.update();

  const meshInstance = new pc.MeshInstance(mesh, material);
  const entity = new pc.Entity(file.name || "CAD");
  entity.addComponent("render", {
    meshInstances: [meshInstance],
    castShadows: true,
    receiveShadows: true,
  });

  onProgress?.(100, "완료");
  return entity;
}
