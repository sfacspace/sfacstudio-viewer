/**
 * 대시보드 연동: 설비 선택 후 확인 시 배치 모드(오브젝트 위치·이동 기즈모)로 마커 위치 확정,
 * 카메라 상태 저장 → 클릭 시 카메라 복원 + 우측 대시보드 임베드 창
 */

import {
  computeMarkerOffsetLocal,
  ensureMarkerOffsetLocal,
  getPrimaryEntityForObject,
  worldPositionForMarker,
} from './markerAnchor.js';

const _nextId = (() => {
  let n = 0;
  return () => `dblink-${Date.now()}-${++n}`;
})();

const CAMERA_TRANSITION_DURATION_MS = 700;

/** @type {readonly string[]} */
const TWIN_STATUS_ORDER = ['offline', 'idle', 'running', 'warning', 'error'];

const TWIN_STATUS_RANK = /** @type {Record<string, number>} */ (
  TWIN_STATUS_ORDER.reduce((acc, s, i) => {
    acc[s] = i;
    return acc;
  }, {})
);

const GIZMO_TWIN_CLASS_PREFIX = 'gizmo-controls__button--twin-';

/**
 * 오브젝트당·설비당 대시보드 연동을 최대 1개로 정리 (배열 앞쪽 우선, 레거시 프로젝트 로드용)
 * @param {unknown[]} links
 */
export function normalizeDashboardLinksOneToOne(links) {
  if (!Array.isArray(links)) return [];
  const seenObj = new Set();
  const seenMach = new Set();
  const out = [];
  for (const l of links) {
    const oid = l?.objectId != null ? String(l.objectId) : '';
    const mid = l?.machineId != null ? String(l.machineId) : '';
    if (!oid || !mid) continue;
    if (seenObj.has(oid) || seenMach.has(mid)) continue;
    seenObj.add(oid);
    seenMach.add(mid);
    out.push(l);
  }
  return out;
}

/**
 * @typedef {Object} DashboardLinkRecord
 * @property {string} id
 * @property {string} objectId
 * @property {string} objectName
 * @property {string} machineId
 * @property {string} machineName
 * @property {string} [facilityId]
 * @property {{x:number,y:number,z:number}} worldPosition
 * @property {{x:number,y:number,z:number}} [markerOffsetLocal] — 대표 entity 로컬 공간 앵커 (이동·회전 시 마커가 따라감)
 * @property {object} cameraState
 */

export class DashboardLinkMarkers {
  /**
   * @param {{ viewer: import('../core/viewer.js').PlayCanvasViewer | null, timeline: object, getSelection: () => { id: string, name?: string } | null, onPersistableChange?: () => void }} options
   */
  constructor(options = {}) {
    this.viewer = options.viewer ?? null;
    this.timeline = options.timeline ?? null;
    this.getSelection = options.getSelection ?? (() => null);
    /** @type {(() => void) | null} */
    this.onPersistableChange =
      typeof options.onPersistableChange === 'function' ? options.onPersistableChange : null;
    /** @type {import('./markerPlacementMode.js').MarkerPlacementMode | null} */
    this.markerPlacement = null;

    this.btn = document.getElementById('gizmoDashboardBtn');
    this.tooltip = document.getElementById('gizmoDashboardTooltip');
    this.selectEl = /** @type {HTMLSelectElement|null} */ (document.getElementById('gizmoDashboardMachineSelect'));
    this.objectNameEl = document.getElementById('gizmoDashboardObjectName');
    this.confirmBtn = document.getElementById('gizmoDashboardConfirmBtn');
    this.unlinkBtn = document.getElementById('gizmoDashboardUnlinkBtn');
    this.refreshBtn = document.getElementById('gizmoDashboardRefreshBtn');

    /** @type {DashboardLinkRecord[]} */
    this.links = [];
    this._overlay = null;
    /** @type {Map<string, { link: DashboardLinkRecord, el: HTMLButtonElement }>} */
    this._markers = new Map();
    this._rafId = null;
    this._drawer = null;
    this._iframe = null;
    this._openLinkId = null;

    /** @type {Map<string, string>} machineId -> status */
    this._machineStatusById = new Map();
    /** @type {WebSocket|null} */
    this._twinWs = null;
    this._twinWsReconnectTimer = null;
    /** 연동 링크가 있을 때만 true — 의도적 중지 시 재연결 방지 */
    this._twinWsWantConnect = false;

    this._createDrawer();
    this.init();
  }

  /** @param {import('./markerPlacementMode.js').MarkerPlacementMode | null} mp */
  setMarkerPlacement(mp) {
    this.markerPlacement = mp ?? null;
  }

  init() {
    this.confirmBtn?.addEventListener('click', () => this.onConfirmClick());
    this.unlinkBtn?.addEventListener('click', () => this.unlinkSelection());
    this.refreshBtn?.addEventListener('click', () => void this.onRefreshMachinesClick());
    this.selectEl?.addEventListener('change', () => this._syncConfirmEnabled());

    this._createOverlay();
    this._startUpdateLoop();
    this._syncConfirmEnabled();
  }

  _createOverlay() {
    const container = document.getElementById('pc-container');
    if (!container) return;
    const el = document.createElement('div');
    el.id = 'dashboardMarkersOverlay';
    el.className = 'dashboard-markers-overlay';
    container.appendChild(el);
    this._overlay = el;
  }

  _createDrawer() {
    const drawer = document.createElement('div');
    drawer.id = 'dashboardEmbedDrawer';
    drawer.className = 'dashboard-embed-drawer';
    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('aria-modal', 'false');
    drawer.setAttribute('aria-labelledby', 'dashboardEmbedDrawerTitle');
    drawer.innerHTML = `
      <div class="dashboard-embed-drawer__header">
        <span id="dashboardEmbedDrawerTitle" class="dashboard-embed-drawer__title">대시보드</span>
        <div class="dashboard-embed-drawer__header-actions">
          <button type="button" class="dashboard-embed-drawer__unlink" id="dashboardEmbedUnlinkBtn" title="연동 해제" aria-label="연동 해제">
            <svg class="dashboard-embed-drawer__unlink-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="m18.375 12.845-8.25 4.625a1.125 1.125 0 0 1-1.565-.566l-.75-1.875a1.125 1.125 0 0 1 .566-1.565l4.625-2.25m2.25-4.5-4.625 2.25a1.125 1.125 0 0 1-1.565.566l-.75-1.875a1.125 1.125 0 0 1 .566-1.565l8.25-4.625a1.125 1.125 0 0 1 1.565.566l2.25 4.5a1.125 1.125 0 0 1-.566 1.565l-4.625 2.25m-2.25 4.5-2.25 4.5" />
              <path d="M5.25 5.25 19 19" stroke-width="1.75" />
            </svg>
          </button>
          <button type="button" class="dashboard-embed-drawer__close" aria-label="닫기">&times;</button>
        </div>
      </div>
      <iframe class="dashboard-embed-drawer__frame" title="Twin 대시보드" src="about:blank" sandbox="allow-scripts allow-same-origin allow-forms allow-popups"></iframe>
    `;
    document.body.appendChild(drawer);
    this._drawer = drawer;
    this._iframe = /** @type {HTMLIFrameElement|null} */ (drawer.querySelector('.dashboard-embed-drawer__frame'));
    drawer.querySelector('.dashboard-embed-drawer__close')?.addEventListener('click', () => this.closeDrawer());
    drawer.querySelector('#dashboardEmbedUnlinkBtn')?.addEventListener('click', () => this.unlinkEmbedDrawerLink());
  }

  async onRefreshMachinesClick() {
    if (!this.refreshBtn || this.refreshBtn.disabled) return;
    this.refreshBtn.disabled = true;
    this.refreshBtn.classList.add('is-spinning');
    try {
      await this.refreshMachineList();
    } finally {
      this.refreshBtn.classList.remove('is-spinning');
      this.refreshBtn.disabled = false;
    }
  }

  async refreshMachineList() {
    if (!this.selectEl) return;
    this.selectEl.innerHTML = '';
    const ph = document.createElement('option');
    ph.value = '';
    ph.textContent = '불러오는 중…';
    this.selectEl.appendChild(ph);
    this.selectEl.disabled = true;

    const fid = (() => {
      try {
        const v = new URLSearchParams(location.search).get('facilityId');
        return v && String(v).trim() ? String(v).trim() : '';
      } catch {
        return '';
      }
    })();
    const url = fid ? `/api/machines?facilityId=${encodeURIComponent(fid)}` : '/api/machines';

    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error('api');
      const data = await r.json();
      const machines = Array.isArray(data.machines) ? data.machines : [];
      this.selectEl.innerHTML = '';
      const emptyOpt = document.createElement('option');
      emptyOpt.value = '';
      emptyOpt.textContent = machines.length ? '설비 선택…' : '등록된 설비 없음';
      this.selectEl.appendChild(emptyOpt);
      const sel = this.getSelection();
      const selId = sel?.id != null ? String(sel.id) : null;
      for (const m of machines) {
        const mid = m.id != null ? String(m.id) : '';
        if (!mid) continue;
        const takenByOtherObject = this.links.some(
          (l) =>
            String(l.machineId) === mid &&
            (selId == null || String(l.objectId) !== selId),
        );
        if (takenByOtherObject) continue;
        const o = document.createElement('option');
        o.value = mid;
        o.textContent = m.name ? `${m.name} (${mid})` : mid;
        this.selectEl.appendChild(o);
      }
      this.selectEl.disabled = false;
    } catch {
      this.selectEl.innerHTML = '';
      const err = document.createElement('option');
      err.value = '';
      err.textContent = 'Twin API를 불러올 수 없습니다';
      this.selectEl.appendChild(err);
      this.selectEl.disabled = true;
    }
    this._prefillMachineSelectForSelection();
    this._syncConfirmEnabled();
  }

  /** 선택 오브젝트에 이미 연동이 있으면 드롭다운을 해당 설비로 맞춤 */
  _prefillMachineSelectForSelection() {
    if (!this.selectEl) return;
    const sel = this.getSelection();
    const selId = sel?.id != null ? String(sel.id) : '';
    if (!selId) {
      this.selectEl.value = '';
      return;
    }
    const link = this.links.find((l) => String(l.objectId) === selId);
    if (!link) {
      this.selectEl.value = '';
      return;
    }
    const mid = String(link.machineId);
    const hasOpt = Array.from(this.selectEl.options).some((o) => o.value === mid);
    if (hasOpt) this.selectEl.value = mid;
  }

  _syncConfirmEnabled() {
    const sel = this.getSelection();
    const selId = sel?.id != null ? String(sel.id) : '';
    const mid = this.selectEl?.value?.trim() ?? '';
    const existing = selId ? this.links.find((l) => String(l.objectId) === selId) : null;
    const hasLink = !!existing;

    if (this.unlinkBtn) {
      this.unlinkBtn.hidden = !hasLink;
      this.unlinkBtn.disabled = !selId;
    }
    if (this.confirmBtn) {
      if (!selId || !mid) {
        this.confirmBtn.disabled = true;
      } else if (hasLink && String(existing.machineId) === mid) {
        this.confirmBtn.disabled = true;
      } else {
        this.confirmBtn.disabled = false;
      }
    }
  }

  updateFromSelection() {
    const sel = this.getSelection();
    const obj = sel ? (this.timeline?.objects?.find((o) => o.id === sel.id) ?? null) : null;
    const row = this.btn?.closest('.gizmo-controls__dashboard-row');
    const hideRow = !!(obj && obj.visible === false);
    if (row) {
      row.classList.toggle('is-hidden', hideRow);
      row.setAttribute('aria-hidden', hideRow ? 'true' : 'false');
    }
    if (hideRow) {
      this.hideTooltip();
    }

    if (this.objectNameEl) {
      this.objectNameEl.textContent = sel?.name ?? '—';
    }
    this._prefillMachineSelectForSelection();
    this._syncConfirmEnabled();
    this._syncGizmoDashboardButtonLook();
    this._syncDashboardMarkerPlacementPreview();
  }

  hideTooltip() {
    const mp = this.markerPlacement;
    if (mp?.isActive() && mp.getSessionKind() === 'dashboard') {
      mp.cancel();
    }
    if (this.tooltip) this.tooltip.classList.remove('is-visible');
    if (this.btn) {
      this.btn.setAttribute('aria-pressed', 'false');
      this._syncGizmoDashboardButtonLook();
    }
  }

  /** 대시보드 팝오버가 열려 있고 오브젝트가 선택되면 파란 구·기즈모·미리보기 즉시 시작 */
  _syncDashboardMarkerPlacementPreview() {
    const mp = this.markerPlacement;
    if (!mp || !this._overlay || !this.viewer) return;
    const open = !!this.tooltip?.classList.contains('is-visible');
    if (!open) {
      if (mp.isActive() && mp.getSessionKind() === 'dashboard') mp.cancel();
      return;
    }
    const sel = this.getSelection();
    const obj = sel ? (this.timeline?.objects?.find((o) => o.id === sel.id) ?? null) : null;
    if (!sel || !obj) {
      if (mp.isActive() && mp.getSessionKind() === 'dashboard') mp.cancel();
      return;
    }
    if (mp.isActive() && mp.getSessionKind() !== 'dashboard') mp.cancel();

    const finishLink = (worldPosition, cameraState) => {
      const selNow = this.getSelection();
      const mid = this.selectEl?.value?.trim();
      if (!selNow || !mid) return;

      if (this.links.some((l) => String(l.machineId) === mid && String(l.objectId) !== String(selNow.id))) {
        return;
      }
      this.links = this.links.filter((l) => String(l.objectId) !== String(selNow.id));

      let machineName = mid;
      if (this.selectEl) {
        for (let i = 0; i < this.selectEl.options.length; i++) {
          const o = this.selectEl.options[i];
          if (o.value === mid) {
            machineName = (o.textContent || mid).trim();
            break;
          }
        }
      }

      let facilityId = '';
      try {
        const v = new URLSearchParams(location.search).get('facilityId');
        facilityId = v && String(v).trim() ? String(v).trim() : '';
      } catch {
        facilityId = '';
      }

      const objNow = this.timeline?.objects?.find((o) => o.id === selNow.id) ?? null;
      const anchorEntity = getPrimaryEntityForObject(objNow);
      const markerOffsetLocal = anchorEntity
        ? computeMarkerOffsetLocal(anchorEntity, worldPosition.x, worldPosition.y, worldPosition.z)
        : null;

      this.links.push({
        id: _nextId(),
        objectId: selNow.id,
        objectName: selNow.name ?? '',
        machineId: mid,
        machineName,
        facilityId,
        worldPosition,
        ...(markerOffsetLocal ? { markerOffsetLocal } : {}),
        cameraState,
      });

      this._rebuildMarkers();
      this.hideTooltip();
      if (this.selectEl) this.selectEl.value = '';
      this._syncConfirmEnabled();
      this.onPersistableChange?.();
    };

    mp.start({
      anchorTimelineObject: obj,
      overlayMount: this._overlay,
      previewButtonClass: 'dashboard-link-marker marker-placement-preview',
      previewInnerHtml: '<span class="dashboard-link-marker__icon" aria-hidden="true"></span>',
      sessionKind: 'dashboard',
      onCommit: finishLink,
      onCancel: () => {},
    });
  }

  unlinkSelection() {
    const sel = this.getSelection();
    if (!sel?.id) return;
    const sid = String(sel.id);
    const before = this.links.length;
    this.links = this.links.filter((l) => String(l.objectId) !== sid);
    if (this.links.length === before) return;
    if (this._openLinkId && !this.links.some((l) => l.id === this._openLinkId)) {
      this.closeDrawer();
    }
    this._rebuildMarkers();
    if (this.selectEl) this.selectEl.value = '';
    void this.refreshMachineList();
    this._syncGizmoDashboardButtonLook();
    this._syncDashboardMarkerPlacementPreview();
    this.onPersistableChange?.();
  }

  onConfirmClick() {
    if (this.confirmBtn?.disabled) return;
    const sel = this.getSelection();
    if (!sel || !this.viewer) return;
    const mid = this.selectEl?.value?.trim();
    if (!mid) return;

    if (this.markerPlacement?.isActive() && this.markerPlacement.getSessionKind() === 'dashboard') {
      this.markerPlacement.commit();
      return;
    }

    if (this.links.some((l) => String(l.machineId) === mid && String(l.objectId) !== String(sel.id))) {
      return;
    }

    this.links = this.links.filter((l) => String(l.objectId) !== String(sel.id));

    let machineName = mid;
    if (this.selectEl) {
      for (let i = 0; i < this.selectEl.options.length; i++) {
        const o = this.selectEl.options[i];
        if (o.value === mid) {
          machineName = (o.textContent || mid).trim();
          break;
        }
      }
    }

    let facilityId = '';
    try {
      const v = new URLSearchParams(location.search).get('facilityId');
      facilityId = v && String(v).trim() ? String(v).trim() : '';
    } catch {
      facilityId = '';
    }

    const obj = this.timeline?.objects?.find((o) => o.id === sel.id) ?? null;

    const finishLink = (worldPosition, cameraState) => {
      const anchorEntity = getPrimaryEntityForObject(obj);
      const markerOffsetLocal = anchorEntity
        ? computeMarkerOffsetLocal(anchorEntity, worldPosition.x, worldPosition.y, worldPosition.z)
        : null;

      this.links.push({
        id: _nextId(),
        objectId: sel.id,
        objectName: sel.name ?? '',
        machineId: mid,
        machineName,
        facilityId,
        worldPosition,
        ...(markerOffsetLocal ? { markerOffsetLocal } : {}),
        cameraState,
      });

      this._rebuildMarkers();
      this.hideTooltip();
      if (this.selectEl) this.selectEl.value = '';
      this._syncConfirmEnabled();
      this.onPersistableChange?.();
    };

    if (this.markerPlacement && obj && this._overlay) {
      const started = this.markerPlacement.start({
        anchorTimelineObject: obj,
        overlayMount: this._overlay,
        previewButtonClass: 'dashboard-link-marker marker-placement-preview',
        previewInnerHtml: '<span class="dashboard-link-marker__icon" aria-hidden="true"></span>',
        sessionKind: 'dashboard',
        onCommit: finishLink,
        onCancel: () => {},
      });
      if (started) return;
    }

    const worldPosition = this.viewer._orbitTarget
      ? { ...this.viewer._orbitTarget }
      : { x: 0, y: 0, z: 0 };
    const cameraState = this.viewer.getCameraState?.();
    if (!cameraState) return;
    finishLink(worldPosition, cameraState);
  }

  _twinWsUrl() {
    const proto = typeof location !== 'undefined' && location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = typeof location !== 'undefined' ? location.host : '';
    return `${proto}//${host}/ws`;
  }

  _stopTwinStatusStream() {
    this._twinWsWantConnect = false;
    if (this._twinWsReconnectTimer != null) {
      clearTimeout(this._twinWsReconnectTimer);
      this._twinWsReconnectTimer = null;
    }
    if (this._twinWs) {
      try {
        this._twinWs.close();
      } catch {
        /* ignore */
      }
      this._twinWs = null;
    }
  }

  _scheduleTwinWsReconnect() {
    if (this.links.length === 0) return;
    if (this._twinWsReconnectTimer != null) return;
    this._twinWsReconnectTimer = setTimeout(() => {
      this._twinWsReconnectTimer = null;
      this._startTwinStatusStream();
    }, 2200);
  }

  _startTwinStatusStream() {
    if (this.links.length === 0) {
      this._stopTwinStatusStream();
      return;
    }
    if (typeof WebSocket === 'undefined') return;
    if (this._twinWs && (this._twinWs.readyState === WebSocket.OPEN || this._twinWs.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this._twinWsWantConnect = true;
    let ws;
    try {
      ws = new WebSocket(this._twinWsUrl());
    } catch {
      this._scheduleTwinWsReconnect();
      return;
    }
    this._twinWs = ws;

    ws.addEventListener('message', (ev) => {
      let msg;
      try {
        msg = JSON.parse(String(ev.data));
      } catch {
        return;
      }
      if (msg?.type === 'robot_position') {
        const mid = String(msg.machineId || '').trim();
        const x = Number(msg.x);
        const z = Number(msg.z);
        if (mid && Number.isFinite(x) && Number.isFinite(z)) {
          this._applyRobotPositionToLinkedObject(mid, x, z);
        }
        return;
      }
      if (msg?.type !== 'state' || !Array.isArray(msg.machines)) return;
      for (const m of msg.machines) {
        if (m?.id && m?.status != null) {
          this._machineStatusById.set(String(m.id), String(m.status));
        }
      }
      this._applyMachineStatusesToUi();
    });

    ws.addEventListener('close', () => {
      this._twinWs = null;
      if (this._twinWsWantConnect && this.links.length > 0) {
        this._scheduleTwinWsReconnect();
      }
    });

    ws.addEventListener('error', () => {
      try {
        ws.close();
      } catch {
        /* ignore */
      }
    });
  }

  async _fetchMachineStatusesOnce() {
    if (this.links.length === 0) return;
    const fid = (() => {
      try {
        const v = new URLSearchParams(location.search).get('facilityId');
        return v && String(v).trim() ? String(v).trim() : '';
      } catch {
        return '';
      }
    })();
    const url = fid ? `/api/machines?facilityId=${encodeURIComponent(fid)}` : '/api/machines';
    try {
      const r = await fetch(url);
      if (!r.ok) return;
      const data = await r.json();
      const machines = Array.isArray(data.machines) ? data.machines : [];
      for (const m of machines) {
        if (m?.id && m?.status != null) {
          this._machineStatusById.set(String(m.id), String(m.status));
        }
      }
      this._applyMachineStatusesToUi();
    } catch {
      /* Twin 미연결 시 무시 */
    }
  }

  _syncTwinStreamForLinks() {
    if (this.links.length === 0) {
      this._stopTwinStatusStream();
      this._machineStatusById.clear();
      this._applyMachineStatusesToUi();
      return;
    }
    this._startTwinStatusStream();
    void this._fetchMachineStatusesOnce();
  }

  /** @param {string|undefined} s */
  _normalizeTwinStatus(s) {
    const v = String(s || '').trim();
    if (TWIN_STATUS_RANK[v] !== undefined) return v;
    return 'unknown';
  }

  _selectionHasDashboardLink() {
    const sel = this.getSelection();
    if (!sel?.id) return false;
    return this.links.some((l) => l.objectId === sel.id);
  }

  /** 선택 오브젝트에 연동된 설비들 중 가장 심각한 상태 */
  _worstTwinStatusForSelection() {
    const sel = this.getSelection();
    if (!sel?.id) return 'unknown';
    let bestRank = -1;
    let status = 'unknown';
    for (const l of this.links) {
      if (l.objectId !== sel.id) continue;
      const st = this._normalizeTwinStatus(this._machineStatusById.get(l.machineId));
      const r = TWIN_STATUS_RANK[st];
      if (r !== undefined && r > bestRank) {
        bestRank = r;
        status = st;
      }
    }
    return status;
  }

  _clearGizmoTwinModifierClasses() {
    if (!this.btn) return;
    for (const s of TWIN_STATUS_ORDER) {
      this.btn.classList.remove(`${GIZMO_TWIN_CLASS_PREFIX}${s}`);
    }
    this.btn.classList.remove(`${GIZMO_TWIN_CLASS_PREFIX}unknown`);
  }

  _syncGizmoDashboardButtonLook() {
    if (!this.btn) return;
    const tooltipOpen = !!this.tooltip?.classList.contains('is-visible');
    const hasLink = this._selectionHasDashboardLink();

    this._clearGizmoTwinModifierClasses();

    if (tooltipOpen) {
      this.btn.classList.remove('is-off');
      return;
    }
    if (hasLink) {
      this.btn.classList.remove('is-off');
      const st = this._worstTwinStatusForSelection();
      this.btn.classList.add(`${GIZMO_TWIN_CLASS_PREFIX}${st}`);
      return;
    }
    this.btn.classList.add('is-off');
  }

  _applyMarkerStatusClass(el, link) {
    const raw = this._machineStatusById.get(link.machineId);
    const st = this._normalizeTwinStatus(raw);
    for (const s of TWIN_STATUS_ORDER) {
      el.classList.remove(`dashboard-link-marker--${s}`);
    }
    el.classList.remove('dashboard-link-marker--unknown');
    el.classList.add(`dashboard-link-marker--${st}`);
    const label = st === 'unknown' ? link.machineName : `${link.machineName} · ${st}`;
    el.setAttribute('aria-label', `대시보드: ${label}`);
  }

  _applyMachineStatusesToUi() {
    this._markers.forEach(({ link, el }) => {
      this._applyMarkerStatusClass(el, link);
    });
    this._syncGizmoDashboardButtonLook();
  }

  /**
   * Twin WS `robot_position`: 연동된 오브젝트 로컬 XZ만 갱신 (Y 유지)
   * @param {string} machineId
   * @param {number} x
   * @param {number} z
   */
  _applyRobotPositionToLinkedObject(machineId, x, z) {
    if (!this.timeline?.objects?.length) return;
    const link = this.links.find((l) => l.machineId === machineId);
    if (!link) return;
    const obj = this.timeline.objects.find((o) => o.id === link.objectId);
    if (!obj) return;
    const entity = getPrimaryEntityForObject(obj);
    if (!entity) return;
    const pos = entity.getLocalPosition();
    entity.setLocalPosition(x, pos.y, z);
    if (typeof this.viewer?.renderNextFrame !== 'undefined') {
      this.viewer.renderNextFrame = true;
    }
    if (this.timeline.selectedObjectId === link.objectId) {
      window.__inspector?.show?.(obj);
      window.__inspector?._updateFieldsFromEntity?.();
    }
  }

  _rebuildMarkers() {
    if (!this._overlay) return;
    this._overlay.innerHTML = '';
    this._markers.clear();
    this.links.forEach((link) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'dashboard-link-marker';
      btn.dataset.linkId = link.id;
      btn.setAttribute('aria-label', `대시보드: ${link.machineName}`);
      btn.innerHTML = '<span class="dashboard-link-marker__icon" aria-hidden="true"></span>';
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this._onMarkerClick(link, btn);
      });
      this._overlay.appendChild(btn);
      this._markers.set(link.id, { link, el: btn });
      this._applyMarkerStatusClass(btn, link);
    });
    this._syncTwinStreamForLinks();
    this._syncGizmoDashboardButtonLook();
  }

  _startUpdateLoop() {
    const update = () => {
      this._rafId = requestAnimationFrame(update);
      this._updateMarkerPositions();
    };
    update();
  }

  _updateMarkerPositions() {
    if (!this.viewer?.cameraEntity?.camera || !this._overlay) return;
    const camera = this.viewer.cameraEntity.camera;
    const canvas = this.viewer.canvas;
    if (!canvas) return;
    const pc = window.pc;
    if (!pc) return;

    const worldPos = new pc.Vec3();
    const screenPos = new pc.Vec3();

    this._markers.forEach(({ link, el }) => {
      ensureMarkerOffsetLocal(link, this.timeline);
      const obj = this.timeline?.objects?.find((o) => o.id === link.objectId) ?? null;
      const ent = getPrimaryEntityForObject(obj);
      worldPositionForMarker(ent, link.markerOffsetLocal, link.worldPosition, worldPos);
      camera.worldToScreen(worldPos, screenPos);
      if (screenPos.z < 0) {
        el.style.display = 'none';
        return;
      }
      const size = 40;
      el.style.display = '';
      el.style.left = `${screenPos.x - size / 2}px`;
      el.style.top = `${screenPos.y - size / 2}px`;
    });
  }

  _runCameraTransitionLoop(startPos, startYaw, startPitch, startRoll, targetState) {
    const cam = this.viewer?.cameraEntity;
    const pc = typeof window !== 'undefined' ? window.pc : null;
    if (!cam || !pc) return;

    const startQuat = cam.getRotation().clone();
    let targetQuat;
    if (targetState.rotation && typeof targetState.rotation.w === 'number') {
      targetQuat = new pc.Quat(
        targetState.rotation.x,
        targetState.rotation.y,
        targetState.rotation.z,
        targetState.rotation.w,
      );
    } else {
      const endPitch = typeof targetState.pitch === 'number' ? -targetState.pitch : 0;
      const endYaw = typeof targetState.yaw === 'number' ? targetState.yaw : 0;
      targetQuat = new pc.Quat();
      targetQuat.setFromEulerAngles(endPitch, endYaw, 0);
    }
    if (
      startQuat.x * targetQuat.x + startQuat.y * targetQuat.y + startQuat.z * targetQuat.z + startQuat.w * targetQuat.w <
      0
    ) {
      targetQuat.x *= -1;
      targetQuat.y *= -1;
      targetQuat.z *= -1;
      targetQuat.w *= -1;
    }

    const startTime = performance.now();

    const tick = () => {
      if (!this.viewer?.cameraEntity) return;

      const elapsed = performance.now() - startTime;
      let t = Math.min(1, elapsed / CAMERA_TRANSITION_DURATION_MS);
      t = 1 - (1 - t) ** 3;

      const x = startPos.x + (targetState.position.x - startPos.x) * t;
      const y = startPos.y + (targetState.position.y - startPos.y) * t;
      const z = startPos.z + (targetState.position.z - startPos.z) * t;
      cam.setPosition(x, y, z);

      const q = new pc.Quat();
      q.slerp(startQuat, targetQuat, t);
      cam.setRotation(q);

      if (typeof this.viewer.renderNextFrame !== 'undefined') {
        this.viewer.renderNextFrame = true;
      }

      if (t >= 1) {
        this.viewer._cameraTransitionActive = false;
        this.viewer.setCameraState(targetState);
        return;
      }
      requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }

  _onMarkerClick(link, markerEl) {
    if (!this.viewer || !this.timeline) return;

    window.__objectDescription?._closeDescriptionPanel?.();

    this.timeline.selectObject(link.objectId);

    const targetState = link.cameraState;
    if (!targetState?.position) {
      this.viewer.setCameraState(link.cameraState);
      this._openDrawerForLink(link, markerEl);
      return;
    }

    const cam = this.viewer.cameraEntity;
    if (!cam) {
      this.viewer.setCameraState(link.cameraState);
      this._openDrawerForLink(link, markerEl);
      return;
    }

    const pos = cam.getPosition();
    const euler = cam.getLocalEulerAngles();
    const startPos = { x: pos.x, y: pos.y, z: pos.z };

    this.viewer._cameraTransitionActive = true;
    this._runCameraTransitionLoop(startPos, euler.y, euler.x, euler.z, targetState);

    this._openDrawerForLink(link, markerEl);
  }

  _dashboardUrlForLink(link) {
    const u = new URL('/', window.location.origin);
    if (link.facilityId) u.searchParams.set('facilityId', link.facilityId);
    u.searchParams.set('focusMachine', link.machineId);
    u.searchParams.set('embed', 'detail');
    return u.toString();
  }

  _openDrawerForLink(link, _markerEl) {
    this._openLinkId = link.id;
    if (this._iframe) {
      this._iframe.src = this._dashboardUrlForLink(link);
    }
    this._drawer?.classList.add('is-open');
  }

  /** 임베드 대시보드 헤더의 연동 해제 — 확인 시 현재 열린 링크만 제거 */
  unlinkEmbedDrawerLink() {
    if (!this._openLinkId) return;
    const link = this.links.find((l) => l.id === this._openLinkId);
    if (!link) return;
    const label = (link.machineName && String(link.machineName).trim()) || link.machineId || '설비';
    const ok = window.confirm(
      `「${label}」와 이 오브젝트의 대시보드 연동을 해제할까요?\n연동 해제 후에는 씬에서 마커가 사라지며, 필요 시 다시 연동할 수 있습니다.`,
    );
    if (!ok) return;
    this.links = this.links.filter((l) => l.id !== this._openLinkId);
    this.closeDrawer();
    this._rebuildMarkers();
    void this.refreshMachineList();
    this._syncGizmoDashboardButtonLook();
    this._syncDashboardMarkerPlacementPreview();
    this.onPersistableChange?.();
  }

  closeDrawer() {
    this._openLinkId = null;
    this._drawer?.classList.remove('is-open');
    if (this._iframe) {
      this._iframe.src = 'about:blank';
    }
    if (this.timeline?.clearSelection) {
      this.timeline.clearSelection();
    }
  }

  /**
   * @param {string} objectId
   */
  removeLinksForObjectId(objectId) {
    if (objectId == null || objectId === '') return;
    const sid = String(objectId);
    const before = this.links.length;
    this.links = this.links.filter((l) => String(l.objectId) !== sid);
    if (this.links.length !== before) {
      if (this._openLinkId && !this.links.some((l) => l.id === this._openLinkId)) {
        this.closeDrawer();
      }
      this._rebuildMarkers();
    }
  }

  destroy() {
    this._stopTwinStatusStream();
    if (this._rafId != null) cancelAnimationFrame(this._rafId);
    if (this.viewer) this.viewer._cameraTransitionActive = false;
    this._overlay?.remove();
    this._drawer?.remove();
    this._markers.clear();
  }
}
