/**
 * Timeline playback (SuperSplat timeline.ts pattern): setFrame, play/stop, update pin/visibility.
 */

export class PlaybackController {
  /**
   * @param {Object} options
   * @param {Object} options.viewer - PlayCanvasViewer
   * @param {Function} options.getFrames - total frames getter
   * @param {Function} options.getFrameRate - FPS getter
   * @param {Function} options.setFrame - frame set callback (sync only)
   * @param {Function} options.updatePinPosition - update pin (t)
   * @param {Function} options.updateObjectsVisibility - update visibility/sequence (t, opts)
   * @param {Function} [options.getKeyframes] - keyframes getter
   * @param {Function} [options.getMovingObjects] - moving objects getter
   * @param {Function} [options.setFrustumsVisible] - frustum visibility setter
   * @param {Function} [options.setMovingObjectsVisible] - moving objects UI visibility setter
   * @param {Function} [options.onFrameChange] - on frame change (frameIndex)
   */
  constructor(options) {
    this._viewer = options.viewer;
    this._app = options.viewer?.app || null;
    this._getFrames = options.getFrames;
    this._getFrameRate = options.getFrameRate;
    this._setFrame = options.setFrame;
    this._updatePinPosition = options.updatePinPosition;
    this._updateObjectsVisibility = options.updateObjectsVisibility;
    this._getKeyframes = options.getKeyframes || (() => []);
    this._getMovingObjects = options.getMovingObjects || (() => []);
    this._setFrustumsVisible = options.setFrustumsVisible || (() => {});
    this._setMovingObjectsVisible = options.setMovingObjectsVisible || (() => {});
    this._getMovingObjectsManager = options.getMovingObjectsManager || (() => null);
    /** @type {Function|null} - timeline.frame callback */
    this._onFrameChange = options.onFrameChange || null;

    this._speedProfileStart = 0;
    this._speedProfileEnd = 0;

    /** @type {boolean} */
    this.isPlaying = false;

    /** @type {number} - current frame index */
    this.frame = 0;

    /** @type {number} - accumulated time while playing */
    this._time = 0;

    /** @type {EventHandle|null} - update event handle */
    this._animHandle = null;

    /** @type {boolean} */
    this._prevOrbitEnabled = true;

    /** @type {boolean} - orbit disabled by play (when 2+ markers) */
    this._orbitDisabledByPlay = false;

    /** @type {{ x: number, y: number, z: number }|null} - orbit target before play */
    this._savedOrbitTargetBeforePlay = null;

    /** @type {{ x: number, y: number, z: number }|null} - camera position before play (Fly) */
    this._savedCameraPositionBeforePlay = null;
    /** @type {{ x: number, y: number, z: number, w: number }|null} - camera rotation before play (Fly) */
    this._savedCameraRotationBeforePlay = null;

    /** @type {Function|null} */
    this.onTimeUpdate = null;
    /** @type {Function|null} */
    this.onPlayStateChange = null;
  }

  /**
   * Start play. Save orbit/camera state; restore on stop.
   */
  play() {
    if (this.isPlaying) return;
    
    this.isPlaying = true;

    this._app = this._viewer?.app || this._app;
    
    const keyframes = this._getKeyframes?.() ?? [];
    const shouldDisableOrbit = keyframes.length > 1;
    this._orbitDisabledByPlay = false;

    if (this._viewer) {
      this._prevOrbitEnabled = this._viewer.isOrbitEnabled?.() ?? true;
      const state = this._viewer.getCameraState?.();
      if (state?.target) {
        this._savedOrbitTargetBeforePlay = { x: state.target.x, y: state.target.y, z: state.target.z };
      } else {
        this._savedOrbitTargetBeforePlay = null;
      }
      if (state?.position) {
        this._savedCameraPositionBeforePlay = { x: state.position.x, y: state.position.y, z: state.position.z };
      } else {
        this._savedCameraPositionBeforePlay = null;
      }
      if (state?.rotation) {
        this._savedCameraRotationBeforePlay = { x: state.rotation.x, y: state.rotation.y, z: state.rotation.z, w: state.rotation.w };
      } else {
        this._savedCameraRotationBeforePlay = null;
      }
      if (shouldDisableOrbit) {
        this._orbitDisabledByPlay = true;
        this._viewer.setOrbitEnabled?.(false);
      }
    }
    
    // Hide frustums and path while playing
    this._setFrustumsVisible(false);
    this._setMovingObjectsVisible(true);
    
    // 카메라 이동 오브젝트 모두 선택 해제
    this._clearMovingObjectSelection();
    
    // time = frame (init)
    this._time = this.frame;
    
    this.onPlayStateChange?.(true, shouldDisableOrbit);

    // Register update listener
    if (this._app && typeof this._app.on === 'function') {
      this._animHandle = this._app.on('update', (dt) => this._tick(dt));
    }
  }

  /**
   * Stop play. Orbit: apply stop pose to orbit. Fly: restore saved position/rotation.
   */
  stop() {
    if (!this.isPlaying) return;

    // Camera at stop is the "stopped frame" view
    let stateAtStop = null;
    if (this._viewer) {
      const isFlyMode = typeof window.__flyMode?.getEnabled === 'function' && window.__flyMode.getEnabled();
      if (isFlyMode) {
        stateAtStop = this._viewer.getCameraState?.() ?? null;
      }
    }

    this.isPlaying = false;

    // Remove update listener
    if (this._animHandle) {
      try {
        this._animHandle.off();
      } catch (e) {
      }
      this._animHandle = null;
    }

    // Show frustums and path on stop
    this._setFrustumsVisible(true);

    if (this._viewer) {
      const isFlyMode = typeof window.__flyMode?.getEnabled === 'function' && window.__flyMode.getEnabled();
      if (isFlyMode) {
        // Fly 모드: 정지 시점 위치·방향으로 카메라 복원, 궤도 중심은 재생 전으로 유지
        if (stateAtStop?.position || stateAtStop?.rotation) {
          this._viewer.setCameraState?.({
            position: stateAtStop.position,
            rotation: stateAtStop.rotation,
          });
        }
        if (this._savedOrbitTargetBeforePlay && typeof this._viewer.syncOrbitFromCameraWithTarget === 'function') {
          this._viewer.syncOrbitFromCameraWithTarget(this._savedOrbitTargetBeforePlay);
        } else {
          this._viewer.syncOrbitFromCamera?.();
        }
        this._savedCameraPositionBeforePlay = null;
        this._savedCameraRotationBeforePlay = null;
        this._savedOrbitTargetBeforePlay = null;
      } else {
        // Orbit 모드: 궤도 중심은 재생 전으로 복원, 카메라 위치/방향은 정지 시점 유지
        if (this._savedOrbitTargetBeforePlay && typeof this._viewer.syncOrbitFromCameraWithTarget === 'function') {
          this._viewer.syncOrbitFromCameraWithTarget(this._savedOrbitTargetBeforePlay);
        } else {
          this._viewer.syncOrbitFromCamera?.();
        }
        if (this._orbitDisabledByPlay) {
          this._viewer.setOrbitEnabled?.(this._prevOrbitEnabled);
          this._orbitDisabledByPlay = false;
        }
        this._savedOrbitTargetBeforePlay = null;
      }
    }

    this.onPlayStateChange?.(false);
  }

  /**
   * 재생/정지 토글
   */
  toggle() {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.play();
    }
  }

  /**
   * 재생 루프 (SuperSplat timeline.ts: animHandle — update에서 time 갱신, setFrame, timeline.time)
   * @private
   */
  _tick(dt) {
    if (!this.isPlaying) return;

    const frames = this._getFrames();
    const frameRate = this._getFrameRate();

    this._time = (this._time + dt * frameRate) % frames;
    const newFrame = Math.floor(this._time);
    if (newFrame !== this.frame) {
      this.frame = newFrame;
      this._setFrame(this.frame);
      this._onFrameChange?.(this.frame);
    }

    const fps = frameRate;
    const discreteTime = (this.frame + 0.5) / fps;
    this._updatePinPosition(discreteTime);
    this._updateObjectsVisibility(discreteTime, { dt, isPlaying: true, frameIndex: this.frame });

    // 카메라만 연속 시간으로 보간 (부드러운 이동)
    const continuousTime = (this._time + 0.5) / fps;
    const keyframes = this._getKeyframes();
    if (keyframes.length >= 2) {
      this._applyInterpolatedState(continuousTime);
    }
    
    this.onTimeUpdate?.(discreteTime);
  }

  /**
   * 특정 프레임으로 이동 (SuperSplat timeline.ts: setFrame(value) — frame 갱신 후 events.fire('timeline.frame', frame))
   * @param {number} frameIndex
   */
  setFrame(frameIndex) {
    const frames = this._getFrames();
    const frameRate = this._getFrameRate();

    if (frameIndex < 0) frameIndex = 0;
    if (frameIndex >= frames) frameIndex = frames - 1;
    if (this.frame === frameIndex) return;

    this.frame = frameIndex;
    this._time = frameIndex;
    this._onFrameChange?.(this.frame);

    // Pin / 가시성 / 카메라
    const fps = frameRate;
    const currentTime = (this.frame + 0.5) / fps;
    this._updatePinPosition(currentTime);
    this._updateObjectsVisibility(currentTime, { dt: 0, isPlaying: false, frameIndex: this.frame });
    
    // 카메라 보간 적용
    const keyframes = this._getKeyframes();
    if (keyframes.length >= 2) {
      this._applyInterpolatedState(currentTime);
    }
    
    this.onTimeUpdate?.(currentTime);
  }

  /**
   * 현재 프레임에 해당하는 카메라만 다시 적용 (Export Video 등에서 시퀀스 대기 후 카메라 복원용)
   */
  applyCameraForCurrentFrame() {
    const frameRate = this._getFrameRate();
    const currentTime = (this.frame + 0.5) / frameRate;
    const keyframes = this._getKeyframes();
    if (keyframes.length >= 1) {
      this._applyInterpolatedState(currentTime);
    }
  }

  /**
   * 연속 시간(초)으로 이동 — 영상 추출 등. 시퀀스/핀은 정수 프레임, 카메라는 t에서 보간.
   * @param {number} t - 타임라인 시간(초)
   */
  setTime(t) {
    const frames = this._getFrames();
    const frameRate = this._getFrameRate();
    const maxSeconds = frames / frameRate;
    const tClamped = Math.max(0, Math.min(maxSeconds, Number(t) || 0));

    this._time = tClamped;
    const newFrame = Math.floor(tClamped * frameRate);
    const clampedFrame = Math.max(0, Math.min(frames - 1, newFrame));
    const frameChanged = this.frame !== clampedFrame;
    this.frame = clampedFrame;

    if (frameChanged) this._onFrameChange?.(this.frame);

    this._updatePinPosition(tClamped);
    this._updateObjectsVisibility(tClamped, { dt: 0, isPlaying: false, frameIndex: this.frame });

    const keyframes = this._getKeyframes();
    if (keyframes.length >= 1) {
      this._applyInterpolatedState(tClamped);
    }
    this.onTimeUpdate?.(tClamped);
  }

  /**
   * 특정 시간으로 이동 (기존 호환성 유지)
   * @param {number} t
   */
  seekTo(t) {
    const frameRate = this._getFrameRate();
    const frameIndex = Math.floor(t * frameRate);
    this.setFrame(frameIndex);
  }

  /**
   * 현재 시간 반환 (초)
   */
  get currentTime() {
    const frameRate = this._getFrameRate();
    return (this.frame + 0.5) / frameRate;
  }

  /**
   * 현재 시간 설정 (초) - 프레임으로 변환
   */
  set currentTime(t) {
    const frameRate = this._getFrameRate();
    const frameIndex = Math.floor(t * frameRate);
    this.setFrame(frameIndex);
  }

  /**
   * 카메라 이동 오브젝트 선택 해제
   * @private
   */
  _clearMovingObjectSelection() {
    const movingObjects = this._getMovingObjects();
    if (!movingObjects || !Array.isArray(movingObjects)) return;
    
    movingObjects.forEach(obj => {
      if (obj && obj.manager && typeof obj.manager.clearSelection === 'function') {
        obj.manager.clearSelection();
      }
    });
    
    const manager = this._getMovingObjectsManager?.();
    if (manager && typeof manager.clearSelection === 'function') {
      manager.clearSelection();
    }
  }

  /**
   * 특정 시간의 보간된 카메라 상태 적용
   * @private
   */
  _applyInterpolatedState(t) {
    const keyframes = this._getKeyframes();
    if (!this._viewer || keyframes.length === 0) return;
    
    const pc = window.pc;
    if (!pc) return;
    
    if (keyframes.length === 1) {
      this._viewer.setCameraState(keyframes[0].state);
      return;
    }
    
    const frames = this._getFrames();
    const frameRate = this._getFrameRate();
    const maxSeconds = frames / frameRate;
    const firstKf = keyframes[0];
    const lastKf = keyframes[keyframes.length - 1];
    const movingObjects = this._getMovingObjects();
    
    let fromKf, toKf, alpha, movingObj;
    
    // 구간 판정 (무한 루프 고려)
    if (t < firstKf.t) {
      fromKf = lastKf;
      toKf = firstKf;
      const wrapDuration = (maxSeconds - lastKf.t) + firstKf.t;
      const elapsed = (maxSeconds - lastKf.t) + t;
      alpha = wrapDuration > 0 ? elapsed / wrapDuration : 0;
      movingObj = movingObjects.find(o => 
        o.fromKeyframe.id === lastKf.id && o.toKeyframe.id === firstKf.id
      );
    } else if (t > lastKf.t) {
      fromKf = lastKf;
      toKf = firstKf;
      const wrapDuration = (maxSeconds - lastKf.t) + firstKf.t;
      const elapsed = t - lastKf.t;
      alpha = wrapDuration > 0 ? elapsed / wrapDuration : 0;
      movingObj = movingObjects.find(o => 
        o.fromKeyframe.id === lastKf.id && o.toKeyframe.id === firstKf.id
      );
    } else {
      fromKf = firstKf;
      toKf = keyframes[1];
      
      for (let i = 0; i < keyframes.length - 1; i++) {
        if (t >= keyframes[i].t && t <= keyframes[i + 1].t) {
          fromKf = keyframes[i];
          toKf = keyframes[i + 1];
          break;
        }
      }
      
      const duration = toKf.t - fromKf.t;
      alpha = duration > 0 ? (t - fromKf.t) / duration : 0;
      movingObj = movingObjects.find(o => 
        o.fromKeyframe.id === fromKf.id && o.toKeyframe.id === toKf.id
      );
    }
    
    alpha = Math.max(0, Math.min(1, alpha));
    alpha = this._remapAlpha(alpha);
    
    const curvature = movingObj?.curvature ?? 1;
    const angle = movingObj?.angle ?? 0;
    
    this._applyCurveInterpolation(fromKf.state, toKf.state, alpha, curvature, angle, pc);
  }

  _remapAlpha(alpha) {
    const a = Math.max(0, Math.min(1, Number(alpha) || 0));
    if (a <= 0) return 0;
    if (a >= 1) return 1;

    if (a < 0.5) {
      const t = a / 0.5;
      const eased = this._applyEase01(t, this._speedProfileStart);
      return eased * 0.5;
    }

    const t = (a - 0.5) / 0.5;
    const eased = this._applyEase01(t, this._speedProfileEnd);
    return 0.5 + eased * 0.5;
  }

  _applyEase01(t, value) {
    if (!Number.isFinite(t)) return 0;
    const v = Math.max(-100, Math.min(100, Number(value) || 0));
    if (v === 0) return t;

    const p = 1 + 4 * (Math.abs(v) / 100);
    if (v > 0) {
      return Math.pow(t, p);
    }
    return 1 - Math.pow(1 - t, p);
  }

  setCameraMoveSpeedProfile(startValue, endValue) {
    const clamp = (v) => Math.max(-100, Math.min(100, Number(v) || 0));
    this._speedProfileStart = clamp(startValue);
    this._speedProfileEnd = clamp(endValue);
  }

  _applyCurveInterpolation(from, to, alpha, curvature, angle, pc) {
    const fromPos = new pc.Vec3(from.position.x, from.position.y, from.position.z);
    const toPos = new pc.Vec3(to.position.x, to.position.y, to.position.z);
    
    const controlPoint = this._calculateControlPoint(fromPos, toPos, curvature, angle, pc);
    const pos = this._quadraticBezier(fromPos, controlPoint, toPos, alpha, pc);
    
    const fromRot = new pc.Quat(from.rotation.x, from.rotation.y, from.rotation.z, from.rotation.w);
    const toRot = new pc.Quat(to.rotation.x, to.rotation.y, to.rotation.z, to.rotation.w);
    const rot = new pc.Quat();
    rot.slerp(fromRot, toRot, alpha);

    const rotNoRoll = this._removeRollFromQuat(rot, pc);
    
    this._viewer.setCameraOnPathWithQuat(
      { x: pos.x, y: pos.y, z: pos.z },
      rotNoRoll
    );
  }

  _removeRollFromQuat(quat, pc) {
    const forward = quat.transformVector(new pc.Vec3(0, 0, -1)).normalize();
    const worldUp = new pc.Vec3(0, 1, 0);
    const dotUp = Math.abs(forward.dot(worldUp));
    const up = dotUp > 0.999 ? new pc.Vec3(1, 0, 0) : worldUp;
    const lookAtMat = new pc.Mat4().setLookAt(pc.Vec3.ZERO, forward, up);
    const out = new pc.Quat();
    out.setFromMat4(lookAtMat);
    out.normalize();
    return out;
  }

  _calculateControlPoint(startPos, endPos, curvature, angleDeg, pc) {
    const mid = new pc.Vec3().lerp(startPos, endPos, 0.5);
    const direction = new pc.Vec3().sub2(endPos, startPos);
    const length = direction.length();
    const up = new pc.Vec3(0, 1, 0);
    const perpendicular = new pc.Vec3().cross(direction, up).normalize();
    
    if (perpendicular.length() < 0.001) {
      perpendicular.set(1, 0, 0);
    }
    
    const angleRad = angleDeg * Math.PI / 180;
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);
    const dirNorm = direction.clone().normalize();
    const rotatedPerp = new pc.Vec3();
    const perpCrossDir = new pc.Vec3().cross(dirNorm, perpendicular);
    const perpDotDir = perpendicular.dot(dirNorm);
    
    rotatedPerp.x = perpendicular.x * cos + perpCrossDir.x * sin + dirNorm.x * perpDotDir * (1 - cos);
    rotatedPerp.y = perpendicular.y * cos + perpCrossDir.y * sin + dirNorm.y * perpDotDir * (1 - cos);
    rotatedPerp.z = perpendicular.z * cos + perpCrossDir.z * sin + dirNorm.z * perpDotDir * (1 - cos);
    
    const controlPoint = new pc.Vec3();
    controlPoint.x = mid.x + rotatedPerp.x * curvature * length * 0.5;
    controlPoint.y = mid.y + rotatedPerp.y * curvature * length * 0.5;
    controlPoint.z = mid.z + rotatedPerp.z * curvature * length * 0.5;
    
    return controlPoint;
  }

  _quadraticBezier(p0, p1, p2, t, pc) {
    const oneMinusT = 1 - t;
    return new pc.Vec3(
      oneMinusT * oneMinusT * p0.x + 2 * oneMinusT * t * p1.x + t * t * p2.x,
      oneMinusT * oneMinusT * p0.y + 2 * oneMinusT * t * p1.y + t * t * p2.y,
      oneMinusT * oneMinusT * p0.z + 2 * oneMinusT * t * p1.z + t * t * p2.z
    );
  }
}

export default PlaybackController;
