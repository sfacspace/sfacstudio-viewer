/**
 * Timeline object list (left panel). Visibility: eye toggle; multi-file cycles by global frame index.
 */

import { t } from '../i18n.js';
import {
  supportsHierarchy,
  validateParentAssignment,
  getHierarchyDepth,
} from "./objectHierarchy.js";

const DND_MIME = 'application/x-sfacstudio-object-id';

export class ObjectsManager {
  /**
   * @param {Object} options
   * @param {HTMLElement} options.objectsListEl - object list
   * @param {Function} options.getMaxSeconds - max time getter
   * @param {Function} options.getCurrentTime - current time getter
   * @param {Function} options.showTooltip - show tooltip
   * @param {Function} options.hideTooltip - hide tooltip
   */
  constructor(options) {
    this._objectsListEl = options.objectsListEl;
    this._getMaxSeconds = options.getMaxSeconds;
    this._getCurrentTime = options.getCurrentTime;
    this._getFps = options.getFps || (() => 30);
    this._getTotalFrames = options.getTotalFrames || null;
    this._showTooltip = options.showTooltip;
    this._hideTooltip = options.hideTooltip;
    /** @type {(() => void) | null} */
    this._syncEntityOrder = options.syncEntityOrder || null;

    /** @type {import('./types').TimelineObject[]} */
    this.objects = [];

    this._draggingObjectId = null;
    this._onGlobalDragEnd = this._onGlobalDragEnd.bind(this);
    document.addEventListener('dragend', this._onGlobalDragEnd);
    this._attachObjectListDnDDelegation();
    this._attachMarqueeSelect();

    /** @type {string|null} primary selection (gizmo / inspector / viewer) */
    this.selectedObjectId = null;
    /** @type {Set<string>} hierarchy multi-select */
    this._selectedIds = new Set();
    /** @type {string|null} anchor for Shift+click range */
    this._rangeAnchorId = null;
    
    /** @type {string|null} - object ID being name-edited */
    this._editingNameId = null;

    /** 접힌 부모 id — 자식 행은 렌더에서 숨김 */
    this._collapsedParentIds = new Set();
    
    // Callbacks
    /** @type {Function|null} */
    this.onObjectsChange = null;
    /** @type {Function|null} */
    this.onObjectSelect = null;
    /** @type {((ids: string[], names: string[]) => void) | null} */
    this.onDeleteRequest = null;
    /** @type {((ids: string[]) => void) | null} */
    this.onDuplicateRequest = null;
    /** @type {((childId: string) => void) | null} */
    this.onHierarchyChange = null;
  }

  /**
   * Add single-file object.
   * @param {string} name
   * @param {Object} entity
   * @param {string|null} splatId
   * @param {Object} [options] - sourcePath: 경로로 로드 시 저장할 경로 (프로젝트 저장/불러오기용)
   * @returns {import('./types').TimelineObject}
   */
  add(name, entity, splatId = null, options = {}) {
    const obj = {
      id: `obj_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      name,
      visible: true,
      entity,
      splatId,
      glbId: null,
      objectType: options?.objectType ?? 'ply',
      loadedWithGlb: false,
      pairedGlbObjectId: null,
      isMultiFile: false,
      files: null,
      /** @type {string|null} 부모 타임라인 오브젝트 id (단일 PLY만) */
      parentId: null,
      /** @type {string|null} 경로로 로드 시 사용한 경로 (프로젝트 저장용) */
      sourcePath: options?.sourcePath ?? null,
      /** @type {string|null} 복제된 오브젝트의 원본 PLY 경로 (프로젝트 저장/로드용) */
      duplicatedFromSourcePath: options?.duplicatedFromSourcePath ?? null,
    };

    this.objects.push(obj);
    this.render();
    this.onObjectsChange?.(this.objects);
    try {
      this._syncEntityOrder?.();
    } catch (e) {
      /* ignore */
    }

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
      visible: true,
      entity: null, // multi-file uses files, not entity
      splatId: null,
      isMultiFile: true,
      files: files,
      parentId: null,
    };
    
    this.objects.push(obj);
    this.render();
    this.onObjectsChange?.(this.objects);
    try {
      this._syncEntityOrder?.();
    } catch (e) {
      /* ignore */
    }
    
    return obj;
  }

  /**
   * Remove object.
   * @param {string} id
   */
  remove(id) {
    const idx = this.objects.findIndex(o => o.id === id);
    if (idx === -1) return;

    const wasInSelection = this._selectedIds.has(id);

    for (const o of this.objects) {
      if (o.parentId === id) o.parentId = null;
    }

    this.objects.splice(idx, 1);

    this._selectedIds.delete(id);
    if (this._selectedIds.size === 0) {
      this.selectedObjectId = null;
    } else if (this.selectedObjectId === id) {
      this.selectedObjectId = this._firstIdInVisibleSelection();
    }

    this.render();
    this.onObjectsChange?.(this.objects);
    try {
      this._syncEntityOrder?.();
    } catch (e) {
      /* ignore */
    }

    if (wasInSelection) {
      if (this._selectedIds.size === 0) {
        this._rangeAnchorId = null;
        this.onObjectSelect?.(null);
      } else {
        this.onObjectSelect?.(this.getSelected());
      }
    }
  }

  /**
   * 리스트에서 child를 parent 바로 아래로 옮김 (시각적 그룹).
   * @private
   * @param {string} childId
   * @param {string} parentId
   */
  _moveObjectNextToParentInArray(childId, parentId) {
    const objs = this.objects;
    const cIdx = objs.findIndex((o) => o.id === childId);
    const pIdx = objs.findIndex((o) => o.id === parentId);
    if (cIdx === -1 || pIdx === -1) return;
    const [item] = objs.splice(cIdx, 1);
    const insertAfter = objs.findIndex((o) => o.id === parentId);
    if (insertAfter === -1) {
      objs.splice(Math.min(cIdx, objs.length), 0, item);
      return;
    }
    objs.splice(insertAfter + 1, 0, item);
  }

  /**
   * 부모 설정 (단일 PLY만). null 이면 루트.
   * @param {string} childId
   * @param {string|null} parentId
   * @param {{ nestAfterParent?: boolean }} [opts]
   * @returns {boolean}
   */
  setObjectParent(childId, parentId, opts = {}) {
    const err = validateParentAssignment(this.objects, childId, parentId);
    if (err) return false;
    const child = this.objects.find((o) => o.id === childId);
    if (!child) return false;
    child.parentId = parentId || null;
    if (parentId && opts.nestAfterParent) {
      this._moveObjectNextToParentInArray(childId, parentId);
    }
    this.render();
    this.onObjectsChange?.(this.objects);
    try {
      this._syncEntityOrder?.();
    } catch (e) {
      /* ignore */
    }
    this.onHierarchyChange?.(childId);
    return true;
  }

  /**
   * 우클릭 대상을 현재 선택 오브젝트의 자식으로 연결.
   * @param {string} targetObjectId
   * @returns {boolean}
   */
  attachSelectionAsParentOf(targetObjectId) {
    const sel = this.selectedObjectId;
    if (!sel || sel === targetObjectId) return false;
    return this.setObjectParent(targetObjectId, sel);
  }

  /**
   * @param {string} objectId
   * @returns {boolean}
   */
  clearObjectParent(objectId) {
    return this.setObjectParent(objectId, null);
  }

  /** Remove all objects. */
  clear() {
    this.objects = [];
    this._selectedIds.clear();
    this.selectedObjectId = null;
    this._rangeAnchorId = null;
    this.render();
    this.onObjectsChange?.(this.objects);
    try {
      this._syncEntityOrder?.();
    } catch (e) {
      /* ignore */
    }
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
        obj.files.forEach(f => {
          if (f.entity) f.entity.enabled = false;
        });
      } else {
        this._refreshObjectVisibility(obj);
      }
    } else if (obj.entity) {
      obj.entity.enabled = obj.visible;
    }
    
    this.render();
    return obj.visible;
  }

  /**
   * Select object (single; clears multi-select).
   * @param {string} id
   */
  select(id) {
    this._selectSingle(id);
  }

  /** Clear selection. */
  clearSelection() {
    this._selectedIds.clear();
    this.selectedObjectId = null;
    this._rangeAnchorId = null;
    this.render();
    this.onObjectSelect?.(null);
  }

  /** @returns {string[]} visible list order ids that are selected */
  getSelectedIds() {
    return this._getVisibleObjectIdsInOrder().filter((oid) => this._selectedIds.has(oid));
  }

  /**
   * 다중 선택 상태로 전환 (복제 후 등).
   * @param {string[]} ids
   * @param {string|null} [primaryId]
   */
  selectMultiple(ids, primaryId) {
    const set = new Set((ids || []).filter(Boolean));
    this._selectedIds.clear();
    set.forEach((id) => this._selectedIds.add(id));
    let prim =
      primaryId && set.has(primaryId)
        ? primaryId
        : this._lastIdInVisibleSet(set);
    if (!prim && set.size) prim = [...set][0];
    this.selectedObjectId = prim || null;
    this._rangeAnchorId = this.selectedObjectId;
    if (this._selectedIds.size === 0) {
      this.clearSelection();
      return;
    }
    this.render();
    this.onObjectSelect?.(this.getSelected());
  }

  /**
   * 우클릭한 행이 현재 선택에 포함되면 전체 선택, 아니면 해당 행만.
   * @private
   * @param {string|null} clickedRowObjectId
   * @returns {{ ids: string[], names: string[] }}
   */
  _idsAndNamesForBulkRowAction(clickedRowObjectId) {
    const selectedOrdered = this.getSelectedIds();
    if (
      clickedRowObjectId &&
      this._selectedIds.has(clickedRowObjectId) &&
      selectedOrdered.length > 0
    ) {
      const names = selectedOrdered.map(
        (id) => this.objects.find((o) => o.id === id)?.name ?? id
      );
      return { ids: selectedOrdered, names };
    }
    if (clickedRowObjectId) {
      const obj = this.objects.find((o) => o.id === clickedRowObjectId);
      if (obj) {
        return {
          ids: [clickedRowObjectId],
          names: [obj.name ?? clickedRowObjectId],
        };
      }
    }
    const names = selectedOrdered.map(
      (id) => this.objects.find((o) => o.id === id)?.name ?? id
    );
    return { ids: selectedOrdered, names };
  }

  /** @param {string} id */
  isObjectSelected(id) {
    return this._selectedIds.has(id);
  }

  /**
   * Visible hierarchy row order (matches render).
   * @private
   * @returns {string[]}
   */
  _getVisibleObjectIdsInOrder() {
    const ids = [];
    for (const obj of this.objects) {
      if (obj.loadedWithGlb) continue;
      if (this._isHiddenUnderCollapsedParent(obj)) continue;
      ids.push(obj.id);
    }
    return ids;
  }

  /**
   * @private
   * @returns {string|null}
   */
  _firstIdInVisibleSelection() {
    for (const oid of this._getVisibleObjectIdsInOrder()) {
      if (this._selectedIds.has(oid)) return oid;
    }
    return null;
  }

  /**
   * @private
   * @param {string} id
   */
  _selectSingle(id) {
    this._selectedIds.clear();
    this._selectedIds.add(id);
    this.selectedObjectId = id;
    this._rangeAnchorId = id;
    this.render();
    const obj = this.objects.find((o) => o.id === id);
    this.onObjectSelect?.(obj || null);
  }

  /**
   * @private
   * @param {string} id
   */
  _toggleSelect(id) {
    if (this._selectedIds.has(id)) {
      this._selectedIds.delete(id);
      if (this._selectedIds.size === 0) {
        this.clearSelection();
        return;
      }
      if (this.selectedObjectId === id) {
        this.selectedObjectId = this._firstIdInVisibleSelection();
      }
    } else {
      this._selectedIds.add(id);
      this.selectedObjectId = id;
    }
    this.render();
    this.onObjectSelect?.(this.getSelected());
  }

  /**
   * @private
   * @param {string} anchorId
   * @param {string} endId
   */
  _selectRangeFromTo(anchorId, endId) {
    const order = this._getVisibleObjectIdsInOrder();
    let ia = order.indexOf(anchorId);
    const ib = order.indexOf(endId);
    if (ib === -1) return;
    if (ia === -1) ia = ib;
    const lo = Math.min(ia, ib);
    const hi = Math.max(ia, ib);
    this._selectedIds.clear();
    for (let i = lo; i <= hi; i++) {
      this._selectedIds.add(order[i]);
    }
    this.selectedObjectId = endId;
    this.render();
    this.onObjectSelect?.(this.getSelected());
  }

  /**
   * 계층 리스트 빈 영역에서 드래그해 사각형(마퀴)으로 다중 선택.
   * @private
   */
  _attachMarqueeSelect() {
    const listEl = this._objectsListEl;
    if (!listEl || listEl._marqueeAttached) return;
    listEl._marqueeAttached = true;

    const MARQUEE_MIN = 4;

    const rectsIntersect = (a, b) =>
      !(a.right <= b.left || a.left >= b.right || a.bottom <= b.top || a.top >= b.bottom);

    let active = false;
    let startX = 0;
    let startY = 0;
    /** @type {HTMLElement|null} */
    let marqueeEl = null;

    const removeMarquee = () => {
      if (marqueeEl) {
        marqueeEl.remove();
        marqueeEl = null;
      }
    };

    const syncMarqueeDom = (clientX, clientY) => {
      const left = Math.min(startX, clientX);
      const top = Math.min(startY, clientY);
      const w = Math.abs(clientX - startX);
      const h = Math.abs(clientY - startY);
      if (w < MARQUEE_MIN && h < MARQUEE_MIN) {
        removeMarquee();
        return;
      }
      if (!marqueeEl) {
        marqueeEl = document.createElement("div");
        marqueeEl.className = "timeline__hierarchy-marquee";
        marqueeEl.setAttribute("aria-hidden", "true");
        document.body.appendChild(marqueeEl);
      }
      marqueeEl.style.left = `${left}px`;
      marqueeEl.style.top = `${top}px`;
      marqueeEl.style.width = `${w}px`;
      marqueeEl.style.height = `${h}px`;
    };

    const collectIdsInClientRect = (left, top, w, h) => {
      const sel = { left, top, right: left + w, bottom: top + h };
      const band = new Set();
      listEl.querySelectorAll(".timeline__obj-row").forEach((row) => {
        const id = row.dataset.objectId;
        if (!id) return;
        const r = row.getBoundingClientRect();
        if (rectsIntersect(sel, r)) band.add(id);
      });
      return band;
    };

    const onMouseMove = (e) => {
      if (!active) return;
      e.preventDefault();
      syncMarqueeDom(e.clientX, e.clientY);
    };

    const onMouseUp = (e) => {
      if (!active) return;
      active = false;
      listEl.classList.remove("is-marquee-dragging");
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);

      const x1 = e.clientX;
      const y1 = e.clientY;
      const w = Math.abs(x1 - startX);
      const h = Math.abs(y1 - startY);

      removeMarquee();

      if (w < MARQUEE_MIN && h < MARQUEE_MIN) {
        if (!e.shiftKey) this.clearSelection();
        return;
      }

      const left = Math.min(startX, x1);
      const top = Math.min(startY, y1);
      const band = collectIdsInClientRect(left, top, w, h);
      this._applyRectSelectionBand(band, e.shiftKey);
      const prim = this.selectedObjectId;
      if (prim) this._rangeAnchorId = prim;
    };

    listEl.addEventListener("mousedown", (e) => {
      if (e.button !== 0) return;
      if (e.target.closest(".timeline__obj-row")) return;
      e.preventDefault();
      active = true;
      startX = e.clientX;
      startY = e.clientY;
      listEl.classList.add("is-marquee-dragging");
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    });
  }

  /**
   * 마퀴(또는 동일 규칙)으로 모인 id 집합을 선택 상태에 반영.
   * @private
   * @param {Set<string>} band
   * @param {boolean} shiftUnion
   */
  _applyRectSelectionBand(band, shiftUnion) {
    if (shiftUnion) {
      band.forEach((id) => this._selectedIds.add(id));
      const lip = this._lastIdInVisibleSet(band);
      if (lip) this.selectedObjectId = lip;
    } else {
      this._selectedIds.clear();
      band.forEach((id) => this._selectedIds.add(id));
      this.selectedObjectId =
        this._lastIdInVisibleSet(band) || (band.size ? [...band][0] : null);
    }

    if (this._selectedIds.size === 0) {
      this.clearSelection();
      return;
    }
    this.render();
    this.onObjectSelect?.(this.getSelected());
  }

  /**
   * @private
   * @param {Set<string>} idSet
   * @returns {string|null}
   */
  _lastIdInVisibleSet(idSet) {
    const order = this._getVisibleObjectIdsInOrder();
    for (let i = order.length - 1; i >= 0; i--) {
      if (idSet.has(order[i])) return order[i];
    }
    return null;
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
   * Apply visibility: single-file uses `visible` only; multi-file picks one splat by global frame.
   * @param {number} t - time (seconds)
   * @param {{ isPlaying?: boolean, frameIndex?: number }|null} [opts]
   */
  updateVisibilityByTime(t, opts = null) {
    const fps = Math.max(1, Math.min(60, parseInt(this._getFps?.() || 30) || 30));
    const frameIndex = opts?.frameIndex ?? Math.floor((Number(t) || 0) * fps);
    const totalFrames = Math.max(1, parseInt(this._getTotalFrames?.() || 90) || 90);
    const effectiveOpts = { ...opts, frameIndex };

    for (const obj of this.objects) {
      if (obj.isMultiFile && obj.files) {
        this._updateMultiFileVisibility(obj, effectiveOpts, totalFrames);
      } else if (obj.entity) {
        obj.entity.enabled = !!obj.visible;
      }
    }
  }

  /** Pin scrub end: refresh visibility at current time. */
  commitScrub() {
    const t = this._getCurrentTime?.() || 0;
    this.updateVisibilityByTime(t, { isPlaying: false });
  }

  /**
   * Multi-file: one active file from frame index over full timeline length.
   * @private
   */
  _updateMultiFileVisibility(obj, opts, totalFrames) {
    if (!obj.files?.length) return;
    if (!obj.visible) {
      obj.files.forEach((f) => {
        if (f.entity) f.entity.enabled = false;
      });
      return;
    }
    const fileCount = obj.files.length;
    const fi = Math.max(0, Math.min(totalFrames - 1, opts?.frameIndex ?? 0));
    const span = Math.max(1, totalFrames);
    let activeIndex = Math.floor((fi * fileCount) / span);
    if (activeIndex >= fileCount) activeIndex = fileCount - 1;
    obj.files.forEach((f, idx) => {
      if (f.entity) f.entity.enabled = idx === activeIndex;
    });
  }

  /**
   * @private
   */
  _refreshObjectVisibility(obj) {
    if (!this._getCurrentTime) return;
    const t = this._getCurrentTime();
    const fps = Math.max(1, Math.min(60, parseInt(this._getFps?.() || 30) || 30));
    const frameIndex = Math.floor((Number(t) || 0) * fps);
    const totalFrames = Math.max(1, parseInt(this._getTotalFrames?.() || 90) || 90);
    if (obj.isMultiFile && obj.files) {
      this._updateMultiFileVisibility(obj, { frameIndex }, totalFrames);
    } else if (obj.entity) {
      obj.entity.enabled = !!obj.visible;
    }
  }

  /**
   * Render object list (left panel only).
   */
  render() {
    if (!this._objectsListEl) return;

    this._objectsListEl.innerHTML = "";

    if (this.objects.length === 0) return;

    let anyVisible = false;
    this.objects.forEach((obj) => {
      if (obj.loadedWithGlb) return;
      if (this._isHiddenUnderCollapsedParent(obj)) return;

      anyVisible = true;
      const btn = this._createObjectButton(obj);
      this._objectsListEl.appendChild(btn);
    });

    if (anyVisible) {
      const end = document.createElement("div");
      end.className = "timeline__obj-list-end-drop";
      end.setAttribute("aria-hidden", "true");
      this._objectsListEl.appendChild(end);
    }
  }

  /**
   * @private
   * @param {import('./types').TimelineObject} obj
   */
  _hasHierarchyChildren(obj) {
    return this.objects.some((c) => !c.loadedWithGlb && c.parentId === obj.id);
  }

  /**
   * @private
   * @param {import('./types').TimelineObject} obj
   */
  _isHiddenUnderCollapsedParent(obj) {
    let pid = obj.parentId;
    while (pid) {
      if (this._collapsedParentIds.has(pid)) return true;
      const p = this.objects.find((o) => o.id === pid);
      pid = p?.parentId ?? null;
    }
    return false;
  }

  /**
   * 드롭 직전에도 `.is-dragging`이 남아 있을 수 있어 id로 제외한다.
   * @private
   * @param {string} excludeObjectId
   */
  _getFirstVisibleRowIdExcluding(excludeObjectId) {
    const el = this._objectsListEl;
    if (!el) return null;
    const rows = el.querySelectorAll(".timeline__obj-row");
    for (const r of rows) {
      const id = r.dataset.objectId;
      if (!id || id === excludeObjectId) continue;
      return id;
    }
    return null;
  }

  /**
   * @private
   * @param {string} excludeObjectId
   */
  _getLastVisibleRowIdExcluding(excludeObjectId) {
    const el = this._objectsListEl;
    if (!el) return null;
    const rows = [...el.querySelectorAll(".timeline__obj-row")].filter(
      (r) => r.dataset.objectId && r.dataset.objectId !== excludeObjectId
    );
    if (!rows.length) return null;
    return rows[rows.length - 1].dataset.objectId || null;
  }

  /**
   * 리스트 맨 아래(빈 영역) 드롭: 루트로 빼고 배열 끝으로 이동.
   * @private
   * @param {string} dragId
   */
  _moveObjectToEndDetached(dragId) {
    const objs = this.objects;
    const from = objs.findIndex((o) => o.id === dragId);
    if (from === -1) return;
    const item = objs[from];
    const hadParent = !!item.parentId;
    item.parentId = null;
    objs.splice(from, 1);
    objs.push(item);
    this.render();
    this.onObjectsChange?.(this.objects);
    try {
      this._syncEntityOrder?.();
    } catch (err) {
      console.warn("[ObjectsManager] syncEntityOrder failed", err);
    }
    if (hadParent) this.onHierarchyChange?.(dragId);
  }

  /**
   * @private
   */
  _onGlobalDragEnd() {
    this._draggingObjectId = null;
    this._clearDropIndicators();
    this._objectsListEl?.querySelectorAll(".timeline__obj-row.is-dragging").forEach((r) => {
      r.classList.remove("is-dragging");
    });
  }

  /**
   * @private
   */
  _clearDropIndicators() {
    this._objectsListEl
      ?.querySelectorAll(
        ".timeline__obj-row.is-drop-before, .timeline__obj-row.is-drop-after, .timeline__obj-row.is-drop-child"
      )
      .forEach((r) => {
        r.classList.remove("is-drop-before", "is-drop-after", "is-drop-child");
      });
    this._objectsListEl?.querySelector(".timeline__obj-list-end-drop.is-drop-end-active")?.classList.remove("is-drop-end-active");
  }

  /**
   * @private
   * @param {HTMLElement} row
   * @param {'before'|'after'|'child'|null} zone
   */
  _updateDropIndicator(row, zone) {
    if (!this._objectsListEl) return;
    this._clearDropIndicators();
    if (!row || !zone) return;
    if (zone === "before") row.classList.add("is-drop-before");
    else if (zone === "after") row.classList.add("is-drop-after");
    else if (zone === "child") row.classList.add("is-drop-child");
  }

  /**
   * @private
   * @param {HTMLElement} row
   * @param {number} clientY
   * @returns {'before'|'after'|'child'}
   */
  _getDropZone(row, clientY) {
    const rect = row.getBoundingClientRect();
    const h = rect.height;
    if (h <= 0) return "child";
    const t = (clientY - rect.top) / h;
    if (t < 0.22) return "before";
    if (t > 0.78) return "after";
    return "child";
  }

  /**
   * @private
   */
  _attachObjectListDnDDelegation() {
    const el = this._objectsListEl;
    if (!el || el._objListDndDelegation) return;
    el._objListDndDelegation = true;

    el.addEventListener("dragover", (e) => {
      if (!this._draggingObjectId) return;
      if (e.target.closest(".timeline__obj-list-end-drop")) {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        this._clearDropIndicators();
        const end = el.querySelector(".timeline__obj-list-end-drop");
        end?.classList.add("is-drop-end-active");
        return;
      }
      const row = e.target.closest(".timeline__obj-row");
      if (!row) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      el.querySelector(".timeline__obj-list-end-drop")?.classList.remove("is-drop-end-active");
      const zone = this._getDropZone(row, e.clientY);
      this._updateDropIndicator(row, zone);
    });

    el.addEventListener("drop", (e) => {
      if (!this._draggingObjectId) return;
      if (e.target.closest(".timeline__obj-list-end-drop")) {
        e.preventDefault();
        const dragId = this._draggingObjectId;
        this._clearDropIndicators();
        this._draggingObjectId = null;
        if (dragId) this._moveObjectToEndDetached(dragId);
        return;
      }
      const row = e.target.closest(".timeline__obj-row");
      if (!row) return;
      e.preventDefault();
      const dragId = this._draggingObjectId;
      const targetId = row.dataset.objectId;
      const zone = this._getDropZone(row, e.clientY);
      this._clearDropIndicators();
      this._draggingObjectId = null;
      if (!dragId || !targetId || dragId === targetId) return;

      if (zone === "child") {
        const ok = this.setObjectParent(dragId, targetId, { nestAfterParent: true });
        if (!ok) {
          this._reorderObject(dragId, targetId, true);
        }
        return;
      }

      const dragged = this.objects.find((o) => o.id === dragId);
      const hadParent = !!(dragged && dragged.parentId);
      const firstId = this._getFirstVisibleRowIdExcluding(dragId);
      const lastId = this._getLastVisibleRowIdExcluding(dragId);
      const dropToRoot =
        hadParent &&
        ((zone === "before" && targetId === firstId) || (zone === "after" && targetId === lastId));
      if (dropToRoot && dragged) dragged.parentId = null;

      this._reorderObject(dragId, targetId, zone === "before");

      if (dropToRoot && hadParent) {
        this.onHierarchyChange?.(dragId);
      }
    });
  }

  /**
   * @private
   * @param {string} draggedId
   * @param {string} targetId
   * @param {boolean} placeBefore
   */
  _reorderObject(draggedId, targetId, placeBefore) {
    const objs = this.objects;
    const from = objs.findIndex((o) => o.id === draggedId);
    if (from === -1) return;
    const [item] = objs.splice(from, 1);
    let insertAt = objs.findIndex((o) => o.id === targetId);
    if (insertAt === -1) {
      objs.splice(from, 0, item);
      return;
    }
    if (!placeBefore) insertAt += 1;
    objs.splice(insertAt, 0, item);
    this.render();
    this.onObjectsChange?.(this.objects);
    try {
      this._syncEntityOrder?.();
    } catch (err) {
      console.warn("[ObjectsManager] syncEntityOrder failed", err);
    }
  }

  /**
   * Create hierarchy row (접기/펼치기 + 행 드래그).
   * @private
   */
  _createObjectButton(obj) {
    const row = document.createElement("div");
    row.className = "timeline__obj-row";
    row.dataset.objectId = obj.id;

    const depth = getHierarchyDepth(this.objects, obj.id);
    if (depth > 0) {
      row.classList.add("timeline__obj-row--child");
      row.style.paddingLeft = `${depth * 14}px`;
    }

    if (this._selectedIds.has(obj.id)) {
      row.classList.add("is-selected");
    }
    if (this.selectedObjectId === obj.id) {
      row.classList.add("is-primary-selected");
    }
    if (obj.isMultiFile) {
      row.classList.add("is-multi-file");
    }
    if (obj.objectType === "empty") {
      row.classList.add("timeline__obj-row--empty");
    }

    const expandSlot = document.createElement("span");
    expandSlot.className = "timeline__obj-row__expand-slot";

    if (this._hasHierarchyChildren(obj)) {
      const expanded = !this._collapsedParentIds.has(obj.id);
      const toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "timeline__obj-row__expand";
      toggle.setAttribute("aria-expanded", expanded ? "true" : "false");
      toggle.title = expanded ? t("panel.hierarchyCollapse") : t("panel.hierarchyExpand");
      toggle.setAttribute("draggable", "false");
      toggle.textContent = expanded ? "▼" : "▶";
      toggle.addEventListener("click", (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (this._collapsedParentIds.has(obj.id)) {
          this._collapsedParentIds.delete(obj.id);
        } else {
          this._collapsedParentIds.add(obj.id);
        }
        this.render();
      });
      expandSlot.appendChild(toggle);
    } else {
      expandSlot.classList.add("timeline__obj-row__expand-slot--empty");
    }

    const main = document.createElement("div");
    main.className = "timeline__obj-row__main";

    const nameEl = document.createElement("span");
    nameEl.className = "timeline__obj-btn-name";
    nameEl.textContent = obj.name;

    const actionsEl = document.createElement("div");
    actionsEl.className = "timeline__obj-btn-actions";

    const visBtn = document.createElement("button");
    visBtn.type = "button";
    visBtn.className = "timeline__obj-btn-vis";
    visBtn.setAttribute("aria-pressed", obj.visible ? "true" : "false");
    visBtn.setAttribute("draggable", "false");
    visBtn.title = "Show/Hide";
    if (!obj.visible) {
      visBtn.classList.add("is-off");
    }

    const visIcon = document.createElement("span");
    visIcon.className = "timeline__obj-btn-vis-icon";
    visIcon.setAttribute("aria-hidden", "true");
    visBtn.appendChild(visIcon);

    actionsEl.appendChild(visBtn);
    main.appendChild(nameEl);
    row.appendChild(expandSlot);
    row.appendChild(main);
    row.appendChild(actionsEl);

    row.title = t("panel.dragToReorder");

    row.draggable = true;
    row.addEventListener("dragstart", (e) => {
      if (this._editingNameId === obj.id) {
        e.preventDefault();
        return;
      }
      if (
        e.target.closest(".timeline__obj-btn-actions") ||
        e.target.closest(".timeline__obj-btn-vis") ||
        e.target.closest(".timeline__obj-btn-name-input") ||
        e.target.closest(".timeline__obj-row__expand")
      ) {
        e.preventDefault();
        return;
      }
      this._draggingObjectId = obj.id;
      row.classList.add("is-dragging");
      try {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData(DND_MIME, obj.id);
        e.dataTransfer.setData("text/plain", obj.id);
      } catch (err) {
        /* ignore */
      }
    });

    let clickTimer = null;
    const DOUBLE_CLICK_DELAY = 250;

    row.addEventListener("click", (e) => {
      if (e.target.closest(".timeline__obj-btn-actions")) return;
      if (e.target.closest(".timeline__obj-row__expand")) return;
      if (this._editingNameId) return;

      const additive = e.metaKey || e.ctrlKey;
      const range = e.shiftKey;

      if (additive || range) {
        e.preventDefault();
        if (range) {
          const anchor = this._rangeAnchorId ?? this.selectedObjectId ?? obj.id;
          this._selectRangeFromTo(anchor, obj.id);
        } else {
          this._toggleSelect(obj.id);
          this._rangeAnchorId = obj.id;
        }
        return;
      }

      if (clickTimer) {
        clearTimeout(clickTimer);
        clickTimer = null;
        return;
      }
      clickTimer = setTimeout(() => {
        clickTimer = null;
        if (this._selectedIds.size === 1 && this._selectedIds.has(obj.id)) {
          this.clearSelection();
        } else {
          this._selectSingle(obj.id);
        }
      }, DOUBLE_CLICK_DELAY);
    });

    row.addEventListener("dblclick", (e) => {
      if (e.target.closest(".timeline__obj-btn-actions")) return;
      if (e.target.closest(".timeline__obj-row__expand")) return;
      if (clickTimer) {
        clearTimeout(clickTimer);
        clickTimer = null;
      }
      e.preventDefault();
      e.stopPropagation();
      this._selectSingle(obj.id);
      this._startNameEdit(obj.id, nameEl);
    });

    visBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const newVisible = this.toggleVisibility(obj.id);
      visBtn.classList.toggle("is-off", !newVisible);
      visBtn.setAttribute("aria-pressed", newVisible ? "true" : "false");
    });

    return row;
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
        this.onObjectsChange?.(this.objects);
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
      `.timeline__obj-row[data-object-id="${this.selectedObjectId}"]`
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

    const menuWidth = 150;
    const menuHeight = 170;
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
        if (action === "duplicate" && this._contextMenuTargetId) {
          const { ids } = this._idsAndNamesForBulkRowAction(this._contextMenuTargetId);
          if (ids.length) this.onDuplicateRequest?.(ids);
          this._hideMultiFileContextMenu();
          return;
        }
        if (action === "reverse" && this._contextMenuTargetId) {
          this.reverseMultiFileOrder(this._contextMenuTargetId);
          this._hideMultiFileContextMenu();
          return;
        }
        if (action === "delete" && this._contextMenuTargetId) {
          const { ids, names } = this._idsAndNamesForBulkRowAction(this._contextMenuTargetId);
          this._hideMultiFileContextMenu();
          if (ids.length && this.onDeleteRequest) {
            this.onDeleteRequest(ids, names);
          }
          return;
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

  /** @type {string|null} */
  _timelineObjectContextMenuTargetId = null;

  _showTimelineObjectContextMenu(x, y, objectId) {
    const menu = document.getElementById("timelineObjectContextMenu");
    if (!menu) return;

    this._timelineObjectContextMenuTargetId = objectId;
    const menuWidth = 200;
    const menuHeight = 220;
    const maxX = window.innerWidth - menuWidth - 10;
    const maxY = window.innerHeight - menuHeight - 10;
    menu.style.left = `${Math.min(x, maxX)}px`;
    menu.style.top = `${Math.min(y, maxY)}px`;
    menu.classList.add("is-visible");
    menu.setAttribute("aria-hidden", "false");

    const targetObj = this.objects.find((o) => o.id === objectId);
    const makeChildBtn = menu.querySelector('[data-action="parentFromSelection"]');
    const clearParentBtn = menu.querySelector('[data-action="clearParent"]');
    const sepHi = menu.querySelector(".context-menu__sep--hierarchy");
    const canMakeChild =
      !!targetObj &&
      supportsHierarchy(targetObj) &&
      !!this.selectedObjectId &&
      this.selectedObjectId !== objectId &&
      validateParentAssignment(this.objects, objectId, this.selectedObjectId) === null;
    const canClearParent = !!(targetObj && supportsHierarchy(targetObj) && targetObj.parentId);
    if (makeChildBtn) makeChildBtn.style.display = canMakeChild ? "" : "none";
    if (clearParentBtn) clearParentBtn.style.display = canClearParent ? "" : "none";
    if (sepHi) sepHi.style.display = canMakeChild || canClearParent ? "" : "none";

    if (!menu._hasTimelineObjectMenuClickHandler) {
      menu._hasTimelineObjectMenuClickHandler = true;
      menu.addEventListener("click", (e) => {
        const item = e.target.closest(".context-menu__item");
        if (!item) return;
        const action = item.dataset.action;
        const id = this._timelineObjectContextMenuTargetId;
        if (!id) return;
        if (action === "duplicate") {
          this._hideTimelineObjectContextMenu();
          const { ids } = this._idsAndNamesForBulkRowAction(id);
          if (ids.length) this.onDuplicateRequest?.(ids);
          return;
        }
        if (action === "parentFromSelection") {
          this._hideTimelineObjectContextMenu();
          const ok = this.attachSelectionAsParentOf(id);
          if (!ok) {
            alert(t("panel.hierarchyAttachFailed"));
          }
          return;
        }
        if (action === "clearParent") {
          this._hideTimelineObjectContextMenu();
          this.clearObjectParent(id);
          return;
        }
        if (action === "delete") {
          const { ids, names } = this._idsAndNamesForBulkRowAction(id);
          this._hideTimelineObjectContextMenu();
          if (ids.length && this.onDeleteRequest) {
            this.onDeleteRequest(ids, names);
          }
          return;
        }
      });
    }
    if (!this._timelineObjectContextMenuCloseHandler) {
      this._timelineObjectContextMenuCloseHandler = (e) => {
        if (!menu.contains(e.target)) this._hideTimelineObjectContextMenu();
      };
      setTimeout(() => document.addEventListener("click", this._timelineObjectContextMenuCloseHandler), 0);
    }
  }

  _hideTimelineObjectContextMenu() {
    const menu = document.getElementById("timelineObjectContextMenu");
    if (menu) {
      menu.classList.remove("is-visible");
      menu.setAttribute("aria-hidden", "true");
    }
    this._timelineObjectContextMenuTargetId = null;
    if (this._timelineObjectContextMenuCloseHandler) {
      document.removeEventListener("click", this._timelineObjectContextMenuCloseHandler);
      this._timelineObjectContextMenuCloseHandler = null;
    }
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
}

export default ObjectsManager;
