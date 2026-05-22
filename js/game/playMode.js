/**
 * First-person play mode for quick collision checks against editor Cube objects.
 * Cubes are hidden while play mode is active but remain collision blockers.
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
const COLLISION_EPSILON = 1e-4;
const PLAYER_THIRD_PERSON_DISTANCE = 3.2;
const PLAYER_VISUAL_SCALE = 1;
const PLAYER_VISUAL_ROLL = 180; // splat 모델 자체가 거꾸로 → 자식 entity에 1회만 적용 후 고정
const PLAYER_PLY_URL = new URL('../../playerply/player.ply', import.meta.url).href;
const VIEW_FIRST_PERSON = 0;
const VIEW_THIRD_BACK = 1;
const VIEW_THIRD_FRONT = 2;

export class PlayMode {
  constructor({ viewer, gizmo, getCubeObjects, flyMode, getPanelVisibilityState, setPanelVisibilityState, onStateChange } = {}) {
    this.viewer = viewer;
    this.gizmo = gizmo;
    this.getCubeObjects = typeof getCubeObjects === 'function' ? getCubeObjects : () => [];
    this.flyMode = flyMode || null;
    this.getPanelVisibilityState = typeof getPanelVisibilityState === 'function' ? getPanelVisibilityState : null;
    this.setPanelVisibilityState = typeof setPanelVisibilityState === 'function' ? setPanelVisibilityState : null;
    this.onStateChange = typeof onStateChange === 'function' ? onStateChange : null;

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
    this._cameraTransition = null;
    this._viewMode = VIEW_FIRST_PERSON;
    this._playerEntity = null;       // wrapper (위치 + yaw 전담)
    this._playerSplatEntity = null;  // 실제 splat (roll fix만 1회 적용 후 고정)
    this._playerSplatId = null;
    this._playerLoadPromise = null;

    this._flagEntity = null;
    this._flagObject = null;

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
    else this.enable();
  }

  enable() {
    if (this.enabled || !this.viewer?.cameraEntity) return;
    const pc = window.pc;
    if (!pc) return;

    this.flyMode?.disable?.();
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
    this._hideCubeRenders();
    this._ensurePlayerVisual();

    const start = this._getSpawnPosition();
    this._position = new pc.Vec3(start.x, start.y, start.z);
    this._verticalVelocity = 0;
    this._grounded = false;
    this._resolveInitialPenetration();
    this._yaw = 0;
    this._pitch = 0;
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
    if (this._savedPanelState) {
      this.setPanelVisibilityState?.(this._savedPanelState);
    }
    this._animateBackToSavedCamera();
    this.onStateChange?.(false);
  }

  togglePlayPositionFlag() {
    if (!this._flagEntity) {
      this._flagEntity = this._createFlagEntity();
      if (!this._flagEntity) return;
      this._flagObject = {
        id: '__play_position_flag__',
        name: 'Play Position',
        entity: this._flagEntity,
        objectType: 'playPosition',
      };
    }

    const nextVisible = !this._flagEntity.enabled;
    this._flagEntity.enabled = nextVisible;
    if (nextVisible) {
      this.gizmo?.setTarget?.(this._flagObject);
      this.gizmo?.setMode?.('transform');
      this.viewer?.setSelectedObject?.(this._flagObject);
    } else if (this.gizmo?.getTarget?.() === this._flagObject) {
      this.gizmo?.setTarget?.(null);
      this.viewer?.setSelectedObject?.(null);
    }
  }

  _createFlagEntity() {
    const pc = window.pc;
    const app = this.viewer?.app;
    if (!pc || !app) return null;
    this.viewer.ensureScene?.();

    const root = new pc.Entity('PlayPositionFlag');
    root.setLocalPosition(0, 0, 0);
    root.enabled = false;

    const red = new pc.StandardMaterial();
    red.useLighting = false;
    red.emissive = new pc.Color(1, 0.08, 0.06);
    red.diffuse = new pc.Color(1, 0.08, 0.06);
    red.update();

    const dark = new pc.StandardMaterial();
    dark.useLighting = false;
    dark.emissive = new pc.Color(0.05, 0.05, 0.05);
    dark.diffuse = new pc.Color(0.05, 0.05, 0.05);
    dark.update();

    const pole = new pc.Entity('PlayPositionFlagPole');
    pole.addComponent('render', { type: 'box', material: dark });
    pole.setLocalPosition(0, 0.55, 0);
    pole.setLocalScale(0.045, 1.1, 0.045);
    root.addChild(pole);

    const flag = new pc.Entity('PlayPositionFlagCloth');
    flag.addComponent('render', { type: 'box', material: red });
    flag.setLocalPosition(0.22, 0.95, 0);
    flag.setLocalScale(0.42, 0.28, 0.035);
    root.addChild(flag);

    this.viewer.splatRoot?.addChild(root);
    return root;
  }

  _getSpawnPosition() {
    if (this._flagEntity?.enabled) {
      const p = this._flagEntity.getPosition();
      return { x: p.x, y: p.y, z: p.z };
    }
    return { x: 0, y: 0, z: 0 };
  }

  _onKeyDown(e) {
    if (!this.enabled) return;
    if (e.code === 'Escape') {
      e.preventDefault();
      e.stopImmediatePropagation();
      this.disable();
      return;
    }
    if (e.code === 'KeyI') {
      e.preventDefault();
      e.stopImmediatePropagation();
      this.togglePlayPositionFlag();
      return;
    }
    if (e.code === 'KeyF') {
      e.preventDefault();
      e.stopImmediatePropagation();
      this._cycleViewMode();
      return;
    }
    if (e.code === 'Space') {
      e.preventDefault();
      e.stopImmediatePropagation();
      if (this._grounded) {
        this._verticalVelocity = JUMP_SPEED;
        this._grounded = false;
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
    this._verticalVelocity = Math.max(MAX_FALL_SPEED, this._verticalVelocity + GRAVITY * dt);
    const dy = this._verticalVelocity * dt;
    if (dy === 0) return;

    this._position.y += dy;
    const hit = this._findFirstCollision();
    if (hit) {
      if (dy < 0) {
        this._position.y = hit.maxY;
        this._grounded = true;
      } else {
        this._position.y = hit.minY - PLAYER_COLLIDER_HEIGHT;
      }
      this._verticalVelocity = 0;
    } else {
      this._grounded = false;
    }
  }

  _tryMoveAxis(axis, delta) {
    if (!delta || !this._position) return;
    this._position[axis] += delta;
    const hit = this._findFirstCollision();
    if (hit) {
      this._position[axis] -= delta;
    }
  }

  _findFirstCollision() {
    const player = this._getPlayerAabb();
    for (const obj of this.getCubeObjects()) {
      if (!obj?.entity || obj.visible === false) continue;
      const box = this._getEntityAabb(obj.entity);
      if (box && this._aabbIntersects(player, box)) return box;
    }
    return null;
  }

  _resolveInitialPenetration() {
    for (let i = 0; i < 12; i++) {
      const hit = this._findFirstCollision();
      if (!hit) return;
      this._position.y = hit.maxY;
      this._grounded = true;
    }
  }

  _getPlayerAabb() {
    const p = this._position;
    return {
      minX: p.x - PLAYER_COLLIDER_RADIUS,
      maxX: p.x + PLAYER_COLLIDER_RADIUS,
      minY: p.y,
      maxY: p.y + PLAYER_COLLIDER_HEIGHT,
      minZ: p.z - PLAYER_COLLIDER_RADIUS,
      maxZ: p.z + PLAYER_COLLIDER_RADIUS,
    };
  }

  _getEntityAabb(entity) {
    const pc = window.pc;
    if (!pc || !entity) return null;
    const world = entity.getWorldTransform();
    const localCorners = [
      [-0.5, -0.5, -0.5], [0.5, -0.5, -0.5], [0.5, 0.5, -0.5], [-0.5, 0.5, -0.5],
      [-0.5, -0.5, 0.5], [0.5, -0.5, 0.5], [0.5, 0.5, 0.5], [-0.5, 0.5, 0.5],
    ];
    const tmp = new pc.Vec3();
    const out = new pc.Vec3();
    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
    for (const c of localCorners) {
      tmp.set(c[0], c[1], c[2]);
      world.transformPoint(tmp, out);
      minX = Math.min(minX, out.x); maxX = Math.max(maxX, out.x);
      minY = Math.min(minY, out.y); maxY = Math.max(maxY, out.y);
      minZ = Math.min(minZ, out.z); maxZ = Math.max(maxZ, out.z);
    }
    return { minX, maxX, minY, maxY, minZ, maxZ };
  }

  _aabbIntersects(a, b) {
    return a.minX < b.maxX - COLLISION_EPSILON && a.maxX > b.minX + COLLISION_EPSILON &&
      a.minY < b.maxY - COLLISION_EPSILON && a.maxY > b.minY + COLLISION_EPSILON &&
      a.minZ < b.maxZ - COLLISION_EPSILON && a.maxZ > b.minZ + COLLISION_EPSILON;
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
      y: this._position.y + PLAYER_EYE_HEIGHT,
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
    for (const obj of this.getCubeObjects()) {
      if (!obj?.entity || obj.visible === false) continue;
      this._setRenderVisibilityRecursive(obj.entity, false);
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

  // ──────────────────────────────────────────────────────────────────────────
  // Player visual (wrapper pattern)
  //  wrapper(this._playerEntity)  ← 위치 + yaw 매 프레임 갱신
  //    └─ splat(this._playerSplatEntity)  ← roll 180° 한 번만 적용 후 고정
  //  이렇게 분리해야 yaw 회전이 roll fix와 섞이지 않고 시각적으로 보임.
  // ──────────────────────────────────────────────────────────────────────────

  _ensurePlayerVisual() {
    if (this._playerEntity || this._playerLoadPromise || !this.viewer?.loadSplatFromUrl) return;
    const pc = window.pc;
    if (!pc) return;

    // wrapper 먼저 생성: 위치 + yaw 전담
    this._playerEntity = new pc.Entity('PlayModePlayer');
    this._playerEntity.enabled = false;
    const splatRoot = this.viewer.splatRoot || this.viewer.app?.root;
    splatRoot?.addChild(this._playerEntity);

    this._playerLoadPromise = this.viewer.loadSplatFromUrl(PLAYER_PLY_URL, {
      append: true,
      rotationFixZ180: false, // wrapper에서 roll 180으로 처리할거니까 viewer 쪽 fix는 끔
      skipReorder: false,
      onProgress: () => {},
    }).then((result) => {
      const loadedEntity = result?.entity || null;
      this._playerSplatId = result?.splatId || null;
      if (!loadedEntity || !this._playerEntity) return;

      // splat을 wrapper의 child로 reparent
      this._playerEntity.addChild(loadedEntity);
      loadedEntity.name = 'PlayModePlayerSplat';
      loadedEntity.setLocalPosition(0, 0, 0);
      // 모델 거꾸로 → roll 180 한 번만 적용해서 고정
      loadedEntity.setLocalEulerAngles(0, 0, PLAYER_VISUAL_ROLL);
      loadedEntity.setLocalScale(PLAYER_VISUAL_SCALE, PLAYER_VISUAL_SCALE, PLAYER_VISUAL_SCALE);
      this._playerSplatEntity = loadedEntity;

      this._syncPlayerVisual();
      this._setPlayerVisible(this.enabled && this._viewMode !== VIEW_FIRST_PERSON);
    }).catch((err) => {
      console.warn('[PlayMode] Failed to load player visual:', err);
    }).finally(() => {
      this._playerLoadPromise = null;
    });
  }

  _setPlayerVisible(visible) {
    if (this._playerEntity) {
      this._playerEntity.enabled = !!visible;
    }
  }

  /**
   * 마인크래프트 스타일: wrapper의 yaw = this._yaw (항상).
   * 카메라가 어디 있든 캐릭터는 마우스 방향을 향함.
   * → 카메라가 뒤에 있으면 뒷통수, 앞에 있으면 얼굴이 자연스럽게 보임.
   * roll fix는 child splat에 이미 박혀있으므로 여기서 건드리지 않음.
   */
  _syncPlayerVisual() {
    if (!this._playerEntity || !this._position) return;
    this._playerEntity.setPosition(this._position.x, this._position.y, this._position.z);
    this._playerEntity.setLocalEulerAngles(0, this._yaw, 0);
  }

  _restoreCubeRenders() {
    for (const item of this._hiddenCubeRenders) {
      if (item?.render) item.render.enabled = item.enabled;
    }
    this._hiddenCubeRenders = [];
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
