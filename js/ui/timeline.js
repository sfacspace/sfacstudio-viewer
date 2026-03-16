/** Timeline: camera keyframes, object blocks, pin, ticks. */

/**
 * @typedef {Object} CameraState
 * @property {{x:number, y:number, z:number}} position
 * @property {{x:number, y:number, z:number, w:number}} rotation
 * @property {{x:number, y:number, z:number}} target
 * @property {number} distance
 * @property {number} yaw
 * @property {number} pitch
 */

/**
 * @typedef {Object} Keyframe
 * @property {string} id
 * @property {number} t - 시간 (초)
 * @property {CameraState} state
 */

/**
 * @typedef {Object} TimelineObject
 * @property {string} id
 * @property {string} name
 * @property {number} startSeconds
 * @property {number} endSeconds
 * @property {boolean} visible
 * @property {Object} entity
 */

export class TimelineController {
  constructor(viewer) {
    this.viewer = viewer;
    this.keyframes = [];
    this.isPlaying = false;
    this._rafId = null;
    this._playStartTime = 0;
    this._playStartOffset = 0;
    this.speed = 1;
    this.maxSeconds = 30;
    this.currentTime = 0;
    this._prevOrbitEnabled = true;
    this.objects = [];
    this.selectedObjectId = null;
    this._ticksEl = null;
    this._objectsListEl = null;
    this._rightListEl = null;
    this._cameraLineRightEl = null;
    this._pinEl = null;
    this.onTimeUpdate = null;
    this.onPlayStateChange = null;
    this.onKeyframesChange = null;
    this.onObjectsChange = null;
    this.onObjectSelect = null;
  }

  init() {
    this._ticksEl = document.getElementById("timelineTicks");
    this._objectsListEl = document.getElementById("timelineSpacerObjectsList");
    this._rightListEl = document.getElementById("timelineSpacerRightList");
    this._cameraLineRightEl = document.querySelector(".timeline-camera-line__right");
    this._createTimeTooltip();
    this.renderTicks();
    this._createPin();
  }

  _createTimeTooltip() {
    if (this._tooltipEl) return;
    
    const tooltip = document.createElement("div");
    tooltip.className = "timeline-time-tooltip";
    tooltip.textContent = "0.00s";
    document.body.appendChild(tooltip);
    
    this._tooltipEl = tooltip;
  }
  
  _showTooltip(seconds, x, y) {
    if (!this._tooltipEl) return;
    
    this._tooltipEl.textContent = `${seconds.toFixed(2)}s`;
    this._tooltipEl.style.left = `${x}px`;
    this._tooltipEl.style.top = `${y}px`;
    this._tooltipEl.classList.add("is-visible");
  }
  
  _hideTooltip() {
    if (!this._tooltipEl) return;
    this._tooltipEl.classList.remove("is-visible");
  }

  renderTicks() {
    if (!this._ticksEl) return;
    
    this._ticksEl.innerHTML = "";
    
    for (let i = 0; i <= 10; i++) {
      const position = i * 10;
      const seconds = (i / 10) * this.maxSeconds;
      
      const tick = document.createElement("span");
      tick.className = "timeline__tick";
      tick.style.left = `${position}%`;
      
      const mark = document.createElement("span");
      mark.className = "timeline__mark";
      
      const label = document.createElement("span");
      label.className = "timeline__label";
      label.textContent = `${seconds.toFixed(seconds % 1 === 0 ? 0 : 1)}s`;
      
      tick.appendChild(mark);
      tick.appendChild(label);
      this._ticksEl.appendChild(tick);
    }
  }


  _createPin() {
    const container = document.querySelector(".timeline-container");
    if (!container || this._pinEl) return;
    
    const pin = document.createElement("div");
    pin.className = "timeline-pin";
    pin.setAttribute("role", "slider");
    pin.setAttribute("aria-label", "Timeline Pin");
    
    const head = document.createElement("div");
    head.className = "timeline-pin__head";
    
    const stem = document.createElement("div");
    stem.className = "timeline-pin__stem";
    
    pin.appendChild(head);
    pin.appendChild(stem);
    container.appendChild(pin);
    
    this._pinEl = pin;
    this._updatePinPosition(0);
    this._setupPinDrag();
  }

  _getTimelineTrackBounds() {
    const ticksEl = this._ticksEl;
    const container = document.querySelector(".timeline-container");
    if (!ticksEl || !container) return null;
    
    const containerRect = container.getBoundingClientRect();
    const ticksRect = ticksEl.getBoundingClientRect();
    
    return {
      left: ticksRect.left - containerRect.left,
      width: ticksRect.width,
    };
  }

  _setupPinDrag() {
    if (!this._pinEl) return;
    let isDragging = false;
    const updatePinFromMouse = (e) => {
      const bounds = this._getTimelineTrackBounds();
      if (!bounds) return;
      
      const container = document.querySelector(".timeline-container");
      if (!container) return;
      
      const containerRect = container.getBoundingClientRect();
      const x = e.clientX - containerRect.left - bounds.left;
      
      const percent = Math.max(0, Math.min(1, x / bounds.width));
      const seconds = percent * this.maxSeconds;
      
      this.currentTime = seconds;
      this._updatePinPosition(seconds);
      this.onTimeUpdate?.(seconds);
      const pinRect = this._pinEl.getBoundingClientRect();
      this._showTooltip(seconds, pinRect.left + pinRect.width / 2, pinRect.top);
    };
    
    const onMouseDown = (e) => {
      isDragging = true;
      e.preventDefault();
    };
    
    const onMouseMove = (e) => {
      if (!isDragging) return;
      updatePinFromMouse(e);
    };
    
    const onMouseUp = () => {
      if (isDragging) {
        isDragging = false;
        this._hideTooltip();
      }
    };
    
    this._pinEl.addEventListener("mouseenter", () => {
      const rect = this._pinEl.getBoundingClientRect();
      this._showTooltip(this.currentTime, rect.left + rect.width / 2, rect.top);
    });
    
    this._pinEl.addEventListener("mouseleave", () => {
      if (!isDragging) {
        this._hideTooltip();
      }
    });
    
    this._pinEl.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    
    const topRightEl = document.querySelector(".timeline-top-right");
    if (topRightEl) {
      topRightEl.addEventListener("mousedown", (e) => {
        if (e.target.closest(".timeline-top-right")) {
          isDragging = true;
          updatePinFromMouse(e);
          e.preventDefault();
        }
      });
    }
  }

  /**
   * 핀 위치 업데이트
   * 핀 위치가 변경되면 항상 오브젝트 가시성도 업데이트
   * @param {number} seconds
   * @private
   */
  _updatePinPosition(seconds) {
    if (!this._pinEl) return;
    
    const bounds = this._getTimelineTrackBounds();
    if (!bounds) return;
    
    const percent = Math.max(0, Math.min(1, seconds / this.maxSeconds));
    const left = bounds.left + (percent * bounds.width);
    this._pinEl.style.left = `${left}px`;
    
    this._updateObjectsVisibilityByTime(seconds);
  }

  /**
   * 핀 위치를 특정 시간으로 설정
   * @param {number} seconds
   */
  setPinPosition(seconds) {
    this.currentTime = Math.max(0, Math.min(this.maxSeconds, seconds));
    this._updatePinPosition(this.currentTime);
    this.onTimeUpdate?.(this.currentTime);
  }


  /**
   * 오브젝트 추가 (파일 로드 시 호출)
   * @param {string} name - 파일명
   * @param {Object} entity - PlayCanvas entity
   * @param {string} splatId - viewer에서 관리하는 splat ID (다중 splat 지원)
   * @returns {TimelineObject}
   */
  addObject(name, entity, splatId = null) {
    const obj = {
      id: `obj_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      name,
      startSeconds: 0,
      endSeconds: this.maxSeconds,
      visible: true,
      entity,
      splatId,
    };
    
    this.objects.push(obj);
    this.renderObjects();
    this.onObjectsChange?.(this.objects);
    return obj;
  }

  /**
   * Remove object by id
   * @param {string} id
   */
  removeObject(id) {
    const idx = this.objects.findIndex(o => o.id === id);
    if (idx === -1) return;
    
    this.objects.splice(idx, 1);
    
    if (this.selectedObjectId === id) {
      this.selectedObjectId = null;
    }
    
    this.renderObjects();
    this.onObjectsChange?.(this.objects);
  }

  clearObjects() {
    this.objects = [];
    this.selectedObjectId = null;
    this.renderObjects();
    this.onObjectsChange?.(this.objects);
  }

  /**
   * 오브젝트 가시성 토글
   * @param {string} id
   * @returns {boolean} 새로운 가시성 상태
   */
  toggleObjectVisibility(id) {
    const obj = this.objects.find(o => o.id === id);
    if (!obj) return false;
    
    obj.visible = !obj.visible;
    
    if (obj.entity) {
      obj.entity.enabled = obj.visible;
    }
    
    this.renderObjects();
    return obj.visible;
  }

  /**
   * 오브젝트 선택
   * @param {string} id
   */
  selectObject(id) {
    this.selectedObjectId = id;
    this.renderObjects();
    
    const obj = this.objects.find(o => o.id === id);
    this.onObjectSelect?.(obj || null);
  }

  /**
   * 선택 해제
   */
  clearSelection() {
    this.selectedObjectId = null;
    this.renderObjects();
    this.onObjectSelect?.(null);
  }

  /**
   * 오브젝트 블록 렌더링
   */
  renderObjects() {
    if (!this._objectsListEl || !this._rightListEl) return;
    
    this._objectsListEl.innerHTML = "";
    this._rightListEl.innerHTML = "";
    
    if (this.objects.length === 0) return;
    
    const BLOCK_HEIGHT = 32;
    const BLOCK_GAP = 4;
    
    this.objects.forEach((obj, index) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "timeline__obj-btn";
      btn.dataset.objectId = obj.id;
      
      if (this.selectedObjectId === obj.id) {
        btn.classList.add("is-selected");
      }
      
      const nameEl = document.createElement("span");
      nameEl.className = "timeline__obj-btn-name";
      nameEl.textContent = obj.name;
      
      // 눈 버튼
      const visBtn = document.createElement("button");
      visBtn.type = "button";
      visBtn.className = "timeline__obj-btn-vis";
      visBtn.setAttribute("aria-pressed", obj.visible ? "true" : "false");
      visBtn.title = "Show/Hide";
      if (!obj.visible) {
        visBtn.classList.add("is-off");
      }
      
      const visIcon = document.createElement("span");
      visIcon.className = "timeline__obj-btn-vis-icon";
      visIcon.setAttribute("aria-hidden", "true");
      visBtn.appendChild(visIcon);
      
      btn.appendChild(nameEl);
      btn.appendChild(visBtn);
      
      btn.addEventListener("click", (e) => {
        if (e.target === visBtn || visBtn.contains(e.target)) return;
        
        if (this.selectedObjectId === obj.id) {
          this.clearSelection();
        } else {
          this.selectObject(obj.id);
        }
      });
      
      visBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const newVisible = this.toggleObjectVisibility(obj.id);
        visBtn.classList.toggle("is-off", !newVisible);
        visBtn.setAttribute("aria-pressed", newVisible ? "true" : "false");
      });
      
      this._objectsListEl.appendChild(btn);
      
      const block = document.createElement("div");
      block.className = "timeline__obj-block";
      block.dataset.objectId = obj.id;
      
      if (this.selectedObjectId === obj.id) {
        block.classList.add("is-selected");
      }
      if (!obj.visible) {
        block.classList.add("is-hidden");
      }
      
      const startPercent = (obj.startSeconds / this.maxSeconds) * 100;
      const endPercent = (obj.endSeconds / this.maxSeconds) * 100;
      const widthPercent = endPercent - startPercent;
      
      const topOffset = 6 + index * (BLOCK_HEIGHT + BLOCK_GAP);
      
      block.style.left = `${startPercent}%`;
      block.style.width = `${widthPercent}%`;
      block.style.top = `${topOffset}px`;
      
      const leftHandle = document.createElement("div");
      leftHandle.className = "timeline__obj-block__resize-handle timeline__obj-block__resize-handle--left";
      
      const rightHandle = document.createElement("div");
      rightHandle.className = "timeline__obj-block__resize-handle timeline__obj-block__resize-handle--right";
      
      block.appendChild(leftHandle);
      block.appendChild(rightHandle);
      
      this._setupBlockInteractions(block, obj, leftHandle, rightHandle);
      
      block.addEventListener("click", () => {
        if (this.selectedObjectId === obj.id) {
          this.clearSelection();
        } else {
          this.selectObject(obj.id);
        }
      });
      
      this._rightListEl.appendChild(block);
    });
    
    if (this.objects.length > 0) {
      const totalHeight = 6 + this.objects.length * (BLOCK_HEIGHT + BLOCK_GAP) + 6;
      this._rightListEl.style.minHeight = `${totalHeight}px`;
    }
  }

  /**
   * 블록 위치/크기를 초 단위로 업데이트
   * @private
   */
  _updateBlockStyle(block, startSeconds, endSeconds) {
    const startPercent = (startSeconds / this.maxSeconds) * 100;
    const widthPercent = ((endSeconds - startSeconds) / this.maxSeconds) * 100;
    
    block.style.left = `${startPercent}%`;
    block.style.width = `${widthPercent}%`;
  }

  /**
   * 블록 드래그/리사이즈 설정
   * @private
   */
  _setupBlockInteractions(block, obj, leftHandle, rightHandle) {
    let isDragging = false;
    let isResizing = false;
    let resizeSide = null;
    let startX = 0;
    let startStartFrame = 0;
    let startEndFrame = 0;
    
    const FPS = 30;
    const totalFrames = Math.max(1, Math.round(this.maxSeconds * FPS));
    const MIN_DURATION_FRAMES = 1;
    const frameToSeconds = (frame) => Math.max(0, Math.min(this.maxSeconds, frame / FPS));
    const secondsToFrame = (seconds) => {
      let frame = Math.floor((Number(seconds) || 0) * FPS);
      if (frame < 0) frame = 0;
      if (frame >= totalFrames) frame = totalFrames - 1;
      return frame;
    };

    const getTrackWidth = () => this._rightListEl?.clientWidth || 100;
    
    leftHandle.addEventListener("mouseenter", () => {
      const rect = leftHandle.getBoundingClientRect();
      this._showTooltip(obj.startSeconds, rect.left + rect.width / 2, rect.top);
    });
    
    leftHandle.addEventListener("mouseleave", () => {
      if (!isResizing) {
        this._hideTooltip();
      }
    });
    
    rightHandle.addEventListener("mouseenter", () => {
      const rect = rightHandle.getBoundingClientRect();
      this._showTooltip(obj.endSeconds, rect.left + rect.width / 2, rect.top);
    });
    
    rightHandle.addEventListener("mouseleave", () => {
      if (!isResizing) {
        this._hideTooltip();
      }
    });
    
    const onBlockMouseDown = (e) => {
      if (e.target === leftHandle || e.target === rightHandle) return;
      
      isDragging = true;
      startX = e.clientX;
      startStartFrame = secondsToFrame(obj.startSeconds);
      startEndFrame = Math.min(totalFrames, Math.max(startStartFrame + 1, Math.floor((Number(obj.endSeconds) || 0) * FPS)));
      e.preventDefault();
    };

    const onResizeMouseDown = (side) => (e) => {
      isResizing = true;
      resizeSide = side;
      startX = e.clientX;
      startStartFrame = secondsToFrame(obj.startSeconds);
      startEndFrame = Math.min(totalFrames, Math.max(startStartFrame + 1, Math.floor((Number(obj.endSeconds) || 0) * FPS)));
      e.preventDefault();
      e.stopPropagation();
    };
    
    const onMouseMove = (e) => {
      if (!isDragging && !isResizing) return;

      const trackWidth = getTrackWidth();
      const deltaX = e.clientX - startX;
      const dtFrames = Math.round((deltaX / trackWidth) * totalFrames);

      if (isDragging) {
        let durationFrames = startEndFrame - startStartFrame;
        durationFrames = Math.max(MIN_DURATION_FRAMES, durationFrames);

        let newStartFrame = startStartFrame + dtFrames;
        newStartFrame = Math.max(0, Math.min(totalFrames - durationFrames, newStartFrame));
        let newEndFrame = newStartFrame + durationFrames;
        if (newEndFrame > totalFrames) {
          newEndFrame = totalFrames;
          newStartFrame = Math.max(0, newEndFrame - durationFrames);
        }

        obj.startSeconds = frameToSeconds(newStartFrame);
        obj.endSeconds = frameToSeconds(newEndFrame);
        this._updateBlockStyle(block, obj.startSeconds, obj.endSeconds);
      } else if (isResizing) {
        if (resizeSide === "left") {
          let newStartFrame = startStartFrame + dtFrames;
          newStartFrame = Math.max(0, Math.min(startEndFrame - MIN_DURATION_FRAMES, newStartFrame));

          obj.startSeconds = frameToSeconds(newStartFrame);
          obj.endSeconds = frameToSeconds(startEndFrame);
          this._updateBlockStyle(block, obj.startSeconds, obj.endSeconds);

          const rect = leftHandle.getBoundingClientRect();
          this._showTooltip(obj.startSeconds, rect.left + rect.width / 2, rect.top);
        } else if (resizeSide === "right") {
          let newEndFrame = startEndFrame + dtFrames;
          newEndFrame = Math.min(totalFrames, Math.max(startStartFrame + MIN_DURATION_FRAMES, newEndFrame));

          obj.startSeconds = frameToSeconds(startStartFrame);
          obj.endSeconds = frameToSeconds(newEndFrame);
          this._updateBlockStyle(block, obj.startSeconds, obj.endSeconds);

          const rect = rightHandle.getBoundingClientRect();
          this._showTooltip(obj.endSeconds, rect.left + rect.width / 2, rect.top);
        }
      }
    };
    
    const onMouseUp = () => {
      if (isDragging || isResizing) {
        isDragging = false;
        isResizing = false;
        resizeSide = null;
        this._hideTooltip();
      }
    };
    
    block.addEventListener("mousedown", onBlockMouseDown);
    leftHandle.addEventListener("mousedown", onResizeMouseDown("left"));
    rightHandle.addEventListener("mousedown", onResizeMouseDown("right"));
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }


  /**
   * 키프레임 추가
   * @param {number} t - 시간 (초)
   * @param {CameraState} [state] - 없으면 현재 카메라 상태 사용
   * @returns {Keyframe|null}
   */
  addKeyframe(t, state = null) {
    if (!this.viewer) return null;
    
    const camState = state || this.viewer.getCameraState();
    if (!camState) return null;
    
    const threshold = 0.1;
    const existIdx = this.keyframes.findIndex(kf => Math.abs(kf.t - t) < threshold);
    
    const pos = camState.position;
    const yaw = camState.yaw;
    const pitch = camState.pitch;
    const posStr = `Pos(${pos.x.toFixed(2)}, ${pos.y.toFixed(2)}, ${pos.z.toFixed(2)})`;
    const rotStr = `Rot(${pitch.toFixed(2)}, ${yaw.toFixed(2)}, 0)`;
    
    if (existIdx !== -1) {
      this.keyframes[existIdx].state = { ...camState };
      this.keyframes[existIdx].t = t;
    } else {
      const kf = {
        id: `kf_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        t,
        state: { ...camState },
      };
      this.keyframes.push(kf);
    }
    
    this.keyframes.sort((a, b) => a.t - b.t);
    this.renderKeyframeMarkers();
    this.onKeyframesChange?.(this.keyframes);
    
    return this.keyframes.find(kf => Math.abs(kf.t - t) < threshold) || null;
  }

  /**
   * 키프레임 삭제
   * @param {string} id
   */
  removeKeyframe(id) {
    const idx = this.keyframes.findIndex(kf => kf.id === id);
    if (idx === -1) return false;
    
    this.keyframes.splice(idx, 1);
    this.renderKeyframeMarkers();
    this.onKeyframesChange?.(this.keyframes);
    return true;
  }

  /**
   * 특정 시간 근처 키프레임 삭제
   * @param {number} t
   * @param {number} threshold
   */
  removeKeyframeAt(t, threshold = 0.5) {
    const kf = this.keyframes.find(k => Math.abs(k.t - t) < threshold);
    if (!kf) return false;
    return this.removeKeyframe(kf.id);
  }

  /**
   * 모든 키프레임 삭제
   */
  clearKeyframes() {
    this.keyframes = [];
    this.renderKeyframeMarkers();
    this.onKeyframesChange?.(this.keyframes);
  }

  /**
   * 키프레임 목록 반환
   */
  getKeyframes() {
    return [...this.keyframes];
  }

  /**
   * 키프레임 마커 렌더링
   * 핀과 동일한 부모(timeline-container)에 추가하여 z-index가 제대로 작동하도록 함
   */
  renderKeyframeMarkers() {
    const container = document.querySelector(".timeline-container");
    if (!container) return;
    
    container.querySelectorAll(".timeline-camera-marker, .timeline-keyframe-marker").forEach(el => el.remove());
    
    if (this.keyframes.length === 0) return;
    
    // 핀과 동일한 위치 계산 방식 사용
    const bounds = this._getTimelineTrackBounds();
    if (!bounds) return;
    
    const cameraLine = document.querySelector(".timeline-camera-line");
    const containerRect = container.getBoundingClientRect();
    let markerTop = "50%"; // fallback
    if (cameraLine) {
      const cameraLineRect = cameraLine.getBoundingClientRect();
      const cameraLineCenterY = cameraLineRect.top + cameraLineRect.height / 2 - containerRect.top;
      markerTop = `${cameraLineCenterY}px`;
    }
    
    this.keyframes.forEach((kf) => {
      const marker = document.createElement("div");
      marker.className = "timeline-camera-marker";
      marker.dataset.keyframeId = kf.id;
      
      const percent = Math.max(0, Math.min(1, kf.t / this.maxSeconds));
      const leftPx = bounds.left + (percent * bounds.width);
      marker.style.left = `${leftPx}px`;
      marker.style.top = markerTop;
      
      this._setupKeyframeMarkerDrag(marker, kf, bounds);
      
      container.appendChild(marker);
    });
  }
  
  /**
   * 키프레임 마커 드래그 설정
   * @private
   */
  _setupKeyframeMarkerDrag(marker, kf, bounds) {
    let isDragging = false;
    let hasMoved = false;
    
    marker.addEventListener("mouseenter", () => {
      if (!isDragging) {
        const rect = marker.getBoundingClientRect();
        this._showTooltip(kf.t, rect.left + rect.width / 2, rect.top);
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
      const currentBounds = this._getTimelineTrackBounds();
      if (!currentBounds) return;
      
      const x = e.clientX - containerRect.left - currentBounds.left;
      
      const percent = Math.max(0, Math.min(1, x / currentBounds.width));
      const newT = percent * this.maxSeconds;
      
      kf.t = newT;
      
      const newLeftPx = currentBounds.left + (percent * currentBounds.width);
      marker.style.left = `${newLeftPx}px`;
      
      const rect = marker.getBoundingClientRect();
      this._showTooltip(newT, rect.left + rect.width / 2, rect.top);
    };
    
    const onMouseUp = () => {
      if (isDragging) {
        isDragging = false;
        this._hideTooltip();
        
        if (hasMoved) {
          this.keyframes.sort((a, b) => a.t - b.t);
          this.onKeyframesChange?.(this.keyframes);
        }
      }
    };
    
    marker.addEventListener("click", (e) => {
      if (!hasMoved) {
        e.stopPropagation();
        this.goToKeyframe(kf.id);
      }
    });
    
    marker.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }


  /**
   * 재생 시작
   * 카메라 키프레임이 없어도 재생 가능 (0초 ~ maxSeconds 무한루프)
   */
  play() {
    if (this.isPlaying) return;
    
    this.isPlaying = true;
    
    if (this.viewer) {
      this._prevOrbitEnabled = this.viewer.isOrbitEnabled?.() ?? true;
      this.viewer.setOrbitEnabled?.(false);
    }
    
    this._playStartTime = performance.now();
    this._playStartOffset = this.currentTime;
    this.onPlayStateChange?.(true);
    
    this._tick();
  }

  /**
   * 재생 정지
   */
  stop() {
    if (!this.isPlaying) return;
    
    this.isPlaying = false;
    
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
    
    if (this.viewer) {
      this.viewer.setOrbitEnabled?.(this._prevOrbitEnabled);
    }
    this.onPlayStateChange?.(false);
  }

  /**
   * 재생/정지 토글
   */
  togglePlay() {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.play();
    }
  }

  /**
   * 재생 루프
   * 0초 ~ maxSeconds 무한루프
   * @private
   */
  _tick() {
    if (!this.isPlaying) return;
    
    const now = performance.now();
    const elapsed = ((now - this._playStartTime) / 1000) * this.speed;
    this.currentTime = this._playStartOffset + elapsed;
    
    // 0초 ~ maxSeconds 무한루프
    if (this.currentTime > this.maxSeconds) {
      this.currentTime = 0;
      this._playStartTime = now;
      this._playStartOffset = 0;
    }
    
    this._updatePinPosition(this.currentTime);
    
    if (this.keyframes.length >= 2) {
      this._applyInterpolatedState(this.currentTime);
    }
    
    this.onTimeUpdate?.(this.currentTime);
    
    this._rafId = requestAnimationFrame(() => this._tick());
  }
  
  /**
   * 현재 시간에 따라 오브젝트 가시성 업데이트
   * 타임블록의 startSeconds ~ endSeconds 사이면 렌더링, 아니면 숨김
   * @param {number} t - 현재 재생 시간
   * @private
   */
  _updateObjectsVisibilityByTime(t) {
    for (const obj of this.objects) {
      const inRange = t >= obj.startSeconds && t <= obj.endSeconds;
      
      if (obj.entity) {
        obj.entity.enabled = inRange && obj.visible;
      }
    }
  }

  /**
   * 특정 시간의 보간된 카메라 상태 적용
   * @param {number} t
   * @private
   */
  _applyInterpolatedState(t) {
    if (!this.viewer || this.keyframes.length === 0) return;
    
    const pc = window.pc;
    if (!pc) return;
    
    if (this.keyframes.length === 1) {
      this.viewer.setCameraState(this.keyframes[0].state);
      return;
    }
    
    let fromKf = this.keyframes[0];
    let toKf = this.keyframes[1];
    
    for (let i = 0; i < this.keyframes.length - 1; i++) {
      if (t >= this.keyframes[i].t && t <= this.keyframes[i + 1].t) {
        fromKf = this.keyframes[i];
        toKf = this.keyframes[i + 1];
        break;
      }
      if (i === this.keyframes.length - 2 && t > this.keyframes[i + 1].t) {
        fromKf = toKf = this.keyframes[i + 1];
      }
    }
    
    if (t < this.keyframes[0].t) {
      this.viewer.setCameraState(this.keyframes[0].state);
      return;
    }
    
    const duration = toKf.t - fromKf.t;
    let alpha = 0;
    if (duration > 0) {
      alpha = Math.max(0, Math.min(1, (t - fromKf.t) / duration));
    }
    
    const state = this._interpolate(fromKf.state, toKf.state, alpha, pc);
    this.viewer.setCameraState(state);
  }

  /**
   * 두 카메라 상태 보간
   * @private
   */
  _interpolate(from, to, alpha, pc) {
    // Position lerp
    const fromPos = new pc.Vec3(from.position.x, from.position.y, from.position.z);
    const toPos = new pc.Vec3(to.position.x, to.position.y, to.position.z);
    const pos = new pc.Vec3();
    pos.lerp(fromPos, toPos, alpha);
    
    // Rotation slerp
    const fromRot = new pc.Quat(from.rotation.x, from.rotation.y, from.rotation.z, from.rotation.w);
    const toRot = new pc.Quat(to.rotation.x, to.rotation.y, to.rotation.z, to.rotation.w);
    const rot = new pc.Quat();
    rot.slerp(fromRot, toRot, alpha);
    
    // Target lerp
    const fromTarget = new pc.Vec3(from.target.x, from.target.y, from.target.z);
    const toTarget = new pc.Vec3(to.target.x, to.target.y, to.target.z);
    const target = new pc.Vec3();
    target.lerp(fromTarget, toTarget, alpha);
    
    // Scalar lerp
    const distance = from.distance + (to.distance - from.distance) * alpha;
    const yaw = from.yaw + (to.yaw - from.yaw) * alpha;
    const pitch = from.pitch + (to.pitch - from.pitch) * alpha;
    
    return {
      position: { x: pos.x, y: pos.y, z: pos.z },
      rotation: { x: rot.x, y: rot.y, z: rot.z, w: rot.w },
      target: { x: target.x, y: target.y, z: target.z },
      distance,
      yaw,
      pitch,
    };
  }


  /**
   * 특정 시간으로 이동 + 카메라 적용
   * @param {number} t
   */
  seekTo(t) {
    this.currentTime = Math.max(0, Math.min(this.maxSeconds, t));
    this._updatePinPosition(this.currentTime);
    
    if (this.isPlaying) {
      this._playStartTime = performance.now();
      this._playStartOffset = this.currentTime;
    }
    
    if (!this.isPlaying && this.keyframes.length > 0) {
      this._applyInterpolatedState(this.currentTime);
    }
    
    this.onTimeUpdate?.(this.currentTime);
  }

  /**
   * 특정 키프레임으로 이동
   * @param {string} id
   */
  goToKeyframe(id) {
    const kf = this.keyframes.find(k => k.id === id);
    if (!kf) return;
    
    this.seekTo(kf.t);
    this.viewer?.setCameraState(kf.state);
  }


  setSpeed(s) {
    this.speed = Math.max(0.1, Math.min(30, s));
  }

  setMaxSeconds(s) {
    this.maxSeconds = Math.max(1, Math.min(300, s));
    this.renderTicks();
    this.renderObjects();
    this.renderKeyframeMarkers();
    this._updatePinPosition(this.currentTime);
  }

  dispose() {
    this.stop();
    this.keyframes = [];
    this.objects = [];
    this.onTimeUpdate = null;
    this.onPlayStateChange = null;
    this.onKeyframesChange = null;
    this.onObjectsChange = null;
    this.onObjectSelect = null;
  }
}

export default TimelineController;
