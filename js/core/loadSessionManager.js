/**
 * LoadSessionManager – tracks load sessions and owned resources (splats, entities, assets, blob URLs, workers).
 * Disposes previous session on new load; supports append mode and detached/sequence sessions.
 */

export class LoadSessionManager {
  constructor({ viewerGetter, selectionToolGetter, memoryMonitorGetter, devModeGetter } = {}) {
    this._viewerGetter = typeof viewerGetter === 'function' ? viewerGetter : null;
    this._selectionToolGetter = typeof selectionToolGetter === 'function' ? selectionToolGetter : null;
    this._memoryMonitorGetter = typeof memoryMonitorGetter === 'function' ? memoryMonitorGetter : null;
    this._devModeGetter = typeof devModeGetter === 'function' ? devModeGetter : null;

    this._activeSessionId = null;
    this._sessions = new Map();
    this._sessionSeq = 0;
    this._disposeQueue = [];
    this._disposeScheduled = false;
  }

  _isDetachedSession(session) {
    try {
      return !!session?.meta?.source && String(session.meta.source).includes('detached');
    } catch (e) {
      return false;
    }
  }

  _isSequenceSession(session) {
    try {
      return String(session?.meta?.source || '').includes('ply_sequence');
    } catch (e) {
      return false;
    }
  }

  _scheduleIdle(fn) {
    try {
      if (typeof requestIdleCallback === 'function') {
        requestIdleCallback(() => fn(), { timeout: 250 });
        return;
      }
    } catch (e) {}
    setTimeout(() => fn(), 0);
  }

  _drainDisposeQueue() {
    if (this._disposeScheduled) return;
    this._disposeScheduled = true;
    this._scheduleIdle(async () => {
      try {
        while (this._disposeQueue.length > 0) {
          const job = this._disposeQueue.shift();
          if (!job) continue;
          try {
            await this.disposeSession(job.sessionId, job.options);
          } catch (e) {}
          await new Promise(r => setTimeout(r, 0));
        }
      } finally {
        this._disposeScheduled = false;
        if (this._disposeQueue.length > 0) this._drainDisposeQueue();
      }
    });
  }

  /** Defer disposal to avoid stutter; immediate in dev. */
  disposeSessionDeferred(sessionId, options = {}) {
    if (!sessionId) return;
    if (this.isDevMode()) {
      this.disposeSession(sessionId, options);
      return;
    }
    this._disposeQueue.push({ sessionId, options: { ...(options || {}), reason: options?.reason || 'deferred' } });
    this._drainDisposeQueue();
  }

  /** Drop strong refs for individually removed splats (complements disposeSession). */
  untrackSplatResources({ splatId, entity, asset, blobUrl } = {}) {
    for (const s of this._sessions.values()) {
      try {
        if (splatId) s.splatIds?.delete?.(splatId);
        if (entity) s.entities?.delete?.(entity);
        if (asset) s.assets?.delete?.(asset);
        if (blobUrl) s.blobUrls?.delete?.(blobUrl);
      } catch (e) {}
    }
  }

  _createSession(meta = {}, prev = null) {
    const sessionId = `ls_${Date.now()}_${++this._sessionSeq}`;
    const session = {
      id: sessionId,
      meta: { ...(meta || {}) },
      createdAtMs: performance.now(),
      endedAtMs: null,
      disposedAtMs: null,
      splatIds: new Set(),
      blobUrls: new Set(),
      assets: new Set(),
      entities: new Set(),
      abortControllers: new Set(),
      workers: new Set(),
      cpuNullers: [],
      disposed: false,
      heavyDisposed: false,
      prevSessionId: prev?.id || null,
    };

    session.trackSplatId = (splatId) => {
      if (!splatId) return;
      session.splatIds.add(splatId);
    };
    session.trackBlobUrl = (url) => this.trackBlobUrl(url, sessionId);
    session.trackAsset = (asset) => this.trackAsset(asset, sessionId);
    session.trackEntity = (entity) => this.trackEntity(entity, sessionId);
    session.trackAbortController = (controller) => this.trackAbortController(controller, sessionId);
    session.trackWorker = (worker) => this.trackWorker(worker, sessionId);
    session.trackCpuNuller = (fn) => this.trackCpuNuller(fn, sessionId);

    this._sessions.set(sessionId, session);
    return session;
  }

  /** Detached session: does not set active session or dispose previous. */
  createDetachedSession(meta = {}) {
    const session = this._createSession(meta, null);
    this._logSession('begin_detached', session);
    this._memorySnapshot(session.id, 'begin_detached');
    return session;
  }

  get activeSessionId() {
    return this._activeSessionId;
  }

  getActiveSession() {
    if (!this._activeSessionId) return null;
    return this._sessions.get(this._activeSessionId) || null;
  }

  isDevMode() {
    try {
      return !!this._devModeGetter?.();
    } catch (e) {
      return false;
    }
  }

  beginLoadSession(meta = {}) {
    if (meta?.append && this._activeSessionId) {
      const active = this._sessions.get(this._activeSessionId) || null;
      if (active && !active.disposed) {
        active.meta = { ...(active.meta || {}), ...(meta || {}) };
        this._logSession('begin_append_reuse', active);
        return active;
      }
    }

    const prevId = this._activeSessionId;
    const prev = prevId ? this._sessions.get(prevId) : null;
    const session = this._createSession(meta, prev);
    this._activeSessionId = session.id;

    if (prev && !prev.disposed) {
      this.disposeSession(prev.id, { reason: 'beginLoadSession' });
    }

    this._logSession('begin', session);
    this._memorySnapshot(session.id, 'begin');
    return session;
  }

  endLoadSession(sessionId = null) {
    const sid = sessionId || this._activeSessionId;
    const s = sid ? this._sessions.get(sid) : null;
    if (!s) return;
    s.endedAtMs = performance.now();
    this._logSession('end', s);
    this._memorySnapshot(sid, 'end');
  }

  trackBlobUrl(url, sessionId = null) {
    const s = this._getSessionOrActive(sessionId);
    if (!s || !url) return;
    s.blobUrls.add(url);
  }

  trackAsset(asset, sessionId = null) {
    const s = this._getSessionOrActive(sessionId);
    if (!s || !asset) return;
    s.assets.add(asset);
  }

  trackEntity(entity, sessionId = null) {
    const s = this._getSessionOrActive(sessionId);
    if (!s || !entity) return;
    s.entities.add(entity);
  }

  trackAbortController(controller, sessionId = null) {
    const s = this._getSessionOrActive(sessionId);
    if (!s || !controller) return;
    s.abortControllers.add(controller);
  }

  trackWorker(worker, sessionId = null) {
    const s = this._getSessionOrActive(sessionId);
    if (!s || !worker) return;
    s.workers.add(worker);
  }

  trackCpuNuller(nullerFn, sessionId = null) {
    const s = this._getSessionOrActive(sessionId);
    if (!s || typeof nullerFn !== 'function') return;
    s.cpuNullers.push(nullerFn);
  }

  async disposeSession(sessionId, options = {}) {
    const s = sessionId ? this._sessions.get(sessionId) : null;
    if (!s || s.disposed) return;

    s.disposed = true;
    s.disposedAtMs = performance.now();

    const viewer = this._viewerGetter?.();
    const selectionTool = this._selectionToolGetter?.();

    this._logSession('dispose_begin', s, options);
    if (!this._isSequenceSession(s)) {
      this._memorySnapshot(sessionId, 'dispose_immediate');
    }

    for (const ac of s.abortControllers) {
      try {
        ac.abort();
      } catch (e) {}
    }

    if (viewer && s.splatIds?.size > 0) {
      for (const sid of s.splatIds) {
        try {
          viewer.removeSplat?.(sid);
        } catch (e) {}
      }
      s.splatIds.clear();
    }

    this._scheduleIdle(async () => {
      if (!s || s.heavyDisposed) return;
      s.heavyDisposed = true;
      try {
        for (const e of s.entities) {
          try {
            e.destroy?.();
          } catch (err) {}
        }
        s.entities.clear?.();

        const appAssets = viewer?.app?.assets;
        for (const a of s.assets) {
          try {
            if (appAssets) {
              try {
                appAssets.remove(a);
              } catch (e) {}
            }
            a.unload?.();
            a.destroy?.();
          } catch (err) {}
        }
        s.assets.clear?.();

        if (!this._isSequenceSession(s) && !this._isDetachedSession(s)) {
          try {
            selectionTool?.resetAll?.();
          } catch (e) {}
        }

        try {
          await this._nextFrame();
        } catch (e) {}
        if (this.isDevMode() && !this._isSequenceSession(s)) {
          this._memorySnapshot(sessionId, 'dispose_raf');
        }

        for (const url of s.blobUrls) {
          try {
            URL.revokeObjectURL(url);
          } catch (e) {}
        }
        s.blobUrls.clear?.();

        for (const fn of s.cpuNullers) {
          try {
            fn();
          } catch (e) {}
        }
        s.cpuNullers = [];

        for (const w of s.workers) {
          try {
            w.onmessage = null;
            w.onerror = null;
            w.terminate?.();
          } catch (e) {}
        }
        s.workers.clear?.();

        if (this.isDevMode() && !this._isSequenceSession(s)) {
          await new Promise(r => setTimeout(r, 500));
          this._memorySnapshot(sessionId, 'dispose_500ms');
        }
      } finally {
        this._logSession('dispose_end', s);
      }
    });
  }

  _getSessionOrActive(sessionId) {
    if (sessionId) return this._sessions.get(sessionId) || null;
    return this.getActiveSession();
  }

  _memorySnapshot(sessionId, phase) {
    if (!this.isDevMode()) return;
    try {
      this._memoryMonitorGetter?.()?.sample?.({ sessionId, phase });
    } catch (e) {}
  }

  _logSession(event, session, extra = null) {
    if (!this.isDevMode()) return;
    try {
      const viewer = this._viewerGetter?.();
      const splatCount = viewer?.getAllSplats?.()?.length ?? null;
      console.log('[LoadSession]', { event, sessionId: session?.id, meta: session?.meta, splatCount, extra });
    } catch (e) {}
  }

  _nextFrame() {
    return new Promise(resolve => requestAnimationFrame(() => resolve()));
  }
}

export default LoadSessionManager;
