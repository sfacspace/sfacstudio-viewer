/** SVG overlay and visual rendering for selection (rect, brush circle). */
export class SelectionRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.eventLayer = null;
    this.svg = null;
    this.rectElement = null;
    this.brushCircle = null;
    this.brushSizeText = null;
    
    this.init();
  }

  init() {
    this.eventLayer = document.createElement('div');
    this.eventLayer.id = 'selectionEventLayer';
    this.eventLayer.style.position = 'absolute';
    this.eventLayer.style.pointerEvents = 'none';
    this.eventLayer.style.zIndex = '5';
    this.eventLayer.style.display = 'none';
    this.eventLayer.style.cursor = 'crosshair';
    document.body.appendChild(this.eventLayer);

    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.id = 'selectionOverlay';
    this.svg.style.position = 'absolute';
    this.svg.style.pointerEvents = 'none';
    this.svg.style.zIndex = '6';
    this.svg.style.display = 'none';

    this.rectElement = document.createElementNS(this.svg.namespaceURI, 'rect');
    this.rectElement.setAttribute('fill', 'rgba(201, 161, 60, 0.1)');
    this.rectElement.setAttribute('stroke', 'rgba(201, 161, 60, 0.8)');
    this.rectElement.setAttribute('stroke-width', '2');
    this.svg.appendChild(this.rectElement);

    this.brushCircle = document.createElementNS(this.svg.namespaceURI, 'circle');
    this.brushCircle.setAttribute('fill', 'rgba(201, 161, 60, 0.1)');
    this.brushCircle.setAttribute('stroke', 'rgba(201, 161, 60, 0.8)');
    this.brushCircle.setAttribute('stroke-width', '2');
    this.brushCircle.style.display = 'none';
    this.svg.appendChild(this.brushCircle);

    this.brushSizeText = document.createElementNS(this.svg.namespaceURI, 'text');
    this.brushSizeText.setAttribute('fill', 'rgba(201, 161, 60, 0.8)');
    this.brushSizeText.setAttribute('font-size', '14');
    this.brushSizeText.setAttribute('font-family', 'monospace');
    this.brushSizeText.style.display = 'none';
    this.svg.appendChild(this.brushSizeText);
    
    document.body.appendChild(this.svg);

    window.addEventListener('resize', () => {
      this.updateOverlaySize();
    });
    
    this.updateOverlaySize();
  }

  updateOverlaySize() {
    if (!this.canvas || !this.svg || !this.eventLayer) return;
    
    const rect = this.canvas.getBoundingClientRect();
    
    const updateElement = (el) => {
      el.style.left = `${rect.left}px`;
      el.style.top = `${rect.top}px`;
      el.style.width = `${rect.width}px`;
      el.style.height = `${rect.height}px`;
    };
    
    updateElement(this.eventLayer);
    updateElement(this.svg);
    this.svg.setAttribute('viewBox', `0 0 ${rect.width} ${rect.height}`);
  }

  show() {
    if (this.eventLayer) this.eventLayer.style.display = 'block';
    if (this.svg) this.svg.style.display = 'block';
  }

  hide() {
    if (this.eventLayer) this.eventLayer.style.display = 'none';
    if (this.svg) this.svg.style.display = 'none';
    if (this.brushCircle) this.brushCircle.style.display = 'none';
    if (this.brushSizeText) this.brushSizeText.style.display = 'none';
  }

  updateRect(start, end) {
    const x = Math.min(start.x, end.x);
    const y = Math.min(start.y, end.y);
    const width = Math.abs(end.x - start.x);
    const height = Math.abs(end.y - start.y);
    
    this.rectElement.setAttribute('x', x.toString());
    this.rectElement.setAttribute('y', y.toString());
    this.rectElement.setAttribute('width', width.toString());
    this.rectElement.setAttribute('height', height.toString());
  }

  showRect() {
    if (this.rectElement) this.rectElement.style.display = 'block';
  }

  hideRect() {
    if (this.rectElement) this.rectElement.style.display = 'none';
  }

  updateBrushCircle(canvasX, canvasY, radius) {
    this.brushCircle.setAttribute('cx', canvasX.toString());
    this.brushCircle.setAttribute('cy', canvasY.toString());
    this.brushCircle.setAttribute('r', radius.toString());
    this.brushSizeText.setAttribute('x', (canvasX + radius + 10).toString());
    this.brushSizeText.setAttribute('y', (canvasY - radius - 5).toString());
    this.brushSizeText.textContent = `R: ${Math.round(radius)}`;
  }

  showBrushCircle() {
    if (this.brushCircle) this.brushCircle.style.display = 'block';
    if (this.brushSizeText) this.brushSizeText.style.display = 'block';
  }

  hideBrushCircle() {
    if (this.brushCircle) this.brushCircle.style.display = 'none';
    if (this.brushSizeText) this.brushSizeText.style.display = 'none';
  }

  destroy() {
    if (this.eventLayer?.parentNode) {
      this.eventLayer.parentNode.removeChild(this.eventLayer);
    }
    if (this.svg?.parentNode) {
      this.svg.parentNode.removeChild(this.svg);
    }
  }
}
