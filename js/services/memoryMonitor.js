export class MemoryMonitor {
  constructor({ element, viewerGetter, intervalMs = 500 } = {}) {
    this.element = element || null;
    this.viewerGetter = viewerGetter || null;
    this.intervalMs = intervalMs;

    this.currentRam = 0;
    this.currentVram = 0;

    this.taskStartTime = null;
    this.taskStartRam = 0;
    this.taskStartVram = 0;
    this.taskLabel = '';

    this.peakRam = 0;
    this.peakVram = 0;

    this.lastSample = null;
    this.lastSessionId = null;
    this.lastDisposeSamples = {
      immediate: null,
      raf: null,
      after500ms: null,
    };

    this._timer = null;
  }

  start() {
    if (this._timer) return;
    this._update();
    this._timer = window.setInterval(() => this._update(), this.intervalMs);
  }

  stop() {
    if (!this._timer) return;
    window.clearInterval(this._timer);
    this._timer = null;
  }

  startTask(label = '') {
    this.taskLabel = String(label || '');
    this.taskStartTime = performance.now();
    this.taskStartRam = this.currentRam;
    this.taskStartVram = this.currentVram;
    this._render();
  }

  endTask() {
    if (this.taskStartTime == null) return;

    const duration = performance.now() - this.taskStartTime;
    const ramDelta = this.currentRam - this.taskStartRam;
    const vramDelta = this.currentVram - this.taskStartVram;

    this.taskStartTime = null;
    this.taskLabel = '';
    this._render();
  }

  _update() {
    const s = this._measure();
    this.lastSample = { ...s, phase: 'interval', sessionId: this.lastSessionId || null };
    this.currentRam = s.heapMb;
    this.currentVram = s.vramMb;

    this.peakRam = Math.max(this.peakRam, this.currentRam);
    this.peakVram = Math.max(this.peakVram, this.currentVram);

    this._render();
  }

  sample({ sessionId, phase } = {}) {
    const s = this._measure();
    this.lastSample = { ...s, phase: String(phase || ''), sessionId: sessionId || null };
    if (sessionId) this.lastSessionId = sessionId;

    const p = String(phase || '').toLowerCase();
    if (p.includes('dispose_immediate')) this.lastDisposeSamples.immediate = this.lastSample;
    if (p.includes('dispose_raf')) this.lastDisposeSamples.raf = this.lastSample;
    if (p.includes('dispose_500ms')) this.lastDisposeSamples.after500ms = this.lastSample;

    this.currentRam = s.heapMb;
    this.currentVram = s.vramMb;
    this.peakRam = Math.max(this.peakRam, this.currentRam);
    this.peakVram = Math.max(this.peakVram, this.currentVram);
    this._render();
  }

  _measure() {
    let heapMb = 0;
    let heapSupported = false;
    if (performance.memory && typeof performance.memory.usedJSHeapSize === 'number') {
      heapSupported = true;
      heapMb = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
    }

    let vramMb = 0;
    let vramDetail = null;
    const viewer = this.viewerGetter?.();
    const gd = viewer?.app?.graphicsDevice;
    const vram = gd?._vram;
    if (vram && typeof vram === 'object') {
      const tex = Number(vram.tex) || 0;
      const vb = Number(vram.vb) || 0;
      const ib = Number(vram.ib) || 0;
      const ub = Number(vram.ub) || 0;
      const sb = Number(vram.sb) || 0;
      const bytes = tex + vb + ib + ub + sb;
      vramMb = Math.round(bytes / 1024 / 1024);
      vramDetail = {
        texMb: Math.round(tex / 1024 / 1024),
        vbMb: Math.round(vb / 1024 / 1024),
        ibMb: Math.round(ib / 1024 / 1024),
        ubMb: Math.round(ub / 1024 / 1024),
        sbMb: Math.round(sb / 1024 / 1024),
      };
    }

    const splatCount = viewer?.getAllSplats?.()?.length ?? 0;

    return {
      tsMs: performance.now(),
      heapMb,
      heapSupported,
      vramMb,
      vramDetail,
      splatCount,
    };
  }

  _render() {
    if (!this.element) return;

    const heapText = performance.memory ? `${this.currentRam}MB` : `N/A`;
    const splats = this.lastSample?.splatCount ?? 0;
    const vd = this.lastSample?.vramDetail;
    const vramParts = vd ? ` (T${vd.texMb} V${vd.vbMb} I${vd.ibMb} U${vd.ubMb} S${vd.sbMb})` : '';
    const text = `Heap ${heapText} / VRAM ${this.currentVram}MB${vramParts} / Splats ${splats}`;
    this.element.textContent = text;
  }
}

export default MemoryMonitor;
