/** PlayCanvas infinite grid: small/large lines, X/Z axes, distance fade. */
/** 통합 gsplat 메시는 기본 drawBucket 127. 그리드를 128로 두어 투명 패스에서 먼저 그린 뒤 깊이를 쓰면, 스플랫이 depth test로 앞에서 그리드를 가린다. */
const GRID_DRAW_BUCKET = 128;

export class InfiniteGrid {
  constructor(app, options = {}) {
    const pc = window.pc;
    if (!pc || !app) {
      throw new Error("[InfiniteGrid] PlayCanvas app이 필요합니다.");
    }

    this.app = app;
    this.pc = pc;
    this.config = {
      tileSize: options.tileSize ?? 50,
      smallGridSize: options.smallGridSize ?? 1,
      largeGridSize: options.largeGridSize ?? 10,
      radius: options.radius ?? 4,
      staticExtent: options.staticExtent ?? 100,
      y: options.y ?? 0,
      smallGridColor: options.smallGridColor ?? [0.3, 0.3, 0.3, 0.5],
      largeGridColor: options.largeGridColor ?? [0.5, 0.5, 0.5, 0.8],
      axisXColor: options.axisXColor ?? [1.0, 0.0, 0.0, 1.0],
      axisZColor: options.axisZColor ?? [0.0, 0.3, 1.0, 1.0],
      fadeStart: options.fadeStart ?? 30,
      fadeEnd: options.fadeEnd ?? 150,
    };
    this._tiles = new Map();
    this._pool = [];
    this._lastCx = null;
    this._lastCz = null;
    this._updateHandler = null;
    this._visible = true;
    this._camera = null;
    this._material = null;
    this._axisMaterial = null;
    this._axisX = null;
    this._axisZ = null;
    this._centerWhiteAxes = null;
    this.rootEntity = new pc.Entity("InfiniteGrid");
    this.app.root.addChild(this.rootEntity);
    this._createMaterials();
    this._createAxes();
    this._createCenterWhiteAxes();

  }

  attachCamera(cameraEntity) {
    this._camera = cameraEntity;
  }

  start() {
    if (this._updateHandler) return;
    
    this._updateHandler = () => this._update();
    this.app.on("update", this._updateHandler);
  }

  stop() {
    if (this._updateHandler) {
      this.app.off("update", this._updateHandler);
      this._updateHandler = null;
    }
  }

  dispose() {
    this.stop();
    this._tiles.forEach(t => t.destroy());
    this._tiles.clear();
    this._pool.forEach(t => t.destroy());
    this._pool.length = 0;
    if (this._centerWhiteAxes) {
      this._centerWhiteAxes.destroy();
      this._centerWhiteAxes = null;
    }
    if (this.rootEntity) {
      this.rootEntity.destroy();
      this.rootEntity = null;
    }
  }

  setVisible(visible) {
    this._visible = visible;
    if (this.rootEntity) this.rootEntity.enabled = visible;
  }

  toggleVisible() {
    this.setVisible(!this._visible);
    return this._visible;
  }

  isVisible() {
    return this._visible;
  }

  _createMaterials() {
    const pc = this.pc;
    this._material = new pc.StandardMaterial();
    this._material.useLighting = false;
    this._material.useFog = true;
    this._material.emissive = new pc.Color(1, 1, 1);
    this._material.emissiveVertexColor = true;
    this._material.blendType = pc.BLEND_NORMAL;
    this._material.cull = pc.CULLFACE_NONE;
    // 통합 gsplat은 depthWrite=false. 그리드가 먼저 그려지며 depth를 쓰면 스플랫 프래그먼트가 앞/뒤를 올바르게 분기한다 (drawBucket은 _applyGridMeshInstance 참고).
    this._material.depthTest = true;
    this._material.depthWrite = true;
    this._material.update();
  }

  /**
   * @param {import('playcanvas').MeshInstance | null | undefined} meshInstance
   */
  _applyGridMeshInstance(meshInstance) {
    if (!meshInstance) return;
    meshInstance.drawBucket = GRID_DRAW_BUCKET;
  }

  _createCenterWhiteAxes() {
    const pc = this.pc;
    const half = 0.05;
    const halfWidth = 0.025;
    const y = 0.001;
    const white = [255, 255, 255, 255];
    const x1 = -half; const x2 = half;
    const xPositions = [
      x1, y, -halfWidth, x1, y, halfWidth, x2, y, halfWidth,
      x1, y, -halfWidth, x2, y, halfWidth, x2, y, -halfWidth,
    ];
    const zPositions = [
      -halfWidth, y, -half, halfWidth, y, -half, halfWidth, y, half,
      -halfWidth, y, -half, halfWidth, y, half, -halfWidth, y, half,
    ];
    const positions = [...xPositions, ...zPositions];
    const colors = new Uint8Array(12 * 4);
    for (let i = 0; i < 12; i++) colors.set(white, i * 4);

    const mesh = new pc.Mesh(this.app.graphicsDevice);
    mesh.setPositions(new Float32Array(positions));
    mesh.setColors32(colors);
    mesh.update(pc.PRIMITIVE_TRIANGLES);

    this._centerWhiteAxes = new pc.Entity("CenterWhiteAxes");
    const centerMi = new pc.MeshInstance(mesh, this._material);
    this._applyGridMeshInstance(centerMi);
    this._centerWhiteAxes.addComponent("render", {
      meshInstances: [centerMi],
      castShadows: false,
      receiveShadows: false,
    });
    this.rootEntity.addChild(this._centerWhiteAxes);
  }

  _createAxes() {
    const cfg = this.config;
    const extent = cfg.staticExtent;
    this._axisX = this._createAxisLine(-extent, extent, cfg.axisXColor, [1, 0, 0], "AxisX");
    this._axisZ = this._createAxisLine(-extent, extent, cfg.axisZColor, [0, 0, 1], "AxisZ");
  }

  _createAxisLine(minVal, maxVal, color, dir, name) {
    const pc = this.pc;
    const half = (maxVal - minVal) / 2;
    const width = 0.05;
    const perpDir = dir[0] === 1 ? [0, 0, 1] : [1, 0, 0];
    const halfWidth = width / 2;

    const x1 = -dir[0] * half - perpDir[0] * halfWidth;
    const z1 = -dir[2] * half - perpDir[2] * halfWidth;
    const x2 = -dir[0] * half + perpDir[0] * halfWidth;
    const z2 = -dir[2] * half + perpDir[2] * halfWidth;
    const x3 = dir[0] * half + perpDir[0] * halfWidth;
    const z3 = dir[2] * half + perpDir[2] * halfWidth;
    const x4 = dir[0] * half - perpDir[0] * halfWidth;
    const z4 = dir[2] * half - perpDir[2] * halfWidth;

    const positions = [
      x1, 0.001, z1, x2, 0.001, z2, x3, 0.001, z3,
      x1, 0.001, z1, x3, 0.001, z3, x4, 0.001, z4,
    ];
    const colors = new Uint8Array([
      color[0] * 255, color[1] * 255, color[2] * 255, color[3] * 255,
      color[0] * 255, color[1] * 255, color[2] * 255, color[3] * 255,
      color[0] * 255, color[1] * 255, color[2] * 255, color[3] * 255,
      color[0] * 255, color[1] * 255, color[2] * 255, color[3] * 255,
      color[0] * 255, color[1] * 255, color[2] * 255, color[3] * 255,
      color[0] * 255, color[1] * 255, color[2] * 255, color[3] * 255,
    ]);

    const mesh = new pc.Mesh(this.app.graphicsDevice);
    mesh.setPositions(positions);
    mesh.setColors32(colors);
    mesh.update(pc.PRIMITIVE_TRIANGLES);

    const entity = new pc.Entity(name);
    const axisMi = new pc.MeshInstance(mesh, this._material);
    this._applyGridMeshInstance(axisMi);
    entity.addComponent("render", {
      meshInstances: [axisMi],
      castShadows: false,
      receiveShadows: false,
    });
    const center = (minVal + maxVal) / 2;
    if (dir[0] === 1) entity.setLocalPosition(center, 0, 0);
    else entity.setLocalPosition(0, 0, center);
    this.rootEntity.addChild(entity);
    return { entity, mesh };
  }

  _updateAxisLineExtent(axis, minVal, maxVal, isXAxis) {
    if (!axis) return;
    const pc = this.pc;
    const width = 0.05;
    const halfWidth = width / 2;
    const half = (maxVal - minVal) / 2;
    const center = (minVal + maxVal) / 2;

    if (isXAxis) {
      axis.entity.setLocalPosition(center, 0, 0);
      const positions = [
        -half, 0.001, -halfWidth, -half, 0.001, halfWidth, half, 0.001, halfWidth,
        -half, 0.001, -halfWidth, half, 0.001, halfWidth, half, 0.001, -halfWidth,
      ];
      axis.mesh.setPositions(positions);
    } else {
      axis.entity.setLocalPosition(0, 0, center);
      const positions = [
        -halfWidth, 0.001, -half, halfWidth, 0.001, -half, halfWidth, 0.001, half,
        -halfWidth, 0.001, -half, halfWidth, 0.001, half, -halfWidth, 0.001, half,
      ];
      axis.mesh.setPositions(positions);
    }
    axis.mesh.update(pc.PRIMITIVE_TRIANGLES);
  }

  _update() {
    if (!this._camera || !this._visible) return;

    const cfg = this.config;
    const pos = this._camera.getPosition();
    const extent = cfg.staticExtent;
    const margin = cfg.tileSize * 2;
    const minX = Math.min(-extent, pos.x - margin);
    const maxX = Math.max(extent, pos.x + margin);
    const minZ = Math.min(-extent, pos.z - margin);
    const maxZ = Math.max(extent, pos.z + margin);
    if (this._axisX) this._updateAxisLineExtent(this._axisX, minX, maxX, true);
    if (this._axisZ) this._updateAxisLineExtent(this._axisZ, minZ, maxZ, false);

    const cx = Math.floor(pos.x / cfg.tileSize);
    const cz = Math.floor(pos.z / cfg.tileSize);

    if (cx === this._lastCx && cz === this._lastCz) return;
    this._lastCx = cx;
    this._lastCz = cz;

    const needed = new Set();
    const r = cfg.radius;
    for (let dz = -r; dz <= r; dz++) {
      for (let dx = -r; dx <= r; dx++) {
        const tx = cx + dx;
        const tz = cz + dz;
        const key = `${tx},${tz}`;
        needed.add(key);

        if (!this._tiles.has(key)) {
          const tile = this._acquireTile(tx, tz);
          this._tiles.set(key, tile);
        }
      }
    }
    for (const [key, tile] of this._tiles) {
      if (!needed.has(key)) {
        this.rootEntity.removeChild(tile);
        tile.enabled = false;
        this._pool.push(tile);
        this._tiles.delete(key);
      }
    }
  }

  _acquireTile(tx, tz) {
    const cfg = this.config;
    let tile;
    
    if (this._pool.length > 0) {
      tile = this._pool.pop();
      tile.enabled = true;
    } else {
      tile = this._createTile();
    }
    
    tile.setLocalPosition(tx * cfg.tileSize, cfg.y, tz * cfg.tileSize);
    this.rootEntity.addChild(tile);
    return tile;
  }

  _createTile() {
    const pc = this.pc;
    const cfg = this.config;
    const size = cfg.tileSize;
    const half = size / 2;
    
    const positions = [];
    const colors = [];
    
    const smallColor = cfg.smallGridColor;
    const largeColor = cfg.largeGridColor;
    const smallStep = cfg.smallGridSize;
    const smallCount = Math.floor(size / smallStep);
    
    for (let i = 0; i <= smallCount; i++) {
      const offset = -half + i * smallStep;
      if (i % (cfg.largeGridSize / cfg.smallGridSize) === 0) continue;
      positions.push(-half, 0, offset, half, 0, offset);
      colors.push(...smallColor, ...smallColor);
      positions.push(offset, 0, -half, offset, 0, half);
      colors.push(...smallColor, ...smallColor);
    }
    const largeStep = cfg.largeGridSize;
    const largeCount = Math.floor(size / largeStep);
    
    for (let i = 0; i <= largeCount; i++) {
      const offset = -half + i * largeStep;
      positions.push(-half, 0, offset, half, 0, offset);
      colors.push(...largeColor, ...largeColor);
      positions.push(offset, 0, -half, offset, 0, half);
      colors.push(...largeColor, ...largeColor);
    }
    const posArray = new Float32Array(positions);
    const colArray = new Uint8Array(colors.map(c => Math.floor(c * 255)));

    const mesh = new pc.Mesh(this.app.graphicsDevice);
    mesh.setPositions(posArray);
    mesh.setColors32(colArray);
    mesh.update(pc.PRIMITIVE_LINES);

    const entity = new pc.Entity("GridTile");
    const tileMi = new pc.MeshInstance(mesh, this._material);
    this._applyGridMeshInstance(tileMi);
    entity.addComponent("render", {
      meshInstances: [tileMi],
      castShadows: false,
      receiveShadows: false,
    });

    return entity;
  }
}
export function createInfiniteGrid(app, options) {
  return new InfiniteGrid(app, options);
}

