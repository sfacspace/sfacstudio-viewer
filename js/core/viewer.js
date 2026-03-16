/**
 * PlayCanvasViewer – PlayCanvas-based GSplat viewer wrapper.
 * loadSplatFromFile / loadSplatFromUrl; Orbit camera (LMB rotate, wheel zoom, RMB pan);
 * Infinite grid (XZ); Axis gizmo overlay. PlayCanvas 2.15.1.
 */

import { InfiniteGrid } from "../ui/gridDraw.js";
import { loadGSplatDataWithMorton, loadGSplatDataFromUrl } from "./splatLoader.js";

export class PlayCanvasViewer {
  constructor() {
    /** @type {pc.Application|null} */
    this.app = null;
    /** @type {pc.Entity|null} */
    this.cameraEntity = null;
    /** @type {pc.Entity|null} */
    this.splatRoot = null;
    /** @type {pc.Entity|null} */
    this.lightEntity = null;
    /** @type {HTMLCanvasElement|null} */
    this.canvas = null;
    /** @type {boolean} */
    this.initialized = false;
    /** @type {Function|null} */
    this._resizeHandler = null;

    /** @type {number} */
    this._lastDevicePixelRatio = typeof window !== 'undefined' && window.devicePixelRatio ? window.devicePixelRatio : 1;
    /** @type {number|null} */
    this._dprMonitorRaf = null;
    
    /** @type {Map<string, {entity: pc.Entity, asset: pc.Asset, blobUrl: string}>} */
    this._splatMap = new Map();
    /** @type {boolean} */
    this._isLoading = false;

    /** @type {{x:number, y:number, z:number}} orbit target */
    this._orbitTarget = { x: 0, y: 0, z: 0 };
    /** @type {number} camera-to-target distance */
    this._orbitDistance = 6.4;
    /** @type {number} yaw (rad) */
    this._orbitYaw = 0;
    /** @type {number} pitch (rad) */
    this._orbitPitch = 0.7;

    this._orbitTargetTarget = { x: this._orbitTarget.x, y: this._orbitTarget.y, z: this._orbitTarget.z };
    this._orbitDistanceTarget = this._orbitDistance;
    this._orbitYawTarget = this._orbitYaw;
    this._orbitPitchTarget = this._orbitPitch;
    this._orbitSmoothing = 18;
    this._orbitUpdateHandler = null;
    
    this._minDistance = 0.2;
    this._maxDistance = 200;
    this._minPitch = -89.9 * Math.PI / 180;
    this._maxPitch = 89.9 * Math.PI / 180;

    this._orbitSensitivity = 0.005;
    this._panSensitivity = 0.01;
    this._zoomSensitivity = 0.001;


    this._isDragging = false;
    this._isPanning = false;
    this._lastMouseX = 0;
    this._lastMouseY = 0;
    
    this._onMouseDown = null;
    this._onMouseMove = null;
    this._onMouseUp = null;
    this._onWheel = null;
    this._onContextMenu = null;
    
    this._orbitEnabled = true;
    this._orbitTargetMarker = null;
    this._orbitTargetMarkerVisible = false;

    /** @type {Object|null} selected object */
    this._selectedObject = null;

    /** @type {InfiniteGrid|null} */
    this._infiniteGrid = null;
    /** @type {boolean} */
    this._gridVisible = true;

    /** @type {HTMLCanvasElement|null} */
    this._axisGizmoCanvas = null;
    /** @type {CanvasRenderingContext2D|null} */
    this._axisGizmoCtx = null;
    /** @type {boolean} */
    this._axisGizmoVisible = true;
    /** @type {number|null} */
    this._axisGizmoRaf = null;


    this.camera = null;
    this.controls = null;
    this.splatMesh = null;
    this.renderNextFrame = false;
    
    this._cameraThrottleMode = 'raf';
    this._overlayUpdateMode = 'visible';
    this._cameraUpdatePending = false;
    this._lastCameraUpdateTime = 0;
    this._lastOverlayUpdateTime = 0;
  }

  _cleanupSplatResources(splatId, { destroyEntity = true } = {}) {
    const splatData = this._splatMap.get(splatId);
    if (!splatData) return false;
    if (splatData._disposed) {
      try {
        this._splatMap.delete(splatId);
      } catch (e) {
      }
      return true;
    }

    splatData._disposed = true;

    try {
      const ent = splatData.entity;
      if (ent && ent._onSplatDestroy) {
        try {
          ent.off?.('destroy', ent._onSplatDestroy);
        } catch (e) {
        }
        ent._onSplatDestroy = null;
      }
    } catch (e) {
    }

    // Entity
    if (destroyEntity && splatData.entity) {
      try {
        splatData.entity.destroy?.();
      } catch (e) {
      }
    }

    // Asset
    try {
      if (splatData.asset) {
        if (this.app?.assets) {
          try {
            this.app.assets.remove(splatData.asset);
          } catch (e) {
          }
        }
        try {
          splatData.asset.unload?.();
        } catch (e) {
        }
        try {
          splatData.asset.destroy?.();
        } catch (e) {
        }
      }
    } catch (e) {
    }

    // Blob URL
    try {
      if (splatData.blobUrl) {
        URL.revokeObjectURL(splatData.blobUrl);
      }
    } catch (e) {
    }

    try {
      this._splatMap.delete(splatId);
    } catch (e) {
    }
    return true;
  }

  /**
   * Init PlayCanvas application.
   * @param {HTMLCanvasElement|HTMLElement|string} renderContainerOrCanvas
   * @returns {Promise<boolean>}
   */
  async init(renderContainerOrCanvas) {
    if (this.initialized) return true;

    let canvas;
    if (typeof renderContainerOrCanvas === "string") {
      canvas = document.getElementById(renderContainerOrCanvas);
    } else if (renderContainerOrCanvas instanceof HTMLCanvasElement) {
      canvas = renderContainerOrCanvas;
    } else if (renderContainerOrCanvas instanceof HTMLElement) {
      canvas = renderContainerOrCanvas.querySelector("canvas");
    }

    if (!canvas) return false;
    this.canvas = canvas;

    let pc;
    try {
      if (window.pc) {
        pc = window.pc;
      } else {
        const module = await import('playcanvas');
        pc = module;
        window.pc = pc;
      }
    } catch (err) {
      return false;
    }

    if (!pc) return false;

    if (pc.Debug && typeof pc.Debug.log === 'function') {
      pc.Debug.log = function () {};
    }
    try {
      this.app = new pc.Application(canvas, {
        graphicsDeviceOptions: {
          antialias: false,
          alpha: false,
          preserveDrawingBuffer: false,
          preferWebGl2: true,
        },
      });

      // 캔버스 리사이즈 설정
      this.app.setCanvasFillMode(pc.FILLMODE_NONE);
      this.app.setCanvasResolution(pc.RESOLUTION_AUTO);

      // 리사이즈 핸들러 등록
      this._resizeHandler = () => this.resize();
      window.addEventListener("resize", this._resizeHandler);

      // DPR(모니터 이동) 변화 감지: resize 이벤트가 안 뜨는 환경 대응
      this._startDprMonitor();

      // 초기 리사이즈
      this.resize();

      // 앱 시작
      this.app.start();
      if (typeof window.Ammo !== "undefined" && typeof window.Ammo !== "function" && this.app.systems?.rigidbody) {
        this.app.systems.rigidbody.onLibraryLoaded();
        this.app.systems.rigidbody.gravity.set(0, -6, 0);
      }
      this.ensureScene();

      this._initOrbitControls();
      this._createGrid();
      this._initAxisGizmo();
      window.__pcApp = this.app;
      window.__pcCamera = this.cameraEntity;
      window.__pcScene = this.splatRoot;

      this.initialized = true;
      return true;
    } catch (err) {
      return false;
    }
  }

  /** Create camera, splatRoot, light. */
  ensureScene() {
    if (!this.app) return;

    const pc = window.pc;
    if (!pc) return;

    if (!this.cameraEntity) {
      this.cameraEntity = new pc.Entity("MainCamera");
      this.cameraEntity.addComponent("camera", {
        clearColor: new pc.Color(0, 0, 0, 1),
        fov: 60,
        nearClip: 0.1,
        farClip: 1000,
      });
      this.app.root.addChild(this.cameraEntity);
      this._updateCameraFromOrbit();
      this.camera = this.cameraEntity;
    }

    if (!this.splatRoot) {
      this.splatRoot = new pc.Entity("SplatRoot");
      this.app.root.addChild(this.splatRoot);
    }

    if (!this.lightEntity) {
      this.lightEntity = new pc.Entity("DirectionalLight");
      this.lightEntity.addComponent("light", {
        type: "directional",
        color: new pc.Color(1, 1, 1),
        intensity: 1,
      });
      this.lightEntity.setEulerAngles(45, 30, 0);
      this.app.root.addChild(this.lightEntity);
    }

  }

  /** @private */
  _createGrid() {
    if (!this.app) return;

    const pc = window.pc;
    if (!pc) return;

    try {
      this.app.scene.fog.type = pc.FOG_EXP2;
      this.app.scene.fog.color.set(0, 0, 0);
      this.app.scene.fog.density = 0.08;

      this._infiniteGrid = new InfiniteGrid(this.app, {
        tileSize: 10,
        divisionsPerTile: 10,
        radius: 8,
      });

      // 카메라 연결
      if (this.cameraEntity) {
        this._infiniteGrid.attachCamera(this.cameraEntity);
      }

      // 업데이트 시작
      this._infiniteGrid.start();

    } catch (err) {
    }
    if (this._orbitTargetMarkerVisible) {
      this._createOrbitTargetMarker();
    }
  }

  /** @param {boolean} visible */
  setGridVisible(visible) {
    this._gridVisible = visible;
    
    if (this._infiniteGrid) {
      this._infiniteGrid.setVisible(visible);
    }
    
  }

  /** @returns {boolean} */
  toggleGrid() {
    this._gridVisible = !this._gridVisible;
    
    if (this._infiniteGrid) {
      this._infiniteGrid.setVisible(this._gridVisible);
    }
    
    return this._gridVisible;
  }

  /** @returns {boolean} */
  isGridVisible() {
    return this._gridVisible;
  }

  /** @private */
  _initAxisGizmo() {
    let gizmoCanvas = document.getElementById("axisGizmo");
    if (!gizmoCanvas) {
      gizmoCanvas = document.createElement("canvas");
      gizmoCanvas.id = "axisGizmo";
      gizmoCanvas.className = "axis-gizmo";
      gizmoCanvas.width = 150;
      gizmoCanvas.height = 150;
      gizmoCanvas.style.cssText = `
        position: fixed;
        bottom: 18px;
        right: 18px;
        width: 150px;
        height: 150px;
        pointer-events: auto;
        z-index: 100;
        cursor: pointer;
      `;
      document.body.appendChild(gizmoCanvas);
    } else {
      gizmoCanvas.width = 150;
      gizmoCanvas.height = 150;
      gizmoCanvas.style.cssText = `
        position: fixed;
        bottom: 18px;
        right: 18px;
        width: 150px;
        height: 150px;
        pointer-events: auto;
        z-index: 100;
        cursor: pointer;
      `;
    }

    this._axisGizmoCanvas = gizmoCanvas;
    this._axisGizmoCtx = gizmoCanvas.getContext("2d");
    this._axisButtons = [];
    this._onAxisGizmoClick = this._handleAxisGizmoClick.bind(this);
    gizmoCanvas.addEventListener('click', this._onAxisGizmoClick);
    this._startAxisGizmoLoop();
  }

  /** @private */
  _startAxisGizmoLoop() {
    if (this._axisGizmoUpdateHandler) return;

    this._axisGizmoUpdateHandler = () => this._renderAxisGizmo();
    this.app.on("update", this._axisGizmoUpdateHandler);
  }

  /** @private */
  _stopAxisGizmoLoop() {
    if (this._axisGizmoUpdateHandler) {
      this.app.off("update", this._axisGizmoUpdateHandler);
      this._axisGizmoUpdateHandler = null;
    }
  }

  /** @private */
  _createGizmoLayer() {
    const pc = window.pc;
    if (!pc || !this.app || !this.cameraEntity) return;
    
    const layers = this.app.scene.layers;
    let gizmoLayer = layers.getLayerByName("Gizmo");
    if (!gizmoLayer) {
      gizmoLayer = new pc.Layer({
        name: "Gizmo",
        clearDepthBuffer: true,
        opaqueSortMode: pc.SORTMODE_NONE,
        transparentSortMode: pc.SORTMODE_NONE,
      });
      layers.push(gizmoLayer);
    }
    const cameraLayers = this.cameraEntity.camera.layers;
    if (!cameraLayers.includes(gizmoLayer.id)) {
      this.cameraEntity.camera.layers = [...cameraLayers, gizmoLayer.id];
    }
    this._gizmoLayerId = gizmoLayer.id;
  }

  /** @returns {number|null} */
  getGizmoLayerId() {
    return this._gizmoLayerId || null;
  }

  /**
   * Axis Gizmo 렌더링
   * [Performance] 오버레이 업데이트 모드에 따라 렌더링 빈도 조절
   * @private
   */
  _renderAxisGizmo() {
    if (!this._axisGizmoCtx || !this._axisGizmoCanvas) return;
    if (!this._axisGizmoVisible) {
      this._axisGizmoCanvas.style.display = "none";
      return;
    }
    
    // [Performance] 오버레이 업데이트 최적화
    const mode = this._overlayUpdateMode;
    const now = performance.now();
    
    switch (mode) {
      case 'always':
        // 항상 업데이트
        break;
      case 'visible':
        // visible일 때만 업데이트 (이미 위에서 체크됨)
        break;
      case 'throttled':
        // 30fps 제한
        if (now - this._lastOverlayUpdateTime < 33) return;
        this._lastOverlayUpdateTime = now;
        break;
      case 'off':
        // 오버레이 업데이트 비활성화
        return;
    }
    
    this._axisGizmoCanvas.style.display = "block";

    const ctx = this._axisGizmoCtx;
    const w = this._axisGizmoCanvas.width;
    const h = this._axisGizmoCanvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const axisLength = 41; // 축 길이 (150x150 캔버스용)

    // 캔버스 클리어
    ctx.clearRect(0, 0, w, h);

    // 카메라 회전 가져오기
    if (!this.cameraEntity) return;
    const rotation = this.cameraEntity.getRotation();

    // 축 벡터 정의 (월드 좌표계)
    const axes = [
      { dir: [1, 0, 0], color: "#ff4444", label: "X" },  // X축 (빨강)
      { dir: [0, 1, 0], color: "#44ff44", label: "Y" },  // Y축 (초록)
      { dir: [0, 0, 1], color: "#4444ff", label: "Z" },  // Z축 (파랑)
    ];

    // 카메라 회전의 역방향 적용하여 축 방향 계산
    const pc = window.pc;
    if (!pc) return;

    const invRot = rotation.clone().invert();
    
    // 각 축의 화면 좌표 계산
    const axisScreenCoords = axes.map(axis => {
      const dir = new pc.Vec3(axis.dir[0], axis.dir[1], axis.dir[2]);
      invRot.transformVector(dir, dir);
      
      // 2D 화면 좌표로 변환 (Y는 반전)
      return {
        x: dir.x * axisLength,
        y: -dir.y * axisLength,
        z: dir.z, // 깊이 (정렬용)
        color: axis.color,
        label: axis.label,
        originalAxis: axis, // 원본 축 정보 저장
      };
    });

    // 깊이순 정렬 (뒤에 있는 것 먼저 그리기)
    axisScreenCoords.sort((a, b) => a.z - b.z);
    
    // 버튼 정보 초기화
    this._axisButtons = [];

    // 축 그리기
    axisScreenCoords.forEach((axis, idx) => {
      const endX = cx + axis.x;
      const endY = cy + axis.y;
      
      // 뒤에 있는 축은 투명하게
      const alpha = axis.z < 0 ? 0.3 : 1.0;
      
      // 1) 축 반대편 버튼 그리기 (음의 방향)
      const negButtonX = cx - axis.x;
      const negButtonY = cy - axis.y;
      const buttonRadius = 9;
      
      // 버튼 배경 (반투명 원)
      ctx.beginPath();
      ctx.arc(negButtonX, negButtonY, buttonRadius, 0, Math.PI * 2);
      ctx.fillStyle = axis.color;
      ctx.globalAlpha = 0.2;
      ctx.fill();
      ctx.globalAlpha = alpha * 0.5;
      ctx.strokeStyle = axis.color;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.globalAlpha = 1.0;
      
      // 음의 방향 버튼 정보 저장
      this._axisButtons.push({
        x: negButtonX,
        y: negButtonY,
        radius: buttonRadius,
        axis: {
          dir: [-axis.originalAxis.dir[0], -axis.originalAxis.dir[1], -axis.originalAxis.dir[2]],
          color: axis.originalAxis.color,
          label: `-${axis.originalAxis.label}`
        },
        label: `-${axis.label}`
      });
      
      // 축 라인 그리기
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = axis.color;
      ctx.globalAlpha = alpha;
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.stroke();
      
      // 2) 축 끝 원 그리기 (양의 방향)
      ctx.beginPath();
      ctx.arc(endX, endY, 9, 0, Math.PI * 2);
      ctx.fillStyle = axis.color;
      ctx.fill();
      
      // 라벨 그리기
      ctx.fillStyle = "#000";
      ctx.font = "bold 10px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(axis.label, endX, endY);
      
      ctx.globalAlpha = 1.0;
      
      // 양의 방향 버튼 정보 저장
      this._axisButtons.push({
        x: endX,
        y: endY,
        radius: 9,
        axis: axis.originalAxis,
        label: axis.label
      });
    });

    // 중앙 원 그리기
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#888";
    ctx.fill();
  }

  /**
   * Axis Gizmo 클릭 처리
   * @private
   */
  _handleAxisGizmoClick(e) {
    if (!this._orbitEnabled) return; // Orbit 모드에서만 작동
    if (!this._axisButtons || this._axisButtons.length === 0) return;

    const rect = this._axisGizmoCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 클릭한 버튼 찾기
    for (const button of this._axisButtons) {
      const dx = x - button.x;
      const dy = y - button.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= button.radius) {
        // 버튼 클릭됨 - 해당 축으로 정렬
        this._alignToAxis(button.axis.dir);
        break;
      }
    }
  }

  /**
   * 축 정렬 애니메이션
   * @private
   * @param {Array<number>} axisDir - 축 방향 [x, y, z]
   */
  _alignToAxis(axisDir) {
    // 축 방향에 따라 목표 yaw와 pitch 계산
    let targetYaw, targetPitch;
    
    const [x, y, z] = axisDir;
    
    if (Math.abs(y) > 0.9) {
      // Y축 (위/아래) - Pitch 범위 내에서 정렬 (Gimbal Lock 방지)
      targetPitch = y > 0 ? this._maxPitch : this._minPitch;
      targetYaw = this._orbitYaw; // 현재 yaw 유지
    } else {
      // X, Z축 (수평)
      targetPitch = 0; // 수평 시점
      targetYaw = Math.atan2(x, z); // X, Z로 yaw 계산
    }
    
    // 애니메이션 시작
    const startYaw = this._orbitYaw;
    const startPitch = this._orbitPitch;
    const duration = 300; // 300ms
    const startTime = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const t = Math.min(elapsed / duration, 1);
      
      // easeInOutCubic
      const eased = t < 0.5 
        ? 4 * t * t * t 
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
      
      // Yaw 보간 (최단 경로)
      let deltaYaw = targetYaw - startYaw;
      // -π ~ π 범위로 정규화
      while (deltaYaw > Math.PI) deltaYaw -= 2 * Math.PI;
      while (deltaYaw < -Math.PI) deltaYaw += 2 * Math.PI;
      
      const nextYaw = startYaw + deltaYaw * eased;
      const nextPitch = startPitch + (targetPitch - startPitch) * eased;

      // IMPORTANT: orbit smoothing loop uses *_Target values.
      // If we only set current values, the next update tick will pull the camera back to the previous targets.
      this._orbitYaw = nextYaw;
      this._orbitPitch = Math.max(this._minPitch, Math.min(this._maxPitch, nextPitch));
      this._orbitYawTarget = this._orbitYaw;
      this._orbitPitchTarget = this._orbitPitch;
      
      this._updateCameraFromOrbit();
      
      if (t < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }

  /**
   * Axis Gizmo 클릭 처리 (레거시)
   * @private
   */
  
  /**
   * Axis Gizmo 가시성 설정
   * @param {boolean} visible
   */
  setAxisGizmoVisible(visible) {
    this._axisGizmoVisible = visible;
    if (this._axisGizmoCanvas) {
      this._axisGizmoCanvas.style.display = visible ? "block" : "none";
    }
  }

  /**
   * Axis Gizmo 가시성 토글
   * @returns {boolean} 새로운 가시성 상태
   */
  toggleAxisGizmo() {
    this.setAxisGizmoVisible(!this._axisGizmoVisible);
    return this._axisGizmoVisible;
  }

  /**
   * Axis Gizmo 가시성 상태
   * @returns {boolean}
   */
  isAxisGizmoVisible() {
    return this._axisGizmoVisible;
  }

  // Orbit camera control

  /**
   * Orbit 컨트롤 초기화
   * @private
   */
  _initOrbitControls() {
    if (!this.canvas) return;

    // 이벤트 핸들러 바인딩
    this._onMouseDown = this._handleMouseDown.bind(this);
    this._onMouseMove = this._handleMouseMove.bind(this);
    this._onMouseUp = this._handleMouseUp.bind(this);
    this._onWheel = this._handleWheel.bind(this);
    this._onContextMenu = (e) => e.preventDefault();

    // 이벤트 등록
    this.canvas.addEventListener("mousedown", this._onMouseDown);
    this.canvas.addEventListener("mousemove", this._onMouseMove);
    this.canvas.addEventListener("mouseup", this._onMouseUp);
    this.canvas.addEventListener("mouseleave", this._onMouseUp);
    this.canvas.addEventListener("wheel", this._onWheel, { passive: false });
    this.canvas.addEventListener("contextmenu", this._onContextMenu);

    if (this.app && !this._orbitUpdateHandler) {
      this._orbitUpdateHandler = (dt) => {
        if (!this._orbitEnabled) return;
        this._updateOrbitSmoothing(dt);
      };
      this.app.on("update", this._orbitUpdateHandler);
    }

  }

  /**
   * Orbit 컨트롤 정리
   * @private
   */
  _destroyOrbitControls() {
    if (!this.canvas) return;

    if (this._onMouseDown) {
      this.canvas.removeEventListener("mousedown", this._onMouseDown);
    }
    if (this._onMouseMove) {
      this.canvas.removeEventListener("mousemove", this._onMouseMove);
    }
    if (this._onMouseUp) {
      this.canvas.removeEventListener("mouseup", this._onMouseUp);
      this.canvas.removeEventListener("mouseleave", this._onMouseUp);
    }
    if (this._onWheel) {
      this.canvas.removeEventListener("wheel", this._onWheel);
    }
    if (this._onContextMenu) {
      this.canvas.removeEventListener("contextmenu", this._onContextMenu);
    }

    this._onMouseDown = null;
    this._onMouseMove = null;
    this._onMouseUp = null;
    this._onWheel = null;
    this._onContextMenu = null;

    if (this.app && this._orbitUpdateHandler) {
      this.app.off("update", this._orbitUpdateHandler);
      this._orbitUpdateHandler = null;
    }

  }

  /**
   * 마우스 다운 핸들러
   * @private
   */
  _handleMouseDown(e) {
    if (!this._orbitEnabled) return;

    // 좌클릭 = orbit, 우클릭/중클릭 = pan
    if (e.button === 0) {
      // 좌클릭: Orbit 시작
      this._isDragging = true;
      this._isPanning = false;
    } else if (e.button === 1 || e.button === 2) {
      // 중클릭 또는 우클릭: Pan 시작
      this._isDragging = false;
      this._isPanning = true;
    }

    this._lastMouseX = e.clientX;
    this._lastMouseY = e.clientY;
  }

  /**
   * 마우스 이동 핸들러
   * [Performance] 카메라 스로틀 모드에 따라 업데이트 빈도 조절
   * @private
   */
  _handleMouseMove(e) {
    if (!this._orbitEnabled) return;
    if (!this._isDragging && !this._isPanning) return;

    const deltaX = e.clientX - this._lastMouseX;
    const deltaY = e.clientY - this._lastMouseY;
    this._lastMouseX = e.clientX;
    this._lastMouseY = e.clientY;

    // [Performance] 카메라 스로틀 적용
    const updateFn = () => {
      if (this._isDragging) {
        this._orbit(deltaX, deltaY);
      } else if (this._isPanning) {
        this._pan(deltaX, deltaY);
      }
    };

    const mode = this._cameraThrottleMode;
    const now = performance.now();

    switch (mode) {
      case 'every':
        // 매 프레임 업데이트
        updateFn();
        break;
      case 'raf':
        // RAF 기반 스로틀 (중복 요청 무시)
        if (!this._cameraUpdatePending) {
          this._cameraUpdatePending = true;
          requestAnimationFrame(() => {
            updateFn();
            this._cameraUpdatePending = false;
          });
        }
        break;
      case 'low':
        // 30fps 제한 (~33ms 간격)
        if (now - this._lastCameraUpdateTime >= 33) {
          updateFn();
          this._lastCameraUpdateTime = now;
        }
        break;
      default:
        updateFn();
    }
  }

  /**
   * 마우스 업 핸들러
   * @private
   */
  _handleMouseUp(e) {
    this._isDragging = false;
    this._isPanning = false;
  }

  /**
   * 휠 핸들러 (Zoom)
   * [Performance] 카메라 스로틀 모드에 따라 업데이트 빈도 조절
   * @private
   */
  _handleWheel(e) {
    if (!this._orbitEnabled) return;
    e.preventDefault();

    const delta = e.deltaY;
    
    // [Performance] 카메라 스로틀 적용
    const updateFn = () => this._zoom(delta);
    const mode = this._cameraThrottleMode;
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
      default:
        updateFn();
    }
  }

  /**
   * Orbit 회전 적용
   * @private
   * @param {number} deltaX - X 이동량
   * @param {number} deltaY - Y 이동량
   */
  _orbit(deltaX, deltaY) {
    // Yaw: 좌우 회전 (Y축 기준)
    this._orbitYawTarget -= deltaX * this._orbitSensitivity;
    
    // Pitch: 상하 회전 (X축 기준) - 마우스 위로 드래그하면 위에서 내려다봄
    this._orbitPitchTarget += deltaY * this._orbitSensitivity;
    
    // Pitch 제한 (-90도 ~ +90도)
    this._orbitPitchTarget = Math.max(this._minPitch, Math.min(this._maxPitch, this._orbitPitchTarget));
  }

  /**
   * Pan 이동 적용
   * @private
   * @param {number} deltaX - X 이동량
   * @param {number} deltaY - Y 이동량
   */
  _pan(deltaX, deltaY) {
    if (!this.cameraEntity) return;

    const pc = window.pc;
    if (!pc) return;

    // 카메라의 로컬 좌표계에서 이동
    const right = this.cameraEntity.right;
    const up = this.cameraEntity.up;

    // 이동량 계산 (거리에 비례)
    const panSpeed = this._panSensitivity * this._orbitDistance;
    
    // 타겟 위치 업데이트
    this._orbitTargetTarget.x -= right.x * deltaX * panSpeed - up.x * deltaY * panSpeed;
    this._orbitTargetTarget.y -= right.y * deltaX * panSpeed - up.y * deltaY * panSpeed;
    this._orbitTargetTarget.z -= right.z * deltaX * panSpeed - up.z * deltaY * panSpeed;
  }

  /**
   * Zoom 적용
   * @private
   * @param {number} delta - 휠 이동량
   */
  _zoom(delta) {
    // 거리 변경 (지수적 스케일링)
    const zoomFactor = 1 + delta * this._zoomSensitivity;
    this._orbitDistanceTarget *= zoomFactor;

    // 거리 제한
    this._orbitDistanceTarget = Math.max(this._minDistance, Math.min(this._maxDistance, this._orbitDistanceTarget));
  }

  _updateOrbitSmoothing(dt) {
    if (!this._orbitEnabled) return;
    if (!Number.isFinite(dt) || dt <= 0) return;
    if (!this.cameraEntity) return;

    const alpha = 1 - Math.exp(-this._orbitSmoothing * dt);

    this._orbitTarget.x += (this._orbitTargetTarget.x - this._orbitTarget.x) * alpha;
    this._orbitTarget.y += (this._orbitTargetTarget.y - this._orbitTarget.y) * alpha;
    this._orbitTarget.z += (this._orbitTargetTarget.z - this._orbitTarget.z) * alpha;
    this._orbitDistance += (this._orbitDistanceTarget - this._orbitDistance) * alpha;

    let deltaYaw = this._orbitYawTarget - this._orbitYaw;
    while (deltaYaw > Math.PI) deltaYaw -= 2 * Math.PI;
    while (deltaYaw < -Math.PI) deltaYaw += 2 * Math.PI;
    this._orbitYaw += deltaYaw * alpha;

    this._orbitPitch += (this._orbitPitchTarget - this._orbitPitch) * alpha;
    this._orbitPitch = Math.max(this._minPitch, Math.min(this._maxPitch, this._orbitPitch));

    this._updateCameraFromOrbit();
  }

  /**
   * Orbit 상태로부터 카메라 위치/회전 업데이트
   * Fly 모드(_orbitEnabled === false)에서는 호출되지 않아야 하며, 호출되더라도 카메라를 덮어쓰지 않음.
   * @private
   */
  _updateCameraFromOrbit() {
    if (!this._orbitEnabled) return;
    if (!this.cameraEntity) return;

    const pc = window.pc;
    if (!pc) return;

    // 구면 좌표계로 카메라 위치 계산
    // yaw: Y축 기준 수평 회전
    // pitch: X축 기준 수직 회전
    const cosPitch = Math.cos(this._orbitPitch);
    const sinPitch = Math.sin(this._orbitPitch);
    const cosYaw = Math.cos(this._orbitYaw);
    const sinYaw = Math.sin(this._orbitYaw);

    // 카메라 위치 = 타겟 + 방향 * 거리
    const x = this._orbitTarget.x + this._orbitDistance * cosPitch * sinYaw;
    const y = this._orbitTarget.y + this._orbitDistance * sinPitch;
    const z = this._orbitTarget.z + this._orbitDistance * cosPitch * cosYaw;

    this.cameraEntity.setPosition(x, y, z);
    this.cameraEntity.lookAt(
      this._orbitTarget.x,
      this._orbitTarget.y,
      this._orbitTarget.z
    );
    
    // Roll(z) 값을 0으로 강제 고정 (lookAt 후 roll이 변할 수 있음)
    const euler = this.cameraEntity.getLocalEulerAngles();
    if (Math.abs(euler.z) > 0.1 && Math.abs(euler.z) < 179.9) {
      this.cameraEntity.setLocalEulerAngles(euler.x, euler.y, 0);
    }
    
    // 궤도 중심 마커 위치 업데이트
    this._updateOrbitTargetMarker();
  }

  /**
   * Orbit 컨트롤 활성화/비활성화
   * @param {boolean} enabled
   */
  setOrbitEnabled(enabled) {
    this._orbitEnabled = enabled;
  }

  /**
   * Orbit 컨트롤 활성화 여부
   * @returns {boolean}
   */
  isOrbitEnabled() {
    return this._orbitEnabled;
  }

  // Orbit target marker

  /**
   * Orbit 타겟 마커 생성
   * @private
   */
  _createOrbitTargetMarker() {
    const pc = window.pc;
    if (!pc || !this.app || this._orbitTargetMarker) return;

    this._orbitTargetMarker = new pc.Entity("OrbitTargetMarker");
    
    // 노란색 Material 생성
    const material = new pc.StandardMaterial();
    material.useLighting = false;
    material.emissive = new pc.Color(1, 0.9, 0.2);  // 노란색
    material.emissiveIntensity = 1.5;
    material.opacity = 0.8;
    material.blendType = pc.BLEND_NORMAL;
    material.update();

    // 구체 렌더 컴포넌트 추가
    this._orbitTargetMarker.addComponent("render", {
      type: "sphere",
      castShadows: false,
      receiveShadows: false,
    });
    
    // Material 적용
    this._orbitTargetMarker.render.meshInstances[0].material = material;
    
    // 크기 설정
    this._orbitTargetMarker.setLocalScale(0.3, 0.3, 0.3);
    
    // 초기 위치
    this._orbitTargetMarker.setPosition(
      this._orbitTarget.x,
      this._orbitTarget.y,
      this._orbitTarget.z
    );
    
    // 초기에는 숨김
    this._orbitTargetMarker.enabled = this._orbitTargetMarkerVisible;
    
    this.app.root.addChild(this._orbitTargetMarker);
  }

  /**
   * Orbit 타겟 마커 위치 업데이트
   * @private
   */
  _updateOrbitTargetMarker() {
    if (!this._orbitTargetMarker) return;
    
    this._orbitTargetMarker.setPosition(
      this._orbitTarget.x,
      this._orbitTarget.y,
      this._orbitTarget.z
    );
  }

  /**
   * Orbit 타겟 마커 가시성 설정
   * @param {boolean} visible
   */
  setOrbitTargetMarkerVisible(visible) {
    this._orbitTargetMarkerVisible = visible;
    
    if (!this._orbitTargetMarker && visible) {
      this._createOrbitTargetMarker();
    }
    
    if (this._orbitTargetMarker) {
      this._orbitTargetMarker.enabled = visible;
    }
    
  }

  /**
   * Orbit 타겟 마커 토글
   * @returns {boolean} 새로운 가시성 상태
   */
  toggleOrbitTargetMarker() {
    const newVisible = !this._orbitTargetMarkerVisible;
    this.setOrbitTargetMarkerVisible(newVisible);
    return newVisible;
  }

  /**
   * Orbit 타겟 마커 가시성 상태
   * @returns {boolean}
   */
  isOrbitTargetMarkerVisible() {
    return this._orbitTargetMarkerVisible;
  }

  // GSplat loading

  /**
   * File 객체에서 Splat 로드
   * PlayCanvas의 gsplat 컴포넌트를 사용하여 3DGS 렌더링
   * 
   * [수정] scale_2 보정: SuperSplat 방식 적용
   * - scale_0/scale_1은 있지만 scale_2가 없는 경우
   * - scale_2 = log(1e-6)로 설정 (거의 0에 가까운 두께 → 2D 평면 splat)
   * 
   * @param {File} file - PLY file
   * @param {Object} options - load options
   * @param {boolean} options.rotationFixZ180 - Z축 180도 회전 보정 (기본: true)
   * @param {Function} options.onProgress - 진행률 콜백 (percent, status)
   * @returns {Promise<pc.Entity|null>} 로드된 Splat Entity
   */
  async loadSplatFromFile(file, options = {}) {
    if (!this.initialized) return null;

    const append = !!(options?.append || options?.session?.meta?.append);
    this._loadingCount = this._loadingCount || 0;
    if (this._loadingCount > 0 && !append) return null;

    const pc = window.pc;
    if (!pc || !this.app || !this.splatRoot) return null;

    const { rotationFixZ180 = true, onProgress, session, signal } = options;
    const disableNormalize = !!options?.disableNormalize;
    const skipReorder = options?.skipReorder === true;
    const __dev = (() => {
      try {
        return window.DEV_MODE === true;
      } catch (e) {
        return false;
      }
    })();
    const __t0 = __dev && performance?.now ? performance.now() : 0;
    const __mark = (__dev && performance?.now) ? () => performance.now() : () => 0;
    const MAX_NORMALIZE_BYTES = 128 * 1024 * 1024;
    const fileLower = (file?.name || '').toLowerCase();
    const isCompressedPlyFile = fileLower.endsWith('.compressed.ply');
    const shouldTryNormalize =
      !disableNormalize &&
      !isCompressedPlyFile &&
      fileLower.endsWith('.ply') &&
      typeof file?.size === 'number' &&
      file.size > 0 &&
      file.size <= MAX_NORMALIZE_BYTES;

    this._loadingCount = (this._loadingCount || 0) + 1;
    onProgress?.(5, "Preparing...");

    try {
      if (signal?.aborted) {
        throw new DOMException('Aborted', 'AbortError');
      }

      const __tBegin = __mark();

      // 고유 ID 생성 (파일명 + timestamp)
      const splatId = `${file.name}_${Date.now()}`;

      session?.trackSplatId?.(splatId);

      onProgress?.(10, "Creating Blob URL...");

      // ====================================================================
      // [SuperSplat 방식] PLY 스키마 정규화 - scale_2가 없으면 log(1e-6)으로 추가
      // ====================================================================
      const normalizeFloatPlyMissingScale2 = async (srcFile) => {
        try {
          // 헤더만 먼저 64KB로 읽어서 스키마 판단 (대용량 파일 대응)
          const headerBuf = await srcFile.slice(0, 64 * 1024).arrayBuffer();
          const headerBytes = new Uint8Array(headerBuf);
          const headerText = new TextDecoder('ascii').decode(headerBytes);
          
          // Find 'end_header' keyword followed by newline (LF or CRLF)
          const endHeaderKeyword = 'end_header';
          const keywordIdx = headerText.indexOf(endHeaderKeyword);
          if (keywordIdx === -1) return null;
          
          // Find the actual end of header (after newline following end_header)
          let dataStartIdx = keywordIdx + endHeaderKeyword.length;
          if (headerBytes[dataStartIdx] === 0x0D && headerBytes[dataStartIdx + 1] === 0x0A) {
            dataStartIdx += 2; // CRLF
          } else if (headerBytes[dataStartIdx] === 0x0A) {
            dataStartIdx += 1; // LF
          } else {
            return null;
          }
          
          const headerPart = headerText.slice(0, dataStartIdx);
          const headerLines = headerPart.split(/\r?\n/);

          let format = '';
          let inVertex = false;
          let vertexCount = 0;
          const props = [];

          for (let i = 0; i < headerLines.length; i++) {
            const line = headerLines[i].trim();
            if (!line) continue;
            const words = line.split(/\s+/);
            if (words[0] === 'format') {
              format = words[1] || '';
            } else if (words[0] === 'element') {
              inVertex = words[1] === 'vertex';
              if (inVertex) {
                vertexCount = parseInt(words[2] || '0', 10) || 0;
              }
            } else if (words[0] === 'property' && inVertex) {
              const type = words[1];
              const name = words[2];
              props.push({ type, name, lineIndex: i });
            }
          }

          if (format !== 'binary_little_endian') return null;
          if (!vertexCount || props.length === 0) return null;
          if (!props.every((p) => p.type === 'float')) return null;

          const hasScale0 = props.some((p) => p.name === 'scale_0');
          const hasScale1 = props.some((p) => p.name === 'scale_1');
          const hasScale2 = props.some((p) => p.name === 'scale_2');
          
          if (!(hasScale0 && hasScale1) || hasScale2) {
            return null;
          }

          const SCALE_2_VALUE = Math.log(1e-6);

          const scale1Prop = props.find((p) => p.name === 'scale_1');
          if (!scale1Prop) return null;

          const insertAfterLineIndex = scale1Prop.lineIndex;
          const newHeaderLines = [];
          for (let i = 0; i < headerLines.length; i++) {
            const originalLine = headerLines[i];
            newHeaderLines.push(originalLine);
            if (i === insertAfterLineIndex) {
              newHeaderLines.push('property float scale_2');
            }
          }

          // Ensure header ends with newline so binary payload aligns correctly
          let newHeader = newHeaderLines.join('\n');
          if (!newHeader.endsWith('\n')) newHeader += '\n';
          const newHeaderBytes = new TextEncoder().encode(newHeader);

          const originalFullBuf = await srcFile.arrayBuffer();
          const dataOffset = dataStartIdx;
          const originalPropsCount = props.length;
          const newPropsCount = originalPropsCount + 1;
          const originalFloatCount = vertexCount * originalPropsCount;

          const payloadBytesLen = originalFloatCount * 4;
          if (dataOffset + payloadBytesLen > originalFullBuf.byteLength) return null;

          // Float32Array requires 4-byte aligned offset. Avoid full payload copy by using DataView.
          const payloadView = new DataView(originalFullBuf, dataOffset, payloadBytesLen);
          const newFloats = new Float32Array(vertexCount * newPropsCount);

          const scale1PropIndex = props.findIndex((p) => p.name === 'scale_1');
          
          for (let v = 0; v < vertexCount; v++) {
            const srcBase = v * originalPropsCount;
            const dstBase = v * newPropsCount;
            
            for (let j = 0; j < originalPropsCount; j++) {
              const val = payloadView.getFloat32((srcBase + j) * 4, true);
              const dstIndex = j <= scale1PropIndex ? j : j + 1;
              newFloats[dstBase + dstIndex] = val;
              
              // scale_1 바로 다음에 scale_2 삽입
              if (j === scale1PropIndex) {
                // [SuperSplat 방식] 모든 splat에 동일한 log(1e-6) 값 사용
                newFloats[dstBase + dstIndex + 1] = SCALE_2_VALUE;
              }
            }
          }

          const outBlob = new Blob([
            newHeaderBytes,
            new Uint8Array(newFloats.buffer)
          ], { type: 'application/octet-stream' });
          
          return outBlob;
        } catch (err) {
          return null;
        }
      };

      let sourceForUrl = file;
      let normalized = false;
      if (shouldTryNormalize) {
        onProgress?.(12, 'Validating PLY schema...');
        const __tNorm0 = __mark();
        const normalizedBlob = await normalizeFloatPlyMissingScale2(file);
        const __tNorm1 = __mark();
        if (normalizedBlob) {
          normalized = true;
          sourceForUrl = normalizedBlob;
        }
        onProgress?.(15, normalized ? 'Normalized PLY schema (SuperSplat method)' : 'PLY schema OK');
      } else {
        onProgress?.(
          12,
          disableNormalize
            ? 'Skipping PLY normalization (disabled)'
            : 'Skipping PLY normalization (large file)'
        );
      }

      if (signal?.aborted) {
        throw new DOMException('Aborted', 'AbortError');
      }

      // ---------------------------------------------------------------------
      // Morton order 경로: 대용량 PLY 렌더링 성능 개선 (SuperSplat 방식)
      // skipReorder(시퀀스/애니메이션)일 때는 아래 blobUrl 경로 사용.
      // .compressed.ply도 splat-transform readPly → decompressPly로 언팩 후 GSplatData로 로드 (blob 경로는 GSplatResource가 getCenters 등으로 실패).
      // ---------------------------------------------------------------------
      const useMortonReorder = !skipReorder;
      if (useMortonReorder) {
        onProgress?.(20, "Loading...");
        const arrayBuffer = await sourceForUrl.arrayBuffer();
        if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
        const gsplatData = await loadGSplatDataWithMorton(pc, file.name, arrayBuffer, {
          skipReorder: false,
          onProgress: (p, msg) => onProgress?.(20 + Math.round(p * 0.5), msg),
        });
        if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
        onProgress?.(75, "Creating entity...");
        const device = this.app.graphicsDevice;
        const resource = new pc.GSplatResource(device, gsplatData);
        const assetName = `gsplat_${Date.now()}`;
        const asset = new pc.Asset(assetName, "gsplat", {
          url: "",
          filename: file.name,
        }, {}, { minimalMemory: true });
        asset.resource = resource;
        asset.loaded = true;
        this.app.assets.add(asset);
        session?.trackAsset?.(asset);
        asset.fire("load", asset);
        const splatEntity = new pc.Entity("GaussianSplat_" + file.name);
        splatEntity._splatId = splatId;
        splatEntity.addComponent("gsplat", { asset });
        if (rotationFixZ180) splatEntity.setEulerAngles(0, 0, 180);
        this.splatRoot.addChild(splatEntity);
        session?.trackSplatId?.(splatId);
        session?.trackEntity?.(splatEntity);
        this._splatMap.set(splatId, {
          entity: splatEntity,
          asset,
          blobUrl: "",
          fileName: file.name,
        });
        try {
          splatEntity._onSplatDestroy = () => {
            try { this._cleanupSplatResources(splatId, { destroyEntity: false }); } catch (e) {}
          };
          splatEntity.on?.("destroy", splatEntity._onSplatDestroy);
        } catch (e) {}
        this._loadingCount = Math.max(0, (this._loadingCount || 1) - 1);
        onProgress?.(100, "Complete");
        return { entity: splatEntity, splatId };
      }

      const blobUrl = URL.createObjectURL(sourceForUrl);

      session?.trackBlobUrl?.(blobUrl);
      

      onProgress?.(20, "Loading GSplat asset...");

      const assetName = `gsplat_${Date.now()}`;
      const asset = new pc.Asset(
        assetName,
        "gsplat",
        {
          url: blobUrl,
          filename: file.name,
        },
        {
          // PlayCanvas gsplat loader: if reorder is not explicitly disabled,
          // it will reorder data into morton order which is expensive for
          // animation/sequence playback.
          // 압축 PLY(GSplatCompressedData)는 reorderData 시 calcMortonOrder가 x/y/z 배열을 기대하므로 reorder 비활성화.
          reorder: !skipReorder && !isCompressedPlyFile,
        },
        {
          minimalMemory: true,
        }
      );
      this.app.assets.add(asset);
      session?.trackAsset?.(asset);

      onProgress?.(30, 'Processing...');

      const abortAssetLoad = () => {
        try {
          this.app?.assets?.remove?.(asset);
        } catch (e) {
        }
        try {
          asset?.unload?.();
        } catch (e) {
        }
      };

      try {
        const __tAsset0 = __mark();
        const loadPromise = new Promise((resolve, reject) => {
          asset.ready(() => {
            resolve();
          });
          asset.on("error", (err) => {
            reject(new Error(String(err) || "Asset load failed"));
          });
          this.app.assets.load(asset);
        });

        const abortPromise = signal
          ? new Promise((_, reject) => {
              const onAbort = () => {
                try {
                  abortAssetLoad();
                } catch (e) {
                }
                reject(new DOMException('Aborted', 'AbortError'));
              };
              signal.addEventListener('abort', onAbort, { once: true });
            })
          : null;

        await (abortPromise ? Promise.race([loadPromise, abortPromise]) : loadPromise);
      } finally {
        // no-op
      }

      if (signal?.aborted) {
        throw new DOMException('Aborted', 'AbortError');
      }

      onProgress?.(80, "Creating entity...");

      const __tEnt0 = __mark();

      const splatEntity = new pc.Entity("GaussianSplat_" + file.name);
      
      // splatId를 entity에 저장 (나중에 참조용)
      splatEntity._splatId = splatId;
      
      splatEntity.addComponent("gsplat", {
        asset: asset,
      });

      session?.trackEntity?.(splatEntity);

      if (rotationFixZ180) {
        splatEntity.setEulerAngles(0, 0, 180);
      }

      this.splatRoot.addChild(splatEntity);

      onProgress?.(90, "Finalizing...");

      session?.trackSplatId?.(splatId);
      this._splatMap.set(splatId, {
        entity: splatEntity,
        asset: asset,
        blobUrl: blobUrl,
        fileName: file.name,
      });

      try {
        splatEntity._onSplatDestroy = () => {
          try {
            this._cleanupSplatResources(splatId, { destroyEntity: false });
          } catch (e) {
          }
        };
        splatEntity.on?.('destroy', splatEntity._onSplatDestroy);
      } catch (e) {
      }

      this._loadingCount = Math.max(0, (this._loadingCount || 1) - 1);
      onProgress?.(100, "Complete");


      return { entity: splatEntity, splatId };

    } catch (err) {
      if (err?.name === 'AbortError' || signal?.aborted) {
        this._loadingCount = Math.max(0, (this._loadingCount || 1) - 1);
        onProgress?.(0, "Aborted");
        return null;
      }
      this._loadingCount = Math.max(0, (this._loadingCount || 1) - 1);
      onProgress?.(0, "Error: " + (err?.message || err));
      return null;
    }
  }

  /**
   * Load splat from URL
   * @param {string} url - PLY URL
   * @param {Object} options - load options
   * @returns {Promise<pc.Entity|null>}
   */
  async loadSplatFromUrl(url, options = {}) {
    if (!this.initialized) return null;

    const append = !!(options?.append || options?.session?.meta?.append);
    this._loadingCount = this._loadingCount || 0;
    if (this._loadingCount > 0 && !append) return null;

    const pc = window.pc;
    if (!pc || !this.app || !this.splatRoot) return null;

    const { rotationFixZ180 = true, onProgress, session } = options;

    this._loadingCount = (this._loadingCount || 0) + 1;
    onProgress?.(5, "Creating asset...");

    try {
      const splatId = `${(url.split("/").pop() || 'splat.ply')}_${Date.now()}`;
      session?.trackSplatId?.(splatId);

      onProgress?.(10, "Loading...");

      const filename = url.split("/").pop() || url.split("\\").pop() || "splat.ply";
      const useMortonReorder = options.skipReorder !== true;

      if (useMortonReorder) {
        const gsplatData = await loadGSplatDataFromUrl(pc, url, {
          skipReorder: false,
          onProgress: (p, msg) => onProgress?.(10 + Math.round(p * 0.8), msg),
          signal: options.signal,
        });
        onProgress?.(85, "Creating entity...");
        const device = this.app.graphicsDevice;
        const resource = new pc.GSplatResource(device, gsplatData);
        const assetName = `gsplat_${Date.now()}`;
        const asset = new pc.Asset(assetName, "gsplat", { url: "", filename }, {}, { minimalMemory: true });
        asset.resource = resource;
        asset.loaded = true;
        this.app.assets.add(asset);
        session?.trackAsset?.(asset);
        asset.fire("load", asset);
        const splatEntity = new pc.Entity("GaussianSplat");
        splatEntity._splatId = splatId;
        splatEntity.addComponent("gsplat", { asset });
        if (rotationFixZ180) splatEntity.setEulerAngles(0, 0, 180);
        this.splatRoot.addChild(splatEntity);
        session?.trackEntity?.(splatEntity);
        this._splatMap.set(splatId, { entity: splatEntity, asset, blobUrl: "", fileName: filename });
        try {
          splatEntity._onSplatDestroy = () => { try { this._cleanupSplatResources(splatId, { destroyEntity: false }); } catch (e) {} };
          splatEntity.on?.("destroy", splatEntity._onSplatDestroy);
        } catch (e) {}
        this._loadingCount = Math.max(0, (this._loadingCount || 1) - 1);
        onProgress?.(100, "Complete");
        return { entity: splatEntity, splatId };
      }

      const assetName = `gsplat_${Date.now()}`;
      const asset = new pc.Asset(
        assetName,
        "gsplat",
        { url: url, filename: filename },
        {},
        { minimalMemory: true }
      );
      this.app.assets.add(asset);
      session?.trackAsset?.(asset);
      onProgress?.(30, url && url.startsWith("http") ? "Downloading..." : "Processing...");
      await new Promise((resolve, reject) => {
        asset.ready(() => resolve());
        asset.on("error", (err) => {
          reject(new Error(String(err) || "Asset load failed"));
        });
        this.app.assets.load(asset);
      });
      onProgress?.(80, "Creating entity...");
      const splatEntity = new pc.Entity("GaussianSplat");
      splatEntity._splatId = splatId;
      splatEntity.addComponent("gsplat", { asset: asset });
      if (rotationFixZ180) splatEntity.setEulerAngles(0, 0, 180);
      this.splatRoot.addChild(splatEntity);
      session?.trackEntity?.(splatEntity);
      session?.trackSplatId?.(splatId);
      this._splatMap.set(splatId, { entity: splatEntity, asset: asset, blobUrl: "", fileName: filename });
      try {
        splatEntity._onSplatDestroy = () => { try { this._cleanupSplatResources(splatId, { destroyEntity: false }); } catch (e) {} };
        splatEntity.on?.("destroy", splatEntity._onSplatDestroy);
      } catch (e) {}
      this._loadingCount = Math.max(0, (this._loadingCount || 1) - 1);
      onProgress?.(100, "Complete");
      return { entity: splatEntity, splatId };

    } catch (err) {
      this._loadingCount = Math.max(0, (this._loadingCount || 1) - 1);
      onProgress?.(0, "Error: " + (err?.message || err));
      return null;
    }
  }

  /**
   * Remove splat by ID
   * @param {string} splatId - 제거할 splat ID
   */
  removeSplat(splatId) {
    const splatData = this._splatMap.get(splatId);
    if (!splatData) {
      // Already removed or never existed - silent return for idempotent cleanup
      return false;
    }

    try {
      // Delete early to avoid double-cleanup if destroy triggers handlers.
      this._splatMap.delete(splatId);
    } catch (e) {
    }

    try {
      // Temporarily reinsert for centralized cleanup helper.
      this._splatMap.set(splatId, splatData);
      return this._cleanupSplatResources(splatId, { destroyEntity: true });
    } catch (err) {
      try {
        this._splatMap.delete(splatId);
      } catch (e) {
      }
      return false;
    }
  }

  clearAllSplats() {
    for (const [splatId] of this._splatMap) {
      this.removeSplat(splatId);
    }
    
    // splatRoot 하위 정리 (혹시 남은 것들)
    if (this.splatRoot) {
      while (this.splatRoot.children.length > 0) {
        const child = this.splatRoot.children[0];
        child.destroy();
      }
    }

  }

  /**
   * 하위 호환성을 위한 clearSplat (모든 splat 제거)
   */
  clearSplat() {
    this.clearAllSplats();
  }

  /**
   * Splat Entity 반환 (ID로)
   * @param {string} splatId
   * @returns {pc.Entity|null}
   */
  getSplatEntityById(splatId) {
    const splatData = this._splatMap.get(splatId);
    return splatData?.entity || null;
  }

  getSplatResourcesById(splatId) {
    return this._splatMap.get(splatId) || null;
  }

  /**
   * 현재 로드된 모든 Splat 정보 반환
   * @returns {Array<{splatId: string, entity: pc.Entity, fileName: string}>}
   */
  getAllSplats() {
    const result = [];
    for (const [splatId, data] of this._splatMap) {
      result.push({
        splatId,
        entity: data.entity,
        fileName: data.fileName,
      });
    }
    return result;
  }

  /**
   * 현재 Splat Entity 반환 (첫 번째 것, 하위 호환성)
   * @returns {pc.Entity|null}
   */
  getSplatEntity() {
    if (this._splatMap.size === 0) return null;
    const first = this._splatMap.values().next().value;
    return first?.entity || null;
  }

  // Camera state API

  /**
   * 카메라 상태 가져오기
   * @returns {{position:{x,y,z}, rotation:{x,y,z,w}, target:{x,y,z}, distance:number, yaw:number, pitch:number}|null}
   */
  getCameraState() {
    if (!this.cameraEntity) return null;

    const pos = this.cameraEntity.getPosition();
    const rot = this.cameraEntity.getRotation();
    
    // 카메라의 실제 forward 벡터에서 yaw/pitch 계산
    // Fly 모드에서도 정확한 회전값을 반환하기 위함
    const forward = this.cameraEntity.forward;
    const actualYaw = Math.atan2(-forward.x, -forward.z) * (180 / Math.PI);
    // Orbit 시스템: 양수 pitch = 카메라가 위에 있어서 아래를 봄
    // forward.y: 아래를 보면 음수
    // 따라서 부호를 반전시켜 Orbit 시스템과 일치시킴
    const actualPitch = -Math.asin(forward.y) * (180 / Math.PI);

    return {
      position: { x: pos.x, y: pos.y, z: pos.z },
      rotation: { x: rot.x, y: rot.y, z: rot.z, w: rot.w },
      target: { ...this._orbitTarget },
      distance: this._orbitDistance,
      yaw: actualYaw,
      pitch: actualPitch,
    };
  }

  /**
   * 카메라 상태 설정
   * @param {{position?:{x,y,z}, rotation?:{x,y,z,w}, target?:{x,y,z}, distance?:number, yaw?:number, pitch?:number}} state
   */
  setCameraState(state) {
    if (!this.cameraEntity || !state) return;

    const pc = window.pc;
    if (!pc) return;

    // position/rotation이 있으면 우선 적용해서 방향까지 정확히 복원한다.
    // (Fly 모드에서 저장된 키프레임은 orbit 파라미터로 재계산하면 방향이 어긋날 수 있음)
    if (state.position) {
      this.cameraEntity.setPosition(state.position.x, state.position.y, state.position.z);
    }

    if (state.rotation) {
      const quat = new pc.Quat(state.rotation.x, state.rotation.y, state.rotation.z, state.rotation.w);
      this.cameraEntity.setRotation(quat);
    }

    // Orbit 파라미터는 카메라를 재계산하지 말고 내부 상태만 갱신 (이후 Orbit 조작을 위해)
    if (state.target) {
      this._orbitTarget = { ...state.target };
      this._orbitTargetTarget = { ...state.target };
    }
    if (typeof state.distance === "number") {
      this._orbitDistance = Math.max(this._minDistance, Math.min(this._maxDistance, state.distance));
      this._orbitDistanceTarget = this._orbitDistance;
    }
    if (typeof state.yaw === "number") {
      this._orbitYaw = state.yaw * Math.PI / 180;
      this._orbitYawTarget = this._orbitYaw;
    }
    if (typeof state.pitch === "number") {
      const pitchRad = state.pitch * Math.PI / 180;
      this._orbitPitch = Math.max(this._minPitch, Math.min(this._maxPitch, pitchRad));
      this._orbitPitchTarget = this._orbitPitch;
    }

    this._updateOrbitTargetMarker();
    this.renderNextFrame = true;
    window.dispatchEvent(new CustomEvent('liamviewer:camerastateapplied'));
    return;
  }

  /**
   * 궤도 중심만 설정 (카메라 위치/방향은 변경하지 않음).
   * Fly 모드 재생 정지 시, 재생 전 궤도 중심 복원용.
   * @param {{x:number, y:number, z:number}} target - 궤도 중심 위치
   */
  setOrbitTarget(target) {
    if (!target) return;
    this._orbitTarget = { ...target };
    this._orbitTargetTarget = { ...target };
    this._updateOrbitTargetMarker();
  }

  /**
   * 카메라를 타겟 위치로 포커스
   * @param {{x:number, y:number, z:number}} target - 포커스할 위치
   * @param {number} distance - 거리 (선택)
   */
  focusOnTarget(target, distance = null) {
    if (target) {
      this._orbitTarget = { ...target };
      this._orbitTargetTarget = { ...target };
    }
    if (typeof distance === "number") {
      this._orbitDistance = Math.max(this._minDistance, Math.min(this._maxDistance, distance));
      this._orbitDistanceTarget = this._orbitDistance;
    }
    this._updateCameraFromOrbit();
  }
  
  /**
   * 곡선 경로용 카메라 상태 설정 (위치 직접 + yaw/pitch로 회전)
   * @param {{x:number, y:number, z:number}} position - 카메라 위치
   * @param {number} yawDeg - Yaw 각도 (도)
   * @param {number} pitchDeg - Pitch 각도 (도)
   */
  setCameraOnPath(position, yawDeg, pitchDeg) {
    if (!this.cameraEntity) return;
    
    const pc = window.pc;
    if (!pc) return;
    
    // 카메라 위치 직접 설정
    this.cameraEntity.setPosition(position.x, position.y, position.z);
    
    // yaw, pitch를 오일러 각도로 변환하여 회전 설정
    // PlayCanvas: setLocalEulerAngles(pitch, yaw, roll)
    // pitch: X축 회전, yaw: Y축 회전
    this.cameraEntity.setLocalEulerAngles(pitchDeg, yawDeg, 0);
    
    this.renderNextFrame = true;
  }
  
  /**
   * 곡선 경로용 카메라 상태 설정 (위치 직접 + quaternion 회전).
   * 엔티티 설정 후 오비트 내부 상태를 동기화하여 update()가 카메라를 덮어쓰지 않도록 함 (영상 추출 등).
   * @param {{x:number, y:number, z:number}} position - 카메라 위치 (월드)
   * @param {pc.Quat} rotation - 회전 quaternion (월드)
   */
  setCameraOnPathWithQuat(position, rotation) {
    if (!this.cameraEntity) return;

    const pc = window.pc;
    if (!pc) return;

    this.cameraEntity.setPosition(position.x, position.y, position.z);
    this.cameraEntity.setRotation(rotation);

    const forward = rotation.transformVector(new pc.Vec3(0, 0, -1)).normalize();
    const dist = this._orbitDistance > 0 ? this._orbitDistance : 5;
    this._orbitTarget = {
      x: position.x + forward.x * dist,
      y: position.y + forward.y * dist,
      z: position.z + forward.z * dist,
    };
    this._orbitTargetTarget = { ...this._orbitTarget };
    this._orbitDistance = dist;
    this._orbitDistanceTarget = dist;
    this._orbitYaw = Math.atan2(-forward.x, -forward.z);
    this._orbitYawTarget = this._orbitYaw;
    const pitchRad = -Math.asin(Math.max(-1, Math.min(1, forward.y)));
    this._orbitPitch = Math.max(this._minPitch, Math.min(this._maxPitch, pitchRad));
    this._orbitPitchTarget = this._orbitPitch;

    this._updateOrbitTargetMarker();
    this.renderNextFrame = true;
  }

  /**
   * 카메라 리셋 (초기 위치로)
   */
  resetCamera() {
    this._orbitTarget = { x: 0, y: 0, z: 0 };
    this._orbitDistance = 6.4;
    this._orbitYaw = 0;
    this._orbitPitch = 0.7;  // Pos(0, 4, 5), Rot(0.7, 0, 0)
    this._orbitTargetTarget = { x: 0, y: 0, z: 0 };
    this._orbitDistanceTarget = this._orbitDistance;
    this._orbitYawTarget = this._orbitYaw;
    this._orbitPitchTarget = this._orbitPitch;
    this._updateCameraFromOrbit();
  }
  
  /**
   * 현재 Orbit 상태(_orbitTarget, distance, yaw, pitch)를 카메라 엔티티에 적용
   * 재생 정지 후 궤도 중심을 재생 전으로 복원할 때 사용 (Orbit 모드)
   */
  applyOrbitStateToCamera() {
    this._updateCameraFromOrbit();
  }

  /**
   * 현재 카메라 상태를 Orbit 시스템에 동기화
   * 재생 정지 후 카메라 조작 시 튀는 현상 방지
   */
  syncOrbitFromCamera() {
    if (!this.cameraEntity) return;

    const pc = window.pc;
    if (!pc) return;

    const camPos = this.cameraEntity.getPosition();
    const forward = this.cameraEntity.forward;

    this._orbitTarget = {
      x: camPos.x + forward.x * this._orbitDistance,
      y: camPos.y + forward.y * this._orbitDistance,
      z: camPos.z + forward.z * this._orbitDistance,
    };
    this._orbitTargetTarget = { ...this._orbitTarget };

    const yaw = Math.atan2(-forward.x, -forward.z);
    const pitch = -Math.asin(forward.y);

    this._orbitYaw = yaw;
    this._orbitPitch = Math.max(this._minPitch, Math.min(this._maxPitch, pitch));
    this._orbitYawTarget = this._orbitYaw;
    this._orbitPitchTarget = this._orbitPitch;

    this._updateOrbitTargetMarker();
  }

  /**
   * 궤도 중심은 고정한 채, 현재 카메라 위치에 맞게 distance/yaw/pitch만 동기화.
   * 재생 정지 시 궤도 중심을 재생 전으로 유지하면서 뷰는 그대로 둘 때 사용.
   * @param {{x:number, y:number, z:number}} target - 유지할 궤도 중심
   */
  syncOrbitFromCameraWithTarget(target) {
    if (!this.cameraEntity || !target) return;

    const camPos = this.cameraEntity.getPosition();
    const dx = target.x - camPos.x;
    const dy = target.y - camPos.y;
    const dz = target.z - camPos.z;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (dist < 1e-6) return;

    const inv = 1 / dist;
    const forward = { x: dx * inv, y: dy * inv, z: dz * inv };

    this._orbitTarget = { x: target.x, y: target.y, z: target.z };
    this._orbitTargetTarget = { ...this._orbitTarget };
    this._orbitDistance = Math.max(this._minDistance, Math.min(this._maxDistance, dist));
    this._orbitDistanceTarget = this._orbitDistance;

    const yaw = Math.atan2(-forward.x, -forward.z);
    const pitch = -Math.asin(Math.max(-1, Math.min(1, forward.y)));
    this._orbitYaw = yaw;
    this._orbitPitch = Math.max(this._minPitch, Math.min(this._maxPitch, pitch));
    this._orbitYawTarget = this._orbitYaw;
    this._orbitPitchTarget = this._orbitPitch;

    this._updateOrbitTargetMarker();
  }

  // Canvas resize

  resize() {
    if (!this.app || !this.canvas) return;

    const container = this.canvas.parentElement;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const cssWidth = Math.floor(rect.width);
    const cssHeight = Math.floor(rect.height);

    if (cssWidth > 0 && cssHeight > 0) {
      this.canvas.style.width = "100%";
      this.canvas.style.height = "100%";
      
      // DPR을 반영한 실제 픽셀 크기로 리사이즈
      const dpr = window.devicePixelRatio || 1;
      const pixelWidth = Math.floor(cssWidth * dpr);
      const pixelHeight = Math.floor(cssHeight * dpr);
      
      // graphicsDevice에 maxPixelRatio 설정 (DPR 반영)
      if (this.app.graphicsDevice) {
        this.app.graphicsDevice.maxPixelRatio = dpr;
      }
      
      // resizeCanvas는 CSS 픽셀 크기를 받지만, maxPixelRatio가 설정되어 있으면
      // 내부적으로 DPR을 곱해서 graphicsDevice 해상도를 설정함
      this.app.resizeCanvas(cssWidth, cssHeight);
      
      // 강제로 graphicsDevice 해상도 동기화 (즉시 반영 보장)
      if (this.app.graphicsDevice) {
        const device = this.app.graphicsDevice;
        // canvas backing-store와 graphicsDevice가 불일치할 경우 강제 동기화
        if (device.width !== pixelWidth || device.height !== pixelHeight) {
          device.resizeCanvas(pixelWidth, pixelHeight);
        }
      }
    }
  }

  _startDprMonitor() {
    if (this._dprMonitorRaf != null) return;
    const tick = () => {
      if (!this.app || !this.canvas) {
        this._dprMonitorRaf = null;
        return;
      }

      const dpr = window.devicePixelRatio || 1;
      if (dpr !== this._lastDevicePixelRatio) {
        this._lastDevicePixelRatio = dpr;
        // dpr 변화 시 canvas backing-store 해상도도 바뀌어야 하므로 강제 resize
        this.resize();
        
        // DPR 변경 이벤트 발생 (셀렉터 등 외부 모듈이 감지할 수 있도록)
        if (this.canvas) {
          this.canvas.dispatchEvent(new CustomEvent('dprchange', { 
            detail: { dpr, width: this.app.graphicsDevice?.width, height: this.app.graphicsDevice?.height }
          }));
        }
      }

      this._dprMonitorRaf = window.requestAnimationFrame(tick);
    };
    this._dprMonitorRaf = window.requestAnimationFrame(tick);
  }

  _stopDprMonitor() {
    if (this._dprMonitorRaf == null) return;
    try {
      window.cancelAnimationFrame(this._dprMonitorRaf);
    } catch (_) {
    }
    this._dprMonitorRaf = null;
  }

  // Viewer cleanup

  dispose() {

    // Axis Gizmo 정리
    this._stopAxisGizmoLoop();
    
    // Axis Gizmo 클릭 이벤트 제거
    if (this._axisGizmoCanvas && this._onAxisGizmoClick) {
      this._axisGizmoCanvas.removeEventListener('click', this._onAxisGizmoClick);
      this._onAxisGizmoClick = null;
    }

    // Orbit 컨트롤 정리
    this._destroyOrbitControls();

    if (this._resizeHandler) {
      window.removeEventListener("resize", this._resizeHandler);
      this._resizeHandler = null;
    }

    this._stopDprMonitor();

    this.clearSplat();

    // 무한 그리드 정리
    if (this._infiniteGrid) {
      this._infiniteGrid.dispose();
      this._infiniteGrid = null;
    }

    if (this.cameraEntity) {
      this.cameraEntity.destroy();
      this.cameraEntity = null;
    }
    if (this.splatRoot) {
      this.splatRoot.destroy();
      this.splatRoot = null;
    }
    if (this.lightEntity) {
      this.lightEntity.destroy();
      this.lightEntity = null;
    }

    if (this.app) {
      this.app.destroy();
      this.app = null;
    }

    this.canvas = null;
    this.camera = null;
    this.controls = null;
    this.splatMesh = null;
    this.initialized = false;

    window.__pcApp = null;
    window.__pcCamera = null;
    window.__pcScene = null;

  }

  isLoading() {
    // Prefer counter-based loading state (supports concurrent append loads).
    // Fallback to legacy boolean for older paths.
    return (this._loadingCount || 0) > 0 || !!this._isLoading;
  }
  
  /**
   * 선택된 오브젝트 설정
   * @param {Object|null} obj - 선택된 오브젝트
   */
  setSelectedObject(obj) {
    this._selectedObject = obj;
  }
  
  /**
   * 선택된 오브젝트 가져오기
   * @returns {Object|null}
   */
  getSelectedObject() {
    return this._selectedObject;
  }

  /** Set camera FOV from focal length (mm); 35mm film sensor width. */
  setFocalLength(focalLengthMm) {
    if (!this.cameraEntity || !this.cameraEntity.camera) return;
    const sensorWidth = 36;
    const fovRadians = 2 * Math.atan(sensorWidth / (2 * focalLengthMm));
    const fovDegrees = fovRadians * (180 / Math.PI);
    
    this.cameraEntity.camera.fov = fovDegrees;
  }

  /** Orbit center marker size (0–1). */
  setOrbitCenterSize(size) {
    if (!this._orbitTargetMarker) return;
    const baseScale = 0.2;
    const newScale = baseScale * (0.1 + size * 2);
    this._orbitTargetMarker.setLocalScale(newScale, newScale, newScale);
  }

  /** Camera/orbit speed scale (0.1–5). */
  setCameraSpeed(speed) {
    this._orbitSensitivity = 0.005 * speed;
    this._panSensitivity = 0.01 * speed;
    this._zoomSensitivity = 0.001 * speed;
  }
}

export default PlayCanvasViewer;
