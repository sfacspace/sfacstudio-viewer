/**
 * App Viewer / Playing App HTML export 공통: PLY 스트리밍·브랜딩 에셋.
 */
import { writePlyBinary, getExportOptionsFromWorldMat4, getGsplatResourceFromEntity } from './exportPly.js';
import {
  collectCollisionBlockersForExport,
  collectCollisionCubesForExport,
} from '../core/collisionBlockers.js';

export { collectCollisionBlockersForExport, collectCollisionCubesForExport };

const BASE64_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

export function uint8ToBase64(u8) {
  if (!u8 || !u8.length) return '';
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < u8.length; i += chunkSize) {
    binary += String.fromCharCode.apply(null, u8.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

export async function streamBlobToBase64(blob, onChunk, throwIfAborted = () => {}) {
  if (!blob) return;
  const reader = blob.stream?.().getReader?.();
  if (!reader) {
    const buf = await blob.arrayBuffer();
    const u8 = new Uint8Array(buf);
    let binary = '';
    const chunkSize = 0x8000;
    for (let i = 0; i < u8.length; i += chunkSize) {
      binary += String.fromCharCode.apply(null, u8.subarray(i, i + chunkSize));
    }
    await onChunk(btoa(binary));
    return;
  }

  let carry = new Uint8Array(0);
  while (true) {
    throwIfAborted();
    const { done, value } = await reader.read();
    if (done) break;
    if (!value || value.length === 0) continue;

    let input;
    if (carry.length) {
      input = new Uint8Array(carry.length + value.length);
      input.set(carry, 0);
      input.set(value, carry.length);
    } else {
      input = value;
    }

    const usable = input.length - (input.length % 3);
    const outLen = (usable / 3) * 4;
    const chars = new Array(outLen);
    let o = 0;
    for (let i = 0; i < usable; i += 3) {
      const n = (input[i] << 16) | (input[i + 1] << 8) | input[i + 2];
      chars[o++] = BASE64_ALPHABET[(n >> 18) & 63];
      chars[o++] = BASE64_ALPHABET[(n >> 12) & 63];
      chars[o++] = BASE64_ALPHABET[(n >> 6) & 63];
      chars[o++] = BASE64_ALPHABET[n & 63];
    }
    if (outLen) await onChunk(chars.join(''));

    const rem = input.length - usable;
    carry = rem ? input.slice(usable) : new Uint8Array(0);
  }

  if (carry.length) {
    const a = carry[0];
    const b = carry.length > 1 ? carry[1] : 0;
    const n = (a << 16) | (b << 8);
    const c1 = BASE64_ALPHABET[(n >> 18) & 63];
    const c2 = BASE64_ALPHABET[(n >> 12) & 63];
    const c3 = carry.length > 1 ? BASE64_ALPHABET[(n >> 6) & 63] : '=';
    await onChunk(c1 + c2 + c3 + '=');
  }
}

export async function loadBrandingExportOpts(signal) {
  let iconBase64 = null;
  let iconType = null;
  for (const iconPath of ['/static/logo_white.svg', './static/logo_white.svg', '/static/favicon.svg', './static/favicon.svg']) {
    try {
      const r = await fetch(iconPath, { signal: signal || undefined });
      if (r.ok) {
        const text = await r.text();
        iconBase64 = btoa(unescape(encodeURIComponent(text)));
        iconType = 'svg';
        break;
      }
    } catch (e) {
      /* ignore */
    }
  }
  if (!iconBase64) {
    for (const iconPath of ['/static/symbol.png', './static/symbol.png']) {
      try {
        const r = await fetch(iconPath, { signal: signal || undefined });
        if (r.ok) {
          iconBase64 = uint8ToBase64(new Uint8Array(await r.arrayBuffer()));
          iconType = 'png';
          break;
        }
      } catch (e) {
        /* ignore */
      }
    }
  }
  let logoBase64 = null;
  for (const logoPath of ['/static/logo_white.svg', './static/logo_white.svg', '/static/logo.svg', './static/logo.svg']) {
    try {
      const r = await fetch(logoPath, { signal: signal || undefined });
      if (r.ok) {
        const text = await r.text();
        logoBase64 = btoa(unescape(encodeURIComponent(text)));
        break;
      }
    } catch (e) {
      /* ignore */
    }
  }
  return {
    iconBase64,
    iconType,
    logoBase64,
    playcanvasPath: 'https://cdn.jsdelivr.net/npm/playcanvas@2.15.1/build/playcanvas.mjs',
  };
}

export async function loadPlayerPlyBase64(signal) {
  for (const plyPath of ['/playerply/player.ply', './playerply/player.ply']) {
    try {
      const r = await fetch(plyPath, { signal: signal || undefined });
      if (!r.ok) continue;
      return uint8ToBase64(new Uint8Array(await r.arrayBuffer()));
    } catch (e) {
      /* optional */
    }
  }
  return null;
}

export function extractLocalTransform(entity) {
  if (!entity) return null;
  const q = entity.getLocalRotation();
  return {
    position: {
      x: entity.getLocalPosition().x,
      y: entity.getLocalPosition().y,
      z: entity.getLocalPosition().z,
    },
    rotation: { x: q.x, y: q.y, z: q.z, w: q.w },
    scale: entity.getLocalScale().x,
  };
}

export function getExportTransform(obj) {
  const entityTransform = obj?.entity ? extractLocalTransform(obj.entity) : null;
  const seq = obj?._sequenceTransform;
  const pos =
    seq?.position &&
    (seq.position.x !== undefined || seq.position.y !== undefined || seq.position.z !== undefined)
      ? { x: seq.position.x ?? 0, y: seq.position.y ?? 0, z: seq.position.z ?? 0 }
      : (entityTransform?.position ?? null);
  const scaleVal =
    seq?.scale !== undefined
      ? typeof seq.scale === 'number'
        ? seq.scale
        : (seq.scale?.x ?? 1)
      : (entityTransform?.scale ?? 1);
  const rotation = entityTransform?.rotation ?? obj?.transform?.rotation ?? null;
  if (pos && rotation) {
    const scaleOut = typeof scaleVal === 'number' ? scaleVal : (scaleVal?.x ?? 1);
    return {
      position: { x: pos.x ?? 0, y: pos.y ?? 0, z: pos.z ?? 0 },
      rotation: { x: rotation.x, y: rotation.y, z: rotation.z, w: rotation.w },
      scale: scaleOut,
    };
  }
  if (entityTransform) return entityTransform;
  return obj?.transform ?? null;
}

/**
 * @param {object|null} selectionTool
 */
export function createPlyBytesExtractor(selectionTool) {
  return function extractPlyBytes(entity) {
    try {
      if (!entity?.gsplat) return { bytes: null, transformBaked: false };
      const resource = getGsplatResourceFromEntity(entity, selectionTool);
      const gsplatData = resource?.gsplatData;
      if (!gsplatData?.elements?.length) return { bytes: null, transformBaked: false };

      const keepMask = selectionTool
        ? (() => {
            const erasedSet = selectionTool._getErasedIndicesForEntity?.(entity);
            return (i) => !(erasedSet instanceof Set && erasedSet.has(i));
          })()
        : () => true;

      const world = typeof entity.getWorldTransform === 'function' ? entity.getWorldTransform() : null;
      const opts = getExportOptionsFromWorldMat4(world, { useFullWorldMatrix: true });
      const transformBaked = !!opts.worldMat4;
      const bytes = writePlyBinary(gsplatData, keepMask, opts);
      if (!bytes) return { bytes: null, transformBaked: false };
      return {
        bytes: bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes),
        transformBaked,
      };
    } catch (e) {
      return { bytes: null, transformBaked: false };
    }
  };
}

/** @param {object|null} playMode */
export function getPlaySpawnMetaForExport(playMode) {
  if (typeof playMode?.getPlaySpawnExportMeta === 'function') {
    return playMode.getPlaySpawnExportMeta();
  }
  const st = playMode?.serializeState?.();
  const pp = st?.playPosition;
  return {
    position: pp?.position ?? { x: 0, y: 0, z: 0 },
    scale: pp?.scale ?? { x: 1, y: 1, z: 1 },
    rotationY: typeof pp?.rotationY === 'number' ? pp.rotationY : 0,
    visible: pp?.visible === true,
  };
}

/** @param {object|null} playMode */
export function getPlaySpawnForExport(playMode) {
  return getPlaySpawnMetaForExport(playMode).position;
}

const DEFAULT_SCENE_SETTINGS = {
  fogType: 'exp2',
  fogDensity: 0.03,
  fogColor: { r: 0, g: 0, b: 0 },
  clearColor: { r: 0, g: 0, b: 0 },
};

export { DEFAULT_SCENE_SETTINGS };

/**
 * META.objects JSON 배열을 writable에 스트리밍 (앞뒤 `[` `]` 포함).
 * @param {object} params
 */
export async function streamTimelineObjectsJson(writable, params) {
  const {
    timeline,
    fileLoader,
    selectionTool,
    signal,
    streamTotalFrames = 1,
    skipTypes = new Set(['cube', 'empty', 'obj', 'glb']),
  } = params;

  const throwIfAborted = () => {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
  };

  const extractPlyBytes = createPlyBytesExtractor(selectionTool);
  const objects = timeline.objects || [];
  let needComma = false;

  await writable.write('[');

  for (const obj of objects) {
    throwIfAborted();
    if (skipTypes.has(obj.objectType)) continue;
    if (needComma) await writable.write(',');
    needComma = true;

    const baseTransform = getExportTransform(obj) ?? extractLocalTransform(obj.entity);
    const startFrame = 0;
    const endFrame = streamTotalFrames;

    if (obj.isMultiFile && obj.files) {
      await writable.write(
        '{"id":' +
          JSON.stringify(obj.id) +
          ',"name":' +
          JSON.stringify(obj.name) +
          ',"startFrame":' +
          startFrame +
          ',"endFrame":' +
          endFrame +
          ',"isMultiFile":true,"files":['
      );

      for (let fi = 0; fi < obj.files.length; fi++) {
        throwIfAborted();
        if (fi > 0) await writable.write(',');
        const f = obj.files[fi];
        const fileData = fileLoader.getFileDataBySplatId(f.splatId);
        const fileTransform = extractLocalTransform(f.entity) || baseTransform;
        const { bytes, transformBaked } = extractPlyBytes(f.entity);
        const exportTransform = transformBaked ? null : fileTransform;

        const fileHeader = {
          fileName: f.fileName || `file_${fi}.ply`,
          splatId: f.splatId || '',
          base64: '__B64__',
          transform: exportTransform,
        };
        const fileJson = JSON.stringify(fileHeader);
        const bIdx = fileJson.indexOf('__B64__');

        if (bIdx < 0) {
          await writable.write(JSON.stringify({ ...fileHeader, base64: '' }));
        } else {
          await writable.write(fileJson.slice(0, bIdx));
          if (bytes?.length) {
            await streamBlobToBase64(new Blob([bytes]), (chunk) => writable.write(chunk), throwIfAborted);
          } else {
            const b64 = fileData?.base64 || '';
            for (let j = 0; j < b64.length; j += 0x8000) {
              await writable.write(b64.slice(j, j + 0x8000));
            }
          }
          await writable.write(fileJson.slice(bIdx + 7));
        }
      }
      await writable.write('],"transform":null}');
      continue;
    }

    const { bytes, transformBaked } = extractPlyBytes(obj.entity);
    const exportTransform = transformBaked ? null : baseTransform || obj.transform || null;
    const singleHeader = {
      id: obj.id,
      name: obj.name,
      startFrame,
      endFrame,
      isMultiFile: false,
      base64: '__B64__',
      transform: exportTransform,
    };
    const singleJson = JSON.stringify(singleHeader);
    const singleBIdx = singleJson.indexOf('__B64__');

    if (singleBIdx < 0) {
      await writable.write(JSON.stringify({ ...singleHeader, base64: '' }));
    } else {
      await writable.write(singleJson.slice(0, singleBIdx));
      if (bytes?.length) {
        await streamBlobToBase64(new Blob([bytes]), (chunk) => writable.write(chunk), throwIfAborted);
      }
      await writable.write(singleJson.slice(singleBIdx + 7));
    }
  }

  await writable.write(']');
}

/**
 * htmlBase 안의 objects placeholder를 스트리밍 객체 배열로 치환해 writable에 기록.
 */
export async function writeHtmlDocumentWithObjects(writable, htmlBase, objectsPlaceholder, streamObjectsFn) {
  const marker = JSON.stringify(objectsPlaceholder);
  const idx = htmlBase.indexOf(marker);
  if (idx < 0) throw new Error('objects placeholder not found');
  await writable.write(htmlBase.slice(0, idx));
  await streamObjectsFn();
  await writable.write(htmlBase.slice(idx + marker.length));
}
