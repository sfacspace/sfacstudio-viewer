/** Camera settings UI (gizmo tooltip: FOV, frustum size, move speed). */
export class CameraSettings {
  constructor(viewer) {
    this.viewer = viewer;
    this.fovSlider = document.getElementById('gizmoFovSlider');
    this.fovInput = document.getElementById('gizmoFovInput');
    this.frustumSizeSlider = document.getElementById('gizmoFrustumSizeSlider');
    this.frustumSizeInput = document.getElementById('gizmoFrustumSizeInput');
    this.moveSpeedSlider = document.getElementById('gizmoMoveSpeedSlider');
    this.moveSpeedInput = document.getElementById('gizmoMoveSpeedInput');
    this.settings = { fov: 60, frustumSize: 1.0, moveSpeed: 1.0 };
    this.init();
  }

  init() {
    if (this.fovSlider && this.fovInput) {
      this.fovSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        this.updateFov(value);
      });
      this.fovInput.addEventListener('change', (e) => {
        const value = parseFloat(e.target.value);
        if (!isNaN(value)) this.updateFov(value);
        else e.target.value = this.settings.fov.toFixed(2);
      });
      this.fovInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const value = parseFloat(e.target.value);
          if (!isNaN(value)) {
            this.updateFov(value);
          } else {
            e.target.value = this.settings.fov.toFixed(2);
          }
          e.target.blur();
        }
      });
    }

    if (this.frustumSizeSlider && this.frustumSizeInput) {
      this.frustumSizeSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        this.updateFrustumSize(value);
      });
      this.frustumSizeInput.addEventListener('change', (e) => {
        const value = parseFloat(e.target.value);
        if (!isNaN(value)) this.updateFrustumSize(value);
        else e.target.value = this.settings.frustumSize.toFixed(2);
      });
      this.frustumSizeInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const value = parseFloat(e.target.value);
          if (!isNaN(value)) {
            this.updateFrustumSize(value);
          } else {
            e.target.value = this.settings.frustumSize.toFixed(2);
          }
          e.target.blur();
        }
      });
    }

    if (this.moveSpeedSlider && this.moveSpeedInput) {
      this.moveSpeedSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        this.updateMoveSpeed(value);
      });
      this.moveSpeedInput.addEventListener('change', (e) => {
        const value = parseFloat(e.target.value);
        if (!isNaN(value)) this.updateMoveSpeed(value);
        else e.target.value = this.settings.moveSpeed.toFixed(2);
      });
      this.moveSpeedInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const value = parseFloat(e.target.value);
          if (!isNaN(value)) {
            this.updateMoveSpeed(value);
          } else {
            e.target.value = this.settings.moveSpeed.toFixed(2);
          }
          e.target.blur();
        }
      });
    }
    this.applyInitialValues();
  }

  applyInitialValues() {
    this.updateFov(this.settings.fov, false);
    this.updateFrustumSize(this.settings.frustumSize, false);
    this.updateMoveSpeed(this.settings.moveSpeed, false);
  }

  updateFov(value, syncUI = true) {
    value = Math.max(10, Math.min(120, value));
    this.settings.fov = value;
    
    if (syncUI) {
      if (this.fovSlider) this.fovSlider.value = value;
      if (this.fovInput) this.fovInput.value = value.toFixed(1);
    }
    if (this.viewer?.cameraEntity?.camera) {
      this.viewer.cameraEntity.camera.fov = value;
    }
  }

  updateFrustumSize(value, syncUI = true) {
    value = Math.max(0.1, Math.min(2, value));
    this.settings.frustumSize = value;

    if (syncUI) {
      if (this.frustumSizeSlider) this.frustumSizeSlider.value = value;
      if (this.frustumSizeInput) this.frustumSizeInput.value = value.toFixed(2);
    }

    if (typeof window !== 'undefined') {
      window.__frustumScaleFactor = value;
      const fm = window.__timeline?._keyframes?._frustumManager;
      fm?.setScaleFactor?.(value);
    }
  }

  updateMoveSpeed(value, syncUI = true) {
    value = Math.max(0.1, Math.min(5, value));
    this.settings.moveSpeed = value;
    
    if (syncUI) {
      if (this.moveSpeedSlider) this.moveSpeedSlider.value = value;
      if (this.moveSpeedInput) this.moveSpeedInput.value = value.toFixed(2);
    }
    if (this.viewer?.setCameraSpeed) {
      this.viewer.setCameraSpeed(value);
    }
    if (window.__flyMode?.setMoveSpeed) {
      window.__flyMode.setMoveSpeed(value);
    }
  }

  getSettings() {
    return { ...this.settings };
  }

  reset() {
    this.settings = { fov: 60, frustumSize: 1.0, moveSpeed: 1.0 };
    this.updateFov(this.settings.fov, true);
    this.updateFrustumSize(this.settings.frustumSize, true);
    this.updateMoveSpeed(this.settings.moveSpeed, true);
  }
}
