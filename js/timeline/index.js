/**
 * TimelineController: keyframes, playback, object blocks, pin, ticks.
 */

import { TooltipManager } from './tooltip.js';
import { TicksRenderer } from './ticks.js';
import { PinManager } from './pin.js';
import { ObjectsManager } from './objects.js';
import { KeyframesManager } from './keyframes.js';
import { PlaybackController } from './playback.js';

export class TimelineController {
  /**
   * @param {Object} viewer - PlayCanvasViewer
   */
  constructor(viewer) {
    /** @type {Object} */
    this.viewer = viewer;
    
    /** @type {number} */
    this.totalFrames = 90;

    /** @type {number} */
    this.fps = 30;

    /** @type {number} */
    this._minTotalFrames = 1;
    
    // DOM cache
    this._ticksEl = null;
    this._objectsListEl = null;
    this._rightListEl = null;
    this._cameraLineRightEl = null;

    this._frameGridTopEl = null;
    this._frameGridRightEl = null;
    
    // Submodules (init in init())
    /** @type {TooltipManager} */
    this._tooltip = new TooltipManager();
    
    /** @type {TicksRenderer} */
    this._ticks = null;
    
    /** @type {PinManager} */
    this._pin = null;
    
    /** @type {ObjectsManager} */
    this._objects = null;
    
    /** @type {KeyframesManager} */
    this._keyframes = null;
    
    /** @type {PlaybackController} */
    this._playback = null;
    
    // Callbacks (external)
    /** @type {Function|null} */
    this.onTimeUpdate = null;
    /** @type {Function|null} */
    this.onPlayStateChange = null;
    /** @type {Function|null} */
    this.onKeyframesChange = null;
    /** @type {Function|null} */
    this.onObjectsChange = null;
    /** @type {Function|null} */
    this.onObjectSelect = null;
    /** @type {Function|null} - delete request (objectId, objectName) */
    this.onDeleteRequest = null;
  }

  _ensureFrameGridEls() {
    if (this._ticksEl && !this._frameGridTopEl) {
      const el = document.createElement('div');
      el.className = 'timeline__frame-grid timeline__frame-grid--top';
      el.setAttribute('aria-hidden', 'true');
      this._ticksEl.insertBefore(el, this._ticksEl.firstChild);
      this._frameGridTopEl = el;
    }

    if (this._rightListEl) {
      try {
        const prev = this._rightListEl.querySelector?.('.timeline__frame-grid--right');
        prev?.remove?.();
      } catch (e) {
      }
      this._frameGridRightEl = null;
    }
  }

  _updateFrameGridStyle() {
    const fps = Math.max(1, Math.min(60, parseInt(this.fps) || 30));
    const totalFrames = Math.max(1, Math.min(18000, parseInt(this.totalFrames) || 90));
    const seg = 100 / totalFrames;

    const styleEl = (el) => {
      if (!el) return;
      el.style.backgroundImage = 'linear-gradient(to right, rgba(255, 255, 255, 0.16) 1px, rgba(255, 255, 255, 0) 1px)';
      el.style.backgroundRepeat = 'repeat';
      el.style.backgroundSize = `${seg}% 100%`;
      el.style.backgroundPosition = `${seg}% 0`;
    };

    styleEl(this._frameGridTopEl);
  }

  // ========================================================================
  // Init
  // ========================================================================

  /**
   * Cache DOM and initial render.
   */
  init() {
    // DOM cache
    this._ticksEl = document.getElementById("timelineTicks");
    this._objectsListEl = document.getElementById("timelineSpacerObjectsList");
    this._rightListEl = document.getElementById("timelineSpacerRightList");
    this._cameraLineRightEl = document.querySelector(".timeline-camera-line__right");

    // Tooltip init
    this._tooltip.init();
    
    // Ticks renderer init
    this._ticks = new TicksRenderer(this._ticksEl);
    this._ticks.render(this.totalFrames);

    this._ensureFrameGridEls();

    this._updateFrameGridStyle();
    
    // Pin manager init
    this._pin = new PinManager({
      ticksEl: this._ticksEl,
      onTimeChange: (seconds) => {
        // During pin drag: no camera path (time/visibility only)
        const fps = Math.max(1, Math.min(60, parseInt(this.fps, 10) || 30));
        const frames = Math.max(1, parseInt(this.totalFrames, 10) || 90);
        const frameIndex = Math.max(0, Math.min(frames - 1, Math.floor(seconds * fps)));
        this._playback.frame = frameIndex;
        this._playback._time = frameIndex;
        this._pin.updatePosition(seconds);
        this._objects.updateVisibilityByTime(seconds);
        this.onTimeUpdate?.(seconds);
      },
      onTimeCommit: (seconds) => {
        try {
          const t = Math.max(0, Math.min(this.getMaxSeconds(), seconds));
          this._playback.currentTime = t;
          // CRITICAL: Commit scrub to trigger final frame load after debounce
          // This ensures we load the final frame after scrubbing ends, not during
          this._objects.commitScrub?.();
          // Force a final visibility update at the stop position so expensive
          // operations (e.g. sequence frame load) are retriggered.
          this._objects.updateVisibilityByTime(t);
          this.onTimeUpdate?.(t);
        } catch (e) {
        }
      },
      showTooltip: (s, x, y) => this._tooltip.show(s, x, y),
      hideTooltip: () => this._tooltip.hide(),
      getMaxSeconds: () => this.getMaxSeconds(),
      getCurrentTime: () => this._playback?.currentTime ?? 0,
      getFps: () => this.fps,
      getTotalFrames: () => this.totalFrames,
    });
    this._pin.init();
    
    // Objects manager init
    this._objects = new ObjectsManager({
      objectsListEl: this._objectsListEl,
      rightListEl: this._rightListEl,
      getMaxSeconds: () => this.getMaxSeconds(),
      getCurrentTime: () => this._playback?.currentTime ?? 0,
      getFps: () => this.fps,
      getTotalFrames: () => this.totalFrames,
      showTooltip: (s, x, y) => this._tooltip.show(s, x, y),
      hideTooltip: () => this._tooltip.hide(),
      onSequenceFrameChange: (obj, frameIndex) => this.onSequenceFrameChange?.(obj, frameIndex),
    });
    this._objects.onObjectsChange = (objs) => this.onObjectsChange?.(objs);
    this._objects.onObjectSelect = (obj) => this.onObjectSelect?.(obj);
    this._objects.onDeleteRequest = (id, name) => this.onDeleteRequest?.(id, name);
    
    // Keyframes manager init (SuperSplat)
    this._keyframes = new KeyframesManager({
      viewer: this.viewer,
      getFrames: () => this.totalFrames,
      getFrameRate: () => this.fps,
      getTrackBounds: () => this._pin.getTrackBounds(),
      showTooltip: (s, x, y) => this._tooltip.show(s, x, y),
      hideTooltip: () => this._tooltip.hide(),
      setFrame: (frameIndex) => this._playback?.setFrame(frameIndex),
    });
    this._keyframes.setCurrentTimeGetter(() => this._playback?.currentTime ?? 0);
    this._keyframes.onKeyframesChange = (kfs) => this.onKeyframesChange?.(kfs);
    
    // Playback controller init (SuperSplat)
    this._playback = new PlaybackController({
      viewer: this.viewer,
      getFrames: () => this.totalFrames,
      getFrameRate: () => this.fps,
      setFrame: (frameIndex) => {
        // setFrame handled by PlaybackController; controller exposes getter only
        if (this._playback) {
          this._playback.setFrame(frameIndex);
        }
      },
      updatePinPosition: (t) => this._pin.updatePosition(t),
      updateObjectsVisibility: (t, opts) => this._objects.updateVisibilityByTime(t, opts),
      getKeyframes: () => this._keyframes.keyframes,
      getMovingObjects: () => this._keyframes?._movingObjectManager?.getAll?.() || [],
      setFrustumsVisible: (v) => this._keyframes.setFrustumsVisible(v),
      setMovingObjectsVisible: (v) => this._setMovingObjectsUIVisible(v),
      getMovingObjectsManager: () => this._keyframes?._movingObjectManager || null,
      onFrameChange: null,
    });
    this._playback.onTimeUpdate = (t) => this.onTimeUpdate?.(t);
    this._playback.onPlayStateChange = (playing, lockCamera) => this.onPlayStateChange?.(playing, lockCamera);
  }

  /**
   * Seek to time and wait for sequence PLY load (setFrameAsync). For Export Video prepareFrame.
   * @param {number} animationTimeSec - timeline time (seconds)
   * @returns {Promise<void>}
   */
  setFrameAsyncByTime(animationTimeSec) {
    const playback = this._playback;
    const objects = this._objects;
    if (!playback || !objects) return Promise.resolve();

    const viewer = this.viewer;
    if (viewer) viewer._exportVideoActive = true;

    playback.setTime(animationTimeSec);
    objects._collectSequencePromises = true;
    const t = Math.max(0, Number(animationTimeSec) || 0);
    const fps = Math.max(1, Math.min(60, parseInt(this.fps, 10) || 30));
    const frameIndex = Math.floor(t * fps);
    objects.updateVisibilityByTime(t, { isPlaying: false, frameIndex });

    const promises = Array.isArray(objects._sequencePromises) && objects._sequencePromises.length > 0
      ? Promise.all(objects._sequencePromises)
      : Promise.resolve();
    objects._collectSequencePromises = false;

    return promises
      .then(() => {
        playback.setTime(animationTimeSec);
      })
      .finally(() => {
        if (viewer) viewer._exportVideoActive = false;
      });
  }

  setCameraMoveSpeedProfile(startValue, endValue) {
    this._playback?.setCameraMoveSpeedProfile?.(startValue, endValue);
  }
  
  /**
   * Set camera moving object UI visibility (hidden while playing).
   * @private
   */
  _setMovingObjectsUIVisible(visible) {
    const manager = this._keyframes?._movingObjectManager;
    if (!manager) return;
    
    // Timeline UI visibility (white line always visible)
    manager.getAll().forEach(obj => {
      // Keep white line visible
      if (obj.element) {
        const whiteLines = obj.element.querySelectorAll('.camera-moving-object__line');
        whiteLines.forEach(line => {
          line.style.opacity = '1';
        });
        
        // Control other UI only
        const otherElements = obj.element.querySelectorAll(':not(.camera-moving-object__line)');
        otherElements.forEach(el => {
          el.style.opacity = visible ? '1' : '0';
        });
      }
      if (obj._element2) {
        const whiteLines2 = obj._element2.querySelectorAll('.camera-moving-object__line');
        whiteLines2.forEach(line => {
          line.style.opacity = '1';
        });
        
        const otherElements2 = obj._element2.querySelectorAll(':not(.camera-moving-object__line)');
        otherElements2.forEach(el => {
          el.style.opacity = visible ? '1' : '0';
        });
      }
    });
    
    // Toggle world curve only (green 3D path)
    if (!visible) {
      manager._removeWorldCurve?.();
    } else if (manager._selectedId) {
      const selectedObj = manager._objects.find(o => o.id === manager._selectedId);
      if (selectedObj) {
        manager._createWorldCurve?.(selectedObj);
      }
    }
  }

  // ========================================================================
  // Object management (wrapper)
  // ========================================================================

  /**
   * 단일 파일 오브젝트 추가
   * @param {string} name - 파일명
   * @param {Object} entity - PlayCanvas entity
   * @param {string|null} splatIdOrGlbId - splat ID 또는 glb ID
   * @param {{ objectType?: 'ply'|'glb' }} [options] - 'glb'면 타임라인 초록색 스타일
   */
  addObject(name, entity, splatIdOrGlbId = null, options = {}) {
    return this._objects.add(name, entity, splatIdOrGlbId, options);
  }

  /**
   * Add multi-file object.
   * @param {Object[]} files - each: entity, splatId, fileName
   */
  addMultiFileObject(files) {
    return this._objects.addMultiFile(files);
  }

  addSequenceObject(frames) {
    const seqMin = Array.isArray(frames) ? frames.length : 1;
    // IMPORTANT: bump totalFrames BEFORE creating the object so addSequence() uses
    // the correct maxSeconds for endSeconds initialization.
    this._minTotalFrames = Math.max(1, this._minTotalFrames || 1, seqMin);
    if (seqMin > this.totalFrames) {
      this.setTotalFrames(seqMin);
    }

    const obj = this._objects.addSequence(frames);
    this._syncTotalFramesFloor();
    return obj;
  }

  /**
   * Remove object.
   */
  removeObject(id) {
    this._objects.remove(id);
    this._syncTotalFramesFloor();
  }

  /**
   * Remove all objects.
   */
  clearObjects() {
    this._objects.clear();
    this._syncTotalFramesFloor();
  }

  /**
   * Toggle object visibility.
   */
  toggleObjectVisibility(id) {
    return this._objects.toggleVisibility(id);
  }

  /**
   * Select object.
   */
  selectObject(id) {
    this._objects.select(id);
  }

  /**
   * Clear selection.
   */
  clearSelection() {
    this._objects.clearSelection();
  }

  /**
   * Return selected object.
   */
  getSelectedObject() {
    return this._objects.getSelected();
  }

  /**
   * Return object list.
   */
  get objects() {
    return this._objects?.objects ?? [];
  }

  /**
   * Selected object ID.
   */
  get selectedObjectId() {
    return this._objects?.selectedObjectId ?? null;
  }

  /**
   * Render object blocks.
   */
  renderObjects() {
    this._objects?.render();
  }

  // ========================================================================
  // Keyframe management (wrapper)
  // ========================================================================

  /**
   * Add keyframe.
   */
  addKeyframe(t, state = null) {
    return this._keyframes.add(t, state);
  }

  /**
   * Remove keyframe.
   */
  removeKeyframe(id) {
    return this._keyframes.remove(id);
  }

  /**
   * Remove keyframe near time.
   */
  removeKeyframeAt(t, threshold = 0.5) {
    return this._keyframes.removeAt(t, threshold);
  }

  /**
   * Remove all keyframes.
   */
  clearKeyframes() {
    this._keyframes.clear();
  }

  /**
   * Return keyframe list.
   */
  getKeyframes() {
    return this._keyframes.getAll();
  }

  /**
   * Keyframe list (getter).
   */
  get keyframes() {
    return this._keyframes?.keyframes ?? [];
  }

  /**
   * Render keyframe markers.
   */
  renderKeyframeMarkers() {
    this._keyframes?.renderMarkers();
  }

  /**
   * Seek to keyframe.
   */
  goToKeyframe(id) {
    this._keyframes.goTo(id);
  }

  // ========================================================================
  // Playback (wrapper)
  // ========================================================================

  /**
   * Start play.
   */
  play() {
    this._playback.play();
  }

  /**
   * Stop play.
   */
  stop() {
    this._playback.stop();
  }

  /**
   * Toggle play/stop.
   */
  togglePlay() {
    if (this._playback?.isPlaying) {
      this._playback.stop();
      return;
    }
    this._playback.play();
  }

  /**
   * Whether playing.
   */
  get isPlaying() {
    return this._playback?.isPlaying ?? false;
  }

  /**
   * True when playing and 2+ camera markers (timeline controls camera in Fly).
   */
  get isCameraDrivenByPlayback() {
    if (!this._playback?.isPlaying) return false;
    const kfs = this._keyframes?.keyframes ?? [];
    return kfs.length > 1;
  }

  /**
   * Current time.
   */
  get currentTime() {
    return this._playback?.currentTime ?? 0;
  }

  set currentTime(t) {
    if (this._playback) {
      this._playback.currentTime = t;
    }
  }

  /**
   * Playback speed (FPS).
   */
  get speed() {
    return this.fps;
  }

  set speed(s) {
    this.fps = s;
  }

  /**
   * Seek to time.
   */
  seekTo(t) {
    this._playback.seekTo(t);
  }

  // ========================================================================
  // Pin (wrapper)
  // ========================================================================

  /**
   * Set pin position.
   */
  setPinPosition(seconds) {
    const t = Math.max(0, Math.min(this.getMaxSeconds(), seconds));
    this._playback.currentTime = t;
    this._pin.updatePosition(t);
    this._objects.updateVisibilityByTime(t);
    this.onTimeUpdate?.(t);
  }

  // ========================================================================
  // Ticks (wrapper)
  // ========================================================================

  /**
   * Render ticks.
   */
  renderTicks() {
    this._ticks?.render(this.totalFrames);
    this._frameGridTopEl = null;
    this._ensureFrameGridEls();
    this._updateFrameGridStyle();
  }

  // ========================================================================
  // Settings
  // ========================================================================

  /**
   * Set playback speed (setFrameRate).
   */
  setSpeed(s) {
    const prevFps = Math.max(1, Math.min(60, parseInt(this.fps) || 30));
    const fps = Math.max(1, Math.min(60, parseInt(s) || 30));

    if (fps === prevFps) {
      this.fps = fps;
      // PlaybackController reads FPS via getFrameRate; update fps only
      this._updateFrameGridStyle();
      return;
    }

    // Remap keyframes/objects to preserve FRAME INDICES across FPS changes.
    // totalFrames stays the same; maxSeconds changes (= totalFrames / fps).
    try {
      const totalFrames = Math.max(1, Math.min(18000, parseInt(this.totalFrames) || 90));
      const maxSecondsNew = totalFrames / fps;

      if (this._keyframes?.keyframes) {
        this._keyframes.keyframes.forEach((kf) => {
          let fi = Math.floor((Number(kf.t) || 0) * prevFps);
          if (fi < 0) fi = 0;
          if (fi >= totalFrames) fi = totalFrames - 1;
          kf.t = (fi + 0.5) / fps;
        });
        this._keyframes.onKeyframesChange?.(this._keyframes.keyframes);
      }

      const objs = this._objects?.objects || [];
      for (const obj of objs) {
        let sF = Math.round((Number(obj.startSeconds) || 0) * prevFps);
        let eF = Math.round((Number(obj.endSeconds) || 0) * prevFps);

        if (sF < 0) sF = 0;
        if (eF < 0) eF = 0;
        if (sF > totalFrames) sF = totalFrames;
        if (eF > totalFrames) eF = totalFrames;

        if (obj?.isSequence && Array.isArray(obj.files) && obj.files.length > 0) {
          const minLen = obj.files.length;
          if (eF - sF < minLen) {
            eF = Math.min(totalFrames, sF + minLen);
          }
          if (eF - sF < minLen) {
            sF = Math.max(0, eF - minLen);
          }
        }

        if (eF < sF) eF = sF;
        obj.startSeconds = Math.max(0, Math.min(maxSecondsNew, sF / fps));
        obj.endSeconds = Math.max(0, Math.min(maxSecondsNew, eF / fps));
      }
    } catch (e) {
    }

    this.fps = fps;
    // SuperSplat: PlaybackController는 getFrameRate를 통해 FPS를 읽음
    // setSpeed 메서드가 없으므로 fps만 업데이트

    // Full refresh so markers/white lines/blocks reflow to the new maxSeconds.
    this.renderTicks();
    this.renderObjects();
    this.renderKeyframeMarkers();
    try {
      this._keyframes?.refresh?.();
    } catch (e) {
    }
    this._pin?.updatePosition(this.currentTime);
    this._updateFrameGridStyle();
  }

  /**
   * Set max time (compat).
   * @param {number} s - max time (seconds)
   */
  setMaxSeconds(s) {
    const fps = Math.max(1, Math.min(60, parseInt(this.fps) || 30));
    const frames = Math.max(1, Math.min(18000, Math.round((Number(s) || 0) * fps)));
    this.setTotalFrames(frames);
  }

  setTotalFrames(frames) {
    const oldFrames = this.totalFrames;
    const floorFrames = Math.max(1, parseInt(this._minTotalFrames) || 1);
    const newFrames = Math.max(floorFrames, Math.min(18000, parseInt(frames) || 90));
    if (oldFrames === newFrames) return;
    this.totalFrames = newFrames;

    const fps = Math.max(1, Math.min(60, parseInt(this.fps) || 30));
    const maxSeconds = this.getMaxSeconds();

    // Re-place markers by stored ratio; or correct ratio from position
    if (this._keyframes?.keyframes?.length) {
      const maxNew = Math.max(0, newFrames - 1);
      const maxOld = Math.max(0, oldFrames - 1);
      this._keyframes.keyframes.forEach((kf) => {
        const ratio = kf.ratio != null && typeof kf.ratio === 'number'
          ? Math.max(0, Math.min(1, kf.ratio))
          : (maxOld <= 0 ? 0 : Math.max(0, Math.min(1, Math.floor((Number(kf.t) || 0) * fps) / maxOld)));
        let newFi = Math.round(ratio * maxNew);
        if (newFi < 0) newFi = 0;
        if (newFi > maxNew) newFi = maxNew;
        kf.t = (newFi + 0.5) / fps;
        // Keep ratio so adding 1 frame keeps proportion
      });
      this._keyframes.keyframes.sort((a, b) => a.t - b.t);
      this._keyframes.syncKeysFromKeyframes();
      this._keyframes.onKeyframesChange?.(this._keyframes.keyframes);
      try {
        this._keyframes.refresh?.();
      } catch (e) {
      }
    }

    // Objects: preserve start/end frame boundaries.
    try {
      const objs = this._objects?.objects || [];
      for (const obj of objs) {
        let sF = Math.round((Number(obj.startSeconds) || 0) * fps);
        let eF = Math.round((Number(obj.endSeconds) || 0) * fps);

        if (sF < 0) sF = 0;
        if (eF < 0) eF = 0;
        if (sF > newFrames) sF = newFrames;
        if (eF > newFrames) eF = newFrames;

        if (obj?.isSequence && Array.isArray(obj.files) && obj.files.length > 0) {
          const minLen = obj.files.length;
          if (eF - sF < minLen) {
            eF = sF + minLen;
          }
        }

        if (eF > newFrames) {
          eF = newFrames;
        }
        if (obj?.isSequence && Array.isArray(obj.files) && obj.files.length > 0) {
          const minLen = obj.files.length;
          if (eF - sF < minLen) {
            sF = Math.max(0, eF - minLen);
          }
        }

        if (eF < sF) eF = sF;

        obj.startSeconds = Math.max(0, Math.min(maxSeconds, sF / fps));
        obj.endSeconds = Math.max(0, Math.min(maxSeconds, eF / fps));
      }
    } catch (e) {
    }

    // Playback/pin: preserve current frame index.
    if (this._playback) {
      let fi = Math.floor((Number(this._playback.currentTime) || 0) * fps);
      if (fi < 0) fi = 0;
      if (fi >= newFrames) fi = newFrames - 1;
      this._playback.currentTime = (fi + 0.5) / fps;
    }

    this.renderTicks();
    this.renderObjects();
    this.renderKeyframeMarkers();
    this._pin?.updatePosition(this.currentTime);
    this._updateFrameGridStyle();

    this.onTotalFramesChange?.(this.totalFrames);
  }

  getMaxSeconds() {
    const fps = Math.max(1, Math.min(60, parseInt(this.fps) || 30));
    const frames = Math.max(1, Math.min(18000, parseInt(this.totalFrames) || 90));
    return frames / fps;
  }

  get maxSeconds() {
    return this.getMaxSeconds();
  }

  set maxSeconds(s) {
    this.setMaxSeconds(s);
  }

  // ========================================================================
  // 정리
  // ========================================================================

  /**
   * Dispose.
   */
  dispose() {
    this._playback?.stop();
    this._keyframes?.clear();
    this._objects?.clear();
    this._tooltip?.dispose();
    
    this.onTimeUpdate = null;
    this.onPlayStateChange = null;
    this.onKeyframesChange = null;
    this.onObjectsChange = null;
    this.onObjectSelect = null;

    /** @type {Function|null} */
    this.onTotalFramesChange = null;
  }

  _computeMinTotalFramesFromSequences() {
    const objs = this.objects || [];
    let minFrames = 1;
    for (const o of objs) {
      if (o?.isSequence && Array.isArray(o.files)) {
        minFrames = Math.max(minFrames, o.files.length);
      }
    }
    return minFrames;
  }

  _syncTotalFramesFloor() {
    this._minTotalFrames = this._computeMinTotalFramesFromSequences();
    if (this.totalFrames < this._minTotalFrames) {
      this.setTotalFrames(this._minTotalFrames);
    }
  }
}

export default TimelineController;
