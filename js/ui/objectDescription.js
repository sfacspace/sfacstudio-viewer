/**
 * ObjectDescription - 기즈모 패널의 "설명 추가" + 3D 월드 코멘트 마커
 * 추가 시: 선택 오브젝트 위치에서 배치 모드(이동 기즈모·미리보기) 후 확정 시 월드 좌표·카메라 저장
 * 월드: 2D 말풍선 버튼 항상 맨 위 렌더, 클릭 시 카메라 복원 + 오른쪽 설명 창
 */

import { t } from '../i18n.js';
import {
  computeMarkerOffsetLocal,
  ensureMarkerOffsetLocal,
  getPrimaryEntityForObject,
  worldPositionForMarker,
} from './markerAnchor.js';

const _nextId = (() => { let n = 0; return () => `comment-${Date.now()}-${++n}`; })();

const CAMERA_TRANSITION_DURATION_MS = 700;

export class ObjectDescription {
  constructor(options = {}) {
    this.getSelection = options.getSelection ?? (() => null);
    this.viewer = options.viewer ?? null;
    this.timeline = options.timeline ?? null;
    /** @type {(() => void) | null} */
    this.onRequestRename = typeof options.onRequestRename === "function" ? options.onRequestRename : null;
    /** @type {(() => void) | null} */
    this.onPersistableChange =
      typeof options.onPersistableChange === 'function' ? options.onPersistableChange : null;
    /** @type {import('./markerPlacementMode.js').MarkerPlacementMode | null} */
    this.markerPlacement = null;

    this.btn = document.getElementById('gizmoDescriptionBtn');
    this.tooltip = document.getElementById('gizmoDescriptionTooltip');
    this.objectNameEl = document.getElementById('gizmoDescriptionObjectName');
    this.titleInput = document.getElementById('gizmoDescriptionTitleInput');
    this.descriptionInput = document.getElementById('gizmoDescriptionInput');
    this.addBtn = document.getElementById('gizmoDescriptionAddBtn');

    /** @type {Array<{id:string, objectId:string, objectName:string, title:string, worldPosition:{x,y,z}, markerOffsetLocal?:{x:number,y:number,z:number}, cameraState:object, description:string}>} */
    this.comments = [];
    this._overlay = null;
    this._markers = new Map();
    this._panel = null;
    this._panelTitle = null;
    this._panelText = null;
    this._panelClose = null;
    /** @type {string|null} 열린 코멘트 ID (말풍선 위치 추적용) */
    this._openCommentId = null;
    this._rafId = null;
    this.init();
  }

  /** @param {import('./markerPlacementMode.js').MarkerPlacementMode | null} mp */
  setMarkerPlacement(mp) {
    this.markerPlacement = mp ?? null;
  }

  init() {
    if (this.btn && this.tooltip) {
      this.btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleTooltip();
      });
    }

    if (this.addBtn) {
      this.addBtn.addEventListener('click', () => this.onAddClick());
    }

    this._createOverlay();
    this._createDescriptionPanel();
    this._startUpdateLoop();
    this.updateFromSelection();

    if (this.objectNameEl && this.onRequestRename) {
      this.objectNameEl.style.cursor = "text";
      this.objectNameEl.title = t("panel.objectDoubleClickRename");
      this.objectNameEl.addEventListener("dblclick", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.onRequestRename?.();
      });
    }
  }

  _createOverlay() {
    const container = document.getElementById('pc-container');
    if (!container) return;
    const el = document.createElement('div');
    el.id = 'commentMarkersOverlay';
    el.className = 'comment-markers-overlay';
    container.appendChild(el);
    this._overlay = el;
  }

  _createDescriptionPanel() {
    const panel = document.createElement('div');
    panel.id = 'commentDescriptionPanel';
    panel.className = 'comment-description-panel';
    panel.setAttribute('aria-hidden', 'true');
    panel.innerHTML = `
      <div class="comment-description-panel__header">
        <span class="comment-description-panel__title">설명</span>
        <button type="button" class="comment-description-panel__close" aria-label="닫기">&times;</button>
      </div>
      <div class="comment-description-panel__body"></div>
      <div class="comment-description-panel__footer">
        <button type="button" class="comment-description-panel__delete" aria-label="코멘트 삭제">삭제</button>
      </div>
    `;
    document.body.appendChild(panel);
    this._panel = panel;
    this._panelTitle = panel.querySelector('.comment-description-panel__title');
    this._panelText = panel.querySelector('.comment-description-panel__body');
    this._panelClose = panel.querySelector('.comment-description-panel__close');
    this._panelDelete = panel.querySelector('.comment-description-panel__delete');
    if (this._panelClose) {
      this._panelClose.addEventListener('click', () => this._closeDescriptionPanel());
    }
    if (this._panelDelete) {
      this._panelDelete.addEventListener('click', () => this._deleteCurrentComment());
    }
  }

  _rebuildMarkers() {
    if (!this._overlay) return;
    this._overlay.innerHTML = '';
    this._markers.clear();
    const pc = window.pc;
    if (!pc) return;

    this.comments.forEach((comment) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'comment-marker comment-marker--bubble';
      btn.dataset.commentId = comment.id;
      btn.setAttribute('aria-label', '코멘트 보기');
      btn.innerHTML = '<span class="comment-marker__icon" aria-hidden="true"></span>';
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this._onMarkerClick(comment, btn);
      });
      this._overlay.appendChild(btn);
      this._markers.set(comment.id, { comment, el: btn });
    });
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

    const w = canvas.clientWidth || canvas.width;
    const h = canvas.clientHeight || canvas.height;
    const pc = window.pc;
    if (!pc) return;

    const worldPos = new pc.Vec3();
    const screenPos = new pc.Vec3();

    this._markers.forEach(({ comment, el }) => {
      ensureMarkerOffsetLocal(comment, this.timeline);
      const obj = this.timeline?.objects?.find((o) => o.id === comment.objectId) ?? null;
      const ent = getPrimaryEntityForObject(obj);
      worldPositionForMarker(ent, comment.markerOffsetLocal, comment.worldPosition, worldPos);
      camera.worldToScreen(worldPos, screenPos);
      if (screenPos.z < 0) {
        el.style.display = 'none';
        return;
      }
      const x = screenPos.x;
      const y = screenPos.y;
      const top = y;
      const size = 40;
      el.style.display = '';
      el.style.left = `${x - size / 2}px`;
      el.style.top = `${top - size / 2}px`;
    });

    if (this._openCommentId && this._panel?.classList.contains('is-visible')) {
      const entry = this._markers.get(this._openCommentId);
      if (entry?.el) this._positionPanelNextToMarker(entry.el);
    }
  }

  /**
   * 카메라 전환: flyMode와 동일하게 Quaternion slerp 사용 (roll 뒤집힘 없음).
   */
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
        targetState.rotation.w
      );
    } else {
      const endPitch = typeof targetState.pitch === 'number' ? -targetState.pitch : 0;
      const endYaw = typeof targetState.yaw === 'number' ? targetState.yaw : 0;
      targetQuat = new pc.Quat();
      targetQuat.setFromEulerAngles(endPitch, endYaw, 0);
    }
    if (
      startQuat.x * targetQuat.x + startQuat.y * targetQuat.y +
      startQuat.z * targetQuat.z + startQuat.w * targetQuat.w < 0
    ) {
      targetQuat.x *= -1; targetQuat.y *= -1; targetQuat.z *= -1; targetQuat.w *= -1;
    }

    const startTime = performance.now();

    const tick = () => {
      if (!this.viewer?.cameraEntity) return;

      const elapsed = performance.now() - startTime;
      let t = Math.min(1, elapsed / CAMERA_TRANSITION_DURATION_MS);
      t = 1 - Math.pow(1 - t, 3);

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

  _onMarkerClick(comment, markerEl) {
    if (!this.viewer || !this.timeline) return;

    this.timeline.selectObject(comment.objectId);
    this._openDescriptionPanel(comment, markerEl);

    const targetState = comment.cameraState;
    if (!targetState?.position) {
      this.viewer.setCameraState(comment.cameraState);
      return;
    }

    const cam = this.viewer.cameraEntity;
    if (!cam) {
      this.viewer.setCameraState(comment.cameraState);
      return;
    }

    const pos = cam.getPosition();
    const euler = cam.getLocalEulerAngles();
    const startPos = { x: pos.x, y: pos.y, z: pos.z };
    const startYaw = euler.y;
    const startPitch = euler.x;
    const startRoll = euler.z;

    this.viewer._cameraTransitionActive = true;
    this._runCameraTransitionLoop(startPos, startYaw, startPitch, startRoll, targetState);
  }

  _positionPanelNextToMarker(markerEl) {
    if (!this._panel || !markerEl) return;
    const rect = markerEl.getBoundingClientRect();
    const gap = 10;
    const panelRect = this._panel.getBoundingClientRect();
    let left = rect.right + gap;
    let top = rect.top + rect.height / 2 - (panelRect.height || 120) / 2;
    const padding = 12;
    if (left + (panelRect.width || 280) > window.innerWidth - padding) {
      left = window.innerWidth - (panelRect.width || 280) - padding;
    }
    if (left < padding) left = padding;
    if (top < padding) top = padding;
    if (top + (panelRect.height || 120) > window.innerHeight - padding) {
      top = window.innerHeight - (panelRect.height || 120) - padding;
    }
    this._panel.style.left = `${left}px`;
    this._panel.style.top = `${top}px`;
  }

  _getEntitiesForObjectId(objectId) {
    if (!this.timeline?.objects) return [];
    const obj = this.timeline.objects.find((o) => o.id === objectId);
    if (!obj) return [];
    if (obj.entity) return [obj.entity];
    if (Array.isArray(obj.files)) return obj.files.map((f) => f?.entity).filter(Boolean);
    return [];
  }

  _openDescriptionPanel(comment, markerEl) {
    if (!this._panel || !this._panelText) return;
    if (this._panelTitle) {
      this._panelTitle.textContent = comment.title?.trim() || '설명';
    }
    this._panelText.textContent = comment.description || '(설명 없음)';
    this._openCommentId = comment.id;
    this._positionPanelNextToMarker(markerEl ?? this._markers.get(comment.id)?.el);
    this._panel.classList.add('is-visible');
    this._panel.setAttribute('aria-hidden', 'false');
    const entities = this._getEntitiesForObjectId(comment.objectId);
    this.viewer?.beginCommentHighlightRead?.(entities ?? []);
  }

  _closeDescriptionPanel() {
    if (!this._panel) return;
    this._panel.classList.remove('is-visible');
    this._panel.setAttribute('aria-hidden', 'true');
    this._openCommentId = null;
    this.viewer?.endCommentHighlightRead?.();
    if (this.timeline?.clearSelection) {
      this.timeline.clearSelection();
    }
  }

  _deleteCurrentComment() {
    if (!this._openCommentId) return;
    const idx = this.comments.findIndex((c) => c.id === this._openCommentId);
    if (idx === -1) return;
    this.comments.splice(idx, 1);
    this._closeDescriptionPanel();
    this._rebuildMarkers();
    this.onPersistableChange?.();
  }

  /**
   * 타임라인에서 오브젝트가 제거될 때 해당 오브젝트에 연결된 코멘트를 모두 제거합니다.
   * @param {string} objectId - 제거된 오브젝트 ID
   */
  removeCommentsForObjectId(objectId) {
    if (!objectId) return;
    const before = this.comments.length;
    this.comments = this.comments.filter((c) => c.objectId !== objectId);
    if (this.comments.length !== before) {
      if (this._openCommentId) {
        const stillExists = this.comments.some((c) => c.id === this._openCommentId);
        if (!stillExists) {
          this._closeDescriptionPanel();
        }
      }
      this._rebuildMarkers();
    }
  }

  toggleTooltip() {
    if (!this.tooltip || !this.btn) return;
    const isVisible = this.tooltip.classList.contains('is-visible');
    this.tooltip.classList.toggle('is-visible', !isVisible);
    if (!isVisible) {
      this.btn.classList.remove('is-off');
      this.btn.setAttribute('aria-pressed', 'true');
    } else {
      this.btn.classList.add('is-off');
      this.btn.setAttribute('aria-pressed', 'false');
    }
    this.updateFromSelection();
  }

  hideTooltip() {
    const mp = this.markerPlacement;
    if (mp?.isActive() && mp.getSessionKind() === 'comment') {
      mp.cancel();
    }
    if (this.tooltip) this.tooltip.classList.remove('is-visible');
    if (this.btn) {
      this.btn.classList.add('is-off');
      this.btn.setAttribute('aria-pressed', 'false');
    }
  }

  /** 코멘트 팝오버가 열려 있고 오브젝트가 선택되면 파란 구·기즈모·미리보기 즉시 시작 */
  _syncCommentMarkerPlacementPreview() {
    const mp = this.markerPlacement;
    if (!mp || !this._overlay || !this.viewer) return;
    const open = !!this.tooltip?.classList.contains('is-visible');
    if (!open) {
      if (mp.isActive() && mp.getSessionKind() === 'comment') mp.cancel();
      return;
    }
    const sel = this.getSelection();
    const obj = sel ? (this.timeline?.objects?.find((o) => o.id === sel.id) ?? null) : null;
    if (!sel || !obj) {
      if (mp.isActive() && mp.getSessionKind() === 'comment') mp.cancel();
      return;
    }
    if (mp.isActive() && mp.getSessionKind() !== 'comment') mp.cancel();

    const finishAdd = (worldPosition, cameraState) => {
      const title = (this.titleInput?.value ?? '').trim();
      const description = (this.descriptionInput?.value ?? '').trim();
      const anchorEntity = getPrimaryEntityForObject(obj);
      const markerOffsetLocal = anchorEntity
        ? computeMarkerOffsetLocal(anchorEntity, worldPosition.x, worldPosition.y, worldPosition.z)
        : null;

      this.comments.push({
        id: _nextId(),
        objectId: obj.id,
        objectName: obj.name ?? '',
        title: title || '',
        worldPosition,
        ...(markerOffsetLocal ? { markerOffsetLocal } : {}),
        cameraState,
        description: description || '(설명 없음)',
      });

      this._rebuildMarkers();
      this.hideTooltip();
      if (this.titleInput) this.titleInput.value = '';
      if (this.descriptionInput) this.descriptionInput.value = '';
      this.onPersistableChange?.();
    };

    mp.start({
      anchorTimelineObject: obj,
      overlayMount: this._overlay,
      previewButtonClass: 'comment-marker comment-marker--bubble marker-placement-preview',
      previewInnerHtml: '<span class="comment-marker__icon" aria-hidden="true"></span>',
      sessionKind: 'comment',
      onCommit: finishAdd,
      onCancel: () => {},
    });
  }

  updateFromSelection() {
    const sel = this.getSelection();
    const obj = sel ? (this.timeline?.objects?.find((o) => o.id === sel.id) ?? null) : null;
    const row = this.btn?.closest('.gizmo-controls__description-row');
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
    if (this.addBtn) {
      this.addBtn.disabled = sel == null || hideRow;
    }
    this._syncCommentMarkerPlacementPreview();
  }

  onAddClick() {
    if (this.addBtn?.disabled) return;
    const sel = this.getSelection();
    if (!sel || !this.viewer) return;
    const obj = this.timeline?.objects?.find((o) => o.id === sel.id) ?? null;

    if (this.markerPlacement?.isActive() && this.markerPlacement.getSessionKind() === 'comment') {
      this.markerPlacement.commit();
      return;
    }

    const title = (this.titleInput?.value ?? '').trim();
    const description = (this.descriptionInput?.value ?? '').trim();

    const finishAdd = (worldPosition, cameraState) => {
      const anchorEntity = getPrimaryEntityForObject(obj);
      const markerOffsetLocal = anchorEntity
        ? computeMarkerOffsetLocal(anchorEntity, worldPosition.x, worldPosition.y, worldPosition.z)
        : null;

      this.comments.push({
        id: _nextId(),
        objectId: sel.id,
        objectName: sel.name ?? '',
        title: title || '',
        worldPosition,
        ...(markerOffsetLocal ? { markerOffsetLocal } : {}),
        cameraState,
        description: description || '(설명 없음)',
      });

      this._rebuildMarkers();
      this.hideTooltip();
      if (this.titleInput) this.titleInput.value = '';
      if (this.descriptionInput) this.descriptionInput.value = '';
      this.onPersistableChange?.();
    };

    if (this.markerPlacement && obj && this._overlay) {
      const started = this.markerPlacement.start({
        anchorTimelineObject: obj,
        overlayMount: this._overlay,
        previewButtonClass: 'comment-marker comment-marker--bubble marker-placement-preview',
        previewInnerHtml: '<span class="comment-marker__icon" aria-hidden="true"></span>',
        sessionKind: 'comment',
        onCommit: finishAdd,
        onCancel: () => {},
      });
      if (started) return;
    }

    const worldPosition = this.viewer._orbitTarget
      ? { ...this.viewer._orbitTarget }
      : { x: 0, y: 0, z: 0 };
    const cameraState = this.viewer.getCameraState?.();
    if (!cameraState) return;
    finishAdd(worldPosition, cameraState);
  }

  destroy() {
    if (this._rafId != null) cancelAnimationFrame(this._rafId);
    if (this.viewer) this.viewer._cameraTransitionActive = false;
    this._overlay?.remove();
    this._panel?.remove();
    this._markers.clear();
  }
}
