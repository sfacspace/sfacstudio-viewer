/**
 * PlySequenceController – per-object sequence frame load/switch (SuperSplat ply-sequence pattern).
 * ObjSequenceController: setFrame (queues nextFrame when loading; skips same frame; load → postrender → destroy prev).
 * setFrameAsyncForObject: wait until frame load completes (for export video).
 */

export class PlySequenceController {
  constructor({ timeline, viewer, fileLoader, importCache, getLoadSessionManager } = {}) {
    this.timeline = timeline;
    this.viewer = viewer;
    this.fileLoader = fileLoader;
    this.importCache = importCache;
    this.getLoadSessionManager = getLoadSessionManager;
    this._controllers = new Map();
  }

  _isDevMode() {
    try {
      return window.DEV_MODE === true;
    } catch (e) {
      return false;
    }
  }

  _isSequenceObj(obj) {
    return !!(obj && (obj.isSequence || (obj.isMultiFile && Array.isArray(obj.files))));
  }

  _getControllerKey(obj) {
    return obj?.id || obj;
  }

  /** Wait 2 postrenders before destroying prev frame to avoid flicker. Skip when export video (no postrender). */
  _waitForRenderThenDestroy() {
    if (this.viewer?._exportVideoActive) return Promise.resolve();
    const app = this.viewer?.app;
    if (!app?.on) return Promise.resolve();
    return new Promise(resolve => {
      let count = 0;
      const off = app.on('postrender', () => {
        count += 1;
        if (count >= 2) {
          off.off();
          resolve();
        }
      });
    });
  }

  /** Resolve frame file: frame.file, or frame.cacheKey → importCache, or frame.path → local file server fetch. */
  async _loadFrameFile(obj, idx) {
    const frame = obj?.files?.[idx];
    let file = frame?.file;
    if (file) return file;
    if (frame?.cacheKey && this.importCache?.getProjectFile) {
      try {
        file = await this.importCache.getProjectFile(frame.cacheKey, idx, frame.fileName);
        return file ?? null;
      } catch (e) {
        if (this._isDevMode()) console.warn('[PlySequence] IndexedDB load failed', frame.cacheKey, idx, e);
        return null;
      }
    }
    if (frame?.path && typeof window.__getLocalFileServerBaseUrl === 'function') {
      try {
        const baseUrl = (await window.__getLocalFileServerBaseUrl()).replace(/\/$/, '');
        const url = `${baseUrl}/local-file?path=${encodeURIComponent(frame.path)}`;
        const res = await fetch(url);
        if (res.ok) {
          const blob = await res.blob();
          const fileName = (frame.path.split(/[/\\]/).pop()) || frame.fileName || `frame_${String(idx + 1).padStart(6, '0')}.ply`;
          file = new File([blob], fileName, { type: 'application/octet-stream' });
        }
      } catch (e) {
        if (this._isDevMode()) console.warn('[PlySequence] Path load failed', frame.path, e);
      }
    }
    return file ?? null;
  }

  async _loadSplatFast(file, { session, signal, rotationFixZ180 = true } = {}) {
    if (!file) return null;
    if (typeof this.viewer?.loadSplatFromFile !== 'function') return null;
    return this.viewer.loadSplatFromFile(file, {
      append: true,
      rotationFixZ180,
      session,
      disableNormalize: true,
      skipReorder: true,
      signal,
      onProgress: null,
    });
  }

  async _disposeFrame(lsm, frame, reason) {
    if (!frame) return;
    if (frame.sessionId) {
      try {
        const p = lsm?.disposeSession?.(frame.sessionId, { reason });
        if (lsm?.isDevMode?.()) await p;
      } catch (e) {}
      return;
    }
    if (frame.splatId) {
      try {
        this.viewer?.removeSplat?.(frame.splatId);
      } catch (e) {}
      try {
        this.fileLoader?.removeFileData?.(frame.splatId);
      } catch (e) {}
    }
  }

  _getOrCreateObjController(obj) {
    if (!this._isSequenceObj(obj)) return null;
    const key = this._getControllerKey(obj);
    if (!key) return null;
    let c = this._controllers.get(key);
    if (!c) {
      c = new ObjSequenceController({ parent: this, obj });
      this._controllers.set(key, c);
    } else {
      c.setObject(obj);
    }
    return c;
  }

  async onFrameChange(obj, frameIndex) {
    const c = this._getOrCreateObjController(obj);
    if (!c) return;
    await c.setFrame(frameIndex);
  }

  /** Wait until frame load completes for this object (setFrameAsync for export video). */
  setFrameAsyncForObject(obj, frameIndex) {
    const c = this._getOrCreateObjController(obj);
    if (!c) return Promise.resolve();
    return c.setFrame(frameIndex);
  }

  /** Apply stored _sequenceTransform to entity, or init from current entity. */
  _applyOrInitSequenceTransform(obj) {
    if (!obj?.entity || !obj.isSequence) return;
    const e = obj.entity;

    if (obj._sequenceTransform) {
      const t = obj._sequenceTransform;
      e.setLocalPosition(t.position.x, t.position.y, t.position.z);
      e.setLocalEulerAngles(t.rotation.x, t.rotation.y, t.rotation.z);
      e.setLocalScale(t.scale.x, t.scale.y, t.scale.z);
      return;
    }

    const pos = e.getLocalPosition();
    const rot = e.getLocalEulerAngles();
    const scale = e.getLocalScale();
    obj._sequenceTransform = {
      position: { x: pos.x, y: pos.y, z: pos.z },
      rotation: { x: rot.x, y: rot.y, z: rot.z },
      scale: { x: scale.x, y: scale.y, z: scale.z },
    };
  }

  async cleanupAll(reason = 'sequence_playback_stop') {
    const list = Array.from(this._controllers.values());
    for (const c of list) {
      try {
        await c.cleanup(reason);
      } catch (e) {}
    }
    this._controllers.clear();
  }
}

/** Per-object sequence controller: sequenceFrame, sequenceLoading, nextFrame, setFrame. */
class ObjSequenceController {
  constructor({ parent, obj } = {}) {
    this.parent = parent;
    this.obj = obj;
    this.sequenceFrame = -1;
    this.sequenceLoading = false;
    this.nextFrame = -1;
  }

  setObject(obj) {
    this.obj = obj;
  }

  async setFrame(frameIndex) {
    const obj = this.obj;
    const fileCount = obj?.files?.length || 0;

    if (frameIndex < 0 || frameIndex >= fileCount) {
      if (frameIndex === -1) {
        await this._hideAndDisposeCurrent('sequence_frame_hide');
      }
      return;
    }

    if (this.sequenceLoading) {
      this.nextFrame = frameIndex;
      return;
    }
    if (frameIndex === this.sequenceFrame) return;

    this.sequenceLoading = true;

    try {
      const file = await this.parent._loadFrameFile(obj, frameIndex);
      if (!file) {
        this.sequenceLoading = false;
        return;
      }

      const getLoadSessionManager = this.parent.getLoadSessionManager;
      const lsm = typeof getLoadSessionManager === 'function' ? getLoadSessionManager() : null;
      const session = lsm?.createDetachedSession?.({
        source: 'ply_sequence_frame',
        fileCount: 1,
        fileName: file.name,
        append: true,
      }) || null;

      let result = await this.parent._loadSplatFast(file, { session });
      if (!result && this.parent.fileLoader?.loadFileSingle) {
        result = await this.parent.fileLoader.loadFileSingle(file, {
          append: true,
          disableNormalize: true,
          skipReorder: true,
          silent: true,
          signal: null,
          session,
          dedup: true,
          allowConcurrent: true,
          sessionMeta: {
            source: 'ply_sequence_frame',
            frameIndex,
            frameCount: fileCount,
            fileName: file.name,
            append: true,
          },
        });
      }

      if (!result?.entity || !result?.splatId) {
        try {
          await lsm?.disposeSession?.(session?.id, { reason: 'sequence_frame_load_failed' });
        } catch (e) {}
        this.sequenceLoading = false;
        return;
      }

      if (result.entity) result.entity.enabled = false;

      const prevSplatId = obj?.splatId || null;
      const prevSessionId = obj?._frameSessionId || null;
      const prevEntity = obj?.entity || null;

      obj.entity = result.entity;
      obj.splatId = result.splatId;
      obj._frameSessionId = session?.id || null;
      this.sequenceFrame = frameIndex;

      this.parent._applyOrInitSequenceTransform(obj);
      window.__selectionTool?.reapplySequenceErasedVolumes?.(obj);

      await this.parent._waitForRenderThenDestroy();

      if (result.entity) result.entity.enabled = true;
      if (prevSplatId || prevSessionId) {
        try {
          if (prevSessionId && typeof lsm?.disposeSessionDeferred === 'function') {
            lsm.disposeSessionDeferred(prevSessionId, { reason: 'sequence_frame_replace' });
          } else {
            await this.parent._disposeFrame(lsm, {
              splatId: prevSplatId,
              sessionId: prevSessionId,
              entity: prevEntity,
            }, 'sequence_frame_replace');
          }
        } catch (e) {}
      }

      const timeline = this.parent.timeline;
      if (timeline?.selectedObjectId === obj.id) {
        this.parent.viewer?.setSelectedObject?.(obj);
        window.__inspector?.show?.(obj);
        window.__gizmo?.setTarget?.(obj);
      }

      this.sequenceLoading = false;

      if (this.nextFrame !== -1) {
        const next = this.nextFrame;
        this.nextFrame = -1;
        this.setFrame(next);
      }
    } catch (e) {
      this.sequenceLoading = false;
      if (this.nextFrame !== -1) {
        const frame = this.nextFrame;
        this.nextFrame = -1;
        this.setFrame(frame);
      }
    }
  }

  async _hideAndDisposeCurrent(reason) {
    const obj = this.obj;
    const getLoadSessionManager = this.parent.getLoadSessionManager;
    const lsm = typeof getLoadSessionManager === 'function' ? getLoadSessionManager() : null;

    const prevSplatId = obj?.splatId || null;
    const prevSessionId = obj?._frameSessionId || null;
    const prevEntity = obj?.entity || null;

    this.sequenceFrame = -1;
    this.sequenceLoading = false;
    this.nextFrame = -1;

    if (obj) {
      obj.entity = null;
      obj.splatId = null;
      obj._frameSessionId = null;
    }

    if (prevSplatId || prevSessionId) {
      try {
        if (prevSessionId && typeof lsm?.disposeSessionDeferred === 'function') {
          lsm.disposeSessionDeferred(prevSessionId, { reason });
        } else {
          await this.parent._disposeFrame(lsm, {
            splatId: prevSplatId,
            sessionId: prevSessionId,
            entity: prevEntity,
          }, reason);
        }
      } catch (e) {}
    }
  }

  async cleanup(reason = 'sequence_playback_stop') {
    await this._hideAndDisposeCurrent(reason);
  }
}
