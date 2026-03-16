/** 2D overlay canvas for selection box/sphere. */
export class SelectorOverlay {
  constructor(canvasId = "selectorOverlay") {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      this.canvas = document.createElement("canvas");
      this.canvas.id = canvasId;
      this.canvas.style.position = "fixed";
      this.canvas.style.left = 0;
      this.canvas.style.top = 0;
      this.canvas.style.right = 0;
      this.canvas.style.bottom = 0;
      this.canvas.style.width = "100vw";
      this.canvas.style.height = "100vh";
      this.canvas.style.pointerEvents = "none";
      this.canvas.style.zIndex = 9999;
      document.body.appendChild(this.canvas);
    }
    this.ctx = this.canvas.getContext("2d");
    this.visible = false;
    this._resizeToWindow();
    window.addEventListener("resize", () => this._resizeToWindow());
  }

  _resizeToWindow() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  show() { this.visible = true; this.canvas.style.display = "block"; }
  hide() { this.visible = false; this.canvas.style.display = "none"; }

  clear() { this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); }

  drawBox(screenRect, color = "#888", lineWidth = 2) {
    if (!this.visible) return;
    this.ctx.save();
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = lineWidth;
    this.ctx.setLineDash([8, 6]);
    this.ctx.strokeRect(screenRect.x, screenRect.y, screenRect.w, screenRect.h);
    this.ctx.restore();
  }

  drawSphere(screenCenter, radius, color = "#888", lineWidth = 2) {
    if (!this.visible) return;
    this.ctx.save();
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = lineWidth;
    this.ctx.setLineDash([8, 6]);
    this.ctx.beginPath();
    this.ctx.arc(screenCenter.x, screenCenter.y, radius, 0, Math.PI * 2);
    this.ctx.stroke();
    this.ctx.restore();
  }
}
