/** Selection/erase/complement tasks for undo/redo. */
export class SelectionTask {
  constructor(name, pixelData, components) {
    this.name = name;
    this.pixelData = pixelData;
    this.components = components;
  }

  execute(selectionTool) {}

  undo(selectionTool) {
    this.restorePixels(selectionTool);
  }

  redo(selectionTool) {
    this.execute(selectionTool);
  }

  restorePixels(selectionTool, gsplatEntity = null) {
    if (!gsplatEntity) {
      gsplatEntity = selectionTool.getGsplatEntityFromSelection();
    }
    if (!gsplatEntity?.gsplat) return;

    const instance = gsplatEntity.gsplat.instance;
    const colorTexture = instance?.resource?.colorTexture;
    if (!colorTexture) return;

    try {
      const pixels = colorTexture.lock();
      if (!pixels) {
        colorTexture.unlock();
        return;
      }

      for (let i = 0; i < Math.min(pixels.length, this.pixelData.length); i++) {
        pixels[i] = this.pixelData[i];
      }

      colorTexture.unlock();
      selectionTool.lastSelectedIndices = [];

      const mesh = instance.mesh;
      if (mesh) {
        mesh.dirtyBound = true;
      }
    } catch (err) {}
  }
}

export class MultiEraseTask extends SelectionTask {
  constructor(items) {
    super('erase_multi', null, 0);
    this.items = Array.isArray(items) ? items : [];
  }

  undo(selectionTool) {
    for (const item of this.items) {
      const gsplatEntity = item?.gsplatEntity;
      if (!gsplatEntity?.gsplat) continue;

      const instance = gsplatEntity.gsplat.instance;
      const resource = instance?.resource;
      if (!resource) continue;

      try {
        const colorTexture = resource.colorTexture;
        if (!colorTexture) continue;

        if (typeof selectionTool._setErasedIndicesForEntity === 'function') {
          selectionTool._setErasedIndicesForEntity(gsplatEntity, new Set(item.previousErasedIndices || []));
        }

        const pixels = colorTexture.lock();
        if (!pixels) {
          colorTexture.unlock();
          continue;
        }

        let components = 4;
        if (colorTexture.width && colorTexture.height && pixels?.length) {
          components = Math.max(1, Math.round(pixels.length / (colorTexture.width * colorTexture.height)));
        }

        const isFloat = pixels instanceof Float32Array;
        const isHalfFloat = pixels instanceof Uint16Array;
        const HALF_ONE = 0x3c00;

        const erasedIndices = Array.isArray(item.erasedIndices) ? item.erasedIndices : [];
        const previous = new Set(item.previousErasedIndices || []);
        const restoredIndices = erasedIndices.filter(idx => !previous.has(idx));
        const origPixels = selectionTool._getOriginalPixelsForEntity?.(gsplatEntity, pixels);

        for (const idx of restoredIndices) {
          if (idx >= 0 && idx < (resource?.gsplatData?.numSplats || 0)) {
            const pixelOffset = idx * components;
            if (pixelOffset + (components - 1) < pixels.length) {
              if (origPixels && pixelOffset + (components - 1) < origPixels.length) {
                pixels[pixelOffset + 0] = origPixels[pixelOffset + 0];
                if (components > 1) pixels[pixelOffset + 1] = origPixels[pixelOffset + 1];
                if (components > 2) pixels[pixelOffset + 2] = origPixels[pixelOffset + 2];
              }
              if (components >= 4) {
                if (origPixels && pixelOffset + 3 < origPixels.length) {
                  pixels[pixelOffset + 3] = origPixels[pixelOffset + 3];
                } else {
                  if (isFloat) pixels[pixelOffset + 3] = 1.0;
                  else if (isHalfFloat) pixels[pixelOffset + 3] = HALF_ONE;
                  else pixels[pixelOffset + 3] = 255;
                }
              }
            }
          }
        }

        colorTexture.unlock();
        selectionTool.lastSelectedIndices = [];

        if (instance.mesh) {
          instance.mesh.dirtyBound = true;
        }
      } catch (err) {}
    }
  }

  redo(selectionTool) {
    for (const item of this.items) {
      const gsplatEntity = item?.gsplatEntity;
      if (!gsplatEntity?.gsplat) continue;

      const instance = gsplatEntity.gsplat.instance;
      const resource = instance?.resource;
      if (!resource) continue;

      try {
        const colorTexture = resource.colorTexture;
        if (!colorTexture) continue;

        const pixels = colorTexture.lock();
        if (!pixels) {
          colorTexture.unlock();
          continue;
        }

        let components = 4;
        if (colorTexture.width && colorTexture.height && pixels?.length) {
          components = Math.max(1, Math.round(pixels.length / (colorTexture.width * colorTexture.height)));
        }

        const isFloat = pixels instanceof Float32Array;
        const isHalfFloat = pixels instanceof Uint16Array;
        const HALF_ZERO = 0x0000;

        const erasedIndices = Array.isArray(item.erasedIndices) ? item.erasedIndices : [];
        for (const idx of erasedIndices) {
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

        if (typeof selectionTool._getErasedIndicesForEntity === 'function' && typeof selectionTool._setErasedIndicesForEntity === 'function') {
          const erasedSet = selectionTool._getErasedIndicesForEntity(gsplatEntity);
          for (const idx of erasedIndices) {
            erasedSet.add(idx);
          }
          selectionTool._setErasedIndicesForEntity(gsplatEntity, erasedSet);
        }

        selectionTool.lastSelectedIndices = [];

        if (instance.mesh) {
          instance.mesh.dirtyBound = true;
        }
      } catch (err) {}
    }
  }
}

export class SelectionChangeTask extends SelectionTask {
  constructor(pixelData, components, indices) {
    super('selection', pixelData, components);
    this.indices = indices ? [...indices] : [];
  }

  execute(selectionTool) {
    this.restorePixels(selectionTool);
    selectionTool.lastSelectedIndices = [...this.indices];
  }

  undo(selectionTool) {
    this.restorePixels(selectionTool);
    selectionTool.lastSelectedIndices = [...this.indices];
  }
}

export class EraseTask extends SelectionTask {
  constructor(previousErasedIndices, erasedIndices) {
    super('erase', null, 0);
    this.previousErasedIndices = previousErasedIndices ? new Set(previousErasedIndices) : new Set();
    this.erasedIndices = erasedIndices ? [...erasedIndices] : [];
  }

  undo(selectionTool) {
    const gsplatEntity = selectionTool.getGsplatEntityFromSelection();
    if (!gsplatEntity?.gsplat) return;

    const instance = gsplatEntity.gsplat.instance;
    const resource = instance?.resource;
    if (!resource) return;

    try {
      const colorTexture = resource.colorTexture;
      if (!colorTexture) return;

      if (typeof selectionTool._setErasedIndicesForEntity === 'function') {
        selectionTool._setErasedIndicesForEntity(gsplatEntity, new Set(this.previousErasedIndices));
      }

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
      const HALF_ONE = 0x3c00;
      const restoredIndices = this.erasedIndices.filter(idx => !this.previousErasedIndices.has(idx));
      const origPixels = selectionTool._getOriginalPixelsForEntity?.(gsplatEntity, pixels);

      for (const idx of restoredIndices) {
        if (idx >= 0 && idx < (resource?.gsplatData?.numSplats || 0)) {
          const pixelOffset = idx * components;
          if (pixelOffset + (components - 1) < pixels.length) {
            if (origPixels && pixelOffset + (components - 1) < origPixels.length) {
              pixels[pixelOffset + 0] = origPixels[pixelOffset + 0];
              if (components > 1) pixels[pixelOffset + 1] = origPixels[pixelOffset + 1];
              if (components > 2) pixels[pixelOffset + 2] = origPixels[pixelOffset + 2];
            }
            if (components >= 4) {
              if (origPixels && pixelOffset + 3 < origPixels.length) {
                pixels[pixelOffset + 3] = origPixels[pixelOffset + 3];
              } else {
                if (isFloat) pixels[pixelOffset + 3] = 1.0;
                else if (isHalfFloat) pixels[pixelOffset + 3] = HALF_ONE;
                else pixels[pixelOffset + 3] = 255;
              }
            }
          }
        }
      }

      colorTexture.unlock();

      selectionTool.lastSelectedIndices = [];

      if (instance.mesh) {
        instance.mesh.dirtyBound = true;
      }
    } catch (err) {}
  }

  redo(selectionTool) {
    const gsplatEntity = selectionTool.getGsplatEntityFromSelection();
    if (!gsplatEntity?.gsplat) return;

    const instance = gsplatEntity.gsplat.instance;
    const resource = instance?.resource;
    if (!resource) return;

    try {
      const colorTexture = resource.colorTexture;
      if (!colorTexture) return;

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

      for (const idx of this.erasedIndices) {
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

      if (typeof selectionTool._getErasedIndicesForEntity === 'function' && typeof selectionTool._setErasedIndicesForEntity === 'function') {
        const erasedSet = selectionTool._getErasedIndicesForEntity(gsplatEntity);
        for (const idx of this.erasedIndices) {
          erasedSet.add(idx);
        }
        selectionTool._setErasedIndicesForEntity(gsplatEntity, erasedSet);
      }

      selectionTool.lastSelectedIndices = [];

      if (instance.mesh) {
        instance.mesh.dirtyBound = true;
      }
    } catch (err) {}
  }
}

/** Sequence erase: undo/redo per batch (volume + complement). */
export class SequenceEraseTask extends SelectionTask {
  constructor(sequenceId, batchAdded) {
    super('sequence_erase', null, 0);
    this.sequenceId = sequenceId;
    this.batchAdded = batchAdded ? {
      spheres: (batchAdded.spheres || []).map(s => ({ ...s })),
      boxes: (batchAdded.boxes || []).map(b => ({ ...b, invArr: b.invArr ? [...b.invArr] : [] })),
      complement: !!batchAdded.complement
    } : { spheres: [], boxes: [], complement: false };
  }

  undo(selectionTool) {
    const bucket = selectionTool.erasedVolumesBySequenceId?.get(this.sequenceId);
    if (!bucket?.batches?.length) return;
    bucket.batches.pop();
    const obj = selectionTool.viewer?.getSelectedObject?.();
    if (obj?.id === this.sequenceId && obj?.isSequence && obj?.entity?.gsplat) {
      const gsplatEntity = obj.entity;
      const snapshots = { spheres: this.batchAdded.spheres, boxes: this.batchAdded.boxes };
      const indicesToRestore = selectionTool._collectIndicesInVolumeSnapshots?.(gsplatEntity, snapshots, this.batchAdded.complement) || [];
      if (indicesToRestore.length > 0 && typeof selectionTool.restoreRgbaForIndices === 'function') {
        selectionTool.restoreRgbaForIndices(gsplatEntity, indicesToRestore);
      }
      selectionTool.reapplySequenceErasedVolumes?.(obj);
    }
  }

  redo(selectionTool) {
    const bucket = selectionTool._getErasedVolumesBucket?.(this.sequenceId);
    if (!bucket) return;
    bucket.batches.push({
      spheres: [...this.batchAdded.spheres],
      boxes: this.batchAdded.boxes.map(b => ({ ...b, invArr: b.invArr ? [...b.invArr] : [] })),
      complement: this.batchAdded.complement
    });
    const obj = selectionTool.viewer?.getSelectedObject?.();
    if (obj?.id === this.sequenceId && obj?.isSequence) {
      selectionTool.reapplySequenceErasedVolumes?.(obj);
    }
  }
}

export class ComplementTask extends SelectionTask {
  constructor(pixelData, components, newIndices) {
    super('complement', pixelData, components);
    this.newIndices = newIndices ? [...newIndices] : [];
  }

  execute(selectionTool) {
    this.restorePixels(selectionTool);
    selectionTool.lastSelectedIndices = [...this.newIndices];
  }

  undo(selectionTool) {
    this.restorePixels(selectionTool);
    selectionTool.lastSelectedIndices = [...this.newIndices];
  }
}

export class HistoryManager {
  constructor(selectionTool) {
    this.tasks = [];
    this.currentIndex = -1;
    this.selectionTool = selectionTool;
  }

  addTask(task) {
    this.tasks = this.tasks.slice(0, this.currentIndex + 1);
    this.tasks.push(task);
    this.currentIndex++;
    if (this.selectionTool?.detailsPanel) {
      this.selectionTool.detailsPanel.updateUndoRedoButtons();
    }
  }

  undo() {
    if (this.currentIndex < 0) return false;

    const currentTask = this.tasks[this.currentIndex];
    if (currentTask) {
      currentTask.undo(this.selectionTool);
    }

    this.currentIndex--;
    return true;
  }

  redo() {
    if (this.currentIndex >= this.tasks.length - 1) return false;

    this.currentIndex++;
    const nextTask = this.tasks[this.currentIndex];
    if (nextTask) {
      nextTask.redo(this.selectionTool);
    }
    return true;
  }

  canUndo() {
    return this.currentIndex >= 0;
  }

  canRedo() {
    return this.currentIndex < this.tasks.length - 1;
  }

  clear() {
    this.tasks = [];
    this.currentIndex = -1;
  }
}
