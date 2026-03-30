/**
 * 왼쪽 계층 패널 너비: 드래그 핸들 + localStorage (오른쪽 아이콘 열은 고정 너비).
 */

const STORAGE_OBJECTS = 'sfacstudio_objects_panel_width_px';

const DEFAULT_OBJECTS = 288;
const MIN_WIDTH = 200;
const MAX_WIDTH = 720;
const MIN_CENTER_STRIP_PX = 120;

function maxWidthForWindow() {
  return Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, window.innerWidth - MIN_CENTER_STRIP_PX));
}

function clampWidth(px) {
  return Math.round(Math.max(MIN_WIDTH, Math.min(maxWidthForWindow(), px)));
}

function applyVar(name, px) {
  const w = clampWidth(px);
  document.documentElement.style.setProperty(name, `${w}px`);
  return w;
}

function readStored(key, fallback) {
  try {
    const v = parseInt(localStorage.getItem(key) || '', 10);
    if (!Number.isFinite(v)) return fallback;
    return clampWidth(v);
  } catch {
    return fallback;
  }
}

function saveStored(key, px) {
  try {
    localStorage.setItem(key, String(px));
  } catch (_) {
    /* ignore */
  }
}

export function restoreObjectsPanelWidthFromStorage() {
  applyVar('--objects-panel-width', readStored(STORAGE_OBJECTS, DEFAULT_OBJECTS));
}

export function restoreAllSidePanelWidthsFromStorage() {
  restoreObjectsPanelWidthFromStorage();
}

/**
 * @param {() => object | null | undefined} getViewer
 */
export function attachObjectsPanelResize(getViewer) {
  const handle = document.getElementById('objectsPanelResizeHandle');
  if (!handle || handle._resizeBound) return;
  handle._resizeBound = true;

  let startX = 0;
  let startW = 0;
  let raf = 0;

  const scheduleViewerResize = () => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      try {
        getViewer()?.resize?.();
      } catch (_) {
        /* ignore */
      }
      try {
        const tl = window.__timeline;
        tl?.renderKeyframeMarkers?.();
        tl?._pin?.refreshPositionOnResize?.();
      } catch (_) {
        /* ignore */
      }
    });
  };

  const readW = () => {
    const raw = getComputedStyle(document.documentElement).getPropertyValue('--objects-panel-width').trim();
    const n = parseInt(raw, 10);
    return Number.isFinite(n) ? n : DEFAULT_OBJECTS;
  };

  const onMove = (e) => {
    const dx = e.clientX - startX;
    applyVar('--objects-panel-width', startW + dx);
    scheduleViewerResize();
  };

  const onUp = () => {
    document.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerup', onUp);
    document.removeEventListener('pointercancel', onUp);
    document.body.classList.remove('is-resizing-objects-panel');
    const w = readW();
    saveStored(STORAGE_OBJECTS, clampWidth(w));
    try {
      getViewer()?.resize?.();
    } catch (_) {
      /* ignore */
    }
  };

  handle.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    startW = readW();
    startX = e.clientX;
    document.body.classList.add('is-resizing-objects-panel');
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
    document.addEventListener('pointercancel', onUp);
    try {
      handle.setPointerCapture(e.pointerId);
    } catch (_) {
      /* ignore */
    }
  });

  window.addEventListener('resize', () => {
    applyVar('--objects-panel-width', readW());
    try {
      getViewer()?.resize?.();
    } catch (_) {
      /* ignore */
    }
    try {
      const tl = window.__timeline;
      tl?.renderKeyframeMarkers?.();
      tl?._pin?.refreshPositionOnResize?.();
    } catch (_) {
      /* ignore */
    }
  });
}
