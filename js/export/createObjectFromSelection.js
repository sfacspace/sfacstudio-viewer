/**
 * 객체 내보내기: 선택된 점만 PLY로 저장 → 선택된 점 지우기 → 저장한 PLY를 로드.
 *
 * 순서:
 * 1. 점들을 선택한다
 * 2. 객체 내보내기를 클릭한다
 * 3. 선택된 점들의 중심이 계산된다
 * 4. Finder가 켜져서 저장할 위치를 정한다
 * 5. 인스펙터 Pos를 조정해 선택된 점들의 중심이 원점이 되도록 엔티티를 이동한 뒤 PLY 내보내기
 * 6. 내보내기 후 원래 Pos로 복원하고, 선택된 점을 지운다
 * 7. 저장한 PLY를 다시 불러온다
 * 8. 3번에서 계산한 중심 위치를 불러온 엔티티의 인스펙터 Pos에 적용한다
 */
import { buildPlyBytesForSelectedPointsOnly, getSelectedPointsCenter } from './exportPly.js';

const MIME = 'application/octet-stream';
const SUGGESTED_NAME = 'object.ply';

/**
 * 선택된 점만 PLY로 저장하고, 해당 점을 지운 뒤, 저장한 파일을 새 오브젝트로 로드합니다.
 *
 * @param {import('../core/viewer.js').PlayCanvasViewer|null} viewer
 * @param {Object} selectionTool - lastSelectedIndices, eraseSelection, getGsplatEntityFromSelection 등
 * @param {{ onExportClick?: () => void, updateUndoRedoButtons?: () => void, onAfterLoad?: () => void }} [callbacks]
 */
export async function runCreateObjectFromSelection(viewer, selectionTool, callbacks = {}) {
  const v = viewer ?? window.__viewer;
  if (!selectionTool || !v) {
    alert('뷰어 또는 선택 도구가 준비되지 않았습니다.');
    return;
  }
  if (!selectionTool.lastSelectedIndices?.length) {
    alert('선택된 점이 없습니다. 노란색으로 선택된 점이 있어야 합니다.');
    return;
  }

  // 3. 선택된 점들의 중심 계산
  const center = getSelectedPointsCenter(v, selectionTool);
  if (!center) {
    alert('선택된 점들의 중심을 계산할 수 없습니다.');
    return;
  }

  const entity = selectionTool.getGsplatEntityFromSelection?.();
  if (!entity?.getLocalPosition) {
    alert('선택에 해당하는 엔티티를 찾을 수 없습니다.');
    return;
  }

  const origPos = entity.getLocalPosition();
  const origX = origPos.x;
  const origY = origPos.y;
  const origZ = origPos.z;

  try {
    // 5. 인스펙터 Pos 조정: 선택된 점들의 중심이 원점이 되도록 엔티티 이동
    entity.setLocalPosition(origX - center.x, origY - center.y, origZ - center.z);
  } catch (e) {
    console.warn('[createObjectFromSelection] setLocalPosition failed', e);
  }

  if (typeof callbacks.onExportClick === 'function') callbacks.onExportClick();

  let fileToLoad = null;

  try {
    if (typeof window.showSaveFilePicker === 'function') {
      // 4. Finder(저장 대화상자)로 저장 위치 선택
      const fileHandle = await window.showSaveFilePicker({
        suggestedName: SUGGESTED_NAME,
        types: [{ description: 'PLY', accept: { [MIME]: ['.ply'] } }],
      });
      // 6. PLY 내보내기 (이미 중심이 원점이므로 translateToOrigin 불필요)
      const bytes = buildPlyBytesForSelectedPointsOnly(v, selectionTool, {
        bakeWorldTransform: true,
      });
      if (!bytes || bytes.length === 0) {
        entity.setLocalPosition(origX, origY, origZ);
        alert('PLY 데이터를 생성할 수 없습니다.');
        return;
      }
      const writable = await fileHandle.createWritable({ keepExistingData: false });
      await writable.write(bytes);
      await writable.close();
      fileToLoad = await fileHandle.getFile();
    } else {
      const bytes = buildPlyBytesForSelectedPointsOnly(v, selectionTool, {
        bakeWorldTransform: true,
      });
      if (!bytes || bytes.length === 0) {
        entity.setLocalPosition(origX, origY, origZ);
        alert('PLY 데이터를 생성할 수 없습니다.');
        return;
      }
      const url = URL.createObjectURL(new Blob([bytes], { type: MIME }));
      const a = document.createElement('a');
      a.href = url;
      a.download = SUGGESTED_NAME;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      fileToLoad = new File([bytes], SUGGESTED_NAME, { type: MIME });
    }

    // 내보내기 후 원래 Pos로 복원
    entity.setLocalPosition(origX, origY, origZ);

    window.__showGlobalLoadingOverlay?.('객체 내보내기 중...', 0, { useSpinner: true });
    await selectionTool.eraseSelection();
    if (typeof callbacks.updateUndoRedoButtons === 'function') callbacks.updateUndoRedoButtons();
    window.__hideGlobalLoadingOverlay?.();

    if (!fileToLoad) return;

    // 7. 저장한 PLY 다시 불러오기
    const fileLoader = window.__fileLoader;
    const timeline = window.__timeline;
    if (fileLoader && typeof fileLoader.loadFiles === 'function') {
      const result = await fileLoader.loadFiles([fileToLoad], { silent: false });
      if (result?.success && result.results?.length > 0 && timeline && typeof timeline.addObject === 'function') {
        const loaded = result.results[0];
        // 8. 3번에서 계산한 중심 위치를 인스펙터 Pos에 적용
        if (loaded.entity) {
          loaded.entity.setLocalPosition(center.x, center.y, center.z);
        }
        const lastAddedObj = timeline.addObject(loaded.fileName, loaded.entity, loaded.splatId);
        if (lastAddedObj) timeline.selectObject(lastAddedObj.id);
        if (typeof window.updateExportButtonState === 'function') window.updateExportButtonState();
        if (typeof callbacks.onAfterLoad === 'function') callbacks.onAfterLoad();
      }
    } else if (typeof v.loadSplatFromFile === 'function') {
      await v.loadSplatFromFile(fileToLoad);
    } else {
      alert('PLY를 로드할 수 없습니다.');
    }
  } catch (err) {
    if (err?.name === 'AbortError') {
      entity.setLocalPosition(origX, origY, origZ);
      return;
    }
    entity.setLocalPosition(origX, origY, origZ);
    console.error('[createObjectFromSelection] runCreateObjectFromSelection failed:', err);
    alert('객체 내보내기 중 오류가 발생했습니다: ' + (err?.message || err));
  } finally {
    window.__hideGlobalLoadingOverlay?.();
    try {
      if (entity?.setLocalPosition) entity.setLocalPosition(origX, origY, origZ);
    } catch (_) {}
  }
}
