/**
 * Timeline keyframes (SuperSplat): keys array, addKey, removeKey, moveKey, prevKey/nextKey.
 */

import { CameraFrustumManager } from './cameraMoving.js';
import { CameraMovingObjectManager } from './cameraMovingObject.js';

export class KeyframesManager {
  /**
   * @param {Object} options
   * @param {Object} options.viewer - PlayCanvasViewer
   * @param {Function} options.getFrames - total frames getter
   * @param {Function} options.getFrameRate - FPS getter
   * @param {Function} options.getTrackBounds - track bounds getter
   * @param {Function} options.showTooltip - show tooltip
   * @param {Function} options.hideTooltip - hide tooltip
   * @param {Function} options.setFrame - set frame
   */
  constructor(options) {
    this._viewer = options.viewer;
    this._getFrames = options.getFrames;
    this._getFrameRate = options.getFrameRate;
    this._getTrackBounds = options.getTrackBounds;
    this._showTooltip = options.showTooltip;
    this._hideTooltip = options.hideTooltip;
    this._setFrame = options.setFrame;
    
    /** @type {number[]} - keys (frame indices) */
    this.keys = [];
    
    /** @type {import('./types').Keyframe[]} - keyframes with camera state */
    this.keyframes = [];
    
    // Callbacks
    /** @type {Function|null} */
    this.onKeyframesChange = null;
    
    // Camera frustum manager
    /** @type {CameraFrustumManager|null} */
    this._frustumManager = null;

    /** @type {CameraMovingObjectManager|null} */
    this._movingObjectManager = null;
  }
  
  /** Init camera frustum manager. */
  initFrustumManager() {
    if (this._viewer && !this._frustumManager) {
      this._frustumManager = new CameraFrustumManager({ viewer: this._viewer });
      if (typeof window !== 'undefined' && typeof window.__frustumScaleFactor === 'number') {
        this._frustumManager.setScaleFactor(window.__frustumScaleFactor);
      }
    }
  }

  /** Init camera moving object manager (마커 사이 연결선). */
  initMovingObjectManager() {
    if (!this._movingObjectManager) {
      this._movingObjectManager = new CameraMovingObjectManager({
        getKeyframes: () => this.keyframes,
        getMaxSeconds: () => this._getFrames() / this._getFrameRate(),
        getTrackBounds: this._getTrackBounds,
        viewer: this._viewer,
      });
      this._movingObjectManager.init();
    }
  }
  
  refresh() {
    this.initFrustumManager();
    this.initMovingObjectManager();
    this.renderMarkers();
    this._movingObjectManager?.onKeyframesChange?.(this.keyframes);
  }

  /**
   * Apply keyframe ratio to t from total frames; or derive ratio from t.
   * @private
   */
  _applyStoredRatio(kf) {
    const frames = this._getFrames();
    const frameRate = this._getFrameRate();
    const maxFrame = Math.max(0, frames - 1);
    if (kf.ratio != null && typeof kf.ratio === 'number') {
      let fi = Math.round(kf.ratio * maxFrame);
      if (fi < 0) fi = 0;
      if (fi > maxFrame) fi = maxFrame;
      kf.t = (fi + 0.5) / frameRate;
    } else {
      let fi = Math.floor((Number(kf.t) || 0) * frameRate);
      if (fi < 0) fi = 0;
      if (fi > maxFrame) fi = maxFrame;
      kf.ratio = maxFrame <= 0 ? 0 : fi / maxFrame;
      kf.t = (fi + 0.5) / frameRate;
    }
  }

  /**
   * Set keyframe ratio and t from frame index (on add/move/update).
   * @private
   */
  _setKeyframeRatioAndT(kf, frameIndex) {
    const frames = this._getFrames();
    const frameRate = this._getFrameRate();
    const maxFrame = Math.max(0, frames - 1);
    let fi = frameIndex;
    if (fi < 0) fi = 0;
    if (fi > maxFrame) fi = maxFrame;
    kf.ratio = maxFrame <= 0 ? 0 : fi / maxFrame;
    kf.t = (fi + 0.5) / frameRate;
  }

  /**
   * Sync keys array from keyframes[].t (after total frames change).
   */
  syncKeysFromKeyframes() {
    const frameRate = this._getFrameRate();
    const frames = this._getFrames();
    const maxFrame = Math.max(0, frames - 1);
    const seen = new Set();
    for (const kf of this.keyframes) {
      let fi = Math.floor((Number(kf.t) || 0) * frameRate);
      if (fi < 0) fi = 0;
      if (fi > maxFrame) fi = maxFrame;
      seen.add(fi);
    }
    this.keys = Array.from(seen).sort((a, b) => a - b);
  }

  /**
   * Add keyframe (frame index).
   * @param {number} keyFrame - frame index (default: current)
   * @returns {boolean} - whether newly added
   */
  addKey(keyFrame = null) {
    if (keyFrame === null) {
      // Get current frame
      const frameRate = this._getFrameRate();
      const currentTime = this._getCurrentTime?.() || 0;
      keyFrame = Math.floor(currentTime * frameRate);
    }
    
    const frames = this._getFrames();
    if (keyFrame < 0 || keyFrame >= frames) return false;
    
    // Update if exists, else add
    const isNew = !this.keys.includes(keyFrame);
    if (isNew) {
      this.keys.push(keyFrame);
      this._syncKeyframesFromKeys();
      this.renderMarkers();
      this.onKeyframesChange?.(this.keyframes);
      this._movingObjectManager?.onKeyframesChange(this.keyframes);
    } else {
      // Update existing keyframe (camera state)
      this._updateKeyframeAtFrame(keyFrame);
    }
    
    return isNew;
  }

  /**
   * Remove keyframe (by index or current frame).
   * @param {number} index - keyframe index (default: at current frame)
   */
  removeKey(index = null) {
    if (index === null) {
      // Find keyframe at current frame
      const frameRate = this._getFrameRate();
      const currentTime = this._getCurrentTime?.() || 0;
      const currentFrame = Math.floor(currentTime * frameRate);
      index = this.keys.indexOf(currentFrame);
    }
    
    if (index >= 0 && index < this.keys.length) {
      const frame = this.keys[index];
      const kf = this.keyframes.find(k => {
        const frameRate = this._getFrameRate();
        const kfFrame = Math.floor(k.t * frameRate);
        return kfFrame === frame;
      });
      
      if (kf) {
        this._frustumManager?.remove(kf.id);
      }
      
      this.keys.splice(index, 1);
      this._syncKeyframesFromKeys();
      this.renderMarkers();
      this.onKeyframesChange?.(this.keyframes);
      this._movingObjectManager?.onKeyframesChange(this.keyframes);
    }
  }

  /**
   * Move keyframe (frame only; camera state updated via add button).
   * @param {number} fromFrame - source frame
   * @param {number} toFrame - target frame
   */
  moveKey(fromFrame, toFrame) {
    const frames = this._getFrames();
    const frameRate = this._getFrameRate();
    if (toFrame < 0 || toFrame >= frames) return;
    
    const index = this.keys.indexOf(fromFrame);
    if (index === -1 || fromFrame === toFrame) return;
    
    // On drag: change t only, keep state
    const kfToMove = this.keyframes.find(k => Math.floor(k.t * frameRate) === fromFrame);
    
    // Remove keyframe at target if exists
    const existingIndex = this.keys.indexOf(toFrame);
    if (existingIndex !== -1) {
      this.keys.splice(existingIndex, 1);
      if (existingIndex < index) {
        this.keys[index - 1] = toFrame;
      } else {
        this.keys[index] = toFrame;
      }
    } else {
      this.keys[index] = toFrame;
    }
    
    // Drag changes frame(t) only; camera from add button
    if (kfToMove) {
      kfToMove.t = (toFrame + 0.5) / frameRate;
      this._setKeyframeRatioAndT(kfToMove, toFrame);
      this.keyframes.sort((a, b) => a.t - b.t);
      this._frustumManager?.update(kfToMove.id, kfToMove.state);
    }
    
    this._syncKeyframesFromKeys();
    this.renderMarkers();
    this.onKeyframesChange?.(this.keyframes);
    this._movingObjectManager?.onKeyframesChange(this.keyframes);
  }

  /**
   * Seek to previous keyframe.
   */
  prevKey() {
    const frameRate = this._getFrameRate();
    const currentTime = this._getCurrentTime?.() || 0;
    const currentFrame = Math.floor(currentTime * frameRate);
    
    const orderedKeys = this.keys.slice().sort((a, b) => a - b);
    
    if (orderedKeys.length > 0) {
      const nextKeyIndex = orderedKeys.findIndex(k => k >= currentFrame);
      const l = orderedKeys.length;
      
      if (nextKeyIndex === -1) {
        // 마지막 키프레임으로
        this._setFrame(orderedKeys[l - 1]);
      } else {
        // To previous keyframe
        const prevIndex = (nextKeyIndex + l - 1) % l;
        this._setFrame(orderedKeys[prevIndex]);
      }
    } else {
      // No keyframes: go to first frame
      this._setFrame(0);
    }
  }

  /**
   * Seek to next keyframe.
   */
  nextKey() {
    const frameRate = this._getFrameRate();
    const currentTime = this._getCurrentTime?.() || 0;
    const currentFrame = Math.floor(currentTime * frameRate);
    
    const orderedKeys = this.keys.slice().sort((a, b) => a - b);
    
    if (orderedKeys.length > 0) {
      const nextKeyIndex = orderedKeys.findIndex(k => k > currentFrame);
      const l = orderedKeys.length;
      
      if (nextKeyIndex === -1) {
        // To first keyframe (loop)
        this._setFrame(orderedKeys[0]);
      } else {
        this._setFrame(orderedKeys[nextKeyIndex]);
      }
    } else {
      // No keyframes: go to last frame
      const frames = this._getFrames();
      this._setFrame(frames - 1);
    }
  }

  /**
   * keys 배열을 keyframes 배열로 동기화 (기존 호환성 유지)
   * @private
   */
  _syncKeyframesFromKeys() {
    if (!this._viewer) return;
    
    const frameRate = this._getFrameRate();
    const frames = this._getFrames();
    const newKeyframes = [];
    
    for (const frame of this.keys) {
      // Find existing (same frame or nearest ratio)
      let kf = this.keyframes.find(k => {
        const kfFrame = Math.floor(k.t * frameRate);
        return kfFrame === frame;
      });
      
      if (!kf) {
        // Create new keyframe
        const camState = this._viewer.getCameraState();
        if (camState) {
          kf = {
            id: `kf_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            t: (frame + 0.5) / frameRate,
            state: { ...camState },
          };
          this._setKeyframeRatioAndT(kf, frame);
          this._frustumManager?.create(kf.id, camState);
        }
      } else {
        // Move/update: refresh ratio and t
        this._setKeyframeRatioAndT(kf, frame);
      }
      
      if (kf) {
        newKeyframes.push(kf);
      }
    }
    
    // Remove frustums for removed keyframes
    const removedKfs = this.keyframes.filter(k => {
      const kfFrame = Math.floor(k.t * frameRate);
      return !this.keys.includes(kfFrame);
    });
    for (const kf of removedKfs) {
      this._frustumManager?.remove(kf.id);
    }
    
    this.keyframes = newKeyframes.sort((a, b) => a.t - b.t);
  }

  /**
   * 특정 프레임의 키프레임 업데이트 (카메라 상태)
   * @private
   * @param {number} frame - frame index
   * @param {import('./types').CameraState|null} [optionalState] - or current viewer
   */
  _updateKeyframeAtFrame(frame, optionalState = null) {
    if (!this._viewer) return;
    
    const frameRate = this._getFrameRate();
    const t = (frame + 0.5) / frameRate;
    
    let kf = this.keyframes.find(k => {
      const kfFrame = Math.floor(k.t * frameRate);
      return kfFrame === frame;
    });
    
    const camState = optionalState != null ? optionalState : this._viewer.getCameraState();
    if (!camState) return;
    
    if (kf) {
      // 기존 키프레임 업데이트
      kf.state = { ...camState };
      this._setKeyframeRatioAndT(kf, frame);
      this._frustumManager?.update(kf.id, camState);
    } else {
      // Create new keyframe
      kf = {
        id: `kf_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        t,
        state: { ...camState },
      };
      this._setKeyframeRatioAndT(kf, frame);
      this.keyframes.push(kf);
      this.keyframes.sort((a, b) => a.t - b.t);
      this._frustumManager?.create(kf.id, camState);
    }
    
    this.renderMarkers();
    this.onKeyframesChange?.(this.keyframes);
    this._movingObjectManager?.onKeyframesChange(this.keyframes);
  }

  /**
   * Add keyframe by time (compat).
   * @param {number} t - time (seconds)
   * @param {import('./types').CameraState} [state] - or current camera
   * @returns {import('./types').Keyframe|null}
   */
  add(t, state = null) {
    if (!this._viewer) return null;
    
    this.initFrustumManager();
    this.initMovingObjectManager();
    
    const frameRate = this._getFrameRate();
    const frame = Math.floor(t * frameRate);
    
    // Add via SuperSplat style
    const isNew = this.addKey(frame);
    
    // Update camera state (e.g. from template)
    const camState = state != null ? state : this._viewer.getCameraState();
    if (camState) {
      this._updateKeyframeAtFrame(frame, camState);
    }
    
    return this.keyframes.find(k => {
      const kfFrame = Math.floor(k.t * frameRate);
      return kfFrame === frame;
    }) || null;
  }

  /**
   * Remove keyframe (compat).
   * @param {string} id
   */
  remove(id) {
    const kf = this.keyframes.find(k => k.id === id);
    if (!kf) return false;
    
    const frameRate = this._getFrameRate();
    const frame = Math.floor(kf.t * frameRate);
    const index = this.keys.indexOf(frame);
    
    if (index !== -1) {
      this.removeKey(index);
      return true;
    }
    
    return false;
  }

  /**
   * Remove keyframe at pin position (compat).
   */
  removeAt(t, threshold = 0.05) {
    const kf = this.keyframes.find(k => Math.abs(k.t - t) < threshold);
    if (!kf) return false;
    return this.remove(kf.id);
  }

  /**
   * Remove all keyframes.
   */
  clear() {
    this._frustumManager?.clear();
    if (this._movingObjectManager) {
      this._movingObjectManager.dispose();
      this._movingObjectManager = null;
    }

    this.keys = [];
    this.keyframes = [];
    this.renderMarkers();
    this.onKeyframesChange?.(this.keyframes);
  }

  /**
   * Return keyframe list.
   */
  getAll() {
    return [...this.keyframes];
  }

  /**
   * Seek to keyframe.
   * @param {string} id
   */
  goTo(id) {
    const kf = this.keyframes.find(k => k.id === id);
    if (!kf) return;
    
    this._setFrame(Math.floor(kf.t * this._getFrameRate()));
    this._viewer?.setCameraState(kf.state);
  }
  
  /**
   * Set camera frustum visibility.
   */
  setFrustumsVisible(visible) {
    this._frustumManager?.setVisible(visible);
  }
  
  toggleFrustumsVisible() {
    return this._frustumManager?.toggleVisible() ?? true;
  }

  get frustumsVisible() {
    return this._frustumManager?.visible ?? true;
  }

  /**
   * Render keyframe markers.
   */
  renderMarkers() {
    const container = document.querySelector(".timeline-container");
    if (!container) return;
    
    container.querySelectorAll(".timeline-camera-marker, .timeline-keyframe-marker").forEach(el => el.remove());
    
    if (this.keyframes.length === 0) return;
    
    const bounds = this._getTrackBounds();
    if (!bounds) return;
    
    const cameraLine = document.querySelector(".timeline-camera-line");
    const containerRect = container.getBoundingClientRect();
    let markerTop = "50%";
    if (cameraLine) {
      const cameraLineRect = cameraLine.getBoundingClientRect();
      const cameraLineCenterY = cameraLineRect.top + cameraLineRect.height / 2 - containerRect.top;
      markerTop = `${cameraLineCenterY}px`;
    }
    
    const frames = this._getFrames();
    const frameRate = this._getFrameRate();

    this.keyframes.forEach((kf) => {
      this._applyStoredRatio(kf);
      const frameIndex = Math.floor(kf.t * frameRate);

      const marker = document.createElement("div");
      marker.className = "timeline-camera-marker";
      marker.dataset.keyframeId = kf.id;

      const percent = Math.max(0, Math.min(1, (frameIndex + 0.5) / frames));
      const leftPx = bounds.left + (percent * bounds.width);
      marker.style.left = `${leftPx}px`;
      marker.style.top = markerTop;
      
      this._setupMarkerDrag(marker, kf, bounds, { frames });
      
      container.appendChild(marker);
    });
  }

  /**
   * Setup keyframe marker drag.
   * @private
   */
  _setupMarkerDrag(marker, kf, bounds, constants = null) {
    const frames = constants?.frames ?? this._getFrames();
    const frameRate = this._getFrameRate();
    let isDragging = false;
    let hasMoved = false;
    
    marker.addEventListener("mouseenter", () => {
      if (!isDragging) {
        const rect = marker.getBoundingClientRect();
        const fi = Math.floor(kf.t * frameRate);
        this._showTooltip(fi, rect.left + rect.width / 2, rect.top);
      }
    });
    
    marker.addEventListener("mouseleave", () => {
      if (!isDragging) {
        this._hideTooltip();
      }
    });
    
    const onMouseDown = (e) => {
      isDragging = true;
      hasMoved = false;
      e.preventDefault();
      e.stopPropagation();
    };
    
    const onMouseMove = (e) => {
      if (!isDragging) return;
      hasMoved = true;
      
      const container = document.querySelector(".timeline-container");
      if (!container) return;
      
      const containerRect = container.getBoundingClientRect();
      const currentBounds = this._getTrackBounds();
      if (!currentBounds) return;
      
      const x = e.clientX - containerRect.left - currentBounds.left;
      const percent = Math.max(0, Math.min(1, x / currentBounds.width));

      let frameIndex = Math.floor(percent * frames);
      if (frameIndex < 0) frameIndex = 0;
      if (frameIndex >= frames) frameIndex = frames - 1;
      
      // Use moveKey
      const oldFrame = Math.floor(kf.t * frameRate);
      this.moveKey(oldFrame, frameIndex);
      
      const newT = (frameIndex + 0.5) / frameRate;
      kf.t = newT;
      
      const newPercent = (frameIndex + 0.5) / frames;
      const newLeftPx = currentBounds.left + (newPercent * currentBounds.width);
      marker.style.left = `${newLeftPx}px`;
      
      const rect = marker.getBoundingClientRect();
      this._showTooltip(frameIndex, rect.left + rect.width / 2, rect.top);
      this._movingObjectManager?.onMarkerMove(kf.id, newT);
    };
    
    const onMouseUp = () => {
      if (isDragging) {
        isDragging = false;
        this._hideTooltip();
      }
    };
    
    marker.addEventListener("click", (e) => {
      if (!hasMoved) {
        e.stopPropagation();
        this.goTo(kf.id);
      }
    });
    
    marker.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }

  /**
   * Current time getter (compat).
   * @private
   */
  _getCurrentTime() {
    // Injected by TimelineController
    return this._currentTimeGetter?.() || 0;
  }

  /**
   * Set current time getter (compat).
   */
  setCurrentTimeGetter(getter) {
    this._currentTimeGetter = getter;
  }
}

export default KeyframesManager;
