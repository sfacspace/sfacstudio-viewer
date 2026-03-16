/** PlayCanvas translate/rotate/scale gizmo; uniform scale toggle. */
export class GizmoController {
  constructor(viewer) {
    this.viewer = viewer;
    this.app = null;
    this._mode = null;
    this._targetObject = null;
    this._gizmoLayer = null;
    this._translateGizmo = null;
    this._rotateGizmo = null;
    this._scaleGizmo = null;
    this._gizmoSize = 1.0;
    this._coordSpace = 'world';
    this._uniformScaleEnabled = true;
    this._scaleStartValues = { x: 1, y: 1, z: 1 };
    this._scaleRatio = { x: 1, y: 1, z: 1 };
    this._isScaleDragging = false;
    this.onTransformChange = null;
    this._isInteracting = false;
    this._wasFlyModeBeforeGizmo = false;
  }

  init() {
    if (!this.viewer?.app) return;
    this.app = this.viewer.app;
    const pc = window.pc;
    if (!pc?.Gizmo) return;
    this._gizmoLayer = pc.Gizmo.createLayer(this.app);
    const camera = this.viewer.cameraEntity?.camera;
    if (camera) {
      const layers = camera.layers;
      if (!layers.includes(this._gizmoLayer.id)) {
        camera.layers = [...layers, this._gizmoLayer.id];
      }
    }
    this._createGizmos();
  }

  _createGizmos() {
    const pc = window.pc;
    const camera = this.viewer.cameraEntity?.camera;
    
    if (!pc || !camera || !this._gizmoLayer) return;
    this._translateGizmo = new pc.TranslateGizmo(camera, this._gizmoLayer);
    this._translateGizmo.size = this._gizmoSize;
    this._translateGizmo.coordSpace = this._coordSpace;
    this._setupGizmoEvents(this._translateGizmo, 'transform');
    this._rotateGizmo = new pc.RotateGizmo(camera, this._gizmoLayer);
    this._rotateGizmo.size = this._gizmoSize;
    this._rotateGizmo.coordSpace = this._coordSpace;
    this._setupGizmoEvents(this._rotateGizmo, 'rotate');
    this._scaleGizmo = new pc.ScaleGizmo(camera, this._gizmoLayer);
    this._scaleGizmo.size = this._gizmoSize;
    this._scaleGizmo.coordSpace = this._coordSpace;
    if ('uniform' in this._scaleGizmo) {
      this._scaleGizmo.uniform = false;
    }
    this._setupGizmoEvents(this._scaleGizmo, 'scale');
  }

  _setupGizmoEvents(gizmo, type) {
    if (!gizmo) return;
    gizmo.on('transform:start', () => {
      this._isInteracting = true;
      window.__gizmoInteracting = true;
      window.__gizmoLastInteractMs = performance.now();
      this._wasFlyModeBeforeGizmo = window.__flyMode?.getEnabled?.() ?? false;
      this.viewer?.setOrbitEnabled?.(false);
      if (type === 'transform') {
        this._suspendRigidbodyForTarget();
      }
      if (type === 'scale') {
        this._isScaleDragging = true;
        this._captureScaleStartValues();
      }
    });
    gizmo.on('transform:move', () => {
      window.__gizmoLastInteractMs = performance.now();
      if (type === 'scale' && this._isScaleDragging && this._uniformScaleEnabled) {
        this._applyUniformScaleFromGizmo();
      }
      this._syncMultiFileTransform();
      this._persistSequenceTransform();
      if (this.onTransformChange && this._targetObject) {
        this.onTransformChange(this._targetObject, true);
      }
    });
    gizmo.on('transform:end', () => {
      if (!this._wasFlyModeBeforeGizmo) {
        this.viewer?.setOrbitEnabled?.(true);
      }

      this._isInteracting = false;
      window.__gizmoLastInteractMs = performance.now();
      setTimeout(() => {
        if (!this._isInteracting) {
          window.__gizmoInteracting = false;
        }
      }, 0);
      
      if (type === 'scale') {
        if (this._uniformScaleEnabled) {
          this._applyUniformScaleFromGizmo();
        }
        this._isScaleDragging = false;
        this._captureScaleStartValues();
        
        const primaryEntity = this._getPrimaryEntity(this._targetObject);
        if (primaryEntity) {
          const finalScale = primaryEntity.getLocalScale();
        }
      }
      if (type === 'transform') {
        this._resumeRigidbodyAndSyncForTarget();
      }
      this._syncMultiFileTransform();
      this._persistSequenceTransform();
      if (this.onTransformChange && this._targetObject) {
        this.onTransformChange(this._targetObject);
      }
    });
  }

  _captureScaleStartValues() {
    const primaryEntity = this._getPrimaryEntity(this._targetObject);
    if (!primaryEntity) return;
    const scale = primaryEntity.getLocalScale();
    this._scaleStartValues = { x: scale.x, y: scale.y, z: scale.z };
    const baseScale = Math.abs(scale.x) > 0.0001 ? scale.x : 1;
    this._scaleRatio = {
      x: 1,
      y: scale.y / baseScale,
      z: scale.z / baseScale
    };
  }

  _applyUniformScaleFromGizmo() {
    const primaryEntity = this._getPrimaryEntity(this._targetObject);
    if (!primaryEntity) return;
    const currentScale = primaryEntity.getLocalScale();
    const startScale = this._scaleStartValues;
    const safeStartX = Math.abs(startScale.x) > 0.0001 ? startScale.x : 1;
    const safeStartY = Math.abs(startScale.y) > 0.0001 ? startScale.y : 1;
    const safeStartZ = Math.abs(startScale.z) > 0.0001 ? startScale.z : 1;
    const deltaX = currentScale.x / safeStartX;
    const deltaY = currentScale.y / safeStartY;
    const deltaZ = currentScale.z / safeStartZ;
    const deviationX = Math.abs(deltaX - 1);
    const deviationY = Math.abs(deltaY - 1);
    const deviationZ = Math.abs(deltaZ - 1);
    
    let uniformDelta;
    if (deviationX >= deviationY && deviationX >= deviationZ) {
      uniformDelta = deltaX;
    } else if (deviationY >= deviationX && deviationY >= deviationZ) {
      uniformDelta = deltaY;
    } else {
      uniformDelta = deltaZ;
    }
    const newScaleX = startScale.x * uniformDelta;
    const newScaleY = startScale.x * uniformDelta * this._scaleRatio.y;
    const newScaleZ = startScale.x * uniformDelta * this._scaleRatio.z;
    const minScale = 0.001;
    const finalX = Math.max(newScaleX, minScale);
    const finalY = Math.max(newScaleY, minScale);
    const finalZ = Math.max(newScaleZ, minScale);
    
    primaryEntity.setLocalScale(finalX, finalY, finalZ);
  }

  _suspendRigidbodyForTarget() {
    const entity = this._getPrimaryEntity(this._targetObject);
    if (!entity?.rigidbody) return;
    const rb = entity.rigidbody;
    if (rb.type !== "dynamic") return;
    rb.disableSimulation();
  }

  _resumeRigidbodyAndSyncForTarget() {
    const entity = this._getPrimaryEntity(this._targetObject);
    if (!entity?.rigidbody) return;
    const rb = entity.rigidbody;
    if (rb.type !== "dynamic") return;
    const pos = entity.getPosition();
    const rot = entity.getRotation();
    rb.teleport(pos, rot);
    rb.enableSimulation();
  }

  _syncMultiFileTransform() {
    const obj = this._targetObject;
    if (!obj || !obj.isMultiFile || !obj.files || obj.files.length < 2) return;

    const primaryEntity = obj.files[0].entity;
    if (!primaryEntity) return;
    const pos = primaryEntity.getLocalPosition();
    const rot = primaryEntity.getLocalEulerAngles();
    const scale = primaryEntity.getLocalScale();
    for (let i = 1; i < obj.files.length; i++) {
      const entity = obj.files[i].entity;
      if (entity) {
        entity.setLocalPosition(pos.x, pos.y, pos.z);
        entity.setLocalEulerAngles(rot.x, rot.y, rot.z);
        entity.setLocalScale(scale.x, scale.y, scale.z);
      }
    }
  }

  _persistSequenceTransform() {
    const obj = this._targetObject;
    if (!obj?.isSequence) return;
    const primaryEntity = this._getPrimaryEntity(obj);
    if (!primaryEntity) return;

    const pos = primaryEntity.getLocalPosition();
    const rot = primaryEntity.getLocalEulerAngles();
    const scale = primaryEntity.getLocalScale();
    obj._sequenceTransform = {
      position: { x: pos.x, y: pos.y, z: pos.z },
      rotation: { x: rot.x, y: rot.y, z: rot.z },
      scale: { x: scale.x, y: scale.y, z: scale.z },
    };
  }

  setMode(mode) {
    this._mode = mode;
    this._updateGizmoVisibility();
  }

  getMode() {
    return this._mode;
  }

  setUniformScale(enabled) {
    this._uniformScaleEnabled = enabled;
    if (this._scaleGizmo && 'uniform' in this._scaleGizmo) {
      this._scaleGizmo.uniform = false;
    }
    if (this._targetObject) {
      this._captureScaleStartValues();
    }
  }

  isUniformScaleEnabled() {
    return this._uniformScaleEnabled;
  }

  setTarget(obj) {
    this._targetObject = obj;
    if (obj) {
      this._captureScaleStartValues();
    }
    
    this._updateGizmoVisibility();
  }

  getTarget() {
    return this._targetObject;
  }

  _updateGizmoVisibility() {
    this._hideAllGizmos();
    const primaryEntity = this._getPrimaryEntity(this._targetObject);
    if (!this._mode || !primaryEntity) return;
    
    const gizmo = this._getCurrentGizmo();
    
    if (gizmo && primaryEntity) {
      gizmo.attach([primaryEntity]);
    }
  }

  _getPrimaryEntity(obj) {
    if (!obj) return null;
    if (obj.isSequence) {
      return obj.entity || null;
    }
    if (obj.isMultiFile && obj.files?.length > 0) {
      return obj.files[0].entity;
    }
    return obj.entity;
  }

  _getCurrentGizmo() {
    switch (this._mode) {
      case "transform": return this._translateGizmo;
      case "rotate": return this._rotateGizmo;
      case "scale": return this._scaleGizmo;
      default: return null;
    }
  }

  _hideAllGizmos() {
    if (this._translateGizmo) {
      this._translateGizmo.detach();
    }
    if (this._rotateGizmo) {
      this._rotateGizmo.detach();
    }
    if (this._scaleGizmo) {
      this._scaleGizmo.detach();
    }
    if (this._pivotTranslateGizmo) {
      this._pivotTranslateGizmo.detach();
    }
    if (this._pivotMarker) {
      this._pivotMarker.destroy();
      this._pivotMarker = null;
    }
  }

  _createPivotMarker() {
    const pc = window.pc;
    if (!pc || !this.viewer.splatRoot) return null;
    if (this._pivotMarker) {
      this._pivotMarker.destroy();
    }
    const marker = new pc.Entity("PivotMarker");
    marker.addComponent("model", {
      type: "sphere",
      cast: false,
    });
    const material = new pc.StandardMaterial();
    material.diffuse = new pc.Color(1, 0, 0, 1);
    material.emissive = new pc.Color(1, 0, 0, 1);
    marker.model.material = material;
    marker.setLocalScale(0.1, 0.1, 0.1);
    
    this.viewer.splatRoot.addChild(marker);
    this._pivotMarker = marker;
    
    return marker;
  }

  enablePivotMode() {
    if (this._mode === 'pivot') {
      this._mode = null;
      this._updateGizmoVisibility();
      return;
    }
    this._mode = 'pivot';
    const primaryEntity = this._getPrimaryEntity(this._targetObject);
    if (!primaryEntity) return;
    const pos = primaryEntity.getLocalPosition();
    this._pivotOriginalPosition = { x: pos.x, y: pos.y, z: pos.z };
    const marker = this._createPivotMarker();
    if (marker) {
      marker.setLocalPosition(pos.x, pos.y, pos.z);
    }
    
    this._updateGizmoVisibility();
  }

  _updatePivotPosition() {
    if (!this._pivotMarker || !this._targetObject) return;
    const primaryEntity = this._getPrimaryEntity(this._targetObject);
    if (!primaryEntity) return;
    const newPivotPos = this._pivotMarker.getLocalPosition();
    const oldPos = this._pivotOriginalPosition;
    const deltaX = newPivotPos.x - oldPos.x;
    const deltaY = newPivotPos.y - oldPos.y;
    const deltaZ = newPivotPos.z - oldPos.z;
    primaryEntity.setLocalPosition(
      primaryEntity.getLocalPosition().x - deltaX,
      primaryEntity.getLocalPosition().y - deltaY,
      primaryEntity.getLocalPosition().z - deltaZ
    );
    if (this._targetObject.isMultiFile && this._targetObject.files) {
      for (let i = 1; i < this._targetObject.files.length; i++) {
        const entity = this._targetObject.files[i].entity;
        if (entity) {
          entity.setLocalPosition(
            entity.getLocalPosition().x - deltaX,
            entity.getLocalPosition().y - deltaY,
            entity.getLocalPosition().z - deltaZ
          );
        }
      }
    }
  }

  isVisible() {
    const gizmo = this._getCurrentGizmo();
    if (!gizmo) return false;
    return gizmo.nodes && gizmo.nodes.length > 0;
  }

  setSize(size) {
    this._gizmoSize = size;
    if (this._translateGizmo) this._translateGizmo.size = size;
    if (this._rotateGizmo) this._rotateGizmo.size = size;
    if (this._scaleGizmo) this._scaleGizmo.size = size;
  }

  setCoordSpace(space) {
    this._coordSpace = space;
    if (this._translateGizmo) this._translateGizmo.coordSpace = space;
    if (this._rotateGizmo) this._rotateGizmo.coordSpace = space;
    if (this._scaleGizmo) this._scaleGizmo.coordSpace = space;
  }

  setSnap(enabled, increment = 1) {
    if (this._translateGizmo) {
      this._translateGizmo.snap = enabled;
      this._translateGizmo.snapIncrement = increment;
    }
    if (this._rotateGizmo) {
      this._rotateGizmo.snap = enabled;
      this._rotateGizmo.snapIncrement = enabled ? 15 : increment;
    }
    if (this._scaleGizmo) {
      this._scaleGizmo.snap = enabled;
      this._scaleGizmo.snapIncrement = increment;
    }
  }

  updateScaleRatio(x, y, z) {
    const baseScale = Math.abs(x) > 0.0001 ? x : 1;
    this._scaleRatio = {
      x: 1,
      y: y / baseScale,
      z: z / baseScale
    };
    this._scaleStartValues = { x, y, z };
  }

  dispose() {
    if (this._translateGizmo) {
      this._translateGizmo.destroy();
      this._translateGizmo = null;
    }
    if (this._rotateGizmo) {
      this._rotateGizmo.destroy();
      this._rotateGizmo = null;
    }
    if (this._scaleGizmo) {
      this._scaleGizmo.destroy();
      this._scaleGizmo = null;
    }
    
    this._gizmoLayer = null;
    this._targetObject = null;
    this._mode = null;
    
  }
}

export default GizmoController;
