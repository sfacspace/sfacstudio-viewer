/**
 * 왼쪽·오른쪽 사이드바, 상단 타임라인 표시 토글 및 패널 크롬 동기화.
 */

/**
 * @typedef {Object} PanelToggleDeps
 * @property {() => import('../core/viewer.js').PlayCanvasViewer|null} getViewer
 * @property {() => boolean} isViewerReady
 * @property {() => import('./gizmo.js').GizmoController|null} getGizmo
 * @property {() => import('./inspector.js').InspectorController|null} getInspector
 * @property {() => import('./objectDetailsPanel.js').ObjectDetailsPanel|null} getDetailsPanel
 * @property {() => any} getTimeline
 * @property {() => string|null} getActiveGizmoMode
 * @property {{ hide: () => void }} selectorOverlay
 * @property {(except?: string|null) => void} closeAuxGizmoPopovers
 * @property {() => void} syncSettingsModalSwitches
 */

/** @type {PanelToggleDeps|null} */
let deps = null;

const panelsToggleEl = document.getElementById("panelsToggle");
const objectsPanelEl = document.getElementById("objectsPanel");
const rightToolsPanelEl = document.getElementById("rightToolsPanel");
const timelineBottomEl = document.getElementById("timeline-bottom");
const toggleLeftSidebarBtn = document.getElementById("toggleLeftSidebar");
const toggleTopTimelineBtn = document.getElementById("toggleTopTimeline");
const toggleRightSidebarBtn = document.getElementById("toggleRightSidebar");

let leftSidebarVisible = true;
let timelineUiVisible = true;
let rightSidebarVisible = true;

/** 왼쪽·오른쪽 패널이 모두 켜진 여부 (설정 스위치·단축키 P·하단 토글과 동기화) */
let panelsVisible = true;

function syncPanelsVisibleFlag() {
  panelsVisible = leftSidebarVisible && rightSidebarVisible;
}

export function areBothSidePanelsVisible() {
  return leftSidebarVisible && rightSidebarVisible;
}

export function isRightSidebarVisible() {
  return rightSidebarVisible;
}

/**
 * 설정 모달에서 양쪽 사이드바만 동시에 켜거나 끔.
 * @param {boolean} want
 */
export function setBothSidePanelsFromSettings(want) {
  const bothOn = leftSidebarVisible && rightSidebarVisible;
  if (want !== bothOn) {
    leftSidebarVisible = want;
    rightSidebarVisible = want;
    applyPanelChromeVisibility();
  }
}

export function applyPanelChromeVisibility() {
  if (!deps) return;

  syncPanelsVisibleFlag();

  objectsPanelEl?.classList.toggle("is-hidden", !leftSidebarVisible);
  rightToolsPanelEl?.classList.toggle("is-hidden", !rightSidebarVisible);
  timelineBottomEl?.classList.toggle("is-hidden", !timelineUiVisible);

  objectsPanelEl?.setAttribute("aria-hidden", leftSidebarVisible ? "false" : "true");
  rightToolsPanelEl?.setAttribute("aria-hidden", rightSidebarVisible ? "false" : "true");
  timelineBottomEl?.setAttribute("aria-hidden", timelineUiVisible ? "false" : "true");

  const anyPanelChrome = leftSidebarVisible || rightSidebarVisible || timelineUiVisible;
  const viewer = deps.getViewer();
  if (viewer && deps.isViewerReady()) {
    viewer.setAxisGizmoVisible(anyPanelChrome);
  }

  if (!rightSidebarVisible) {
    deps.closeAuxGizmoPopovers(null);
    deps.selectorOverlay.hide();
  }

  syncGizmoInspectorDetailsFromPanels();

  if (panelsToggleEl) {
    panelsToggleEl.classList.toggle("is-off", !panelsVisible);
    panelsToggleEl.setAttribute("aria-pressed", panelsVisible ? "true" : "false");
  }

  if (toggleLeftSidebarBtn) {
    toggleLeftSidebarBtn.classList.toggle("is-off", !leftSidebarVisible);
    toggleLeftSidebarBtn.setAttribute("aria-pressed", leftSidebarVisible ? "true" : "false");
  }
  if (toggleTopTimelineBtn) {
    toggleTopTimelineBtn.classList.toggle("is-off", !timelineUiVisible);
    toggleTopTimelineBtn.setAttribute("aria-pressed", timelineUiVisible ? "true" : "false");
  }
  if (toggleRightSidebarBtn) {
    toggleRightSidebarBtn.classList.toggle("is-off", !rightSidebarVisible);
    toggleRightSidebarBtn.setAttribute("aria-pressed", rightSidebarVisible ? "true" : "false");
  }

  deps.syncSettingsModalSwitches();
}

export function togglePanels() {
  const next = !panelsVisible;
  leftSidebarVisible = next;
  rightSidebarVisible = next;
  applyPanelChromeVisibility();
}

export function updateGizmoControlsVisibility() {
  applyPanelChromeVisibility();
}

function syncGizmoInspectorDetailsFromPanels() {
  updateGizmo3DVisibility();
  updateInspectorVisibility();
  updateDetailsPanelVisibility();
}

function updateGizmo3DVisibility() {
  if (!deps) return;
  const gizmo = deps.getGizmo();
  if (!gizmo) return;
  if (!rightSidebarVisible) {
    gizmo.setMode(null);
    deps.selectorOverlay.hide();
    return;
  }
  const timeline = deps.getTimeline();
  const mode = deps.getActiveGizmoMode();
  if (mode && timeline?.selectedObjectId) {
    const obj = timeline.objects?.find((o) => o.id === timeline.selectedObjectId);
    if (obj) {
      gizmo.setTarget(obj);
      gizmo.setMode(mode);
    }
  }
}

function updateInspectorVisibility() {
  if (!deps) return;
  const inspector = deps.getInspector();
  if (!inspector) return;
  const timeline = deps.getTimeline();
  const selectedId = timeline?.selectedObjectId;
  if (selectedId && timeline?.objects) {
    const obj = timeline.objects.find((o) => o.id === selectedId);
    if (obj) {
      inspector.show(obj);
      return;
    }
  }
  inspector.hide();
}

function updateDetailsPanelVisibility() {
  if (!deps) return;
  const detailsPanel = deps.getDetailsPanel();
  if (!detailsPanel) return;
  const timeline = deps.getTimeline();
  if (rightSidebarVisible) {
    const selectedId = timeline?.selectedObjectId;
    if (selectedId && timeline?.objects) {
      const obj = timeline.objects.find((o) => o.id === selectedId);
      if (obj) {
        detailsPanel.show();
        return;
      }
    }
    detailsPanel.hide();
  } else {
    detailsPanel.hide();
  }
}

/**
 * @param {PanelToggleDeps} nextDeps
 */
export function initPanelToggles(nextDeps) {
  deps = nextDeps;

  panelsToggleEl?.addEventListener("click", togglePanels);

  toggleLeftSidebarBtn?.addEventListener("click", () => {
    leftSidebarVisible = !leftSidebarVisible;
    applyPanelChromeVisibility();
  });
  toggleTopTimelineBtn?.addEventListener("click", () => {
    timelineUiVisible = !timelineUiVisible;
    applyPanelChromeVisibility();
  });
  toggleRightSidebarBtn?.addEventListener("click", () => {
    rightSidebarVisible = !rightSidebarVisible;
    applyPanelChromeVisibility();
  });

  applyPanelChromeVisibility();
}
