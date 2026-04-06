import { createWireBox, createWireBoxMeshAndMaterial } from './tools/selectors/BoxSelector.js';
import { Entity, MeshInstance } from "playcanvas";
import { t, getLanguage, setLanguage } from './i18n.js';
// Core imports
import { PlayCanvasViewer } from "./core/viewer.js";
import { FileLoader } from "./core/fileLoader.js";
import { TimelineController } from "./timeline/index.js";
import { InspectorController } from "./ui/inspector.js";
import { GizmoController } from "./ui/gizmo.js";
import { FlyMode } from "./camera/flyMode.js";
import { exportSingleHTML } from "./export/index.js";
import { exportVideo } from "./export/exportVideo.js";
import { CameraTemplatesManager } from "./timeline/cameraTemplates.js";
import { ObjectDetailsPanel } from "./ui/objectDetailsPanel.js";
import { ObjectDescription } from "./ui/objectDescription.js";
import { SelectionTool } from "./tools/selectionTool.js";
import { CameraSettings } from "./ui/cameraSettings.js";
import { PerformanceSettings } from "./ui/performanceSettings.js";
import { createWireSphere, createWireSphereMeshAndMaterial } from "./tools/selectors/SphereSelector.js";
import { SelectorOverlay } from "./ui/selectorOverlay.js";
import { makePanelDraggable, getInspectorDragBounds } from "./ui/draggablePanel.js";
import {
  restoreAllSidePanelWidthsFromStorage,
  attachObjectsPanelResize,
} from "./ui/objectsPanelResize.js";
import {
  initPanelToggles,
  applyPanelChromeVisibility,
  togglePanels,
  setBothSidePanelsFromSettings,
  areBothSidePanelsVisible,
  isRightSidebarVisible,
} from "./ui/panelToggles.js";
import MemoryMonitor from './services/memoryMonitor.js';
import LoadSessionManager from './core/loadSessionManager.js';
import { importCache } from './services/importCache.js';
import { buildProjectData, saveProjectToFile, loadProjectFromFile } from './project/projectSaveLoad.js';
import { detachChildrenBeforeParentDelete } from './timeline/objectHierarchy.js';
import { runDuplicateObject } from './timeline/duplicateObject.js';
// 2D selector overlay
const selectorOverlay = new SelectorOverlay();
selectorOverlay.hide();
/** @type {boolean} */
window.__viewerReady = false;

/** @type {PlayCanvasViewer|null} */
let viewer = null;

// Global hooks for long-running tasks
window.__memoryMonitor = null;
window.__memoryTaskBegin = () => {};
window.__memoryTaskEnd = () => {};

/** @type {FileLoader|null} */
let fileLoader = null;

/** @type {TimelineController|null} */
let timeline = null;

/** @type {InspectorController|null} */
let inspector = null;

/** @type {GizmoController|null} */
let gizmo = null;

/** @type {import("./ui/objectDescription.js").ObjectDescription|null} */
let objectDescription = null;

/** 코멘트·컬러 중 하나만 열림(또는 모두 닫힘). 닫기는 버튼/X만. */
function closeAuxGizmoPopovers(except) {
  const tintPop = document.getElementById("gizmoColorTintPopover");
  const tintBtn = document.getElementById("gizmoColorTintBtn");
  if (except !== "tint" && tintPop) {
    tintPop.classList.remove("is-visible");
    tintBtn?.classList.add("is-off");
    tintBtn?.setAttribute("aria-pressed", "false");
  }
  if (except !== "description") {
    objectDescription?.hideTooltip?.();
  }
}

function getRightToolsStripPx() {
  const raw = getComputedStyle(document.documentElement).getPropertyValue("--right-tools-strip-width").trim();
  const n = parseInt(raw, 10);
  return Number.isFinite(n) ? n : 67;
}

function positionAuxFloatingPopover(popoverEl, anchorBtn) {
  if (!popoverEl || !anchorBtn) return;
  const gap = 16;
  const strip = getRightToolsStripPx();
  popoverEl.style.position = "fixed";
  popoverEl.style.right = `${strip + gap}px`;
  popoverEl.style.left = "auto";
  popoverEl.style.bottom = "auto";
  const br = anchorBtn.getBoundingClientRect();
  const pad = 8;
  const applyClamp = () => {
    const pr = popoverEl.getBoundingClientRect();
    let t = br.top;
    if (pr.bottom > window.innerHeight - pad) t = window.innerHeight - pad - pr.height;
    if (t < pad) t = pad;
    popoverEl.style.top = `${t}px`;
    popoverEl.style.transform = "none";
  };
  popoverEl.style.top = `${br.top}px`;
  popoverEl.style.transform = "none";
  requestAnimationFrame(applyClamp);
}

function repositionOpenAuxPopovers() {
  const descBtn = document.getElementById("gizmoDescriptionBtn");
  const descPop = document.getElementById("gizmoDescriptionTooltip");
  if (descPop?.classList.contains("is-visible") && descBtn) {
    positionAuxFloatingPopover(descPop, descBtn);
  }
  const tintBtn = document.getElementById("gizmoColorTintBtn");
  const tintPop = document.getElementById("gizmoColorTintPopover");
  if (tintPop?.classList.contains("is-visible") && tintBtn) {
    positionAuxFloatingPopover(tintPop, tintBtn);
  }
}

/** @type {PerformanceSettings|null} */
let performanceSettings = null;

// Shape gizmo (independent from timeline gizmo)
let _shapeGizmoLayer = null;
let _shapeTranslateGizmo = null;

function _ensureShapeTranslateGizmo() {
  if (!window.__viewerReady || !viewer || !viewer.app) return;
  const pc = window.pc;
  if (!pc || !pc.Gizmo) return;

  const camera = viewer.cameraEntity?.camera;
  if (!camera) return;

  if (!_shapeGizmoLayer) {
    _shapeGizmoLayer = pc.Gizmo.createLayer(viewer.app);
    const layers = camera.layers;
    if (!layers.includes(_shapeGizmoLayer.id)) {
      camera.layers = [...layers, _shapeGizmoLayer.id];
    }
  }

  if (!_shapeTranslateGizmo) {
    _shapeTranslateGizmo = new pc.TranslateGizmo(camera, _shapeGizmoLayer);
    _shapeTranslateGizmo.size = 1.0;
    _shapeTranslateGizmo.coordSpace = 'world';
  }
}

// Shared shape gizmo logic for import/attach flows
function _detachShapeGizmo() {
  if (_shapeTranslateGizmo) {
    _shapeTranslateGizmo.detach();
  }
}

function _attachShapeGizmo(entity) {
  _ensureShapeTranslateGizmo();
  if (!_shapeTranslateGizmo || !entity) return;
  _shapeTranslateGizmo.detach();
  _shapeTranslateGizmo.attach([entity]);
}

/**
 * FlyMode instance
 * @type {FlyMode|null}
 */
let flyMode = null;

/**
 * ObjectDetailsPanel instance
 * @type {ObjectDetailsPanel|null}
 */
let detailsPanel = null;
// Track spawned wireframe shape entities
let spawnedWireObject = null;
window.spawnedWireObject = null;

// Sphere/box shapes kept on mode switch (no destroy); PLY per-object state
const wireSphereObjectsByKey = new Map();
const wireBoxObjectsByKey = new Map();

function _getGsplatKeyFromSelectedObject(obj) {
  if (!obj) return '__no_selection__';
  if (obj.isSequence && obj.id != null) return obj.id;
  if (obj.isMultiFile && obj.id != null) return obj.id;
  const entity = obj?.entity || obj;
  if (!entity) return '__no_selection__';
  return entity.getGuid?.() || entity._guid || entity.name || String(entity);
}

function _setActiveWireObject(entity) {
  spawnedWireObject = entity;
  window.spawnedWireObject = spawnedWireObject;
}

/** @type {SelectionTool|null} */
let selectionTool = null;

/** @type {CameraSettings|null} */
let cameraSettings = null;

// Local file server (py/server.py) for path-based load; override via window.LOCAL_FILE_SERVER_URL
const LOCAL_FILE_SERVER_URL_DEFAULT = 'http://127.0.0.1:8765';
let _cachedLocalFileServerBaseUrl = null;

/**
 * Base URL for local file server. Uses window.LOCAL_FILE_SERVER_URL or probes 8765, 8766, … via /health.
 * @returns {Promise<string>}
 */
async function getLocalFileServerBaseUrl() {
  if (typeof window !== 'undefined' && window.LOCAL_FILE_SERVER_URL) {
    const base = window.LOCAL_FILE_SERVER_URL.replace(/\/$/, '');
    _cachedLocalFileServerBaseUrl = base;
    return base;
  }
  if (_cachedLocalFileServerBaseUrl) return _cachedLocalFileServerBaseUrl;
  const baseHost = 'http://127.0.0.1';
  for (let i = 0; i < 20; i++) {
    const port = 8765 + i;
    const url = `${baseHost}:${port}/health`;
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 2000);
      const res = await fetch(url, { signal: ctrl.signal });
      clearTimeout(t);
      if (res.ok) {
        _cachedLocalFileServerBaseUrl = `${baseHost}:${port}`;
        return _cachedLocalFileServerBaseUrl;
      }
    } catch (_) { /* try next port */ }
  }
  return LOCAL_FILE_SERVER_URL_DEFAULT;
}

// File menu inputs/actions
const loadPlyInputEl = document.getElementById("loadPlyInput");
const menuLoadPlyEl = document.querySelector('a[data-action="load-ply"]');
const menuSaveProjectEl = document.querySelector('a[data-action="save-project"]');
const menuSaveProjectAsEl = document.querySelector('a[data-action="save-project-as"]');
const menuLoadProjectEl = document.querySelector('a[data-action="load-project"]');
const menuExportViewerEl = document.querySelector('a[data-action="export-viewer"]');
const menuExportMp4El = document.querySelector('a[data-action="export-mp4"]');
const cameraModeSwitch = document.getElementById("cameraMode");
const gridToggleEl = document.getElementById("gridToggle");
const orbitCenterToggleEl = document.getElementById("orbitCenterToggle");
const fullscreenToggleEl = document.getElementById("fullscreenToggle");
const axisGizmoCanvas = document.getElementById("axisGizmo");
const gizmoTransformBtn = document.getElementById("gizmoTransform");
const fpsCounterEl = document.getElementById("fpsCounter");
const gizmoRotateBtn = document.getElementById("gizmoRotate");
const gizmoScaleBtn = document.getElementById("gizmoScale");
const cameraSettingsResetBtn = document.getElementById("cameraSettingsResetBtn");
const cameraInfoEl = document.getElementById("cameraInfo");
const cameraInfoTextEl = document.getElementById("cameraInfoText");
const settingsButton = document.getElementById("settingsButton");
const settingsModalOverlay = document.getElementById("settingsModalOverlay");
const settingsCloseBtn = document.getElementById("settingsCloseBtn");
const settingsModalCancelBtn = document.getElementById("settingsModalCancel");
// Legacy export button removed; use File menu item instead
const loadingOverlayEl = document.getElementById("loadingOverlay");
const loadingProgressEl = document.querySelector(".loading-progress");
const loadingProgressBarEl = document.getElementById("loadingProgressBar");
const loadingPercentEl = document.getElementById("loadingPercent");
const loadingFileProgressEl = document.querySelector(".loading-progress--file");
const loadingFileProgressBarEl = document.getElementById("loadingFileProgressBar");
const loadingFilePercentEl = document.getElementById("loadingFilePercent");
const loadingTotalTextEl = document.getElementById("loadingTotalText");
const loadingCancelBtnEl = document.getElementById("loadingCancelBtn");
const dropOverlayEl = document.getElementById("dropOverlay");
const memoryHudEl = document.getElementById('memoryHud');
// Expose loading UI globally for SelectionTool eraser etc.
window.__loadingOverlayEl = loadingOverlayEl;
window.__loadingProgressEl = loadingProgressEl;
window.__loadingProgressBarEl = loadingProgressBarEl;
window.__loadingPercentEl = loadingPercentEl;
window.__loadingFileProgressEl = loadingFileProgressEl;
window.__loadingFileProgressBarEl = loadingFileProgressBarEl;
window.__loadingFilePercentEl = loadingFilePercentEl;
window.__loadingTotalTextEl = loadingTotalTextEl;
window.__loadingCancelBtnEl = loadingCancelBtnEl;

window.__showGlobalLoadingOverlay = (text, percent = 100, options = {}) => {
  if (text == null || text === '') text = t('loading.default');
  const overlay = window.__loadingOverlayEl;
  const progress = window.__loadingProgressEl;
  const bar = window.__loadingProgressBarEl;
  const label = window.__loadingPercentEl;
  const totalText = window.__loadingTotalTextEl;
  const cancelBtn = window.__loadingCancelBtnEl;
  if (!overlay) return;
  overlay.classList.add('is-visible');
  overlay.classList.remove('is-dual');
  if (options.useSpinner) {
    overlay.classList.add('is-spinner');
    if (bar) bar.style.width = '0%';
    if (totalText) totalText.textContent = '';
  } else {
    overlay.classList.remove('is-spinner');
    const p = Math.max(0, Math.min(100, Number.isFinite(percent) ? percent : 0));
    if (bar) bar.style.width = `${p}%`;
    if (progress) {
      try {
        progress.setAttribute('aria-valuenow', String(Math.floor(p)));
      } catch (e) {
      }
    }
    if (totalText) totalText.textContent = `${Math.floor(p)}%`;
  }
  overlay.setAttribute('aria-hidden', 'false');
  if (label) label.textContent = text;
  if (cancelBtn) {
    if (typeof options.cancelLabel === 'string') cancelBtn.textContent = options.cancelLabel;
    if (typeof options.showCancel !== 'undefined') {
      cancelBtn.style.display = options.showCancel ? 'inline-flex' : 'none';
    } else {
      cancelBtn.style.display = 'none';
    }
    if (typeof options.onCancel !== 'undefined') {
      cancelBtn.disabled = typeof options.onCancel !== 'function';
      cancelBtn.onclick = typeof options.onCancel === 'function' ? options.onCancel : null;
    } else {
      cancelBtn.disabled = true;
      cancelBtn.onclick = null;
    }
  }
};

window.__showGlobalDualLoadingOverlay = (text, options = {}) => {
  if (text == null || text === '') text = t('loading.default');
  const overlay = window.__loadingOverlayEl;
  const label = window.__loadingPercentEl;
  const totalText = window.__loadingTotalTextEl;
  const totalProgress = window.__loadingProgressEl;
  const totalBar = window.__loadingProgressBarEl;
  const fileBar = window.__loadingFileProgressBarEl;
  const filePctEl = window.__loadingFilePercentEl;
  const fileProgress = window.__loadingFileProgressEl;
  const cancelBtn = window.__loadingCancelBtnEl;
  if (!overlay) return;

  overlay.classList.add('is-visible');
  overlay.classList.add('is-dual');
  overlay.setAttribute('aria-hidden', 'false');

  if (label) label.textContent = text;
  if (typeof options.totalPercent === 'number' && totalBar) {
    const p = Math.max(0, Math.min(100, Number.isFinite(options.totalPercent) ? Math.floor(options.totalPercent) : 0));
    totalBar.style.width = `${p}%`;
    if (totalProgress) {
      try {
        totalProgress.setAttribute('aria-valuenow', String(p));
      } catch (e) {
      }
    }
  }
  if (typeof options.filePercent === 'number') {
    const p = Math.max(0, Math.min(100, Number.isFinite(options.filePercent) ? Math.floor(options.filePercent) : 0));
    if (fileBar) fileBar.style.width = `${p}%`;
    if (fileProgress) fileProgress.setAttribute('aria-valuenow', String(p));
    if (filePctEl) filePctEl.textContent = `${p}%`;
  }
  if (typeof options.doneCount === 'number' && typeof options.totalCount === 'number' && totalText) {
    totalText.textContent = `${options.doneCount}/${options.totalCount}`;
  }
  if (cancelBtn) {
    // Preserve cancel button state across frequent progress updates.
    // Only change visibility/handler when explicitly provided.
    if (typeof options.showCancel !== 'undefined') {
      cancelBtn.style.display = options.showCancel ? 'inline-flex' : 'none';
    }
    if (typeof options.onCancel !== 'undefined') {
      cancelBtn.disabled = typeof options.onCancel !== 'function';
      cancelBtn.onclick = typeof options.onCancel === 'function' ? options.onCancel : null;
    }
  }
};

window.__updateGlobalDualLoadingOverlay = (options = {}) => {
  const overlay = window.__loadingOverlayEl;
  if (!overlay || !overlay.classList.contains('is-visible')) return;
  if (!overlay.classList.contains('is-dual')) return;
  window.__showGlobalDualLoadingOverlay(window.__loadingPercentEl?.textContent || t('loading.default'), options);
};

window.__hideGlobalLoadingOverlay = () => {
  const overlay = window.__loadingOverlayEl;
  const cancelBtn = window.__loadingCancelBtnEl;
  if (!overlay) return;
  overlay.classList.remove('is-visible');
  overlay.classList.remove('is-dual');
  overlay.classList.remove('is-spinner');
  overlay.setAttribute('aria-hidden', 'true');
  if (cancelBtn) {
    cancelBtn.style.display = 'none';
    cancelBtn.disabled = true;
    cancelBtn.onclick = null;
  }
};

const timelinePlayBtn = document.getElementById("timelinePlayToggle");
const timelineSpeedInput = document.getElementById("timelineSpeed");
const timelineTotalFramesInput = document.getElementById("timelineTotalFrames");
const timelineAddBtn = document.getElementById("timelineAddBtn");
const timelineDeleteBtn = document.getElementById("timelineDeleteBtn");
const timelineDeleteAllBtn = document.getElementById("timelineDeleteAllBtn");

// Delayed tooltip (data-tooltip): show after 1.5s hover with no pointer move

let _appTooltipEl = null;
let _tooltipTimer = null;
let _tooltipTarget = null;
let _tooltipLastMoveAt = 0;
let _tooltipLastX = 0;
let _tooltipLastY = 0;

function ensureAppTooltipEl() {
  if (_appTooltipEl) return _appTooltipEl;
  const el = document.createElement('div');
  el.className = 'app-tooltip';
  el.setAttribute('role', 'tooltip');
  document.body.appendChild(el);
  _appTooltipEl = el;
  return el;
}

function hideAppTooltip() {
  if (_tooltipTimer) {
    clearTimeout(_tooltipTimer);
    _tooltipTimer = null;
  }
  if (_appTooltipEl) {
    _appTooltipEl.classList.remove('is-visible');
  }
}

function resetTooltipState() {
  hideAppTooltip();
  _tooltipTarget = null;
}

function positionTooltipAt(x, y) {
  const el = ensureAppTooltipEl();
  const pad = 12;
  const rect = el.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let left = x + pad;
  let top = y + pad;
  if (left + rect.width > vw - 6) left = Math.max(6, vw - rect.width - 6);
  if (top + rect.height > vh - 6) top = Math.max(6, y - rect.height - pad);

  el.style.left = `${left}px`;
  el.style.top = `${top}px`;
}

function showTooltipForTarget(target, x, y) {
  const el = ensureAppTooltipEl();
  const raw = target?.getAttribute?.('data-tooltip');
  const text = (raw ?? '').replace(/\\n/g, '\n');
  if (!text) return;
  el.textContent = text;
  el.classList.add('is-visible');
  positionTooltipAt(x, y);
}

function scheduleTooltip(target, x, y) {
  if (!target) return;

  if (_tooltipTimer) {
    clearTimeout(_tooltipTimer);
    _tooltipTimer = null;
  }

  _tooltipTimer = setTimeout(() => {
    // If pointer moved during 0.5s wait, do not show tooltip
    const now = performance.now();
    if (now - _tooltipLastMoveAt < 500 - 1) return;
    if (_tooltipTarget !== target) return;
    showTooltipForTarget(target, _tooltipLastX, _tooltipLastY);
  }, 500);
}

document.addEventListener('pointerover', (e) => {
  const target = e.target?.closest?.('[data-tooltip]');
  if (!target) return;
  // IndexedDB "auto clear" uses CSS-only tooltip (0.5s delay)
  if (target.classList.contains('indexeddb-modal__switch-row')) return;

  _tooltipTarget = target;
  _tooltipLastMoveAt = performance.now();
  _tooltipLastX = e.clientX;
  _tooltipLastY = e.clientY;
  hideAppTooltip();
  scheduleTooltip(target, e.clientX, e.clientY);
});

document.addEventListener('pointermove', (e) => {
  if (!_tooltipTarget) return;

  const target = e.target?.closest?.('[data-tooltip]');
  if (target !== _tooltipTarget) {
    resetTooltipState();
    _tooltipTarget = target;
    if (target) {
      _tooltipLastMoveAt = performance.now();
      _tooltipLastX = e.clientX;
      _tooltipLastY = e.clientY;
      scheduleTooltip(target, e.clientX, e.clientY);
    }
    return;
  }

  // On same target: reset timer; if visible, update position only
  _tooltipLastMoveAt = performance.now();
  _tooltipLastX = e.clientX;
  _tooltipLastY = e.clientY;

  if (_appTooltipEl?.classList.contains('is-visible')) {
    positionTooltipAt(e.clientX, e.clientY);
  } else {
    scheduleTooltip(_tooltipTarget, e.clientX, e.clientY);
  }
});

document.addEventListener('pointerout', (e) => {
  const leaving = e.target?.closest?.('[data-tooltip]');
  if (!leaving) return;
  if (_tooltipTarget === leaving) {
    resetTooltipState();
  }
});

// Grid toggle

let isGridEnabled = true;

/**
 * Set grid visibility
 * @param {boolean} enabled
 */
function setGridEnabled(enabled) {
  isGridEnabled = enabled;
  
  // viewer.setGridVisible()
  if (viewer && window.__viewerReady) {
    viewer.setGridVisible(enabled);
  }
  
  if (gridToggleEl) {
    gridToggleEl.classList.toggle("is-off", !enabled);
    gridToggleEl.setAttribute("aria-pressed", enabled ? "true" : "false");
  }

  // Sync settings modal switch
  syncSettingsModalSwitches();
}

if (gridToggleEl) {
  gridToggleEl.addEventListener("click", () => {
    setGridEnabled(!isGridEnabled);
  });
}

// File menu: Export mp4 — start export only after save location chosen; streaming + cancel
if (menuExportMp4El) {
  menuExportMp4El.addEventListener('click', async (e) => {
    e.preventDefault();
    if (menuExportMp4El.getAttribute('aria-disabled') === 'true') {
      return;
    }
    if (!window.__viewerReady) return;
    if (!timeline || !viewer) return;

    // Do not start export until save location is chosen (same as PLY)
    let exportFileHandle = null;
    if (typeof window !== 'undefined' && typeof window.showSaveFilePicker === 'function') {
      try {
        exportFileHandle = await window.showSaveFilePicker({
          suggestedName: 'withVision_export.mp4',
          types: [
            { description: 'MP4 Video', accept: { 'video/mp4': ['.mp4'] } },
          ],
        });
      } catch (pickerErr) {
        if (pickerErr?.name === 'AbortError') return;
        exportFileHandle = null;
      }
    }
    if (!exportFileHandle) {
      alert('저장할 위치를 선택해 주세요. (Chrome 등에서 파일 저장이 지원됩니다.)');
      return;
    }

    const prev = {
      gridVisible: viewer?.isGridVisible?.() ?? true,
      orbitMarkerVisible: viewer?.isOrbitTargetMarkerVisible?.() ?? true,
      axisGizmoVisible: viewer?.isAxisGizmoVisible?.() ?? true,
      frustumsVisible: timeline?._keyframes?.frustumsVisible ?? true,
      activeGizmoMode: activeGizmoMode,
    };

    const abortController = new AbortController();
    let cancelRequested = false;
    const onCancel = () => {
      cancelRequested = true;
      try { abortController.abort(); } catch (_) {}
    };

    try {
      // Export clean mode: hide all render elements except PLY
      viewer?.setGridVisible?.(false);
      viewer?.setOrbitTargetMarkerVisible?.(false);
      timeline?._keyframes?.setFrustumsVisible?.(false);

      activeGizmoMode = null;
      gizmo?.setMode?.(null);
      viewer?.setAxisGizmoVisible?.(false);
      selectorOverlay?.hide?.();

      window.__showGlobalLoadingOverlay?.(t('loading.exportingVideo'), 0, {
        showCancel: true,
        onCancel,
      });
      await exportVideo({
        viewer,
        timeline,
        fileHandle: exportFileHandle,
        signal: abortController.signal,
        onProgress: (pct, text) => {
          window.__showGlobalLoadingOverlay?.(text ?? t('loading.exportingVideo'), pct, {
            showCancel: true,
            onCancel,
          });
        },
      });
    } catch (err) {
      if (cancelRequested || err?.name === 'AbortError') return;
      alert('영상 내보내기 중 오류가 발생했습니다: ' + (err?.message || err));
    } finally {
      viewer?.setGridVisible?.(!!prev.gridVisible);
      viewer?.setOrbitTargetMarkerVisible?.(!!prev.orbitMarkerVisible);
      viewer?.setAxisGizmoVisible?.(!!prev.axisGizmoVisible);
      timeline?._keyframes?.setFrustumsVisible?.(!!prev.frustumsVisible);

      activeGizmoMode = prev.activeGizmoMode;
      if (activeGizmoMode && timeline?.selectedObjectId) {
        const obj = timeline.objects?.find(o => o.id === timeline.selectedObjectId);
        if (obj) {
          gizmo?.setTarget?.(obj);
          gizmo?.setMode?.(activeGizmoMode);
        }
      }

      window.__hideGlobalLoadingOverlay?.();
    }
  });
}

// Orbit center toggle

let orbitMarkerEnabled = false;  // default OFF

function toggleOrbitMarker() {
  orbitMarkerEnabled = !orbitMarkerEnabled;
  if (viewer && window.__viewerReady) {
    viewer.toggleOrbitTargetMarker?.();
  }
  if (orbitCenterToggleEl) {
    orbitCenterToggleEl.classList.toggle("is-off", !orbitMarkerEnabled);
    orbitCenterToggleEl.setAttribute("aria-pressed", orbitMarkerEnabled ? "true" : "false");
  }

  // Sync settings modal switch
  syncSettingsModalSwitches();
}

if (orbitCenterToggleEl) {
  orbitCenterToggleEl.addEventListener("click", toggleOrbitMarker);
}

/**
 * Set orbit center marker and sync top bar toggle (e.g. from template dropdown)
 * @param {boolean} visible
 */
function setOrbitMarkerVisibleWithUI(visible) {
  if (viewer && window.__viewerReady) {
    viewer.setOrbitTargetMarkerVisible?.(visible);
  }
  orbitMarkerEnabled = !!visible;
  if (orbitCenterToggleEl) {
    orbitCenterToggleEl.classList.toggle("is-off", !orbitMarkerEnabled);
    orbitCenterToggleEl.setAttribute("aria-pressed", orbitMarkerEnabled ? "true" : "false");
  }
  syncSettingsModalSwitches();
}
window.__setOrbitMarkerVisibleWithUI = setOrbitMarkerVisibleWithUI;

// Fullscreen toggle

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().then(() => {
      if (fullscreenToggleEl) {
        fullscreenToggleEl.classList.remove("is-off");
        fullscreenToggleEl.setAttribute("aria-pressed", "true");
      }

      // Sync settings modal switch
      syncSettingsModalSwitches();
    }).catch(() => {
      // Fullscreen request failed
    });
  } else {
    document.exitFullscreen().then(() => {
      if (fullscreenToggleEl) {
        fullscreenToggleEl.classList.add("is-off");
        fullscreenToggleEl.setAttribute("aria-pressed", "false");
      }

      // Sync settings modal switch
      syncSettingsModalSwitches();
    });
  }
}

// Sync settings when OS/browser changes fullscreen
document.addEventListener('fullscreenchange', () => {
  syncSettingsModalSwitches();
});

if (fullscreenToggleEl) {
  fullscreenToggleEl.addEventListener("click", toggleFullscreen);
}

// i18n apply translations

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    const attr = el.getAttribute('data-i18n-attr');
    const val = t(key);
    if (attr) {
      attr.split(',').forEach((a) => el.setAttribute(a.trim(), val));
    } else {
      el.textContent = val;
    }
    const attrLabelKey = el.getAttribute('data-i18n-attr-label');
    if (attrLabelKey) el.setAttribute('aria-label', t(attrLabelKey));
    const titleKey = el.getAttribute('data-i18n-title');
    if (titleKey) el.setAttribute('title', t(titleKey));
  });
  document.querySelectorAll('[data-i18n-tooltip]').forEach((el) => {
    const key = el.getAttribute('data-i18n-tooltip');
    if (key) el.setAttribute('data-tooltip', t(key));
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (key) el.setAttribute('placeholder', t(key));
  });
  document.querySelectorAll('[data-i18n-attr-label]:not([data-i18n])').forEach((el) => {
    const key = el.getAttribute('data-i18n-attr-label');
    if (key) el.setAttribute('aria-label', t(key));
  });
  document.querySelectorAll('[data-i18n-aria-label]').forEach((el) => {
    const key = el.getAttribute('data-i18n-aria-label');
    if (key) el.setAttribute('aria-label', t(key));
  });
  // If play button is playing, re-apply label in current language
  if (timelinePlayBtn && window.__timeline?.isPlaying) {
    updatePlayButton(true);
  }
}

// Settings modal open/close and switch sync

function openSettingsModal() {
  if (!settingsModalOverlay) return;
  settingsModalOverlay.classList.add("is-visible");
  settingsModalOverlay.setAttribute("aria-hidden", "false");

  const langSelect = document.getElementById("settingsLanguageSelect");
  if (langSelect) langSelect.value = getLanguage();

  applyTranslations();
  syncSettingsModalSwitches();
}

function closeSettingsModal() {
  if (!settingsModalOverlay) return;
  settingsModalOverlay.classList.remove("is-visible");
  settingsModalOverlay.setAttribute("aria-hidden", "true");
}

if (settingsButton) {
  settingsButton.addEventListener("click", openSettingsModal);
}

if (settingsCloseBtn) {
  settingsCloseBtn.addEventListener("click", closeSettingsModal);
}

// Close on overlay click (excluding content)
if (settingsModalOverlay) {
  settingsModalOverlay.addEventListener("click", (event) => {
    if (event.target === settingsModalOverlay) {
      closeSettingsModal();
    }
  });
}

if (settingsModalCancelBtn) {
  settingsModalCancelBtn.addEventListener("click", closeSettingsModal);
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && settingsModalOverlay?.classList.contains("is-visible")) {
    closeSettingsModal();
  }
});

// Settings modal switch events: sync with top bar buttons + language select
document.addEventListener("DOMContentLoaded", () => {
  applyTranslations();

  const langSelect = document.getElementById("settingsLanguageSelect");
  if (langSelect) {
    langSelect.value = getLanguage();
    langSelect.addEventListener("change", () => {
      setLanguage(langSelect.value);
      applyTranslations();
    });
  }

  window.addEventListener("languagechange", () => applyTranslations());

  const orbitSwitch = document.getElementById("settingsOrbitCenterSwitch");
  const gridSwitch = document.getElementById("settingsGridSwitch");
  const fullscreenSwitch = document.getElementById("settingsFullscreenSwitch");
  const panelsSwitch = document.getElementById("settingsPanelsSwitch");

  // Initial sync
  syncSettingsModalSwitches();

  if (orbitSwitch && orbitCenterToggleEl) {
    orbitSwitch.addEventListener("change", () => {
      if (orbitCenterToggleEl) orbitCenterToggleEl.click();
    });
  }
  if (gridSwitch && gridToggleEl) {
    gridSwitch.addEventListener("change", () => {
      if (gridToggleEl) gridToggleEl.click();
    });
  }
  if (fullscreenSwitch && fullscreenToggleEl) {
    fullscreenSwitch.addEventListener("change", () => {
      if (fullscreenToggleEl) fullscreenToggleEl.click();
    });
  }

  if (panelsSwitch) {
    panelsSwitch.addEventListener("change", () => {
      setBothSidePanelsFromSettings(panelsSwitch.checked);
    });
  }
});

function syncSettingsModalSwitches() {
  const orbitSwitch = document.getElementById("settingsOrbitCenterSwitch");
  const gridSwitch = document.getElementById("settingsGridSwitch");
  const fullscreenSwitch = document.getElementById("settingsFullscreenSwitch");
  const panelsSwitch = document.getElementById("settingsPanelsSwitch");

  if (orbitSwitch && orbitCenterToggleEl) {
    orbitSwitch.checked = !orbitCenterToggleEl.classList.contains("is-off");
  }
  if (gridSwitch && gridToggleEl) {
    gridSwitch.checked = !gridToggleEl.classList.contains("is-off");
  }
  if (fullscreenSwitch) {
    fullscreenSwitch.checked = !!document.fullscreenElement;
  }
  if (panelsSwitch) {
    panelsSwitch.checked = areBothSidePanelsVisible();
  }
}

// Gizmo control buttons

let activeGizmoMode = null;

initPanelToggles({
  getViewer: () => viewer,
  isViewerReady: () => !!window.__viewerReady,
  getGizmo: () => gizmo,
  getInspector: () => inspector,
  getDetailsPanel: () => detailsPanel,
  getTimeline: () => timeline,
  getActiveGizmoMode: () => activeGizmoMode,
  selectorOverlay,
  closeAuxGizmoPopovers,
  syncSettingsModalSwitches,
});

function setGizmoMode(mode) {
  if (!window.__viewerReady) return;
  
  // Deactivate all button styles
  [gizmoTransformBtn, gizmoRotateBtn, gizmoScaleBtn].forEach(btn => {
    if (btn) {
      btn.classList.add("is-off");
      btn.setAttribute("aria-pressed", "false");
    }
  });
  
  // Same mode click toggles off
  if (activeGizmoMode === mode) {
    activeGizmoMode = null;
    gizmo?.setMode(null);
    return;
  }
  
  activeGizmoMode = mode;
  
  // Show 3D gizmo only when object selected
  const hasSelection = timeline?.selectedObjectId != null;
  if (hasSelection) {
    gizmo?.setMode(mode);
  }
  // No object: only update button state (no 3D gizmo)
  
  // Active button style
  const targetBtn = mode === 'transform' ? gizmoTransformBtn
                  : mode === 'rotate' ? gizmoRotateBtn
                  : mode === 'scale' ? gizmoScaleBtn
                  : null;
  if (targetBtn) {
    targetBtn.classList.remove("is-off");
    targetBtn.setAttribute("aria-pressed", "true");
  }
}

if (gizmoTransformBtn) gizmoTransformBtn.addEventListener("click", () => setGizmoMode('transform'));
if (gizmoRotateBtn) gizmoRotateBtn.addEventListener("click", () => setGizmoMode('rotate'));
if (gizmoScaleBtn) gizmoScaleBtn.addEventListener("click", () => setGizmoMode('scale'));

// Camera mode switch (Orbit / Fly)

let isFlyMode = false;

/**
 * Toggle camera mode
 * @param {boolean} enableFlyMode - true: Fly, false: Orbit
 */
function switchCameraMode(enableFlyMode) {
  isFlyMode = enableFlyMode;

  if (!window.__viewerReady || !viewer) {
    updateExportButtonState();
    return;
  }

  if (enableFlyMode) {
    // Enable Fly mode
    if (flyMode) {
      flyMode.enable();
    }
  } else {
    // Enable Orbit mode
    if (flyMode) {
      flyMode.disable();
    }
  }
  updateExportButtonState();
}

if (cameraModeSwitch) {
  cameraModeSwitch.addEventListener("change", (e) => {
    switchCameraMode(e.target.checked);
  });
}

// Expose global functions
window.setCameraMode = (enableFlyMode) => {
  if (cameraModeSwitch) cameraModeSwitch.checked = !!enableFlyMode;
  switchCameraMode(!!enableFlyMode);
};

window.setCameraModeLocked = (locked) => {
  if (!cameraModeSwitch) return;
  const wrapper = cameraModeSwitch.closest(".camera-mode-switch");
  cameraModeSwitch.disabled = !!locked;
  if (wrapper) {
    wrapper.classList.toggle("is-locked", !!locked);
  }
};

// Camera state API

/**
 * Get current camera state
 * @returns {{position:{x,y,z}, rotation:{x,y,z,w}, target:{x,y,z}, distance:number, yaw:number, pitch:number}|null}
 */
function getCameraPose() {
  if (!viewer) return null;
  return viewer.getCameraState();
}

/**
 * Apply camera state
 * @param {{position?:{x,y,z}, rotation?:{x,y,z,w}, target?:{x,y,z}, distance?:number, yaw?:number, pitch?:number}} pose
 */
function applyCameraPose(pose) {
  if (!viewer || !pose) return;
  viewer.setCameraState(pose);
}

/**
 * Reset camera
 */
function resetCamera() {
  if (!viewer) return;
  viewer.resetCamera();
}

// Expose global functions
window.getCameraPose = getCameraPose;
window.applyCameraPose = applyCameraPose;
window.resetCamera = resetCamera;

// Timeline init and event wiring

let currentPinSeconds = 0;
let timelineTotalFrames = 90;

let orbitTargetMarkerVisibleBeforePlay = null;

/**
 * Hierarchy 제목 옆 + 메뉴: 빈 오브젝트 추가 등
 */
function setupHierarchyAddMenu() {
  const btn = document.getElementById("hierarchyAddMenuBtn");
  const menu = document.getElementById("hierarchyAddMenu");
  if (!btn || !menu || !viewer || !timeline) return;

  const closeMenu = () => {
    menu.hidden = true;
    btn.setAttribute("aria-expanded", "false");
  };

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = menu.hidden === false;
    if (open) closeMenu();
    else {
      menu.hidden = false;
      btn.setAttribute("aria-expanded", "true");
    }
  });

  menu.addEventListener("click", (e) => {
    const item = e.target.closest('[data-action="empty-object"]');
    if (!item) return;
    closeMenu();
    if (!window.__viewerReady) return;
    const ent = viewer.createEmptyObjectEntity?.();
    if (!ent) return;
    const name = t("panel.emptyObjectDefaultName");
    const added = timeline.addObject(name, ent, null, { objectType: "empty" });
    if (added && timeline.selectObject) timeline.selectObject(added.id);
  });

  document.addEventListener("click", (e) => {
    if (menu.hidden) return;
    if (!btn.contains(e.target) && !menu.contains(e.target)) closeMenu();
  });
}

/**
 * Initialize timeline
 */
function initTimeline() {
  if (!viewer) return;
  
  timeline = new TimelineController(viewer);
  timeline.totalFrames = timelineTotalFrames;
  timeline.init();

  timeline.onTotalFramesChange = (frames) => {
    try {
      timelineTotalFrames = Math.max(1, Math.min(18000, parseInt(frames) || 1));
      if (timelineTotalFramesInput) {
        timelineTotalFramesInput.value = String(timelineTotalFrames);
      }
    } catch (e) {
    }
  };

  // Keep export button state in sync even when objects are added outside handleFiles (e.g. Import modal)
  timeline.onObjectsChange = () => {
    try {
      updateExportButtonState();
    } catch (e) {
    }
  };

  // Export Video button: refresh enabled state on keyframe add/delete
  timeline.onKeyframesChange = () => {
    try {
      updateExportButtonState();
    } catch (e) {
    }
  };

  // Time update callback
  timeline.onTimeUpdate = (t) => {
    currentPinSeconds = t;
  };

  // Play state callback (lockCamera: true only when 2+ markers)
  timeline.onPlayStateChange = (playing, lockCamera) => {
    updatePlayButton(playing);
    window.setCameraModeLocked?.(playing && lockCamera !== false);
    updateExportButtonState();

    if (viewer) {
      if (playing) {
        orbitTargetMarkerVisibleBeforePlay = viewer.isOrbitTargetMarkerVisible?.() ?? null;
        viewer.setOrbitTargetMarkerVisible?.(false);
      } else {
        if (orbitTargetMarkerVisibleBeforePlay != null) {
          viewer.setOrbitTargetMarkerVisible?.(orbitTargetMarkerVisibleBeforePlay);
        }
        orbitTargetMarkerVisibleBeforePlay = null;
      }
    }
  };
  
  // Object selection callback → Inspector + Gizmo + Details Panel
  timeline.onObjectSelect = (obj) => {
    if (obj) {
      // Set selected object on viewer
      if (viewer) {
        viewer.setSelectedObject(obj);
      }

      // Refresh Undo/Redo buttons when selection changes
      detailsPanel?.updateUndoRedoButtons?.();
      detailsPanel?.updateEraserComplementDisabledState?.();

      detailsPanel?.setMultiFileMode?.(!!obj.isMultiFile);
      
      inspector?.show(obj);
      
      // On selection: set target, show gizmo if mode active
      gizmo?.setTarget(obj);
      // Show 3D gizmo if gizmo mode active
      if (activeGizmoMode) {
        gizmo?.setMode(activeGizmoMode);
      }
      
      if (detailsPanel) {
        if (isRightSidebarVisible()) detailsPanel.show();
        else detailsPanel.hide();
      }

      // Shape mode: swap to wire shape for selected object
      const activeBtn = detailsPanel?.getActiveButton?.();
      if (activeBtn === 3) {
        detailsPanel?.onButtonClick?.(activeBtn);
      }

      objectDescription?.updateFromSelection();
      viewer?.refreshEditorObjectTint?.();
      // 팝오버가 열려 있으면 업데이트
      if (typeof window.__updateGizmoTintPopover === 'function') {
        window.__updateGizmoTintPopover();
      }
    } else {
      // Deselect on viewer
      if (viewer) {
        viewer.setSelectedObject(null);
      }

      detailsPanel?.updateUndoRedoButtons?.();
      detailsPanel?.updateEraserComplementDisabledState?.();
      detailsPanel?.setMultiFileMode?.(false);
      
      inspector?.hide();

      // On deselect: hide 3D gizmo only, keep mode
      gizmo?.setTarget(null);
      // Hide 3D gizmo but keep button state (activeGizmoMode)
      
      // Hide object details panel
      if (detailsPanel) {
        detailsPanel.hide();
      }

      objectDescription?.updateFromSelection();
      viewer?.refreshEditorObjectTint?.();
      // 팝오버가 열려 있으면 업데이트
      if (typeof window.__updateGizmoTintPopover === 'function') {
        window.__updateGizmoTintPopover();
      }
    }
  };
  
  // Delete request callback → show delete confirm modal
  timeline.onDeleteRequest = (objectIds, objectNames) => {
    showDeleteModal(objectIds, objectNames);
  };

  timeline.onDuplicateRequest = async (objectIds) => {
    const ids = Array.isArray(objectIds)
      ? objectIds
      : objectIds != null
        ? [objectIds]
        : [];
    if (ids.length === 0) return;
    const sel = window.__selectionTool ?? selectionTool;
    const newIds = [];
    for (const objectId of ids) {
      const obj = timeline.objects.find((o) => o.id === objectId);
      if (!obj) continue;
      const added = await runDuplicateObject(obj, { viewer, timeline, selectionTool: sel });
      if (added?.id) newIds.push(added.id);
    }
    if (newIds.length === 1 && timeline.selectObject) {
      timeline.selectObject(newIds[0]);
    } else if (newIds.length > 1) {
      timeline.selectObjectIds?.(newIds, newIds[newIds.length - 1]);
    }
  };

  // Init camera template manager (frame-based playback)
  const cameraTemplates = new CameraTemplatesManager({
    viewer,
    getTotalFrames: () => Math.max(1, parseInt(timeline.totalFrames, 10) || 90),
    getFps: () => Math.max(1, Math.min(60, parseInt(timeline.fps, 10) || 30)),
    getMaxSeconds: () => timeline.getMaxSeconds?.() ?? (timeline.maxSeconds ?? 0),
    getKeyframes: () => timeline.getKeyframes(),
    addKeyframe: (t, state) => timeline.addKeyframe(t, state),
    clearKeyframes: () => timeline.clearKeyframes(),
    showConfirmModal,
    setCameraMoveSpeedProfile: (startValue, endValue) => timeline.setCameraMoveSpeedProfile(startValue, endValue),
  });
  cameraTemplates.init();
  cameraTemplates.updateTemplateButtonState();
  // Apply initial speed profile to PlaybackController
  timeline.setCameraMoveSpeedProfile(cameraTemplates._speedStart, cameraTemplates._speedEnd);
  window.__cameraTemplates = cameraTemplates;
  
  setupHierarchyAddMenu();

  window.__timeline = timeline;
  window.timeline = timeline;
}

/**
 * Update play button UI (icon via CSS aria-pressed)
 */
function updatePlayButton(playing) {
  if (!timelinePlayBtn) return;
  timelinePlayBtn.setAttribute("aria-pressed", playing ? "true" : "false");
  const label = playing ? t("timeline.stop") : t("timeline.play");
  timelinePlayBtn.setAttribute("aria-label", label);
  timelinePlayBtn.setAttribute("title", label);
}

// Timeline UI event wiring
if (timelinePlayBtn) {
  timelinePlayBtn.addEventListener("click", () => {
    timeline?.togglePlay();
  });
}

if (timelineSpeedInput) {
  timelineSpeedInput.addEventListener("change", () => {
    const fps = parseInt(timelineSpeedInput.value) || 30;
    timeline?.setSpeed(fps);
  });
}

if (timelineTotalFramesInput) {
  // Select all on click (focus)
  timelineTotalFramesInput.addEventListener("focus", () => {
    timelineTotalFramesInput.select();
  });

  // Numbers only; cap at 18000; apply on change
  timelineTotalFramesInput.addEventListener("input", () => {
    const raw = timelineTotalFramesInput.value.replace(/\D/g, "");
    if (raw === "") {
      timelineTotalFramesInput.value = "";
      return;
    }
    const n = parseInt(raw, 10);
    if (n > 18000) timelineTotalFramesInput.value = "18000";
    else timelineTotalFramesInput.value = raw;
  });

  timelineTotalFramesInput.addEventListener("change", () => {
    const frames = parseInt(timelineTotalFramesInput.value, 10) || 90;
    timeline?.setTotalFrames?.(Math.max(1, Math.min(18000, frames)));
    if (timeline) {
      const actual = Math.max(1, Math.min(18000, parseInt(timeline.totalFrames, 10) || 90));
      timelineTotalFrames = actual;
      timelineTotalFramesInput.value = String(actual);
    }
  });

  // Drag up/down to adjust total frames (inspector numeric style)
  timelineTotalFramesInput.classList.add("timeline-controls__input--drag-number");
  const DRAG_SENSITIVITY = 2;
  const DRAG_DEADZONE_PX = 3;
  timelineTotalFramesInput.addEventListener("mousedown", (e) => {
    if (e.button !== 0 || !timeline) return;
    const startY = e.clientY;
    const startValue = Math.max(1, Math.min(18000, parseInt(timeline.totalFrames, 10) || parseInt(timelineTotalFramesInput.value, 10) || 90));
    let dragging = false;
    let accumulatedMovementY = 0;

    const onMove = (eMove) => {
      if (!dragging) {
        if (Math.abs(eMove.clientY - startY) < DRAG_DEADZONE_PX) return;
        dragging = true;
        timelineTotalFramesInput.classList.add("is-dragging");
        timelineTotalFramesInput.requestPointerLock?.();
      }
      eMove.preventDefault();
      const deltaFrames = document.pointerLockElement === timelineTotalFramesInput
        ? (accumulatedMovementY += eMove.movementY, Math.round(-accumulatedMovementY / DRAG_SENSITIVITY))
        : Math.round((startY - eMove.clientY) / DRAG_SENSITIVITY);
      const next = Math.max(1, Math.min(18000, startValue + deltaFrames));
      timeline.setTotalFrames(next);
      const actual = Math.max(1, Math.min(18000, parseInt(timeline.totalFrames, 10) || 90));
      timelineTotalFrames = actual;
      timelineTotalFramesInput.value = String(actual);
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.exitPointerLock?.();
      timelineTotalFramesInput.classList.remove("is-dragging");
    };

    document.addEventListener("mousemove", onMove, { passive: false });
    document.addEventListener("mouseup", onUp);
  });
}

if (timelineAddBtn) {
  timelineAddBtn.addEventListener("click", () => {
    if (!timeline || !viewer) return;
    timeline.addKeyframe(currentPinSeconds);
  });
}

if (timelineDeleteBtn) {
  timelineDeleteBtn.addEventListener("click", () => {
    if (!timeline) return;
    timeline.removeKeyframeAt(currentPinSeconds);
  });
}

if (timelineDeleteAllBtn) {
  timelineDeleteAllBtn.addEventListener("click", () => {
    if (!timeline) return;
    if (timeline.getKeyframes().length > 0) {
      showKeyframeDeleteAllModal();
    }
  });
}

function clearAllSpatialSelectors() {
  selectionTool?.deactivate?.();
  selectionTool?.clearAllAccumulatedVolumes?.();
  if (spawnedWireObject) {
    spawnedWireObject.enabled = false;
    spawnedWireObject = null;
    window.spawnedWireObject = null;
    _detachShapeGizmo();
  }
  wireSphereObjectsByKey.forEach((s) => { if (s && s.enabled !== false) s.enabled = false; });
  wireBoxObjectsByKey.forEach((b) => { if (b && b.enabled !== false) b.enabled = false; });
}

// File drag and drop

let dragDepth = 0;

const hasFiles = (e) => {
  const types = e.dataTransfer?.types;
  if (!types) return false;
  return Array.from(types).includes("Files");
};

const showDropOverlay = () => {
  if (!dropOverlayEl) return;
  dropOverlayEl.classList.add("is-visible");
  dropOverlayEl.setAttribute("aria-hidden", "false");
};

const hideDropOverlay = () => {
  if (!dropOverlayEl) return;
  dropOverlayEl.classList.remove("is-visible");
  dropOverlayEl.setAttribute("aria-hidden", "true");
};

window.addEventListener("dragenter", (e) => {
  if (!hasFiles(e)) return;
  e.preventDefault();
  dragDepth += 1;
  showDropOverlay();
});

window.addEventListener("dragover", (e) => {
  if (!hasFiles(e)) return;
  e.preventDefault();
  showDropOverlay();
});

window.addEventListener("dragleave", (e) => {
  if (!hasFiles(e)) return;
  e.preventDefault();
  dragDepth = Math.max(0, dragDepth - 1);
  if (dragDepth === 0) hideDropOverlay();
});

window.addEventListener("drop", async (e) => {
  if (!hasFiles(e)) return;
  e.preventDefault();
  dragDepth = 0;
  hideDropOverlay();

  const files = Array.from(e.dataTransfer?.files || []);
  if (files.length === 0) return;

  window.__memoryTaskBegin?.('File Load');
  await handleFiles(files);
  window.__memoryTaskEnd?.();
});

// File menu: Load PLY triggers hidden input (supports single/multiple)
if (menuLoadPlyEl && loadPlyInputEl) {
  menuLoadPlyEl.addEventListener("click", (e) => {
    e.preventDefault();
    loadPlyInputEl.click();
  });
}

if (loadPlyInputEl) {
  loadPlyInputEl.addEventListener("change", async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    window.__memoryTaskBegin?.('File Load');
    await handleFiles(files);
    window.__memoryTaskEnd?.();
    e.target.value = "";
  });
}

// 현재 프로젝트 파일 핸들 (저장 시 같은 파일에 덮어쓰기용)
let currentProjectFileHandle = null;

async function runSaveProject(opts = {}) {
  if (!timeline || !objectDescription) return Promise.resolve();
  const data = await buildProjectData({
    timeline,
    objectDescription,
    selectionTool: typeof window.__selectionTool !== 'undefined' ? window.__selectionTool : null,
  });
  if (!data.objects?.length) {
    alert("저장할 오브젝트가 없습니다. PLY를 먼저 로드해 주세요.");
    return Promise.resolve();
  }
  const fileHandle = opts.saveAs ? null : currentProjectFileHandle;
  return saveProjectToFile(data, {
    fileHandle: fileHandle ?? undefined,
    getSuggestedName: () => `project${Date.now()}.liam`,
  });
}

// File menu: 저장 (기존 프로젝트 파일이 있으면 그대로, 없으면 파인더 열기)
if (menuSaveProjectEl) {
  menuSaveProjectEl.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      const result = await runSaveProject({ saveAs: false });
      if (result?.saved && result?.fileHandle) currentProjectFileHandle = result.fileHandle;
    } catch (err) {
      if (err?.name !== 'AbortError') console.error(err);
    }
  });
}
// File menu: 다른 이름으로 저장 (항상 새 파일로 저장)
if (menuSaveProjectAsEl) {
  menuSaveProjectAsEl.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      const result = await runSaveProject({ saveAs: true });
      if (result?.saved && result?.fileHandle) currentProjectFileHandle = result.fileHandle;
    } catch (err) {
      if (err?.name !== 'AbortError') console.error(err);
    }
  });
}
if (menuLoadProjectEl) {
  menuLoadProjectEl.addEventListener("click", async (e) => {
    e.preventDefault();
    if (!fileLoader || !timeline || !viewer) return;
    const confirmed = await showConfirmModal(
      t('loadProject.confirmTitle'),
      t('loadProject.confirmMessage'),
      t('loadProject.confirmButton')
    );
    if (!confirmed) return;
    const loadingOverlayEl = document.getElementById("loadingOverlay");
    const loadingProgressEl = document.getElementById("loadingPercent");
    const showProgress = (text) => {
      if (loadingOverlayEl) loadingOverlayEl.classList.add("is-visible");
      if (loadingProgressEl) loadingProgressEl.textContent = text ?? "";
    };
    const hideProgress = () => {
      if (loadingOverlayEl) loadingOverlayEl.classList.remove("is-visible");
    };
    try {
      showProgress("프로젝트 불러오는 중...");
      const result = await loadProjectFromFile(
        {
          fileLoader,
          timeline,
          viewer,
          objectDescription: objectDescription ?? null,
          inspector: inspector ?? null,
          getLocalFileServerBaseUrl,
        },
        { onProgress: showProgress }
      );
      if (!result.success) {
        if (result.error) alert(result.error);
      } else {
        if (result.fileHandle) currentProjectFileHandle = result.fileHandle;
        if (typeof window.updateExportButtonState === 'function') window.updateExportButtonState();
      }
    } catch (err) {
      console.error(err);
      alert("프로젝트 불러오기 실패: " + (err?.message || err));
    } finally {
      hideProgress();
    }
  });
}

// File menu: Load by path (local py server)
const loadByPathModalOverlay = document.getElementById("loadByPathModalOverlay");
const loadByPathModalClose = document.getElementById("loadByPathModalClose");
const loadByPathModalCancel = document.getElementById("loadByPathModalCancel");
const loadByPathInput = document.getElementById("loadByPathInput");
const loadByPathError = document.getElementById("loadByPathError");
const loadByPathModalOk = document.getElementById("loadByPathModalOk");
const loadByPathStatusDot = document.getElementById("loadByPathStatusDot");
const loadByPathStatusText = document.getElementById("loadByPathStatusText");

/** @param {"checking"|"ok"|"error"} state */
function updateLoadByPathServerStatus(state) {
  if (!loadByPathStatusDot || !loadByPathStatusText) return;
  loadByPathStatusDot.className = "load-by-path__status-dot load-by-path__status-dot--" + state;
  if (state === "checking") loadByPathStatusText.textContent = t("loadByPath.serverChecking");
  else if (state === "ok") loadByPathStatusText.textContent = t("loadByPath.serverOk");
  else loadByPathStatusText.textContent = t("loadByPath.serverError");
}

async function checkLoadByPathServerHealth() {
  updateLoadByPathServerStatus("checking");
  try {
    const baseUrl = await getLocalFileServerBaseUrl();
    const res = await fetch(`${baseUrl}/health`, { signal: AbortSignal.timeout(3000) });
    updateLoadByPathServerStatus(res.ok ? "ok" : "error");
  } catch (_) {
    updateLoadByPathServerStatus("error");
  }
}

function showLoadByPathModal() {
  if (!loadByPathModalOverlay) return;
  if (loadByPathInput) {
    loadByPathInput.value = "";
    loadByPathInput.placeholder = t("loadByPath.pathPlaceholder");
  }
  if (loadByPathError) {
    loadByPathError.style.display = "none";
    loadByPathError.textContent = "";
  }
  loadByPathModalOverlay.classList.add("is-visible");
  loadByPathModalOverlay.setAttribute("aria-hidden", "false");
  checkLoadByPathServerHealth();
  setTimeout(() => loadByPathInput?.focus(), 80);
}

function hideLoadByPathModal() {
  if (!loadByPathModalOverlay) return;
  loadByPathModalOverlay.classList.remove("is-visible");
  loadByPathModalOverlay.setAttribute("aria-hidden", "true");
  if (loadByPathError) {
    loadByPathError.style.display = "none";
    loadByPathError.textContent = "";
  }
}

/**
 * @param {boolean} show
 * @param {string} [serverMessage] optional server error message
 */
function setLoadByPathError(show, serverMessage) {
  if (!loadByPathError) return;
  if (show) {
    loadByPathError.textContent = serverMessage
      ? t("loadByPath.errorServerMessage").replace("{{message}}", serverMessage)
      : t("loadByPath.errorInvalidPath");
    loadByPathError.style.display = "block";
  } else {
    loadByPathError.style.display = "none";
    loadByPathError.textContent = "";
  }
}

if (loadByPathModalOverlay) {
  if (loadByPathModalClose) {
    loadByPathModalClose.addEventListener("click", hideLoadByPathModal);
  }
  if (loadByPathModalCancel) {
    loadByPathModalCancel.addEventListener("click", hideLoadByPathModal);
  }
  loadByPathModalOverlay.addEventListener("click", (e) => {
    if (e.target === loadByPathModalOverlay) hideLoadByPathModal();
  });
}

if (loadByPathModalOk && loadByPathInput) {
  loadByPathModalOk.addEventListener("click", async () => {
    const path = loadByPathInput.value.trim();
    setLoadByPathError(false);
    if (!path) {
      setLoadByPathError(true);
      return;
    }
    window.__showGlobalLoadingOverlay?.(t("loading.loadByPath"), 100, { useSpinner: true });
    let baseUrl;
    try {
      baseUrl = await getLocalFileServerBaseUrl();
    } catch (_) {
      window.__hideGlobalLoadingOverlay?.();
      setLoadByPathError(true, t("loadByPath.errorConnectionFailed"));
      return;
    }
    const url = `${baseUrl}/local-file?path=${encodeURIComponent(path)}`;
    try {
      const res = await fetch(url);
      if (!res.ok) {
        let serverMessage = "";
        try {
          const body = await res.json();
          serverMessage = body.detail ?? body.message ?? "";
        } catch (_) {
          try {
            serverMessage = await res.text();
          } catch (_) {}
        }
        if (typeof serverMessage === "object") serverMessage = JSON.stringify(serverMessage);
        setLoadByPathError(true, serverMessage || `HTTP ${res.status}`);
        window.__hideGlobalLoadingOverlay?.();
        return;
      }
      const blob = await res.blob();
      const fileName = path.replace(/^.*[/\\]/, "") || "output.ply";
      const file = new File([blob], fileName, { type: "application/octet-stream" });
      hideLoadByPathModal();
      window.__memoryTaskBegin?.("File Load");
      await handleFiles([file], { sourcePath: path });
      window.__memoryTaskEnd?.();
    } catch (_err) {
      setLoadByPathError(true, t("loadByPath.errorConnectionFailed"));
    } finally {
      window.__hideGlobalLoadingOverlay?.();
    }
  });
}

// File handling: FileLoader + Timeline

/**
 * 드래그앤드롭/파일 선택 시 서버에 업로드해 경로를 받아오기 (로컬 서버 사용 중일 때)
 * @param {File[]} files
 * @param {string} baseUrl
 * @returns {Promise<{ files: File[], paths: string[] }|null>} 실패 시 null
 */
async function uploadFilesToServerAndGetPaths(files, baseUrl) {
  const paths = [];
  const newFiles = [];
  for (const file of files) {
    const form = new FormData();
    form.append("file", file);
    let res;
    try {
      res = await fetch(`${baseUrl}/upload`, { method: "POST", body: form });
    } catch {
      return null;
    }
    if (!res.ok) return null;
    let data;
    try {
      data = await res.json();
    } catch {
      return null;
    }
    const path = data?.path;
    if (typeof path !== "string") return null;
    paths.push(path);
    const blob = await fetch(`${baseUrl}/local-file?path=${encodeURIComponent(path)}`).then((r) => r.ok ? r.blob() : null);
    if (!blob) return null;
    const name = (file.name || path.replace(/^.*[/\\]/, "") || "model.ply").trim();
    newFiles.push(new File([blob], name, { type: "application/octet-stream" }));
  }
  return { files: newFiles, paths };
}

/**
 * Handle files (select or drop)
 * @param {File[]} files
 * @param {{ sourcePath?: string }} [options] - 경로로 로드 시 sourcePath 전달
 */
async function handleFiles(files, options = {}) {
  if (!files || files.length === 0) return;
  
  // Ensure viewer ready
  if (!window.__viewerReady || !viewer) {
    // (log removed)
    return;
  }

  // Warn if no FileLoader
  if (!fileLoader) {
    // (log removed)
    return;
  }

  const sortedFiles = [...files].sort((a, b) => a.name.localeCompare(b.name));

  // 드래그앤드롭/파일 선택 시 기존 방식 사용 (파일에서 직접 로드). 서버 업로드 사용 시 아래 주석 해제.
  let filesToLoad = sortedFiles;
  let sourcePath = options?.sourcePath ?? null;
  let sourcePaths = options?.sourcePaths ?? null;
  // if (!sourcePath && !sourcePaths && sortedFiles.length > 0) {
  //   try {
  //     const baseUrl = await getLocalFileServerBaseUrl();
  //     window.__showGlobalLoadingOverlay?.(t("loading.uploadingToServer"), 100, { useSpinner: true });
  //     const uploaded = await uploadFilesToServerAndGetPaths(sortedFiles, baseUrl);
  //     if (uploaded && uploaded.paths.length === sortedFiles.length) {
  //       filesToLoad = uploaded.files;
  //       sourcePaths = uploaded.paths;
  //       if (uploaded.paths.length === 1) sourcePath = uploaded.paths[0];
  //     }
  //     if (!uploaded) window.__hideGlobalLoadingOverlay?.();
  //   } catch (_) {
  //     window.__hideGlobalLoadingOverlay?.();
  //     // 서버 없거나 업로드 실패 시 기존처럼 경로 없이 로드
  //   }
  // }

  const result = await fileLoader.loadFiles(filesToLoad, { ...options, sourcePath, sourcePaths, dedup: false });
  
  if (result.success && result.results && result.results.length > 0) {
    
    if (timeline) {
      let lastAddedObj = null;
      const pathForSingle = sourcePath ?? options?.sourcePath ?? null;
      const pathsForMulti = sourcePaths ?? null;
      
      if (result.results.length === 1) {
        // Single file: existing flow
        const loaded = result.results[0];
        lastAddedObj = timeline.addObject(loaded.fileName, loaded.entity, loaded.splatId, pathForSingle ? { sourcePath: pathForSingle } : {});
      } else {
        // Multiple files: one object; files sorted by name (sourcePath per file)
        const filesData = result.results.map((r, i) => ({
          entity: r.entity,
          splatId: r.splatId,
          fileName: r.fileName,
          sourcePath: pathsForMulti?.[i] ?? null,
        }));
        
        lastAddedObj = timeline.addMultiFileObject(filesData);
      }
      
      // Auto-select added object (show inspector)
      if (lastAddedObj) {
        timeline.selectObject(lastAddedObj.id);
      }
    }
    
    // Update export button state
    updateExportButtonState();
  } else {
    // (log removed)
  }
}

// Shared shape gizmo logic for import/attach flows
window.__handleFiles = handleFiles;
window.__getLocalFileServerBaseUrl = getLocalFileServerBaseUrl;

// Export buttons

/**
 * Update export button state: App Viewer when files/objects exist; Video when files or camera keyframes exist
 */
function updateExportButtonState() {
  const hasFiles = fileLoader && fileLoader.getLoadedFiles()?.length > 0;
  const hasObjects = !!(timeline && Array.isArray(timeline.objects) && timeline.objects.length > 0);
  const canExportViewer = hasFiles || hasObjects;
  const canExportVideo = hasFiles || hasObjects;
  if (menuExportViewerEl) {
    menuExportViewerEl.classList.toggle("is-disabled", !canExportViewer);
    menuExportViewerEl.setAttribute("aria-disabled", canExportViewer ? "false" : "true");
    menuExportViewerEl.title = canExportViewer ? "Export App Viewer" : "최소 한 개의 오브젝트가 필요합니다.";
  }
  if (menuExportMp4El) {
    const disabledByFlyMode = isFlyMode;
    const isPlaying = !!timeline?.isPlaying;
    const disabledByPlaying = isPlaying;
    const canExportMp4 = canExportVideo && !disabledByFlyMode && !disabledByPlaying;
    menuExportMp4El.classList.toggle("is-disabled", !canExportMp4);
    menuExportMp4El.setAttribute("aria-disabled", canExportMp4 ? "false" : "true");
    if (!canExportMp4) {
      if (disabledByPlaying) {
        menuExportMp4El.setAttribute("data-tooltip", "재생을 중지해주세요.");
        menuExportMp4El.removeAttribute("title");
      } else if (disabledByFlyMode) {
        menuExportMp4El.setAttribute("data-tooltip", "카메라 모드를 Orbit으로 변경해 주세요.");
        menuExportMp4El.removeAttribute("title");
      } else {
        menuExportMp4El.removeAttribute("data-tooltip");
        menuExportMp4El.title = "최소 한 개의 파일 또는 오브젝트가 필요합니다.";
      }
    } else {
      menuExportMp4El.removeAttribute("data-tooltip");
      menuExportMp4El.title = "";
    }
  }
  window.__cameraTemplates?.updateTemplateButtonState?.();
}
window.updateExportButtonState = updateExportButtonState;

// Initial state (disabled on load)
updateExportButtonState();

// File menu: Export App Viewer
if (menuExportViewerEl) {
  menuExportViewerEl.addEventListener("click", async (e) => {
    e.preventDefault();
    // Disabled guard
    if (menuExportViewerEl.getAttribute("aria-disabled") === "true") {
      // Tooltip already set via title attribute
      return;
    }
    if (!window.__viewerReady) {
      // (log removed)
      return;
    }
    if (!fileLoader || !timeline || !viewer) {
      // (log removed)
      return;
    }

    const objectsForExport = timeline?.objects || [];
    if (!objectsForExport || objectsForExport.length === 0) {
      alert("최소 한 개의 오브젝트가 필요합니다.");
      return;
    }

    let exportTotalCount = 0;
    for (const obj of objectsForExport) {
      if (obj?.isMultiFile && Array.isArray(obj.files)) {
        exportTotalCount += obj.files.length;
      } else {
        exportTotalCount += 1;
      }
    }
    exportTotalCount = Math.max(1, exportTotalCount);
    window.__exportAppViewerTotalCount = exportTotalCount;

    const abortController = new AbortController();
    let cancelRequested = false;
    const onCancel = () => {
      cancelRequested = true;
      try {
        abortController.abort();
      } catch (e) {
      }
    };

    try {
      window.__memoryTaskBegin?.('Export App Viewer');
      await exportSingleHTML({
        fileLoader,
        timeline,
        viewer,
        selectionTool,
        signal: abortController.signal,
        onCancel,
      });
    } catch (err) {
      if (cancelRequested || err?.name === 'AbortError') {
        return;
      }
      // (log removed)
      alert("내보내기 중 오류가 발생했습니다: " + (err?.message || err));
    } finally {
      try {
        delete window.__exportAppViewerTotalCount;
      } catch (e) {
      }
      window.__memoryTaskEnd?.();
      window.__hideGlobalLoadingOverlay?.();
    }
  });
}

// Delete confirm modal

const deleteModalOverlay = document.getElementById("deleteModalOverlay");
const deleteModalFilename = document.getElementById("deleteModalFilename");
const deleteModalClose = document.getElementById("deleteModalClose");
const deleteModalCancel = document.getElementById("deleteModalCancel");
const deleteModalConfirm = document.getElementById("deleteModalConfirm");
const deleteModalTitle = document.getElementById("deleteModalTitle");
const deleteModalText = document.querySelector(".delete-modal__text");

/** @type {string[]|null} */
let pendingDeleteObjectIds = null;
let pendingDeleteType = null; // 'object' | 'keyframes'

function escapeHtmlForDeleteModal(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Show delete confirm modal (object delete; 단일 또는 다중)
 * @param {string|string[]} objectIds
 * @param {string|string[]} [objectNames]
 */
function showDeleteModal(objectIds, objectNames) {
  if (!deleteModalOverlay) return;

  const idsRaw =
    objectIds != null
      ? Array.isArray(objectIds)
        ? objectIds
        : [objectIds]
      : [];
  const ids = idsRaw.filter(Boolean);
  const namesRaw =
    objectNames != null
      ? Array.isArray(objectNames)
        ? objectNames
        : [objectNames]
      : [];
  const names = ids.map((id, i) => namesRaw[i] ?? id);

  if (ids.length === 0) return;

  pendingDeleteObjectIds = [...ids];
  pendingDeleteType = "object";

  if (deleteModalTitle) {
    deleteModalTitle.textContent = "삭제";
  }
  if (deleteModalText) {
    if (ids.length <= 1) {
      const label = escapeHtmlForDeleteModal(names[0] ?? ids[0] ?? "");
      deleteModalText.innerHTML = `"<span id="deleteModalFilename" class="delete-modal__filename">${label}</span>"을(를) 정말 삭제하시겠습니까?`;
    } else {
      const list = names
        .map((n) => `<span class="delete-modal__filename">${escapeHtmlForDeleteModal(n)}</span>`)
        .join(", ");
      deleteModalText.innerHTML = `선택한 ${ids.length}개 오브젝트를 삭제하시겠습니까?<br>${list}`;
    }
  }

  deleteModalOverlay.classList.add("is-visible");
  deleteModalOverlay.setAttribute("aria-hidden", "false");

  setTimeout(() => deleteModalConfirm?.focus(), 100);
}

/**
 * Show keyframe bulk delete confirm modal
 */
function showKeyframeDeleteAllModal() {
  if (!deleteModalOverlay) return;
  
  pendingDeleteObjectIds = null;
  pendingDeleteType = 'keyframes';
  
  if (deleteModalTitle) {
    deleteModalTitle.textContent = "키프레임 일괄 삭제";
  }
  if (deleteModalText) {
    deleteModalText.innerHTML = `모든 카메라 키프레임을 삭제하시겠습니까?`;
  }
  
  deleteModalOverlay.classList.add("is-visible");
  deleteModalOverlay.setAttribute("aria-hidden", "false");
  
  // Focus confirm button
  setTimeout(() => deleteModalConfirm?.focus(), 100);
}

const DELETE_MODAL_CONFIRM_DEFAULT_TEXT = '삭제';

/**
 * Hide delete confirm modal
 */
function hideDeleteModal() {
  if (!deleteModalOverlay) return;
  if (pendingDeleteType === 'confirm' && deleteModalConfirm) {
    deleteModalConfirm.textContent = DELETE_MODAL_CONFIRM_DEFAULT_TEXT;
  }
  deleteModalOverlay.classList.remove("is-visible");
  deleteModalOverlay.setAttribute("aria-hidden", "true");
  pendingDeleteObjectIds = null;
  pendingDeleteType = null;
}

// Generic confirm modal

let pendingConfirmResolve = null;

/**
 * Show generic confirm modal (Promise-based).
 * @param {string} title - modal title
 * @param {string} message - modal message
 * @param {string} [confirmButtonText] - confirm button label (e.g. '불러오기')
 * @returns {Promise<boolean>} - true on confirm, false on cancel
 */
function showConfirmModal(title, message, confirmButtonText) {
  return new Promise((resolve) => {
    if (!deleteModalOverlay) {
      resolve(false);
      return;
    }
    pendingDeleteObjectIds = null;
    pendingDeleteType = 'confirm';
    pendingConfirmResolve = resolve;
    if (deleteModalTitle) deleteModalTitle.textContent = title;
    if (deleteModalText) deleteModalText.innerHTML = message;
    if (deleteModalConfirm) {
      if (typeof confirmButtonText === 'string') {
        deleteModalConfirm.textContent = confirmButtonText;
      } else {
        deleteModalConfirm.textContent = DELETE_MODAL_CONFIRM_DEFAULT_TEXT;
      }
    }
    deleteModalOverlay.classList.add("is-visible");
    deleteModalOverlay.setAttribute("aria-hidden", "false");
    setTimeout(() => deleteModalConfirm?.focus(), 100);
  });
}

/**
 * Execute object delete (deselect then remove)
 */
async function executeObjectDelete(objectId) {
  if (!timeline || !objectId) return;
  
  const obj = timeline.objects.find(o => o.id === objectId);
  if (!obj) return;

  detachChildrenBeforeParentDelete(timeline.objects, objectId, viewer);

  const lsm = window.__loadSessionManager;

  // Sequence object: abort in-flight frame load and dispose per-frame session
  if (obj.isSequence) {
    if (obj._frameAbortController) {
      try {
        obj._frameAbortController.abort();
      } catch (e) {
      }
      obj._frameAbortController = null;
    }

    // Dispose SuperSplat-style prefetch (current implementation uses _sequenceState)
    if (obj._sequenceState) {
      try {
        if (obj._sequenceState.prefetchAbort) {
          try {
            obj._sequenceState.prefetchAbort.abort();
          } catch (e) {
          }
          obj._sequenceState.prefetchAbort = null;
        }
        const pre = obj._sequenceState.prefetch;
        obj._sequenceState.prefetch = null;
        if (pre?.sessionId) {
          try {
            await lsm?.disposeSession?.(pre.sessionId, { reason: 'sequence_object_delete_prefetch' });
          } catch (e) {
          }
        } else if (pre?.splatId) {
          try {
            viewer?.removeSplat?.(pre.splatId);
          } catch (e) {
          }
          try {
            fileLoader?.removeFileData?.(pre.splatId);
          } catch (e) {
          }
        }
      } catch (e) {
      }
    }

    // Dispose cached/prefetched frames first to avoid leaving detached sessions around
    if (obj._frameCache && obj._frameCache instanceof Map) {
      for (const entry of obj._frameCache.values()) {
        if (!entry) continue;
        if (entry.sessionId) {
          try {
            await lsm?.disposeSession?.(entry.sessionId, { reason: 'sequence_object_delete_cache' });
          } catch (e) {
          }
        } else if (entry.splatId) {
          try {
            viewer?.removeSplat?.(entry.splatId);
          } catch (e) {
          }
          try {
            fileLoader?.removeFileData?.(entry.splatId);
          } catch (e) {
          }
        }
      }
      try {
        obj._frameCache.clear();
      } catch (e) {
      }
    }
    obj._frameCacheOrder = null;
    obj._frameInFlight = null;
    obj._frameCacheToken = 0;

    if (obj._frameSessionId) {
      try {
        await lsm?.disposeSession?.(obj._frameSessionId, { reason: 'sequence_object_delete' });
      } catch (e) {
      }
      obj._frameSessionId = null;
    }
    if (obj.splatId) {
      try {
        const res = viewer?.getSplatResourcesById?.(obj.splatId);
        lsm?.untrackSplatResources?.({
          splatId: obj.splatId,
          entity: res?.entity,
          asset: res?.asset,
          blobUrl: res?.blobUrl,
        });
      } catch (e) {
      }
      viewer?.removeSplat?.(obj.splatId);
      fileLoader?.removeFileData?.(obj.splatId);
      obj.splatId = null;
      obj.entity = null;
    }
  }
  
  // Multi-file object: remove all splats and file data
  if (obj.isMultiFile && obj.files) {
    for (const f of obj.files) {
      if (f.splatId) {
        try {
          const res = viewer?.getSplatResourcesById?.(f.splatId);
          lsm?.untrackSplatResources?.({
            splatId: f.splatId,
            entity: res?.entity,
            asset: res?.asset,
            blobUrl: res?.blobUrl,
          });
        } catch (e) {
        }
        viewer?.removeSplat?.(f.splatId);
        fileLoader?.removeFileData?.(f.splatId);
      }
    }
  } else if (obj.objectType === 'empty' && obj.entity) {
    try {
      obj.entity.destroy();
    } catch (e) {
      /* ignore */
    }
    obj.entity = null;
  } else if (obj.splatId) {
    // Single PLY object
    try {
      const res = viewer?.getSplatResourcesById?.(obj.splatId);
      lsm?.untrackSplatResources?.({
        splatId: obj.splatId,
        entity: res?.entity,
        asset: res?.asset,
        blobUrl: res?.blobUrl,
      });
    } catch (e) {
    }
    viewer?.removeSplat?.(obj.splatId);
    fileLoader?.removeFileData?.(obj.splatId);
  }

  objectDescription?.removeCommentsForObjectId?.(objectId);
  viewer?.setEditorObjectTint?.(objectId, null);
  timeline.removeObject(objectId);
  updateExportButtonState();

  try {
    // Force HUD to reflect current splat state after disposal.
    window.__memoryMonitor?.sample?.({ sessionId: null, phase: 'object_delete' });
  } catch (e) {
  }
}

// Delete modal event listeners
if (deleteModalClose) {
  deleteModalClose.addEventListener("click", hideDeleteModal);
}
if (deleteModalCancel) {
  deleteModalCancel.addEventListener("click", () => {
    // Reject on cancel
    if (pendingDeleteType === 'confirm' && pendingConfirmResolve) {
      pendingConfirmResolve(false);
      pendingConfirmResolve = null;
    }
    hideDeleteModal();
  });
}
if (deleteModalConfirm) {
  deleteModalConfirm.addEventListener("click", async () => {
    if (pendingDeleteType === "object" && pendingDeleteObjectIds?.length) {
      const batch = [...pendingDeleteObjectIds];
      for (const objectId of batch) {
        await executeObjectDelete(objectId);
      }
    } else if (pendingDeleteType === 'keyframes') {
      timeline?.clearKeyframes();
    } else if (pendingDeleteType === 'confirm' && pendingConfirmResolve) {
      // Resolve on confirm
      pendingConfirmResolve(true);
      pendingConfirmResolve = null;
    }
    hideDeleteModal();
  });
}
if (deleteModalOverlay) {
  // Close on overlay click
  deleteModalOverlay.addEventListener("click", (e) => {
    if (e.target === deleteModalOverlay) {
      // Reject on cancel
      if (pendingDeleteType === 'confirm' && pendingConfirmResolve) {
        pendingConfirmResolve(false);
        pendingConfirmResolve = null;
      }
      hideDeleteModal();
    }
  });
}

// Deselect on empty area click

document.addEventListener("click", (e) => {
  // Ignore if modal open
  if (deleteModalOverlay?.classList.contains("is-visible")) return;

  return;

  // Avoid deselect from click after gizmo drag
  if (window.__gizmoInteracting) return;
  if (typeof window.__gizmoLastInteractMs === 'number') {
    const dt = performance.now() - window.__gizmoLastInteractMs;
    if (dt >= 0 && dt < 250) return;
  }
  
  // Ignore if no timeline
  if (!timeline) return;
  
  // Ignore if no selection
  if (!timeline.selectedObjectId) return;
  
  // Check clicked element
  const target = e.target;
  
  // Ignore object button/block click
  if (target.closest(".timeline__obj-row")) return;
  
  // Ignore inspector inner click
  if (target.closest(".object-inspector")) return;
  
  // Ignore gizmo button click
  if (target.closest(".gizmo-controls")) return;
  
  // Ignore delete modal click
  if (target.closest(".delete-modal")) return;
  
  // Ignore template dropdown click
  if (target.closest(".template-dropdown")) return;
  
  // Otherwise deselect on empty click
  timeline.clearSelection();
});

// Keyboard shortcuts

/** R→A→M within 0.75s toggles RAM HUD */
let ramSequence = "";
let ramSequenceTime = 0;
const RAM_SEQUENCE_TIMEOUT_MS = 750;

window.addEventListener("keydown", (e) => {
  const tag = e.target?.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA") return;
  
  // ESC: close modal
  if (e.key === "Escape") {
    if (deleteModalOverlay?.classList.contains("is-visible")) {
      hideDeleteModal();
      return;
    }
  }
  
  // G: grid toggle
  if (e.code === "KeyG") {
    e.preventDefault();
    setGridEnabled(!isGridEnabled);
  }

  // Ctrl+F: fullscreen toggle
  if (e.code === "KeyF" && e.ctrlKey) {
    e.preventDefault();
    toggleFullscreen();
    return;
  }

  // F: Orbit/Fly toggle (e.code)
  if (e.code === "KeyF") {
    e.preventDefault();
    if (cameraModeSwitch && !cameraModeSwitch.disabled) {
      cameraModeSwitch.checked = !cameraModeSwitch.checked;
      switchCameraMode(cameraModeSwitch.checked);
    }
  }
  
  // R: camera reset (Orbit only)
  if (e.code === "KeyR" && !e.ctrlKey && !e.metaKey && !window.__flyMode?.getEnabled?.()) {
    e.preventDefault();
    resetCamera();
  }
  
  // Space: play/pause toggle
  if (e.code === "Space") {
    e.preventDefault();
    timeline?.togglePlay();
  }
  
  // C: add camera marker
  if (e.code === "KeyC" && !e.ctrlKey && !e.metaKey) {
    e.preventDefault();
    timeline?.addKeyframe(currentPinSeconds);
  }

  // Ctrl+C / Cmd+C: remove camera marker at current position
  if (e.code === "KeyC" && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    timeline?.removeKeyframeAt(currentPinSeconds);
  }
  
  // O: orbit center marker toggle
  if (e.code === "KeyO") {
    e.preventDefault();
    toggleOrbitMarker();
  }

  // T: GLB visibility toggle (selected or all in scene)
  // R→A→M within 0.75s toggles RAM/FPS HUD
  const now = Date.now();
  if (now - ramSequenceTime > RAM_SEQUENCE_TIMEOUT_MS) ramSequence = "";
  ramSequenceTime = now;
  if (e.code === "KeyR") {
    ramSequence = "r";
  } else if (e.code === "KeyA" && ramSequence === "r") {
    ramSequence = "ra";
  } else if (e.code === "KeyM" && ramSequence === "ra") {
    ramSequence = "";
    e.preventDefault();
    const statsHud = document.getElementById("statsHud");
    if (statsHud) {
      const hidden = statsHud.classList.toggle("stats-hud--hidden");
      statsHud.setAttribute("aria-hidden", hidden ? "true" : "false");
    }
  } else {
    ramSequence = e.code === "KeyR" ? "r" : "";
  }

  // P: tool window (panel toggle)
  if (e.code === "KeyP") {
    e.preventDefault();
    togglePanels();
  }

  // Ctrl/Cmd: temporarily release selection for rotation
  if ((e.key === "Control" || e.key === "Meta") && selectionTool?.isActive) {
    selectionTool.temporarilyDisableForRotation();
    return;
  }
  
  // Enter: edit selected object name
  if (e.code === "Enter") {
    if (timeline?.selectedObjectId) {
      e.preventDefault();
      timeline.startEditingSelectedObjectName?.();
    }
  }
  
  // Delete/Backspace: 스플랫 점 선택이 있으면 지우개 버튼과 동일 연산
  if (e.code === "Delete" || e.code === "Backspace") {
    const st = window.__selectionTool ?? selectionTool;
    if (st?.hasSelectedPoints?.()) {
      e.preventDefault();
      detailsPanel?.onEraserClick?.();
      st.eraseSelection();
      detailsPanel?.updateEraserComplementDisabledState?.();
      return;
    }
  }

  // Delete/Backspace: delete selected object(s) (confirm modal)
  if (e.code === "Delete" || e.code === "Backspace") {
    const selIds = timeline?.selectedObjectIds ?? [];
    if (selIds.length > 0) {
      e.preventDefault();
      const names = selIds.map(
        (id) => timeline.objects.find((o) => o.id === id)?.name ?? id
      );
      showDeleteModal(selIds, names);
    } else if (timeline?.selectedObjectId) {
      e.preventDefault();
      const id = timeline.selectedObjectId;
      const obj = timeline.objects.find((o) => o.id === id);
      if (obj) showDeleteModal([id], [obj.name]);
    }
  }
});

window.addEventListener("keyup", (e) => {
  const tag = e.target?.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA") return;

  if (e.key === "Control" || e.key === "Meta") {
    selectionTool?.restoreAfterRotation?.();
  }
});

// FPS counter
let fpsFrameCount = 0;
let fpsLastTime = performance.now();

function startFpsCounter() {
  if (!fpsCounterEl) return;
  
  // Hook PlayCanvas app update (no separate RAF)
  function updateFps() {
    fpsFrameCount++;
    const now = performance.now();
    const delta = now - fpsLastTime;
    
    if (delta >= 1000) {
      const fps = Math.round((fpsFrameCount * 1000) / delta);
      fpsCounterEl.textContent = `${fps} FPS`;
      
      // Theme-based performance CSS class
      fpsCounterEl.classList.remove('fps--good', 'fps--warn', 'fps--bad');
      if (fps >= 50) {
        fpsCounterEl.classList.add('fps--good');
      } else if (fps >= 30) {
        fpsCounterEl.classList.add('fps--warn');
      } else {
        fpsCounterEl.classList.add('fps--bad');
      }
      
      fpsFrameCount = 0;
      fpsLastTime = now;
    }
  }
  
  // Connect when viewer app ready
  if (viewer?.app) {
    viewer.app.on("update", updateFps);
  } else {
    // Fallback: RAF
    const tick = () => {
      updateFps();
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
}

// Camera info display
let lastCameraPos = { x: 0, y: 0, z: 0 };
let lastCameraRot = { x: 0, y: 0, z: 0 };
let cameraIdleTime = 0;
let cameraInfoVisible = false;
let cameraInfoEnabled = true;

const CAMERA_INFO_STORAGE_KEY = 'viewer.settings.cameraInfo.enabled';

function loadCameraInfoEnabled() {
  try {
    const v = localStorage.getItem(CAMERA_INFO_STORAGE_KEY);
    if (v === null) return true;
    return v === '1';
  } catch {
    return true;
  }
}

function saveCameraInfoEnabled(enabled) {
  try {
    localStorage.setItem(CAMERA_INFO_STORAGE_KEY, enabled ? '1' : '0');
  } catch {
    // ignore
  }
}

function setCameraInfoEnabled(enabled) {
  cameraInfoEnabled = !!enabled;
  saveCameraInfoEnabled(cameraInfoEnabled);

  // Sync UI switch
  const sw = document.getElementById('gizmoCameraInfoSwitch');
  if (sw) sw.checked = cameraInfoEnabled;

  // Apply show/hide immediately
  if (cameraInfoEl) {
    if (!cameraInfoEnabled) {
      cameraInfoEl.classList.add('is-hidden');
      cameraInfoVisible = false;
    }
  }
}

function startCameraInfoDisplay() {
  if (!cameraInfoEl || !cameraInfoTextEl) return;

  // Restore initial settings
  cameraInfoEnabled = loadCameraInfoEnabled();

  // Camera settings switch wiring
  const sw = document.getElementById('gizmoCameraInfoSwitch');
  if (sw) {
    sw.checked = cameraInfoEnabled;
    sw.addEventListener('change', () => {
      setCameraInfoEnabled(sw.checked);
    });
  }
  
  const IDLE_TIMEOUT = 2000; // ms
  const CHECK_INTERVAL = 100; // ms
  const THRESHOLD = 0.01; // change detection
  
  function updateCameraInfo() {
    // Keep hidden when user disables
    if (!cameraInfoEnabled) {
      if (cameraInfoEl && cameraInfoVisible) {
        cameraInfoEl.classList.add('is-hidden');
        cameraInfoVisible = false;
      }
      setTimeout(updateCameraInfo, CHECK_INTERVAL);
      return;
    }

    if (!viewer || !window.__viewerReady) {
      setTimeout(updateCameraInfo, CHECK_INTERVAL);
      return;
    }
    
    const state = viewer.getCameraState?.();
    if (!state) {
      setTimeout(updateCameraInfo, CHECK_INTERVAL);
      return;
    }
    
    const pos = state.position;
    // Get z from rotation (roll)
    const rotQuat = state.rotation;
    let rotZ = 0;
    if (rotQuat) {
      // Approximate roll from quaternion
      rotZ = Math.atan2(2 * (rotQuat.w * rotQuat.z + rotQuat.x * rotQuat.y), 
                        1 - 2 * (rotQuat.y * rotQuat.y + rotQuat.z * rotQuat.z)) * (180 / Math.PI);
    }
    
    const rot = {
      x: (state.pitch ?? 0),
      y: (state.yaw ?? 0),
      z: rotZ,
    };
    
    // Change detection (Pos x,y,z and Rot x,y; exclude z)
    const posChanged = 
      Math.abs(pos.x - lastCameraPos.x) > THRESHOLD ||
      Math.abs(pos.y - lastCameraPos.y) > THRESHOLD ||
      Math.abs(pos.z - lastCameraPos.z) > THRESHOLD;
    
    const rotChanged = 
      Math.abs(rot.x - lastCameraRot.x) > THRESHOLD ||
      Math.abs(rot.y - lastCameraRot.y) > THRESHOLD;
    // Exclude rot.z from hide condition
    
    if (posChanged || rotChanged) {
      // Update values
      lastCameraPos = { x: pos.x, y: pos.y, z: pos.z };
      lastCameraRot = { x: rot.x, y: rot.y, z: rot.z };
      cameraIdleTime = 0;
      
      // Update text (include Rot z)
      const posStr = `Pos: (${pos.x.toFixed(1)}, ${pos.y.toFixed(1)}, ${pos.z.toFixed(1)})`;
      const rotStr = `Rot: (${rot.x.toFixed(1)}, ${rot.y.toFixed(1)}, ${rot.z.toFixed(1)})`;
      cameraInfoTextEl.textContent = `${posStr} | ${rotStr}`;
      
      // Show
      if (!cameraInfoVisible) {
        cameraInfoEl.classList.remove('is-hidden');
        cameraInfoVisible = true;
      }
    } else {
      // No change: increase idle time
      cameraIdleTime += CHECK_INTERVAL;
      
      // Hide after 2s idle
      if (cameraIdleTime >= IDLE_TIMEOUT && cameraInfoVisible) {
        cameraInfoEl.classList.add('is-hidden');
        cameraInfoVisible = false;
      }
    }
    
    setTimeout(updateCameraInfo, CHECK_INTERVAL);
  }
  
  // Initially hidden
  cameraInfoEl.classList.add('is-hidden');
  cameraInfoVisible = false;
  updateCameraInfo();
}

// App init
async function bootstrap() {
  // IndexedDB auto-clear (if option on, clear on each open)
  try {
    const autoClear = localStorage.getItem('liam_viewer_import_cache_auto_clear') === '1';
    if (autoClear) await importCache.clearAll();
  } catch (_) {}

  // Ensure canvas element
  const canvas = document.getElementById("pcCanvas");
  if (!canvas) {
    // (log removed)
    return;
  }

  restoreAllSidePanelWidthsFromStorage();

  try {
    if (typeof window.Ammo === "function") {
      window.Ammo = await Promise.resolve(window.Ammo());
    }
    viewer = new PlayCanvasViewer();
    const success = await viewer.init(canvas);
    
    if (success) {
      // Set global refs
      window.__viewerReady = true;
      window.__viewer = viewer;
      window.viewer = viewer;
      window.createWireBoxMeshAndMaterial = createWireBoxMeshAndMaterial;
      window.createWireSphereMeshAndMaterial = createWireSphereMeshAndMaterial;

      // Memory HUD
      if (memoryHudEl) {
        const memoryMonitor = new MemoryMonitor({
          element: memoryHudEl,
          viewerGetter: () => viewer,
          intervalMs: 500,
        });
        memoryMonitor.start();

        window.__memoryMonitor = memoryMonitor;
        window.__memoryTaskBegin = (label) => memoryMonitor.startTask(label);
        window.__memoryTaskEnd = () => memoryMonitor.endTask();
      }

      // ========================================================================
      // Load Session Manager (avoid RAM/VRAM buildup)
      // ========================================================================
      const loadSessionManager = new LoadSessionManager({
        viewerGetter: () => viewer,
        selectionToolGetter: () => selectionTool,
        memoryMonitorGetter: () => window.__memoryMonitor,
        devModeGetter: () => window.DEV_MODE === true,
      });
      window.__loadSessionManager = loadSessionManager;

      if (window.DEV_MODE === true) {
        const key = '__liam_cache_notice_v1';
        if (!window.sessionStorage.getItem(key)) {
          window.sessionStorage.setItem(key, '1');
        }
      }
      
      // Init FileLoader
      fileLoader = new FileLoader(viewer, {
        overlay: loadingOverlayEl,
        progress: loadingProgressEl,
        bar: loadingProgressBarEl,
        text: loadingPercentEl,
      });
      window.__fileLoader = fileLoader;

      fileLoader.setLoadSessionManager?.(loadSessionManager);
      
      // Init Timeline
      initTimeline();

      attachObjectsPanelResize(() => viewer);
      
      // Init Inspector
      inspector = new InspectorController();
      // Connect GizmoController to inspector
      gizmo = new GizmoController(viewer);
      gizmo.init();
      inspector.init(gizmo);
      inspector.setGizmoController(gizmo);
      inspector.setOnRequestRename(() => timeline?.startEditingSelectedObjectName?.());
      window.__inspector = inspector;
      const objectInspectorEl = document.getElementById("objectInspector");
      if (objectInspectorEl) {
        makePanelDraggable(objectInspectorEl, ".object-inspector__title", {
          getDragBounds: getInspectorDragBounds,
        });
      }
      window.__gizmo = gizmo;
      // Update inspector on gizmo change
      gizmo.onTransformChange = (obj, isRealtime = false) => {
        // If gizmo scale mode and inspector uniform scale on, enforce ratio
        const isScaleMode = gizmo?.mode === 'scale';
        if (inspector?._uniformScaleEnabled && isScaleMode) {
          // Refresh fields from entity then enforce ratio
          inspector?._updateFieldsFromEntity?.();
          inspector?._applyUniformScale?.();
        } else {
          if (isRealtime) {
            // Live update: fields only (keep focus)
            inspector?._updateFieldsFromEntity?.();
          } else {
            // Drag end: full update
            inspector?.show(obj);
          }
        }
      };

      window.__gizmo = gizmo;
      
      // Default gizmo: no mode (buttons keep is-off)
      
      // Init PerformanceSettings
      performanceSettings = new PerformanceSettings(viewer);
      performanceSettings.init();
      window.__performanceSettings = performanceSettings;
      
      // Init FlyMode
      flyMode = new FlyMode(viewer);
      window.__flyMode = flyMode;
      
      // Init Object Details Panel
      detailsPanel = new ObjectDetailsPanel();
      window.__detailsPanel = detailsPanel;
      applyPanelChromeVisibility();

      if (!window.__selectionUndoRedoKeysBound) {
        window.__selectionUndoRedoKeysBound = true;
        const isEditableShortcutTarget = (el) => {
          if (!el || el.nodeType !== 1) return false;
          const t = el.tagName;
          if (t === 'INPUT' || t === 'TEXTAREA' || t === 'SELECT') return true;
          if (el.isContentEditable) return true;
          return !!el.closest?.('[contenteditable="true"]');
        };
        document.addEventListener('keydown', (e) => {
          if (!(e.ctrlKey || e.metaKey)) return;
          const key = typeof e.key === 'string' ? e.key.toLowerCase() : '';
          if (key !== 'z') return;
          if (isEditableShortcutTarget(e.target)) return;
          const dp = window.__detailsPanel;
          const st = window.__selectionTool;
          if (!dp?.isVisible || !st) return;
          if (e.shiftKey) {
            if (!st.canRedo?.()) return;
            e.preventDefault();
            st.redo();
          } else {
            if (!st.canUndo?.()) return;
            e.preventDefault();
            st.undo();
          }
          dp.updateUndoRedoButtons?.();
        });
      }

      // Init Object Description (설명 추가 / 코멘트)
      objectDescription = new ObjectDescription({
        viewer,
        timeline,
        onRequestRename: () => timeline?.startEditingSelectedObjectName?.(),
        getSelection: () => {
          const id = timeline?.selectedObjectId;
          if (id == null) return null;
          const obj = timeline?.objects?.find(o => o.id === id);
          return obj ? { id: obj.id, name: obj.name ?? '' } : null;
        },
      });
      window.__objectDescription = objectDescription;

      const _odToggle = objectDescription.toggleTooltip.bind(objectDescription);
      objectDescription.toggleTooltip = function wrappedDescriptionToggle() {
        closeAuxGizmoPopovers("description");
        _odToggle();
        if (objectDescription.tooltip?.classList.contains("is-visible")) {
          const descBtn = document.getElementById("gizmoDescriptionBtn");
          if (descBtn) positionAuxFloatingPopover(objectDescription.tooltip, descBtn);
        }
      };

      const gizmoColorTintBtn = document.getElementById("gizmoColorTintBtn");
      const gizmoColorTintPopover = document.getElementById("gizmoColorTintPopover");

      if (gizmoColorTintBtn && gizmoColorTintPopover) {
        gizmoColorTintBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          const open = !gizmoColorTintPopover.classList.contains("is-visible");
          if (open) {
            closeAuxGizmoPopovers("tint");
            window.__updateGizmoTintPopover?.();
            gizmoColorTintPopover.classList.add("is-visible");
            gizmoColorTintBtn.classList.remove("is-off");
            gizmoColorTintBtn.setAttribute("aria-pressed", "true");
            positionAuxFloatingPopover(gizmoColorTintPopover, gizmoColorTintBtn);
          } else {
            gizmoColorTintPopover.classList.remove("is-visible");
            gizmoColorTintBtn.classList.add("is-off");
            gizmoColorTintBtn.setAttribute("aria-pressed", "false");
          }
        });
      }

      document.getElementById("gizmoDescriptionTooltipClose")?.addEventListener("click", (e) => {
        e.stopPropagation();
        objectDescription?.hideTooltip?.();
      });
      document.getElementById("gizmoColorTintPopoverClose")?.addEventListener("click", (e) => {
        e.stopPropagation();
        gizmoColorTintPopover?.classList.remove("is-visible");
        gizmoColorTintBtn?.classList.add("is-off");
        gizmoColorTintBtn?.setAttribute("aria-pressed", "false");
      });

      if (!window.__auxPopoversResizeBound) {
        window.__auxPopoversResizeBound = true;
        window.addEventListener("resize", () => repositionOpenAuxPopovers());
      }

      // 에디터 색지정: objectId별 엔티티 (선택 해제 후에도 맵에 있는 오브젝트는 계속 틴트)
      viewer.setEditorTintEntityResolver?.((objectId) => {
        if (objectId == null) return [];
        const obj = timeline?.objects?.find((o) => o.id === objectId);
        if (!obj) return [];
        if (obj.entity) return [obj.entity];
        if (Array.isArray(obj.files)) return obj.files.map((f) => f?.entity).filter(Boolean);
        return [];
      });

      const gizmoColorTintObjectName = document.getElementById('gizmoColorTintObjectName');
      const EDITOR_TINT_PRESETS = {
        none: null,
        red: { r: 1, g: 0.22, b: 0.22 },
        yellow: { r: 1, g: 0.88, b: 0.25 },
        blue: { r: 0.25, g: 0.55, b: 1 },
        green: { r: 0.2, g: 0.82, b: 0.38 },
      };
      const REVERSE_TINT_PRESETS = new Map();
      Object.entries(EDITOR_TINT_PRESETS).forEach(([key, rgb]) => {
        if (rgb) {
          const k = `${rgb.r},${rgb.g},${rgb.b}`;
          REVERSE_TINT_PRESETS.set(k, key);
        } else {
          REVERSE_TINT_PRESETS.set('null', 'none');
        }
      });
      const syncGizmoTintSwatchSelection = (key) => {
        if (!gizmoColorTintPopover) return;
        gizmoColorTintPopover.querySelectorAll('.gizmo-tint-swatch').forEach((el) => {
          el.classList.toggle('is-selected', el.getAttribute('data-tint') === key);
        });
      };
      const updateGizmoTintPopover = () => {
        const objectId = timeline?.selectedObjectId;
        const obj = objectId ? timeline?.objects?.find((o) => o.id === objectId) : null;
        if (gizmoColorTintObjectName) {
          gizmoColorTintObjectName.textContent = obj?.name || '—';
        }
        if (objectId && viewer) {
          const tintRgb = viewer.getEditorObjectTint?.(objectId);
          let selectedKey = 'none';
          if (tintRgb) {
            const k = `${tintRgb.r},${tintRgb.g},${tintRgb.b}`;
            selectedKey = REVERSE_TINT_PRESETS.get(k) || 'none';
          }
          syncGizmoTintSwatchSelection(selectedKey);
        } else {
          syncGizmoTintSwatchSelection('none');
        }
      };
      if (gizmoColorTintPopover) {
        gizmoColorTintPopover.querySelectorAll('[data-tint]').forEach((sw) => {
          sw.addEventListener('click', (e) => {
            e.stopPropagation();
            const objectId = timeline?.selectedObjectId;
            if (!objectId) return;
            const key = sw.getAttribute('data-tint') || 'none';
            const rgb = EDITOR_TINT_PRESETS[key];
            viewer.setEditorObjectTint?.(objectId, rgb);
            syncGizmoTintSwatchSelection(key);
          });
        });
        window.__updateGizmoTintPopover = updateGizmoTintPopover;
      }

      // Draggable panels
      const cameraPathEditorEl = document.getElementById('cameraPathEditor');
      if (cameraPathEditorEl) {
        makePanelDraggable(cameraPathEditorEl, '.camera-path-editor__drag-handle');
      }

      // Init Selection Tool
      const pcCanvas = document.getElementById('pcCanvas');
      selectionTool = new SelectionTool(viewer, pcCanvas);
      window.__selectionTool = selectionTool;

      // Let viewer/loader clear SelectionTool cache on session dispose
      viewer.setSelectionTool?.(selectionTool);
      
      // Init Camera Settings
      cameraSettings = new CameraSettings(viewer);
      window.__cameraSettings = cameraSettings;
      // Camera settings reset button
      if (cameraSettingsResetBtn) {
        cameraSettingsResetBtn.addEventListener('click', () => {
          cameraSettings.reset();
          // Full camera reset (FOV, frustum, move speed)
          if (viewer && viewer.cameraEntity && viewer.cameraEntity.camera) {
            viewer.cameraEntity.camera.fov = 60;
          }
          window.__frustumScaleFactor = 1.0;
          window.__timeline?._keyframes?._frustumManager?.setScaleFactor?.(1.0);
          if (viewer && typeof viewer.setCameraSpeed === 'function') {
            viewer.setCameraSpeed(1.0);
          }
          if (window.__flyMode && typeof window.__flyMode.setMoveSpeed === 'function') {
            window.__flyMode.setMoveSpeed(1.0);
          }
        });
      }
      
      // Set SelectionTool ref on ObjectDetailsPanel
      detailsPanel.setSelectionTool(selectionTool);

      // Dev: repeat import/dispose test
      window.__devRepeatImportDisposeTest = async (times = 20) => {
        const t = Math.max(1, Math.min(50, Number(times) || 20));
        const pick = async () => {
          return new Promise((resolve) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.ply,.step,.stp,.iges,.igs';
            input.onchange = () => resolve(input.files?.[0] || null);
            input.click();
          });
        };

        const file = await pick();
        if (!file) return;

        for (let i = 0; i < t; i++) {
          await fileLoader.loadFiles([file]);
          // start a new empty session to dispose previous
          window.__loadSessionManager?.beginLoadSession({ source: 'repeat_test_dispose' });
          await new Promise((r) => setTimeout(r, 200));
        }
      };

      // Sphere/box button: spawn wire object and attach gizmo
      detailsPanel.onClearSpatialSelectors = () => {
        clearAllSpatialSelectors();
        detailsPanel.deselectShapeButtons?.();
      };

      detailsPanel.onSphereButtonClick = () => {
        if (!viewer || !window.__viewerReady) return;
        detailsPanel.onButtonClick(3);
      };

      detailsPanel.onCubeButtonClick = () => {
        if (!viewer || !window.__viewerReady) return;
        detailsPanel.onButtonClick(3);
      };
      
      // Details Panel buttons: Selection Tool control
      detailsPanel.onButtonClick = (buttonIndex) => {
        // Button deselected (buttonIndex === null)
        if (buttonIndex === null) {
          selectionTool.deactivate();
          // Remove accumulated blue shapes
          selectionTool?.clearAllAccumulatedVolumesForCurrentSelection?.();
          if (spawnedWireObject) {
            spawnedWireObject.enabled = false;
            spawnedWireObject = null;
            window.spawnedWireObject = null;
            _detachShapeGizmo();
          }
          // Deactivate only current shape (keep per-object cache)
          const selectedObj = viewer?.getSelectedObject?.();
          const key = _getGsplatKeyFromSelectedObject(selectedObj);
          const sphere = wireSphereObjectsByKey.get(key);
          const box = wireBoxObjectsByKey.get(key);
          if (sphere) sphere.enabled = false;
          if (box) box.enabled = false;
          return;
        }

        const modes = ['rectangle', 'brush', 'flood', 'sphere', 'box'];
        const mode = buttonIndex === 3
          ? (detailsPanel?.getVolumeShape?.() ?? 'box')
          : modes[buttonIndex];

        // Deactivate existing shapes (no destroy)
        if (spawnedWireObject) {
          spawnedWireObject.enabled = false;
          spawnedWireObject = null;
          window.spawnedWireObject = null;
          _detachShapeGizmo();
        }

        // rectangle/brush/flood: activate selectionTool, no shape
        // sphere/box: create 3D entity, deactivate selectionTool
        if (['rectangle', 'brush', 'flood'].includes(mode)) {
          // End volume mode: remove accumulated blue shapes
          selectionTool?.clearAllAccumulatedVolumesForCurrentSelection?.();
          selectionTool.activate(mode);
          const selectedObj = viewer?.getSelectedObject?.();
          const key = _getGsplatKeyFromSelectedObject(selectedObj);
          const sphere = wireSphereObjectsByKey.get(key);
          const box = wireBoxObjectsByKey.get(key);
          if (sphere) sphere.enabled = false;
          if (box) box.enabled = false;
          selectorOverlay.hide();
        } else if (mode === 'sphere' || mode === 'box') {
          if (!window.__viewerReady || !viewer.app) return;
          selectionTool.deactivate();
          const selectedObj = viewer?.getSelectedObject?.();
          const key = _getGsplatKeyFromSelectedObject(selectedObj);
          const pos = { x: 0, y: 1, z: 0 };

          let sphere = wireSphereObjectsByKey.get(key);
          if (!sphere) {
            const radius = 1;
            sphere = createWireSphere(viewer.app, pos, radius);
            sphere.__wireRadius = radius;
            viewer.app.root.addChild(sphere);
            wireSphereObjectsByKey.set(key, sphere);
          }
          sphere.enabled = (mode === 'sphere');

          let box = wireBoxObjectsByKey.get(key);
          if (!box) {
            const size = { x: 1, y: 1, z: 1 };
            box = createWireBox(viewer.app, pos, size);
            box.setLocalScale(size.x, size.y, size.z);
            viewer.app.root.addChild(box);
            wireBoxObjectsByKey.set(key, box);
          }
          box.enabled = (mode === 'box');

          const activeWire = mode === 'box' ? box : sphere;
          _setActiveWireObject(activeWire);
          _attachShapeGizmo(spawnedWireObject);
          selectorOverlay.hide();

          if (mode === 'box' && detailsPanel && typeof detailsPanel.setBoxGaugeValues === 'function') {
            const s = box.getLocalScale ? box.getLocalScale() : { x: 1, y: 1, z: 1 };
            detailsPanel.setBoxGaugeValues(s.x ?? 1, s.y ?? 1, s.z ?? 1);
          }
          if (mode === 'sphere' && detailsPanel && typeof detailsPanel.setSphereGaugeValue === 'function') {
            detailsPanel.setSphereGaugeValue(sphere.__wireRadius ?? 1);
          }
          // On shape switch: refresh selection from all blue shapes in world
          if (selectionTool?.refreshSelectionFromAllAccumulatedVolumes) {
            selectionTool.refreshSelectionFromAllAccumulatedVolumes();
          }
        }
        // Same button re-click: deactivate (handled above)
      };
      
      startFpsCounter();
      startCameraInfoDisplay();
    }
  } catch (err) {
  }
}

// Init after DOM ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrap);
} else {
  bootstrap();
}
