/** Rectangle drag selection; selectionRect in CSS pixels. */

export class RectangleSelector {
  constructor(viewer, canvas) {
    this.viewer = viewer;
    this.canvas = canvas;
  }

  /** Return indices of points inside selectionRect. */
  select(selectionRect, gsplatEntity, getWorldTransform) {
    if (!gsplatEntity?.gsplat) return [];
    
    const camera = this.viewer.app.root.findByName('MainCamera');
    if (!camera) return [];
    
    const instance = gsplatEntity.gsplat?.instance;
    const resource = instance?.resource;
    if (!resource) return [];
    
    const centers = resource.centers;
    const count = centers ? Math.floor(centers.length / 3) : 0;
    if (!count) return [];

    const minX = selectionRect.minX;
    const minY = selectionRect.minY;
    const maxX = selectionRect.maxX;
    const maxY = selectionRect.maxY;
    const canvasRect = this.canvas.getBoundingClientRect();
    const screenWidth = canvasRect.width;
    const screenHeight = canvasRect.height;
    
    const selectedIndices = [];
    const wt = getWorldTransform(gsplatEntity);
    const tmp = new pc.Vec3();
    const screenPos = new pc.Vec3();
    
    for (let i = 0; i < count; i++) {
      tmp.set(centers[i * 3], centers[i * 3 + 1], centers[i * 3 + 2]);
      wt.transformPoint(tmp, tmp);
      camera.camera.worldToScreen(tmp, screenPos);
      if (screenPos.z < 0) continue;
      if (screenPos.x < 0 || screenPos.x > screenWidth || 
          screenPos.y < 0 || screenPos.y > screenHeight) continue;
      
      if (screenPos.x >= minX && screenPos.x <= maxX && 
          screenPos.y >= minY && screenPos.y <= maxY) {
        selectedIndices.push(i);
      }
    }
    
    return selectedIndices;
  }
}
