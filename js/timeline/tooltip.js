/**
 * Timeline tooltip manager.
 */

export class TooltipManager {
  constructor() {
    /** @type {HTMLElement|null} */
    this._tooltipEl = null;
  }

  /** Create time tooltip element. */
  init() {
    if (this._tooltipEl) return;
    
    const tooltip = document.createElement("div");
    tooltip.className = "timeline-time-tooltip";
    tooltip.textContent = "0";
    document.body.appendChild(tooltip);
    
    this._tooltipEl = tooltip;
  }

  /**
   * 툴팁 표시
   * @param {number} value
   * @param {number} x - 화면 X 좌표
   * @param {number} y - 화면 Y 좌표
   */
  show(value, x, y) {
    if (!this._tooltipEl) return;
    
    this._tooltipEl.textContent = `${Math.round(Number(value) || 0)}`;
    this._tooltipEl.style.left = `${x}px`;
    this._tooltipEl.style.top = `${y}px`;
    this._tooltipEl.classList.add("is-visible");
  }

  /** Hide tooltip. */
  hide() {
    if (!this._tooltipEl) return;
    this._tooltipEl.classList.remove("is-visible");
  }

  /** Dispose. */
  dispose() {
    if (this._tooltipEl) {
      this._tooltipEl.remove();
      this._tooltipEl = null;
    }
  }
}

export default TooltipManager;
