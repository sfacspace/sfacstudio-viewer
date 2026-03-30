/** Object inspector: transform (position/rotation/scale) display and edit; uniform scale with gizmo sync. */
export class InspectorController {
  constructor() {
    this._containerEl = null;
    this._nameEl = null;
    this._posX = null;
    this._posY = null;
    this._posZ = null;
    this._rotX = null;
    this._rotY = null;
    this._rotZ = null;
    this._scaleX = null;
    this._scaleY = null;
    this._scaleZ = null;
    this._scaleUniformToggle = null;
    this._currentObject = null;
    this._eventsInitialized = false;
    this._uniformScaleEnabled = true;
    this._previousScaleValues = { x: 1, y: 1, z: 1 };
    this._uniformScaleRatio = { x: 1, y: 1, z: 1 };
    this._gizmoController = null;
    this._isExternalUpdate = false;
  }

  init(gizmoController = null) {
    this._gizmoController = gizmoController;
    
    this._containerEl = document.getElementById("objectInspector");
    this._nameEl = document.getElementById("inspectorName");
    this._posX = document.getElementById("inspectorPosX");
    this._posY = document.getElementById("inspectorPosY");
    this._posZ = document.getElementById("inspectorPosZ");
    this._rotX = document.getElementById("inspectorRotX");
    this._rotY = document.getElementById("inspectorRotY");
    this._rotZ = document.getElementById("inspectorRotZ");
    this._scaleX = document.getElementById("inspectorScaleX");
    this._scaleY = document.getElementById("inspectorScaleY");
    this._scaleZ = document.getElementById("inspectorScaleZ");
    this._scaleUniformToggle = document.getElementById("inspectorScaleUniformToggle");
    if (this._scaleUniformToggle) {
        const onIcon = this._scaleUniformToggle.querySelector('.scale-link-icon--on');
        const offIcon = this._scaleUniformToggle.querySelector('.scale-link-icon--off');
        const updateIcon = () => {
          if (this._uniformScaleEnabled) {
            this._scaleUniformToggle.setAttribute("aria-pressed", "true");
            if (onIcon) onIcon.style.display = "flex";
            if (offIcon) offIcon.style.display = "none";
            this._captureCurrentScaleRatio();
          } else {
            this._scaleUniformToggle.setAttribute("aria-pressed", "false");
            if (onIcon) onIcon.style.display = "none";
            if (offIcon) offIcon.style.display = "flex";
          }
        };
        this._uniformScaleEnabled = true;
        updateIcon();
        this._scaleUniformToggle.addEventListener("click", () => {
          this._uniformScaleEnabled = !this._uniformScaleEnabled;
          updateIcon();
          this._syncUniformScaleToGizmo();
        });
    }
    this.hide("idle");
    this._setupInputEvents();
    this._syncUniformScaleToGizmo();
  }

  _syncUniformScaleToGizmo() {
    if (this._gizmoController) {
      this._gizmoController.setUniformScale(this._uniformScaleEnabled);
    }
  }

  setGizmoController(gizmoController) {
    this._gizmoController = gizmoController;
    if (gizmoController) this._syncUniformScaleToGizmo();
  }

  _captureCurrentScaleRatio() {
    const x = parseFloat(this._scaleX?.value) || 1;
    const y = parseFloat(this._scaleY?.value) || 1;
    const z = parseFloat(this._scaleZ?.value) || 1;
    const baseScale = x !== 0 ? x : 1;
    this._uniformScaleRatio = { 
      x: 1, 
      y: y / baseScale, 
      z: z / baseScale 
    };
    
    this._previousScaleValues = { x, y, z };
    if (this._gizmoController) {
      this._gizmoController.updateScaleRatio(x, y, z);
    }
  }

  show(obj) {
    const primaryEntity = this._getPrimaryEntity(obj);
    
    if (!obj || !primaryEntity) {
      this.hide("idle");
      return;
    }
    
    this._currentObject = obj;
    if (this._containerEl) {
      this._containerEl.classList.remove("is-hidden");
      this._containerEl.classList.remove("is-inspector-idle");
    }
    if (this._nameEl) {
      this._nameEl.textContent = obj.name || "Unknown";
    }
    this._updateFieldsFromEntity();
    this._captureCurrentScaleRatio();
  }

  _getPrimaryEntity(obj) {
    if (!obj) return null;
    if (obj.isMultiFile && obj.files?.length > 0) {
      return obj.files[0].entity || obj.entity || null;
    }
    return obj.entity;
  }

  /**
   * @param {'idle'|'collapse'} mode - idle: no selection, panel still visible; collapse: tool panels off (hide block)
   */
  hide(mode = "idle") {
    this._currentObject = null;
    if (this._containerEl) {
      if (mode === "collapse") {
        this._containerEl.classList.add("is-hidden");
        this._containerEl.classList.remove("is-inspector-idle");
      } else {
        this._containerEl.classList.remove("is-hidden");
        this._containerEl.classList.add("is-inspector-idle");
      }
    }

    if (this._nameEl) {
      this._nameEl.textContent = "";
    }
    this._resetFields();
  }

  getCurrentObject() {
    return this._currentObject;
  }

  isVisible() {
    return this._currentObject !== null;
  }

  _updateFieldsFromEntity(fromGizmo = false) {
    const entity = this._getPrimaryEntity(this._currentObject);
    if (!entity) return;
    const pos = entity.getLocalPosition();
    const rot = entity.getLocalEulerAngles();
    const scale = entity.getLocalScale();
    if (this._posX) this._posX.value = pos.x.toFixed(2);
    if (this._posY) this._posY.value = pos.y.toFixed(2);
    if (this._posZ) this._posZ.value = pos.z.toFixed(2);
    if (this._rotX) this._rotX.value = rot.x.toFixed(1);
    if (this._rotY) this._rotY.value = rot.y.toFixed(1);
    if (this._rotZ) this._rotZ.value = rot.z.toFixed(1);
    if (this._scaleX) this._scaleX.value = scale.x.toFixed(2);
    if (this._scaleY) this._scaleY.value = scale.y.toFixed(2);
    if (this._scaleZ) this._scaleZ.value = scale.z.toFixed(2);
    if (!fromGizmo) {
      this._previousScaleValues = { x: scale.x, y: scale.y, z: scale.z };
    }
  }

  updateFromExternal(obj, isRealtime = false) {
    if (obj !== this._currentObject) return;
    
    this._isExternalUpdate = true;
    this._updateFieldsFromEntity(true);
    this._isExternalUpdate = false;
  }

  _resetFields() {
    if (this._posX) this._posX.value = "0";
    if (this._posY) this._posY.value = "0";
    if (this._posZ) this._posZ.value = "0";
    if (this._rotX) this._rotX.value = "0";
    if (this._rotY) this._rotY.value = "0";
    if (this._rotZ) this._rotZ.value = "0";
    if (this._scaleX) this._scaleX.value = "1";
    if (this._scaleY) this._scaleY.value = "1";
    if (this._scaleZ) this._scaleZ.value = "1";
    
    this._uniformScaleRatio = { x: 1, y: 1, z: 1 };
    this._previousScaleValues = { x: 1, y: 1, z: 1 };
  }

  _applyFieldsToEntity() {
    if (!this._currentObject) return;
    const posX = parseFloat(this._posX?.value) || 0;
    const posY = parseFloat(this._posY?.value) || 0;
    const posZ = parseFloat(this._posZ?.value) || 0;
    const rotX = parseFloat(this._rotX?.value) || 0;
    const rotY = parseFloat(this._rotY?.value) || 0;
    const rotZ = parseFloat(this._rotZ?.value) || 0;
    const scaleX = parseFloat(this._scaleX?.value) || 1;
    const scaleY = parseFloat(this._scaleY?.value) || 1;
    const scaleZ = parseFloat(this._scaleZ?.value) || 1;
    this._applyTransformToAllEntities(posX, posY, posZ, rotX, rotY, rotZ, scaleX, scaleY, scaleZ);
    if (this._gizmoController && !this._isExternalUpdate) {
      this._gizmoController.updateScaleRatio(scaleX, scaleY, scaleZ);
    }
  }

  _applyTransformToAllEntities(posX, posY, posZ, rotX, rotY, rotZ, scaleX, scaleY, scaleZ) {
    const obj = this._currentObject;
    if (!obj) return;

    const pos = { x: posX, y: posY, z: posZ };
    const rot = { x: rotX, y: rotY, z: rotZ };
    const scale = { x: scaleX, y: scaleY, z: scaleZ };

    if (obj.isMultiFile && obj.files) {
      for (const f of obj.files) {
        if (f.entity) {
          f.entity.setLocalPosition(posX, posY, posZ);
          f.entity.setLocalEulerAngles(rotX, rotY, rotZ);
          f.entity.setLocalScale(scaleX, scaleY, scaleZ);
        }
      }
    }
    if (obj.entity) {
      obj.entity.setLocalPosition(posX, posY, posZ);
      obj.entity.setLocalEulerAngles(rotX, rotY, rotZ);
      obj.entity.setLocalScale(scaleX, scaleY, scaleZ);
    }
  }

  _setupInputEvents() {
    if (this._eventsInitialized) return;
    
    const inputs = [
      this._posX, this._posY, this._posZ,
      this._rotX, this._rotY, this._rotZ,
      this._scaleX, this._scaleY, this._scaleZ
    ];
    inputs.forEach(input => {
      if (!input) return;
      input.addEventListener("click", (e) => {
        if (!this._isDragIconClick(e, input)) {
          input.select();
        }
      });
      input.addEventListener("focus", () => {
        setTimeout(() => input.select(), 0);
      });
      input.addEventListener("pointerdown", (e) => {
        if (this._isDragIconClick(e, input)) {
          e.preventDefault();
          this._startDrag(e, input);
        }
      });
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          if (this._uniformScaleEnabled && this._isScaleInput(input)) {
            this._applyUniformScale(input);
          } else {
            this._applyFieldsToEntity();
          }
          input.blur();
        }
      });
      input.addEventListener("blur", () => {
        if (this._uniformScaleEnabled && this._isScaleInput(input)) {
          this._applyUniformScale(input);
        } else {
          this._applyFieldsToEntity();
        }
      });
      input.addEventListener("change", () => {
        if (this._uniformScaleEnabled && this._isScaleInput(input)) {
          this._applyUniformScale(input);
        } else {
          this._applyFieldsToEntity();
        }
      });
    });
    
    this._eventsInitialized = true;
  }

  _isScaleInput(input) {
    return input === this._scaleX || input === this._scaleY || input === this._scaleZ;
  }

  _isDragIconClick(e, input) {
    const rect = input.getBoundingClientRect();
    const iconWidth = 24;
    return e.clientX > (rect.right - iconWidth);
  }

  _startDrag(e, input) {
    const startValue = parseFloat(input.value) || 0;
    const sensitivity = e.shiftKey ? 0.01 : 0.1;
    let accumulatedDelta = 0;

    input.classList.add('is-dragging');
    input.requestPointerLock();

    const onMove = (moveEvent) => {
      if (document.pointerLockElement === input) {
        accumulatedDelta -= moveEvent.movementY * sensitivity;
        const newValue = startValue + accumulatedDelta;
        const decimals = this._isScaleInput(input) ? 2 : 2;
        input.value = newValue.toFixed(decimals);
        if (this._uniformScaleEnabled && this._isScaleInput(input)) {
          this._applyUniformScale(input);
        } else {
          this._applyFieldsToEntity();
        }
      }
    };

    const onEnd = () => {
      input.classList.remove('is-dragging');
      if (document.pointerLockElement === input) {
        document.exitPointerLock();
      }
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onEnd);
      if (this._uniformScaleEnabled && this._isScaleInput(input)) {
        this._applyUniformScale(input);
      } else {
        this._applyFieldsToEntity();
      }
      if (this._uniformScaleEnabled && this._isScaleInput(input)) {
        this._captureCurrentScaleRatio();
      }
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onEnd);
  }

  _applyUniformScale(changedInput) {
    const x = parseFloat(this._scaleX?.value) || 1;
    const y = parseFloat(this._scaleY?.value) || 1;
    const z = parseFloat(this._scaleZ?.value) || 1;
    
    let base;
    let changedAxis;
    if (changedInput === this._scaleX) {
      base = x;
      changedAxis = 'x';
    } else if (changedInput === this._scaleY) {
      base = y;
      changedAxis = 'y';
    } else if (changedInput === this._scaleZ) {
      base = z;
      changedAxis = 'z';
    } else if (!changedInput && this._previousScaleValues) {
      const prev = this._previousScaleValues;
      const dx = Math.abs(x - prev.x);
      const dy = Math.abs(y - prev.y);
      const dz = Math.abs(z - prev.z);
      if (dx >= dy && dx >= dz) {
        base = x;
        changedAxis = 'x';
      } else if (dy >= dx && dy >= dz) {
        base = y;
        changedAxis = 'y';
      } else {
        base = z;
        changedAxis = 'z';
      }
    } else {
      base = x;
      changedAxis = 'x';
    }
    const ratio = this._uniformScaleRatio;
    let baseX;
    
    if (changedAxis === 'x') {
      baseX = base;
    } else if (changedAxis === 'y') {
      baseX = ratio.y !== 0 ? base / ratio.y : base;
    } else {
      baseX = ratio.z !== 0 ? base / ratio.z : base;
    }
    if (this._scaleX && this._scaleY && this._scaleZ) {
      const newX = baseX;
      const newY = baseX * ratio.y;
      const newZ = baseX * ratio.z;
      
      this._scaleX.value = newX.toFixed(2);
      this._scaleY.value = newY.toFixed(2);
      this._scaleZ.value = newZ.toFixed(2);
      this._previousScaleValues = { 
        x: parseFloat(this._scaleX.value), 
        y: parseFloat(this._scaleY.value), 
        z: parseFloat(this._scaleZ.value) 
      };
    }
    
    this._applyFieldsToEntity();
  }

  isUniformScaleEnabled() {
    return this._uniformScaleEnabled;
  }

  setUniformScale(enabled) {
    this._uniformScaleEnabled = enabled;
    if (this._scaleUniformToggle) {
      const onIcon = this._scaleUniformToggle.querySelector('.scale-link-icon--on');
      const offIcon = this._scaleUniformToggle.querySelector('.scale-link-icon--off');
      
      if (enabled) {
        this._scaleUniformToggle.setAttribute("aria-pressed", "true");
        if (onIcon) onIcon.style.display = "flex";
        if (offIcon) offIcon.style.display = "none";
        this._captureCurrentScaleRatio();
      } else {
        this._scaleUniformToggle.setAttribute("aria-pressed", "false");
        if (onIcon) onIcon.style.display = "none";
        if (offIcon) offIcon.style.display = "flex";
      }
    }
    this._syncUniformScaleToGizmo();
  }

  dispose() {
    this._currentObject = null;
    this._containerEl = null;
    this._nameEl = null;
    this._posX = null;
    this._posY = null;
    this._posZ = null;
    this._rotX = null;
    this._rotY = null;
    this._rotZ = null;
    this._scaleX = null;
    this._scaleY = null;
    this._scaleZ = null;
    this._scaleUniformToggle = null;
    this._gizmoController = null;
  }
}

export default InspectorController;
