/**
 * FlyMode – PlayCanvas fly camera controller.
 * WASD: move, Q/E: up/down, LMB drag: look, RMB drag: pan, wheel: forward/back, Shift: speed boost.
 * Switches to/from Orbit while keeping camera state.
 */

export class FlyMode {
  /**
   * Move speed (0.1–5.0 UI scale). Used by CameraSettings.
   * @param {number} speed
   */
  setMoveSpeed(speed) {
    this.moveSpeed = speed * 10;
  }

  /**
   * @param {Object} viewer - PlayCanvasViewer instance
   */
  constructor(viewer) {
    this.viewer = viewer;

    // Config
    this.moveSpeed = 10;
    this.shiftMultiplier = 3.0;
    this.rotateSpeed = 0.003;
    this.panSpeed = 0.005;
    this.wheelSpeed = 2.0;

    // State
    this.isEnabled = false;
    this._isLeftMouseDown = false;
    this._isRightMouseDown = false;
    this._lastMouseX = 0;
    this._lastMouseY = 0;
    this._keys = new Set();
    this._lastTime = 0;
    this._rafId = null;

    this._yaw = 0;
    this._pitch = 0;
    this._yawTarget = 0;
    this._pitchTarget = 0;
    this._smoothing = 22;
    this._moveSmoothing = 14;
    this._velocity = null;
    this._pendingPosImpulse = null;

    // Orbit state saved when entering Fly; restored when returning
    this._savedOrbitState = null;

    // Return-to-Orbit animation
    this._isReturning = false;
    this._returnStartTime = 0;
    this._returnDuration = 500;
    this._returnStartPos = null;
    this._returnStartYaw = 0;
    this._returnStartPitch = 0;
    this._returnStartRoll = 0;

    this._onMouseDown = this._onMouseDown.bind(this);
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onMouseUp = this._onMouseUp.bind(this);
    this._onWheel = this._onWheel.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);
    this._onContextMenu = this._onContextMenu.bind(this);
    this._onCameraStateApplied = this._onCameraStateApplied.bind(this);
    this._tick = this._tick.bind(this);
  }

  enable() {
    if (this.isEnabled) return;
    this.isEnabled = true;

    const canvas = this.viewer?.canvas;
    if (!canvas) return;

    this._saveOrbitState();
    this._syncFromCamera();
    this.viewer.setOrbitEnabled?.(false);

    canvas.addEventListener('mousedown', this._onMouseDown);
    canvas.addEventListener('wheel', this._onWheel, { passive: false });
    canvas.addEventListener('contextmenu', this._onContextMenu);
    window.addEventListener('mousemove', this._onMouseMove);
    window.addEventListener('mouseup', this._onMouseUp);
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
    window.addEventListener('liamviewer:camerastateapplied', this._onCameraStateApplied);

    this._lastTime = performance.now();
    this._rafId = requestAnimationFrame(this._tick);
  }

  disable() {
    if (!this.isEnabled) return;
    this.isEnabled = false;

    const canvas = this.viewer?.canvas;
    if (canvas) {
      canvas.removeEventListener('mousedown', this._onMouseDown);
      canvas.removeEventListener('wheel', this._onWheel);
      canvas.removeEventListener('contextmenu', this._onContextMenu);
    }
    window.removeEventListener('mousemove', this._onMouseMove);
    window.removeEventListener('mouseup', this._onMouseUp);
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
    window.removeEventListener('liamviewer:camerastateapplied', this._onCameraStateApplied);

    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }

    this._isLeftMouseDown = false;
    this._isRightMouseDown = false;
    this._keys.clear();
    this._startReturnAnimation();
  }

  getEnabled() {
    return this.isEnabled;
  }

  /** Derive yaw/pitch from camera forward to stay in sync with lookAt. */
  _syncFromCamera() {
    const camera = this.viewer?.cameraEntity;
    if (!camera) return;

    const forward = camera.forward;
    this._yaw = Math.atan2(-forward.x, -forward.z) * (180 / Math.PI);
    this._pitch = Math.asin(forward.y) * (180 / Math.PI);
    this._pitch = Math.max(-89, Math.min(89, this._pitch));
    this._yawTarget = this._yaw;
    this._pitchTarget = this._pitch;
  }

  /** Sync internal yaw/pitch when camera is updated externally (e.g. keyframe jump). */
  _onCameraStateApplied() {
    if (!this.isEnabled) return;
    this._syncFromCamera();
  }

  _saveOrbitState() {
    const camera = this.viewer?.cameraEntity;
    if (!camera || !this.viewer) return;

    const pos = camera.getPosition();
    const euler = camera.getLocalEulerAngles();
    this._savedOrbitState = {
      position: { x: pos.x, y: pos.y, z: pos.z },
      yaw: euler.y,
      pitch: euler.x,
      roll: euler.z,
      target: { ...this.viewer._orbitTarget },
      distance: this.viewer._orbitDistance,
      orbitYaw: this.viewer._orbitYaw,
      orbitPitch: this.viewer._orbitPitch,
    };
  }

  _startReturnAnimation() {
    if (!this._savedOrbitState) {
      this.viewer.setOrbitEnabled?.(true);
      return;
    }

    const camera = this.viewer?.cameraEntity;
    if (!camera) {
      this.viewer.setOrbitEnabled?.(true);
      return;
    }

    const pc = window.pc;
    if (!pc) {
      this.viewer.setOrbitEnabled?.(true);
      return;
    }

    const currentPos = camera.getPosition();
    const currentEuler = camera.getLocalEulerAngles();
    this._returnStartPos = { x: currentPos.x, y: currentPos.y, z: currentPos.z };
    this._returnStartYaw = currentEuler.y;
    this._returnStartPitch = currentEuler.x;
    this._returnStartRoll = currentEuler.z;
    this._isReturning = true;
    this._returnStartTime = performance.now();
    this._animateReturn();
  }

  _animateReturn() {
    if (!this._isReturning) return;

    const camera = this.viewer?.cameraEntity;
    if (!camera || !this._savedOrbitState) {
      this._finishReturn();
      return;
    }

    const now = performance.now();
    const elapsed = now - this._returnStartTime;
    let t = Math.min(1, elapsed / this._returnDuration);
    t = 1 - Math.pow(1 - t, 3);

    const saved = this._savedOrbitState;
    const start = this._returnStartPos;

    const x = start.x + (saved.position.x - start.x) * t;
    const y = start.y + (saved.position.y - start.y) * t;
    const z = start.z + (saved.position.z - start.z) * t;
    const yaw = this._lerpAngle(this._returnStartYaw, saved.yaw, t);
    const pitch = this._returnStartPitch + (saved.pitch - this._returnStartPitch) * t;
    const startRoll = this._normalizeRollZ(this._returnStartRoll);
    const endRoll = this._normalizeRollZ(saved.roll);
    const roll = this._lerpAngle(startRoll, endRoll, t);

    camera.setPosition(x, y, z);
    camera.setLocalEulerAngles(pitch, yaw, roll);

    if (t >= 1) {
      this._finishReturn();
    } else {
      requestAnimationFrame(() => this._animateReturn());
    }
  }

  _lerpAngle(a, b, t) {
    let diff = b - a;
    while (diff > 180) diff -= 360;
    while (diff < -180) diff += 360;
    return a + diff * t;
  }

  _normalizeRollZ(zDeg) {
    if (!Number.isFinite(zDeg)) return 0;
    let z = zDeg % 360;
    if (z < 0) z += 360;
    return z >= 90 && z < 270 ? 180 : 0;
  }

  _finishReturn() {
    this._isReturning = false;

    if (this._savedOrbitState && this.viewer) {
      const saved = this._savedOrbitState;
      this.viewer._orbitTarget = { ...saved.target };
      this.viewer._orbitDistance = saved.distance;
      this.viewer._orbitYaw = saved.orbitYaw;
      this.viewer._orbitPitch = saved.orbitPitch;
      this.viewer._updateCameraFromOrbit?.();

      const camera = this.viewer?.cameraEntity;
      if (camera && Number.isFinite(saved.roll)) {
        const euler = camera.getLocalEulerAngles();
        camera.setLocalEulerAngles(euler.x, euler.y, this._normalizeRollZ(saved.roll));
      }
    }

    this.viewer.setOrbitEnabled?.(true);
  }

  _onContextMenu(e) {
    e.preventDefault();
  }

  _onMouseDown(e) {
    if (e.button === 0) {
      this._isLeftMouseDown = true;
      this._lastMouseX = e.clientX;
      this._lastMouseY = e.clientY;
    } else if (e.button === 2) {
      this._isRightMouseDown = true;
      this._lastMouseX = e.clientX;
      this._lastMouseY = e.clientY;
    }
  }

  _onMouseMove(e) {
    if (!this.isEnabled) return;

    const dx = e.clientX - this._lastMouseX;
    const dy = e.clientY - this._lastMouseY;
    this._lastMouseX = e.clientX;
    this._lastMouseY = e.clientY;

    if (this._isLeftMouseDown) {
      this._yawTarget -= dx * this.rotateSpeed * 100;
      this._pitchTarget -= dy * this.rotateSpeed * 100;
      this._pitchTarget = Math.max(-89, Math.min(89, this._pitchTarget));
    } else if (this._isRightMouseDown) {
      this._pan(dx, dy);
    }
  }

  _onMouseUp(e) {
    if (e.button === 0) this._isLeftMouseDown = false;
    if (e.button === 2) this._isRightMouseDown = false;
  }

  _onWheel(e) {
    e.preventDefault();
    if (!this.isEnabled) return;

    const camera = this.viewer?.cameraEntity;
    if (!camera) return;

    const pc = window.pc;
    if (!pc) return;

    const delta = -e.deltaY * 0.001 * this.wheelSpeed;
    let speed = this.wheelSpeed;
    if (this._keys.has('ShiftLeft') || this._keys.has('ShiftRight')) {
      speed *= this.shiftMultiplier;
    }
    const forward = camera.forward.clone();
    const move = forward.mulScalar(delta * speed);

    if (!this._pendingPosImpulse) {
      this._pendingPosImpulse = move;
    } else {
      this._pendingPosImpulse.add(move);
    }
  }

  _onKeyDown(e) {
    if (!this.isEnabled) return;
    const code = e.code;
    if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyQ', 'KeyE', 'ShiftLeft', 'ShiftRight'].includes(code)) {
      this._keys.add(code);
    }
  }

  _onKeyUp(e) {
    this._keys.delete(e.code);
  }

  _tick() {
    if (!this.isEnabled) return;

    const now = performance.now();
    const dt = (now - this._lastTime) / 1000;
    this._lastTime = now;

    this._processMovement(dt);
    this._applySmoothing(dt);
    this._rafId = requestAnimationFrame(this._tick);
  }

  _applySmoothing(dt) {
    const camera = this.viewer?.cameraEntity;
    if (!camera) return;

    const pc = window.pc;
    if (!pc) return;

    // When timeline drives camera (2+ keyframes), only sync angles; don’t overwrite position
    if (window.__timeline?.isCameraDrivenByPlayback) {
      const euler = camera.getLocalEulerAngles();
      this._pitch = euler.x;
      this._yaw = euler.y;
      this._pitchTarget = this._pitch;
      this._yawTarget = this._yaw;
      this._velocityTarget = null;
      this._pendingPosImpulse = null;
      if (this._velocity) this._velocity.set(0, 0, 0);
      return;
    }

    if (!this._velocity) {
      this._velocity = new pc.Vec3(0, 0, 0);
    }

    const rotAlpha = 1 - Math.exp(-this._smoothing * dt);
    const moveAlpha = 1 - Math.exp(-this._moveSmoothing * dt);

    let deltaYaw = this._yawTarget - this._yaw;
    while (deltaYaw > 180) deltaYaw -= 360;
    while (deltaYaw < -180) deltaYaw += 360;
    this._yaw += deltaYaw * rotAlpha;
    this._pitch += (this._pitchTarget - this._pitch) * rotAlpha;
    this._pitch = Math.max(-89, Math.min(89, this._pitch));

    camera.setLocalEulerAngles(this._pitch, this._yaw, 0);

    if (this._pendingPosImpulse) {
      const pos = camera.getPosition();
      camera.setPosition(pos.x + this._pendingPosImpulse.x, pos.y + this._pendingPosImpulse.y, pos.z + this._pendingPosImpulse.z);
      this._pendingPosImpulse = null;
    }

    if (this._velocityTarget) {
      this._velocity.x += (this._velocityTarget.x - this._velocity.x) * moveAlpha;
      this._velocity.y += (this._velocityTarget.y - this._velocity.y) * moveAlpha;
      this._velocity.z += (this._velocityTarget.z - this._velocity.z) * moveAlpha;
      const pos = camera.getPosition();
      camera.setPosition(pos.x + this._velocity.x * dt, pos.y + this._velocity.y * dt, pos.z + this._velocity.z * dt);
    }
  }

  _processMovement(dt) {
    const camera = this.viewer?.cameraEntity;
    if (!camera) return;

    const pc = window.pc;
    if (!pc) return;

    let speed = this.moveSpeed;
    if (this._keys.has('ShiftLeft') || this._keys.has('ShiftRight')) {
      speed *= this.shiftMultiplier;
    }

    const move = new pc.Vec3(0, 0, 0);
    const forward = camera.forward;
    const right = camera.right;
    const up = new pc.Vec3(0, 1, 0);

    if (this._keys.has('KeyW')) move.add(forward);
    if (this._keys.has('KeyS')) move.sub(forward);
    if (this._keys.has('KeyD')) move.add(right);
    if (this._keys.has('KeyA')) move.sub(right);
    if (this._keys.has('KeyE')) move.add(up);
    if (this._keys.has('KeyQ')) move.sub(up);

    if (move.lengthSq() > 0) {
      move.normalize().mulScalar(speed);
    }
    this._velocityTarget = move;
  }

  _pan(dx, dy) {
    const camera = this.viewer?.cameraEntity;
    if (!camera) return;

    const pc = window.pc;
    if (!pc) return;

    const right = camera.right.clone();
    const up = camera.up.clone();
    const panX = -dx * this.panSpeed;
    const panY = dy * this.panSpeed;
    const move = right.mulScalar(panX).add(up.mulScalar(panY));

    if (!this._pendingPosImpulse) {
      this._pendingPosImpulse = move;
    } else {
      this._pendingPosImpulse.add(move);
    }
  }

  dispose() {
    this.disable();
  }
}
