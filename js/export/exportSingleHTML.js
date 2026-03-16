/**
 * Serialize viewer to single HTML (frame-based: totalFrames, keyframes[].frame, startFrame/endFrame).
 * When PLY has baked world transform → JSON transform = null; otherwise keep baseTransform.
 *
 * @param {Object} options.fileLoader - FileLoader
 * @param {Object} options.timeline - TimelineController
 * @param {Object} options.viewer - PlayCanvasViewer
 * @param {Object} [options.selectionTool] - SelectionTool (for PLY with erased points removed)
 * @param {AbortSignal} [options.signal] - AbortSignal
 */
import { getEmbeddedViewerScript } from './embeddedViewerScript.js';
import { writePlyBinary, getExportOptionsFromWorldMat4 } from './exportPly.js';
import { loadGSplatDataWithMorton } from '../core/splatLoader.js';
import { t } from '../i18n.js';

export async function serializeViewer(options = {}) {
  const { fileLoader, timeline, viewer, selectionTool, signal, onCancel } = options;
  const selTool = selectionTool ?? (typeof window !== 'undefined' && window.__selectionTool ? window.__selectionTool : null);

  if (!fileLoader || !timeline || !viewer) {
    console.error("[serializeViewer] fileLoader, timeline, viewer required.");
    return;
  }

  const throwIfAborted = () => {
    if (signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }
  };

  throwIfAborted();

  // Base64 streaming util

  const base64Alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

  const streamBlobToBase64 = async (blob, onChunk) => {
    if (!blob) return;
    const reader = blob.stream?.().getReader?.();
    if (!reader) {
      const buf = await blob.arrayBuffer();
      const u8 = new Uint8Array(buf);
      let binary = "";
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
        chars[o++] = base64Alphabet[(n >> 18) & 63];
        chars[o++] = base64Alphabet[(n >> 12) & 63];
        chars[o++] = base64Alphabet[(n >> 6) & 63];
        chars[o++] = base64Alphabet[n & 63];
      }
      if (outLen) {
        await onChunk(chars.join(''));
      }

      const rem = input.length - usable;
      carry = rem ? input.slice(usable) : new Uint8Array(0);
    }

    if (carry.length) {
      const a = carry[0];
      const b = carry.length > 1 ? carry[1] : 0;
      const n = (a << 16) | (b << 8);
      const c1 = base64Alphabet[(n >> 18) & 63];
      const c2 = base64Alphabet[(n >> 12) & 63];
      const c3 = carry.length > 1 ? base64Alphabet[(n >> 6) & 63] : '=';
      const c4 = '=';
      await onChunk(c1 + c2 + c3 + c4);
    }
  };

  const uint8ToBase64 = (u8) => {
    if (!u8 || !u8.length) return "";
    let binary = "";
    const chunkSize = 0x8000;
    for (let i = 0; i < u8.length; i += chunkSize) {
      binary += String.fromCharCode.apply(null, u8.subarray(i, i + chunkSize));
    }
    return btoa(binary);
  };

  const loadExportOpts = async () => {
    let iconBase64 = null;
    let iconType = null;
    for (const iconPath of ['/static/favicon.svg', './static/favicon.svg']) {
      try {
        const r = await fetch(iconPath, { signal: signal || undefined });
        if (r.ok) {
          const text = await r.text();
          iconBase64 = btoa(unescape(encodeURIComponent(text)));
          iconType = 'svg';
          break;
        }
      } catch (e) {}
    }
    if (!iconBase64) {
      for (const iconPath of ['/static/symbol.png', './static/symbol.png']) {
        try {
          const r = await fetch(iconPath, { signal: signal || undefined });
          if (r.ok) {
            const buf = await r.arrayBuffer();
            const u8 = new Uint8Array(buf);
            let binary = '';
            const chunk = 0x8000;
            for (let i = 0; i < u8.length; i += chunk) binary += String.fromCharCode.apply(null, u8.subarray(i, i + chunk));
            iconBase64 = btoa(binary);
            iconType = 'png';
            break;
          }
        } catch (e) {}
      }
    }
    let logoBase64 = null;
    for (const logoPath of ['/static/logo.svg', './static/logo.svg']) {
      try {
        const r = await fetch(logoPath, { signal: signal || undefined });
        if (r.ok) {
          const text = await r.text();
          logoBase64 = btoa(unescape(encodeURIComponent(text)));
          break;
        }
      } catch (e) {}
    }
    return {
      iconBase64,
      iconType,
      logoBase64,
      playcanvasPath: 'https://cdn.jsdelivr.net/npm/playcanvas@2.15.1/build/playcanvas.mjs',
    };
  };

  /** Extract local transform; only include in JSON when PLY is not baked. */
  const extractLocalTransform = (entity) => {
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
  };

  /** Export transform: position/scale from _sequenceTransform; rotation from entity (avoids RotZ lock). */
  const getExportTransform = (obj) => {
    const entityTransform = obj?.entity ? extractLocalTransform(obj.entity) : null;
    const seq = obj?._sequenceTransform;
    const pos = (seq?.position && (seq.position.x !== undefined || seq.position.y !== undefined || seq.position.z !== undefined))
      ? { x: seq.position.x ?? 0, y: seq.position.y ?? 0, z: seq.position.z ?? 0 }
      : (entityTransform?.position ?? null);
    const scaleVal = (seq?.scale !== undefined)
      ? (typeof seq.scale === 'number' ? seq.scale : (seq.scale?.x ?? 1))
      : (entityTransform?.scale ?? 1);
    const rotation = entityTransform?.rotation ?? (obj?.transform?.rotation ?? null);
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
  };

  /**
   * Extract PLY bytes and whether world transform was baked (baked → JSON transform = null).
   * @returns {{ bytes: Uint8Array|null, transformBaked: boolean }}
   */
  const extractPlyBytes = (entity) => {
    try {
      if (!entity?.gsplat) return { bytes: null, transformBaked: false };
      const instance = entity.gsplat?.instance;
      const resource = instance?.resource;
      const gsplatData = resource?.gsplatData;
      if (!gsplatData?.elements?.length) return { bytes: null, transformBaked: false };

      const keepMask = selTool
        ? (() => {
            const erasedSet = selTool._getErasedIndicesForEntity?.(entity);
            return (i) => !(erasedSet instanceof Set && erasedSet.has(i));
          })()
        : () => true;

      const world = typeof entity.getWorldTransform === 'function' ? entity.getWorldTransform() : null;
      const opts = getExportOptionsFromWorldMat4(world, { useFullWorldMatrix: true });

      // writePlyBinary bakes world when opts.worldMat4 is set
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

  const writeExportHTMLStreamed = async (writable, {
    maxSeconds,
    fps,
    totalFrames,
    cameraSpeedProfileStart,
    cameraSpeedProfileEnd,
    initialCameraState,
    initialCamera,
    orbitTarget,
    orbitDistance,
    sceneSettings,
  }, exportOpts = {}) => {
    const initialCam = initialCameraState ?? initialCamera;
    const payloadTotalCount = window.__exportAppViewerTotalCount;
    let payloadDoneCount = 0;

    const placeholder = '__OBJECTS_PLACEHOLDER__';
    const streamTotalFrames = Math.max(1, Math.min(18000, parseInt(totalFrames) || 1));
    const htmlBase = generateHTML({
      maxSeconds,
      fps,
      totalFrames,
      cameraSpeedProfileStart: cameraSpeedProfileStart ?? 0,
      cameraSpeedProfileEnd: cameraSpeedProfileEnd ?? 0,
      objects: placeholder,
      keyframes: (timeline.keyframes || []).map(kf => ({
        id: kf.id,
        frame: (typeof kf.frame === 'number')
          ? Math.max(0, Math.min(streamTotalFrames - 1, kf.frame))
          : Math.max(0, Math.min(streamTotalFrames - 1, Math.round((Number(kf.t) || 0) * (parseInt(fps) || 30)))),
        state: kf.state,
      })),
      movingObjects: (timeline._keyframes?._movingObjectManager?.getAll?.() || []).map(mo => ({
        id: mo.id,
        fromKeyframeId: mo.fromKeyframe?.id,
        toKeyframeId: mo.toKeyframe?.id,
        curvature: mo.curvature ?? 1,
        angle: mo.angle ?? 0,
      })),
      initialCamera: initialCam,
      orbitTarget,
      orbitDistance,
      sceneSettings,
    }, exportOpts);

    const marker = JSON.stringify(placeholder);
    const idx = htmlBase.indexOf(marker);
    if (idx < 0) throw new Error('objects placeholder not found');
    await writable.write(htmlBase.slice(0, idx));
    await writable.write('[');

    const objects = timeline.objects || [];

    for (let oi = 0; oi < objects.length; oi++) {
      throwIfAborted();
      const obj = objects[oi];
      if (oi > 0) await writable.write(',');

      const baseTransform = getExportTransform(obj) ?? extractLocalTransform(obj.entity);

      // (A) Sequence object
      if (obj.isSequence && Array.isArray(obj.files)) {
        const objFps = Math.max(1, Math.min(60, parseInt(fps) || 30));
        const startFrame = Math.max(0, Math.round((Number(obj.startSeconds) || 0) * objFps));
        const endFrame = Math.max(0, Math.round((Number(obj.endSeconds) || 0) * objFps));

        // Sequence frames are baked → transform null
        const objHeader = {
          id: obj.id, name: obj.name, startFrame, endFrame,
          isMultiFile: true, isSequence: true, files: '__FILES__',
          transform: null,
        };
        const objJson = JSON.stringify(objHeader);
        const filesMarker = JSON.stringify('__FILES__');
        const fIdx = objJson.indexOf(filesMarker);
        if (fIdx < 0) {
          await writable.write(JSON.stringify({ ...objHeader, files: [] }));
          continue;
        }
        await writable.write(objJson.slice(0, fIdx));
        await writable.write('[');

        const frameTotalCount = obj.files.length;
        const sequenceHasErase = selTool?.erasedVolumesBySequenceId?.get(obj.id)?.batches?.length > 0;

        for (let i = 0; i < frameTotalCount; i++) {
          throwIfAborted();
          if (i > 0) await writable.write(',');
          const frameRef = obj.files[i];
          let blob = await getSequenceFrameBlob(frameRef, i);
          const frameName = blob?.name || frameRef?.fileName || `frame_${i}.ply`;

          // Erase + bake transform for sequence frame
          let frameBaked = false;
          if (blob && sequenceHasErase && selTool && typeof selTool.getErasedIndicesForSequenceExport === 'function') {
            try {
              const pc = window.pc;
              if (pc) {
                const arrayBuffer = await blob.arrayBuffer();
                const gsplatData = await loadGSplatDataWithMorton(pc, frameName, arrayBuffer, { skipReorder: true, skipValidation: true });
                const pos = baseTransform?.position;
                const rot = baseTransform?.rotation;
                const scale = baseTransform?.scale ?? 1;
                const mat = new pc.Mat4();
                const posV = new pc.Vec3(pos?.x ?? 0, pos?.y ?? 0, pos?.z ?? 0);
                const quat = new pc.Quat();
                if (rot && typeof rot.w === 'number') {
                  quat.set(rot.x, rot.y, rot.z, rot.w);
                } else {
                  quat.setFromEulerAngles(rot?.x ?? 0, rot?.y ?? 0, rot?.z ?? 0);
                }
                const scaleV = new pc.Vec3(scale, scale, scale);
                mat.setTRS(posV, quat, scaleV);
                const erasedSet = selTool.getErasedIndicesForSequenceExport(gsplatData, mat, obj.id);
                const keepMask = (idx) => !erasedSet.has(idx);
                const opts = getExportOptionsFromWorldMat4(mat);
                const bytes = writePlyBinary(gsplatData, keepMask, opts);
                if (bytes?.length) {
                  blob = new Blob([bytes]);
                  frameBaked = true;
                }
              }
            } catch (err) {
              console.warn('[export] sequence frame erase apply failed', frameName, err);
            }
          }

          // transform = null when frame PLY is baked
          const fileHeader = {
            fileName: frameName,
            splatId: frameRef?.splatId || '',
            base64: '__B64__',
            transform: frameBaked ? null : baseTransform,
          };
          const fileJson = JSON.stringify(fileHeader);
          const b64Marker = JSON.stringify('__B64__');
          const bIdx = fileJson.indexOf(b64Marker);
          if (bIdx < 0) {
            await writable.write(JSON.stringify({ ...fileHeader, base64: '' }));
            continue;
          }
          await writable.write(fileJson.slice(0, bIdx));
          await writable.write('"');
          if (blob) {
            await streamBlobToBase64(blob, async (chunk) => {
              throwIfAborted();
              await writable.write(chunk);
            });
          }
          await writable.write('"');
          await writable.write(fileJson.slice(bIdx + b64Marker.length));

          if (typeof payloadTotalCount === 'number') payloadDoneCount += 1;
        }

        await writable.write(']');
        await writable.write(objJson.slice(fIdx + filesMarker.length));
        continue;
      }

      // (B) Multi-file object (non-sequence)
      if (obj.isMultiFile && obj.files && !obj.isSequence) {
        const objFps = Math.max(1, Math.min(60, parseInt(fps) || 30));
        const startFrame = Math.max(0, Math.round((Number(obj.startSeconds) || 0) * objFps));
        const endFrame = Math.max(0, Math.round((Number(obj.endSeconds) || 0) * objFps));

        await writable.write('{"id":' + JSON.stringify(obj.id) + ',"name":' + JSON.stringify(obj.name) + ',"startFrame":' + startFrame + ',"endFrame":' + endFrame + ',"isMultiFile":true,"files":[');

        const totalF = obj.files.length;
        for (let fi = 0; fi < totalF; fi++) {
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
          const b64Marker = '__B64__';
          const bIdx = fileJson.indexOf(b64Marker);

          if (bIdx < 0) {
            await writable.write(JSON.stringify({ ...fileHeader, base64: '' }));
          } else {
            await writable.write(fileJson.slice(0, bIdx));
            if (bytes?.length) {
              await streamBlobToBase64(new Blob([bytes]), async (chunk) => {
                throwIfAborted();
                await writable.write(chunk);
              });
            } else {
              // Fallback when bytes extraction fails (exportTransform = fileTransform)
              const b64 = fileData?.base64 || '';
              for (let j = 0; j < b64.length; j += 0x8000) {
                await writable.write(b64.slice(j, j + 0x8000));
              }
            }
            await writable.write(fileJson.slice(bIdx + b64Marker.length));
          }
        }

        // Object-level transform null (handled per file)
        await writable.write('],"transform":null}');
        if (typeof payloadTotalCount === 'number') payloadDoneCount += 1;
        continue;
      }

      // (C) Single-file object
      const objFps = Math.max(1, Math.min(60, parseInt(fps) || 30));
      const startFrame = Math.max(0, Math.round((Number(obj.startSeconds) || 0) * objFps));
      const endFrame = Math.max(0, Math.round((Number(obj.endSeconds) || 0) * objFps));

      const { bytes, transformBaked } = extractPlyBytes(obj.entity);
      const exportTransform = transformBaked ? null : (baseTransform || obj.transform || null);

      const singleHeader = {
        id: obj.id, name: obj.name, startFrame, endFrame,
        isMultiFile: false,
        base64: '__B64__',
        transform: exportTransform,
      };
      const singleJson = JSON.stringify(singleHeader);
      const singleB64Marker = '__B64__';
      const singleBIdx = singleJson.indexOf(singleB64Marker);

      if (singleBIdx < 0) {
        await writable.write(JSON.stringify({ ...singleHeader, base64: '' }));
      } else {
        await writable.write(singleJson.slice(0, singleBIdx));
        if (bytes?.length) {
          await streamBlobToBase64(new Blob([bytes]), async (chunk) => {
            throwIfAborted();
            await writable.write(chunk);
          });
        } else {
          // Fallback: no bake, exportTransform is original transform
          const b64 = '';
          for (let j = 0; j < b64.length; j += 0x8000) {
            await writable.write(b64.slice(j, j + 0x8000));
          }
        }
        await writable.write(singleJson.slice(singleBIdx + singleB64Marker.length));
      }

      if (typeof payloadTotalCount === 'number') payloadDoneCount += 1;
    }

    await writable.write(']');
    await writable.write(htmlBase.slice(idx + marker.length));
    await writable.close();
  };

  const getSequenceFrameBlob = async (frameRef, index) => {
    if (!frameRef) return null;
    if (frameRef.file instanceof Blob) return frameRef.file;
    // Path-based sequence: fetch from local file server
    if (frameRef.path && typeof window.__getLocalFileServerBaseUrl === 'function') {
      try {
        const baseUrl = (await window.__getLocalFileServerBaseUrl()).replace(/\/$/, '');
        const url = `${baseUrl}/local-file?path=${encodeURIComponent(frameRef.path)}`;
        const res = await fetch(url);
        if (res.ok) {
          const blob = await res.blob();
          const fileName = (frameRef.path.split(/[/\\]/).pop()) || frameRef.fileName || `frame_${index}.ply`;
          return new File([blob], fileName, { type: 'application/octet-stream' });
        }
      } catch (e) {
        console.warn('[export] Sequence frame path load failed', frameRef.path, e);
      }
    }
    return null;
  };

  const objects = timeline.objects || [];
  const loadedFiles = fileLoader.getLoadedFiles() || [];
  if (!objects.length) {
    if (loadedFiles.length === 0) {
      alert("내보낼 파일이 없습니다. PLY 파일을 먼저 로드해주세요.");
    } else {
      alert("내보낼 오브젝트가 없습니다.");
    }
    return;
  }
  throwIfAborted();

  const defaultName = (timeline.objects || [])[0]?.name?.replace(/\.[^/.]+$/, "") || "scene";
  const fileName = `with_${defaultName}.html`;

  // Build common export params (frame-based: totalFrames + fps)
  const buildStreamExportOpts = () => {
    const maxSeconds = (typeof timeline?.getMaxSeconds === 'function' ? timeline.getMaxSeconds() : (timeline.maxSeconds || 30));
    const exportFps = Math.max(1, Math.min(60, parseInt(timeline?.fps) || 30));
    const exportTotalFrames = Math.max(1, Math.min(18000, parseInt(timeline?.totalFrames) || Math.round(maxSeconds * exportFps) || 1));
    const keyframesSorted = [...(timeline.keyframes || [])].sort((a, b) => (a.t ?? 0) - (b.t ?? 0));
    const initialCameraState = keyframesSorted.length > 0
      ? keyframesSorted[0].state
      : (viewer?.getCameraState?.() ?? null);

    return {
      fileName,
      maxSeconds,
      fps: exportFps,
      totalFrames: exportTotalFrames,
      cameraSpeedProfileStart: timeline._playback?._speedProfileStart ?? 0,
      cameraSpeedProfileEnd: timeline._playback?._speedProfileEnd ?? 0,
      initialCameraState,
      orbitTarget: viewer._orbitTarget ? { ...viewer._orbitTarget } : { x: 0, y: 0, z: 0 },
      orbitDistance: viewer._orbitDistance ?? 6.4,
      sceneSettings: {
        fogType: "exp2",
        fogDensity: 0.04,
        fogColor: { r: 0, g: 0, b: 0 },
        clearColor: { r: 0, g: 0, b: 0 },
      },
    };
  };

  // File System Access API
  if (window.showSaveFilePicker) {
    try {
      throwIfAborted();
      const fileHandle = await window.showSaveFilePicker({
        suggestedName: fileName,
        types: [{
          description: "HTML files",
          accept: { "text/html": [".html"] },
        }],
      });

      window.__showGlobalLoadingOverlay?.(t('loading.exportingAppViewer'), 0, {
        useSpinner: true,
        showCancel: true,
        cancelLabel: t('loading.cancel'),
        onCancel: typeof onCancel === 'function' ? onCancel : undefined,
      });

      const exportOpts = await loadExportOpts();
      throwIfAborted();

      const streamExportOpts = buildStreamExportOpts();
      const writable = await fileHandle.createWritable({ keepExistingData: false });
      await writeExportHTMLStreamed(writable, streamExportOpts, exportOpts);
      await writable.close();
      return;
    } catch (err) {
      if (err?.name === 'AbortError') return;
      console.warn("Streaming export failed:", err);
      return;
    }
  }

  // Fallback: Blob download
  window.__showGlobalLoadingOverlay?.(t('loading.exportingAppViewer'), 0, {
    useSpinner: true,
    showCancel: true,
    cancelLabel: t('loading.cancel'),
    onCancel: typeof onCancel === 'function' ? onCancel : undefined,
  });

  const exportOpts = await loadExportOpts();
  throwIfAborted();

  const streamExportOpts = buildStreamExportOpts();
  const chunks = [];
  const collectorWritable = {
    write(chunk) {
      chunks.push(typeof chunk === 'string' ? chunk : new Uint8Array(chunk));
    },
    close() {},
  };
  await writeExportHTMLStreamed(collectorWritable, streamExportOpts, exportOpts);
  const blob = new Blob(chunks, { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

function generateHTML(viewerSettingsJson, opts = {}) {
  const metaJson = JSON.stringify(viewerSettingsJson);
  const playcanvasPath = opts.playcanvasPath || 'https://cdn.jsdelivr.net/npm/playcanvas@2.15.1/build/playcanvas.mjs';
  const scriptBody = getEmbeddedViewerScript(playcanvasPath);
  const faviconTag = opts.iconBase64
    ? (opts.iconType === 'svg'
        ? `<link rel="icon" type="image/svg+xml" href="data:image/svg+xml;base64,${opts.iconBase64}">`
        : `<link rel="icon" type="image/png" href="data:image/png;base64,${opts.iconBase64}">`)
    : '';
  const headerLogoHtml = opts.logoBase64
    ? `<span class="header-logo-text" aria-label="SFACSTUDIO"><img src="data:image/svg+xml;base64,${opts.logoBase64}" alt="SFACSTUDIO" class="header-logo-img" /></span>`
    : `<span class="logo-text">SFACSTUDIO</span>`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SFACSTUDIO</title>
  ${faviconTag}
  <link rel="modulepreload" href="${playcanvasPath}" crossorigin>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; overflow: hidden; background: #000; font-family: system-ui, sans-serif; }
    .logo-text { font-family: system-ui, sans-serif; letter-spacing: 0.5px; }
    #app { position: fixed; inset: 0; top: 52px; height: calc(100vh - 52px); }
    #pcCanvas { width: 100% !important; height: 100% !important; display: block; touch-action: none; }
    #header { position: fixed; top: 0; left: 0; right: 0; height: 52px; background: rgba(10,15,24,0.96); display: flex; align-items: center; justify-content: center; gap: 24px; z-index: 200; overflow: hidden; transition: opacity 0.25s ease; }
    #header .logo-text { font-size: 32px; color: #3d5d85; user-select: none; -webkit-user-select: none; white-space: nowrap; pointer-events: none; }
    .header-logo-text { display: inline-flex; align-items: center; justify-content: center; user-select: none; pointer-events: auto; position: relative; cursor: pointer; }
    .header-logo-img { height: 44px; width: auto; display: block; object-fit: contain; transform: translateY(2px); transform-origin: 50% 50%; transition: filter 1.2s cubic-bezier(0.22, 0.61, 0.36, 1); filter: drop-shadow(0 0 6px rgba(150, 200, 255, 0.75)) drop-shadow(0 0 2px rgba(170, 210, 255, 0.6)); }
    .header-logo-text:hover .header-logo-img { filter: drop-shadow(0 0 6px rgba(180, 220, 255, 0.85)) drop-shadow(0 0 12px rgba(160, 210, 255, 0.6)) drop-shadow(0 0 20px rgba(140, 200, 255, 0.4)); }
    .camera-mode-switch { display: flex; align-items: center; margin-left: 16px; }
    .camera-mode-switch__label { position: relative; display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 34px; min-width: 40px; padding: 0; border-radius: 10px; border: none; background: transparent; color: #3d5d85; cursor: pointer; transition: color 140ms ease, transform 120ms ease, opacity 140ms ease, background 140ms ease; }
    .camera-mode-switch__label:hover { background: rgba(255,255,255,0.08); opacity: 0.95; }
    .camera-mode-switch__label:active { transform: translateY(1px); }
    .camera-mode-switch__input { position: absolute; opacity: 0; width: 0; height: 0; pointer-events: none; }
    .camera-mode-switch__icon-wrap { position: relative; width: 20px; height: 20px; display: block; }
    .camera-mode-switch__icon { position: absolute; inset: 0; display: block; background-color: currentColor; -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat; -webkit-mask-position: center; mask-position: center; -webkit-mask-size: contain; mask-size: contain; transition: opacity 0.28s ease, transform 0.28s ease; }
    .camera-mode-switch__icon--orbit { -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cellipse cx='12' cy='12' rx='10' ry='4'/%3E%3Cellipse cx='12' cy='12' rx='4' ry='10'/%3E%3C/svg%3E"); mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cellipse cx='12' cy='12' rx='10' ry='4'/%3E%3Cellipse cx='12' cy='12' rx='4' ry='10'/%3E%3C/svg%3E"); opacity: 1; transform: scale(1) rotate(0deg); }
    .camera-mode-switch__input:checked ~ .camera-mode-switch__icon-wrap .camera-mode-switch__icon--orbit { opacity: 0; transform: scale(0.6) rotate(-25deg); pointer-events: none; }
    .camera-mode-switch__icon--fly { -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M22 2L11 13'/%3E%3Cpath d='M22 2L15 22L11 13L2 9L22 2Z'/%3E%3C/svg%3E"); mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M22 2L11 13'/%3E%3Cpath d='M22 2L15 22L11 13L2 9L22 2Z'/%3E%3C/svg%3E"); opacity: 0; transform: scale(0.6) rotate(25deg); }
    .camera-mode-switch__input:checked ~ .camera-mode-switch__icon-wrap .camera-mode-switch__icon--fly { opacity: 1; transform: scale(1) rotate(0deg); }
    #hudRow { position: fixed; top: 66px; right: 20px; display: flex; align-items: center; gap: 10px; z-index: 100; transition: opacity 0.25s ease; }
    #memoryHud { display: none; padding: 8px 12px; background: rgba(35,35,35,0.92); border-radius: 8px; color: rgba(244,247,255,0.75); font-size: 12px; font-weight: 600; font-family: monospace; }
    #memoryHud.is-visible { display: block; }
    #fpsCounter { padding: 8px 16px; background: rgba(35,35,35,0.92); border-radius: 8px; color: rgba(180,255,140,0.9); font-size: 13px; }
    #controls { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); display: flex; align-items: center; gap: 16px; padding: 12px 20px; background: #252525; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.3); z-index: 100; transition: opacity 0.25s ease; }
    body.app-viewer-ui-hidden #header, body.app-viewer-ui-hidden #hudRow, body.app-viewer-ui-hidden #controls { opacity: 0; pointer-events: none; }
    #playBtn { width: 44px; height: 44px; border-radius: 50%; border: none; background: #252525; color: #f4f7ff; font-size: 16px; cursor: pointer; transition: background 120ms ease, color 120ms ease, box-shadow 120ms ease; box-shadow: 0 2px 8px rgba(0,0,0,0.3); }
    #playBtn:hover { background: #2a2a2a; box-shadow: 0 4px 12px rgba(0,0,0,0.35); }
    #playBtn[aria-pressed="true"] { background: #3d5d85; color: rgba(248,250,255,0.95); box-shadow: 0 2px 8px rgba(0,0,0,0.35), 0 0 0 1px rgba(61,93,133,0.5); }
    #frameSlider { width: 300px; height: 6px; -webkit-appearance: none; appearance: none; background: transparent; }
    #frameSlider::-webkit-slider-runnable-track { height: 6px; border-radius: 3px; background: #1a1a1a; }
    #frameSlider::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%; background: #3d5d85; cursor: pointer; border: none; margin-top: -5px; box-shadow: 0 1px 4px rgba(0,0,0,0.3); }
    #frameSlider::-moz-range-track { height: 6px; border-radius: 3px; background: #1a1a1a; }
    #frameSlider::-moz-range-thumb { width: 16px; height: 16px; border-radius: 50%; background: #3d5d85; cursor: pointer; border: none; box-shadow: 0 1px 4px rgba(0,0,0,0.3); }
    #frameLabel { color: #f4f7ff; font-size: 12px; min-width: 120px; text-align: center; }
    #speedControl { display: flex; align-items: center; gap: 6px; color: rgba(244,247,255,0.85); font-size: 12px; }
    #speedInput { width: 60px; height: 28px; padding: 0 8px; border-radius: 8px; border: none; background: rgba(255,255,255,0.06); color: #f4f7ff; font-size: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.25); }
    #loading { position: fixed; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #050810; color: #c8d4e4; z-index: 1000; transition: opacity 0.3s; }
    #loading.hidden { opacity: 0; pointer-events: none; }
    #loading-text { font-size: 14px; margin-top: 16px; }
    #loading-bar-container { width: 200px; height: 4px; background: #1a1a1a; border-radius: 2px; margin-top: 12px; overflow: hidden; }
    #loading-bar { height: 100%; background: linear-gradient(90deg, #3d5d85, #5a7fa8); width: 0%; transition: width 0.2s; }
    #loading-logo { position: absolute; bottom: 40px; left: 50%; transform: translateX(-50%); }
    #loading-logo .logo-text { font-size: 28px; color: #c8d4e4; }
  </style>
</head>
<body>
  <div id="app"></div>
  <div id="header">${headerLogoHtml}<div class="camera-mode-switch"><label class="camera-mode-switch__label"><input type="checkbox" id="appViewerCameraMode" class="camera-mode-switch__input" aria-label="Orbit/Fly"><span class="camera-mode-switch__icon-wrap"><span class="camera-mode-switch__icon camera-mode-switch__icon--orbit" aria-hidden="true"></span><span class="camera-mode-switch__icon camera-mode-switch__icon--fly" aria-hidden="true"></span></span></label></div></div>
  <div id="loading">
    <div id="loading-text">Loading...</div>
    <div id="loading-bar-container"><div id="loading-bar"></div></div>
    <div id="loading-logo"><span class="logo-text">SFACSTUDIO</span></div>
    </div>
  <div id="hudRow"><span id="memoryHud" class="memory-hud" aria-hidden="true">RAM — MB</span><span id="fpsCounter">0 FPS</span></div>
  <div id="controls">
    <button id="playBtn" type="button" aria-pressed="true">❚❚</button>
    <input type="range" id="frameSlider" min="0" max="100" value="0" step="1">
    <span id="frameLabel">Frame 0 / 0</span>
    <span id="speedControl">FPS: <input type="number" id="speedInput" value="30" min="1" max="60" step="1"></span>
    </div>
  <script id="META" type="application/json">${metaJson}</script>
  <script type="module">` + scriptBody + `</script>
</body>
</html>`;
}

}