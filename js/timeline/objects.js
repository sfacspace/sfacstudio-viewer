/**
 * Timeline object blocks. SuperSplat: updateVisibilityByTime on setFrame/setTime; sequence uses onSequenceFrameChange → PlySequenceController.
 */

export class ObjectsManager {
  /**
   * @param {Object} options
   * @param {HTMLElement} options.objectsListEl - left object list
   * @param {HTMLElement} options.rightListEl - right block list
   * @param {Function} options.getMaxSeconds - max time getter
   * @param {Function} options.getCurrentTime - current time getter
   * @param {Function} options.showTooltip - show tooltip
   * @param {Function} options.hideTooltip - hide tooltip
   */
  constructor(options) {
    // Scrubbing detection for frame loading optimization
    this._isScrubbing = false;
    this._scrubDebounceTimer = null;
    this._scrubThrottleTimer = null;
    this._lastScrubTime = 0;
    this._scrubDebounceMs = 150; // Wait 150ms after drag ends before loading final frame
    this._scrubThrottleMs = 100; // Load at most once per 100ms during scrubbing
    this._objectsListEl = options.objectsListEl;
    this._rightListEl = options.rightListEl;
    this._getMaxSeconds = options.getMaxSeconds;
    this._getCurrentTime = options.getCurrentTime;
    this._getFps = options.getFps || (() => 30);
    this._getTotalFrames = options.getTotalFrames || null;
    this._showTooltip = options.showTooltip;
    this._hideTooltip = options.hideTooltip;

    /** @type {Function|null} - sequence frame change (obj, frameIndex) */
    this.onSequenceFrameChange = options.onSequenceFrameChange || null;
    
    /** @type {import('./types').TimelineObject[]} */
    this.objects = [];
    
    /** @type {string|null} */
    this.selectedObjectId = null;
    
    /** @type {string|null} - object ID being name-edited */
    this._editingNameId = null;
    
    // Callbacks
    /** @type {Function|null} */
    this.onObjectsChange = null;
    /** @type {Function|null} */
    this.onObjectSelect = null;
    /** @type {Function|null} - delete request callback */
    this.onDeleteRequest = null;
  }

  /**
   * Add single-file object.
   * @param {string} name
   * @param {Object} entity
   * @param {string|null} splatId
   * @param {Object} [options]
   * @returns {import('./types').TimelineObject}
   */
  add(name, entity, splatId = null, options = {}) {
    const obj = {
      id: `obj_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      name,
      startSeconds: 0,
      endSeconds: this._getMaxSeconds(),
      visible: true,
      entity,
      splatId,
      glbId: null,
      objectType: 'ply',
      loadedWithGlb: false,
      pairedGlbObjectId: null,
      isMultiFile: false,
      files: null,
    };

    this.objects.push(obj);
    this.render();
    this.onObjectsChange?.(this.objects);

    return obj;
  }

  /**
   * Add frame sequence (lazy load).
   * @param {Array<{file: File, fileName: string}>} frames
   * @returns {import('./types').TimelineObject}
   */
  addSequence(frames) {
    if (!frames || frames.length === 0) return null;

    const firstName = frames[0].fileName.replace(/\.[^/.]+$/, "");
    const name = `${firstName}_sequence`;

    const obj = {
      id: `obj_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      name,
      startSeconds: 0,
      endSeconds: this._getMaxSeconds(),
      visible: true,
      entity: null,
      splatId: null,
      isMultiFile: true,
      isSequence: true,
      files: frames,
      _activeFrameIndex: -1,
      /** 'uniform' | 'repeat' | 'reverseRepeat' */
      sequencePlaybackMode: "uniform",
    };

    this.objects.push(obj);
    this.render();
    this.onObjectsChange?.(this.objects);

    return obj;
  }

  /**
   * Add multi-file object.
   * @param {Array<{entity: Object, splatId: string, fileName: string}>} files - sorted
   * @returns {import('./types').TimelineObject}
   */
  addMultiFile(files) {
    if (!files || files.length === 0) return null;
    
    const firstName = files[0].fileName.replace(/\.[^/.]+$/, "");
    const name = `${firstName}_set`;
    
    // Hide all entities initially (show first only)
    files.forEach((f, idx) => {
      if (f.entity) {
        f.entity.enabled = (idx === 0);
      }
    });
    
    const obj = {
      id: `obj_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      name,
      startSeconds: 0,
      endSeconds: this._getMaxSeconds(),
      visible: true,
      entity: null, // multi-file uses files, not entity
      splatId: null,
      isMultiFile: true,
      files: files,
    };
    
    this.objects.push(obj);
    this.render();
    this.onObjectsChange?.(this.objects);
    
    return obj;
  }

  /**
   * Remove object.
   * @param {string} id
   */
  remove(id) {
    const idx = this.objects.findIndex(o => o.id === id);
    if (idx === -1) return;
    
    this.objects.splice(idx, 1);
    
    if (this.selectedObjectId === id) {
      this.selectedObjectId = null;
    }
    
    this.render();
    this.onObjectsChange?.(this.objects);
  }

  /** Remove all objects. */
  clear() {
    this.objects = [];
    this.selectedObjectId = null;
    this.render();
    this.onObjectsChange?.(this.objects);
  }

  /**
   * Toggle object visibility.
   * @param {string} id
   * @returns {boolean} new visibility
   */
  toggleVisibility(id) {
    const obj = this.objects.find(o => o.id === id);
    if (!obj) return false;
    
    obj.visible = !obj.visible;
    
    if (obj.isMultiFile && obj.files) {
      if (!obj.visible) {
        // Inactive: sequence hide current + release frame; multi-file hide all
        if (obj.isSequence) {
          if (obj.entity) obj.entity.enabled = false;
          if (obj._activeFrameIndex !== -1 || obj.entity) {
            this.onSequenceFrameChange?.(obj, -1);
          }
          obj._activeFrameIndex = -1;
          obj._sequenceTickState = null;
        } else {
          obj.files.forEach(f => {
            if (f.entity) f.entity.enabled = false;
          });
        }
      } else {
        // Active: update by time/frame (sequence or multi-file)
        this._updateSingleObjectVisibility(obj);
      }
    } else if (obj.entity) {
      obj.entity.enabled = obj.visible;
    }
    
    this.render();
    return obj.visible;
  }

  /**
   * Select object.
   * @param {string} id
   */
  select(id) {
    this.selectedObjectId = id;
    this.render();
    
    const obj = this.objects.find(o => o.id === id);
    this.onObjectSelect?.(obj || null);
  }

  /** Clear selection. */
  clearSelection() {
    this.selectedObjectId = null;
    this.render();
    this.onObjectSelect?.(null);
  }

  /**
   * Return selected object.
   * @returns {import('./types').TimelineObject|null}
   */
  getSelected() {
    if (!this.selectedObjectId) return null;
    return this.objects.find(o => o.id === this.selectedObjectId) || null;
  }

  /**
   * Update object visibility by current time
   * @param {number} t - 현재 시간
   * @param {{dt?: number, isPlaying?: boolean}|null} [opts]
   */
  /**
   * For Export Video: collect sequence load promises when updateVisibilityByTime runs.
   */
  _collectSequencePromises = false;
  _sequencePromises = [];

  updateVisibilityByTime(t, opts = null) {
    if (this._collectSequencePromises) this._sequencePromises = [];

    // Detect scrubbing: if not playing and time changed rapidly
    const isPlaying = opts?.isPlaying === true;
    const now = performance?.now ? performance.now() : Date.now();
    const timeSinceLastUpdate = now - this._lastScrubTime;

    // If not playing and time changed quickly, we're likely scrubbing
    if (!isPlaying && timeSinceLastUpdate < 200) {
      this._isScrubbing = true;
      this._lastScrubTime = now;
    } else if (isPlaying || timeSinceLastUpdate > 500) {
      // Not scrubbing anymore
      this._isScrubbing = false;
    }

    // Playback is frame-based; compute visibility/sequence by frame index
    const fps = Math.max(1, Math.min(60, parseInt(this._getFps?.() || 30) || 30));
    const frameIndex = opts?.frameIndex ?? Math.floor((Number(t) || 0) * fps);
    const effectiveOpts = { ...opts, frameIndex };

    for (const obj of this.objects) {
      const startFrame = Math.floor((Number(obj.startSeconds) || 0) * fps);
      const endFrame = Math.floor((Number(obj.endSeconds) || 0) * fps);
      const inRange = frameIndex >= startFrame && frameIndex < endFrame;

      if (obj.isSequence && obj.files) {
        this._updateSequenceFrame(obj, inRange, effectiveOpts);
      } else if (obj.isMultiFile && obj.files) {
        this._updateMultiFileVisibility(obj, inRange, effectiveOpts);
      } else if (obj.entity) {
        obj.entity.enabled = inRange && obj.visible;
      }
    }
  }
  
  /**
   * Load final frame after scrubbing ends (debounced).
   */
  commitScrub() {
    // Clear any pending throttle
    if (this._scrubThrottleTimer) {
      clearTimeout(this._scrubThrottleTimer);
      this._scrubThrottleTimer = null;
    }
    
    // Mark as not scrubbing
    this._isScrubbing = false;
    
    // Force immediate update for final frame
    const t = this._getCurrentTime?.() || 0;
    this.updateVisibilityByTime(t, { isPlaying: false });
  }

  _updateSequenceFrame(obj, inRange, opts = null) {
    if (!obj.files || obj.files.length === 0) return;
    const fileCount = obj.files.length;

    if (!inRange || !obj.visible) {
      if (obj.entity) {
        obj.entity.enabled = false;
      }
      if (obj._activeFrameIndex !== -1 || obj.entity) {
        const p = this.onSequenceFrameChange?.(obj, -1);
        if (this._collectSequencePromises && p != null && typeof p.then === 'function') {
          this._sequencePromises.push(p);
        }
      }
      obj._activeFrameIndex = -1;
      obj._sequenceTickState = null;
      return;
    }

    const fps = Math.max(1, Math.min(60, parseInt(this._getFps?.() || 30) || 30));
    const startFrame = Math.floor((Number(obj.startSeconds) || 0) * fps);
    const endFrame = Math.floor((Number(obj.endSeconds) || 0) * fps);
    const framesInBlock = Math.max(1, endFrame - startFrame);

    const frameIndex = opts?.frameIndex ?? 0;
    let localFrame = frameIndex - startFrame;
    if (localFrame < 0) localFrame = 0;
    if (localFrame >= framesInBlock) localFrame = framesInBlock - 1;

    const mode = obj.sequencePlaybackMode || "uniform";
    let activeIndex = 0;

    if (mode === "repeat") {
      // Repeat: wrap from first file
      activeIndex = localFrame % fileCount;
    } else if (mode === "reverseRepeat") {
      // Reverse repeat: ping-pong
      if (fileCount <= 1) {
        activeIndex = 0;
      } else {
        const period = 2 * (fileCount - 1);
        const idx = localFrame % period;
        activeIndex = idx < fileCount ? idx : period - idx;
      }
    } else {
      // Uniform: divide block evenly by file count
      const base = Math.floor(framesInBlock / fileCount);
      const rem = framesInBlock % fileCount;
      let err = 0;
      let acc = 0;
      for (let i = 0; i < fileCount; i++) {
        err += rem;
        const extra = err >= fileCount ? 1 : 0;
        if (extra) err -= fileCount;
        const take = base + extra;
        const nextAcc = acc + take;
        if (localFrame < nextAcc) {
          activeIndex = i;
          break;
        }
        acc = nextAcc;
        activeIndex = i;
      }
    }
    if (activeIndex < 0) activeIndex = 0;
    if (activeIndex >= fileCount) activeIndex = fileCount - 1;

    if (obj.entity) {
      obj.entity.enabled = true;
    }

    if (opts?.isPlaying) {
      const st = obj._sequenceTickState || { last: -999, acc: 0 };
      obj._sequenceTickState = st;

      if (st.last === activeIndex && obj.entity) {
        return;
      }
      st.last = activeIndex;
    }

    // Call setFrame when no entity or activeIndex changed
    if (obj._activeFrameIndex !== activeIndex || !obj.entity) {
      obj._activeFrameIndex = activeIndex;
      const p = this.onSequenceFrameChange?.(obj, activeIndex);
      if (this._collectSequencePromises && p != null && typeof p.then === 'function') {
        this._sequencePromises.push(p);
      }
    }
  }

  /**
   * Update multi-file visibility (per frame).
   * @param {import('./types').TimelineObject} obj
   * @param {boolean} inRange - within time block
   * @param {{ frameIndex?: number }} opts
   * @private
   */
  _updateMultiFileVisibility(obj, inRange, opts = null) {
    if (!obj.files || obj.files.length === 0) return;

    const fileCount = obj.files.length;

    if (!inRange || !obj.visible) {
      obj.files.forEach(f => {
        if (f.entity) f.entity.enabled = false;
      });
      return;
    }

    const fps = Math.max(1, Math.min(60, parseInt(this._getFps?.() || 30) || 30));
    const startFrame = Math.floor((Number(obj.startSeconds) || 0) * fps);
    const endFrame = Math.floor((Number(obj.endSeconds) || 0) * fps);
    const framesInBlock = Math.max(1, endFrame - startFrame);
    const frameIndex = opts?.frameIndex ?? 0;
    let localFrame = frameIndex - startFrame;
    if (localFrame < 0) localFrame = 0;
    if (localFrame >= framesInBlock) localFrame = framesInBlock - 1;

    let activeIndex = Math.floor((localFrame * fileCount) / framesInBlock);
    if (activeIndex < 0) activeIndex = 0;
    if (activeIndex >= fileCount) activeIndex = fileCount - 1;

    obj.files.forEach((f, idx) => {
      if (f.entity) {
        f.entity.enabled = (idx === activeIndex);
      }
    });
  }

  /**
   * Update single object visibility (during drag/resize).
   * @param {import('./types').TimelineObject} obj
   * @private
   */
  _updateSingleObjectVisibility(obj) {
    if (!this._getCurrentTime) return;

    const t = this._getCurrentTime();
    const fps = Math.max(1, Math.min(60, parseInt(this._getFps?.() || 30) || 30));
    const frameIndex = Math.floor((Number(t) || 0) * fps);
    const startFrame = Math.floor((Number(obj.startSeconds) || 0) * fps);
    const endFrame = Math.floor((Number(obj.endSeconds) || 0) * fps);
    const inRange = frameIndex >= startFrame && frameIndex < endFrame;
    const effectiveOpts = { frameIndex };

    if (obj.isMultiFile && obj.files) {
      if (obj.isSequence) {
        this._updateSequenceFrame(obj, inRange, effectiveOpts);
      } else {
        this._updateMultiFileVisibility(obj, inRange, effectiveOpts);
      }
    } else if (obj.entity) {
      obj.entity.enabled = inRange && obj.visible;
    }
  }

  /**
   * Render object blocks.
   */
  render() {
    if (!this._objectsListEl || !this._rightListEl) return;
    
    this._objectsListEl.innerHTML = "";

    this._rightListEl.innerHTML = "";
    
    if (this.objects.length === 0) return;
    
    const BLOCK_HEIGHT = 32;
    const BLOCK_GAP = 4;
    const maxSeconds = this._getMaxSeconds();
    let visualIndex = 0;

    this.objects.forEach((obj) => {
      // PLY loaded with GLB: no block/div on timeline
      if (obj.loadedWithGlb) return;

      const btn = this._createObjectButton(obj);
      this._objectsListEl.appendChild(btn);

      const block = this._createTimeBlock(obj, visualIndex, BLOCK_HEIGHT, BLOCK_GAP, maxSeconds);
      this._rightListEl.appendChild(block);
      visualIndex += 1;
    });

    const visibleRowCount = visualIndex;
    if (visibleRowCount > 0) {
      const totalHeight = 10 + visibleRowCount * (BLOCK_HEIGHT + BLOCK_GAP);
      this._rightListEl.style.minHeight = `${totalHeight}px`;
    }
  }

  /**
   * Create object button.
   * @private
   */
  _createObjectButton(obj) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "timeline__obj-btn";
    btn.dataset.objectId = obj.id;
    
    if (this.selectedObjectId === obj.id) {
      btn.classList.add("is-selected");
    }
    
    // Multi-file: purple style
    if (obj.isMultiFile) {
      btn.classList.add("is-multi-file");
    }
    // GLB or PLY with GLB: green style
    // Name
    const nameEl = document.createElement("span");
    nameEl.className = "timeline__obj-btn-name";
    nameEl.textContent = obj.name;
    
    // Button group (eye + delete)
    const actionsEl = document.createElement("div");
    actionsEl.className = "timeline__obj-btn-actions";
    
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
    
    // Delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "timeline__obj-btn-delete";
    deleteBtn.title = "삭제";
    
    const deleteIcon = document.createElement("span");
    deleteIcon.className = "timeline__obj-btn-delete-icon";
    deleteIcon.setAttribute("aria-hidden", "true");
    deleteBtn.appendChild(deleteIcon);
    
    actionsEl.appendChild(visBtn);
    actionsEl.appendChild(deleteBtn);
    
    btn.appendChild(nameEl);
    btn.appendChild(actionsEl);
    
    // Timer to distinguish click vs double-click
    let clickTimer = null;
    const DOUBLE_CLICK_DELAY = 250;
    
    // Button click = select (vs double-click)
    btn.addEventListener("click", (e) => {
      if (e.target === visBtn || visBtn.contains(e.target)) return;
      if (e.target === deleteBtn || deleteBtn.contains(e.target)) return;
      
      // If waiting for double-click, cancel timer
      if (clickTimer) {
        clearTimeout(clickTimer);
        clickTimer = null;
        return;
      }
      
      // Wait for single click
      clickTimer = setTimeout(() => {
        clickTimer = null;
        // Toggle select/deselect
        if (this.selectedObjectId === obj.id) {
          this.clearSelection();
        } else {
          this.select(obj.id);
        }
      }, DOUBLE_CLICK_DELAY);
    });
    
    // Double-click = name edit mode
    btn.addEventListener("dblclick", (e) => {
      if (e.target === visBtn || visBtn.contains(e.target)) return;
      if (e.target === deleteBtn || deleteBtn.contains(e.target)) return;
      
      // Cancel single-click timer
      if (clickTimer) {
        clearTimeout(clickTimer);
        clickTimer = null;
      }
      
      e.preventDefault();
      e.stopPropagation();
      
      // Select first then edit name
      if (this.selectedObjectId !== obj.id) {
        this.select(obj.id);
      }
      this._startNameEdit(obj.id, nameEl);
    });
    
    // Eye click = visibility toggle
    visBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const newVisible = this.toggleVisibility(obj.id);
      visBtn.classList.toggle("is-off", !newVisible);
      visBtn.setAttribute("aria-pressed", newVisible ? "true" : "false");
    });
    
    // Delete button 클릭 = 삭제 확인 모달
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (this.onDeleteRequest) {
        this.onDeleteRequest(obj.id, obj.name);
      }
    });
    
    return btn;
  }
  
  /**
   * Start name edit mode.
   * @private
   */
  _startNameEdit(objectId, nameEl) {
    if (this._editingNameId) return;  // already editing
    
    const obj = this.objects.find(o => o.id === objectId);
    if (!obj) return;
    
    this._editingNameId = objectId;
    
    // Replace span with input
    const input = document.createElement("input");
    input.type = "text";
    input.className = "timeline__obj-btn-name-input";
    input.value = obj.name;
    
    const originalName = obj.name;
    nameEl.style.display = "none";
    nameEl.parentElement.insertBefore(input, nameEl);
    
    input.focus();
    input.select();
    
    const finishEdit = (save) => {
      if (this._editingNameId !== objectId) return;
      
      const newName = input.value.trim();
      
      if (save && newName && newName !== originalName) {
        obj.name = newName;
        nameEl.textContent = newName;
        this.onObjectsChange?.();
      }
      
      input.remove();
      nameEl.style.display = "";
      this._editingNameId = null;
    };
    
    input.addEventListener("blur", () => finishEdit(true));
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        finishEdit(true);
      } else if (e.key === "Escape") {
        e.preventDefault();
        finishEdit(false);
      }
    });
  }
  
  /**
   * Start editing selected object name (external).
   */
  startEditingSelectedName() {
    if (!this.selectedObjectId) return;
    
    const btn = this._objectsListEl?.querySelector(
      `.timeline__obj-btn[data-object-id="${this.selectedObjectId}"]`
    );
    if (!btn) return;
    
    const nameEl = btn.querySelector(".timeline__obj-btn-name");
    if (nameEl) {
      this._startNameEdit(this.selectedObjectId, nameEl);
    }
  }
  
  // ========================================================================
  // Multi-file context menu
  // ========================================================================
  
  /** @type {string|null} - context menu target object ID */
  _contextMenuTargetId = null;
  
  /**
   * Show multi-file context menu.
   * @private
   */
  _showMultiFileContextMenu(x, y, objectId) {
    const menu = document.getElementById("multiFileContextMenu");
    if (!menu) return;
    
    this._contextMenuTargetId = objectId;
    const obj = this.objects.find(o => o.id === objectId);

    const groupEl = document.getElementById("sequencePlaybackMenuGroup");
    const separatorEl = document.getElementById("multiFileMenuSeparator");
    if (groupEl && separatorEl) {
      if (obj?.isSequence) {
        groupEl.hidden = false;
        separatorEl.hidden = false;
        groupEl.querySelectorAll(".context-menu__item[data-action='sequence-playback']").forEach((item) => {
          item.classList.toggle("is-checked", (obj.sequencePlaybackMode || "uniform") === item.dataset.mode);
        });
      } else {
        groupEl.hidden = true;
        separatorEl.hidden = true;
      }
    }
    
    // Clamp position to screen
    const menuWidth = 150;
    const menuHeight = obj?.isSequence ? 180 : 50;
    const maxX = window.innerWidth - menuWidth - 10;
    const maxY = window.innerHeight - menuHeight - 10;
    
    menu.style.left = `${Math.min(x, maxX)}px`;
    menu.style.top = `${Math.min(y, maxY)}px`;
    menu.classList.add("is-visible");
    menu.setAttribute("aria-hidden", "false");
    
    // Menu item click (register once)
    if (!menu._hasClickHandler) {
      menu._hasClickHandler = true;
      menu.addEventListener("click", (e) => {
        const item = e.target.closest(".context-menu__item");
        if (!item) return;
        
        const action = item.dataset.action;
        if (action === "sequence-playback" && this._contextMenuTargetId && item.dataset.mode) {
          const target = this.objects.find(o => o.id === this._contextMenuTargetId);
          if (target?.isSequence) {
            target.sequencePlaybackMode = item.dataset.mode;
            const block = this._rightListEl?.querySelector('[data-object-id="' + target.id + '"]');
            if (block && target.files?.length > 1) {
              const maxSeconds = this._getMaxSeconds?.() ?? 1;
              this._updateBlockSequenceDivisions(block, target, maxSeconds);
            }
            const t = this._getCurrentTime?.() ?? 0;
            const fps = Math.max(1, parseInt(this._getFps?.() || 30) || 30);
            this.updateVisibilityByTime(t, { frameIndex: Math.floor(t * fps), isPlaying: false });
            this.onObjectsChange?.(this.objects);
          }
        } else if (action === "reverse" && this._contextMenuTargetId) {
          this.reverseMultiFileOrder(this._contextMenuTargetId);
        }
        
        this._hideMultiFileContextMenu();
      });
    }
    
    // Close menu on outside click (once)
    if (!this._contextMenuCloseHandler) {
      this._contextMenuCloseHandler = (e) => {
        if (!menu.contains(e.target)) {
          this._hideMultiFileContextMenu();
        }
      };
      document.addEventListener("click", this._contextMenuCloseHandler);
    }
  }
  
  /**
   * Hide multi-file context menu.
   * @private
   */
  _hideMultiFileContextMenu() {
    const menu = document.getElementById("multiFileContextMenu");
    if (!menu) return;
    
    menu.classList.remove("is-visible");
    menu.setAttribute("aria-hidden", "true");
    this._contextMenuTargetId = null;
  }
  
  /**
   * Reverse multi-file order (reverse play).
   * @param {string} objectId
   */
  reverseMultiFileOrder(objectId) {
    const obj = this.objects.find(o => o.id === objectId);
    if (!obj || !obj.isMultiFile || !obj.files) return;
    
    // Reverse files array
    obj.files.reverse();
    
    // Notify change
    this.onObjectsChange?.();
    
    // Update visibility by current time
    const currentTime = this._getCurrentTime();
    this.updateVisibilityByTime(currentTime);
  }

  /**
   * Create time block.
   * @private
   */
  _createTimeBlock(obj, index, blockHeight, blockGap, maxSeconds) {
    const block = document.createElement("div");
    block.className = "timeline__obj-block";
    block.dataset.objectId = obj.id;
    
    if (this.selectedObjectId === obj.id) {
      block.classList.add("is-selected");
    }
    if (!obj.visible) {
      block.classList.add("is-hidden");
    }
    
    // Multi-file: purple style
    if (obj.isMultiFile) {
      block.classList.add("is-multi-file");
    }
    // GLB or PLY with GLB: green style
    // Position/size
    const startPercent = (obj.startSeconds / maxSeconds) * 100;
    const endPercent = (obj.endSeconds / maxSeconds) * 100;
    const widthPercent = endPercent - startPercent;
    // Align start with left list (padding 10px)
    const topOffset = 4 + index * (blockHeight + blockGap);
    
    block.style.left = `${startPercent}%`;
    block.style.width = `${widthPercent}%`;
    block.style.top = `${topOffset}px`;

    if (obj.isSequence && Array.isArray(obj.files) && obj.files.length > 1) {
      this._updateBlockSequenceDivisions(block, obj, maxSeconds);
    }
    
    // Resize handle
    const leftHandle = document.createElement("div");
    leftHandle.className = "timeline__obj-block__resize-handle timeline__obj-block__resize-handle--left";
    
    const rightHandle = document.createElement("div");
    rightHandle.className = "timeline__obj-block__resize-handle timeline__obj-block__resize-handle--right";
    
    block.appendChild(leftHandle);
    block.appendChild(rightHandle);
    
    // 드래그/리사이즈 설정
    this._setupBlockInteractions(block, obj, leftHandle, rightHandle, maxSeconds);
    
    // Block click = toggle select
    block.addEventListener("click", () => {
      if (this.selectedObjectId === obj.id) {
        this.clearSelection();
      } else {
        this.select(obj.id);
      }
    });
    
    // Multi-file: right-click shows context menu
    if (obj.isMultiFile) {
      block.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        this._showMultiFileContextMenu(e.clientX, e.clientY, obj.id);
      });
    }
    
    return block;
  }

  /**
   * Update block position/size.
   * @private
   */
  _updateBlockStyle(block, startSeconds, endSeconds, maxSeconds) {
    const startPercent = (startSeconds / maxSeconds) * 100;
    const widthPercent = ((endSeconds - startSeconds) / maxSeconds) * 100;
    
    block.style.left = `${startPercent}%`;
    block.style.width = `${widthPercent}%`;
  }

  /**
   * Update sequence block divisions by startSeconds/endSeconds/sequencePlaybackMode (resize/drag/mode).
   * @private
   */
  _updateBlockSequenceDivisions(block, obj, maxSeconds) {
    if (!obj.isSequence || !Array.isArray(obj.files) || obj.files.length <= 1) {
      const existing = block.querySelector('.timeline__obj-block__sequence-divisions');
      if (existing) existing.remove();
      return;
    }

    let overlay = block.querySelector('.timeline__obj-block__sequence-divisions');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'timeline__obj-block__sequence-divisions';
      overlay.setAttribute('aria-hidden', 'true');
      block.insertBefore(overlay, block.firstChild);
    }

    overlay.innerHTML = '';

    const fps = Math.max(1, Math.min(60, parseInt(this._getFps?.() || 30) || 30));
    const n = obj.files.length;
    const mode = obj.sequencePlaybackMode || 'uniform';
    const startFrame = Math.floor((Number(obj.startSeconds) || 0) * fps);
    const endFrame = Math.floor((Number(obj.endSeconds) || 0) * fps);
    const framesInBlock = Math.max(1, endFrame - startFrame);

    if (mode === 'repeat' || mode === 'reverseRepeat') {
      for (let i = 1; i < framesInBlock; i++) {
        const line = document.createElement('div');
        line.className = 'timeline__obj-block__sequence-division-line';
        line.style.left = `${(i / framesInBlock) * 100}%`;
        overlay.appendChild(line);
      }
    } else {
      const base = Math.floor(framesInBlock / n);
      const rem = framesInBlock % n;
      let err = 0;
      let acc = 0;
      for (let i = 0; i < n - 1; i++) {
        err += rem;
        const extra = err >= n ? 1 : 0;
        if (extra) err -= n;
        acc += base + extra;
        const line = document.createElement('div');
        line.className = 'timeline__obj-block__sequence-division-line';
        line.style.left = `${(acc / framesInBlock) * 100}%`;
        overlay.appendChild(line);
      }
    }
  }

  /**
   * Setup block drag/resize.
   * @private
   */
  _setupBlockInteractions(block, obj, leftHandle, rightHandle, maxSeconds) {
    let isDragging = false;
    let isResizing = false;
    let resizeSide = null;
    let startX = 0;
    let startStartFrame = 0;
    let startEndFrame = 0;
    
    /** 단일 파일 오브젝트 최소 길이 (프레임 수). fps와 무관하게 동일한 “길이” 유지 */
    const MIN_DURATION_FRAMES = 1;

    /** Min length: sequence = file count, single = MIN_DURATION_FRAMES */
    const getMinDurationFramesForObject = () => {
      if (obj?.isSequence && Array.isArray(obj.files) && obj.files.length > 0) {
        return Math.max(1, obj.files.length);
      }
      return Math.max(1, MIN_DURATION_FRAMES);
    };

    const fps = Math.max(1, Math.min(60, parseInt(this._getFps?.() || 30) || 30));
    const totalFrames = Math.max(1, Math.round(maxSeconds * fps));

    /** Frame index → seconds (for obj + UI) */
    const frameToSeconds = (frame) => Math.max(0, Math.min(maxSeconds, frame / fps));

    /** Seconds → frame index (0-based) */
    const secondsToFrame = (seconds) => {
      let frame = Math.floor((Number(seconds) || 0) * fps);
      if (frame < 0) frame = 0;
      if (frame >= totalFrames) frame = totalFrames - 1;
      return frame;
    };

    const getTrackWidth = () => this._rightListEl?.clientWidth || 100;
    
    // Left handle hover tooltip (frame)
    leftHandle.addEventListener("mouseenter", () => {
      const rect = leftHandle.getBoundingClientRect();
      this._showTooltip(secondsToFrame(obj.startSeconds), rect.left + rect.width / 2, rect.top);
    });
    
    leftHandle.addEventListener("mouseleave", () => {
      if (!isResizing) {
        this._hideTooltip();
      }
    });
    
    // Right handle hover tooltip (frame)
    rightHandle.addEventListener("mouseenter", () => {
      const rect = rightHandle.getBoundingClientRect();
      this._showTooltip(secondsToFrame(obj.endSeconds), rect.left + rect.width / 2, rect.top);
    });
    
    rightHandle.addEventListener("mouseleave", () => {
      if (!isResizing) {
        this._hideTooltip();
      }
    });
    
    // Drag start
    const onBlockMouseDown = (e) => {
      if (e.target === leftHandle || e.target === rightHandle) return;

      isDragging = true;
      startX = e.clientX;
      startStartFrame = secondsToFrame(obj.startSeconds);
      startEndFrame = Math.min(totalFrames, Math.max(startStartFrame + 1, Math.floor((Number(obj.endSeconds) || 0) * fps)));
      e.preventDefault();
    };

    const onResizeMouseDown = (side) => {
      return (e) => {
        isResizing = true;
        resizeSide = side;
        startX = e.clientX;
        startStartFrame = secondsToFrame(obj.startSeconds);
        startEndFrame = Math.min(totalFrames, Math.max(startStartFrame + 1, Math.floor((Number(obj.endSeconds) || 0) * fps)));
        e.stopPropagation();
        e.preventDefault();
      };
    };

    const onMouseMove = (e) => {
      if (!isDragging && !isResizing) return;
      const trackWidth = getTrackWidth();
      const dx = e.clientX - startX;
      const dtFrames = Math.round((dx / trackWidth) * totalFrames);
      const minDurationFrames = getMinDurationFramesForObject();

      if (isDragging) {
        let durationFrames = startEndFrame - startStartFrame;
        durationFrames = Math.max(minDurationFrames, durationFrames);

        let newStartFrame = startStartFrame + dtFrames;
        newStartFrame = Math.max(0, Math.min(totalFrames - durationFrames, newStartFrame));
        let newEndFrame = newStartFrame + durationFrames;
        if (newEndFrame > totalFrames) {
          newEndFrame = totalFrames;
          newStartFrame = Math.max(0, newEndFrame - durationFrames);
        }

        obj.startSeconds = frameToSeconds(newStartFrame);
        obj.endSeconds = frameToSeconds(newEndFrame);

        this._updateBlockStyle(block, obj.startSeconds, obj.endSeconds, maxSeconds);
        if (obj.isSequence && obj.files?.length > 1) {
          this._updateBlockSequenceDivisions(block, obj, maxSeconds);
        }
        this._updateSingleObjectVisibility(obj);
        this.onObjectsChange?.(this.objects);
        return;
      }

      if (isResizing) {
        if (resizeSide === 'left') {
          let newStartFrame = startStartFrame + dtFrames;
          newStartFrame = Math.max(0, Math.min(startEndFrame - minDurationFrames, newStartFrame));
          const newEndFrame = startEndFrame;

          obj.startSeconds = frameToSeconds(newStartFrame);
          obj.endSeconds = frameToSeconds(newEndFrame);
          this._updateBlockStyle(block, obj.startSeconds, obj.endSeconds, maxSeconds);

          const rect = leftHandle.getBoundingClientRect();
          this._showTooltip(secondsToFrame(obj.startSeconds), rect.left + rect.width / 2, rect.top);
        } else if (resizeSide === 'right') {
          let newEndFrame = startEndFrame + dtFrames;
          newEndFrame = Math.min(totalFrames, Math.max(startStartFrame + minDurationFrames, newEndFrame));
          const newStartFrame = startStartFrame;

          obj.startSeconds = frameToSeconds(newStartFrame);
          obj.endSeconds = frameToSeconds(newEndFrame);
          this._updateBlockStyle(block, obj.startSeconds, obj.endSeconds, maxSeconds);

          const rect = rightHandle.getBoundingClientRect();
          this._showTooltip(secondsToFrame(obj.endSeconds), rect.left + rect.width / 2, rect.top);
        }

        if (obj.isSequence && obj.files?.length > 1) {
          this._updateBlockSequenceDivisions(block, obj, maxSeconds);
        }
        this._updateSingleObjectVisibility(obj);
      }
    };

    // Mouse up
    const onMouseUp = () => {
      if (isDragging || isResizing) {
        isDragging = false;
        isResizing = false;
        resizeSide = null;
        this._hideTooltip();
      }
    };

    block.addEventListener('mousedown', onBlockMouseDown);
    leftHandle.addEventListener('mousedown', onResizeMouseDown('left'));
    rightHandle.addEventListener('mousedown', onResizeMouseDown('right'));
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }
}

export default ObjectsManager;
