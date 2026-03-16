/**
 * Timeline ticks rendering.
 */

export class TicksRenderer {
  /**
   * @param {HTMLElement} ticksEl - ticks container
   */
  constructor(ticksEl) {
    /** @type {HTMLElement} */
    this._ticksEl = ticksEl;
  }

  /**
   * Render timeline ticks (frames 0 .. totalFrames-1).
   * @param {number} totalFrames - total frame count
   */
  render(totalFrames) {
    if (!this._ticksEl) return;
    
    this._ticksEl.innerHTML = "";
    
    const maxFrame = Math.max(0, totalFrames - 1);
    // 10 segments: 0%..100% mapped to 0..maxFrame
    for (let i = 0; i < 10; i++) {
      const position = (i + 0.5) * 10;
      const frame = maxFrame <= 0 ? 0 : Math.round((position / 100) * maxFrame);

      const label = document.createElement('span');
      label.className = 'timeline__tick-label';
      label.style.left = `${position}%`;
      label.textContent = `${frame}`;

      this._ticksEl.appendChild(label);
    }
  }
}

export default TicksRenderer;
