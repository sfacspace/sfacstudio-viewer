/**
 * 인스펙터 등: 왼쪽·오른쪽 사이드바 **안쪽** 뷰 영역으로 드래그 클램프.
 * 상단은 헤더 아래, 타임라인이 보이면 그 아래까지 반영(getBoundingClientRect).
 * @param {HTMLElement} panel
 * @returns {{ minLeft: number, maxLeft: number, minTop: number, maxTop: number }}
 */
export function getInspectorDragBounds(panel) {
  const rect = panel.getBoundingClientRect();
  const w = Math.max(1, rect.width);
  const h = Math.max(1, rect.height);
  const iw = window.innerWidth;
  const ih = window.innerHeight;
  const root = getComputedStyle(document.documentElement);

  const cssPx = (name, fallback = 0) => {
    const v = parseFloat(root.getPropertyValue(name).trim());
    return Number.isFinite(v) ? v : fallback;
  };

  const pad = 8;
  const objectsHidden = document.getElementById("objectsPanel")?.classList.contains("is-hidden");
  const rightHidden = document.getElementById("rightToolsPanel")?.classList.contains("is-hidden");

  const leftInset = objectsHidden
    ? cssPx("--inspector-inset-from-viewport", 16)
    : cssPx("--objects-panel-width", 288) + cssPx("--inspector-gap-from-sidebar", 12);
  const rightInset = rightHidden
    ? cssPx("--inspector-inset-from-viewport", 16)
    : cssPx("--right-tools-strip-width", 62) + cssPx("--inspector-gap-from-sidebar", 12);

  const minLeft = leftInset;
  let maxLeft = iw - w - rightInset;

  const headerBottom = cssPx("--app-chrome-top", cssPx("--header-height", 48));
  let minTop = headerBottom + pad;

  const timelineEl = document.getElementById("timeline-bottom");
  if (timelineEl && !timelineEl.classList.contains("is-hidden")) {
    const tb = timelineEl.getBoundingClientRect();
    minTop = Math.max(minTop, tb.bottom + pad);
  }

  const maxTop = ih - h - pad;

  if (maxLeft < minLeft) {
    maxLeft = minLeft;
  }
  if (maxTop < minTop) {
    maxTop = minTop;
  }

  return { minLeft, maxLeft, minTop, maxTop };
}

/**
 * @param {HTMLElement} panel
 * @param {string|HTMLElement|null} handle
 * @param {{ getDragBounds?: (panel: HTMLElement) => { minLeft: number, maxLeft: number, minTop: number, maxTop: number } | null | undefined }} [opts]
 */
export function makePanelDraggable(panel, handle, opts = {}) {
  if (!panel) return;
  const handleEl = typeof handle === 'string' ? panel.querySelector(handle) : handle;
  const dragTarget = handleEl || panel;
  const getDragBounds = typeof opts.getDragBounds === "function" ? opts.getDragBounds : null;

  let startX = 0;
  let startY = 0;
  let startLeft = 0;
  let startTop = 0;
  let rafId = null;

  function getRect() {
    return panel.getBoundingClientRect();
  }

  function applyPosition(left, top) {
    const rect = panel.getBoundingClientRect();
    let minLeft = 0;
    let maxLeft = Math.max(0, window.innerWidth - rect.width);
    let minTop = 0;
    let maxTop = Math.max(0, window.innerHeight - rect.height);

    if (getDragBounds) {
      const b = getDragBounds(panel);
      if (b && typeof b.minLeft === "number" && typeof b.maxLeft === "number" && typeof b.minTop === "number" && typeof b.maxTop === "number") {
        minLeft = b.minLeft;
        maxLeft = b.maxLeft;
        minTop = b.minTop;
        maxTop = b.maxTop;
      }
    }

    const clampedLeft = Math.max(minLeft, Math.min(left, maxLeft));
    const clampedTop = Math.max(minTop, Math.min(top, maxTop));
    panel.style.left = clampedLeft + 'px';
    panel.style.top = clampedTop + 'px';
    panel.style.right = 'auto';
    panel.style.bottom = 'auto';
    panel.style.transform = 'none';
  }

  function onMouseDown(e) {
    if (!handleEl && (e.target.closest('button, input, select, [role="button"], .object-inspector__input, .gizmo-controls__tooltip, .object-details-panel__button, .object-details-panel__tooltip, .object-details-panel__export-menu, .object-details-panel__volume-toggle, .object-details-panel__volume-action-btn, .object-details-panel__volume-tooltip-content-wrap') || e.target.closest('a'))) return;
    if (handleEl && !handleEl.contains(e.target)) return;
    e.preventDefault();
    const rect = getRect();
    startX = e.clientX;
    startY = e.clientY;
    startLeft = rect.left;
    startTop = rect.top;
    applyPosition(startLeft, startTop);
    document.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseup', onMouseUp);
  }

  function onMouseMove(e) {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      rafId = null;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      applyPosition(startLeft + dx, startTop + dy);
    });
  }

  function onMouseUp() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  }

  dragTarget.addEventListener('mousedown', onMouseDown);
}
