/** Point selection tool (main class). */
import { SelectionRenderer } from './selectors/SelectionRenderer.js';
import { RectangleSelector } from './selectors/RectangleSelector.js';
import { BrushSelector } from './selectors/BrushSelector.js';
import { HistoryManager, SelectionChangeTask, EraseTask, MultiEraseTask, ComplementTask, SequenceEraseTask } from './SelectionHistory.js';

export class SelectionTool {
  constructor(viewer, canvas) {
    this.viewer = viewer;
    this.canvas = canvas;
    this.isActive = false;
    this.mode = null;
    this.pendingComplementErase = false;
    this.pendingComplementEraseKey = null;
    this._activeSelectionContextKey = null;
    this.originalPixels = null;
    this.originalPixelsByKey = new Map();
    this.lastSelectedIndices = [];
    this.selectedIndicesByContextKey = new Map();
    this.accumulatedVolumesByContextKey = new Map();
    this.erasedIndicesByKey = new Map();
    this.erasedVolumesBySequenceId = new Map();
    this.sequenceComplementEnabledByKey = new Map();
    
    this.dragId = undefined;
    this.dragMoved = false;
    this.start = { x: 0, y: 0 };
    this.end = { x: 0, y: 0 };
    this.currentMousePos = { x: 0, y: 0 };
    this.isTemporarilyDisabled = false;

    this.renderer = new SelectionRenderer(canvas);
    this.rectangleSelector = new RectangleSelector(viewer, canvas);
    this.brushSelector = new BrushSelector(viewer, canvas);
    this.histories = new Map();
    this.detailsPanel = null;
  }

  resetAll() {
    try {
      this.originalPixels = null;
      this.originalPixelsByKey?.clear?.();
      this.selectedIndicesByContextKey?.clear?.();
      this.erasedIndicesByKey?.clear?.();
      this.erasedVolumesBySequenceId?.clear?.();
      this.sequenceComplementEnabledByKey?.clear?.();
      this.accumulatedVolumesByContextKey?.clear?.();
      this.histories?.clear?.();

      this._activeSelectionContextKey = null;
      this.pendingComplementErase = false;
      this.pendingComplementEraseKey = null;
      this.lastSelectedIndices = [];
    } catch (e) {}
  }

  clearAccumulatedVolumesForCurrentSelection(type) {
    const ctx = this._getSelectionContext();
    if (!ctx?.key) return;
    if (type !== 'box' && type !== 'sphere') return;
    this._clearAccumulatedVolumes(ctx.key, type);
  }

  clearAllAccumulatedVolumesForCurrentSelection() {
    const ctx = this._getSelectionContext();
    if (!ctx?.key) return;
    this._clearAccumulatedVolumes(ctx.key, 'sphere');
    this._clearAccumulatedVolumes(ctx.key, 'box');
  }

  _getAccumulatedVolumeBucket(ctxKey) {
    if (!ctxKey) return null;
    let bucket = this.accumulatedVolumesByContextKey.get(ctxKey);
    if (!bucket) {
      bucket = { box: [], sphere: [] };
      this.accumulatedVolumesByContextKey.set(ctxKey, bucket);
    }
    return bucket;
  }

  _getAccumulatedVolumes(ctxKey, type) {
    const bucket = this._getAccumulatedVolumeBucket(ctxKey);
    if (!bucket) return [];
    if (type === 'box') return bucket.box;
    if (type === 'sphere') return bucket.sphere;
    return [];
  }

  _getAllAccumulatedVolumes(ctxKey) {
    const bucket = this._getAccumulatedVolumeBucket(ctxKey);
    if (!bucket) return [];
    return [...(bucket.sphere || []), ...(bucket.box || [])];
  }

  refreshSelectionFromAllAccumulatedVolumes() {
    const ctx = this._getSelectionContext();
    if (!ctx?.key) return;

    const allVolumes = this._getAllAccumulatedVolumes(ctx.key);
    const complement = this.getComplementEnabled() === true;

    if (ctx.isMultiFile && ctx.entities?.length) {
      for (const gsplatEntity of ctx.entities) {
        if (!gsplatEntity?.gsplat) continue;
        const indices = allVolumes.length > 0
          ? this._collectIndicesInVolumeEntities(gsplatEntity, allVolumes, complement)
          : [];
        this._setMultiFileSelectionFromIndices(ctx.key, gsplatEntity, indices, 'set');
      }
      return;
    }

    const gsplatEntity = this.getGsplatEntityFromSelection();
    if (!gsplatEntity?.gsplat) return;

    if (allVolumes.length === 0) {
      this.restorePointColors();
      this.lastSelectedIndices = [];
      return;
    }

    if (typeof this._ensureBaseColorCache === 'function') {
      this._ensureBaseColorCache(gsplatEntity);
    }

    const indices = this._collectIndicesInVolumeEntities(gsplatEntity, allVolumes, complement);
    if (indices.length === 0) {
      this.restorePointColors();
      this.lastSelectedIndices = [];
      return;
    }
    this.changePointColors(indices);
  }

  _clearAccumulatedVolumes(ctxKey, type) {
    const bucket = this._getAccumulatedVolumeBucket(ctxKey);
    if (!bucket) return;

    const list = type === 'sphere' ? bucket.sphere : bucket.box;
    for (const e of list) {
      try {
        e.enabled = false;
        e.destroy?.();
      } catch (err) {}
    }
    if (type === 'sphere') bucket.sphere = [];
    if (type === 'box') bucket.box = [];
  }

  _setAccumulatedVolumesEnabled(ctxKey, type, enabled) {
    const bucket = this._getAccumulatedVolumeBucket(ctxKey);
    if (!bucket) return;
    const list = type === 'sphere' ? bucket.sphere : bucket.box;
    for (const e of list) {
      try { e.enabled = !!enabled; } catch (err) {}
    }
  }

  _cloneVolumeEntityAsBlue(volumeEntity) {
    if (!volumeEntity) return null;
    let clone;
    try {
      clone = volumeEntity.clone ? volumeEntity.clone() : null;
    } catch (err) {
      clone = null;
    }
    if (!clone) return null;

    clone.enabled = true;
    clone.name = `${volumeEntity.name}_Accumulated`;
    clone.__volumeType = volumeEntity.name;
    if (volumeEntity.name === 'WireSphere' && volumeEntity.__wireRadius != null) {
      clone.__wireRadius = volumeEntity.__wireRadius;
    }

    try {
      const pc = window.pc;
      const instances = clone.render?.meshInstances || [];
      for (const mi of instances) {
        const mat = mi.material;
        if (!mat || !pc) continue;

        let newMat = null;
        try {
          newMat = typeof mat.clone === 'function' ? mat.clone() : null;
        } catch (_) {
          newMat = null;
        }

        if (newMat) {
          mi.material = newMat;
          newMat.useLighting = false;
          newMat.emissive = new pc.Color(0.2, 0.55, 1.0);
          newMat.emissiveIntensity = 1.0;
          newMat.update?.();
        } else {
        }
      }
    } catch (err) {}

    try {
      const parent = volumeEntity.parent || window.pc?.app?.root;
      parent?.addChild?.(clone);
    } catch (err) {}

    return clone;
  }

  _collectIndicesInVolumeEntities(gsplatEntity, volumeEntities, complement = false) {
    const pc = window.pc;
    if (!pc) return [];
    if (!gsplatEntity?.gsplat) return [];
    if (!Array.isArray(volumeEntities) || volumeEntities.length === 0) return [];

    const instance = gsplatEntity.gsplat?.instance;
    const resource = instance?.resource;
    if (!resource) return [];

    const centers = resource.centers;
    const count = resource?.gsplatData?.numSplats ?? (centers ? Math.floor(centers.length / 3) : 0);
    if (!centers || !count) return [];

    const wt = gsplatEntity.getWorldTransform();
    const tmp = new pc.Vec3();
    const local = new pc.Vec3();

    const erasedSet = this._getErasedIndicesForEntity(gsplatEntity);
    const boxInfo = [];
    const sphereInfo = [];
    for (const v of volumeEntities) {
      if (!v) continue;
      const vType = v.__volumeType || v.name;
      if (vType === 'WireBox' || (typeof vType === 'string' && vType.startsWith('WireBox'))) {
        const inv = new pc.Mat4();
        try { inv.copy(v.getWorldTransform()).invert(); } catch (e) {}
        const s = v.getLocalScale ? v.getLocalScale() : { x: 1, y: 1, z: 1 };
        boxInfo.push({ inv, hx: Math.abs(s.x ?? 1) / 2, hy: Math.abs(s.y ?? 1) / 2, hz: Math.abs(s.z ?? 1) / 2 });
      } else if (vType === 'WireSphere' || (typeof vType === 'string' && vType.startsWith('WireSphere'))) {
        const center = v.getPosition ? v.getPosition() : new pc.Vec3();
        const baseRadius = v.__wireRadius ?? 1;
        const scale = v.getLocalScale ? v.getLocalScale() : { x: 1, y: 1, z: 1 };
        const radius = baseRadius * (scale.x ?? 1);
        sphereInfo.push({ center, r2: radius * radius });
      }
    }

    const indices = [];
    for (let i = 0; i < count; i++) {
      if (erasedSet.has(i)) continue;

      tmp.set(centers[i * 3], centers[i * 3 + 1], centers[i * 3 + 2]);
      wt.transformPoint(tmp, tmp);

      let inside = false;

      for (const s of sphereInfo) {
        const dx = tmp.x - s.center.x;
        const dy = tmp.y - s.center.y;
        const dz = tmp.z - s.center.z;
        if (dx * dx + dy * dy + dz * dz <= s.r2) {
          inside = true;
          break;
        }
      }

      if (!inside) {
        for (const b of boxInfo) {
          b.inv.transformPoint(tmp, local);
          if (Math.abs(local.x) <= b.hx && Math.abs(local.y) <= b.hy && Math.abs(local.z) <= b.hz) {
            inside = true;
            break;
          }
        }
      }

      const picked = complement ? !inside : inside;
      if (picked) indices.push(i);
    }
    return indices;
  }

  _snapshotVolumeEntities(volumeEntities) {
    const pc = window.pc;
    if (!pc || !Array.isArray(volumeEntities)) return { spheres: [], boxes: [] };
    const spheres = [];
    const boxes = [];
    for (const v of volumeEntities) {
      if (!v) continue;
      const vType = v.__volumeType || v.name;
      if (vType === 'WireSphere' || (typeof vType === 'string' && vType.startsWith('WireSphere'))) {
        const pos = v.getPosition ? v.getPosition() : new pc.Vec3(0, 0, 0);
        const baseRadius = v.__wireRadius ?? 1;
        const scale = v.getLocalScale ? v.getLocalScale() : { x: 1, y: 1, z: 1 };
        const radius = baseRadius * (scale.x ?? 1);
        spheres.push({ center: { x: pos.x, y: pos.y, z: pos.z }, r2: radius * radius });
      } else if (vType === 'WireBox' || (typeof vType === 'string' && vType.startsWith('WireBox'))) {
        const inv = new pc.Mat4();
        try { inv.copy(v.getWorldTransform()).invert(); } catch (e) { continue; }
        const s = v.getLocalScale ? v.getLocalScale() : { x: 1, y: 1, z: 1 };
        boxes.push({
          invArr: Array.from(inv.data),
          hx: Math.abs(s.x ?? 1) / 2,
          hy: Math.abs(s.y ?? 1) / 2,
          hz: Math.abs(s.z ?? 1) / 2,
        });
      }
    }
    return { spheres, boxes };
  }

  _collectIndicesInVolumeSnapshots(gsplatEntity, snapshots, complement = false) {
    const pc = window.pc;
    if (!pc || !gsplatEntity?.gsplat || !snapshots) return [];
    const { spheres = [], boxes = [] } = snapshots;
    if (spheres.length === 0 && boxes.length === 0) return [];

    const instance = gsplatEntity.gsplat?.instance;
    const resource = instance?.resource;
    if (!resource) return [];
    const centers = resource.centers;
    const count = resource?.gsplatData?.numSplats ?? (centers ? Math.floor(centers.length / 3) : 0);
    if (!centers || !count) return [];

    const wt = gsplatEntity.getWorldTransform();
    const tmp = new pc.Vec3();
    const local = new pc.Vec3();
    const boxMatrices = boxes.map(b => {
      const m = new pc.Mat4();
      m.data.set(b.invArr);
      return { inv: m, hx: b.hx, hy: b.hy, hz: b.hz };
    });

    const insideIndices = [];
    for (let i = 0; i < count; i++) {
      tmp.set(centers[i * 3], centers[i * 3 + 1], centers[i * 3 + 2]);
      wt.transformPoint(tmp, tmp);
      let inside = false;
      for (const s of spheres) {
        const dx = tmp.x - s.center.x;
        const dy = tmp.y - s.center.y;
        const dz = tmp.z - s.center.z;
        if (dx * dx + dy * dy + dz * dz <= s.r2) {
          inside = true;
          break;
        }
      }
      if (!inside) {
        for (const b of boxMatrices) {
          b.inv.transformPoint(tmp, local);
          if (Math.abs(local.x) <= b.hx && Math.abs(local.y) <= b.hy && Math.abs(local.z) <= b.hz) {
            inside = true;
            break;
          }
        }
      }
      if (inside) insideIndices.push(i);
    }
    if (complement) {
      const outsideSet = new Set();
      for (let i = 0; i < count; i++) outsideSet.add(i);
      insideIndices.forEach(i => outsideSet.delete(i));
      return Array.from(outsideSet);
    }
    return insideIndices;
  }

  _getErasedIndicesFromBatches(gsplatEntity, batches) {
    if (!Array.isArray(batches) || batches.length === 0) return new Set();
    const union = new Set();
    for (const batch of batches) {
      const snapshots = { spheres: batch.spheres || [], boxes: batch.boxes || [] };
      const complement = !!batch.complement;
      const indices = this._collectIndicesInVolumeSnapshots(gsplatEntity, snapshots, complement);
      indices.forEach(i => union.add(i));
    }
    return union;
  }

  getErasedIndicesForSequenceExport(gsplatData, worldTransformMat4, sequenceId) {
    const bucket = this._getErasedVolumesBucket(sequenceId);
    const batches = bucket?.batches;
    if (!Array.isArray(batches) || batches.length === 0) return new Set();

    const pc = window.pc;
    if (!pc || !gsplatData || !worldTransformMat4) return new Set();
    const x = gsplatData.getProp?.('x');
    const y = gsplatData.getProp?.('y');
    const z = gsplatData.getProp?.('z');
    if (!x || !y || !z) return new Set();
    const numSplats = gsplatData.numSplats ?? Math.min(x.length, y.length, z.length);
    if (numSplats <= 0) return new Set();

    const tmp = new pc.Vec3();
    const worldPos = new pc.Vec3();
    const local = new pc.Vec3();
    const boxMatrices = [];
    const union = new Set();

    for (const batch of batches) {
      const spheres = batch.spheres || [];
      const boxes = batch.boxes || [];
      const complement = !!batch.complement;
      boxMatrices.length = 0;
      for (const b of boxes) {
        if (b?.invArr?.length === 16) {
          const m = new pc.Mat4();
          m.data.set(b.invArr);
          boxMatrices.push({ inv: m, hx: b.hx ?? 0.5, hy: b.hy ?? 0.5, hz: b.hz ?? 0.5 });
        }
      }

      const insideIndices = [];
      for (let i = 0; i < numSplats; i++) {
        tmp.set(x[i] ?? 0, y[i] ?? 0, z[i] ?? 0);
        worldTransformMat4.transformPoint(tmp, worldPos);
        let inside = false;
        for (const s of spheres) {
          const cx = s.center?.x ?? 0;
          const cy = s.center?.y ?? 0;
          const cz = s.center?.z ?? 0;
          const dx = worldPos.x - cx;
          const dy = worldPos.y - cy;
          const dz = worldPos.z - cz;
          const r2 = s.r2 ?? 0;
          if (dx * dx + dy * dy + dz * dz <= r2) {
            inside = true;
            break;
          }
        }
        if (!inside) {
          for (const b of boxMatrices) {
            b.inv.transformPoint(worldPos, local);
            if (Math.abs(local.x) <= b.hx && Math.abs(local.y) <= b.hy && Math.abs(local.z) <= b.hz) {
              inside = true;
              break;
            }
          }
        }
        if (inside) insideIndices.push(i);
      }

      if (complement) {
        const insideSet = new Set(insideIndices);
        for (let i = 0; i < numSplats; i++) {
          if (!insideSet.has(i)) union.add(i);
        }
      } else {
        insideIndices.forEach((i) => union.add(i));
      }
    }
    return union;
  }

  _getErasedVolumesBucket(sequenceId) {
    if (!sequenceId) return null;
    let bucket = this.erasedVolumesBySequenceId.get(sequenceId);
    if (!bucket) {
      bucket = { batches: [] };
      this.erasedVolumesBySequenceId.set(sequenceId, bucket);
    }
    if (!Array.isArray(bucket.batches)) {
      bucket.batches = (bucket.spheres?.length || bucket.boxes?.length)
        ? [{ spheres: bucket.spheres || [], boxes: bucket.boxes || [], complement: false }]
        : [];
      delete bucket.spheres;
      delete bucket.boxes;
    }
    return bucket;
  }

  _getSequenceComplementEnabled(ctxKey) {
    if (!ctxKey) return false;
    return this.sequenceComplementEnabledByKey.get(ctxKey) === true;
  }

  _setSequenceComplementEnabled(ctxKey, enabled) {
    if (!ctxKey) return;
    this.sequenceComplementEnabledByKey.set(ctxKey, !!enabled);
  }

  getSequenceComplementEnabled() {
    const selectedObject = this.viewer?.getSelectedObject?.();
    if (!selectedObject?.isSequence || !selectedObject?.id) return null;
    return this._getSequenceComplementEnabled(selectedObject.id);
  }

  getComplementEnabled() {
    const ctx = this._getSelectionContext();
    if (!ctx?.key) return null;
    const selectedObject = this.viewer?.getSelectedObject?.();
    if (selectedObject?.isSequence) {
      return this._getSequenceComplementEnabled(ctx.key);
    }
    return this.pendingComplementErase === true && this.pendingComplementEraseKey === ctx.key;
  }

  hasSelectedPoints() {
    if (this.viewer?.getSelectedObject?.() == null) return false;
    const ctx = this._getSelectionContext();
    if (!ctx?.key) return false;
    if (ctx.isMultiFile && ctx.entities?.length) {
      const m = this._getSelectionMapForContext(ctx.key);
      if (!m) return false;
      for (const e of ctx.entities) {
        const set = m.get(this._getGsplatKey(e));
        if (set && set.size > 0) return true;
      }
      return false;
    }
    const gsplatEntity = this.getGsplatEntityFromSelection();
    if (!gsplatEntity) return false;
    const set = this._getSelectedSet(ctx.key, gsplatEntity);
    return set != null && set.size > 0;
  }

  _getColorComponents(colorTexture, pixels) {
    let components = 4;
    if (colorTexture?.width && colorTexture?.height && pixels?.length) {
      components = Math.max(1, Math.round(pixels.length / (colorTexture.width * colorTexture.height)));
    }
    return components;
  }

  _setSelectionHighlightForEntity(gsplatEntity, prevSet, nextSet) {
    if (!gsplatEntity?.gsplat) return;
    const instance = gsplatEntity.gsplat?.instance;
    const resource = instance?.resource;
    if (!resource) return;

    const gsplatData = resource.gsplatData;
    if (!gsplatData?.elements?.length) return;

    const colorTexture = resource.colorTexture;
    if (!colorTexture) return;

    try {
      const pixels = colorTexture.lock();
      if (!pixels) {
        colorTexture.unlock();
        return;
      }

      const components = this._getColorComponents(colorTexture, pixels);
      const orig = this._getOriginalPixelsForEntity(gsplatEntity, pixels);
      if (!this.originalPixels) this.originalPixels = orig;
      if (!orig) {
        colorTexture.unlock();
        return;
      }

      const isFloat = pixels instanceof Float32Array;
      const isHalfFloat = pixels instanceof Uint16Array;
      const HALF_ONE = 0x3c00;
      const HALF_ZERO = 0x0000;

      let yellow;
      if (isFloat) {
        yellow = components >= 3 ? [1.0, 1.0, 0.0] : [1.0];
      } else if (isHalfFloat) {
        yellow = components >= 3 ? [HALF_ONE, HALF_ONE, HALF_ZERO] : [HALF_ONE];
      } else {
        yellow = components >= 3 ? [255, 255, 0] : [255];
      }

      const erasedSet = this._getErasedIndicesForEntity(gsplatEntity);
      const prev = prevSet instanceof Set ? prevSet : new Set(prevSet || []);
      const next = nextSet instanceof Set ? nextSet : new Set(nextSet || []);

      for (const idx of prev) {
        if (idx >= 0 && idx < gsplatData.numSplats) {
          const pixelOffset = idx * components;
          if (pixelOffset + (components - 1) < pixels.length && pixelOffset + (components - 1) < orig.length) {
            pixels[pixelOffset + 0] = orig[pixelOffset + 0];
            if (components > 1) pixels[pixelOffset + 1] = orig[pixelOffset + 1];
            if (components > 2) pixels[pixelOffset + 2] = orig[pixelOffset + 2];
          }
        }
      }

      for (const idx of next) {
        if (erasedSet.has(idx)) continue;
        if (idx >= 0 && idx < gsplatData.numSplats) {
          const pixelOffset = idx * components;
          if (pixelOffset + (components - 1) < pixels.length) {
            pixels[pixelOffset + 0] = yellow[0];
            if (components > 1) pixels[pixelOffset + 1] = yellow[1] ?? yellow[0];
            if (components > 2) pixels[pixelOffset + 2] = yellow[2] ?? yellow[0];
          }
        }
      }

      colorTexture.unlock();

      if (instance.mesh) {
        instance.mesh.dirtyBound = true;
      }
    } catch (e) {}
  }

  _setMultiFileSelectionFromIndices(ctxKey, gsplatEntity, indices, op) {
    const prevSet = this._getSelectedSet(ctxKey, gsplatEntity);
    const erasedSet = this._getErasedIndicesForEntity(gsplatEntity);

    let nextSet;
    if (op === 'add') {
      nextSet = new Set(prevSet);
      for (const idx of indices) {
        if (!erasedSet.has(idx)) nextSet.add(idx);
      }
    } else {
      nextSet = new Set(indices.filter(i => !erasedSet.has(i)));
    }

    this._setSelectedSet(ctxKey, gsplatEntity, nextSet);
    this._setSelectionHighlightForEntity(gsplatEntity, prevSet, nextSet);

    const activeEntity = this.getGsplatEntityFromSelection();
    if (activeEntity && this._getGsplatKey(activeEntity) === this._getGsplatKey(gsplatEntity)) {
      this.lastSelectedIndices = [...nextSet];
    }
  }

  _clearMultiFileSelection(ctx) {
    const m = this._getSelectionMapForContext(ctx?.key);
    if (!m) return;
    for (const gsplatEntity of ctx.entities || []) {
      const eKey = this._getGsplatKey(gsplatEntity);
      const prevSet = m.get(eKey) || new Set();
      if (prevSet.size > 0) {
        this._setSelectionHighlightForEntity(gsplatEntity, prevSet, new Set());
      }
      m.set(eKey, new Set());
    }
    this.lastSelectedIndices = [];
  }

  _getOriginalPixelsForEntity(gsplatEntity, pixels) {
    const key = this._getGsplatKey(gsplatEntity);
    if (!key) return this.originalPixels;
    
    let orig = this.originalPixelsByKey.get(key);
    if (orig) return orig;
    if (pixels) {
      try {
        orig = pixels.slice ? pixels.slice() : new pixels.constructor(pixels);
        this.originalPixelsByKey.set(key, orig);
      } catch (e) {}
    }
    return orig || this.originalPixels;
  }

  _ensureBaseColorCache(gsplatEntity) {
    if (!gsplatEntity?.gsplat) return;
    const key = this._getGsplatKey(gsplatEntity);
    if (!key) return;
    if (this.originalPixelsByKey.has(key)) return;
    
    const instance = gsplatEntity.gsplat.instance;
    const resource = instance?.resource;
    if (!resource) return;
    
    const colorTexture = resource.colorTexture;
    if (!colorTexture) return;
    
    try {
      const pixels = colorTexture.lock();
      if (pixels) {
        const orig = pixels.slice ? pixels.slice() : new pixels.constructor(pixels);
        this.originalPixelsByKey.set(key, orig);
        if (!this.originalPixels) this.originalPixels = orig;
      }
      colorTexture.unlock();
    } catch (e) {}
  }

  _getSelectionMapForContext(ctxKey) {
    if (!ctxKey) return null;
    let m = this.selectedIndicesByContextKey.get(ctxKey);
    if (!m) {
      m = new Map();
      this.selectedIndicesByContextKey.set(ctxKey, m);
    }
    return m;
  }

  _getSelectedSet(ctxKey, gsplatEntity) {
    const m = this._getSelectionMapForContext(ctxKey);
    const eKey = this._getGsplatKey(gsplatEntity);
    if (!m || !eKey) return new Set();
    let set = m.get(eKey);
    if (!set) {
      set = new Set();
      m.set(eKey, set);
    }
    return set;
  }

  _setSelectedSet(ctxKey, gsplatEntity, set) {
    const m = this._getSelectionMapForContext(ctxKey);
    const eKey = this._getGsplatKey(gsplatEntity);
    if (!m || !eKey) return;
    m.set(eKey, set instanceof Set ? set : new Set(set || []));
  }

  _applySelectionHighlightForEntity(gsplatEntity, nextSet) {
    if (!gsplatEntity?.gsplat) return;

    const instance = gsplatEntity.gsplat?.instance;
    const resource = instance?.resource;
    if (!resource) return;

    const gsplatData = resource.gsplatData;
    if (!gsplatData?.elements?.length) return;

    const colorTexture = resource.colorTexture;
    if (!colorTexture) return;

    try {
      const pixels = colorTexture.lock();
      if (!pixels) {
        colorTexture.unlock();
        return;
      }

      const components = this._getColorComponents(colorTexture, pixels);

      const orig = this._getOriginalPixelsForEntity(gsplatEntity, pixels);
      if (!this.originalPixels) this.originalPixels = orig;

      const isFloat = pixels instanceof Float32Array;
      const isHalfFloat = pixels instanceof Uint16Array;
      const HALF_ONE = 0x3c00;
      const HALF_ZERO = 0x0000;

      let yellow;
      if (isFloat) {
        yellow = components >= 4 ? [1.0, 1.0, 0.0, 1.0] : [1.0, 1.0, 0.0];
      } else if (isHalfFloat) {
        yellow = components >= 4 ? [HALF_ONE, HALF_ONE, HALF_ZERO, HALF_ONE] : [HALF_ONE, HALF_ONE, HALF_ZERO];
      } else {
        yellow = components >= 4 ? [255, 255, 0, 255] : [255, 255, 0];
      }

      if (!orig) {
        colorTexture.unlock();
        return;
      }

      const erasedSet = this._getErasedIndicesForEntity(gsplatEntity);
      const restoreIndices = [];
      for (let i = 0; i < gsplatData.numSplats; i++) {
      }
      for (let idx = 0; idx < gsplatData.numSplats; idx++) {}

      colorTexture.unlock();

      if (instance.mesh) {
        instance.mesh.dirtyBound = true;
      }
    } catch (e) {}
  }

  _getSelectionContext() {
    const selectedObject = this.viewer?.getSelectedObject?.();
    if (selectedObject?.isSequence && selectedObject?.id) {
      const key = selectedObject.id;
      const entities = selectedObject.entity ? [selectedObject.entity] : [];
      if (this._activeSelectionContextKey !== key) {
        this._activeSelectionContextKey = key;
        this.pendingComplementErase = false;
        this.pendingComplementEraseKey = null;
        this.lastSelectedIndices = [];
      }
      return { key, isMultiFile: false, isSequence: true, entities, selectedObject };
    }
    if (selectedObject?.isMultiFile && selectedObject?.id && Array.isArray(selectedObject.files)) {
      const entities = selectedObject.files.map(f => f?.entity).filter(Boolean);
      const key = selectedObject.id;
      if (this._activeSelectionContextKey !== key) {
        this._activeSelectionContextKey = key;
        this.pendingComplementErase = false;
        this.pendingComplementEraseKey = null;
        this.lastSelectedIndices = [];
      }
      return { key, isMultiFile: true, entities, selectedObject };
    }

    const gsplatEntity = this.getGsplatEntityFromSelection();
    const key = this._getGsplatKey(gsplatEntity);
    if (this._activeSelectionContextKey !== key) {
      this._activeSelectionContextKey = key;
      this.pendingComplementErase = false;
      this.pendingComplementEraseKey = null;
      this.lastSelectedIndices = [];
    }
    return { key, isMultiFile: false, entities: gsplatEntity ? [gsplatEntity] : [], selectedObject };
  }

  _getGsplatKey(gsplatEntity) {
    if (!gsplatEntity) return null;
    return gsplatEntity.getGuid?.() || gsplatEntity._guid || gsplatEntity.name || String(gsplatEntity);
  }

  _getErasedIndicesForEntity(gsplatEntity) {
    const selectedObject = this.viewer?.getSelectedObject?.();
    if (selectedObject?.isSequence && selectedObject?.entity === gsplatEntity && selectedObject?.id) {
      const bucket = this.erasedVolumesBySequenceId.get(selectedObject.id);
      if (bucket?.batches?.length > 0) {
        return this._getErasedIndicesFromBatches(gsplatEntity, bucket.batches);
      }
      return new Set();
    }
    const key = this._getGsplatKey(gsplatEntity);
    if (!key) return new Set();
    let set = this.erasedIndicesByKey.get(key);
    if (!set) {
      set = new Set();
      this.erasedIndicesByKey.set(key, set);
    }
    return set;
  }

  _setErasedIndicesForEntity(gsplatEntity, set) {
    const key = this._getGsplatKey(gsplatEntity);
    if (!key) return;
    this.erasedIndicesByKey.set(key, set instanceof Set ? set : new Set(set || []));
  }

  restoreRgbaForIndices(gsplatEntity, indices) {
    if (!gsplatEntity?.gsplat || !indices?.length) return;
    const instance = gsplatEntity.gsplat.instance;
    const resource = instance?.resource;
    if (!resource) return;
    const colorTexture = resource.colorTexture;
    if (!colorTexture) return;
    try {
      const pixels = colorTexture.lock();
      if (!pixels) {
        colorTexture.unlock();
        return;
      }
      const orig = this._getOriginalPixelsForEntity(gsplatEntity, pixels);
      if (!orig) {
        colorTexture.unlock();
        return;
      }
      const components = this._getColorComponents(colorTexture, pixels);
      for (const idx of indices) {
        if (idx >= 0 && idx < (resource?.gsplatData?.numSplats || 0)) {
          const pixelOffset = idx * components;
          if (pixelOffset + components <= pixels.length && pixelOffset + components <= orig.length) {
            for (let c = 0; c < components; c++) {
              pixels[pixelOffset + c] = orig[pixelOffset + c];
            }
          }
        }
      }
      colorTexture.unlock();
      if (instance.mesh) instance.mesh.dirtyBound = true;
    } catch (e) {}
  }

  _restoreRgbForIndices(gsplatEntity, indices) {
    if (!gsplatEntity) return;
    const instance = gsplatEntity.gsplat?.instance;
    const resource = instance?.resource;
    if (!resource) return;
    const colorTexture = resource.colorTexture;
    if (!colorTexture || !this.originalPixels) return;
    const gsplatData = resource.gsplatData;
    if (!gsplatData?.elements?.length) return;

    try {
      const pixels = colorTexture.lock();
      if (!pixels) {
        colorTexture.unlock();
        return;
      }

      let components = 4;
      if (colorTexture.width && colorTexture.height && pixels?.length) {
        components = Math.max(1, Math.round(pixels.length / (colorTexture.width * colorTexture.height)));
      }

      for (const idx of indices) {
        if (idx >= 0 && idx < gsplatData.numSplats) {
          const pixelOffset = idx * components;
          if (pixelOffset + (components - 1) < pixels.length && pixelOffset + (components - 1) < this.originalPixels.length) {
            pixels[pixelOffset + 0] = this.originalPixels[pixelOffset + 0];
            if (components > 1) pixels[pixelOffset + 1] = this.originalPixels[pixelOffset + 1];
            if (components > 2) pixels[pixelOffset + 2] = this.originalPixels[pixelOffset + 2];
          }
        }
      }

      colorTexture.unlock();

      if (instance.mesh) {
        instance.mesh.dirtyBound = true;
      }
    } catch (error) {}
  }

  _getHistoryKey(gsplatEntity) {
    const ctx = this._getSelectionContext();
    return ctx.key;
  }

  _getHistoryForEntity(gsplatEntity) {
    const key = this._getHistoryKey(gsplatEntity);
    if (!key) return null;
    let h = this.histories.get(key);
    if (!h) {
      h = new HistoryManager(this);
      this.histories.set(key, h);
    }
    return h;
  }

  _showErasingOverlay(show) {
    const overlay = window.__loadingOverlayEl;
    const bar = window.__loadingProgressBarEl;
    const text = window.__loadingPercentEl;
    if (!overlay) return;
    if (show) {
      overlay.classList.add('is-visible');
      overlay.classList.add('is-erasing');
      if (bar) bar.style.width = '100%';
      if (text) text.textContent = 'Erasing...';
      overlay.setAttribute('aria-hidden', 'false');
    } else {
      overlay.classList.remove('is-visible');
      overlay.classList.remove('is-erasing');
      overlay.setAttribute('aria-hidden', 'true');
    }
  }

  _collectIndicesInActiveVolume(gsplatEntity, complement = false) {
    const pc = window.pc;
    if (!pc) return [];
    const volumeEntity = window.spawnedWireObject;
    if (!volumeEntity || !gsplatEntity?.gsplat) return [];

    const instance = gsplatEntity.gsplat?.instance;
    const resource = instance?.resource;
    if (!resource) return [];

    const centers = resource.centers;
    const count = resource?.gsplatData?.numSplats ?? (centers ? Math.floor(centers.length / 3) : 0);
    if (!centers || !count) return [];

    const wt = gsplatEntity.getWorldTransform();
    const tmp = new pc.Vec3();

    const erasedSet = this._getErasedIndicesForEntity(gsplatEntity);

    if (volumeEntity.name === 'WireSphere') {
      const center = volumeEntity.getPosition();
      const baseRadius = volumeEntity.__wireRadius ?? 1;
      const scale = volumeEntity.getLocalScale ? volumeEntity.getLocalScale() : { x: 1, y: 1, z: 1 };
      const radius = baseRadius * (scale.x ?? 1);
      const r2 = radius * radius;
      const indices = [];
      for (let i = 0; i < count; i++) {
        tmp.set(centers[i * 3], centers[i * 3 + 1], centers[i * 3 + 2]);
        wt.transformPoint(tmp, tmp);
        const dx = tmp.x - center.x;
        const dy = tmp.y - center.y;
        const dz = tmp.z - center.z;
        const inside = (dx * dx + dy * dy + dz * dz <= r2);
        const picked = complement ? !inside : inside;
        if (picked && !erasedSet.has(i)) indices.push(i);
      }
      return indices;
    }

    if (volumeEntity.name === 'WireBox') {
      const local = new pc.Vec3();
      const inv = new pc.Mat4();
      inv.copy(volumeEntity.getWorldTransform()).invert();
      const s = volumeEntity.getLocalScale ? volumeEntity.getLocalScale() : { x: 1, y: 1, z: 1 };
      const hx = Math.abs(s.x ?? 1) / 2;
      const hy = Math.abs(s.y ?? 1) / 2;
      const hz = Math.abs(s.z ?? 1) / 2;
      const indices = [];
      for (let i = 0; i < count; i++) {
        tmp.set(centers[i * 3], centers[i * 3 + 1], centers[i * 3 + 2]);
        wt.transformPoint(tmp, tmp);
        inv.transformPoint(tmp, local);
        const inside = (Math.abs(local.x) <= hx && Math.abs(local.y) <= hy && Math.abs(local.z) <= hz);
        const picked = complement ? !inside : inside;
        if (picked && !erasedSet.has(i)) indices.push(i);
      }
      return indices;
    }

    return [];
  }

  addPointColors(indices) {
    const gsplatEntity = this.getGsplatEntityFromSelection();
    if (!gsplatEntity) return;

    const ctx = this._getSelectionContext();
    if (!ctx?.key) return;

    if (typeof this._ensureBaseColorCache === 'function') {
      this._ensureBaseColorCache(gsplatEntity);
    }

    const instance = gsplatEntity.gsplat?.instance;
    const resource = instance?.resource;
    if (!resource) return;

    const gsplatData = resource.gsplatData;
    if (!gsplatData?.elements?.length) return;

    const colorTexture = resource.colorTexture;
    if (!colorTexture) return;

    const prevSet = this._getSelectedSet(ctx.key, gsplatEntity);
    const erasedSet = this._getErasedIndicesForEntity(gsplatEntity);
    const nextSet = new Set(prevSet);
    for (const idx of indices || []) {
      if (erasedSet.has(idx)) continue;
      if (idx >= 0 && idx < gsplatData.numSplats) {
        nextSet.add(idx);
      }
    }

    this._setSelectedSet(ctx.key, gsplatEntity, nextSet);
    this._setSelectionHighlightForEntity(gsplatEntity, prevSet, nextSet);
    this.lastSelectedIndices = [...nextSet];
  }

  applyBoxVolumeSelection(op = 'set') {
    const pc = window.pc;
    if (!pc) return;

    const volumeEntity = window.spawnedWireObject;
    if (!volumeEntity || volumeEntity.name !== 'WireBox') return;

    const ctx = this._getSelectionContext();

    if (op === 'set') {
      this._clearAccumulatedVolumes(ctx.key, 'box');
    }

    const bucket = this._getAccumulatedVolumeBucket(ctx.key);
    const blueClone = this._cloneVolumeEntityAsBlue(volumeEntity);
    if (bucket && blueClone) {
      bucket.box.push(blueClone);
    }

    this.refreshSelectionFromAllAccumulatedVolumes();
  }

  applySphereVolumeSelection(op = 'set') {
    const pc = window.pc;
    if (!pc) return;

    const volumeEntity = window.spawnedWireObject;
    if (!volumeEntity || volumeEntity.name !== 'WireSphere') return;

    const ctx = this._getSelectionContext();

    if (op === 'set') {
      this._clearAccumulatedVolumes(ctx.key, 'sphere');
    }

    const bucket = this._getAccumulatedVolumeBucket(ctx.key);
    const blueClone = this._cloneVolumeEntityAsBlue(volumeEntity);
    if (bucket && blueClone) {
      bucket.sphere.push(blueClone);
    }

    this.refreshSelectionFromAllAccumulatedVolumes();
  }

  get brushRadius() {
    return this.brushSelector.getRadius();
  }

  set brushRadius(value) {
    this.brushSelector.setRadius(value);
    if (this.renderer.brushCircle) {
      this.renderer.brushCircle.setAttribute('r', value.toString());
    }
  }

  get floodThreshold() {
    return 0.5;
  }

  set floodThreshold(value) {}

  complementSelection() {
    const gsplatEntity = this.getGsplatEntityFromSelection();
    if (!gsplatEntity || !gsplatEntity.gsplat) return;

    const ctx = this._getSelectionContext();
    const selectedObject = this.viewer?.getSelectedObject?.();
    const isSequence = !!(selectedObject?.isSequence);

    if (isSequence && ctx?.key && window.spawnedWireObject && (window.spawnedWireObject.name === 'WireSphere' || window.spawnedWireObject.name === 'WireBox')) {
      const volumes = this._getAllAccumulatedVolumes(ctx.key);
      const nextComplement = !this._getSequenceComplementEnabled(ctx.key);
      this._setSequenceComplementEnabled(ctx.key, nextComplement);

      if (volumes && volumes.length > 0) {
        const targets = ctx.entities?.length ? ctx.entities : [gsplatEntity];
        for (const e of targets) {
          if (!e?.gsplat) continue;
          const prevSet = this._getSelectedSet(ctx.key, e);
          const indices = this._collectIndicesInVolumeEntities(e, volumes, nextComplement);
          const nextSet = new Set(indices);
          this._setSelectedSet(ctx.key, e, nextSet);
          this._setSelectionHighlightForEntity(e, prevSet, nextSet);
          if (e === gsplatEntity) this.lastSelectedIndices = [...nextSet];
        }
      }
      return;
    }

    if (isSequence && ctx?.key) {
      const inVolumeMode = window.spawnedWireObject && (window.spawnedWireObject.name === 'WireSphere' || window.spawnedWireObject.name === 'WireBox');
      const hasVolumes = inVolumeMode && this._getAllAccumulatedVolumes(ctx.key).length > 0;
      if (!hasVolumes) {
        const next = !this._getSequenceComplementEnabled(ctx.key);
        this._setSequenceComplementEnabled(ctx.key, next);
        return;
      }
    }

    if (!isSequence && !ctx.isMultiFile && ctx?.key) {
      const inVolumeMode = window.spawnedWireObject && (window.spawnedWireObject.name === 'WireSphere' || window.spawnedWireObject.name === 'WireBox');
      const hasVolumes = inVolumeMode && this._getAllAccumulatedVolumes(ctx.key).length > 0;
      const hasSelection = this.lastSelectedIndices && this.lastSelectedIndices.length > 0;
      if (!hasVolumes && !hasSelection) {
        const next = !(this.pendingComplementErase && this.pendingComplementEraseKey === ctx.key);
        this.pendingComplementErase = next;
        this.pendingComplementEraseKey = next ? ctx.key : null;
        return;
      }
    }

    if (window.spawnedWireObject && (window.spawnedWireObject.name === 'WireSphere' || window.spawnedWireObject.name === 'WireBox')) {
      const volumes = this._getAllAccumulatedVolumes(ctx.key);
      if (!volumes || volumes.length === 0) return;

      const wasComplement = this.pendingComplementErase === true && this.pendingComplementEraseKey === ctx.key;
      const complement = !wasComplement;

      const targets = ctx.isMultiFile ? (ctx.entities || []) : [gsplatEntity];
      for (const e of targets) {
        if (!e?.gsplat) continue;
        const prevSet = this._getSelectedSet(ctx.key, e);
        const indices = this._collectIndicesInVolumeEntities(e, volumes, complement);
        const nextSet = new Set(indices);
        this._setSelectedSet(ctx.key, e, nextSet);
        this._setSelectionHighlightForEntity(e, prevSet, nextSet);
        const activeEntity = this.getGsplatEntityFromSelection();
        if (activeEntity && this._getGsplatKey(activeEntity) === this._getGsplatKey(e)) {
          this.lastSelectedIndices = [...nextSet];
        }
      }
      this.pendingComplementErase = complement;
      this.pendingComplementEraseKey = complement ? ctx.key : null;
      return;
    }

    if (ctx.isMultiFile) {
      for (const e of ctx.entities) {
        if (!e?.gsplat) continue;
        const instance = e.gsplat.instance;
        const resource = instance?.resource;
        const count = resource?.gsplatData?.numSplats || 0;
        if (!count) continue;

        const prevSet = this._getSelectedSet(ctx.key, e);
        const erasedSet = this._getErasedIndicesForEntity(e);
        const nextSet = new Set();
        for (let i = 0; i < count; i++) {
          if (erasedSet.has(i)) continue;
          if (!prevSet.has(i)) nextSet.add(i);
        }
        this._setSelectedSet(ctx.key, e, nextSet);
        this._setSelectionHighlightForEntity(e, prevSet, nextSet);
        const activeEntity = this.getGsplatEntityFromSelection();
        if (activeEntity && this._getGsplatKey(activeEntity) === this._getGsplatKey(e)) {
          this.lastSelectedIndices = [...nextSet];
        }
      }

      this.pendingComplementErase = false;
      this.pendingComplementEraseKey = null;
      return;
    }

    if (!isSequence && window.spawnedWireObject && (window.spawnedWireObject.name === 'WireSphere' || window.spawnedWireObject.name === 'WireBox')) {
      const volumes = this._getAllAccumulatedVolumes(ctx.key);
      const indices = this._collectIndicesInVolumeEntities(gsplatEntity, volumes, true);
      if (indices.length === 0) {
        this.restorePointColors();
        this.lastSelectedIndices = [];
        this.pendingComplementErase = false;
        this.pendingComplementEraseKey = null;
        return;
      }
      this.changePointColors(indices);
      this.pendingComplementErase = true;
      this.pendingComplementEraseKey = ctx.key;
      return;
    }

    if (!this.lastSelectedIndices || this.lastSelectedIndices.length === 0) return;

    const wasComplementOn = this.pendingComplementErase === true && this.pendingComplementEraseKey === ctx.key;

    const instance = gsplatEntity.gsplat.instance;
    const resource = instance?.resource;
    if (!resource) return;

    const centers = resource.centers;
    const count = resource?.gsplatData?.numSplats ?? (centers ? Math.floor(centers.length / 3) : 0);
    if (!count) return;

    const colorTexture = resource.colorTexture;
    if (colorTexture) {
      try {
        const pixels = colorTexture.lock();
        if (pixels) {
          let components = 4;
          if (colorTexture.width && colorTexture.height && pixels?.length) {
            components = Math.max(1, Math.round(pixels.length / (colorTexture.width * colorTexture.height)));
          }
          
          const pixelSnapshot = pixels.slice ? pixels.slice() : new pixels.constructor(pixels);
          
          colorTexture.unlock();

          const excludeSet = new Set(this.lastSelectedIndices);
          const complementIndices = [];
          const erasedSet = this._getErasedIndicesForEntity(gsplatEntity);
          for (let i = 0; i < count; i++) {
            if (!excludeSet.has(i) && !erasedSet.has(i)) {
              complementIndices.push(i);
            }
          }

          if (complementIndices.length > 0) {
            this.changePointColors(complementIndices);
          } else {
            this.restorePointColors();
          }

          this.pendingComplementErase = !wasComplementOn;
          this.pendingComplementEraseKey = this.pendingComplementErase ? ctx.key : null;
        }
      } catch (err) {}
    }
  }

  async eraseSelection() {
    const ctx = this._getSelectionContext();

    if (ctx.isMultiFile) {
      const selectionMap = this._getSelectionMapForContext(ctx.key);
      if (!selectionMap) return;

      this._showErasingOverlay(true);
      await new Promise(r => requestAnimationFrame(r));

      const items = [];
      for (const gsplatEntity of ctx.entities) {
        const eKey = this._getGsplatKey(gsplatEntity);
        const selectedSet = selectionMap.get(eKey) || new Set();
        const indices = [...selectedSet];
        if (indices.length === 0) continue;

        const erasedSet = this._getErasedIndicesForEntity(gsplatEntity);
        const previousErasedIndices = new Set(erasedSet);

        const instance = gsplatEntity.gsplat.instance;
        const resource = instance?.resource;
        const colorTexture = resource?.colorTexture;
        if (!colorTexture) continue;

        try {
          this._restoreRgbForIndices(gsplatEntity, indices);

          const pixels = colorTexture.lock();
          if (!pixels) {
            colorTexture.unlock();
            continue;
          }

          const components = this._getColorComponents(colorTexture, pixels);

          const isFloat = pixels instanceof Float32Array;
          const isHalfFloat = pixels instanceof Uint16Array;
          const HALF_ZERO = 0x0000;

          for (const idx of indices) {
            if (idx >= 0 && idx < (resource?.gsplatData?.numSplats || 0)) {
              const pixelOffset = idx * components;
              if (pixelOffset + (components - 1) < pixels.length) {
                if (components >= 4) {
                  if (isFloat) pixels[pixelOffset + 3] = 0.0;
                  else if (isHalfFloat) pixels[pixelOffset + 3] = HALF_ZERO;
                  else pixels[pixelOffset + 3] = 0;
                }
              }
            }
          }

          colorTexture.unlock();

          for (const idx of indices) {
            erasedSet.add(idx);
          }
          this._setErasedIndicesForEntity(gsplatEntity, erasedSet);

          if (instance.mesh) {
            instance.mesh.dirtyBound = true;
          }

          items.push({ gsplatEntity, previousErasedIndices, erasedIndices: indices });
        } catch (err) {}
      }

      this._clearMultiFileSelection(ctx);

      if (items.length > 0) {
        const task = new MultiEraseTask(items);
        const history = this._getHistoryForEntity(null);
        if (history) history.addTask(task);
      }

      this.pendingComplementErase = false;
      this.pendingComplementEraseKey = null;

      this._showErasingOverlay(false);
      if (this.detailsPanel) this.detailsPanel.updateUndoRedoButtons();
      return;
    }

    const gsplatEntity = this.getGsplatEntityFromSelection();
    if (!gsplatEntity || !gsplatEntity.gsplat) return;

    const selectedObject = this.viewer?.getSelectedObject?.();
    const isSequence = !!(selectedObject?.isSequence);

    let indicesToErase = null;
    if (ctx?.key && window.spawnedWireObject && (window.spawnedWireObject.name === 'WireSphere' || window.spawnedWireObject.name === 'WireBox')) {
      const allVolumes = this._getAllAccumulatedVolumes(ctx.key);
      if (allVolumes.length > 0) {
        const complement = isSequence ? this._getSequenceComplementEnabled(ctx.key) : (this.pendingComplementErase === true && this.pendingComplementEraseKey === ctx.key);
        indicesToErase = this._collectIndicesInVolumeEntities(gsplatEntity, allVolumes, complement);
      }
    }
    if (!indicesToErase || indicesToErase.length === 0) {
      const storedSet = this._getSelectedSet(ctx.key, gsplatEntity);
      indicesToErase = (storedSet && storedSet.size > 0) ? [...storedSet] : null;
      if ((!indicesToErase || indicesToErase.length === 0) && this.lastSelectedIndices && this.lastSelectedIndices.length > 0) {
        indicesToErase = [...this.lastSelectedIndices];
      }
    }
    if (!indicesToErase || indicesToErase.length === 0) return;

    const instance = gsplatEntity.gsplat.instance;
    const resource = instance?.resource;
    if (!resource) return;

    const colorTexture = resource.colorTexture;
    if (!colorTexture) return;

    try {
      const erasedSet = this._getErasedIndicesForEntity(gsplatEntity);
      const previousErasedIndices = new Set(erasedSet);
      const erasedIndices = indicesToErase;

      this._restoreRgbForIndices(gsplatEntity, erasedIndices);

      const pixels = colorTexture.lock();
      if (!pixels) {
        colorTexture.unlock();
        return;
      }

      let components = 4;
      if (colorTexture.width && colorTexture.height && pixels?.length) {
        components = Math.max(1, Math.round(pixels.length / (colorTexture.width * colorTexture.height)));
      }

      const isFloat = pixels instanceof Float32Array;
      const isHalfFloat = pixels instanceof Uint16Array;
      const HALF_ZERO = 0x0000;

      for (const idx of erasedIndices) {
        if (idx >= 0 && idx < (resource?.gsplatData?.numSplats || 0)) {
          const pixelOffset = idx * components;
          if (pixelOffset + (components - 1) < pixels.length) {
            if (components >= 4) {
              if (isFloat) {
                pixels[pixelOffset + 3] = 0.0;
              } else if (isHalfFloat) {
                pixels[pixelOffset + 3] = HALF_ZERO;
              } else {
                pixels[pixelOffset + 3] = 0;
              }
            }
          }
        }
      }

      colorTexture.unlock();

      if (!isSequence) {
        for (const idx of erasedIndices) {
          erasedSet.add(idx);
        }
        this._setErasedIndicesForEntity(gsplatEntity, erasedSet);
      }

      let sequenceEraseSnapshot = null;
      if (isSequence && ctx.key && (erasedIndices?.length > 0)) {
        const bucket = this._getErasedVolumesBucket(ctx.key);
        const sphereVolumes = this._getAccumulatedVolumes(ctx.key, 'sphere');
        const boxVolumes = this._getAccumulatedVolumes(ctx.key, 'box');
        const allVolumes = [...(sphereVolumes || []), ...(boxVolumes || [])];
        if (allVolumes.length > 0) {
          const snap = this._snapshotVolumeEntities(allVolumes);
          const complement = this._getSequenceComplementEnabled(ctx.key);
          sequenceEraseSnapshot = {
            spheres: [...snap.spheres],
            boxes: [...snap.boxes],
            complement: !!complement
          };
          bucket.batches.push(sequenceEraseSnapshot);
        }
      }

      this._setSelectedSet(ctx.key, gsplatEntity, new Set());
      this.lastSelectedIndices = [];

      this.pendingComplementErase = false;
      this.pendingComplementEraseKey = null;

      const history = this._getHistoryForEntity(gsplatEntity);
      if (history) {
        if (isSequence && ctx.key && sequenceEraseSnapshot && (sequenceEraseSnapshot.spheres?.length > 0 || sequenceEraseSnapshot.boxes?.length > 0)) {
          history.addTask(new SequenceEraseTask(ctx.key, sequenceEraseSnapshot));
        } else {
          history.addTask(new EraseTask(previousErasedIndices, erasedIndices));
        }
      }

      if (this.detailsPanel) {
        this.detailsPanel.updateUndoRedoButtons();
      }

      if (instance.mesh) {
        instance.mesh.dirtyBound = true;
      }
    } catch (err) {}
  }

  reapplySequenceErasedVolumes(obj) {
    if (!obj?.isSequence || !obj?.entity?.gsplat || !obj?.id) return;
    const bucket = this.erasedVolumesBySequenceId.get(obj.id);
    if (!bucket?.batches?.length) return;

    const gsplatEntity = obj.entity;
    const indicesSet = this._getErasedIndicesFromBatches(gsplatEntity, bucket.batches);
    const indices = Array.from(indicesSet);
    if (indices.length === 0) return;

    this._ensureBaseColorCache(gsplatEntity);
    const instance = gsplatEntity.gsplat?.instance;
    const resource = instance?.resource;
    const colorTexture = resource?.colorTexture;
    if (!colorTexture) return;

    try {
      const pixels = colorTexture.lock();
      if (!pixels) {
        colorTexture.unlock();
        return;
      }
      const components = this._getColorComponents(colorTexture, pixels);
      const isFloat = pixels instanceof Float32Array;
      const isHalfFloat = pixels instanceof Uint16Array;
      const HALF_ZERO = 0x0000;
      for (const idx of indices) {
        if (idx >= 0 && idx < (resource?.gsplatData?.numSplats || 0)) {
          const pixelOffset = idx * components;
          if (pixelOffset + (components - 1) < pixels.length && components >= 4) {
            if (isFloat) pixels[pixelOffset + 3] = 0.0;
            else if (isHalfFloat) pixels[pixelOffset + 3] = HALF_ZERO;
            else pixels[pixelOffset + 3] = 0;
          }
        }
      }
      colorTexture.unlock();
      if (instance.mesh) instance.mesh.dirtyBound = true;
    } catch (err) {}
  }

  getGsplatEntityFromSelection() {
    const selectedObject = this.viewer?.getSelectedObject?.();

    if (selectedObject?.isSequence && selectedObject?.entity?.gsplat) {
      return selectedObject.entity;
    }
    if (selectedObject?.isMultiFile && Array.isArray(selectedObject.files)) {
      const enabledEntity = selectedObject.files.find(f => f?.entity?.enabled)?.entity;
      if (enabledEntity?.gsplat) return enabledEntity;
      const firstEntity = selectedObject.files[0]?.entity;
      if (firstEntity?.gsplat) return firstEntity;
    }

    let gsplatEntity = selectedObject?.entity || selectedObject;
    if ((!gsplatEntity || !gsplatEntity.gsplat) && this.viewer?.splatRoot) {
      const children = this.viewer.splatRoot.children || [];
      for (let i = 0; i < children.length; i++) {
        if (children[i]?.gsplat) {
          gsplatEntity = children[i];
          break;
        }
      }
    }
    return gsplatEntity;
  }

  activate(mode) {
    this.clearSelectionHighlight();
    this.mode = mode;
    this.isActive = true;
    this.isTemporarilyDisabled = false;
    
    const ctx = this._getSelectionContext();
    if (ctx.isMultiFile && ctx.entities) {
      for (const entity of ctx.entities) {
        this._ensureBaseColorCache(entity);
      }
    } else {
      const gsplatEntity = this.getGsplatEntityFromSelection();
      if (gsplatEntity) {
        this._ensureBaseColorCache(gsplatEntity);
      }
    }
    
    this.renderer.updateOverlaySize();
    this.renderer.show();
    
    if (this.viewer?.cameraController) {
      this.viewer.cameraController.enabled = false;
    }
    
    document.addEventListener('pointerdown', this.onPointerDown, true);
    document.addEventListener('pointermove', this.onPointerMove, true);
    document.addEventListener('pointerup', this.onPointerUp, true);
    
    if (mode === 'brush') {
      document.addEventListener('wheel', this.onWheel, { capture: true, passive: false });
    }
  }

  deactivate() {
    this.isActive = false;
    this.mode = null;
    this.clearSelectionHighlight();
    this.isTemporarilyDisabled = false;
    
    if (this.dragId !== undefined) {
      document.body.releasePointerCapture(this.dragId);
      this.dragId = undefined;
    }
    
    if (this.viewer?.cameraController) {
      this.viewer.cameraController.enabled = true;
    }
    
    this.renderer.hide();
    
    document.removeEventListener('pointerdown', this.onPointerDown, true);
    document.removeEventListener('pointermove', this.onPointerMove, true);
    document.removeEventListener('pointerup', this.onPointerUp, true);
    document.removeEventListener('wheel', this.onWheel, true);
  }

  temporarilyDisableForRotation() {
    if (!this.isActive || this.isTemporarilyDisabled) return;

    this.isTemporarilyDisabled = true;

    if (this.dragId !== undefined) {
      try {
        document.body.releasePointerCapture(this.dragId);
      } catch (err) {}
      this.dragId = undefined;
    }

    this.renderer.hide();

    document.removeEventListener('pointerdown', this.onPointerDown, true);
    document.removeEventListener('pointermove', this.onPointerMove, true);
    document.removeEventListener('pointerup', this.onPointerUp, true);
    document.removeEventListener('wheel', this.onWheel, true);

    if (this.viewer?.cameraController) {
      this.viewer.cameraController.enabled = true;
    }
  }

  restoreAfterRotation() {
    if (!this.isActive || !this.isTemporarilyDisabled) return;

    this.isTemporarilyDisabled = false;

    if (this.viewer?.cameraController) {
      this.viewer.cameraController.enabled = false;
    }

    this.renderer.updateOverlaySize();
    this.renderer.show();

    document.addEventListener('pointerdown', this.onPointerDown, true);
    document.addEventListener('pointermove', this.onPointerMove, true);
    document.addEventListener('pointerup', this.onPointerUp, true);
    if (this.mode === 'brush') {
      document.addEventListener('wheel', this.onWheel, { capture: true, passive: false });
    }
  }

  saveHistoryState(action = 'selection') {
  }

  undo() {
    this.clearSelectionHighlight();
    const history = this._getHistoryForEntity(null);
    const result = history ? history.undo() : false;
    this.clearSelectionHighlight();
    if (this.detailsPanel) {
      this.detailsPanel.updateUndoRedoButtons();
    }
    return result;
  }

  redo() {
    this.clearSelectionHighlight();
    const history = this._getHistoryForEntity(null);
    const result = history ? history.redo() : false;
    this.clearSelectionHighlight();
    if (this.detailsPanel) {
      this.detailsPanel.updateUndoRedoButtons();
    }
    return result;
  }

  canUndo() {
    const history = this._getHistoryForEntity(null);
    return history ? history.canUndo() : false;
  }

  canRedo() {
    const history = this._getHistoryForEntity(null);
    return history ? history.canRedo() : false;
  }

  clearSelectionHighlight() {
    const ctx = this._getSelectionContext();

    if (ctx.isMultiFile) {
      const selectionMap = this._getSelectionMapForContext(ctx.key);
      if (!selectionMap) return;
      for (const gsplatEntity of ctx.entities) {
        const eKey = this._getGsplatKey(gsplatEntity);
        const prevSet = selectionMap.get(eKey) || new Set();
        if (prevSet.size > 0) {
          this._setSelectionHighlightForEntity(gsplatEntity, prevSet, new Set());
          selectionMap.set(eKey, new Set());
        }
      }
      this.lastSelectedIndices = [];
      return;
    }

    const gsplatEntity = this.getGsplatEntityFromSelection();
    if (!gsplatEntity) return;

    const storedPrevSet = this._getSelectedSet(ctx.key, gsplatEntity);
    const prevSet = (storedPrevSet && storedPrevSet.size > 0)
      ? storedPrevSet
      : (this.lastSelectedIndices.length > 0 ? new Set(this.lastSelectedIndices) : new Set());

    if (prevSet.size === 0) {
      this.lastSelectedIndices = [];
      return;
    }

    this._setSelectedSet(ctx.key, gsplatEntity, new Set());
    this._setSelectionHighlightForEntity(gsplatEntity, prevSet, new Set());
    this.lastSelectedIndices = [];
    return;
  }

  onWheel = (e) => {
    if (this.isTemporarilyDisabled) return;
    if (!this.isActive || this.mode !== 'brush') return;
    if (!this.isOverCanvas(e.clientX, e.clientY)) return;
    if (this.isOverUIWindow(e.clientX, e.clientY)) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const delta = e.deltaY > 0 ? -5 : 5;
    this.brushRadius = this.brushRadius + delta;
    
    if (this.currentMousePos) {
      this.renderer.updateBrushCircle(this.currentMousePos.x, this.currentMousePos.y, this.brushRadius);
    }
    
    if (window.__detailsPanel) {
      window.__detailsPanel.updateBrushRadius(this.brushRadius);
    }
  }

  onPointerDown = (e) => {
    if (this.isTemporarilyDisabled) return;
    if (!this.isOverCanvas(e.clientX, e.clientY) || this.isOverUIWindow(e.clientX, e.clientY)) {
      return;
    }
    
    this.restorePointColors();
    
    if (this.mode === 'brush') {
      this.brushSelector.startSelection();
    }
    
    if (this.dragId === undefined && (e.pointerType === 'mouse' ? e.button === 0 : e.isPrimary)) {
      e.preventDefault();
      e.stopPropagation();
      
      this.dragId = e.pointerId;
      this.dragMoved = false;
      document.body.setPointerCapture(this.dragId);
      
      const rect = this.renderer.eventLayer.getBoundingClientRect();
      this.start.x = this.end.x = e.clientX - rect.left;
      this.start.y = this.end.y = e.clientY - rect.top;
      
      if (this.mode === 'rectangle') {
        this.renderer.updateRect(this.start, this.end);
        this.renderer.showRect();
      }
    }
  }

  onPointerMove = (e) => {
    if (this.isTemporarilyDisabled) return;
    const rect = this.renderer.eventLayer.getBoundingClientRect();
    const canvasX = e.clientX - rect.left;
    const canvasY = e.clientY - rect.top;
    const isOverCanvas = this.isOverCanvas(e.clientX, e.clientY);
    
    if (this.mode === 'brush' && this.isActive) {
      if (isOverCanvas) {
        this.currentMousePos = { x: canvasX, y: canvasY };
        this.renderer.updateBrushCircle(canvasX, canvasY, this.brushRadius);
        this.renderer.showBrushCircle();
      } else {
        this.renderer.hideBrushCircle();
      }
    }
    
    if (e.pointerId === this.dragId) {
      e.preventDefault();
      e.stopPropagation();
      
      this.dragMoved = true;
      this.end.x = canvasX;
      this.end.y = canvasY;
      
      if (this.mode === 'rectangle') {
        this.renderer.updateRect(this.start, this.end);
      } else if (this.mode === 'brush') {
        const gsplatEntity = this.getGsplatEntityFromSelection();
        const indices = this.brushSelector.select(this.end.x, this.end.y, gsplatEntity, (entity) => entity.getWorldTransform());
        if (indices.length > 0) {
          this.changePointColors(indices);
        }
      }
    }
  }

  onPointerUp = (e) => {
    if (this.isTemporarilyDisabled) return;
    if (e.pointerId === this.dragId) {
      e.preventDefault();
      e.stopPropagation();
      
      document.body.releasePointerCapture(this.dragId);
      this.dragId = undefined;
      this.renderer.hideRect();
      
      if (this.dragMoved) {
        if (this.mode === 'rectangle') {
          const selectionRect = {
            minX: Math.min(this.start.x, this.end.x),
            minY: Math.min(this.start.y, this.end.y),
            maxX: Math.max(this.start.x, this.end.x),
            maxY: Math.max(this.start.y, this.end.y)
          };
          
          const gsplatEntity = this.getGsplatEntityFromSelection();
          const indices = this.rectangleSelector.select(selectionRect, gsplatEntity, (entity) => entity.getWorldTransform());
          
          if (indices.length > 0) {
            this.changePointColors(indices);
          } else {
            this.restorePointColors();
          }
        }
      } else {
        this.selectPointAtPosition(this.start.x, this.start.y);
      }
    }
  }

  selectPointAtPosition(canvasX, canvasY) {
    const gsplatEntity = this.getGsplatEntityFromSelection();
    if (!gsplatEntity?.gsplat) return;
    
    const camera = this.viewer.app.root.findByName('MainCamera');
    if (!camera) return;
    
    const instance = gsplatEntity.gsplat?.instance;
    const resource = instance?.resource;
    if (!resource) return;
    
    const centers = resource.centers;
    const count = centers ? Math.floor(centers.length / 3) : 0;
    if (!count) return;
    
    const screenClick = { x: canvasX, y: canvasY };
    
    const canvasRect = this.canvas.getBoundingClientRect();
    const clickThreshold = 10;
    
    const wt = gsplatEntity.getWorldTransform();
    const tmp = new pc.Vec3();
    const screenPos = new pc.Vec3();
    
    let closestIndex = -1;
    let closestDistSq = Infinity;
    
    for (let i = 0; i < count; i++) {
      tmp.set(centers[i * 3], centers[i * 3 + 1], centers[i * 3 + 2]);
      wt.transformPoint(tmp, tmp);
      camera.camera.worldToScreen(tmp, screenPos);
      
      if (screenPos.z < 0) continue;
      
      const dx = screenPos.x - screenClick.x;
      const dy = screenPos.y - screenClick.y;
      const distSq = dx * dx + dy * dy;
      
      if (distSq < closestDistSq) {
        closestDistSq = distSq;
        closestIndex = i;
      }
    }
    
    if (closestIndex !== -1 && closestDistSq <= clickThreshold * clickThreshold) {
      this.changePointColors([closestIndex]);
    }
  }

  isOverUIWindow(clientX, clientY) {
    const originalEventLayerPointerEvents = this.renderer.eventLayer.style.pointerEvents;
    const originalSvgPointerEvents = this.renderer.svg.style.pointerEvents;
    
    this.renderer.eventLayer.style.pointerEvents = 'none';
    this.renderer.svg.style.pointerEvents = 'none';
    
    const elementBelow = document.elementFromPoint(clientX, clientY);
    
    this.renderer.eventLayer.style.pointerEvents = originalEventLayerPointerEvents;
    this.renderer.svg.style.pointerEvents = originalSvgPointerEvents;
    
    if (!elementBelow) return false;
    
    const isUIWindow = 
      elementBelow.closest('.inspector-panel') ||
      elementBelow.closest('.gizmo-window') ||
      elementBelow.closest('.seg-window') ||
      elementBelow.closest('.object-details-panel') ||
      elementBelow.closest('[class*="window"]') ||
      elementBelow.closest('[class*="panel"]') ||
      elementBelow.closest('[class*="modal"]');
    
    return !!isUIWindow;
  }

  isOverCanvas(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    return clientX >= rect.left && clientX <= rect.right && 
           clientY >= rect.top && clientY <= rect.bottom;
  }

  changePointColors(indices) {
    const gsplatEntity = this.getGsplatEntityFromSelection();
    if (!gsplatEntity) return;

    const ctx = this._getSelectionContext();
    if (!ctx?.key) return;

    if (typeof this._ensureBaseColorCache === 'function') {
      this._ensureBaseColorCache(gsplatEntity);
    }

    const instance = gsplatEntity.gsplat?.instance;
    const resource = instance?.resource;
    if (!resource) return;

    const gsplatData = resource.gsplatData;
    if (!gsplatData?.elements?.length) return;

    const prevSet = this._getSelectedSet(ctx.key, gsplatEntity);
    const erasedSet = this._getErasedIndicesForEntity(gsplatEntity);

    const nextSet = new Set();
    for (const idx of indices || []) {
      if (erasedSet.has(idx)) continue;
      if (idx >= 0 && idx < gsplatData.numSplats) {
        nextSet.add(idx);
      }
    }

    this._setSelectedSet(ctx.key, gsplatEntity, nextSet);
    this._setSelectionHighlightForEntity(gsplatEntity, prevSet, nextSet);
    this.lastSelectedIndices = [...nextSet];
    this.detailsPanel?.updateEraserComplementDisabledState?.();
  }

  restorePointColors() {
    const gsplatEntity = this.getGsplatEntityFromSelection();
    if (!gsplatEntity) return;

    const ctx = this._getSelectionContext();
    if (!ctx?.key) return;

    const prevSet = this._getSelectedSet(ctx.key, gsplatEntity);
    if (!prevSet || prevSet.size === 0) {
      this.lastSelectedIndices = [];
      this.detailsPanel?.updateEraserComplementDisabledState?.();
      return;
    }

    this._setSelectedSet(ctx.key, gsplatEntity, new Set());
    this._setSelectionHighlightForEntity(gsplatEntity, prevSet, new Set());
    this.lastSelectedIndices = [];
    this.detailsPanel?.updateEraserComplementDisabledState?.();
  }

  clearSelection() {
    const gsplatEntity = this.getGsplatEntityFromSelection();
    if (!gsplatEntity) return;
    
    const instance = gsplatEntity.gsplat?.instance;
    const resource = instance?.resource;
    if (!resource) return;
    
    const colorTexture = resource.colorTexture;
    if (!colorTexture || !this.originalPixels) return;

    try {
      const pixels = colorTexture.lock();
      if (pixels && this.originalPixels) {
        for (let i = 0; i < Math.min(pixels.length, this.originalPixels.length); i++) {
          pixels[i] = this.originalPixels[i];
        }
      }
      this.lastSelectedIndices = [];
    } catch (error) {}
    finally {
      try { colorTexture.unlock(); } catch (_) {}
    }
  }

  destroy() {
    this.deactivate();
    this.renderer.destroy();
    this.originalPixels = null;
    this.lastSelectedIndices = [];
  }
}
