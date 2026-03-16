/**
 * FileLoader – loads .ply (3DGS) and .glb files into PlayCanvas viewer.
 * Cleans previous assets on new load; updates loading UI.
 */

import { t } from '../i18n.js';

/**
 * @param {PlayCanvasViewer} viewer
 * @param {Object} ui - { overlay, progress, bar, text }
 */
export class FileLoader {
  constructor(viewer, ui = {}) {
    this.viewer = viewer;
    this.ui = ui;
    this._loadSessionManager = null;

    this._currentFileName = null;
    this._state = "idle";
    this._loadedFiles = [];
    this._dedupBySignature = new Map();
  }

  /** @type {{ type: 'ply'|'glb', fileName: string, entity: Object, splatId?: string, glbId?: string }|null} */
  _lastLoadResult = null;

  _getFileSignature(file) {
    if (!file) return '';
    const name = String(file.name || '');
    const size = typeof file.size === 'number' ? file.size : -1;
    const lm = typeof file.lastModified === 'number' ? file.lastModified : -1;
    return `${name}:${size}:${lm}`;
  }

  setLoadSessionManager(loadSessionManager) {
    this._loadSessionManager = loadSessionManager || null;
  }

  _beginLoadSession(meta = {}) {
    if (!meta?.append) {
      this.clearLoadedFiles();
    }
    return this._loadSessionManager?.beginLoadSession?.(meta) || null;
  }

  _endLoadSession(session) {
    this._loadSessionManager?.endLoadSession?.(session?.id);
  }

  validateFileExtension(filename) {
    if (!filename) return false;
    const ext = filename.split(".").pop()?.toLowerCase();
    if (ext !== "ply") {
      this.showError("지원하지 않는 파일 형식입니다. .ply 파일만 지원합니다.");
      return false;
    }
    return true;
  }

  getLastLoadResult() {
    return this._lastLoadResult;
  }

  /**
   * Load a single file (.ply).
   * @param {File} file
   * @param {Object} options - rotationFixZ180, silent, sessionMeta, append, disableNormalize
   * @returns {Promise<boolean>}
   */
  async loadFile(file, options = {}) {
    if (!file) {
      console.warn("[FileLoader.loadFile] No file.");
      return false;
    }
    if (!this.validateFileExtension(file.name)) return false;
    if (!this.viewer || !this.viewer.initialized) {
      this.showError("뷰어가 아직 준비되지 않았습니다.");
      return false;
    }
    if (this.viewer.isLoading?.()) {
      console.warn("[FileLoader.loadFile] Already loading.");
      return false;
    }

    const { rotationFixZ180 = true } = options || {};
    const silent = !!options?.silent;

    const requestedAppend = options?.append;
    const hasExistingSplat = !!this.viewer?.getSplatEntity?.();
    const append = requestedAppend === undefined ? hasExistingSplat : !!requestedAppend;
    const meta = options?.sessionMeta || { source: 'local_file', fileCount: 1, fileName: file.name, append };
    if (meta && typeof meta === 'object') meta.append = append;
    const loadSession = this._beginLoadSession(meta);

    try {
      this._state = "loading";
      this._currentFileName = file.name;
      if (!silent) {
        this.showLoadingOverlay(true);
        this.setLoadingText(t('loading.default'));
        this.setLoadingProgress(0);
      }

      const disableNormalize = options?.disableNormalize !== undefined
        ? !!options.disableNormalize
        : (typeof file?.size === 'number' && file.size > 128 * 1024 * 1024);
      const splatEntity = await this.viewer.loadSplatFromFile(file, {
        rotationFixZ180,
        session: loadSession,
        disableNormalize,
        onProgress: (percent, status) => {
          if (silent) return;
          this.setLoadingProgress(percent);
          if (status) this.setLoadingText(status);
        },
      });

      if (splatEntity) {
        this._state = "loaded";
        if (!silent) {
          this.setLoadingText(`Loaded: ${file.name}`);
          this.setLoadingProgress(100);
          setTimeout(() => this.hideLoadingOverlay(), 500);
        }
        this._endLoadSession(loadSession);
        return true;
      }
      throw new Error("Splat entity creation failed");
    } catch (err) {
      console.error("[FileLoader.loadFile] Load failed:", err);
      this._state = "error";
      if (!append) this.viewer.clearSplat?.();
      this._endLoadSession(loadSession);
      if (!silent) {
        this.setLoadingText(`Error: ${err?.message || t('loading.loadFailed')}`);
        this.setLoadingProgress(0);
        setTimeout(() => this.hideLoadingOverlay(), 2000);
      }
      return false;
    }
  }

  /**
   * Load multiple .ply files (batch).
   * @param {File[]} files
   * @param {Object} options
   * @returns {Promise<{success: boolean, results: Array<{fileName: string, splatId: string, entity: pc.Entity}>}>}
   */
  async loadFiles(files, options = {}) {
    if (!files || files.length === 0) {
      return { success: false, results: [] };
    }

    const plyFiles = Array.from(files).filter(f => {
      const ext = f.name.split(".").pop()?.toLowerCase();
      return ext === "ply";
    });
    if (plyFiles.length === 0) {
      this.showError("지원하지 않는 파일 형식입니다. .ply 파일만 지원합니다.");
      return { success: false, results: [] };
    }

    const requestedAppend = options?.append;
    const hasExistingSplat = !!this.viewer?.getSplatEntity?.();
    const append = requestedAppend === undefined ? hasExistingSplat : !!requestedAppend;
    const meta = options?.sessionMeta || { source: 'local_files', fileCount: plyFiles.length, append };
    if (meta && typeof meta === 'object') meta.append = append;

    const session = options?.session || this._beginLoadSession(meta);
    const ownsSession = !options?.session;
    const optionsWithSession = { ...(options || {}), session, dedup: false };

    const results = [];
    let successCount = 0;
    const totalFiles = plyFiles.length;

    for (let i = 0; i < totalFiles; i++) {
      const file = plyFiles[i];
      if (totalFiles > 1) {
        const result = await this._loadFileSingleBatch(file, optionsWithSession, i, totalFiles);
        if (result) {
          results.push(result);
          successCount++;
        }
      } else {
        const result = await this.loadFileSingle(file, optionsWithSession);
        if (result) {
          results.push(result);
          successCount++;
        }
      }
    }

    if (ownsSession) this._endLoadSession(session);
    return { success: successCount > 0, results };
  }

  async _loadFileSingleBatch(file, options, currentIndex, totalFiles) {
    if (!file) return null;
    if (!this.validateFileExtension(file.name)) return null;
    if (!this.viewer || !this.viewer.initialized) return null;

    const { rotationFixZ180 = true, session } = options;
    const skipReorder = options?.skipReorder === true;

    try {
      const disableNormalize = options?.disableNormalize !== undefined ? !!options.disableNormalize : true;
      const result = await this.viewer.loadSplatFromFile(file, {
        rotationFixZ180,
        session,
        disableNormalize,
        skipReorder,
        onProgress: () => {},
      });

      if (result && result.entity) {
        const ext = file.name.split(".").pop()?.toLowerCase() || "ply";
        this._loadedFiles.push({ name: file.name, ext, base64: "", splatId: result.splatId });
        return { fileName: file.name, splatId: result.splatId, entity: result.entity };
      }
      return null;
    } catch (err) {
      console.error(`[FileLoader] Load failed: ${file.name}`, err);
      return null;
    }
  }

  /**
   * Load single file with optional dedup and session.
   * @param {File} file
   * @param {Object} options - rotationFixZ180, silent, signal, allowConcurrent, session, append, dedup, disableNormalize, skipReorder
   * @returns {Promise<{fileName: string, splatId: string, entity: pc.Entity}|null>}
   */
  async loadFileSingle(file, options = {}) {
    if (!file) return null;
    if (!this.validateFileExtension(file.name)) return null;
    if (!this.viewer || !this.viewer.initialized) {
      this.showError("뷰어가 아직 준비되지 않았습니다.");
      return null;
    }

    const dedupEnabled = options?.dedup !== false;
    if (dedupEnabled) {
      const sig = this._getFileSignature(file);
      const prev = sig ? this._dedupBySignature.get(sig) : null;
      if (prev?.splatId) {
        const stillThere = this.viewer?.getSplatEntityById?.(prev.splatId);
        if (stillThere) {
          try {
            stillThere.enabled = true;
          } catch (e) {}
          return { fileName: file.name, splatId: prev.splatId, entity: stillThere };
        }
        if (sig) this._dedupBySignature.delete(sig);
      }
    }

    const { rotationFixZ180 = true } = options;
    const silent = !!options?.silent;
    const signal = options?.signal;
    const allowConcurrent = !!options?.allowConcurrent;
    const skipReorder = options?.skipReorder === true;

    const waitForViewerIdle = async () => {
      const start = Date.now();
      while (this.viewer?.isLoading?.()) {
        if (signal?.aborted) return false;
        if (Date.now() - start > 5000) return false;
        await new Promise(r => setTimeout(r, 16));
      }
      return true;
    };

    const requestedAppend = options?.append;
    const hasExistingSplat = !!this.viewer?.getSplatEntity?.();
    const append = requestedAppend === undefined ? hasExistingSplat : !!requestedAppend;
    const session = options?.session || this._beginLoadSession({
      source: 'local_file_single',
      fileCount: 1,
      fileName: file.name,
      append,
    });
    const ownsSession = !options?.session;

    try {
      this._state = "loading";
      if (!silent) {
        this.showLoadingOverlay(true);
        this.setLoadingText(t('loading.default') + ': ' + file.name);
        this.setLoadingProgress(0);
      }

      if (!allowConcurrent && this.viewer?.isLoading?.()) {
        const ok = await waitForViewerIdle();
        if (!ok) {
          this._state = "idle";
          if (ownsSession) this._endLoadSession(session);
          return null;
        }
      }

      const disableNormalize = options?.disableNormalize !== undefined
        ? !!options.disableNormalize
        : (typeof file?.size === 'number' && file.size > 128 * 1024 * 1024);
      const result = await this.viewer.loadSplatFromFile(file, {
        rotationFixZ180,
        session,
        disableNormalize,
        skipReorder,
        signal,
        onProgress: (percent, status) => {
          if (silent) return;
          this.setLoadingProgress(percent);
          if (status) {
            let s = status;
            if (s === 'Loading...') s = t('loading.default');
            else if (s === 'Processing...') s = t('loading.processing');
            else if (s === 'Loading GSplat asset...') s = t('loading.loadingGsset');
            this.setLoadingText(file.name + ': ' + s);
          }
        },
      });

      if (result && result.entity) {
        this._state = "loaded";
        if (!silent) {
          this.setLoadingText(`Loaded: ${file.name}`);
          this.setLoadingProgress(100);
        }
        const ext = file.name.split(".").pop()?.toLowerCase() || "ply";
        this._loadedFiles.push({ name: file.name, ext, base64: "", splatId: result.splatId });
        if (!silent) setTimeout(() => this.hideLoadingOverlay(), 300);
        if (ownsSession) this._endLoadSession(session);

        const sig = this._getFileSignature(file);
        if (sig) {
          this._dedupBySignature.set(sig, { splatId: result.splatId, entity: result.entity, fileName: file.name });
        }
        return { fileName: file.name, splatId: result.splatId, entity: result.entity };
      }

      if (signal?.aborted || this.viewer?.isLoading?.()) return null;
      throw new Error("Splat entity creation failed");
    } catch (err) {
      if (err?.name === 'AbortError' || signal?.aborted) {
        this._state = "idle";
        if (ownsSession) this._endLoadSession(session);
        return null;
      }
      console.error("[FileLoader.loadFileSingle] Load failed:", file.name, err);
      this._state = "error";
      if (!silent) {
        this.setLoadingText(`Error: ${err?.message || t('loading.loadFailed')}`);
        setTimeout(() => this.hideLoadingOverlay(), 1500);
      }
      if (ownsSession) this._endLoadSession(session);
      return null;
    }
  }

  showLoadingOverlay(useSpinner = false) {
    const overlay = this.ui?.overlay;
    if (!overlay) return;
    overlay.classList.add("is-visible");
    if (useSpinner) {
      overlay.classList.add("is-spinner");
      const barEl = this.ui?.bar;
      if (barEl) barEl.style.width = "0%";
    } else {
      overlay.classList.remove("is-spinner");
    }
    overlay.setAttribute("aria-hidden", "false");
  }

  hideLoadingOverlay() {
    const overlay = this.ui?.overlay;
    if (!overlay) return;
    overlay.classList.remove("is-visible", "is-spinner");
    overlay.setAttribute("aria-hidden", "true");
  }

  setLoadingText(text) {
    const textEl = this.ui?.text;
    if (!textEl) return;
    if (!text || typeof text !== 'string') {
      textEl.textContent = '';
      return;
    }
    if (text === 'Loading...') text = t('loading.default');
    else if (text === 'Downloading...') text = t('loading.downloading');
    else if (text === 'Processing...') text = t('loading.processing');
    else if (text === 'Loading GSplat asset...') text = t('loading.loadingGsset');
    else if (text.startsWith('Loaded:')) text = t('loading.loaded') + ': ' + text.replace(/^Loaded:\s*/, '').trim();
    else if (text.startsWith('Error:')) text = t('loading.loadFailed') + ': ' + text.replace(/^Error:\s*/, '').trim();
    else if (text.startsWith('Loading: ')) text = t('loading.default') + ': ' + text.replace(/^Loading:\s*/, '').trim();
    textEl.textContent = text;
  }

  setLoadingProgress(percent) {
    const pct = Math.max(0, Math.min(100, Math.floor(percent || 0)));
    const progressEl = this.ui?.progress;
    const barEl = this.ui?.bar;
    if (progressEl) progressEl.setAttribute("aria-valuenow", String(pct));
    if (barEl) barEl.style.width = `${pct}%`;
  }

  showError(message) {
    console.error("[FileLoader]", message);
  }

  getState() {
    return this._state;
  }

  getCurrentFileName() {
    return this._currentFileName;
  }

  isLoading() {
    return this._state === "loading";
  }

  getLoadedFiles() {
    return this._loadedFiles;
  }

  addLoadedFileData({ name, splatId }) {
    if (!name || !splatId) return;
    const ext = name.split(".").pop()?.toLowerCase() || "ply";
    this._loadedFiles.push({ name, ext, base64: "", splatId });
  }

  getFileDataBySplatId(splatId) {
    return this._loadedFiles.find(f => f.splatId === splatId) || null;
  }

  clearLoadedFiles() {
    this._loadedFiles = [];
  }

  removeFileData(splatId) {
    this._loadedFiles = this._loadedFiles.filter(f => f.splatId !== splatId);
  }
}
