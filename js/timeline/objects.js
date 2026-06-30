/** Left-panel hierarchy: selection, DnD, visibility, multi-file by frame. */

import { t } from '../i18n.js';
import {
  supportsHierarchy,
  validateParentAssignment,
  getHierarchyDepth,
} from "./objectHierarchy.js";

const DND_MIME = 'application/x-sfacstudio-object-id';

function escapeSelectorAttr(value) {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
    return CSS.escape(String(value));
  }
  return String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

export class ObjectsManager {
  /** @param {{ objectsListEl: HTMLElement, getCurrentTime: Function, getFps?: Function, getTotalFrames?: Function|null, syncEntityOrder?: (() => void)|null }} options */
  constructor(options) {
    this._objectsListEl = options.objectsListEl;
    this._getCurrentTime = options.getCurrentTime;
    this._getFps = options.getFps || (() => 30);
    this._getTotalFrames = options.getTotalFrames || null;
    /** @type {(() => void) | null} */
    this._syncEntityOrder = options.syncEntityOrder || null;

    /** @type {import('./types').TimelineObject[]} */
    this.objects = [];

    this._draggingObjectId = null;
    this._onGlobalDragEnd = this._onGlobalDragEnd.bind(this);
    document.addEventListener('dragend', this._onGlobalDragEnd);
    this._attachObjectListDnDDelegation();
    this._attachMarqueeSelect();

    this.selectedObjectId = null;
    this._selectedIds = new Set();
    this._rangeAnchorId = null;
    this._editingNameId = null;
    this._collapsedParentIds = new Set();

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

  /** @param {Object} [options] sourcePath, sourceFileName, duplicatedFromSourcePath, objectType */
  add(name, entity, splatId = null, options = {}) {
    const obj = {
      id: `obj_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      name,
      visible: true,
      entity,
      splatId,
      glbId: null,
      objectType: options?.objectType ?? 'ply',
      meshBase64: options?.meshBase64 ?? null,
      meshFormat: options?.meshFormat ?? null,
      isCollisionBlocker:
        options?.isCollisionBlocker ??
        (options?.objectType === 'cube' ||
          options?.objectType === 'obj' ||
          options?.objectType === 'glb'),
      loadedWithGlb: false,
      pairedGlbObjectId: null,
      isMultiFile: false,
      files: null,
      parentId: null,
      sourcePath: options?.sourcePath ?? null,
      sourceFileName: options?.sourceFileName ?? null,
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

  /** @param {Array<{entity: Object, splatId: string, fileName: string}>} files */
  addMultiFile(files) {
    if (!files || files.length === 0) return null;
    
    const firstName = files[0].fileName.replace(/\.[^/.]+$/, "");
    const name = `${firstName}_set`;
    
    files.forEach((f, idx) => {
      if (f.entity) {
        f.entity.enabled = (idx === 0);
      }
    });
    
    const obj = {
      id: `obj_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      name,
      visible: true,
      entity: null,
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

  /** Move child to sit directly under parent in the array. */
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

  /** Set parent (single PLY); null = root. @returns {boolean} */
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

  /** @returns {string[]} ids to reparent when dragging dragId */
  _getDragReparentIds(dragId) {
    if (!dragId) return [];
    if (this._selectedIds.has(dragId) && this._selectedIds.size > 1) {
      return this.getSelectedIds();
    }
    return [dragId];
  }

  /**
   * 다중 선택 시 부모도 함께 선택된 자식은 한 번만 이동(루트만).
   * @param {string} dragId
   * @returns {string[]}
   */
  _getSelectionRootsForDrag(dragId) {
    const ids = this._getDragReparentIds(dragId);
    const set = new Set(ids);
    return ids.filter((id) => {
      let pid = this.objects.find((o) => o.id === id)?.parentId;
      while (pid) {
        if (set.has(pid)) return false;
        const p = this.objects.find((o) => o.id === pid);
        pid = p?.parentId ?? null;
      }
      return true;
    });
  }

  /** @param {string|string[]} exclude */
  _excludeIdSet(exclude) {
    const arr = Array.isArray(exclude) ? exclude : exclude ? [exclude] : [];
    return new Set(arr.filter(Boolean));
  }

  /**
   * 선택된 모든 항목(대상 제외)을 parentId의 자식으로 연결.
   * @param {string} parentId
   * @returns {boolean} 하나라도 성공하면 true
   */
  attachSelectedAsChildrenOf(parentId) {
    if (!parentId) return false;
    const selected = this.getSelectedIds();
    const roots = selected.filter((id) => {
      if (id === parentId) return false;
      let pid = this.objects.find((o) => o.id === id)?.parentId;
      const set = new Set(selected);
      while (pid) {
        if (set.has(pid)) return false;
        const p = this.objects.find((o) => o.id === pid);
        pid = p?.parentId ?? null;
      }
      return true;
    });
    const childIds = roots.length ? roots : selected.filter((id) => id !== parentId);
    if (!childIds.length) return false;
    let any = false;
    for (const cid of childIds) {
      if (this.setObjectParent(cid, parentId, { nestAfterParent: true })) {
        any = true;
      }
    }
    return any;
  }

  /** 우클릭 행을 선택(primary)의 자식으로 (단일 선택용). */
  attachSelectionAsParentOf(targetObjectId) {
    const sel = this.selectedObjectId;
    if (!sel || sel === targetObjectId) return false;
    return this.setObjectParent(targetObjectId, sel);
  }

  /**
   * 다중 선택: 우클릭 행=부모, 나머지 선택=자식. 단일: 기존(행=자식).
   * @param {string} targetObjectId
   * @returns {boolean}
   */
  attachSelectionToTarget(targetObjectId) {
    const selected = this.getSelectedIds();
    if (selected.length > 1) {
      return this.attachSelectedAsChildrenOf(targetObjectId);
    }
    return this.attachSelectionAsParentOf(targetObjectId);
  }

  clearObjectParent(objectId) {
    return this.setObjectParent(objectId, null);
  }

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

  /** @returns {boolean} new visible state */
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
    this.onObjectsChange?.(this.objects);
    return obj.visible;
  }

  select(id) {
    this._selectSingle(id);
  }

  clearSelection() {
    this._selectedIds.clear();
    this.selectedObjectId = null;
    this._rangeAnchorId = null;
    this.render();
    this.onObjectSelect?.(null);
  }

  getSelectedIds() {
    return this._getVisibleObjectIdsInOrder().filter((oid) => this._selectedIds.has(oid));
  }

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

  /** Bulk delete/duplicate: full selection if row in selection, else that row only. */
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

  isObjectSelected(id) {
    return this._selectedIds.has(id);
  }

  _getVisibleObjectIdsInOrder() {
    const ids = [];
    for (const obj of this.objects) {
      if (obj.loadedWithGlb) continue;
      if (this._isHiddenUnderCollapsedParent(obj)) continue;
      ids.push(obj.id);
    }
    return ids;
  }

  _firstIdInVisibleSelection() {
    for (const oid of this._getVisibleObjectIdsInOrder()) {
      if (this._selectedIds.has(oid)) return oid;
    }
    return null;
  }

  _selectSingle(id) {
    this._selectedIds.clear();
    this._selectedIds.add(id);
    this.selectedObjectId = id;
    this._rangeAnchorId = id;
    this.render();
    const obj = this.objects.find((o) => o.id === id);
    this.onObjectSelect?.(obj || null);
  }

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

  _lastIdInVisibleSet(idSet) {
    const order = this._getVisibleObjectIdsInOrder();
    for (let i = order.length - 1; i >= 0; i--) {
      if (idSet.has(order[i])) return order[i];
    }
    return null;
  }

  getSelected() {
    if (!this.selectedObjectId) return null;
    return this.objects.find(o => o.id === this.selectedObjectId) || null;
  }

  /** Multi-file: one file active per frame index. */
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

  commitScrub() {
    const t = this._getCurrentTime?.() || 0;
    this.updateVisibilityByTime(t, { isPlaying: false });
  }

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

  _hasHierarchyChildren(obj) {
    return this.objects.some((c) => !c.loadedWithGlb && c.parentId === obj.id);
  }

  _isHiddenUnderCollapsedParent(obj) {
    let pid = obj.parentId;
    while (pid) {
      if (this._collapsedParentIds.has(pid)) return true;
      const p = this.objects.find((o) => o.id === pid);
      pid = p?.parentId ?? null;
    }
    return false;
  }

  _getFirstVisibleRowIdExcluding(exclude) {
    const ex = this._excludeIdSet(exclude);
    const el = this._objectsListEl;
    if (!el) return null;
    const rows = el.querySelectorAll(".timeline__obj-row");
    for (const r of rows) {
      const id = r.dataset.objectId;
      if (!id || ex.has(id)) continue;
      return id;
    }
    return null;
  }

  _getLastVisibleRowIdExcluding(exclude) {
    const ex = this._excludeIdSet(exclude);
    const el = this._objectsListEl;
    if (!el) return null;
    const rows = [...el.querySelectorAll(".timeline__obj-row")].filter(
      (r) => r.dataset.objectId && !ex.has(r.dataset.objectId)
    );
    if (!rows.length) return null;
    return rows[rows.length - 1].dataset.objectId || null;
  }

  /**
   * @param {string[]} dragIds
   * @param {string} targetId
   * @param {boolean} placeBefore
   */
  _reorderObjects(dragIds, targetId, placeBefore) {
    const idSet = new Set((dragIds || []).filter(Boolean));
    if (!idSet.size || !targetId || idSet.has(targetId)) return;

    const items = [];
    const remaining = [];
    for (const o of this.objects) {
      if (idSet.has(o.id)) items.push(o);
      else remaining.push(o);
    }
    if (!items.length) return;

    let insertAt = remaining.findIndex((o) => o.id === targetId);
    if (insertAt === -1) {
      remaining.push(...items);
    } else {
      if (!placeBefore) insertAt += 1;
      remaining.splice(insertAt, 0, ...items);
    }
    this.objects.splice(0, this.objects.length, ...remaining);
    this.render();
    this.onObjectsChange?.(this.objects);
    try {
      this._syncEntityOrder?.();
    } catch (err) {
      console.warn("[ObjectsManager] syncEntityOrder failed", err);
    }
  }

  /** @param {string[]} dragIds */
  _detachObjectsFromParent(dragIds) {
    const idSet = new Set((dragIds || []).filter(Boolean));
    let any = false;
    for (const o of this.objects) {
      if (!idSet.has(o.id) || !o.parentId) continue;
      o.parentId = null;
      any = true;
      this.onHierarchyChange?.(o.id);
    }
    return any;
  }

  /** @param {string} dragId */
  _moveObjectToEndDetached(dragId) {
    this._moveObjectsToEndDetached(this._getSelectionRootsForDrag(dragId));
  }

  /** @param {string[]} dragIds */
  _moveObjectsToEndDetached(dragIds) {
    const roots = (dragIds || []).filter(Boolean);
    if (!roots.length) return;
    const idSet = new Set(roots);
    const hadParent = this._detachObjectsFromParent(roots);

    const items = [];
    const remaining = [];
    for (const o of this.objects) {
      if (idSet.has(o.id)) items.push(o);
      else remaining.push(o);
    }
    remaining.push(...items);
    this.objects.splice(0, this.objects.length, ...remaining);

    this.render();
    this.onObjectsChange?.(this.objects);
    try {
      this._syncEntityOrder?.();
    } catch (err) {
      console.warn("[ObjectsManager] syncEntityOrder failed", err);
    }
    if (!hadParent) return;
    for (const id of roots) {
      const o = this.objects.find((x) => x.id === id);
      if (o && !o.parentId) this.onHierarchyChange?.(id);
    }
  }

  _onGlobalDragEnd() {
    this._draggingObjectId = null;
    this._clearDropIndicators();
    this._objectsListEl?.querySelectorAll(".timeline__obj-row.is-dragging").forEach((r) => {
      r.classList.remove("is-dragging");
    });
  }

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

  _updateDropIndicator(row, zone) {
    if (!this._objectsListEl) return;
    this._clearDropIndicators();
    if (!row || !zone) return;
    if (zone === "before") row.classList.add("is-drop-before");
    else if (zone === "after") row.classList.add("is-drop-after");
    else if (zone === "child") row.classList.add("is-drop-child");
  }

  _getDropZone(row, clientY) {
    const rect = row.getBoundingClientRect();
    const h = rect.height;
    if (h <= 0) return "child";
    const t = (clientY - rect.top) / h;
    if (t < 0.22) return "before";
    if (t > 0.78) return "after";
    return "child";
  }

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
        const reparentIds = this._getSelectionRootsForDrag(dragId);
        let ok = false;
        for (const cid of reparentIds) {
          if (cid === targetId) continue;
          if (this.setObjectParent(cid, targetId, { nestAfterParent: true })) {
            ok = true;
          }
        }
        if (!ok) {
          this._reorderObjects(reparentIds, targetId, true);
        }
        return;
      }

      const moveIds = this._getSelectionRootsForDrag(dragId).filter((id) => id !== targetId);
      if (!moveIds.length) return;

      const anyHadParent = moveIds.some((id) => {
        const o = this.objects.find((x) => x.id === id);
        return !!(o && o.parentId);
      });
      const firstId = this._getFirstVisibleRowIdExcluding(moveIds);
      const lastId = this._getLastVisibleRowIdExcluding(moveIds);
      const dropToRoot =
        anyHadParent &&
        ((zone === "before" && targetId === firstId) || (zone === "after" && targetId === lastId));
      if (dropToRoot) {
        this._detachObjectsFromParent(moveIds);
      }

      this._reorderObjects(moveIds, targetId, zone === "before");
    });
  }

  _reorderObject(draggedId, targetId, placeBefore) {
    this._reorderObjects([draggedId], targetId, placeBefore);
  }

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
    if (obj.objectType === "obj" || obj.objectType === "glb" || obj.isCollisionBlocker) {
      row.classList.add("timeline__obj-row--mesh-blocker");
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

    row.title = `${t("panel.dragToReorder")} ${t("panel.objectDoubleClickRename")}`;

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
      const dragIds = this._getDragReparentIds(obj.id);
      const listEl = this._objectsListEl;
      if (listEl) {
        for (const id of dragIds) {
          const r = listEl.querySelector(
            `.timeline__obj-row[data-object-id="${escapeSelectorAttr(id)}"]`
          );
          r?.classList.add("is-dragging");
        }
      } else {
        row.classList.add("is-dragging");
      }
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

      if (e.detail === 2) {
        if (clickTimer) {
          clearTimeout(clickTimer);
          clickTimer = null;
        }
        e.preventDefault();
        e.stopPropagation();
        const renameId = obj.id;
        this._selectSingle(renameId);
        requestAnimationFrame(() => {
          const rowAfter = this._objectsListEl?.querySelector(
            `.timeline__obj-row[data-object-id="${escapeSelectorAttr(renameId)}"]`
          );
          const freshNameEl = rowAfter?.querySelector('.timeline__obj-btn-name');
          if (freshNameEl) this._startNameEdit(renameId, freshNameEl);
        });
        return;
      }

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

    visBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const newVisible = this.toggleVisibility(obj.id);
      visBtn.classList.toggle("is-off", !newVisible);
      visBtn.setAttribute("aria-pressed", newVisible ? "true" : "false");
    });

    return row;
  }
  
  _applyObjectNameToEntities(obj, name) {
    if (!obj || !name) return;
    try {
      if (obj.entity) obj.entity.name = name;
      if (obj.isMultiFile && Array.isArray(obj.files)) {
        obj.files.forEach((f) => {
          if (f?.entity) f.entity.name = name;
        });
      }
    } catch (_) {}
  }

  _startNameEdit(objectId, nameEl) {
    if (this._editingNameId) return;

    const obj = this.objects.find(o => o.id === objectId);
    if (!obj) return;

    this._editingNameId = objectId;

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

      if (save) {
        if (newName && newName !== originalName) {
          obj.name = newName;
          nameEl.textContent = newName;
          this._applyObjectNameToEntities(obj, newName);
          try {
            window.__inspector?.syncSelectedObjectName?.(obj);
          } catch (_) {}
          try {
            window.__objectDescription?.updateFromSelection?.();
          } catch (_) {}
          this.onObjectsChange?.(this.objects);
        } else if (!newName) {
          nameEl.textContent = originalName;
        }
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
  
  startEditingSelectedName() {
    if (!this.selectedObjectId) return;

    const sid = escapeSelectorAttr(this.selectedObjectId);
    const btn = this._objectsListEl?.querySelector(
      `.timeline__obj-row[data-object-id="${sid}"]`
    );
    if (!btn) return;
    
    const nameEl = btn.querySelector(".timeline__obj-btn-name");
    if (nameEl) {
      this._startNameEdit(this.selectedObjectId, nameEl);
    }
  }
  
  _contextMenuTargetId = null;

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
    
    if (!this._contextMenuCloseHandler) {
      this._contextMenuCloseHandler = (e) => {
        if (!menu.contains(e.target)) {
          this._hideMultiFileContextMenu();
        }
      };
      document.addEventListener("click", this._contextMenuCloseHandler);
    }
  }
  
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
    const selectedCount = this.getSelectedIds().length;
    const canMakeChildMulti =
      selectedCount > 1 &&
      !!targetObj &&
      supportsHierarchy(targetObj) &&
      this.getSelectedIds().some(
        (sid) =>
          sid !== objectId && validateParentAssignment(this.objects, sid, objectId) === null,
      );
    const canMakeChildSingle =
      selectedCount <= 1 &&
      !!targetObj &&
      supportsHierarchy(targetObj) &&
      !!this.selectedObjectId &&
      this.selectedObjectId !== objectId &&
      validateParentAssignment(this.objects, objectId, this.selectedObjectId) === null;
    const canMakeChild = canMakeChildMulti || canMakeChildSingle;
    if (makeChildBtn) {
      const label = makeChildBtn.querySelector(".context-menu__label");
      if (label) {
        label.textContent = canMakeChildMulti
          ? t("panel.hierarchyAttachSelection")
          : t("panel.hierarchyMakeChild");
      }
    }
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
          const ok = this.attachSelectionToTarget(id);
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

  reverseMultiFileOrder(objectId) {
    const obj = this.objects.find(o => o.id === objectId);
    if (!obj || !obj.isMultiFile || !obj.files) return;
    
    obj.files.reverse();
    this.onObjectsChange?.();
    const currentTime = this._getCurrentTime();
    this.updateVisibilityByTime(currentTime);
  }
}
