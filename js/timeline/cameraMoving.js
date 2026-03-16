/**
 * Camera keyframe frustum visualization.
 */

export class CameraFrustumManager {
  /**
   * @param {Object} options
   * @param {Object} options.viewer - PlayCanvasViewer
   */
  constructor(options) {
    this._viewer = options.viewer;
    
    /** @type {Map<string, pc.Entity>} - keyframeId → frustum entity */
    this._frustums = new Map();
    
    /** @type {boolean} - frustum visibility */
    this._visible = true;
    
    this._defaultColor = 0xffffff;
    
    this._frustumLength = 0.8;
    this._nearWidth = 0.2;
    this._nearHeight = 0.12;
    this._farWidth = 0.9;
    this._farHeight = 0.5;
    this._lineThickness = 0.012;
    this._markerSize = 0.08;

    // Scale factor (UI)
    this._scaleFactor = typeof window !== 'undefined' && typeof window.__frustumScaleFactor === 'number'
      ? window.__frustumScaleFactor
      : 1;
  }
  
  /**
   * Create camera frustum.
   * @param {string} keyframeId
   * @param {{position:{x,y,z}, yaw:number, pitch:number}} cameraState
   * @param {number} [color]
   */
  create(keyframeId, cameraState, color = this._defaultColor) {
    const pc = window.pc;
    if (!pc || !this._viewer?.app || !cameraState) return;
    
    // Remove if exists
    this.remove(keyframeId);
    
    // Color to pc.Color
    const r = ((color >> 16) & 0xff) / 255;
    const g = ((color >> 8) & 0xff) / 255;
    const b = (color & 0xff) / 255;
    const frustumColor = new pc.Color(r, g, b, 1);
    
    // Create frustum entity
    const frustumEntity = new pc.Entity(`frustum_${keyframeId}`);
    
    // Frustum vertices (camera local, -Z forward)
    const nearHalfW = this._nearWidth / 2;
    const nearHalfH = this._nearHeight / 2;
    const farHalfW = this._farWidth / 2;
    const farHalfH = this._farHeight / 2;
    
    // Near plane (z = 0)
    const n0 = new pc.Vec3(-nearHalfW, -nearHalfH, 0);
    const n1 = new pc.Vec3(nearHalfW, -nearHalfH, 0);
    const n2 = new pc.Vec3(nearHalfW, nearHalfH, 0);
    const n3 = new pc.Vec3(-nearHalfW, nearHalfH, 0);
    
    // Far plane (z = -frustumLength)
    const f0 = new pc.Vec3(-farHalfW, -farHalfH, -this._frustumLength);
    const f1 = new pc.Vec3(farHalfW, -farHalfH, -this._frustumLength);
    const f2 = new pc.Vec3(farHalfW, farHalfH, -this._frustumLength);
    const f3 = new pc.Vec3(-farHalfW, farHalfH, -this._frustumLength);
    
    // 12 edges
    const lines = [
      [n0, n1], [n1, n2], [n2, n3], [n3, n0],
      [f0, f1], [f1, f2], [f2, f3], [f3, f0],
      [n0, f0], [n1, f1], [n2, f2], [n3, f3],
    ];
    
    // Create thin box per line
    lines.forEach((line, idx) => {
      const [start, end] = line;
      const lineEntity = this._createLineEntity(start, end, frustumColor);
      lineEntity.name = `line_${idx}`;
      frustumEntity.addChild(lineEntity);
    });
    
    // Camera position marker (sphere)
    const cameraMarker = this._createCameraMarker(frustumColor);
    frustumEntity.addChild(cameraMarker);
    
    // Position and rotation
    this._applyTransform(frustumEntity, cameraState);

    // Apply scale
    const s = this._scaleFactor || 1;
    frustumEntity.setLocalScale(s, s, s);
    
    // Add to scene
    this._viewer.app.root.addChild(frustumEntity);
    this._frustums.set(keyframeId, frustumEntity);
    
    // Visibility
    frustumEntity.enabled = this._visible;
    
    // Fade in
    this._fadeIn(frustumEntity);
  }
  
  /**
   * Create line (thin box) entity.
   * @private
   */
  _createLineEntity(start, end, color) {
    const pc = window.pc;
    
    const lineEntity = new pc.Entity();
    lineEntity.addComponent("render", {
      type: "box",
    });
    
    // 라인의 중점과 길이 계산
    const mid = new pc.Vec3().lerp(start, end, 0.5);
    const length = start.distance(end);
    
    // 방향 계산
    const dir = new pc.Vec3().sub2(end, start).normalize();
    
    // 위치 설정
    lineEntity.setLocalPosition(mid);
    
    // 스케일 설정 (Z 방향으로 길이)
    lineEntity.setLocalScale(this._lineThickness, this._lineThickness, length);
    
    // 회전 설정 (Z축이 라인 방향을 향하도록)
    const up = Math.abs(dir.y) > 0.99 ? new pc.Vec3(1, 0, 0) : new pc.Vec3(0, 1, 0);
    const rotation = new pc.Quat();
    const lookAtMat = new pc.Mat4().setLookAt(pc.Vec3.ZERO, dir, up);
    rotation.setFromMat4(lookAtMat);
    lineEntity.setLocalRotation(rotation);
    
    // 재질 생성
    const material = new pc.StandardMaterial();
    material.diffuse = color;
    material.emissive = color;
    material.emissiveIntensity = 0.3;
    material.useLighting = false;
    material.update();
    
    lineEntity.render.meshInstances[0].material = material;
    
    return lineEntity;
  }
  
  /**
   * 카메라 마커(구체) 생성
   * @private
   */
  _createCameraMarker(color) {
    const pc = window.pc;
    
    const cameraMarker = new pc.Entity("camera_marker");
    cameraMarker.addComponent("render", {
      type: "sphere",
    });
    cameraMarker.setLocalScale(this._markerSize, this._markerSize, this._markerSize);
    
    // 재질 생성
    const markerMaterial = new pc.StandardMaterial();
    markerMaterial.diffuse = color;
    markerMaterial.emissive = color;
    markerMaterial.emissiveIntensity = 0.5;
    markerMaterial.useLighting = false;
    markerMaterial.update();
    cameraMarker.render.meshInstances[0].material = markerMaterial;
    
    return cameraMarker;
  }
  
  /**
   * 프러스텀에 위치/회전 적용
   * @private
   */
  _applyTransform(frustumEntity, cameraState) {
    frustumEntity.setPosition(
      cameraState.position.x,
      cameraState.position.y,
      cameraState.position.z
    );
    
    // yaw, pitch를 사용하여 회전 설정
    // yaw: Y축 회전 (수평), pitch: X축 회전 (수직)
    // pitch 부호 반전: 카메라가 아래를 보면 양수 pitch인데, 프러스텀은 반대로 적용
    const yawDeg = cameraState.yaw || 0;
    const pitchDeg = -(cameraState.pitch || 0);
    frustumEntity.setLocalEulerAngles(pitchDeg, yawDeg, 0);
  }
  
  /**
   * 카메라 프러스텀 업데이트
   * @param {string} keyframeId
   * @param {{position:{x,y,z}, yaw:number, pitch:number}} cameraState
   */
  update(keyframeId, cameraState) {
    const frustum = this._frustums.get(keyframeId);
    if (!frustum || !cameraState) return;
    
    // 프러스텀 페이드아웃 후 업데이트하고 다시 페이드인
    this._fadeOut(frustum, () => {
      this._applyTransform(frustum, cameraState);
      this._fadeIn(frustum);
    });
  }

  /**
   * 프러스텀 스케일 배율 설정 (0.1 ~ 2)
   * @param {number} value
   */
  setScaleFactor(value) {
    const v = Math.max(0.1, Math.min(2, Number(value) || 1));
    this._scaleFactor = v;
    if (typeof window !== 'undefined') {
      window.__frustumScaleFactor = v;
    }
    this._frustums.forEach((frustum) => {
      if (!frustum) return;
      frustum.setLocalScale(v, v, v);
    });
  }
  
  /**
   * 카메라 프러스텀 제거
   * @param {string} keyframeId
   */
  remove(keyframeId) {
    const frustum = this._frustums.get(keyframeId);
    if (frustum) {
      // 페이드아웃 효과 적용
      this._fadeOut(frustum, () => {
        frustum.destroy();
        this._frustums.delete(keyframeId);
      });
    }
  }
  
  /**
   * 모든 카메라 프러스텀 제거
   * 제거 대상만 맵에서 삭제하므로, clear() 직후 새 템플릿으로 추가된 프러스텀은 맵에 유지됨 (월드 누적 방지).
   */
  clear() {
    const entries = Array.from(this._frustums.entries());
    if (entries.length === 0) return;

    entries.forEach(([keyframeId, frustum]) => {
      this._fadeOut(frustum, () => {
        frustum.destroy();
        this._frustums.delete(keyframeId);
      });
    });
  }
  
  /**
   * 카메라 프러스텀 가시성 설정
   * @param {boolean} visible
   */
  setVisible(visible) {
    this._visible = visible;
    this._frustums.forEach((frustum) => {
      frustum.enabled = visible;
    });
  }
  
  /**
   * 카메라 프러스텀 가시성 토글
   * @returns {boolean} 새로운 가시성 상태
   */
  toggleVisible() {
    this._visible = !this._visible;
    this.setVisible(this._visible);
    return this._visible;
  }
  
  /**
   * 프러스텀 페이드아웃 효과
   * @private
   * @param {pc.Entity} entity - 페이드아웃할 엔티티
   * @param {Function} callback - 페이드아웃 완료 후 콜백
   */
  _fadeOut(entity, callback) {
    if (!entity) {
      callback?.();
      return;
    }
    
    const duration = 0.4; // 페이드아웃 지속 시간 (초)
    const startTime = performance.now();
    
    // 현재 투명도에서 시작
    const updateOpacity = () => {
      const elapsed = (performance.now() - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease-in cubic 효과 (빠르게 사라지는 느낌)
      const eased = progress * progress * progress;
      const opacity = 1 - eased;
      
      this._setEntityOpacity(entity, opacity);
      
      if (progress < 1) {
        requestAnimationFrame(updateOpacity);
      } else {
        // 페이드아웃 완료 후 콜백 실행
        callback?.();
      }
    };
    
    updateOpacity();
  }
  
  /**
   * 프러스텀 페이드인 효과
   * @private
   * @param {pc.Entity} entity - 페이드인할 엔티티
   */
  _fadeIn(entity) {
    if (!entity) return;
    
    const duration = 0.6; // 페이드인 지속 시간 (초)
    const startTime = performance.now();
    
    // 초기 상태: 완전히 투명하게 설정
    this._setEntityOpacity(entity, 0);
    
    const updateOpacity = () => {
      const elapsed = (performance.now() - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease-out cubic 효과
      const eased = 1 - Math.pow(1 - progress, 3);
      
      this._setEntityOpacity(entity, eased);
      
      if (progress < 1) {
        requestAnimationFrame(updateOpacity);
      }
    };
    
    updateOpacity();
  }
  
  /**
   * 엔티티 및 모든 자식 엔티티의 투명도 설정
   * @private
   * @param {pc.Entity} entity - 엔티티
   * @param {number} opacity - 투명도 (0~1)
   */
  _setEntityOpacity(entity, opacity) {
    if (!entity) return;
    
    // 재질이 있는 모든 meshInstances의 투명도 조정
    entity.forEach((child) => {
      if (child.render && child.render.meshInstances) {
        child.render.meshInstances.forEach((meshInstance) => {
          if (meshInstance.material) {
            // 기존 재질 복사
            const material = meshInstance.material.clone();
            material.opacity = opacity;
            material.blendType = opacity < 1 ? pc.BLEND_NORMAL : pc.BLEND_NONE;
            material.update();
            meshInstance.material = material;
          }
        });
      }
    });
    
    // 루트 엔티티도 처리
    if (entity.render && entity.render.meshInstances) {
      entity.render.meshInstances.forEach((meshInstance) => {
        if (meshInstance.material) {
          const material = meshInstance.material.clone();
          material.opacity = opacity;
          material.blendType = opacity < 1 ? pc.BLEND_NORMAL : pc.BLEND_NONE;
          material.update();
          meshInstance.material = material;
        }
      });
    }
  }
  
  /**
   * 현재 가시성 상태
   * @returns {boolean}
   */
  get visible() {
    return this._visible;
  }
  
  /**
   * 프러스텀 개수
   * @returns {number}
   */
  get count() {
    return this._frustums.size;
  }
}

export default CameraFrustumManager;
