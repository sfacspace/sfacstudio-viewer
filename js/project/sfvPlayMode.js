/**
 * Play 모드 스폰 상태 — `.sfv` 문서 `playMode` 필드 저장/복원
 * (전체 projectSaveLoad 없이 playMode만 다룸)
 */

export const SFV_FORMAT = 'sfv';
export const SFV_VERSION = 1;

const STORAGE_KEY = 'sfacstudio.sfv.playMode';

/** @param {string} [name] */
export function isSfvFileName(name) {
  return typeof name === 'string' && /\.sfv$/i.test(name.trim());
}

/** @param {object|null|undefined} doc */
export function extractPlayModeFromDocument(doc) {
  if (!doc || typeof doc !== 'object') return null;
  return doc.playMode && typeof doc.playMode === 'object' ? doc.playMode : null;
}

/** @param {object|null} playMode */
export function buildPlayModeSfvDocument(playMode) {
  return {
    format: SFV_FORMAT,
    version: SFV_VERSION,
    savedAt: Date.now(),
    playMode: playMode?.serializeState?.() ?? null,
  };
}

/** @param {object|null} playMode @param {object|null|undefined} doc */
export function applyPlayModeFromDocument(playMode, doc) {
  const raw = extractPlayModeFromDocument(doc);
  if (raw) playMode?.applySavedState?.(raw);
}

/** @param {object|null} playMode */
export function persistPlayModeToStorage(playMode) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(buildPlayModeSfvDocument(playMode)));
  } catch (_) {
    /* ignore quota / private mode */
  }
}

/** @param {object|null} playMode */
export function restorePlayModeFromStorage(playMode) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    applyPlayModeFromDocument(playMode, JSON.parse(raw));
  } catch (_) {
    /* ignore corrupt storage */
  }
}

/**
 * Twin `?facilityId=` — 서버 `.sfv`에서 playMode만 복원
 * @param {object|null} playMode
 */
export async function tryRestorePlayModeFromFacilitySfv(playMode) {
  if (!playMode) return;
  let fid = '';
  try {
    fid = new URLSearchParams(location.search).get('facilityId')?.trim() || '';
  } catch (_) {
    fid = '';
  }
  if (!fid) return;

  try {
    const res = await fetch(`/api/viewer-projects/${encodeURIComponent(fid)}`);
    if (!res.ok) return;
    const doc = await res.json();
    applyPlayModeFromDocument(playMode, doc);
    persistPlayModeToStorage(playMode);
  } catch (_) {
    /* Twin 서버 없음 — localStorage 폴백만 사용 */
  }
}

/** @param {object|null} playMode @param {File} file */
export async function applyPlayModeFromSfvFile(playMode, file) {
  if (!file || !playMode) return false;
  try {
    const doc = JSON.parse(await file.text());
    applyPlayModeFromDocument(playMode, doc);
    persistPlayModeToStorage(playMode);
    return true;
  } catch (_) {
    return false;
  }
}
