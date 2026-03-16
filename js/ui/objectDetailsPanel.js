/** Object details panel: selection tools, complement/eraser/export, undo/redo. */
import { exportFilteredPlyForSelectedObject } from '../export/exportPly.js';
import { exportFilteredCompressedPlyForSelectedObject } from '../export/compressedPlyExport.js';

export class ObjectDetailsPanel {
  constructor() {
    this.panel = document.getElementById('objectDetailsPanel');
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
    this.init();
  }

  positionTooltipOverButton(tooltipEl, buttonEl) {
    if (!tooltipEl || !buttonEl || !this.panel) return;
    const panelRect = this.panel.getBoundingClientRect();
    const btnRect = buttonEl.getBoundingClientRect();
    const btnCenterX = btnRect.left + btnRect.width / 2;
    const leftInPanel = btnCenterX - panelRect.left;
    tooltipEl.style.left = `${leftInPanel}px`;
    tooltipEl.style.transform = 'translateX(-50%)';
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
  }

  init() {
    if (this.panel) {
      this.panel.style.display = 'none';
    }
    this.buttons.forEach((btn, index) => {
      if (btn) {
        btn.classList.add('is-off');
        btn.addEventListener('click', () => {
          this.toggleButton(index);
        });
      }
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

    if (this.exportButton && this.exportMenu) {
      this.exportButton.addEventListener('click', (e) => {
        e.stopPropagation();
        const isVisible = this.exportMenu.classList.contains('is-visible');
        this.exportMenu.classList.toggle('is-visible', !isVisible);
        this.exportMenu.setAttribute('aria-hidden', isVisible ? 'true' : 'false');
        if (!isVisible) {
          const closeMenu = (e2) => {
            if (this.exportWrap && !this.exportWrap.contains(e2.target)) {
              this.exportMenu.classList.remove('is-visible');
              this.exportMenu.setAttribute('aria-hidden', 'true');
              document.removeEventListener('click', closeMenu);
            }
          };
          requestAnimationFrame(() => document.addEventListener('click', closeMenu));
        }
      });
    }
    if (this.exportMenu) {
      this.exportMenu.addEventListener('click', (e) => {
        const item = e.target.closest('[data-export-action]');
        if (!item) return;
        this.exportMenu.classList.remove('is-visible');
        this.exportMenu.setAttribute('aria-hidden', 'true');
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
    if (this.volumeTooltip) this.volumeTooltip.style.display = 'none';
  }

  showTooltipForButton(index) {
    if (index === 1 && this.brushTooltip) {
      this.brushTooltip.style.display = 'block';
      if (this.selectionTool) {
        this.updateBrushRadius(this.selectionTool.brushRadius);
      }
    }
    else if (index === 2 && this.floodTooltip) {
      this.floodTooltip.style.display = 'block';
      if (this.selectionTool) {
        this.updateFloodThreshold(this.selectionTool.floodThreshold);
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
    if (this.panel) {
      this.panel.style.display = 'flex';
      this.isVisible = true;
    }
    this.syncComplementButtonState();
    this.updateEraserComplementDisabledState();
  }

  hide() {
    if (this.panel) {
      this.panel.style.display = 'none';
      this.isVisible = false;
      this.buttons.forEach(btn => {
        if (btn) btn.classList.add('is-off');
      });
      this.activeButtonIndex = null;
      this.hideAllTooltips();
    }
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
}
