/**
 * Twin `/api` 가 끊기면 전 화면 오버레이 표시. 재시도 버튼은 브라우저 새로고침 없이 `/api/health`를 즉시 다시 호출한다.
 * - 시설 뷰어(`facilityId`): 서버 필수로 간주해 모니터링 항상 활성.
 * - 그 외: `/api/health` 가 한 번이라도 성공한 뒤에만 끊김 UI 표시.
 */

import { t } from '../i18n.js';

const DEFAULT_INTERVAL_MS = 12000;
const FETCH_TIMEOUT_MS = 8000;

/**
 * @param {{ getFacilityId?: () => string, intervalMs?: number }} [options]
 */
export function initViewerConnectionMonitor(options = {}) {
  const getFacilityId =
    typeof options.getFacilityId === 'function' ? options.getFacilityId : () => '';
  const intervalMs =
    typeof options.intervalMs === 'number' && options.intervalMs >= 3000
      ? options.intervalMs
      : DEFAULT_INTERVAL_MS;

  const overlay = document.getElementById('viewerConnectionLostOverlay');
  const refreshBtn = document.getElementById('viewerConnectionLostRefresh');
  if (!overlay) return;

  let intervalId = null;
  const fidInitial = String(getFacilityId() || '').trim();
  let armed = !!fidInitial;

  function show() {
    overlay.classList.add('is-visible');
    overlay.setAttribute('aria-hidden', 'false');
  }

  function hide() {
    overlay.classList.remove('is-visible');
    overlay.setAttribute('aria-hidden', 'true');
  }

  function ensurePolling() {
    if (intervalId != null) return;
    intervalId = window.setInterval(() => {
      void pingOnce();
    }, intervalMs);
  }

  if (armed) ensurePolling();

  async function probeHealth() {
    const ac = new AbortController();
    const to = window.setTimeout(() => ac.abort(), FETCH_TIMEOUT_MS);
    try {
      const r = await fetch('/api/health', {
        method: 'GET',
        cache: 'no-store',
        signal: ac.signal,
      });
      return r.ok;
    } catch {
      return false;
    } finally {
      window.clearTimeout(to);
    }
  }

  async function pingOnce() {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      if (armed) show();
      return;
    }

    const ok = await probeHealth();

    if (ok) {
      armed = true;
      ensurePolling();
      hide();
      return;
    }
    if (armed) show();
  }

  let retryInFlight = false;
  refreshBtn?.addEventListener('click', () => {
    if (retryInFlight) return;
    retryInFlight = true;
    refreshBtn.disabled = true;
    refreshBtn.setAttribute('aria-busy', 'true');
    refreshBtn.textContent = t('connection.retrying');
    void (async () => {
      const ok = await probeHealth();
      retryInFlight = false;
      refreshBtn.disabled = false;
      refreshBtn.removeAttribute('aria-busy');
      refreshBtn.textContent = t('connection.retry');
      if (ok) {
        armed = true;
        ensurePolling();
        hide();
      } else if (armed) {
        show();
      }
    })();
  });

  window.addEventListener('offline', () => {
    if (armed) show();
  });
  window.addEventListener('online', () => {
    void pingOnce();
  });

  window.__showViewerConnectionLost = () => {
    armed = true;
    ensurePolling();
    show();
  };
  window.__hideViewerConnectionLost = () => {
    hide();
  };
  window.__probeViewerConnectionHealth = probeHealth;

  void pingOnce();
}
