/**
 * 카메라 이동 오브젝트 관리
 * 타임라인에서 키프레임 마커 사이를 잇는 선을 관리
 */

export class CameraMovingObjectManager {
  /**
   * @param {Object} options
   * @param {Function} options.getKeyframes - 키프레임 목록 반환 함수
   * @param {Function} options.getMaxSeconds - 최대 시간 반환 함수
   * @param {Function} options.getTrackBounds - 트랙 영역 반환 함수
   * @param {Object} [options.viewer] - PlayCanvasViewer 인스턴스 (월드 연결선용)
   */
  constructor(options) {
    this._getKeyframes = options.getKeyframes;
    this._getMaxSeconds = options.getMaxSeconds;
    this._getTrackBounds = options.getTrackBounds;
    this._viewer = options.viewer || null;
    
    /** @type {Array<CameraMovingObject>} - 카메라 이동 오브젝트 목록 */
    this._objects = [];
    
    /** @type {number} - 오브젝트 번호 카운터 */
    this._objectCounter = 0;
    
    /** @type {HTMLElement|null} - 컨테이너 요소 */
    this._container = null;
    
    /** @type {string|null} - 현재 선택된 오브젝트 ID */
    this._selectedId = null;
    
    /** @type {pc.Entity|null} - 월드 연결선 엔티티 */
    this._worldLineEntity = null;
    
    /** @type {Array<pc.Entity>} - 베지어 곡선 세그먼트들 */
    this._curveSegments = [];
    
    // 스타일 설정
    this._lineHeight = 4;        // 선 높이
    this._lineColor = '#ffffff'; // 선 색상 (흰색)
    
    // 빈 곳 클릭 시 선택 해제를 위한 이벤트 핸들러
    this._onDocumentClick = this._handleDocumentClick.bind(this);
    
    // 에디터 UI 요소
    this._editorEl = null;
    this._titleEl = null;
    this._curvatureInput = null;
    this._angleInput = null;
    
    // 드래그 상태
    this._isDragging = false;
    this._dragTarget = null;
    this._dragStartY = 0;
    this._dragStartValue = 0;
  }
  
  /**
   * 초기화 - 컨테이너 설정
   */
  init() {
    this._container = document.querySelector('.timeline-container');
    if (!this._container) {
      console.warn('[CameraMovingObjectManager] .timeline-container를 찾을 수 없습니다.');
    }
    
    // 에디터 UI 초기화
    this._initEditorUI();
    
    // 문서 클릭 이벤트 등록 (선택 해제용)
    document.addEventListener('click', this._onDocumentClick);
  }
  
  /**
   * 에디터 UI 초기화
   * @private
   */
  _initEditorUI() {
    this._editorEl = document.getElementById('cameraPathEditor');
    this._titleEl = document.getElementById('cameraPathEditorTitle');
    this._curvatureInput = document.getElementById('cameraPathCurvature');
    this._angleInput = document.getElementById('cameraPathAngle');
    
    if (!this._editorEl) return;
    
    // 입력 이벤트 핸들러 - 유효성 검사 후 값 변경 적용
    const onInput = () => {
      this._validateInputImmediate();
      this._onEditorValueChange();
    };
    this._curvatureInput?.addEventListener('input', onInput);
    this._angleInput?.addEventListener('input', onInput);
    
    // 포커스 아웃 시에도 최종 적용
    const onChange = () => this._onEditorValueChange();
    this._curvatureInput?.addEventListener('change', onChange);
    this._angleInput?.addEventListener('change', onChange);

    // Enter 입력 시 즉시 확정
    const onKeyDown = (ev) => {
      if (ev.key !== 'Enter') return;
      ev.preventDefault();
      this._onEditorValueChange();
      ev.target?.blur?.();
    };
    this._curvatureInput?.addEventListener('keydown', onKeyDown);
    this._angleInput?.addEventListener('keydown', onKeyDown);
    
    // 드래그 이벤트 핸들러 (단위: 0.01)
    this._setupDragInput(this._curvatureInput, 0.01);
    this._setupDragInput(this._angleInput, 0.01);
    
    // 에디터 클릭 시 선택 해제 방지
    this._editorEl.addEventListener('click', (e) => e.stopPropagation());
  }
  
  /**
   * 드래그 가능한 입력 필드 설정
   * @private
   */
  _setupDragInput(input, sensitivity) {
    if (!input) return;
    
    // 클릭으로 전체 선택
    input.addEventListener('click', (e) => {
      if (!this._isDragging) {
        input.select();
      }
    });
    
    input.addEventListener('focus', (e) => {
      if (!this._isDragging) {
        input.select();
      }
    });
    
    // 포인터 다운 - 드래그 아이콘 영역 체크
    input.addEventListener('pointerdown', (e) => {
      // 드래그 아이콘 영역(오른쪽 24px)인지 확인
      const rect = input.getBoundingClientRect();
      const iconWidth = 24;
      const isDragArea = e.clientX > (rect.right - iconWidth);
      
      if (!isDragArea) return;
      
      e.preventDefault();
      e.stopPropagation();
      
      this._startDrag(e, input, sensitivity);
    });
  }
  
  /**
   * 드래그 시작
   * @private
   */
  _startDrag(e, input, sensitivity) {
    const startValue = parseFloat(input.value) || 0;
    const actualSensitivity = e.shiftKey ? sensitivity * 0.1 : sensitivity;
    let accumulatedDelta = 0;
    
    this._isDragging = true;
    this._dragTarget = input;
    
    input.classList.add('is-dragging');
    
    // Pointer Lock 요청
    input.requestPointerLock();
    
    const onMove = (moveEvent) => {
      moveEvent.preventDefault();
      
      // Pointer Lock 상태에서만 movementY 사용
      if (document.pointerLockElement === input) {
        accumulatedDelta -= moveEvent.movementY * actualSensitivity;
        const newValue = startValue + accumulatedDelta;
        
        // 소수점 2자리로 제한
        input.value = newValue.toFixed(2);
        
        // 실시간 적용
        this._onEditorValueChange();
      }
    };
    
    const onEnd = () => {
      input.classList.remove('is-dragging');
      
      // Pointer Lock 해제
      if (document.pointerLockElement === input) {
        document.exitPointerLock();
      }
      
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onEnd);
      
      this._isDragging = false;
      this._dragTarget = null;
      
      this._onEditorValueChange();
    };
    
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onEnd);
  }
  
  /**
   * 즉시 유효성 검사 - 잘못된 입력이 있으면 즉시 기본값으로 복원
   * @private
   */
  _validateInputImmediate() {
    if (!this._curvatureInput || !this._angleInput) return;
    
    const curvatureValue = parseFloat(this._curvatureInput.value);
    const angleValue = parseFloat(this._angleInput.value);
    
    // 곡률: 숫자가 아니면 즉시 기본값으로 복원
    if (isNaN(curvatureValue)) {
      this._curvatureInput.value = '1.00';
    }
    
    // 각도: 숫자가 아니면 즉시 기본값으로 복원
    if (isNaN(angleValue)) {
      this._angleInput.value = '0.00';
    }
  }

  /**
   * 에디터 값 변경 시 호출
   * @private
   */
  _onEditorValueChange() {
    if (!this._selectedId) return;
    
    const obj = this._objects.find(o => o.id === this._selectedId);
    if (!obj) return;
    
    // _validateInputImmediate에서 이미 유효성 검사와 기본값 복원 완료
    // 곡률 0은 직선이므로 유효한 값. NaN일 때만 기본값 사용
    const curvatureRaw = parseFloat(this._curvatureInput?.value);
    const curvature = Number.isNaN(curvatureRaw) ? 1 : curvatureRaw;
    const angleRaw = parseFloat(this._angleInput?.value);
    const angle = Number.isNaN(angleRaw) ? 0 : angleRaw;
    
    // 오브젝트에 곡률/각도 저장
    obj.curvature = curvature;
    obj.angle = angle;
    
    // 곡선 다시 그리기
    this._createWorldCurve(obj);
  }
  
  /**
   * 에디터 표시
   * @private
   */
  _showEditor(obj) {
    if (!this._editorEl) return;
    
    this._titleEl.textContent = obj.id;
    this._curvatureInput.value = (obj.curvature ?? 1).toFixed(2);
    this._angleInput.value = (obj.angle ?? 0).toFixed(2);
    
    this._editorEl.style.display = 'flex';
  }
  
  /**
   * 에디터 숨기기
   * @private
   */
  _hideEditor() {
    if (this._editorEl) {
      this._editorEl.style.display = 'none';
    }
  }
  
  /**
   * 키프레임 ID 쌍으로 키 생성
   * @private
   */
  _makeKey(fromId, toId) {
    return `${fromId}-${toId}`;
  }
  
  /**
   * 키프레임 변경 시 호출 - 카메라 이동 오브젝트 업데이트
   * 시작/도착 마커가 동일하면 오브젝트 유지, 다르면 새로 생성
   * @param {Array} keyframes - 키프레임 목록
   */
  onKeyframesChange(keyframes) {
    if (!keyframes || keyframes.length < 2) {
      // 모든 오브젝트 제거
      this._clearAllElements();
      this._objects = [];
      
      if (this._selectedId) {
        this._hideEditor();
        this._removeWorldCurve();
        this._selectedId = null;
      }
      return;
    }
    
    // 키프레임 정렬 (시간순)
    const sorted = [...keyframes].sort((a, b) => a.t - b.t);
    
    // 새로 필요한 연결 쌍 계산
    const newPairs = [];
    
    // 일반 연결 (인접 마커 간)
    for (let i = 0; i < sorted.length - 1; i++) {
      newPairs.push({
        fromKf: sorted[i],
        toKf: sorted[i + 1],
        isLoop: false,
      });
    }
    
    // 루프 연결 (마지막 → 첫번째)
    newPairs.push({
      fromKf: sorted[sorted.length - 1],
      toKf: sorted[0],
      isLoop: true,
    });
    
    // 기존 오브젝트를 키로 매핑
    const existingByKey = new Map();
    this._objects.forEach(obj => {
      const key = this._makeKey(obj.fromKeyframe.id, obj.toKeyframe.id);
      existingByKey.set(key, obj);
    });
    
    // 새로 필요한 키 집합
    const newKeys = new Set();
    newPairs.forEach(pair => {
      newKeys.add(this._makeKey(pair.fromKf.id, pair.toKf.id));
    });
    
    // 더 이상 필요 없는 오브젝트 제거
    const toRemove = [];
    this._objects.forEach(obj => {
      const key = this._makeKey(obj.fromKeyframe.id, obj.toKeyframe.id);
      if (!newKeys.has(key)) {
        toRemove.push(obj);
      }
    });
    
    toRemove.forEach(obj => {
      // DOM 요소 제거
      if (obj.element) {
        obj.element.remove();
        obj.element = null;
      }
      if (obj._element2) {
        obj._element2.remove();
        obj._element2 = null;
      }
      
      // 배열에서 제거
      const idx = this._objects.indexOf(obj);
      if (idx !== -1) {
        this._objects.splice(idx, 1);
      }
      
      // 선택된 오브젝트가 삭제되면 선택 해제
      if (obj.id === this._selectedId) {
        this._hideEditor();
        this._removeWorldCurve();
        this._selectedId = null;
      }
    });
    
    // 새 오브젝트 생성 또는 기존 오브젝트 업데이트
    const updatedObjects = [];
    
    newPairs.forEach(pair => {
      const key = this._makeKey(pair.fromKf.id, pair.toKf.id);
      const existing = existingByKey.get(key);
      
      if (existing) {
        // 기존 오브젝트 유지 - 시간 정보만 업데이트
        existing.fromKeyframe = pair.fromKf;
        existing.toKeyframe = pair.toKf;
        existing.isLoop = pair.isLoop;
        updatedObjects.push(existing);
      } else {
        // 새 오브젝트 생성
        const newObj = this._createObject(pair.fromKf, pair.toKf, pair.isLoop);
        updatedObjects.push(newObj);
      }
    });
    
    this._objects = updatedObjects;
    
    // DOM 요소 다시 렌더링
    this._clearAllElements();
    this._renderAll();
    
    // 선택된 오브젝트가 있으면 선택 상태 복원
    if (this._selectedId) {
      const selectedObj = this._objects.find(o => o.id === this._selectedId);
      if (selectedObj) {
        // 선택 스타일 적용
        if (selectedObj.element) {
          selectedObj.element.classList.add('is-selected');
        }
        if (selectedObj._element2) {
          selectedObj._element2.classList.add('is-selected');
        }
        
        // 에디터 업데이트
        this._showEditor(selectedObj);
        
        // 곡선 업데이트
        this._createWorldCurve(selectedObj);
      }
    }
  }
  
  /**
   * 카메라 이동 오브젝트 생성 (새 오브젝트만)
   * @private
   */
  _createObject(fromKeyframe, toKeyframe, isLoop) {
    this._objectCounter++;
    const id = `CAM_${String(this._objectCounter).padStart(3, '0')}`;
    
    return {
      id,
      fromKeyframe: fromKeyframe,
      toKeyframe: toKeyframe,
      isLoop: isLoop, // 루프 연결 (마지막→처음)
      element: null,
      curvature: 1,   // 기본값
      angle: 0,       // 기본값
    };
  }
  
  /**
   * 카메라 라인의 세로 중앙 위치 계산 (마커와 동일한 높이)
   * @private
   * @returns {number|null}
   */
  _getLineTopPosition() {
    const cameraLine = document.querySelector(".timeline-camera-line");
    if (!cameraLine || !this._container) return null;
    
    const containerRect = this._container.getBoundingClientRect();
    const cameraLineRect = cameraLine.getBoundingClientRect();
    const cameraLineCenterY = cameraLineRect.top + cameraLineRect.height / 2 - containerRect.top;
    
    // 선의 높이의 절반을 빼서 중앙 정렬
    return cameraLineCenterY - this._lineHeight / 2;
  }
  
  /**
   * 모든 오브젝트 렌더링
   * @private
   */
  _renderAll() {
    if (!this._container) {
      this.init();
      if (!this._container) return;
    }
    
    const bounds = this._getTrackBounds?.();
    const maxSeconds = this._getMaxSeconds?.() || 10;
    const lineTop = this._getLineTopPosition();
    
    if (!bounds || lineTop === null) return;
    
    this._objects.forEach(obj => {
      this._renderObject(obj, bounds, maxSeconds, lineTop);
    });
  }
  
  /**
   * 단일 오브젝트 렌더링
   * @private
   */
  _renderObject(obj, bounds, maxSeconds, lineTop) {
    // 기존 요소 제거
    if (obj.element) {
      obj.element.remove();
      obj.element = null;
    }
    
    const fromT = obj.fromKeyframe.t;
    const toT = obj.toKeyframe.t;
    
    // 위치 계산
    const fromX = bounds.left + (fromT / maxSeconds) * bounds.width;
    const toX = bounds.left + (toT / maxSeconds) * bounds.width;
    
    if (obj.isLoop) {
      // 루프: 두 개의 선으로 분리 (마지막→끝, 시작→처음)
      // 1. 마지막 마커 → 타임라인 끝
      const line1 = this._createLineElement(obj, fromX, bounds.left + bounds.width, true, lineTop);
      this._container.appendChild(line1);
      
      // 2. 타임라인 시작 → 첫 마커
      const line2 = this._createLineElement(obj, bounds.left, toX, true, lineTop);
      line2.dataset.loopPart = '2';
      this._container.appendChild(line2);
      
      // 첫번째 선만 element로 저장 (관리용)
      obj.element = line1;
      obj._element2 = line2;
    } else {
      // 일반: 하나의 선
      const line = this._createLineElement(obj, fromX, toX, false, lineTop);
      this._container.appendChild(line);
      obj.element = line;
    }
  }
  
  /**
   * 선 요소 생성
   * @private
   */
  _createLineElement(obj, startX, endX, isDashed, lineTop) {
    const line = document.createElement('div');
    line.className = isDashed ? 'camera-moving-object is-dashed' : 'camera-moving-object';
    line.dataset.objectId = obj.id;
    
    const width = Math.abs(endX - startX);
    const left = Math.min(startX, endX);
    
    line.style.cssText = `
      position: absolute;
      left: ${left}px;
      top: ${lineTop}px;
      width: ${width}px;
      height: ${this._lineHeight}px;
      border-radius: 2px;
      pointer-events: auto;
      cursor: pointer;
      z-index: 155;
    `;
    
    // 툴팁 정보 추가
    line.title = `${obj.id}: ${obj.fromKeyframe.t.toFixed(2)}s → ${obj.toKeyframe.t.toFixed(2)}s${obj.isLoop ? ' (루프)' : ''}`;
    
    // 클릭 이벤트 추가 (같은 선 다시 클릭 시 선택 해제)
    line.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this._selectedId === obj.id) {
        this._clearSelection();
      } else {
        this._selectObject(obj.id);
      }
    });
    
    return line;
  }
  
  /**
   * 모든 요소 제거
   * @private
   */
  _clearAllElements() {
    this._objects.forEach(obj => {
      if (obj.element) {
        obj.element.remove();
        obj.element = null;
      }
      if (obj._element2) {
        obj._element2.remove();
        obj._element2 = null;
      }
    });
    
    // 혹시 남아있는 요소도 제거
    if (this._container) {
      this._container.querySelectorAll('.camera-moving-object').forEach(el => el.remove());
    }
  }
  
  /**
   * 마커 위치 업데이트 시 호출
   * @param {string} keyframeId - 이동한 키프레임 ID
   * @param {number} newTime - 새로운 시간
   */
  onMarkerMove(keyframeId, newTime) {
    // 해당 키프레임을 참조하는 오브젝트들의 정보 업데이트
    this._objects.forEach(obj => {
      if (obj.fromKeyframe.id === keyframeId) {
        obj.fromKeyframe = { ...obj.fromKeyframe, t: newTime };
      }
      if (obj.toKeyframe.id === keyframeId) {
        obj.toKeyframe = { ...obj.toKeyframe, t: newTime };
      }
    });
    
    // 다시 렌더링
    this._clearAllElements();
    this._renderAll();
  }
  
  /**
   * 특정 키프레임 ID로 관련 오브젝트 찾기
   * @param {string} keyframeId
   * @returns {Array<CameraMovingObject>}
   */
  getObjectsByKeyframeId(keyframeId) {
    return this._objects.filter(obj => 
      obj.fromKeyframe.id === keyframeId || obj.toKeyframe.id === keyframeId
    );
  }
  
  /**
   * 오브젝트 목록 반환
   * @returns {Array<CameraMovingObject>}
   */
  getAll() {
    return [...this._objects];
  }
  
  /**
   * 오브젝트 개수
   * @returns {number}
   */
  get count() {
    return this._objects.length;
  }
  
  /**
   * 오브젝트 선택
   * @param {string} objectId
   */
  _selectObject(objectId) {
    // 이전 선택 해제
    this._clearSelection();
    
    const obj = this._objects.find(o => o.id === objectId);
    if (!obj) return;
    
    this._selectedId = objectId;
    
    // 선택 스타일 적용
    if (obj.element) {
      obj.element.classList.add('is-selected');
    }
    if (obj._element2) {
      obj._element2.classList.add('is-selected');
    }
    
    // 에디터 표시
    this._showEditor(obj);
    
    // 월드에 곡선 그리기
    this._createWorldCurve(obj);
  }
  
  /**
   * 선택 해제
   */
  _clearSelection() {
    if (!this._selectedId) return;
    
    const obj = this._objects.find(o => o.id === this._selectedId);
    if (obj) {
      if (obj.element) {
        obj.element.classList.remove('is-selected');
      }
      if (obj._element2) {
        obj._element2.classList.remove('is-selected');
      }
    }
    
    // 에디터 숨기기
    this._hideEditor();
    
    // 월드 곡선 제거
    this._removeWorldCurve();
    
    this._selectedId = null;
  }
  
  /**
   * 선택 해제 (외부 호출용)
   */
  clearSelection() {
    this._clearSelection();
  }
  
  /**
   * 베지어 곡선의 제어점 계산
   * @private
   */
  _calculateControlPoint(startPos, endPos, curvature, angleDeg) {
    const pc = window.pc;
    
    // 중점 계산
    const mid = new pc.Vec3().lerp(startPos, endPos, 0.5);
    
    // 시작-끝 방향 벡터
    const direction = new pc.Vec3().sub2(endPos, startPos);
    const length = direction.length();
    
    // 수직 벡터 계산 (기본 상향)
    const up = new pc.Vec3(0, 1, 0);
    const perpendicular = new pc.Vec3().cross(direction, up).normalize();
    
    // 만약 direction이 up과 평행하면 다른 축 사용
    if (perpendicular.length() < 0.001) {
      perpendicular.set(1, 0, 0);
    }
    
    // 각도에 따라 수직 벡터 회전 (줄넘기 효과)
    const angleRad = angleDeg * Math.PI / 180;
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);
    
    // direction 축 기준 회전
    const dirNorm = direction.clone().normalize();
    const rotatedPerp = new pc.Vec3();
    
    // Rodrigues' rotation formula
    const perpCrossDir = new pc.Vec3().cross(dirNorm, perpendicular);
    const perpDotDir = perpendicular.dot(dirNorm);
    
    rotatedPerp.x = perpendicular.x * cos + perpCrossDir.x * sin + dirNorm.x * perpDotDir * (1 - cos);
    rotatedPerp.y = perpendicular.y * cos + perpCrossDir.y * sin + dirNorm.y * perpDotDir * (1 - cos);
    rotatedPerp.z = perpendicular.z * cos + perpCrossDir.z * sin + dirNorm.z * perpDotDir * (1 - cos);
    
    // 제어점 = 중점 + 수직방향 * 곡률 * 길이의 절반
    const controlPoint = new pc.Vec3();
    controlPoint.x = mid.x + rotatedPerp.x * curvature * length * 0.5;
    controlPoint.y = mid.y + rotatedPerp.y * curvature * length * 0.5;
    controlPoint.z = mid.z + rotatedPerp.z * curvature * length * 0.5;
    
    return controlPoint;
  }
  
  /**
   * 이차 베지어 곡선 점 계산
   * @private
   */
  _quadraticBezier(p0, p1, p2, t) {
    const pc = window.pc;
    const oneMinusT = 1 - t;
    
    return new pc.Vec3(
      oneMinusT * oneMinusT * p0.x + 2 * oneMinusT * t * p1.x + t * t * p2.x,
      oneMinusT * oneMinusT * p0.y + 2 * oneMinusT * t * p1.y + t * t * p2.y,
      oneMinusT * oneMinusT * p0.z + 2 * oneMinusT * t * p1.z + t * t * p2.z
    );
  }
  
  /**
   * 월드에 베지어 곡선 생성
   * @private
   */
  _createWorldCurve(obj) {
    const pc = window.pc;
    if (!pc || !this._viewer?.app) return;
    
    // 기존 곡선 제거
    this._removeWorldCurve();
    
    const fromState = obj.fromKeyframe.state;
    const toState = obj.toKeyframe.state;
    
    if (!fromState?.position || !toState?.position) return;
    
    // 시작/끝 위치
    const startPos = new pc.Vec3(fromState.position.x, fromState.position.y, fromState.position.z);
    const endPos = new pc.Vec3(toState.position.x, toState.position.y, toState.position.z);
    
    // 곡률과 각도
    const curvature = obj.curvature ?? 1;
    const angle = obj.angle ?? 0;
    
    // 제어점 계산
    const controlPoint = this._calculateControlPoint(startPos, endPos, curvature, angle);
    
    // 재질 생성 (공유)
    const material = new pc.StandardMaterial();
    material.diffuse = new pc.Color(0.63, 1, 0.35, 1);  // 연두색 #a0ff5a
    material.emissive = new pc.Color(0.63, 1, 0.35, 1);
    material.emissiveIntensity = 1.5;  // 광선 효과
    material.useLighting = false;
    material.blendType = pc.BLEND_ADDITIVE;
    material.opacity = 0.9;
    material.update();
    
    // 곡선을 여러 세그먼트로 분할
    const segments = 20;
    const thickness = 0.05;
    
    for (let i = 0; i < segments; i++) {
      const t1 = i / segments;
      const t2 = (i + 1) / segments;
      
      const p1 = this._quadraticBezier(startPos, controlPoint, endPos, t1);
      const p2 = this._quadraticBezier(startPos, controlPoint, endPos, t2);
      
      // 세그먼트 엔티티 생성
      const segment = this._createSegmentEntity(p1, p2, thickness, material);
      this._curveSegments.push(segment);
      this._viewer.app.root.addChild(segment);
    }
  }
  
  /**
   * 세그먼트 엔티티 생성
   * @private
   */
  _createSegmentEntity(startPos, endPos, thickness, material) {
    const pc = window.pc;
    
    const segment = new pc.Entity('curve_segment');
    segment.addComponent('render', { type: 'box' });
    
    // 중점과 길이
    const mid = new pc.Vec3().lerp(startPos, endPos, 0.5);
    const length = startPos.distance(endPos);
    
    // 방향
    const dir = new pc.Vec3().sub2(endPos, startPos).normalize();
    
    // 위치 설정
    segment.setPosition(mid);
    
    // 스케일 설정
    segment.setLocalScale(thickness, thickness, length);
    
    // 회전 설정
    const up = Math.abs(dir.y) > 0.99 ? new pc.Vec3(1, 0, 0) : new pc.Vec3(0, 1, 0);
    const rotation = new pc.Quat();
    const lookAtMat = new pc.Mat4().setLookAt(pc.Vec3.ZERO, dir, up);
    rotation.setFromMat4(lookAtMat);
    segment.setLocalRotation(rotation);
    
    // 재질 적용
    segment.render.meshInstances[0].material = material;
    
    return segment;
  }
  
  /**
   * 월드 곡선 제거
   * @private
   */
  _removeWorldCurve() {
    this._curveSegments.forEach(segment => {
      segment.destroy();
    });
    this._curveSegments = [];
  }
  
  /**
   * 문서 클릭 핸들러 (빈 곳 클릭 시 선택 해제)
   * @private
   */
  _handleDocumentClick(e) {
    // 카메라 이동 오브젝트를 클릭한 경우는 무시 (이미 처리됨)
    if (e.target.closest('.camera-moving-object')) {
      return;
    }
    
    // 에디터를 클릭한 경우는 무시
    if (e.target.closest('.camera-path-editor')) {
      return;
    }
    
    // 월드(캔버스) 클릭 시 무시 - 3D 뷰어 영역
    if (e.target.closest('#app') || e.target.tagName === 'CANVAS') {
      return;
    }
    
    // 빈 곳 클릭 시 선택 해제
    this._clearSelection();
  }
  
  /**
   * 현재 선택된 오브젝트 ID
   * @returns {string|null}
   */
  get selectedId() {
    return this._selectedId;
  }
  
  /**
   * 정리
   */
  dispose() {
    // 이벤트 리스너 제거
    document.removeEventListener('click', this._onDocumentClick);
    
    // 에디터 숨기기
    this._hideEditor();
    
    // 월드 곡선 제거
    this._removeWorldCurve();
    
    this._clearAllElements();
    this._objects = [];
    this._objectCounter = 0;
    this._selectedId = null;
  }
}

/**
 * @typedef {Object} CameraMovingObject
 * @property {string} id - 오브젝트 ID (CAM_001 형식)
 * @property {Object} fromKeyframe - 시작 키프레임
 * @property {Object} toKeyframe - 종료 키프레임
 * @property {boolean} isLoop - 루프 연결 여부
 * @property {HTMLElement|null} element - DOM 요소
 */

export default CameraMovingObjectManager;
