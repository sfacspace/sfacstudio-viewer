/**
 * 코멘트/대시보드 마커 확정 전: 앵커(파란 구) + 이동 기즈모 + 미리보기. 확정은 팝오버 버튼·대시보드 확인, 취소는 Esc/팝오버 닫기
 */

import { getPrimaryEntityForObject } from './markerAnchor.js';

const PLACEMENT_OBJECT_ID = '__markerPlacementAnchor';

/**
 * @param {import('playcanvas').Entity} entity
 */
function attachBlueSphereMarker(entity) {
  const pc = window.pc;
  if (!pc || !entity?.addComponent) return;
  try {
    const material = new pc.StandardMaterial();
    material.useLighting = false;
    material.emissive = new pc.Color(0.35, 0.55, 1);
    material.emissiveIntensity = 1.35;
    material.opacity = 0.92;
    material.blendType = pc.BLEND_NORMAL;
    material.update();

    entity.addComponent('render', {
      type: 'sphere',
      castShadows: false,
      receiveShadows: false,
    });
    const meshInst = entity.render?.meshInstances?.[0];
    if (meshInst) meshInst.material = material;
    entity.setLocalScale(0.28, 0.28, 0.28);
  } catch {
    /* ignore */
  }
}

/**
 * @typedef {Object} MarkerPlacementStartOptions
 * @property {object} anchorTimelineObject - 타임라인 오브젝트(연동 대상)
 * @property {HTMLElement} overlayMount - 미리보기 버튼을 붙일 오버레이(코멘트/대시보드)
 * @property {string} previewButtonClass
 * @property {string} previewInnerHtml
 * @property {(worldPosition: {x:number,y:number,z:number}, cameraState: object) => void} onCommit
 * @property {() => void} [onCancel]
 * @property {'comment'|'dashboard'} [sessionKind] - 팝오버별 구분(다른 창 열릴 때 교체)
 */

export class MarkerPlacementMode {
  /**
   * @param {{
   *   viewer: import('../core/viewer.js').PlayCanvasViewer | null,
   *   getGizmo: () => import('./gizmo.js').GizmoController | null | undefined,
   *   getInspector: () => import('./inspector.js').InspectorController | null | undefined,
   *   getTimeline: () => object | null | undefined,
   *   getActiveGizmoMode: () => string | null,
   *   setGizmoMode: (mode: string | null) => void,
   * }} ctx
   */
  constructor(ctx) {
    this._ctx = ctx;
    this._active = false;
    /** @type {import('playcanvas').Entity|null} */
    this._placementEntity = null;
    this._pseudoObject = null;
    this._anchorTimelineObject = null;
    this._savedGizmoTarget = null;
    this._savedGizmoMode = null;
    /** @type {HTMLButtonElement|null} */
    this._previewBtn = null;
    this._overlayMount = null;
    this._rafId = null;
    /** @type {MarkerPlacementStartOptions['onCommit']|null} */
    this._onCommit = null;
    /** @type {(() => void) | null} */
    this._onCancel = null;
    this._onKeyDown = this._onKeyDown.bind(this);
    /** @type {'comment'|'dashboard'|null} */
    this._sessionKind = null;
  }

  /** @returns {'comment'|'dashboard'|null} */
  getSessionKind() {
    return this._sessionKind;
  }

  /** 타임라인 오브젝트 (배치 중에만 유효) */
  getAnchorTimelineObject() {
    return this._anchorTimelineObject;
  }

  /** 마커 앵커용 가짜 타임라인 오브젝트 (기즈모 타깃). start() 직후·배치 중에만 유효 */
  getPlacementPseudoObject() {
    return this._placementEntity && this._pseudoObject ? this._pseudoObject : null;
  }

  isActive() {
    return this._active;
  }

  /** 타임라인 선택 변경 시: 활성 중이면 취소만 (외부에서 선택 UI가 이어짐) */
  cancelIfActive() {
    if (this._active) this.cancel();
  }

  _onKeyDown(e) {
    if (!this._active) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      this.cancel();
    }
  }

  /**
   * @param {MarkerPlacementStartOptions} opts
   * @returns {boolean}
   */
  start(opts) {
    const viewer = this._ctx.viewer;
    const pc = typeof window !== 'undefined' ? window.pc : null;
    const app = viewer?.app;
    if (!viewer || !pc || !app || !opts.anchorTimelineObject) return false;

    const kind = opts.sessionKind ?? null;
    const anchorId = opts.anchorTimelineObject.id;
    if (this._active && this._anchorTimelineObject?.id === anchorId && this._sessionKind === kind) {
      return true;
    }

    if (this._active) {
      this._onCommit = null;
      this._onCancel = null;
      this._cleanupSession();
    }

    const anchorEntity = getPrimaryEntityForObject(opts.anchorTimelineObject);
    if (!anchorEntity) return false;

    const pos = anchorEntity.getPosition();

    this._placementEntity = new pc.Entity('MarkerPlacementAnchor');
    app.root.addChild(this._placementEntity);
    this._placementEntity.setPosition(pos.x, pos.y, pos.z);
    attachBlueSphereMarker(this._placementEntity);

    this._pseudoObject = {
      id: PLACEMENT_OBJECT_ID,
      name: '마커 위치',
      entity: this._placementEntity,
      isMarkerPlacementAnchor: true,
    };

    this._anchorTimelineObject = opts.anchorTimelineObject;
    this._sessionKind = kind;
    this._onCommit = opts.onCommit;
    this._onCancel = opts.onCancel ?? null;
    this._overlayMount = opts.overlayMount;

    const gizmo = this._ctx.getGizmo?.();
    const inspector = this._ctx.getInspector?.();

    this._savedGizmoTarget = gizmo?.getTarget?.() ?? null;
    this._savedGizmoMode = this._ctx.getActiveGizmoMode?.() ?? null;

    gizmo?.setTarget(this._pseudoObject);
    this._ctx.setGizmoMode?.('transform', { force: true });
    inspector?.show(this._pseudoObject);

    this._previewBtn = document.createElement('button');
    this._previewBtn.type = 'button';
    this._previewBtn.className = opts.previewButtonClass;
    this._previewBtn.innerHTML = opts.previewInnerHtml;
    this._previewBtn.setAttribute('aria-hidden', 'true');
    this._previewBtn.tabIndex = -1;
    this._previewBtn.style.cssText =
      'position:absolute;pointer-events:none;width:40px;height:40px;padding:0;margin:0;';
    opts.overlayMount.appendChild(this._previewBtn);

    document.addEventListener('keydown', this._onKeyDown, true);
    this._active = true;

    const loop = () => {
      if (!this._active) return;
      this._rafId = requestAnimationFrame(loop);
      this._syncPreviewScreenPosition();
    };
    this._rafId = requestAnimationFrame(loop);

    if (typeof viewer.renderNextFrame !== 'undefined') viewer.renderNextFrame = true;
    return true;
  }

  _syncPreviewScreenPosition() {
    const viewer = this._ctx.viewer;
    const cam = viewer?.cameraEntity?.camera;
    const canvas = viewer?.canvas;
    const pc = window.pc;
    if (!cam || !canvas || !this._placementEntity || !this._previewBtn || !pc) return;

    const worldPos = this._placementEntity.getPosition();
    const screenPos = new pc.Vec3();
    cam.worldToScreen(worldPos, screenPos);
    if (screenPos.z < 0) {
      this._previewBtn.style.display = 'none';
    } else {
      this._previewBtn.style.display = '';
      const size = 40;
      this._previewBtn.style.left = `${screenPos.x - size / 2}px`;
      this._previewBtn.style.top = `${screenPos.y - size / 2}px`;
    }
    if (typeof viewer.renderNextFrame !== 'undefined') viewer.renderNextFrame = true;
  }

  commit() {
    if (!this._active || !this._placementEntity || !this._onCommit) return;

    const p = this._placementEntity.getPosition();
    const worldPosition = { x: p.x, y: p.y, z: p.z };
    const viewer = this._ctx.viewer;
    const cameraState = viewer?.getCameraState?.();
    if (!cameraState) {
      this.cancel();
      return;
    }

    const fn = this._onCommit;
    this._onCommit = null;
    this._onCancel = null;
    this._cleanupSession();
    try {
      fn(worldPosition, cameraState);
    } catch (e) {
      console.error('[MarkerPlacementMode] onCommit', e);
    }
  }

  cancel() {
    if (!this._active) return;
    const cb = this._onCancel;
    this._onCommit = null;
    this._onCancel = null;
    this._cleanupSession();
    cb?.();
  }

  _cleanupSession() {
    document.removeEventListener('keydown', this._onKeyDown, true);
    if (this._rafId != null) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }

    if (this._previewBtn?.parentNode) {
      this._previewBtn.parentNode.removeChild(this._previewBtn);
    }
    this._previewBtn = null;

    if (this._placementEntity) {
      try {
        this._placementEntity.destroy();
      } catch {
        /* ignore */
      }
      this._placementEntity = null;
    }

    this._pseudoObject = null;
    this._anchorTimelineObject = null;
    this._sessionKind = null;
    this._overlayMount = null;

    const gizmo = this._ctx.getGizmo?.();
    const inspector = this._ctx.getInspector?.();
    const timeline = this._ctx.getTimeline?.();

    const selId = timeline?.selectedObjectId;
    const selObj = selId != null ? timeline?.objects?.find((o) => o.id === selId) : null;

    if (selObj) {
      gizmo?.setTarget(selObj);
      inspector?.show(selObj);
    } else {
      gizmo?.setTarget(null);
      inspector?.hide();
    }

    const saved = this._savedGizmoMode;
    this._savedGizmoTarget = null;
    this._savedGizmoMode = null;
    if (saved) {
      this._ctx.setGizmoMode?.(saved, { force: true });
    } else {
      this._ctx.setGizmoMode?.(null);
    }

    this._active = false;
    const viewer = this._ctx.viewer;
    if (viewer && typeof viewer.renderNextFrame !== 'undefined') viewer.renderNextFrame = true;
  }
}
