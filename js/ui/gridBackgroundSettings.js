/** @typedef {'black' | 'white' | 'green'} GridBackgroundMode */

export const GRID_BG_STORAGE_KEY = 'viewer.settings.gridBackground';

export const GRID_BACKGROUND = {
  BLACK: 'black',
  WHITE: 'white',
  GREEN: 'green',
};

/** @type {Record<GridBackgroundMode, [number, number, number]>} */
export const GRID_BACKGROUND_RGB = {
  black: [0, 0, 0],
  white: [1, 1, 1],
  green: [0.13, 0.55, 0.2],
};

/** @returns {GridBackgroundMode} */
export function loadGridBackground() {
  try {
    const v = localStorage.getItem(GRID_BG_STORAGE_KEY);
    if (v === GRID_BACKGROUND.WHITE || v === GRID_BACKGROUND.GREEN) return v;
  } catch (_) { /* ignore */ }
  return GRID_BACKGROUND.BLACK;
}

/** @param {GridBackgroundMode} mode */
export function saveGridBackground(mode) {
  try {
    localStorage.setItem(GRID_BG_STORAGE_KEY, mode);
  } catch (_) { /* ignore */ }
}
