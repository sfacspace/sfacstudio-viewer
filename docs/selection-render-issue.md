# 선택/지움 반영이 카메라를 돌려야 보이는 문제 정리

## 1. 현상

- **선택**(노란색 하이라이트), **지우기**(알파 0), **Undo/Redo** 시 데이터는 정상 반영됨(리소스 `colorTexture` 픽셀 수정 완료).
- 화면에는 **카메라를 돌리기 전까지** 반영되지 않고, 카메라를 돌리면 그때서야 반영된 것이 보임.

## 2. 이미 시도한 것

- `app.renderNextFrame = true` → 다음 프레임은 그려짐(로그상 framerender/frameend 확인).
- `layer.gsplatPlacementsDirty = true` → 레이어 2개 dirty 설정됨.
- `device._uploadDirtyTextures()` → 수정 직후 GPU 업로드 호출.

그래도 화면에는 즉시 반영되지 않음.

## 3. 실제 원인 (PlayCanvas Unified gsplat 경로)

Unified 경로에서는 **리소스의 `colorTexture`**를 매 프레임 그대로 쓰지 않고,  
**work buffer**에 한 번 복사해 두고, 그 work buffer를 그립니다.

그 **복사**(`resource.colorTexture` → work buffer)가 일어나는 조건이 제한되어 있음:

1. **`splat.update()`가 true일 때**  
   → `workBuffer.render(_updatedSplats, ...)` 호출  
   - `GSplatInfo.update()`는 **노드의 world matrix가 바뀌었을 때만** true 반환 (위치/회전/스케일 변경).
   - **colorTexture만 바꾼 경우**에는 world matrix가 그대로라 `splat.update()`는 **false** → 복사 안 함.

2. **카메라가 일정 각도/거리 이상 움직였을 때** (SH 사용 시)  
   → `workBuffer.renderColor(_splatsNeedingColorUpdate, ...)` 호출  
   - 우리가 선택/지움만 하고 카메라를 안 돌리면 이 조건도 만족하지 않음.

그래서 **colorTexture만 바꾼 경우**에는  
- `gsplatPlacementsDirty = true` → placement 목록만 다시 맞추고  
- work buffer를 **다시 채우는** `workBuffer.render(...)` / `workBuffer.renderColor(...)`가 호출되지 않아  
- 이전에 복사된 내용이 계속 그려지고,  
- **카메라를 돌리면** (2) 조건이 만족되며 `renderColor`가 호출되어 그때서야 새 색이 보이는 것.

즉, **“색만 바뀌었을 때 work buffer를 다시 채우는” 경로가 PlayCanvas Unified 쪽에 없음.**

---

## 4. 주의 깊게 봐야 할 코드 (PlayCanvas 쪽)

### 4.1 Work buffer에 색을 채우는 유일한 경로

**파일:** `LiamViewer2/public/js/playcanvas.mjs`

| 줄 번호(대략) | 내용 |
|---------------|------|
| **78668–78675** | `GSplatInfo.update()` – **world matrix 변경 시에만** true 반환. colorTexture 변경은 보지 않음. |
| **80616–80644** | `applyWorkBufferUpdates(state)` – `splat.update()` true → `workBuffer.render(_updatedSplats)`, 카메라 이동 시 → `workBuffer.renderColor(_splatsNeedingColorUpdate)`. **색이 다시 복사되는 곳은 사실상 여기 두 경로뿐.** |
| **80574–80604** | `rebuildWorkBuffer(worldState, count)` – `workBuffer.render(worldState.splats, ...)` 호출. 정렬/월드 상태가 바뀌었을 때만 호출됨. |
| **80567–80576** | `onSorted()` – `worldState.sortedBefore`가 false일 때만 `rebuildWorkBuffer` 호출. |

### 4.2 Director/레이어 dirty 처리

| 줄 번호(대략) | 내용 |
|---------------|------|
| **81099–81116** | `GSplatDirector.update(comp)` – `layer.gsplatPlacementsDirty`이면 `getLayerData`, `reconcile(layer.gsplatPlacements)` 호출. **reconcile은 placement 목록만 갱신.** |
| **81119–81127** | 같은 블록 안에서 `gsplatManager.update()` 호출. 이 안에서 `applyWorkBufferUpdates`가 호출되며, 위 조건에 맞을 때만 work buffer가 다시 채워짐. |
| **81131–81134** | 프레임 끝에서 `comp.layerList[i].gsplatPlacementsDirty = false`로 초기화. |

### 4.3 리소스 colorTexture → material

| 줄 번호(대략) | 내용 |
|---------------|------|
| **37708** | `resource.configureMaterial(material)` – `material.setParameter('splatColor', this.colorTexture)`. 실제 복사 시 이 텍스처를 샘플링함. |
| **37351–37381** | `renderSplat(splatInfo)` – `resource.getWorkBufferRenderInfo(...)`, `workBufferRenderInfo.quadRender.render(viewport)`. work buffer를 **채우는** 쿼드 렌더(리소스 colorTexture에서 읽음)가 여기서 호출되지만, **이 renderSplat이 호출되는 상위 흐름**이 “dirty일 때”가 아니라 정렬/업데이트 결과에 따라 제한됨. |

---

## 5. 우리 쪽 코드 (참고)

- **viewer.js**  
  - `requestRenderAfterSelectionChange()`  
    - `_uploadDirtyTextures()`, `renderNextFrame = true`, `layer.gsplatPlacementsDirty = true` 설정.
- **selectionTool.js**  
  - 색 변경 후 `_requestRenderAfterColorChange()` → viewer의 `requestRenderAfterSelectionChange()` 호출.

---

## 6. 해결 방향 (요약)

PlayCanvas를 수정할 수 있다면:

- **옵션 A**  
  - 리소스에 “color texture가 바뀌었음” 플래그를 두고,  
  - `GSplatInfo.update()` 또는 `applyWorkBufferUpdates()` 쪽에서 이 플래그를 보면  
    해당 splat을 `_updatedSplats` 또는 `_splatsNeedingColorUpdate`에 넣어  
    `workBuffer.render(...)` / `workBuffer.renderColor(...)`가 한 번 호출되도록 함.

- **옵션 B**  
  - “색만 갱신”용 API를 하나 두고 (예: placement 또는 layer 기준),  
  - 그게 호출되면 해당 placement들의 splat만 모아서  
    `workBuffer.render(splats, ...)` 또는 `workBuffer.renderColor(splats, ...)`를 한 번 호출.

PlayCanvas를 수정할 수 없다면:

- **옵션 C**  
  - 앱 쪽에서 “색이 바뀌었을 때” 카메라를 극소량 움직였다가 되돌리기 등으로  
    `colorUpdateAngle`/`colorUpdateDistance`를 만족시켜 `renderColor`가 한 번 호출되게 하는 식의 우회 (구현/유지보수 비용과 부작용 검토 필요).

위 내용을 기준으로 **4.1, 4.2, 4.3** 구간을 보면, “언제 work buffer가 다시 채워지는지”와 “우리가 건드리는 dirty/upload는 왜만으로는 부족한지”가 명확해진다.
