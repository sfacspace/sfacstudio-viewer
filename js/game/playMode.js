import {
  isMeshBlockerObject,
} from '../core/collisionBlockers.js';
import {
  buildBlockerCollisionCache,
  queryBlockerCollision,
} from '../core/meshCollision.js';
import { syncSceneHierarchy } from '../timeline/objectHierarchy.js';

/**
 * First-person play mode for quick collision checks against cube / OBJ / GLB blockers.
 * Blocker meshes are hidden while play mode is active but remain colliders.
 *
 * Camera/character coupling (Minecraft F5 style):
 *   - Mouse X → this._yaw → camera AND player visual rotate together.
 *   - 3rd-person back: camera sits behind player along -lookDir → always shows the back of head.
 *   - 3rd-person front: camera sits in front along +lookDir → always shows the face.
 *   - Player visual yaw is *always* this._yaw, never re-derived from camera position.
 */

// Gameplay collider is numeric and independent from the player PLY visual.
// player.ply bounds are roughly 1.59m tall; radius is widened to cover the visible body.
const PLAYER_COLLIDER_RADIUS = 0.7;
const PLAYER_COLLIDER_HEIGHT = 1.6;
const PLAYER_EYE_HEIGHT = 1.45;
const MOVE_SPEED = 3.2;
const RUN_MULTIPLIER = 1.8;
const MOUSE_SENSITIVITY = 0.12;
const GRAVITY = -9.8;
const MAX_FALL_SPEED = -35;
const JUMP_SPEED = 4.8;
const CAMERA_TRANSITION_MS = 320;
const DEFAULT_SURFACE_SNAP_THRESHOLD = 0.06;
const PLAYER_THIRD_PERSON_DISTANCE = 3.2;
const PLAYER_VISUAL_SCALE = 1;
const PLAYER_VISUAL_ROLL = 180; // splat 모델 자체가 거꾸로 → 자식 entity에 1회만 적용 후 고정
const PLAYER_PLY_URL = new URL('../../playerply/player.ply', import.meta.url).href;
const VIEW_FIRST_PERSON = 0;
const VIEW_THIRD_BACK = 1;
const VIEW_THIRD_FRONT = 2;

export class PlayMode {
  constructor({ viewer, gizmo, getCubeObjects, getTimelineObjects, flyMode, onSwitchToOrbit, getPanelVisibilityState, setPanelVisibilityState, getSurfaceSnapThreshold, onStateChange, onPersistableChange } = {}) {
    this.viewer = viewer;
    this.gizmo = gizmo;
    this.getCubeObjects = typeof getCubeObjects === 'function' ? getCubeObjects : () => [];
    this.getTimelineObjects = typeof getTimelineObjects === 'function' ? getTimelineObjects : () => [];
    this.flyMode = flyMode || null;
    this.onSwitchToOrbit = typeof onSwitchToOrbit === 'function' ? onSwitchToOrbit : null;
    this.getPanelVisibilityState = typeof getPanelVisibilityState === 'function' ? getPanelVisibilityState : null;
    this.setPanelVisibilityState = typeof setPanelVisibilityState === 'function' ? setPanelVisibilityState : null;
    this.getSurfaceSnapThreshold = typeof getSurfaceSnapThreshold === 'function' ? getSurfaceSnapThreshold : null;
    this.onStateChange = typeof onStateChange === 'function' ? onStateChange : null;
    this.onPersistableChange = typeof onPersistableChange === 'function' ? onPersistableChange : null;

    this.enabled = false;
    this._exiting = false;
    this._keys = new Set();
    this._rafId = null;
    this._lastTime = 0;
    this._position = null;
    this._verticalVelocity = 0;
    this._grounded = false;
    this._yaw = 0;
    this._pitch = 0;
    this._savedCameraState = null;
    this._savedOrbitEnabled = true;
    this._savedPanelState = null;
    this._hiddenCubeRenders = [];
    /** @type {object[]} */
    this._meshBlockerEntities = [];
    this._meshRendersVisible = false;
    /** @type {{ boxes: object[], meshes: object[] }} */
    this._blockerCollision = { boxes: [], meshes: [] };
    this._cameraTransition = null;
    this._viewMode = VIEW_FIRST_PERSON;
    /** @type {object|null} splatRoot 자식 — 에디터 미리보기 + 플레이 중 캐릭터 */
    this._spawnEntity = null;
    this._spawnSplatEntity = null;
    this._spawnObject = null;
    this._spawnSplatId = null;
    this._spawnLoadPromise = null;
    /** @type {{ localPos: object, localEuler: object, localScale: object, enabled: boolean }|null} */
    this._spawnEditorSnapshot = null;
    this._colliderScale = 1;
    this._groundFloorY = null;

    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onPointerLockChange = this._onPointerLockChange.bind(this);
    this._tick = this._tick.bind(this);
  }

  isEnabled() {
    return this.enabled;
  }

  toggle() {
    if (this.enabled) this.disable();
    else void this.enable();
  }

  async enable() {
    if (this.enabled || !this.viewer?.cameraEntity) return;
    const pc = window.pc;
    if (!pc) return;

    if (this.flyMode?.getEnabled?.()) {
      this.flyMode.disableImmediate?.();
    }
    this.onSwitchToOrbit?.();
    this.enabled = true;
    this._exiting = false;
    this._keys.clear();
    this._savedCameraState = this.viewer.getCameraState?.();
    this._savedOrbitEnabled = this.viewer.isOrbitEnabled?.() ?? true;
    this._savedPanelState = this.getPanelVisibilityState?.() || null;
    this.setPanelVisibilityState?.({
      leftSidebarVisible: false,
      timelineUiVisible: false,
      rightSidebarVisible: false,
    });
    this.viewer.setOrbitEnabled?.(false);
    this.gizmo?.setTarget?.(null);

    this._viewMode = VIEW_FIRST_PERSON;
    this._setPlayerVisible(false);
    const timelineObjs = this.getTimelineObjects();
    if (timelineObjs?.length && this.viewer) {
      try {
        syncSceneHierarchy(this.viewer, timelineObjs);
      } catch (e) {
        /* ignore */
      }
    }
    this._blockerCollision = buildBlockerCollisionCache(() => this.getCubeObjects());
    this._hideCubeRenders();
    await this._ensureSpawnPreview();
    this._captureSpawnEditorSnapshot();

    const start = this._getSpawnPosition();
    this._position = new pc.Vec3(start.x, start.y, start.z);
    this._verticalVelocity = 0;
    this._grounded = false;
    this._groundFloorY = null;
    this._colliderScale = this._getColliderScaleFactor();
    this._resolveInitialPenetration();
    this._yaw = this._getSpawnYaw();
    this._pitch = 0;
    this._syncPlayerVisual();
    this._setPlayerVisible(false);
    this._startCameraTransitionToPlayer();

    window.addEventListener('keydown', this._onKeyDown, true);
    window.addEventListener('keyup', this._onKeyUp, true);
    window.addEventListener('mousemove', this._onMouseMove, true);
    document.addEventListener('pointerlockchange', this._onPointerLockChange);

    try {
      this.viewer.canvas?.requestPointerLock?.();
    } catch (e) {
      /* pointer lock is optional */
    }

    this._lastTime = performance.now();
    this._rafId = requestAnimationFrame(this._tick);
    this.onStateChange?.(true);
  }

  disable() {
    if (!this.enabled || this._exiting) return;
    this._exiting = true;
    this.enabled = false;

    window.removeEventListener('keydown', this._onKeyDown, true);
    window.removeEventListener('keyup', this._onKeyUp, true);
    window.removeEventListener('mousemove', this._onMouseMove, true);
    document.removeEventListener('pointerlockchange', this._onPointerLockChange);

    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
    this._keys.clear();

    if (document.pointerLockElement === this.viewer?.canvas) {
      try {
        document.exitPointerLock?.();
      } catch (e) {
        /* ignore */
      }
    }

    this._restoreCubeRenders();
    this._setPlayerVisible(false);
    this._restoreSpawnEditorSnapshot();
    if (this._savedPanelState) {
      this.setPanelVisibilityState?.(this._savedPanelState);
    }
    this._animateBackToSavedCamera();
    this.onStateChange?.(false);
  }

  /** @returns {Promise<boolean>} */
  async _ensureSpawnPreview() {
    const pc = window.pc;
    if (!pc || !this.viewer) return false;
    this.viewer.ensureScene?.();

    if (!this._spawnEntity) {
      const root = new pc.Entity('PlaySpawnPlayer');
      root.setLocalPosition(0, 0, 0);
      root.setLocalScale(1, 1, 1);
      root.enabled = false;
      this.viewer.splatRoot?.addChild(root);
      this._spawnEntity = root;
      this._spawnObject = {
        id: '__play_spawn_player__',
        name: 'Player',
        entity: root,
        objectType: 'playPosition',
      };
    }

    if (!this._spawnSplatEntity && !this._spawnLoadPromise) {
      this._spawnLoadPromise = this._loadSpawnPlayerSplat();
    }
    if (this._spawnLoadPromise) {
      await this._spawnLoadPromise;
    }
    return !!this._spawnEntity;
  }

  async _loadSpawnPlayerSplat() {
    if (!this.viewer?.loadSplatFromUrl || !this._spawnEntity) return;
    try {
      const result = await this.viewer.loadSplatFromUrl(PLAYER_PLY_URL, {
        append: true,
        rotationFixZ180: false,
        skipReorder: false,
        onProgress: () => {},
      });
      const loaded = result?.entity;
      this._spawnSplatId = result?.splatId || null;
      if (!loaded || !this._spawnEntity) return;

      if (loaded.parent) {
        loaded.parent.removeChild(loaded);
      }
      this._spawnEntity.addChild(loaded);
      loaded.name = 'PlaySpawnPlayerSplat';
      loaded.setLocalPosition(0, 0, 0);
      loaded.setLocalEulerAngles(0, 0, PLAYER_VISUAL_ROLL);
      loaded.setLocalScale(1, 1, 1);
      this._spawnSplatEntity = loaded;
    } catch (err) {
      console.warn('[PlayMode] Failed to load player PLY preview:', err);
    } finally {
      this._spawnLoadPromise = null;
    }
  }

  /** 월드 좌표 → splatRoot 로컬 */
  _worldToSpawnLocal(wx, wy, wz) {
    const pc = window.pc;
    const root = this.viewer?.splatRoot;
    if (!pc || !root) return { x: wx, y: wy, z: wz };
    const world = new pc.Vec3(wx, wy, wz);
    const local = new pc.Vec3();
    const inv = new pc.Mat4();
    inv.copy(root.getWorldTransform()).invert();
    inv.transformPoint(world, local);
    return { x: local.x, y: local.y, z: local.z };
  }

  _getColliderScaleFactor() {
    if (!this._spawnEntity) return 1;
    const s = this._spawnEntity.getLocalScale();
    const avg = (Math.abs(s.x) + Math.abs(s.y) + Math.abs(s.z)) / 3;
    return Math.max(0.2, avg || 1);
  }

  _captureSpawnEditorSnapshot() {
    if (!this._spawnEntity) return;
    const p = this._spawnEntity.getLocalPosition();
    const e = this._spawnEntity.getLocalEulerAngles();
    const s = this._spawnEntity.getLocalScale();
    this._spawnEditorSnapshot = {
      localPos: { x: p.x, y: p.y, z: p.z },
      localEuler: { x: e.x, y: e.y, z: e.z },
      localScale: { x: s.x, y: s.y, z: s.z },
      enabled: this._spawnEntity.enabled !== false,
    };
  }

  _restoreSpawnEditorSnapshot() {
    if (!this._spawnEntity || !this._spawnEditorSnapshot) return;
    const snap = this._spawnEditorSnapshot;
    this._spawnEntity.setLocalPosition(
      snap.localPos.x,
      snap.localPos.y,
      snap.localPos.z
    );
    this._spawnEntity.setLocalEulerAngles(
      snap.localEuler.x,
      snap.localEuler.y,
      snap.localEuler.z
    );
    this._spawnEntity.setLocalScale(
      snap.localScale.x,
      snap.localScale.y,
      snap.localScale.z
    );
    this._spawnEntity.enabled = snap.enabled;
    this._spawnEditorSnapshot = null;
  }

  /**
   * I키: 플레이어 PLY 미리보기 표시/숨김 (기즈모로 위치·크기·회전 조정).
   */
  togglePlayPositionFlag() {
    void this._togglePlaySpawnPreview();
  }

  async _togglePlaySpawnPreview() {
    const ready = await this._ensureSpawnPreview();
    if (!ready || !this._spawnEntity) return;

    const nextVisible = !this._spawnEntity.enabled;
    this._spawnEntity.enabled = nextVisible;
    if (nextVisible) {
      this.gizmo?.setTarget?.(this._spawnObject);
      this.gizmo?.setMode?.('transform');
      this.viewer?.setSelectedObject?.(this._spawnObject);
    } else if (this.gizmo?.getTarget?.() === this._spawnObject) {
      this.gizmo?.setTarget?.(null);
      this.viewer?.setSelectedObject?.(null);
    }
    this.onPersistableChange?.();
  }

  /** 카메라(또는 플레이 중) 위치로 스폰 캐릭터 좌표 설정 */
  setPlayPositionFromView() {
    void this._setPlayPositionFromViewAsync();
  }

  async _setPlayPositionFromViewAsync() {
    const ready = await this._ensureSpawnPreview();
    if (!ready || !this._spawnEntity) return;

    const scale = this._getColliderScaleFactor();
    const eye = PLAYER_EYE_HEIGHT * scale;
    let wx;
    let wy;
    let wz;
    if (this.enabled && this._position) {
      wx = this._position.x;
      wy = this._position.y;
      wz = this._position.z;
    } else if (this.viewer?.cameraEntity) {
      const cam = this.viewer.cameraEntity.getPosition();
      wx = cam.x;
      wy = cam.y - eye;
      wz = cam.z;
    } else {
      return;
    }

    const local = this._worldToSpawnLocal(wx, wy, wz);
    this._spawnEntity.setLocalPosition(local.x, local.y, local.z);
    this._spawnEntity.enabled = true;
    this.onPersistableChange?.();
  }

  serializeState() {
    const out = {
      playPosition: {
        visible: false,
        position: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        rotationY: 0,
      },
    };
    if (this._spawnEntity) {
      const p = this._spawnEntity.getLocalPosition();
      const s = this._spawnEntity.getLocalScale();
      const e = this._spawnEntity.getLocalEulerAngles();
      out.playPosition.visible = this._spawnEntity.enabled !== false;
      out.playPosition.position = { x: p.x, y: p.y, z: p.z };
      out.playPosition.scale = { x: s.x, y: s.y, z: s.z };
      out.playPosition.rotationY = e.y;
    }
    return out;
  }

  /** @returns {object} export HTML META.playPosition */
  getPlaySpawnExportMeta() {
    return this.serializeState().playPosition;
  }

  applySavedState(state) {
    const pp = state?.playPosition;
    if (!pp) return;
    void this._applySavedSpawnState(pp);
  }

  async _applySavedSpawnState(pp) {
    const ready = await this._ensureSpawnPreview();
    if (!ready || !this._spawnEntity) return;

    const pos = pp.position;
    if (pos && typeof pos.x === 'number') {
      this._spawnEntity.setLocalPosition(pos.x, pos.y ?? 0, pos.z ?? 0);
    }
    const sc = pp.scale;
    if (sc && typeof sc.x === 'number') {
      this._spawnEntity.setLocalScale(sc.x, sc.y ?? sc.x, sc.z ?? sc.x);
    }
    if (typeof pp.rotationY === 'number') {
      const e = this._spawnEntity.getLocalEulerAngles();
      this._spawnEntity.setLocalEulerAngles(e.x, pp.rotationY, e.z);
    }
    this._spawnEntity.enabled = pp.visible === true;
  }

  clearSavedState() {
    if (this._spawnEntity) {
      try {
        this._spawnEntity.destroy();
      } catch (e) {
        /* ignore */
      }
    }
    this._spawnEntity = null;
    this._spawnSplatEntity = null;
    this._spawnObject = null;
    this._spawnSplatId = null;
    this._spawnEditorSnapshot = null;
  }

  _getSpawnPosition() {
    if (this._spawnEntity) {
      const p = this._spawnEntity.getPosition();
      return { x: p.x, y: p.y, z: p.z };
    }
    const st = this.serializeState?.()?.playPosition?.position;
    if (st && typeof st.x === 'number') {
      const root = this.viewer?.splatRoot;
      if (root && window.pc) {
        const pc = window.pc;
        const local = new pc.Vec3(st.x, st.y ?? 0, st.z ?? 0);
        const world = new pc.Vec3();
        root.getWorldTransform().transformPoint(local, world);
        return { x: world.x, y: world.y, z: world.z };
      }
      return { x: st.x, y: st.y ?? 0, z: st.z ?? 0 };
    }
    return { x: 0, y: 0, z: 0 };
  }

  _getSpawnYaw() {
    if (this._spawnEntity) {
      return this._spawnEntity.getLocalEulerAngles().y;
    }
    const y = this.serializeState?.()?.playPosition?.rotationY;
    return typeof y === 'number' ? y : 0;
  }

  _onKeyDown(e) {
    if (!this.enabled) return;
    if (e.code === 'Escape') {
      e.preventDefault();
      e.stopImmediatePropagation();
      this.disable();
      return;
    }
    if (e.code === 'KeyF') {
      e.preventDefault();
      e.stopImmediatePropagation();
      this._cycleViewMode();
      return;
    }
    if (e.code === 'KeyU') {
      e.preventDefault();
      e.stopImmediatePropagation();
      this._toggleMeshBlockerVisibility();
      return;
    }
    if (e.code === 'Space') {
      e.preventDefault();
      e.stopImmediatePropagation();
      if (this._grounded) {
        this._verticalVelocity = JUMP_SPEED;
        this._grounded = false;
        this._groundFloorY = null;
      }
      return;
    }
    if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ShiftLeft', 'ShiftRight'].includes(e.code)) {
      e.preventDefault();
      e.stopImmediatePropagation();
      this._keys.add(e.code);
    }
  }

  _onKeyUp(e) {
    if (!this.enabled) return;
    if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ShiftLeft', 'ShiftRight'].includes(e.code)) {
      e.preventDefault();
      e.stopImmediatePropagation();
      this._keys.delete(e.code);
    }
  }

  _onMouseMove(e) {
    if (!this.enabled) return;
    if (document.pointerLockElement !== this.viewer?.canvas) return;
    this._yaw -= e.movementX * MOUSE_SENSITIVITY;
    this._pitch -= e.movementY * MOUSE_SENSITIVITY;
    this._pitch = Math.max(-85, Math.min(85, this._pitch));
    this._applyCamera();
  }

  _onPointerLockChange() {
    if (!this.enabled) return;
    if (document.pointerLockElement == null) {
      this.disable();
    }
  }

  _tick() {
    if (!this.enabled) return;
    const now = performance.now();
    const dt = Math.min(0.05, Math.max(0, (now - this._lastTime) / 1000));
    this._lastTime = now;

    if (this._cameraTransition) {
      this._applyCamera();
      this._rafId = requestAnimationFrame(this._tick);
      return;
    }

    this._move(dt);
    this._applyGravity(dt);
    this._applyCamera();
    this._rafId = requestAnimationFrame(this._tick);
  }

  _move(dt) {
    if (!this._position) return;
    const pc = window.pc;
    if (!pc) return;

    let lx = 0;
    let lz = 0;
    if (this._keys.has('KeyW')) lz -= 1;
    if (this._keys.has('KeyS')) lz += 1;
    if (this._keys.has('KeyA')) lx -= 1;
    if (this._keys.has('KeyD')) lx += 1;
    if (lx === 0 && lz === 0) return;

    const len = Math.hypot(lx, lz) || 1;
    lx /= len;
    lz /= len;

    const yawRad = this._yaw * Math.PI / 180;
    const sin = Math.sin(yawRad);
    const cos = Math.cos(yawRad);
    const speed = MOVE_SPEED * (this._keys.has('ShiftLeft') || this._keys.has('ShiftRight') ? RUN_MULTIPLIER : 1);
    const dx = (lx * cos + lz * sin) * speed * dt;
    const dz = (-lx * sin + lz * cos) * speed * dt;

    this._tryMoveAxis('x', dx);
    this._tryMoveAxis('z', dz);
  }

  _applyGravity(dt) {
    if (!this._position) return;
    if (this._grounded && this._verticalVelocity <= 0) {
      const groundHit = this._findFirstCollision(this._getPlayerAabb(this._getSurfaceSnapThreshold() + 0.02));
      if (groundHit?.floorY != null) {
        this._position.y = this._resolveStableFloorY(groundHit.floorY);
        this._verticalVelocity = 0;
        return;
      }
    }

    this._verticalVelocity = Math.max(MAX_FALL_SPEED, this._verticalVelocity + GRAVITY * dt);
    const dy = this._verticalVelocity * dt;
    if (dy === 0) return;

    this._position.y += dy;
    const hit = this._findFirstCollision();
    if (hit?.blocked) {
      if (dy < 0 && hit.floorY != null) {
        this._position.y = this._resolveStableFloorY(hit.floorY);
        this._grounded = true;
        this._verticalVelocity = 0;
      } else if (dy > 0 && hit.ceilY != null) {
        this._position.y = hit.ceilY - PLAYER_COLLIDER_HEIGHT * this._colliderScale;
        this._verticalVelocity = 0;
      } else if (dy < 0) {
        this._grounded = false;
        this._groundFloorY = null;
      }
    } else {
      this._grounded = false;
      this._groundFloorY = null;
    }
  }

  _tryMoveAxis(axis, delta) {
    if (!delta || !this._position) return;
    this._position[axis] += delta;
    const hit = this._findFirstCollision();
    if (hit && this._shouldBlockHorizontalMove(hit)) {
      this._position[axis] -= delta;
    }
  }

  _shouldBlockHorizontalMove(hit) {
    if (!hit?.blocked) return false;
    if (hit.wallBlocked) return true;
    if (hit.floorY == null) return true;
    const threshold = this._getSurfaceSnapThreshold();
    return hit.floorY > this._position.y + threshold + 0.02;
  }

  _findFirstCollision(playerAabb = null) {
    const player = playerAabb || this._getPlayerAabb();
    const hit = queryBlockerCollision(player, this._blockerCollision);
    return hit.blocked ? hit : null;
  }

  _resolveInitialPenetration() {
    for (let i = 0; i < 12; i++) {
      const hit = this._findFirstCollision();
      if (!hit?.blocked || hit.floorY == null) return;
      this._position.y = this._resolveStableFloorY(hit.floorY);
      this._grounded = true;
    }
  }

  _getSurfaceSnapThreshold() {
    const v = Number(this.getSurfaceSnapThreshold?.());
    return Number.isFinite(v)
      ? Math.max(0, Math.min(0.5, v))
      : DEFAULT_SURFACE_SNAP_THRESHOLD;
  }

  _resolveStableFloorY(nextFloorY) {
    if (!Number.isFinite(nextFloorY)) return nextFloorY;
    const threshold = this._getSurfaceSnapThreshold();
    if (this._grounded && Number.isFinite(this._groundFloorY)) {
      const delta = nextFloorY - this._groundFloorY;
      if (Math.abs(delta) <= threshold) {
        return this._groundFloorY;
      }
    }
    this._groundFloorY = nextFloorY;
    return nextFloorY;
  }

  getSurfaceSettingsForExport() {
    return {
      snapThreshold: this._getSurfaceSnapThreshold(),
    };
  }

  _getPlayerAabb(extraDown = 0) {
    const p = this._position;
    const sc = this._colliderScale || 1;
    const r = PLAYER_COLLIDER_RADIUS * sc;
    const h = PLAYER_COLLIDER_HEIGHT * sc;
    return {
      minX: p.x - r,
      maxX: p.x + r,
      minY: p.y - Math.max(0, extraDown),
      maxY: p.y + h,
      minZ: p.z - r,
      maxZ: p.z + r,
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Minecraft-style camera math
  // ──────────────────────────────────────────────────────────────────────────

  /** yaw=0, pitch=0 → (0, 0, -1). pitch>0이면 위쪽. */
  _getLookDir() {
    const yawRad = this._yaw * Math.PI / 180;
    const pitchRad = this._pitch * Math.PI / 180;
    const cosP = Math.cos(pitchRad);
    return {
      x: -Math.sin(yawRad) * cosP,
      y: Math.sin(pitchRad),
      z: -Math.cos(yawRad) * cosP,
    };
  }

  /** 카메라 회전 피벗 = 플레이어 머리 */
  _getPivotPoint() {
    return {
      x: this._position.x,
      y: this._position.y + PLAYER_EYE_HEIGHT * (this._colliderScale || 1),
      z: this._position.z,
    };
  }

  _getCameraPose() {
    const pc = window.pc;
    if (!pc || !this._position) return null;

    const pivot = this._getPivotPoint();

    if (this._viewMode === VIEW_FIRST_PERSON) {
      const position = new pc.Vec3(pivot.x, pivot.y, pivot.z);
      const rotation = new pc.Quat();
      rotation.setFromEulerAngles(this._pitch, this._yaw, 0);
      return { position, rotation };
    }

    const look = this._getLookDir();
    const side = this._viewMode === VIEW_THIRD_FRONT ? 1 : -1;
    const dist = PLAYER_THIRD_PERSON_DISTANCE;

    const position = new pc.Vec3(
      pivot.x + look.x * dist * side,
      pivot.y + look.y * dist * side,
      pivot.z + look.z * dist * side
    );

    const target = new pc.Vec3(pivot.x, pivot.y, pivot.z);
    const lookEntity = new pc.Entity('PlayModeCameraPose');
    lookEntity.setPosition(position);
    lookEntity.lookAt(target);
    const rotation = lookEntity.getRotation().clone();
    lookEntity.destroy();
    return { position, rotation };
  }

  _applyCamera() {
    const camera = this.viewer?.cameraEntity;
    if (!camera || !this._position) return;
    if (this._updateCameraTransition()) {
      this._syncPlayerVisual();
      return;
    }

    const pose = this._getCameraPose();
    if (!pose) return;
    camera.setPosition(pose.position);
    camera.setRotation(pose.rotation);
    this._syncPlayerVisual();
  }

  _startCameraTransitionToPlayer() {
    const pc = window.pc;
    const camera = this.viewer?.cameraEntity;
    if (!pc || !camera || !this._position) {
      this._applyCamera();
      return;
    }

    const pose = this._getCameraPose();
    if (!pose) return;

    this._cameraTransition = {
      startMs: performance.now(),
      durationMs: CAMERA_TRANSITION_MS,
      fromPos: camera.getPosition().clone(),
      fromRot: camera.getRotation().clone(),
      toPos: pose.position,
      toRot: pose.rotation,
      onDone: null,
    };
  }

  _animateBackToSavedCamera() {
    const pc = window.pc;
    const camera = this.viewer?.cameraEntity;
    const saved = this._savedCameraState;
    if (!pc || !camera || !saved?.position) {
      if (saved) this.viewer.setCameraState?.(saved);
      this.viewer.setOrbitEnabled?.(this._savedOrbitEnabled);
      this._exiting = false;
      return;
    }

    const toPos = new pc.Vec3(saved.position.x, saved.position.y, saved.position.z);
    const toRot = new pc.Quat();
    if (saved.quaternion) {
      toRot.set(saved.quaternion.x, saved.quaternion.y, saved.quaternion.z, saved.quaternion.w);
    } else if (saved.rotation) {
      toRot.set(saved.rotation.x, saved.rotation.y, saved.rotation.z, saved.rotation.w);
    } else {
      toRot.copy(camera.getRotation());
    }

    this._cameraTransition = {
      startMs: performance.now(),
      durationMs: CAMERA_TRANSITION_MS,
      fromPos: camera.getPosition().clone(),
      fromRot: camera.getRotation().clone(),
      toPos,
      toRot,
      onDone: () => {
        this.viewer.setCameraState?.(saved);
        this.viewer.setOrbitEnabled?.(this._savedOrbitEnabled);
        this._exiting = false;
      },
    };
    this._runExitCameraTransition();
  }

  _runExitCameraTransition() {
    const step = () => {
      const done = !this._updateCameraTransition();
      if (!done) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  _updateCameraTransition() {
    const t = this._cameraTransition;
    const pc = window.pc;
    const camera = this.viewer?.cameraEntity;
    if (!t || !pc || !camera) return false;

    const raw = Math.min(1, (performance.now() - t.startMs) / t.durationMs);
    const k = 1 - Math.pow(1 - raw, 3);
    const pos = new pc.Vec3();
    pos.lerp(t.fromPos, t.toPos, k);
    const rot = new pc.Quat();
    rot.slerp(t.fromRot, t.toRot, k);
    camera.setPosition(pos);
    camera.setRotation(rot);

    if (raw >= 1) {
      this._cameraTransition = null;
      t.onDone?.();
      return false;
    }
    return true;
  }

  _hideCubeRenders() {
    this._hiddenCubeRenders = [];
    this._meshBlockerEntities = [];
    this._meshRendersVisible = false;
    for (const obj of this.getCubeObjects()) {
      if (!obj?.entity || obj.visible === false) continue;
      if (isMeshBlockerObject(obj)) {
        this._meshBlockerEntities.push(obj.entity);
      }
      this._setRenderVisibilityRecursive(obj.entity, false);
    }
  }

  /** U키: 플레이 중 OBJ/GLB 메시 렌더 표시/숨김 (충돌은 유지) */
  _toggleMeshBlockerVisibility() {
    this._meshRendersVisible = !this._meshRendersVisible;
    for (const ent of this._meshBlockerEntities) {
      this._applyRenderVisibilityRecursive(ent, this._meshRendersVisible);
    }
  }

  _cycleViewMode() {
    this._viewMode = (this._viewMode + 1) % 3;
    this._setPlayerVisible(this._viewMode !== VIEW_FIRST_PERSON);
    this._syncPlayerVisual();
    this._startCameraTransitionToCurrentView();
  }

  _startCameraTransitionToCurrentView() {
    const pc = window.pc;
    const camera = this.viewer?.cameraEntity;
    if (!pc || !camera || !this._position) return;
    const pose = this._getCameraPose();
    if (!pose) return;
    this._cameraTransition = {
      startMs: performance.now(),
      durationMs: CAMERA_TRANSITION_MS,
      fromPos: camera.getPosition().clone(),
      fromRot: camera.getRotation().clone(),
      toPos: pose.position,
      toRot: pose.rotation,
      onDone: null,
    };
  }

  _setPlayerVisible(visible) {
    if (this._spawnEntity) {
      this._spawnEntity.enabled = !!visible;
    }
  }

  /** 플레이 중: 스폰 캐릭터를 월드 위치·yaw에 맞춤 (에디터 스냅샷은 종료 시 복원) */
  _syncPlayerVisual() {
    if (!this._spawnEntity || !this._position) return;
    this._spawnEntity.setPosition(this._position.x, this._position.y, this._position.z);
    const e = this._spawnEntity.getLocalEulerAngles();
    this._spawnEntity.setLocalEulerAngles(e.x, this._yaw, e.z);
  }

  _restoreCubeRenders() {
    for (const item of this._hiddenCubeRenders) {
      if (item?.render) item.render.enabled = item.enabled;
    }
    this._hiddenCubeRenders = [];
    this._meshBlockerEntities = [];
    this._meshRendersVisible = false;
  }

  _applyRenderVisibilityRecursive(entity, visible) {
    if (!entity) return;
    if (entity.render) {
      entity.render.enabled = visible;
    }
    for (const child of entity.children || []) {
      if (child?.name === 'CubeObjectOutline') continue;
      this._applyRenderVisibilityRecursive(child, visible);
    }
  }

  _setRenderVisibilityRecursive(entity, visible) {
    if (!entity) return;
    if (entity.render) {
      this._hiddenCubeRenders.push({ render: entity.render, enabled: entity.render.enabled });
      entity.render.enabled = visible;
    }
    for (const child of entity.children || []) {
      this._setRenderVisibilityRecursive(child, visible);
    }
  }
}
