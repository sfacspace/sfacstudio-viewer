/**
 * Theme — LOUIS light/dark 전환.
 *
 * 기본은 light. <html data-theme>가 정본이고, 초기값은 index.html의 인라인 스크립트가
 * 첫 페인트 전에 정한다(FOUC 방지). 이 모듈은 토글과 변경 알림만 담당한다.
 */

const STORAGE_KEY = 'sfacstudio-theme';
export const THEME_CHANGE_EVENT = 'sfac:themechange';

export function getTheme() {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}

export function setTheme(theme) {
  const next = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch (e) {
    /* storage unavailable — theme still applies for this session */
  }
  window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail: { theme: next } }));
}

export function toggleTheme() {
  setTheme(getTheme() === 'dark' ? 'light' : 'dark');
}

/**
 * CSS 색 토큰을 [r, g, b, a] (0–1)로 읽는다. 3D 캔버스 clearColor처럼 CSS 밖에서
 * 토큰 색이 필요할 때 쓴다. 브라우저가 계산한 색을 그대로 파싱한다.
 */
export function readTokenColor(varName, fallback = [0, 0, 0, 1]) {
  const probe = document.createElement('span');
  probe.style.cssText = `position:absolute;visibility:hidden;pointer-events:none;color:var(${varName})`;
  document.body.appendChild(probe);
  const value = getComputedStyle(probe).color;
  probe.remove();

  const srgb = value.match(/color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\)/);
  if (srgb) {
    return [Number(srgb[1]), Number(srgb[2]), Number(srgb[3]), srgb[4] == null ? 1 : Number(srgb[4])];
  }
  const rgb = value.match(/rgba?\(\s*([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)(?:\s*[,/]\s*([\d.]+))?\s*\)/);
  if (rgb) {
    return [Number(rgb[1]) / 255, Number(rgb[2]) / 255, Number(rgb[3]) / 255, rgb[4] == null ? 1 : Number(rgb[4])];
  }
  return fallback;
}

/** 헤더의 테마 토글 버튼을 연결한다. */
export function initThemeToggle(button) {
  if (!button) return;
  const sync = () => {
    const dark = getTheme() === 'dark';
    button.setAttribute('aria-pressed', String(dark));
  };
  button.addEventListener('click', () => {
    toggleTheme();
    sync();
  });
  window.addEventListener(THEME_CHANGE_EVENT, sync);
  sync();
}
