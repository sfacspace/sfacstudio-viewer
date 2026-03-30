/**
 * 카메라 이동 경로 템플릿
 * 자동으로 4개의 카메라 마커를 배치하여 다양한 카메라 경로 생성
 */

import { t } from '../i18n.js';

export class CameraTemplatesManager {
  /**
   * @param {Object} options
   * @param {Object} options.viewer - PlayCanvasViewer 인스턴스
   * @param {Function} [options.getTotalFrames] - 총 프레임 수 getter (프레임 기반 배치용)
   * @param {Function} [options.getFps] - FPS getter (프레임 기반 배치용)
   * @param {Function} options.getMaxSeconds - 최대 시간 getter (폴백)
   * @param {Function} options.getKeyframes - 키프레임 getter
   * @param {Function} options.addKeyframe - 키프레임 추가 함수 (t: 초, state: 카메라 상태)
   * @param {Function} options.clearKeyframes - 키프레임 전체 삭제 함수
   * @param {Function} options.showConfirmModal - 확인 모달 표시 함수
   */
  constructor(options) {
    this._viewer = options.viewer;
    this._getTotalFrames = options.getTotalFrames;
    this._getFps = options.getFps;
    this._getMaxSeconds = options.getMaxSeconds;
    this._getKeyframes = options.getKeyframes;
    this._addKeyframe = options.addKeyframe;
    this._clearKeyframes = options.clearKeyframes;
    this._showConfirmModal = options.showConfirmModal;

    this._setCameraMoveSpeedProfile = options.setCameraMoveSpeedProfile;
    
    this._templateBtn = null;
    this._templateMenu = null;
    this._isOpen = false;
    /** 드롭다운을 열 때 궤도 중심이 꺼져 있어서 켠 경우, 메뉴 닫을 때 다시 끄기 위함 */
    this._orbitCenterRevealedForMenu = false;

    this._speedBtn = null;
    this._speedPanel = null;
    this._isSpeedOpen = false;
    this._speedStart = 25;
    this._speedEnd = -25;
    this._dragState = null;
    
    // 템플릿 정의
    this._templates = [
      { id: 'circle', name: '원형', description: '타겟 주위를 원형으로 회전' },
      { id: 'diamond', name: '다이아몬드', description: '직선으로 연결된 다이아몬드 형태' },
      { id: 'rollercoaster', name: '롤러코스터', description: '위아래로 굴곡있는 경로' },
      { id: 'wave', name: '웨이브', description: '파도 모양의 곡선 경로' },
    ];
  }
  
  /**
   * 초기화 - UI 생성
   */
  init() {
    this._createUI();
    this._bindEvents();
  }
  
  /**
   * UI 생성
   * @private
   */
  _createUI() {
    // 카메라 라인의 버튼 영역 찾기 (left 영역)
    const btnGroup = document.querySelector('.timeline-camera-line__left');
    if (!btnGroup) {
      console.warn('[CameraTemplates] .timeline-camera-line__left를 찾을 수 없습니다.');
      return;
    }
    
    // 휴지통 버튼 (모두 삭제) 찾기
    const deleteAllBtn = document.getElementById('timelineDeleteAllBtn');
    
    // 템플릿 + 속도 프로필 버튼 컨테이너 생성 (data-i18n으로 언어 전환 시 갱신)
    const templateContainer = document.createElement('div');
    templateContainer.className = 'template-dropdown';
    templateContainer.innerHTML = `
      <button id="templateBtn" class="timeline-camera-line__btn template-btn" type="button" title="${t('template.button')}" data-i18n="template.button" data-i18n-attr="title">
        <span class="template-btn__text" data-i18n="template.button">${t('template.button')}</span>
        <span class="template-btn__arrow">▼</span>
      </button>
      <div class="camera-speed-profile-anchor">
        <button id="cameraSpeedProfileBtn" class="timeline-camera-line__btn template-btn template-btn--icon" type="button" title="${t('template.speedProfileTitle')}" data-i18n-title="template.speedProfileTitle">
          <span class="camera-speed-profile-btn__icon" aria-hidden="true"></span>
        </button>
        <div id="cameraSpeedProfilePanel" class="camera-speed-profile" aria-hidden="true">
          <div class="camera-speed-profile__header">
            <span class="camera-speed-profile__title" data-i18n="template.speed">${t('template.speed')}</span>
          </div>
          <div class="camera-speed-profile__grid">
            <div class="camera-speed-profile__control" data-kind="start">
              <div class="camera-speed-profile__label" data-i18n="template.speedStart">${t('template.speedStart')}</div>
              <div class="camera-speed-profile__bar" data-role="bar">
                <div class="camera-speed-profile__track"></div>
                <div class="camera-speed-profile__thumb" data-role="thumb"></div>
              </div>
              <input class="camera-speed-profile__value" data-role="value" type="number" min="-100" max="100" step="0.01" value="25" inputmode="numeric" />
            </div>
            <div class="camera-speed-profile__control" data-kind="end">
              <div class="camera-speed-profile__label" data-i18n="template.speedEnd">${t('template.speedEnd')}</div>
              <div class="camera-speed-profile__bar" data-role="bar">
                <div class="camera-speed-profile__track"></div>
                <div class="camera-speed-profile__thumb" data-role="thumb"></div>
              </div>
              <input class="camera-speed-profile__value" data-role="value" type="number" min="-100" max="100" step="0.01" value="-25" inputmode="numeric" />
            </div>
          </div>
        </div>
      </div>
      <div id="templateMenu" class="template-menu" aria-hidden="true">
        ${this._templates.map(tpl => `
          <button type="button" class="template-menu__item" data-template="${tpl.id}" data-i18n="template.${tpl.id}" data-i18n-title="template.${tpl.id}Desc" title="${t(`template.${tpl.id}Desc`)}">
            ${t(`template.${tpl.id}`)}
          </button>
        `).join('')}
      </div>
    `;
    
    // 휴지통 버튼 왼쪽에 삽입
    if (deleteAllBtn) {
      btnGroup.insertBefore(templateContainer, deleteAllBtn);
    } else {
      btnGroup.appendChild(templateContainer);
    }
    
    this._templateBtn = document.getElementById('templateBtn');
    this._templateMenu = document.getElementById('templateMenu');

    this._speedBtn = document.getElementById('cameraSpeedProfileBtn');
    this._speedPanel = document.getElementById('cameraSpeedProfilePanel');

    this._renderSpeedProfileUI();
  }
  
  /**
   * 이벤트 바인딩
   * @private
   */
  _bindEvents() {
    if (!this._templateBtn || !this._templateMenu) return;
    
    // 버튼 클릭 - 메뉴 토글 (Fly 모드 비활성화 시 무시)
    this._templateBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this._templateBtn.getAttribute('aria-disabled') === 'true') return;
      this._toggleMenu();
    });
    
    // 메뉴 항목 클릭
    this._templateMenu.addEventListener('click', (e) => {
      const item = e.target.closest('.template-menu__item');
      if (!item) return;
      
      e.stopPropagation();
      const templateId = item.dataset.template;
      this._applyTemplate(templateId);
      this._closeMenu();
    });
    
    // 외부 클릭 시 메뉴 닫기
    document.addEventListener('click', (e) => {
      if (!this._templateBtn.contains(e.target) && !this._templateMenu.contains(e.target)) {
        this._closeMenu();
      }

      if (this._speedBtn && this._speedPanel) {
        if (!this._speedBtn.contains(e.target) && !this._speedPanel.contains(e.target)) {
          this._closeSpeedPanel();
        }
      }
    });

    if (this._speedBtn && this._speedPanel) {
      this._speedBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this._toggleSpeedPanel();
      });

      this._speedPanel.addEventListener('click', (e) => e.stopPropagation());

      this._speedPanel.addEventListener('pointerdown', (e) => {
        const control = e.target.closest('.camera-speed-profile__control');
        const bar = e.target.closest('[data-role="bar"]');
        if (!control || !bar) return;

        e.preventDefault();
        e.stopPropagation();

        const kind = control.dataset.kind;
        this._dragState = {
          kind,
          bar,
        };

        this._updateSpeedFromPointer(e);

        this._speedPanel.setPointerCapture?.(e.pointerId);
      });

      this._speedPanel.addEventListener('pointermove', (e) => {
        if (!this._dragState) return;
        e.preventDefault();
        this._updateSpeedFromPointer(e);
      });

      this._speedPanel.addEventListener('change', (e) => {
        const input = e.target.closest('input[data-role="value"]');
        if (!input) return;
        const control = input.closest('.camera-speed-profile__control');
        if (!control) return;
        const kind = control.dataset.kind;
        
        // Validate input - if not a number, reset to 0
        const value = parseFloat(input.value);
        if (isNaN(value)) {
          input.value = '0.00';
          this._setSpeed(kind, 0);
        } else {
          this._setSpeed(kind, value);
        }
      });

      // Enter key handling
      this._speedPanel.addEventListener('keydown', (e) => {
        if (e.target.tagName !== 'INPUT' || e.key !== 'Enter') return;
        const input = e.target;
        const control = input.closest('.camera-speed-profile__control');
        if (!control) return;
        const kind = control.dataset.kind;
        
        // Validate input - if not a number, reset to 0
        const value = parseFloat(input.value);
        if (isNaN(value)) {
          input.value = '0.00';
          this._setSpeed(kind, 0);
        } else {
          this._setSpeed(kind, value);
        }
        e.target.blur();
      });

      const endDrag = (e) => {
        if (!this._dragState) return;
        this._dragState = null;
        this._speedPanel.releasePointerCapture?.(e.pointerId);
      };
      this._speedPanel.addEventListener('pointerup', endDrag);
      this._speedPanel.addEventListener('pointercancel', endDrag);
    }
  }

  _toggleSpeedPanel() {
    this._isSpeedOpen = !this._isSpeedOpen;
    this._speedPanel.classList.toggle('is-open', this._isSpeedOpen);
    this._speedBtn.classList.toggle('is-active', this._isSpeedOpen);
    this._speedPanel.setAttribute('aria-hidden', String(!this._isSpeedOpen));
  }

  _closeSpeedPanel() {
    if (!this._speedPanel || !this._speedBtn) return;
    this._isSpeedOpen = false;
    this._speedPanel.classList.remove('is-open');
    this._speedBtn.classList.remove('is-active');
    this._speedPanel.setAttribute('aria-hidden', 'true');
  }

  _clampSpeed(v) {
    return Math.max(-100, Math.min(100, Number(v) || 0));
  }

  _setSpeed(kind, value) {
    const v = this._clampSpeed(value);
    if (kind === 'start') {
      this._speedStart = v;
    } else {
      this._speedEnd = v;
    }

    this._renderSpeedProfileUI();
    this._setCameraMoveSpeedProfile?.(this._speedStart, this._speedEnd);
  }

  _updateSpeedFromPointer(e) {
    if (!this._dragState) return;
    const rect = this._dragState.bar.getBoundingClientRect();
    const y = Math.max(rect.top, Math.min(rect.bottom, e.clientY));
    const t = rect.height > 0 ? (y - rect.top) / rect.height : 0;
    const value = 100 - t * 200;
    this._setSpeed(this._dragState.kind, value);
  }

  _renderSpeedProfileUI() {
    if (!this._speedPanel) return;

    const update = (kind, value) => {
      const control = this._speedPanel.querySelector(`.camera-speed-profile__control[data-kind="${kind}"]`);
      if (!control) return;
      const valEl = control.querySelector('[data-role="value"]');
      const thumb = control.querySelector('[data-role="thumb"]');
      if (valEl) {
        if (valEl.tagName === 'INPUT') {
          valEl.value = value.toFixed(2);
        } else {
          valEl.textContent = String(Math.round(value));
        }
      }
      if (thumb) {
        const t = (100 - this._clampSpeed(value)) / 200;
        thumb.style.top = `${Math.max(0, Math.min(1, t)) * 100}%`;
      }
    };

    update('start', this._speedStart);
    update('end', this._speedEnd);
  }
  
  /**
   * Fly 모드 시 템플릿 버튼 비활성화 (MP4 추출과 동일). Orbit 모드에서만 활성화.
   * Fly 모드로 바뀌면 드롭다운 메뉴도 닫음.
   */
  updateTemplateButtonState() {
    if (!this._templateBtn) return;
    const isFlyMode = typeof window.__flyMode?.getEnabled === 'function' && window.__flyMode.getEnabled();
    this._templateBtn.classList.toggle('is-disabled', isFlyMode);
    this._templateBtn.setAttribute('aria-disabled', isFlyMode ? 'true' : 'false');
    if (isFlyMode) {
      this._templateBtn.setAttribute('data-tooltip', t('template.orbitRequired'));
      this._templateBtn.removeAttribute('title');
      if (this._templateMenu && this._isOpen) this._closeMenu();
    } else {
      this._templateBtn.removeAttribute('data-tooltip');
      this._templateBtn.title = t('template.button');
    }
  }

  /**
   * 메뉴 토글
   * 1. 궤도 중심이 꺼져 있으면 켜고 상단바 UI 동기화. 메뉴 닫거나 템플릿 생성 시 다시 끔.
   * 2. 궤도 중심이 켜져 있으면 아무 동작 없음.
   * @private
   */
  _toggleMenu() {
    if (this._templateBtn?.getAttribute('aria-disabled') === 'true') return;
    if (this._isOpen) {
      // 버튼으로 닫을 때도 궤도 중심 복원을 위해 _closeMenu() 호출
      this._closeMenu();
      return;
    }
    this._isOpen = true;
    if (!this._viewer?.isOrbitTargetMarkerVisible?.()) {
      window.__setOrbitMarkerVisibleWithUI?.(true);
      this._orbitCenterRevealedForMenu = true;
    } else {
      this._orbitCenterRevealedForMenu = false;
    }
    this._templateMenu.classList.toggle('is-open', this._isOpen);
    this._templateBtn.classList.toggle('is-active', this._isOpen);
    this._templateMenu.setAttribute('aria-hidden', String(!this._isOpen));
  }

  /**
   * 메뉴 닫기. 열 때 궤도 중심을 켰다면 다시 끄고 상단바 UI 동기화.
   * @private
   */
  _closeMenu() {
    if (this._orbitCenterRevealedForMenu) {
      window.__setOrbitMarkerVisibleWithUI?.(false);
      this._orbitCenterRevealedForMenu = false;
    }
    this._isOpen = false;
    this._templateMenu.classList.remove('is-open');
    this._templateBtn.classList.remove('is-active');
    this._templateMenu.setAttribute('aria-hidden', 'true');
  }
  
  /**
   * 템플릿 적용
   * @private
   */
  async _applyTemplate(templateId) {
    const keyframes = this._getKeyframes?.() || [];
    
    // 기존 마커가 있으면 확인
    if (keyframes.length > 0) {
      const confirmed = await this._showConfirmModal?.(
        t('template.applyConfirmTitle'),
        t('template.applyConfirmMessage')
      );
      if (!confirmed) return;
      
      // 기존 마커 삭제
      this._clearKeyframes?.();
    }

    // Fly 모드라면 Orbit 모드로 전환 후 템플릿 생성
    if (window.__flyMode?.getEnabled?.()) {
      window.__flyMode.disable();
      // Fly 모드 복귀 애니메이션 대기 (500ms)
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // 템플릿별 마커 생성
    switch (templateId) {
      case 'circle':
        this._createCircleTemplate();
        break;
      case 'diamond':
        this._createDiamondTemplate();
        break;
      case 'rollercoaster':
        this._createRollercoasterTemplate();
        break;
      case 'wave':
        this._createWaveTemplate();
        break;
    }

    // 드롭다운을 열 때 켜 둔 궤도 중심이면, 템플릿 생성 후 다시 끔
    if (this._orbitCenterRevealedForMenu) {
      window.__setOrbitMarkerVisibleWithUI?.(false);
      this._orbitCenterRevealedForMenu = false;
    }
  }
  
  /**
   * 현재 카메라 상태 가져오기
   * @private
   */
  _getCurrentCameraState() {
    if (!this._viewer) return null;
    return this._viewer.getCameraState?.();
  }
  
  /**
   * 원형 템플릿 생성 (프레임 기반)
   * 타겟을 중심으로 4개 지점을 둥글게 배치 (0°, 90°, 180°, 270°)
   * @private
   */
  _createCircleTemplate() {
    const state = this._getCurrentCameraState();
    if (!state) return;
    
    const totalFrames = Math.max(4, this._getTotalFrames?.() ?? Math.round((this._getMaxSeconds?.() || 10) * (this._getFps?.() || 30)));
    const fps = Math.max(1, this._getFps?.() || 30);
    const frameIndices = [
      0,
      Math.floor(totalFrames / 4),
      Math.floor(totalFrames / 2),
      Math.floor((3 * totalFrames) / 4),
    ];

    const target = state.target || { x: 0, y: 0, z: 0 };
    const distance = state.distance || 5;
    const pitch = state.pitch ?? 0;
    const baseYaw = state.yaw ?? 0;
    const offsets = [0, 90, 180, 270];

    for (let i = 0; i < 4; i++) {
      const t = (frameIndices[i] + 0.5) / fps;
      const yaw = baseYaw + offsets[i];
      const camState = i === 0 ? state : this._calculateOrbitPosition(target, distance, yaw, pitch);
      this._addKeyframe?.(t, camState);
    }
  }
  
  /**
   * 다이아몬드 템플릿 생성
   * 직선으로 연결
   * @private
   */
  _createDiamondTemplate() {
    const state = this._getCurrentCameraState();
    if (!state) return;
    
    const totalFrames = Math.max(4, this._getTotalFrames?.() ?? Math.round((this._getMaxSeconds?.() || 10) * (this._getFps?.() || 30)));
    const fps = Math.max(1, this._getFps?.() || 30);
    const frameIndices = [0, Math.floor(totalFrames / 4), Math.floor(totalFrames / 2), Math.floor((3 * totalFrames) / 4)];
    
    const target = state.target || { x: 0, y: 0, z: 0 };
    const distance = state.distance || 5;
    const pitch = state.pitch ?? 0;
    const currentYaw = state.yaw ?? 0;
    const baseYaw = currentYaw - 45;
    const angles = [45, 135, 225, 315];
    
    for (let i = 0; i < 4; i++) {
      const t = (frameIndices[i] + 0.5) / fps;
      const yaw = baseYaw + angles[i];
      const camState = i === 0 ? state : this._calculateOrbitPosition(target, distance, yaw, pitch);
      this._addKeyframe?.(t, camState);
    }
  }
  
  /**
   * 롤러코스터 템플릿 생성
   * 위아래로 굴곡있는 경로
   * @private
   */
  _createRollercoasterTemplate() {
    const state = this._getCurrentCameraState();
    if (!state) return;
    
    const totalFrames = Math.max(4, this._getTotalFrames?.() ?? Math.round((this._getMaxSeconds?.() || 10) * (this._getFps?.() || 30)));
    const fps = Math.max(1, this._getFps?.() || 30);
    const frameIndices = [0, Math.floor(totalFrames / 4), Math.floor(totalFrames / 2), Math.floor((3 * totalFrames) / 4)];
    
    const target = state.target || { x: 0, y: 0, z: 0 };
    const distance = state.distance || 5;
    const baseYaw = state.yaw ?? 0;
    const configs = [
      { yawOffset: 0, pitch: 20 },
      { yawOffset: 90, pitch: -20 },
      { yawOffset: 180, pitch: 20 },
      { yawOffset: 270, pitch: -20 },
    ];
    
    for (let i = 0; i < 4; i++) {
      const t = (frameIndices[i] + 0.5) / fps;
      const yaw = baseYaw + configs[i].yawOffset;
      const camState = i === 0 ? state : this._calculateOrbitPosition(target, distance, yaw, configs[i].pitch);
      this._addKeyframe?.(t, camState);
    }
  }
  
  /**
   * 웨이브 템플릿 생성 (프레임 기반)
   * 파도 모양의 곡선 경로
   * @private
   */
  _createWaveTemplate() {
    const state = this._getCurrentCameraState();
    if (!state) return;
    
    const totalFrames = Math.max(4, this._getTotalFrames?.() ?? Math.round((this._getMaxSeconds?.() || 10) * (this._getFps?.() || 30)));
    const fps = Math.max(1, this._getFps?.() || 30);
    const frameIndices = [0, Math.floor(totalFrames / 4), Math.floor(totalFrames / 2), Math.floor((3 * totalFrames) / 4)];
    
    const target = state.target || { x: 0, y: 0, z: 0 };
    const distance = state.distance || 5;
    const pitch = state.pitch ?? 0;
    const baseYaw = state.yaw ?? 0;
    const offsets = [0, 90, 180, 270];
    
    for (let i = 0; i < 4; i++) {
      const t = (frameIndices[i] + 0.5) / fps;
      const yaw = baseYaw + offsets[i];
      const camState = i === 0 ? state : this._calculateOrbitPosition(target, distance, yaw, pitch);
      this._addKeyframe?.(t, camState);
    }
  }
  
  /**
   * Orbit 위치 계산
   * @private
   */
  _calculateOrbitPosition(target, distance, yawDeg, pitchDeg) {
    const yawRad = yawDeg * Math.PI / 180;
    const pitchRad = pitchDeg * Math.PI / 180;
    
    // 구면 좌표계에서 직교 좌표계로 변환
    const x = target.x + distance * Math.cos(pitchRad) * Math.sin(yawRad);
    const y = target.y + distance * Math.sin(pitchRad);
    const z = target.z + distance * Math.cos(pitchRad) * Math.cos(yawRad);
    
    // 회전 계산 (타겟을 바라보는 방향)
    // yaw: Y축 회전, pitch: X축 회전
    const pc = window.pc;
    let rotation = { x: 0, y: 0, z: 0, w: 1 };
    
    if (pc) {
      const quat = new pc.Quat();
      // 타겟을 바라보는 회전 계산
      const camPos = new pc.Vec3(x, y, z);
      const targetPos = new pc.Vec3(target.x, target.y, target.z);
      const up = new pc.Vec3(0, 1, 0);
      
      const mat = new pc.Mat4();
      mat.setLookAt(camPos, targetPos, up);
      quat.setFromMat4(mat);
      
      rotation = { x: quat.x, y: quat.y, z: quat.z, w: quat.w };
    }
    
    return {
      position: { x, y, z },
      rotation,
      target: { ...target },
      distance,
      yaw: yawDeg,
      pitch: pitchDeg,
    };
  }
  
  /**
   * 정리
   */
  dispose() {
    const container = document.querySelector('.template-dropdown');
    if (container) {
      container.remove();
    }
  }
}

export default CameraTemplatesManager;
