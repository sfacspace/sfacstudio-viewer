/** Performance settings: DPR cap, camera/overlay throttle, AABB sampling; persist to localStorage. */
const STORAGE_KEY = 'viewer.settings.performance';

const PRESETS = {
  quality: {
    dprCap: '2.0',
    cameraThrottle: 'every',
    overlayUpdate: 'always',
    aabbSampling: false,
    aabbSamples: '100000'
  },
  balanced: {
    dprCap: '1.25',
    cameraThrottle: 'raf',
    overlayUpdate: 'visible',
    aabbSampling: true,
    aabbSamples: '100000'
  },
  performance: {
    dprCap: '1.0',
    cameraThrottle: 'low',
    overlayUpdate: 'off',
    aabbSampling: true,
    aabbSamples: '50000'
  }
};

const DEFAULTS = {
  preset: 'quality',
  ...PRESETS.quality,
  seqCacheLimit: '3',
  seqPrefetchDepth: '1',
  seqPrefetchDirMode: 'auto',
  seqScrubbing: true,
  seqScrubWindow: '200',
  seqScrubDelta: '2',
  seqPrefetchConcurrency: '1',
  seqMemoryPressure: 'auto'
};

export class PerformanceSettings {
  constructor(viewer) {
    this.viewer = viewer;
    this.settings = { ...DEFAULTS };
    this.elements = {
      preset: null,
      dprCap: null,
      cameraThrottle: null,
      overlayUpdate: null,
      aabbSampling: null,
      aabbSamples: null,
      aabbSamplesRow: null,
      seqCacheLimit: null,
      seqPrefetchDepth: null,
      seqPrefetchDirMode: null,
      seqScrubbing: null,
      seqScrubWindow: null,
      seqScrubDelta: null,
      seqPrefetchConcurrency: null,
      seqMemoryPressure: null,
      resetBtn: null
    };
    this._cameraUpdatePending = false;
    this._lastCameraUpdateTime = 0;
    this._cameraThrottleInterval = null;
    this._overlayUpdatePending = false;
    this._lastOverlayUpdateTime = 0;
  }

  getSequencePrefetchConfig() {
    return {
      cacheLimit: parseInt(this.settings.seqCacheLimit, 10) || 3,
      prefetchDepth: parseInt(this.settings.seqPrefetchDepth, 10) || 0,
      prefetchDirectionMode: this.settings.seqPrefetchDirMode || 'auto',
      scrubbing: !!this.settings.seqScrubbing,
      scrubbingThresholdMs: parseInt(this.settings.seqScrubWindow, 10) || 200,
      scrubbingDeltaIndex: parseInt(this.settings.seqScrubDelta, 10) || 2,
      prefetchConcurrency: parseInt(this.settings.seqPrefetchConcurrency, 10) || 1,
      memoryPressureMode: this.settings.seqMemoryPressure || 'auto',
    };
  }

  init() {
    this.elements.preset = document.getElementById('settingsPerfPreset');
    this.elements.dprCap = document.getElementById('settingsDprCap');
    this.elements.cameraThrottle = document.getElementById('settingsCameraThrottle');
    this.elements.overlayUpdate = document.getElementById('settingsOverlayUpdate');
    this.elements.aabbSampling = document.getElementById('settingsAabbSampling');
    this.elements.aabbSamples = document.getElementById('settingsAabbSamples');
    this.elements.aabbSamplesRow = document.getElementById('settingsAabbSamplesRow');
    this.elements.seqCacheLimit = document.getElementById('settingsSeqCacheLimit');
    this.elements.seqPrefetchDepth = document.getElementById('settingsSeqPrefetchDepth');
    this.elements.seqPrefetchDirMode = document.getElementById('settingsSeqPrefetchDirMode');
    this.elements.seqScrubbing = document.getElementById('settingsSeqScrubbing');
    this.elements.seqScrubWindow = document.getElementById('settingsSeqScrubWindow');
    this.elements.seqScrubDelta = document.getElementById('settingsSeqScrubDelta');
    this.elements.seqPrefetchConcurrency = document.getElementById('settingsSeqPrefetchConcurrency');
    this.elements.seqMemoryPressure = document.getElementById('settingsSeqMemoryPressure');
    this.elements.resetBtn = document.getElementById('settingsPerfReset');
    this._loadFromStorage();
    this._syncUIFromSettings();
    this._bindEvents();
    this._applyAllSettings();
    this._saveToStorage();
  }

  _bindEvents() {
    this.elements.preset?.addEventListener('change', (e) => {
      this._applyPreset(e.target.value);
    });
    this.elements.dprCap?.addEventListener('change', (e) => {
      this.settings.dprCap = e.target.value;
      this.settings.preset = this._detectPreset();
      this._syncUIFromSettings();
      this._applyDprCap();
      this._saveToStorage();
    });
    this.elements.cameraThrottle?.addEventListener('change', (e) => {
      this.settings.cameraThrottle = e.target.value;
      this.settings.preset = this._detectPreset();
      this._syncUIFromSettings();
      this._applyCameraThrottle();
      this._saveToStorage();
    });
    this.elements.overlayUpdate?.addEventListener('change', (e) => {
      this.settings.overlayUpdate = e.target.value;
      this.settings.preset = this._detectPreset();
      this._syncUIFromSettings();
      this._applyOverlayUpdate();
      this._saveToStorage();
    });
    this.elements.aabbSampling?.addEventListener('change', (e) => {
      this.settings.aabbSampling = e.target.checked;
      this.settings.preset = this._detectPreset();
      this._syncUIFromSettings();
      this._saveToStorage();
    });
    this.elements.aabbSamples?.addEventListener('change', (e) => {
      this.settings.aabbSamples = e.target.value;
      this.settings.preset = this._detectPreset();
      this._syncUIFromSettings();
      this._saveToStorage();
    });

    this.elements.seqCacheLimit?.addEventListener('change', (e) => {
      this.settings.seqCacheLimit = e.target.value;
      this._saveToStorage();
    });

    this.elements.seqPrefetchDepth?.addEventListener('change', (e) => {
      this.settings.seqPrefetchDepth = e.target.value;
      this._saveToStorage();
    });

    this.elements.seqPrefetchDirMode?.addEventListener('change', (e) => {
      this.settings.seqPrefetchDirMode = e.target.value;
      this._saveToStorage();
    });

    this.elements.seqScrubbing?.addEventListener('change', (e) => {
      this.settings.seqScrubbing = !!e.target.checked;
      this._saveToStorage();
    });

    this.elements.seqScrubWindow?.addEventListener('change', (e) => {
      this.settings.seqScrubWindow = e.target.value;
      this._saveToStorage();
    });

    this.elements.seqScrubDelta?.addEventListener('change', (e) => {
      this.settings.seqScrubDelta = e.target.value;
      this._saveToStorage();
    });

    this.elements.seqPrefetchConcurrency?.addEventListener('change', (e) => {
      this.settings.seqPrefetchConcurrency = e.target.value;
      this._saveToStorage();
    });

    this.elements.seqMemoryPressure?.addEventListener('change', (e) => {
      this.settings.seqMemoryPressure = e.target.value;
      this._saveToStorage();
    });
    this.elements.resetBtn?.addEventListener('click', () => {
      this.reset();
    });
  }

  _applyPreset(presetName) {
    const preset = PRESETS[presetName];
    if (!preset) return;
    
    this.settings.preset = presetName;
    this.settings.dprCap = preset.dprCap;
    this.settings.cameraThrottle = preset.cameraThrottle;
    this.settings.overlayUpdate = preset.overlayUpdate;
    this.settings.aabbSampling = preset.aabbSampling;
    this.settings.aabbSamples = preset.aabbSamples;
    
    this._syncUIFromSettings();
    this._applyAllSettings();
    this._saveToStorage();
  }
  
  _detectPreset() {
    for (const [name, preset] of Object.entries(PRESETS)) {
      if (
        this.settings.dprCap === preset.dprCap &&
        this.settings.cameraThrottle === preset.cameraThrottle &&
        this.settings.overlayUpdate === preset.overlayUpdate &&
        this.settings.aabbSampling === preset.aabbSampling
      ) {
        return name;
      }
    }
    return 'custom';
  }

  _syncUIFromSettings() {
    if (this.elements.preset) {
      if (this.settings.preset === 'custom') {
        this.elements.preset.value = 'balanced';
      } else {
        this.elements.preset.value = this.settings.preset;
      }
    }
    
    if (this.elements.dprCap) {
      this.elements.dprCap.value = this.settings.dprCap;
    }
    
    if (this.elements.cameraThrottle) {
      this.elements.cameraThrottle.value = this.settings.cameraThrottle;
    }
    
    if (this.elements.overlayUpdate) {
      this.elements.overlayUpdate.value = this.settings.overlayUpdate;
    }
    
    if (this.elements.aabbSampling) {
      this.elements.aabbSampling.checked = this.settings.aabbSampling;
    }
    
    if (this.elements.aabbSamples) {
      this.elements.aabbSamples.value = this.settings.aabbSamples;
    }

    if (this.elements.seqCacheLimit) {
      this.elements.seqCacheLimit.value = this.settings.seqCacheLimit;
    }
    if (this.elements.seqPrefetchDepth) {
      this.elements.seqPrefetchDepth.value = this.settings.seqPrefetchDepth;
    }
    if (this.elements.seqPrefetchDirMode) {
      this.elements.seqPrefetchDirMode.value = this.settings.seqPrefetchDirMode;
    }
    if (this.elements.seqScrubbing) {
      this.elements.seqScrubbing.checked = !!this.settings.seqScrubbing;
    }
    if (this.elements.seqScrubWindow) {
      this.elements.seqScrubWindow.value = this.settings.seqScrubWindow;
    }
    if (this.elements.seqScrubDelta) {
      this.elements.seqScrubDelta.value = this.settings.seqScrubDelta;
    }
    if (this.elements.seqPrefetchConcurrency) {
      this.elements.seqPrefetchConcurrency.value = this.settings.seqPrefetchConcurrency;
    }
    if (this.elements.seqMemoryPressure) {
      this.elements.seqMemoryPressure.value = this.settings.seqMemoryPressure;
    }
    if (this.elements.aabbSamplesRow) {
      this.elements.aabbSamplesRow.style.display = this.settings.aabbSampling ? 'flex' : 'none';
    }
  }

  _applyAllSettings() {
    this._applyDprCap();
    this._applyCameraThrottle();
    this._applyOverlayUpdate();
  }

  _applyDprCap() {
    const cap = parseFloat(this.settings.dprCap);
    if (!this.viewer?.app?.graphicsDevice) return;
    try {
      this.viewer.app.graphicsDevice.maxPixelRatio = cap;
      this.viewer.app.resizeCanvas();
    } catch (err) {}
  }

  _applyCameraThrottle() {
    if (this._cameraThrottleInterval) {
      clearInterval(this._cameraThrottleInterval);
      this._cameraThrottleInterval = null;
    }
    const mode = this.settings.cameraThrottle;
    if (this.viewer) {
      this.viewer._cameraThrottleMode = mode;
    }
  }

  requestCameraUpdate(updateFn) {
    const mode = this.settings.cameraThrottle;
    const now = performance.now();
    switch (mode) {
      case 'every':
        updateFn();
        break;
      case 'raf':
        if (!this._cameraUpdatePending) {
          this._cameraUpdatePending = true;
          requestAnimationFrame(() => {
            updateFn();
            this._cameraUpdatePending = false;
          });
        }
        break;
      case 'low':
        if (now - this._lastCameraUpdateTime >= 33) {
          updateFn();
          this._lastCameraUpdateTime = now;
        }
        break;
    }
  }

  _applyOverlayUpdate() {
    const mode = this.settings.overlayUpdate;
    if (this.viewer) {
      this.viewer._overlayUpdateMode = mode;
    }
  }

  shouldUpdateOverlay(isVisible) {
    const mode = this.settings.overlayUpdate;
    const now = performance.now();
    
    switch (mode) {
      case 'always':
        return true;
        
      case 'visible':
        return isVisible;
        
      case 'throttled':
        if (!isVisible) return false;
        if (now - this._lastOverlayUpdateTime >= 33) {
          this._lastOverlayUpdateTime = now;
          return true;
        }
        return false;
        
      case 'off':
        return false;
    }
    
    return true;
  }

  getAabbSettings() {
    return {
      enabled: this.settings.aabbSampling,
      sampleCount: parseInt(this.settings.aabbSamples, 10)
    };
  }

  computeSampledAabb(splatData, margin = 0.1) {
    if (!this.settings.aabbSampling) return null;
    if (!splatData) return null;
    
    const pc = window.pc;
    if (!pc) return null;
    
    try {
      const numSplats = splatData.numSplats;
      const sampleCount = Math.min(parseInt(this.settings.aabbSamples, 10), numSplats);
      
      if (sampleCount <= 0) return null;
      const step = Math.max(1, Math.floor(numSplats / sampleCount));
      
      let minX = Infinity, minY = Infinity, minZ = Infinity;
      let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
      const xProp = splatData.getProp('x');
      const yProp = splatData.getProp('y');
      const zProp = splatData.getProp('z');
      
      if (!xProp || !yProp || !zProp) return null;
      
      for (let i = 0; i < numSplats; i += step) {
        const x = xProp[i];
        const y = yProp[i];
        const z = zProp[i];
        
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        if (z < minZ) minZ = z;
        if (z > maxZ) maxZ = z;
      }
      const dx = (maxX - minX) * margin;
      const dy = (maxY - minY) * margin;
      const dz = (maxZ - minZ) * margin;
      
      minX -= dx; maxX += dx;
      minY -= dy; maxY += dy;
      minZ -= dz; maxZ += dz;
      
      const center = new pc.Vec3(
        (minX + maxX) / 2,
        (minY + maxY) / 2,
        (minZ + maxZ) / 2
      );
      const halfExtents = new pc.Vec3(
        (maxX - minX) / 2,
        (maxY - minY) / 2,
        (maxZ - minZ) / 2
      );
      
      return new pc.BoundingBox(center, halfExtents);
    } catch (err) {
      return null;
    }
  }

  _saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
    } catch (err) {}
  }

  _loadFromStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.settings = { ...DEFAULTS, ...parsed };
      }
    } catch (err) {
      this.settings = { ...DEFAULTS };
    }
  }

  reset() {
    this.settings = { ...DEFAULTS };
    this._syncUIFromSettings();
    this._applyAllSettings();
    this._saveToStorage();
  }

  getSettings() {
    return { ...this.settings };
  }
}
