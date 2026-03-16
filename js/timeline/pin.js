/**
 * Timeline pin manager.
 */

export class PinManager {
  /**
   * @param {Object} options
   * @param {HTMLElement} options.ticksEl - ticks element (for position)
   * @param {Function} options.onTimeChange - time change callback
   * @param {Function} [options.onTimeCommit] - commit on drag end
   * @param {Function} options.showTooltip - show tooltip
   * @param {Function} options.hideTooltip - hide tooltip
   * @param {Function} options.getMaxSeconds - max time getter
   * @param {Function} options.getCurrentTime - current time getter
   * @param {Function} [options.getFps] - FPS getter
   * @param {Function} [options.getTotalFrames] - total frames getter
   */
  constructor(options) {
    this._ticksEl = options.ticksEl;
    this._onTimeChange = options.onTimeChange;
    this._onTimeCommit = options.onTimeCommit;
    this._showTooltip = options.showTooltip;
    this._hideTooltip = options.hideTooltip;
    this._getMaxSeconds = options.getMaxSeconds;
    this._getCurrentTime = options.getCurrentTime;
    this._getFps = options.getFps || (() => 30);
    this._getTotalFrames = options.getTotalFrames || null;
    
    /** @type {HTMLElement|null} */
    this._pinEl = null;
    
    // Throttle pin position updates
    this._lastUpdateTime = 0;
    this._pendingUpdate = null;
    this._updateThrottleMs = 16; // ~60fps
  }

  /** Create and init pin. */
  init() {
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
    
    // Set initial position
    this.updatePosition(0);
    
    this._setupDrag();
    window.addEventListener('resize', () => this.refreshPositionOnResize());
    window.addEventListener('resize', () => this.refreshPositionOnResize());
  }

  /**
   * Get timeline track left/width.
   * @returns {{left: number, width: number}|null}
   */
  getTrackBounds() {
    const container = document.querySelector(".timeline-container");
    if (!this._ticksEl || !container) return null;
    
    const containerRect = container.getBoundingClientRect();
    const ticksRect = this._ticksEl.getBoundingClientRect();
    
    return {
      left: ticksRect.left - containerRect.left,
      width: ticksRect.width,
    };
  }

  /**
   * Setup pin drag.
   * @private
   */
  _setupDrag() {
    if (!this._pinEl) return;
    
    let isDragging = false;
    let lastSeconds = null;
    
    // Update pin from mouse (track-based)
    const updatePinFromMouse = (e) => {
      if (!this._ticksEl) return;
      const trackRect = this._ticksEl.getBoundingClientRect();
      const x = e.clientX - trackRect.left;
      const percent = Math.max(0, Math.min(1, x / trackRect.width));
      const fps = Math.max(1, Math.min(60, parseInt(this._getFps?.() || 30) || 30));
      const totalFrames = Math.max(1, parseInt(this._getTotalFrames?.() || 0) || Math.round(this._getMaxSeconds() * fps));
      let frameIndex = Math.floor(percent * totalFrames);
      if (frameIndex < 0) frameIndex = 0;
      if (frameIndex >= totalFrames) frameIndex = totalFrames - 1;
      const seconds = (frameIndex + 0.5) / fps;

      lastSeconds = seconds;
      this._onTimeChange(seconds);
      // Show tooltip while dragging
      const pinRect = this._pinEl.getBoundingClientRect();
      this._showTooltip(frameIndex, pinRect.left + pinRect.width / 2, pinRect.top);
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

        // Commit the final time so consumers can re-trigger any expensive work
        // (e.g. sequence frame load) at the stop position.
        try {
          const t = typeof lastSeconds === 'number' ? lastSeconds : this._getCurrentTime();
          this._onTimeCommit?.(t);
        } catch (e) {
        }
      }
    };
    
    // Show tooltip on pin hover
    this._pinEl.addEventListener("mouseenter", () => {
      const rect = this._pinEl.getBoundingClientRect();
      const fps = Math.max(1, Math.min(60, parseInt(this._getFps?.() || 30) || 30));
      const totalFrames = Math.max(1, parseInt(this._getTotalFrames?.() || 0) || Math.round(this._getMaxSeconds() * fps));
      let frameIndex = Math.floor((Number(this._getCurrentTime?.() || 0) || 0) * fps);
      if (frameIndex < 0) frameIndex = 0;
      if (frameIndex >= totalFrames) frameIndex = totalFrames - 1;
      this._showTooltip(frameIndex, rect.left + rect.width / 2, rect.top);
    });
    
    this._pinEl.addEventListener("mouseleave", () => {
      if (!isDragging) {
        this._hideTooltip();
      }
    });
    
    this._pinEl.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    
    // Pin follows click in timeline-top-right
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
   * Update pin position (throttled).
   * @param {number} seconds
   * @param {boolean} [force=false] - skip throttle
   */
  updatePosition(seconds, force = false) {
    if (!this._pinEl) return;
    
    const now = performance.now();
    const timeSinceLastUpdate = now - this._lastUpdateTime;
    
    // Throttle: schedule RAF if within interval
    if (!force && timeSinceLastUpdate < this._updateThrottleMs) {
      if (!this._pendingUpdate) {
        this._pendingUpdate = requestAnimationFrame(() => {
          this._applyPosition(seconds);
          this._pendingUpdate = null;
        });
      }
      return;
    }
    
    this._applyPosition(seconds);
  }
  
  /**
   * Apply pin position (internal).
   * @private
   * @param {number} seconds
   */
  _applyPosition(seconds) {
    if (!this._pinEl) return;
    const bounds = this.getTrackBounds();
    if (!bounds) return;
    
    const maxSeconds = this._getMaxSeconds();
    const percent = Math.max(0, Math.min(1, maxSeconds > 0 ? seconds / maxSeconds : 0));
    
    // Pin pixel position: trackStart + (trackWidth * ratio); clamp for translateX(-50%)
    const pinWidth = this._pinEl.offsetWidth || 16;
    const minPinX = bounds.left + pinWidth / 2;
    const pinX = Math.max(minPinX, bounds.left + (bounds.width * percent));
    
    // left로 직접 위치 지정 (핀 중앙이 해당 위치에 오도록)
    // width는 핀 자체 크기로 설정 (auto 또는 CSS에서 정의)
    this._pinEl.style.left = `${pinX}px`;
    this._pinEl.style.width = '';
    this._pinEl.style.transform = 'translateX(-50%)';
    
    this._lastUpdateTime = performance.now();
    // Store normalized position for resize
    this._lastPercent = percent;
  }

  /**
   * Re-apply pin position (e.g. on resize).
   */
  refreshPositionOnResize() {
    if (typeof this._lastPercent === 'number') {
      const seconds = this._lastPercent * this._getMaxSeconds();
      this.updatePosition(seconds, true);
    }
  }

  /**
   * Return pin element.
   * @returns {HTMLElement|null}
   */
  getElement() {
    return this._pinEl;
  }
}

export default PinManager;
