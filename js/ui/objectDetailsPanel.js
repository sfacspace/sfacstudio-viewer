/** Object details panel: selection tools, complement/eraser/export, undo/redo. */
import { exportFilteredPlyForSelectedObject } from '../export/exportPly.js';
import { exportFilteredCompressedPlyForSelectedObject } from '../export/compressedPlyExport.js';
import { runCreateObjectFromSelection } from '../export/createObjectFromSelection.js';

export class ObjectDetailsPanel {
  constructor() {
    /** 오른쪽 도구 열: 셀렉션 블록 래퍼 (표시/숨김) */
    this.panelWrap = document.getElementById('gizmoSelectionToolsWrap');
    /** 툴팁 기준·레이아웃용 내부 컨테이너 */
    this.panel = document.getElementById('gizmoSelectionTools');
    this.buttons = [
      document.getElementById('objectDetailsPanelBtn1'),
      document.getElementById('objectDetailsPanelBtn2'),
      document.getElementById('objectDetailsPanelBtn3'),
      document.getElementById('objectDetailsPanelBtn4'),
    ];
    this.complementButton = document.getElementById('objectDetailsPanelBtnComplement');
    this.eraserButton = document.getElementById('objectDetailsPanelBtnEraser');
    this.exportButton = document.getElementById('objectDetailsPanelBtnExport');
    this.exportWrap = document.getElementById('objectDetailsPanelExportWrap');
    this.exportMenu = document.getElementById('objectDetailsPanelExportMenu');
    this.undoButton = document.getElementById('objectDetailsPanelBtnUndo');
    this.redoButton = document.getElementById('objectDetailsPanelBtnRedo');
    this.brushTooltip = document.getElementById('brushTooltip');
    this.floodTooltip = document.getElementById('floodTooltip');
    this.volumeTooltip = document.getElementById('volumeTooltip');
    this.volumeShapeToggleBtn = document.getElementById('volumeShapeToggleBtn');
    this.volumeClearBtn = document.getElementById('volumeClearBtn');
    this.volumeTooltipContentBox = document.getElementById('volumeTooltipContentBox');
    this.volumeTooltipContentSphere = document.getElementById('volumeTooltipContentSphere');
    this._volumeShape = 'box';
    this.brushRadiusInput = document.getElementById('brushRadiusInput');
    this.brushRadiusSlider = document.getElementById('brushRadiusSlider');
    this.floodThresholdInput = document.getElementById('floodThresholdInput');
    this.floodThresholdSlider = document.getElementById('floodThresholdSlider');

    this.sphereRadiusInput = document.getElementById('sphereRadiusInput');
    this.sphereRadiusSlider = document.getElementById('sphereRadiusSlider');

    this.sphereSetBtn = document.getElementById('sphereSetBtn');
    this.sphereAddBtn = document.getElementById('sphereAddBtn');
    
    this.isVisible = false;
    this.activeButtonIndex = null;
    this.onButtonClick = null;
    this.selectionTool = null;
    this.onComplementClick = null;
    this.onEraserClick = null;
    this.onExportClick = null;
    this.boxWidthInput = document.getElementById('boxWidthInput');
    this.boxWidthSlider = document.getElementById('boxWidthSlider');
    this.boxHeightInput = document.getElementById('boxHeightInput');
    this.boxHeightSlider = document.getElementById('boxHeightSlider');
    this.boxDepthInput = document.getElementById('boxDepthInput');
    this.boxDepthSlider = document.getElementById('boxDepthSlider');
    this.boxSizeResetBtn = document.getElementById('boxSizeResetBtn');

    this.boxSetBtn = document.getElementById('boxSetBtn');
    this.boxAddBtn = document.getElementById('boxAddBtn');

    /** 입체 툴팁을 body로 옮긴 뒤 복귀용 (우측 패널 stacking보다 위에 그리기) */
    /** @type {ParentNode|null} */
    this._volumeTooltipRestoreParent = null;
    /** @type {ChildNode|null} */
    this._volumeTooltipRestoreNext = null;

    this.init();
  }

  /** @private */
  _ensureVolumeTooltipInBody() {
    const el = this.volumeTooltip;
    if (!el || el.parentNode === document.body) return;
    this._volumeTooltipRestoreParent = el.parentNode;
    this._volumeTooltipRestoreNext = el.nextSibling;
    document.body.appendChild(el);
  }

  /** @private */
  _restoreVolumeTooltipToPanel() {
    const el = this.volumeTooltip;
    if (!el || el.parentNode !== document.body || !this._volumeTooltipRestoreParent) return;
    const p = this._volumeTooltipRestoreParent;
    const n = this._volumeTooltipRestoreNext;
    try {
      if (n && n.parentNode === p) {
        p.insertBefore(el, n);
      } else {
        const btn = this.buttons[3];
        if (btn?.parentNode) {
          btn.parentNode.insertBefore(el, btn.nextSibling);
        } else {
          p.appendChild(el);
        }
      }
    } catch {
      try {
        p.appendChild(el);
      } catch {
        /* ignore */
      }
    }
  }

  positionTooltipOverButton(tooltipEl, buttonEl) {
    if (!tooltipEl || !buttonEl) return;
    const btnRect = buttonEl.getBoundingClientRect();
    const centerX = btnRect.left + btnRect.width / 2;
    const inGizmo = this.panel?.classList?.contains('gizmo-controls__selection-tools');
    const margin = 8;
    const gap = 12;
    const isVolume = tooltipEl.id === 'volumeTooltip';
    /** 오른쪽 패널보다 위(축 기즈모 110·고정 툴팁 100200보다 높게) */
    const VOLUME_TOOLTIP_Z = 100250;
    const VOLUME_TOOLTIP_TOP_OFFSET_PX = 100;

    if (inGizmo) {
      tooltipEl.classList.add('object-details-panel__tooltip--dock-left');
      tooltipEl.style.position = 'fixed';
      tooltipEl.style.right = `${Math.round(window.innerWidth - btnRect.left + gap)}px`;
      tooltipEl.style.left = 'auto';
      if (isVolume) {
        this._ensureVolumeTooltipInBody();
        tooltipEl.style.top = `${Math.round(
          btnRect.top + btnRect.height / 2 - VOLUME_TOOLTIP_TOP_OFFSET_PX
        )}px`;
        tooltipEl.style.zIndex = String(VOLUME_TOOLTIP_Z);
      } else {
        tooltipEl.style.top = `${Math.round(btnRect.top + btnRect.height / 2)}px`;
        tooltipEl.style.zIndex = '10060';
      }
      tooltipEl.style.bottom = 'auto';
      tooltipEl.style.transform = 'translateY(-50%)';
      const clamp = () => {
        const tr = tooltipEl.getBoundingClientRect();
        if (tr.left < margin) {
          tooltipEl.style.right = 'auto';
          tooltipEl.style.left = `${margin}px`;
        }
      };
      requestAnimationFrame(() => requestAnimationFrame(clamp));
      return;
    }

    tooltipEl.classList.remove('object-details-panel__tooltip--dock-left');
    if (!this.panel) return;
    const panelRect = this.panel.getBoundingClientRect();
    const leftInPanel = centerX - panelRect.left;
    tooltipEl.style.position = 'absolute';
    tooltipEl.style.left = `${leftInPanel}px`;
    tooltipEl.style.top = '';
    tooltipEl.style.right = '';
    tooltipEl.style.bottom = '';
    tooltipEl.style.transform = 'translateX(-50%)';
    tooltipEl.style.zIndex = '';
  }

  getVolumeShape() {
    return this._volumeShape;
  }

  setVolumeShape(shape) {
    if (shape !== 'box' && shape !== 'sphere') return;
    this._volumeShape = shape;
    this.updateVolumeShapeUI();
  }

  switchVolumeShape() {
    this._volumeShape = this._volumeShape === 'box' ? 'sphere' : 'box';
    this.updateVolumeShapeUI();
    if (this._volumeShape === 'sphere' && typeof this.onSphereButtonClick === 'function') {
      this.onSphereButtonClick();
    } else if (this._volumeShape === 'box' && typeof this.onCubeButtonClick === 'function') {
      this.onCubeButtonClick();
    }
  }

  updateVolumeShapeUI() {
    const isBox = this._volumeShape === 'box';
    const btn4 = this.buttons[3];
    if (btn4) {
      const iconBox = btn4.querySelector('.object-details-panel__volume-btn-icon--box');
      const iconSphere = btn4.querySelector('.object-details-panel__volume-btn-icon--sphere');
      if (iconBox) iconBox.classList.toggle('is-active', isBox);
      if (iconSphere) iconSphere.classList.toggle('is-active', !isBox);
    }
    if (this.volumeTooltipContentBox) this.volumeTooltipContentBox.style.display = isBox ? 'flex' : 'none';
    if (this.volumeTooltipContentSphere) this.volumeTooltipContentSphere.style.display = isBox ? 'none' : 'flex';
    if (this.volumeTooltip) {
      this.volumeTooltip.classList.toggle('volume-tooltip--box', isBox);
      this.volumeTooltip.classList.toggle('volume-tooltip--sphere', !isBox);
    }
    if (this.volumeShapeToggleBtn) {
      const toggleBox = this.volumeShapeToggleBtn.querySelector('.volume-toggle-icon--box');
      const toggleSphere = this.volumeShapeToggleBtn.querySelector('.volume-toggle-icon--sphere');
      if (toggleBox) toggleBox.classList.toggle('is-active', isBox);
      if (toggleSphere) toggleSphere.classList.toggle('is-active', !isBox);
    }
    if (
      this.volumeTooltip?.style.display !== 'none' &&
      this.activeButtonIndex === 3 &&
      btn4
    ) {
      this.positionTooltipOverButton(this.volumeTooltip, btn4);
    }
  }

  /** 객체 내보내기: 선택된 점만 PLY 저장 → 지우기 → 저장한 PLY 로드 (createObjectFromSelection.js) */
  async runCreateObject() {
    const viewer = this.selectionTool?.viewer ?? window.__viewer;
    await runCreateObjectFromSelection(viewer, this.selectionTool, {
      onExportClick: this.onExportClick,
      updateUndoRedoButtons: this.updateUndoRedoButtons,
      onAfterLoad: () => this.onClearSpatialSelectors?.(),
    });
  }

  init() {
    if (this.panelWrap) {
      this.panelWrap.style.display = 'flex';
      this.panelWrap.setAttribute('aria-hidden', 'false');
    }

    this._onWinResizeGizmoTooltips = () => {
      if (this.activeButtonIndex === 1 && this.brushTooltip?.style.display !== 'none' && this.buttons[1]) {
        this.positionTooltipOverButton(this.brushTooltip, this.buttons[1]);
      }
      if (this.activeButtonIndex === 3 && this.volumeTooltip?.style.display !== 'none' && this.buttons[3]) {
        this.positionTooltipOverButton(this.volumeTooltip, this.buttons[3]);
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this._onWinResizeGizmoTooltips, { passive: true });
    }
    this.buttons.forEach((btn, index) => {
      if (btn) {
        btn.classList.add('is-off');
        btn.addEventListener('click', () => {
          this.toggleButton(index);
        });
      }
    });
    [this.eraserButton, this.complementButton, this.exportButton].forEach((btn) => {
      if (btn) btn.classList.add('is-off');
    });
    this.toggleTooltip = (tooltip, forceHide = false) => {
      if (!tooltip) return;
      if (forceHide) {
        tooltip.style.display = 'none';
        return;
      }
      const isVisible = tooltip.style.display !== 'none';
      tooltip.style.display = isVisible ? 'none' : 'block';
    };

    if (this.complementButton) {
      this.complementButton.addEventListener('click', () => {
        if (this.onComplementClick) this.onComplementClick();
        if (this.selectionTool) {
          this.selectionTool.complementSelection();
          this.updateEraserComplementDisabledState();
        }
        this.syncComplementButtonState();
      });
    }
    const boxInputs = [
      [this.boxWidthInput, this.boxWidthSlider, 'x'],
      [this.boxHeightInput, this.boxHeightSlider, 'y'],
      [this.boxDepthInput, this.boxDepthSlider, 'z'],
    ];
    boxInputs.forEach(([input, slider, axis]) => {
      if (input) {
        input.addEventListener('input', (e) => {
          let v = Math.max(0.1, Math.min(10, parseFloat(e.target.value) || 1));
          input.value = v;
          slider.value = v;
          this.updateBoxSize(axis, v);
        });
      }
      if (slider) {
        slider.addEventListener('input', (e) => {
          let v = Math.max(0.1, Math.min(10, parseFloat(e.target.value) || 1));
          input.value = v;
          slider.value = v;
          this.updateBoxSize(axis, v);
        });
      }
    });
    if (this.boxSizeResetBtn) {
      this.boxSizeResetBtn.addEventListener('click', () => {
        this.setBoxGaugeValues(1, 1, 1);
        this.updateBoxSize('x', 1);
        this.updateBoxSize('y', 1);
        this.updateBoxSize('z', 1);
      });
    }

    if (this.volumeTooltip) {
      this.volumeTooltip.addEventListener('click', (e) => e.stopPropagation());
      this.volumeTooltip.addEventListener('pointerdown', (e) => e.stopPropagation());
      this.volumeTooltip.addEventListener('pointerup', (e) => e.stopPropagation());
    }
    if (this.volumeShapeToggleBtn) {
      this.volumeShapeToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.switchVolumeShape();
      });
    }

    if (this.volumeClearBtn) {
      this.volumeClearBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.selectionTool?.clearAllAccumulatedVolumesForCurrentSelection) {
          this.selectionTool.clearAllAccumulatedVolumesForCurrentSelection();
        }
      });
    }

    if (this.boxSetBtn) {
      this.boxSetBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.selectionTool?.applyBoxVolumeSelection) {
          this.selectionTool.applyBoxVolumeSelection('set');
        }
      });
    }

    if (this.boxAddBtn) {
      this.boxAddBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.selectionTool?.applyBoxVolumeSelection) {
          this.selectionTool.applyBoxVolumeSelection('add');
        }
      });
    }

    if (this.sphereRadiusInput) {
      this.sphereRadiusInput.addEventListener('input', (e) => {
        const v = Math.max(0.1, Math.min(10, parseFloat(e.target.value) || 1));
        this.setSphereGaugeValue(v);
        this.updateSphereRadius(v);
      });
    }

    if (this.sphereRadiusSlider) {
      this.sphereRadiusSlider.addEventListener('input', (e) => {
        const v = Math.max(0.1, Math.min(10, parseFloat(e.target.value) || 1));
        this.setSphereGaugeValue(v);
        this.updateSphereRadius(v);
      });
    }


    if (this.sphereSetBtn) {
      this.sphereSetBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.selectionTool?.applySphereVolumeSelection) {
          this.selectionTool.applySphereVolumeSelection('set');
        }
      });
    }

    if (this.sphereAddBtn) {
      this.sphereAddBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.selectionTool?.applySphereVolumeSelection) {
          this.selectionTool.applySphereVolumeSelection('add');
        }
      });
    }

    if (this.eraserButton) {
      this.eraserButton.addEventListener('click', () => {
        if (this.eraserButton.classList.contains('object-details-panel__button--selector-disabled')) return;
        if (this.onEraserClick) this.onEraserClick();
        if (this.selectionTool) {
          this.selectionTool.eraseSelection();
          this.updateEraserComplementDisabledState();
        }
      });
    }

    this._boundPositionExportMenu = () => {
      if (this.exportMenu?.classList.contains('is-visible')) this.positionExportMenuFixed();
    };
    this._boundRepositionExportMenuOnScroll = () => {
      if (this.exportMenu?.classList.contains('is-visible')) this.positionExportMenuFixed();
    };
    this._exportMenuOutsideCloser = null;
    /** @type {ReturnType<typeof setTimeout>|null} */
    this._exportMenuCloseTimer = null;

    if (this.exportButton && this.exportMenu) {
      this.exportButton.addEventListener('click', (e) => {
        e.stopPropagation();
        const wasOpen = this.exportMenu.classList.contains('is-visible');
        if (wasOpen) {
          this.hideExportMenu();
          return;
        }
        if (this._exportMenuCloseTimer) {
          clearTimeout(this._exportMenuCloseTimer);
          this._exportMenuCloseTimer = null;
        }
        this.exportMenu.classList.add('is-visible');
        this.exportMenu.setAttribute('aria-hidden', 'false');
        this.positionExportMenuFixed();
        window.addEventListener('resize', this._boundPositionExportMenu, { passive: true });
        document.addEventListener('scroll', this._boundRepositionExportMenuOnScroll, true);
        if (this._exportMenuOutsideCloser) {
          document.removeEventListener('click', this._exportMenuOutsideCloser);
        }
        this._exportMenuOutsideCloser = (e2) => {
          const t = e2.target;
          if (this.exportWrap?.contains(t) || this.exportMenu?.contains(t)) return;
          this.hideExportMenu();
        };
        requestAnimationFrame(() => document.addEventListener('click', this._exportMenuOutsideCloser));
      });
    }
    if (this.exportMenu) {
      this.exportMenu.addEventListener('click', (e) => {
        const item = e.target.closest('[data-export-action]');
        if (!item) return;
        this.hideExportMenu();
        const action = item.getAttribute('data-export-action');
        if (action === 'ply') {
          if (this.onExportClick) this.onExportClick();
          const viewer = this.selectionTool?.viewer ?? window.__viewer;
          if (this.selectionTool && viewer) {
            exportFilteredPlyForSelectedObject(viewer, this.selectionTool);
          } else {
            alert('뷰어 또는 선택 도구가 준비되지 않았습니다.');
          }
        }
        if (action === 'compressed-ply') {
          if (this.onExportClick) this.onExportClick();
          const viewer = this.selectionTool?.viewer ?? window.__viewer;
          if (this.selectionTool && viewer) {
            exportFilteredCompressedPlyForSelectedObject(viewer, this.selectionTool);
          } else {
            alert('뷰어 또는 선택 도구가 준비되지 않았습니다.');
          }
        }
        if (action === 'create-object') {
          this.runCreateObject();
        }
      });
    }
    
    if (this.undoButton) {
      this.undoButton.addEventListener('click', () => {
        if (this.undoButton.disabled) return;
        if (this.selectionTool) {
          this.selectionTool.undo();
          this.updateUndoRedoButtons();
        }
      });
    }

    if (this.redoButton) {
      this.redoButton.addEventListener('click', () => {
        if (this.redoButton.disabled) return;
        if (this.selectionTool) {
          this.selectionTool.redo();
          this.updateUndoRedoButtons();
        }
      });
    }
    if (this.brushTooltip) {
      this.brushTooltip.addEventListener('click', (e) => {
        e.stopPropagation();
      });
      this.brushTooltip.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
      });
    }
    
    if (this.floodTooltip) {
      this.floodTooltip.addEventListener('click', (e) => {
        e.stopPropagation();
      });
      this.floodTooltip.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
      });
    }
    if (this.brushRadiusInput) {
      this.brushRadiusInput.addEventListener('input', (e) => {
        const value = Math.max(5, Math.min(200, parseInt(e.target.value) || 30));
        this.updateBrushRadius(value);
      });
    }
    
    if (this.brushRadiusSlider) {
      this.brushRadiusSlider.addEventListener('input', (e) => {
        this.updateBrushRadius(parseInt(e.target.value));
      });
    }
    if (this.floodThresholdInput) {
      this.floodThresholdInput.addEventListener('input', (e) => {
        const value = Math.max(0.1, Math.min(5.0, parseFloat(e.target.value) || 0.5));
        this.updateFloodThreshold(value);
      });
    }
    
    if (this.floodThresholdSlider) {
      this.floodThresholdSlider.addEventListener('input', (e) => {
        const value = parseInt(e.target.value) / 10.0;
        this.updateFloodThreshold(value);
      });
    }
  }

  /** 보내기 버튼 기준 왼쪽(뷰 쪽)에 메뉴 고정 — 메뉴는 body 포털이라 패널과 독립 */
  positionExportMenuFixed() {
    const btn = this.exportButton;
    const menu = this.exportMenu;
    if (!btn || !menu) return;
    const r = btn.getBoundingClientRect();
    const gap = 8;
    menu.style.right = `${Math.round(window.innerWidth - r.left + gap)}px`;
    menu.style.top = `${Math.round(r.top + r.height / 2)}px`;
  }

  clearExportMenuViewportStyles() {
    if (!this.exportMenu) return;
    this.exportMenu.style.right = '';
    this.exportMenu.style.top = '';
  }

  hideExportMenu() {
    if (!this.exportMenu) return;
    if (this._exportMenuCloseTimer) {
      clearTimeout(this._exportMenuCloseTimer);
      this._exportMenuCloseTimer = null;
    }
    this.exportMenu.classList.remove('is-visible');
    this.exportMenu.setAttribute('aria-hidden', 'true');
    // top/right를 즉시 지우면 fixed 박스가 순간 이동하며 튐 → 페이드 후 정리
    const menu = this.exportMenu;
    this._exportMenuCloseTimer = window.setTimeout(() => {
      this._exportMenuCloseTimer = null;
      if (menu && !menu.classList.contains('is-visible')) {
        this.clearExportMenuViewportStyles();
      }
    }, 180);

    window.removeEventListener('resize', this._boundPositionExportMenu);
    document.removeEventListener('scroll', this._boundRepositionExportMenuOnScroll, true);
    if (this._exportMenuOutsideCloser) {
      document.removeEventListener('click', this._exportMenuOutsideCloser);
      this._exportMenuOutsideCloser = null;
    }
  }

  setBoxGaugeValues(w, h, d) {
    if (this.boxWidthInput) this.boxWidthInput.value = w;
    if (this.boxWidthSlider) this.boxWidthSlider.value = w;
    if (this.boxHeightInput) this.boxHeightInput.value = h;
    if (this.boxHeightSlider) this.boxHeightSlider.value = h;
    if (this.boxDepthInput) this.boxDepthInput.value = d;
    if (this.boxDepthSlider) this.boxDepthSlider.value = d;
  }

  setSphereGaugeValue(r) {
    if (this.sphereRadiusInput) this.sphereRadiusInput.value = r;
    if (this.sphereRadiusSlider) this.sphereRadiusSlider.value = r;
  }

  updateBoxSize(axis, value) {
    if (window.spawnedWireObject && window.spawnedWireObject.name === 'WireBox') {
      const e = window.spawnedWireObject;
      let s = e.getLocalScale();
      if (!s) s = {x:1, y:1, z:1};
      s = { x: s.x, y: s.y, z: s.z };
      s[axis] = value;
      e.setLocalScale(s.x, s.y, s.z);
      if (e.render?.meshInstances?.[0]) {
        const app = window.__viewer?.app;
        if (app && window.createWireBoxMeshAndMaterial) {
          const { mesh, material } = window.createWireBoxMeshAndMaterial(app, s);
          if (mesh && material) {
            e.render.meshInstances[0].mesh = mesh;
            e.render.meshInstances[0].material = material;
          }
        }
      }
    }
  }

  updateSphereRadius(radius) {
    if (window.spawnedWireObject && window.spawnedWireObject.name === 'WireSphere') {
      const e = window.spawnedWireObject;
      e.__wireRadius = radius;
      if (e.render && e.render.meshInstances && e.render.meshInstances[0]) {
        const app = window.__viewer?.app;
        if (app && window.createWireSphereMeshAndMaterial) {
          const { mesh, material } = window.createWireSphereMeshAndMaterial(app, radius);
          if (mesh && material) {
            e.render.meshInstances[0].mesh = mesh;
            e.render.meshInstances[0].material = material;
          }
        }
      }
    }
  }

  setSelectionTool(tool) {
    this.selectionTool = tool;
    if (this.selectionTool) {
      this.selectionTool.detailsPanel = this;
    }
    this.updateUndoRedoButtons();
  }

  setMultiFileMode(isMultiFile) {
    for (let i = 0; i <= 2; i++) {
      const btn = this.buttons[i];
      if (!btn) continue;
      btn.style.display = isMultiFile ? 'none' : '';
    }
    if (isMultiFile) {
      this.hideAllTooltips();
      if (this.activeButtonIndex != null && this.activeButtonIndex <= 2) {
        const activeBtn = this.buttons[this.activeButtonIndex];
        if (activeBtn) activeBtn.classList.add('is-off');
        this.activeButtonIndex = null;
      }
    }
  }

  updateBrushRadius(value) {
    if (this.brushRadiusInput) {
      this.brushRadiusInput.value = value;
    }
    if (this.brushRadiusSlider) {
      this.brushRadiusSlider.value = value;
    }
    if (this.selectionTool) {
      this.selectionTool.brushRadius = value;
      if (this.selectionTool.renderer?.brushCircle) {
        this.selectionTool.renderer.brushCircle.setAttribute('r', value.toString());
      }
    }
  }

  updateFloodThreshold(value) {
    if (this.floodThresholdInput) {
      this.floodThresholdInput.value = value.toFixed(1);
    }
    if (this.floodThresholdSlider) {
      this.floodThresholdSlider.value = Math.round(value * 10);
    }
    if (this.selectionTool) {
      this.selectionTool.floodThreshold = value;
    }
  }

  toggleButton(index) {
    const clickedBtn = this.buttons[index];
    if (!clickedBtn) return;
    this.hideAllTooltips();
    if (this.activeButtonIndex === index) {
      clickedBtn.classList.add('is-off');
      this.activeButtonIndex = null;
    } else {
      this.buttons.forEach(btn => {
        if (btn) btn.classList.add('is-off');
      });
      clickedBtn.classList.remove('is-off');
      this.activeButtonIndex = index;
      this.showTooltipForButton(index);
    }
    this.updateEraserComplementDisabledState();
    if (this.onButtonClick) {
      this.onButtonClick(this.activeButtonIndex);
    }
  }

  hideAllTooltips() {
    if (this.brushTooltip) this.brushTooltip.style.display = 'none';
    if (this.floodTooltip) this.floodTooltip.style.display = 'none';
    if (this.volumeTooltip) {
      this.volumeTooltip.style.display = 'none';
      this._restoreVolumeTooltipToPanel();
    }
  }

  showTooltipForButton(index) {
    if (index === 1 && this.brushTooltip) {
      this.brushTooltip.style.display = 'block';
      if (this.selectionTool) {
        this.updateBrushRadius(this.selectionTool.brushRadius);
      }
      if (this.buttons[1]) {
        this.positionTooltipOverButton(this.brushTooltip, this.buttons[1]);
      }
    }
    else if (index === 2 && this.floodTooltip) {
      this.floodTooltip.style.display = 'block';
      if (this.selectionTool) {
        this.updateFloodThreshold(this.selectionTool.floodThreshold);
      }
      if (this.buttons[2]) {
        this.positionTooltipOverButton(this.floodTooltip, this.buttons[2]);
      }
    }
    else if (index === 3 && this.volumeTooltip) {
      this._volumeShape = 'box';
      this.updateVolumeShapeUI();
      this.volumeTooltip.style.display = 'block';
      this.positionTooltipOverButton(this.volumeTooltip, this.buttons[3]);
      this.setBoxGaugeValues(
        parseFloat(this.boxWidthInput?.value || '1'),
        parseFloat(this.boxHeightInput?.value || '1'),
        parseFloat(this.boxDepthInput?.value || '1')
      );
    }
  }

  updateUndoRedoButtons() {
    if (!this.selectionTool) return;

    const canUndo = typeof this.selectionTool.canUndo === 'function' ? this.selectionTool.canUndo() : false;
    const canRedo = typeof this.selectionTool.canRedo === 'function' ? this.selectionTool.canRedo() : false;

    if (this.undoButton) {
      if (canUndo) {
        this.undoButton.classList.remove('is-off');
        this.undoButton.disabled = false;
      } else {
        this.undoButton.classList.add('is-off');
        this.undoButton.disabled = true;
      }
    }

    if (this.redoButton) {
      if (canRedo) {
        this.redoButton.classList.remove('is-off');
        this.redoButton.disabled = false;
      } else {
        this.redoButton.classList.add('is-off');
        this.redoButton.disabled = true;
      }
    }
  }

  syncComplementButtonState() {
    if (!this.complementButton || !this.selectionTool) return;
    const on = this.selectionTool.getComplementEnabled();

    this.complementButton.classList.remove('object-details-panel__button--complement-on', 'object-details-panel__button--complement-on-single');

    if (on === null) {
      this.complementButton.classList.add('is-off');
      this.complementButton.setAttribute('aria-pressed', 'false');
      return;
    }
    if (on) {
      this.complementButton.classList.remove('is-off');
      this.complementButton.classList.add('object-details-panel__button--complement-on');
      this.complementButton.setAttribute('aria-pressed', 'true');
    } else {
      this.complementButton.classList.add('is-off');
      this.complementButton.setAttribute('aria-pressed', 'false');
    }
  }

  updateEraserComplementDisabledState() {
    const disabledClass = 'object-details-panel__button--selector-disabled';
    if (this.eraserButton && this.selectionTool) {
      const hasSelection = this.selectionTool.hasSelectedPoints();
      if (hasSelection) this.eraserButton.classList.remove(disabledClass);
      else this.eraserButton.classList.add(disabledClass);
    }
  }

  show() {
    this.isVisible = true;
    this.syncComplementButtonState();
    this.updateEraserComplementDisabledState();
  }

  hide() {
    this.isVisible = false;
    this.buttons.forEach((btn) => {
      if (btn) btn.classList.add('is-off');
    });
    this.activeButtonIndex = null;
    this.hideAllTooltips();
    this.syncComplementButtonState();
    this.updateEraserComplementDisabledState();
  }

  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  getActiveButton() {
    return this.activeButtonIndex;
  }

  /** 공간 셀렉터(스피어/박스) 버튼 포함 모든 선택 도구 버튼 해제 */
  deselectShapeButtons() {
    this.buttons.forEach((btn) => {
      if (btn) btn.classList.add('is-off');
    });
    this.activeButtonIndex = null;
    this.hideAllTooltips?.();
  }
}
