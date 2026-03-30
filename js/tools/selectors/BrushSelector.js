/** Brush drag selection; coords in CSS pixels. */

export class BrushSelector {
  constructor(viewer, canvas) {
    this.viewer = viewer;
    this.canvas = canvas;
    this.brushRadius = 30;
    this.selectedIndices = new Set();
  }

  /** Reset selection for new stroke. */
  startSelection() {
    this.selectedIndices.clear();
  }

  /** Add points under brush; returns current selected indices. */
  select(canvasX, canvasY, gsplatEntity, getWorldTransform) {
    if (!gsplatEntity?.gsplat) return [];
    
    const camera = this.viewer.app.root.findByName('MainCamera');
    if (!camera) return [];
    
    const resource = typeof this.getResource === 'function' ? this.getResource(gsplatEntity) : (gsplatEntity.gsplat?.instance?.resource);
    if (!resource) return [];
    
    const centers = resource.centers;
    const count = centers ? Math.floor(centers.length / 3) : 0;
    if (!count) return [];

    const brushX = canvasX;
    const brushY = canvasY;
    const brushRadiusSq = this.brushRadius * this.brushRadius;
    const canvasRect = this.canvas.getBoundingClientRect();
    const screenWidth = canvasRect.width;
    const screenHeight = canvasRect.height;
    
    const wt = getWorldTransform(gsplatEntity);
    const tmp = new pc.Vec3();
    const screenPos = new pc.Vec3();
    
    for (let i = 0; i < count; i++) {
      if (this.selectedIndices.has(i)) continue;
      
      tmp.set(centers[i * 3], centers[i * 3 + 1], centers[i * 3 + 2]);
      wt.transformPoint(tmp, tmp);
      camera.camera.worldToScreen(tmp, screenPos);
      if (screenPos.z < 0) continue;
      if (screenPos.x < 0 || screenPos.x > screenWidth || 
          screenPos.y < 0 || screenPos.y > screenHeight) continue;
      
      const dx = screenPos.x - brushX;
      const dy = screenPos.y - brushY;
      const distSq = dx * dx + dy * dy;
      
      if (distSq <= brushRadiusSq) {
        this.selectedIndices.add(i);
      }
    }
    
    return Array.from(this.selectedIndices);
  }

  /** Set brush radius (clamped 5–200). */
  setRadius(radius) {
    this.brushRadius = Math.max(5, Math.min(200, radius));
  }

  /** Get brush radius. */
  getRadius() {
    return this.brushRadius;
  }
}
