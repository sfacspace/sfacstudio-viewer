/** Make panel draggable by handle; optional handle element or selector. */
export function makePanelDraggable(panel, handle) {
  if (!panel) return;
  const handleEl = typeof handle === 'string' ? panel.querySelector(handle) : handle;
  const dragTarget = handleEl || panel;

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
    const maxLeft = Math.max(0, window.innerWidth - rect.width);
    const maxTop = Math.max(0, window.innerHeight - rect.height);
    const clampedLeft = Math.max(0, Math.min(left, maxLeft));
    const clampedTop = Math.max(0, Math.min(top, maxTop));
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
