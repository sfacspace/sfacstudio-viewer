/**
 * Serialize viewer to single HTML (frame-based: totalFrames, keyframes[].frame; objects span full timeline).
 * When PLY has baked world transform → JSON transform = null; otherwise keep baseTransform.
 *
 * @param {Object} options
 * @param {Object} options.fileLoader - FileLoader
 * @param {Object} options.timeline - TimelineController
 * @param {import('../core/viewer.js').PlayCanvasViewer} options.viewer
 * @param {Object} [options.selectionTool] - SelectionTool (for PLY with erased points removed)
 * @param {AbortSignal} [options.signal] - AbortSignal
 * @param {() => void} [options.onCancel] - Cancel callback
 */
import { getEmbeddedViewerScript } from './embeddedViewerScript.js';
import {
  loadBrandingExportOpts,
  streamTimelineObjectsJson,
  writeHtmlDocumentWithObjects,
  DEFAULT_SCENE_SETTINGS,
} from './exportHtmlShared.js';
import { t } from '../i18n.js';

const OBJECTS_PLACEHOLDER = '__OBJECTS_PLACEHOLDER__';

function generateHTML(viewerSettingsJson, opts = {}) {
  const metaJson = JSON.stringify(viewerSettingsJson);
  const playcanvasPath = opts.playcanvasPath || 'https://cdn.jsdelivr.net/npm/playcanvas@2.15.1/build/playcanvas.mjs';
  const comments = viewerSettingsJson.comments || [];
  const hasComments = comments.length > 0;
  const hasCameraMarkers = (viewerSettingsJson.keyframes || []).length > 0;
  const scriptBody = getEmbeddedViewerScript(playcanvasPath, { hasCameraMarkers, hasComments });
  const faviconTag = opts.iconBase64
    ? opts.iconType === 'svg'
      ? `<link rel="icon" type="image/svg+xml" href="data:image/svg+xml;base64,${opts.iconBase64}">`
      : `<link rel="icon" type="image/png" href="data:image/png;base64,${opts.iconBase64}">`
    : '';
  const headerLogoHtml = opts.logoBase64
    ? `<a class="header-brand-link" href="https://sfacspace.com/" target="_blank" rel="noopener noreferrer" aria-label="스팩스페이스 (새 창)"><img src="data:image/svg+xml;base64,${opts.logoBase64}" alt="SFACSTUDIO" class="header-logo-img" width="120" height="26" decoding="async" /></a>`
    : `<a class="header-brand-link" href="https://sfacspace.com/" target="_blank" rel="noopener noreferrer" aria-label="스팩스페이스 (새 창)"><span class="logo-text">SFACSTUDIO</span></a>`;
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
    #app { position: fixed; inset: 0; top: 44px; height: calc(100vh - 44px); }
    #pcCanvas { width: 100% !important; height: 100% !important; display: block; touch-action: none; }
    #header { position: fixed; top: 0; left: 0; right: 0; height: 44px; padding: 0 12px; background: rgba(10,15,24,0.96); display: flex; align-items: center; justify-content: flex-start; gap: 12px; z-index: 200; overflow: hidden; transition: opacity 0.25s ease; }
    #header .logo-text { font-size: 32px; color: #3d5d85; user-select: none; -webkit-user-select: none; white-space: nowrap; pointer-events: none; }
    .header-brand-link { display: inline-flex; align-items: center; line-height: 0; border-radius: 8px; text-decoration: none; color: inherit; transition: opacity 0.18s ease, filter 0.22s ease, transform 0.14s ease; }
    .header-brand-link:hover { opacity: 0.9; filter: brightness(1.15) drop-shadow(0 0 10px rgba(61, 93, 133, 0.4)); }
    .header-brand-link:active { transform: scale(0.97); opacity: 1; }
    .header-brand-link:focus-visible { outline: none; box-shadow: 0 0 0 2px rgba(61, 93, 133, 0.55); }
    .header-logo-img { height: 26px; width: auto; max-width: min(148px, 32vw); display: block; object-fit: contain; user-select: none; pointer-events: none; }
    .camera-mode-switch { display: flex; align-items: center; margin-left: auto; }
    .camera-mode-switch__label { position: relative; display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 28px; min-width: 36px; padding: 0; border-radius: 8px; border: none; background: transparent; color: #3d5d85; cursor: pointer; transition: color 140ms ease, transform 120ms ease, opacity 140ms ease, background 140ms ease; }
    .camera-mode-switch__label:hover { background: rgba(255,255,255,0.08); opacity: 0.95; }
    .camera-mode-switch__label:active { transform: translateY(1px); }
    .camera-mode-switch__input { position: absolute; opacity: 0; width: 0; height: 0; pointer-events: none; }
    .camera-mode-switch__icon-wrap { position: relative; width: 20px; height: 20px; display: block; }
    .camera-mode-switch__icon { position: absolute; inset: 0; display: block; background-color: currentColor; -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat; -webkit-mask-position: center; mask-position: center; -webkit-mask-size: contain; mask-size: contain; transition: opacity 0.28s ease, transform 0.28s ease; }
    .camera-mode-switch__icon--orbit { -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cellipse cx='12' cy='12' rx='10' ry='4'/%3E%3Cellipse cx='12' cy='12' rx='4' ry='10'/%3E%3C/svg%3E"); mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cellipse cx='12' cy='12' rx='10' ry='4'/%3E%3Cellipse cx='12' cy='12' rx='4' ry='10'/%3E%3C/svg%3E"); opacity: 1; transform: scale(1) rotate(0deg); }
    .camera-mode-switch__input:checked ~ .camera-mode-switch__icon-wrap .camera-mode-switch__icon--orbit { opacity: 0; transform: scale(0.6) rotate(-25deg); pointer-events: none; }
    .camera-mode-switch__icon--fly { -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M22 2L11 13'/%3E%3Cpath d='M22 2L15 22L11 13L2 9L22 2Z'/%3E%3C/svg%3E"); mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M22 2L11 13'/%3E%3Cpath d='M22 2L15 22L11 13L2 9L22 2Z'/%3E%3C/svg%3E"); opacity: 0; transform: scale(0.6) rotate(25deg); }
    .camera-mode-switch__input:checked ~ .camera-mode-switch__icon-wrap .camera-mode-switch__icon--fly { opacity: 1; transform: scale(1) rotate(0deg); }
    #hudRow { position: fixed; top: 52px; right: 20px; display: flex; align-items: center; gap: 10px; z-index: 100; transition: opacity 0.25s ease; }
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
    .comment-markers-overlay { position: fixed; top: 44px; left: 0; right: 0; bottom: 0; pointer-events: none; z-index: 100; }
    .comment-markers-overlay > * { pointer-events: auto; }
    .comment-marker { position: absolute; width: 40px; height: 40px; margin: 0; padding: 0; border: none; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; background: transparent; transition: transform 0.15s ease; }
    .comment-marker:hover { transform: scale(1.1); }
    .comment-marker--bubble { background: rgba(61,93,133,0.9); box-shadow: 0 4px 16px rgba(0,0,0,0.35), 0 0 0 2px rgba(255,255,255,0.2); }
    .comment-marker--bubble::after { content: ""; position: absolute; bottom: -6px; left: 50%; transform: translateX(-50%); border: 8px solid transparent; border-top-color: rgba(61,93,133,0.9); border-bottom: none; }
    .comment-marker__icon { width: 20px; height: 20px; background: #fff; -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='black'%3E%3Cpath d='M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z'/%3E%3C/svg%3E") center/contain no-repeat; mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='black'%3E%3Cpath d='M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z'/%3E%3C/svg%3E") center/contain no-repeat; }
    .comment-description-panel { position: fixed; left: 0; top: 0; width: 280px; max-width: min(320px, 85vw); max-height: 70vh; min-height: 80px; background: rgba(13,19,32,0.75); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); box-shadow: 0 8px 32px rgba(0,0,0,0.4); z-index: 100200; display: flex; flex-direction: column; border-radius: 12px; opacity: 0; visibility: hidden; transition: opacity 0.2s ease, visibility 0.2s ease; pointer-events: none; }
    .comment-description-panel::before { content: ""; position: absolute; left: -8px; top: 50%; transform: translateY(-50%); border: 8px solid transparent; border-right-color: rgba(13,19,32,0.75); border-left: none; }
    .comment-description-panel.is-visible { opacity: 1; visibility: visible; pointer-events: auto; }
    .comment-description-panel__header { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-bottom: 1px solid rgba(255,255,255,0.1); flex-shrink: 0; }
    .comment-description-panel__title { font-size: 15px; font-weight: 700; color: #f4f7ff; }
    .comment-description-panel__close { background: none; border: none; color: #c8d4e4; font-size: 22px; cursor: pointer; padding: 0 4px; line-height: 1; }
    .comment-description-panel__body { padding: 14px 16px; overflow: auto; color: rgba(244,247,255,0.9); font-size: 14px; }
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
  ${hasCameraMarkers ? `<div id="controls">
    <button id="playBtn" type="button" aria-pressed="true">❚❚</button>
    <input type="range" id="frameSlider" min="0" max="100" value="0" step="1">
    <span id="frameLabel">Frame 0 / 0</span>
    <span id="speedControl">FPS: <input type="number" id="speedInput" value="30" min="1" max="60" step="1"></span>
    </div>` : ''}
  ${hasComments ? `<div id="commentMarkersOverlay" class="comment-markers-overlay"></div><div id="commentDescriptionPanel" class="comment-description-panel" aria-hidden="true"><div class="comment-description-panel__header"><span class="comment-description-panel__title">설명</span><button type="button" class="comment-description-panel__close" aria-label="닫기">&times;</button></div><div class="comment-description-panel__body"></div></div>` : ''}
  <script id="META" type="application/json">${metaJson}</script>
  <script type="module">` + scriptBody + `</script>
</body>
</html>`;
}

export async function serializeViewer(options = {}) {
  const { fileLoader, timeline, viewer, selectionTool, signal, onCancel } = options;
  const selTool =
    selectionTool ?? (typeof window !== 'undefined' && window.__selectionTool ? window.__selectionTool : null);

  if (!fileLoader || !timeline || !viewer) {
    console.error('[serializeViewer] fileLoader, timeline, viewer required.');
    return;
  }

  const throwIfAborted = () => {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
  };

  throwIfAborted();

  const objects = timeline.objects || [];
  const loadedFiles = fileLoader.getLoadedFiles() || [];
  if (!objects.length) {
    if (loadedFiles.length === 0) {
      alert('보낼 파일이 없습니다. PLY 파일을 먼저 로드해주세요.');
    } else {
      alert('보낼 오브젝트가 없습니다.');
    }
    return;
  }
  throwIfAborted();

  const defaultName = objects[0]?.name?.replace(/\.[^/.]+$/, '') || 'scene';
  const fileName = `with_${defaultName}.html`;

  const maxSeconds =
    typeof timeline?.getMaxSeconds === 'function' ? timeline.getMaxSeconds() : timeline.maxSeconds || 30;
  const exportFps = Math.max(1, Math.min(60, parseInt(timeline?.fps) || 30));
  const exportTotalFrames = Math.max(
    1,
    Math.min(18000, parseInt(timeline?.totalFrames) || Math.round(maxSeconds * exportFps) || 1)
  );
  const streamTotalFrames = exportTotalFrames;
  const keyframesSorted = [...(timeline.keyframes || [])].sort((a, b) => (a.t ?? 0) - (b.t ?? 0));
  const initialCameraState =
    keyframesSorted.length > 0 ? keyframesSorted[0].state : (viewer?.getCameraState?.() ?? null);

  const buildHtmlShell = (exportOpts) =>
    generateHTML(
      {
        maxSeconds,
        fps: exportFps,
        totalFrames: exportTotalFrames,
        cameraSpeedProfileStart: timeline._playback?._speedProfileStart ?? 0,
        cameraSpeedProfileEnd: timeline._playback?._speedProfileEnd ?? 0,
        objects: OBJECTS_PLACEHOLDER,
        keyframes: (timeline.keyframes || []).map((kf) => ({
          id: kf.id,
          frame:
            typeof kf.frame === 'number'
              ? Math.max(0, Math.min(streamTotalFrames - 1, kf.frame))
              : Math.max(
                  0,
                  Math.min(
                    streamTotalFrames - 1,
                    Math.round((Number(kf.t) || 0) * (parseInt(exportFps) || 30))
                  )
                ),
          state: kf.state,
        })),
        initialCamera: initialCameraState,
        orbitTarget: viewer._orbitTarget ? { ...viewer._orbitTarget } : { x: 0, y: 0, z: 0 },
        orbitDistance: viewer._orbitDistance ?? 6.4,
        sceneSettings: DEFAULT_SCENE_SETTINGS,
        comments:
          typeof window !== 'undefined' && window.__objectDescription?.comments
            ? window.__objectDescription.comments
            : [],
      },
      exportOpts
    );

  const runStream = async (writable, exportOpts) => {
    const htmlBase = buildHtmlShell(exportOpts);
    await writeHtmlDocumentWithObjects(writable, htmlBase, OBJECTS_PLACEHOLDER, async () => {
      await streamTimelineObjectsJson(writable, {
        timeline,
        fileLoader,
        selectionTool: selTool,
        signal,
        streamTotalFrames,
      });
    });
  };

  const showOverlay = () => {
    window.__showGlobalLoadingOverlay?.(t('loading.exportingAppViewer'), 0, {
      useSpinner: true,
      showCancel: true,
      cancelLabel: t('loading.cancel'),
      onCancel: typeof onCancel === 'function' ? onCancel : undefined,
    });
  };

  if (window.showSaveFilePicker) {
    try {
      throwIfAborted();
      const fileHandle = await window.showSaveFilePicker({
        suggestedName: fileName,
        types: [{ description: 'HTML files', accept: { 'text/html': ['.html'] } }],
      });
      showOverlay();
      const exportOpts = await loadBrandingExportOpts(signal);
      throwIfAborted();
      const writable = await fileHandle.createWritable({ keepExistingData: false });
      await runStream(writable, exportOpts);
      await writable.close();
      return;
    } catch (err) {
      if (err?.name === 'AbortError') return;
      console.warn('[serializeViewer] save failed', err);
      return;
    }
  }

  showOverlay();
  const exportOpts = await loadBrandingExportOpts(signal);
  throwIfAborted();

  const chunks = [];
  const collector = {
    write(chunk) {
      chunks.push(typeof chunk === 'string' ? chunk : new Uint8Array(chunk));
    },
    close() {},
  };
  await runStream(collector, exportOpts);
  const blob = new Blob(chunks, { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
