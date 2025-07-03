(function () {
  const tooltip = document.createElement('div');
  tooltip.className = 'tooltip hidden';
  tooltip.id = 'globalTooltip';
  tooltip.setAttribute('role', 'tooltip');
  tooltip.setAttribute('aria-hidden', 'true');
  document.body.appendChild(tooltip);

  let activeEl = null;
  let lastEvent = null;
  let frameId = null;
  const offset = 12;

  function positionTooltip() {
    if (!lastEvent) return;
    const x = lastEvent.clientX + offset;
    const y = lastEvent.clientY + offset;
    tooltip.style.left = x + 'px';
    tooltip.style.top = y + 'px';
    frameId = null;
  }

  function schedulePosition(e) {
    lastEvent = e;
    if (frameId) return;
    frameId = requestAnimationFrame(positionTooltip);
  }

  function showTooltip(el, e) {
    activeEl = el;
    el.setAttribute('aria-describedby', tooltip.id);
    tooltip.textContent = el.getAttribute('data-tooltip');
    tooltip.classList.remove('hidden');
    tooltip.setAttribute('aria-hidden', 'false');
    if (e) schedulePosition(e);
  }

  function hideTooltip() {
    if (activeEl) activeEl.removeAttribute('aria-describedby');
    tooltip.classList.add('hidden');
    tooltip.setAttribute('aria-hidden', 'true');
    activeEl = null;
  }

  document.addEventListener('mouseover', (e) => {
    const t = e.target.closest('[data-tooltip]');
    if (t) showTooltip(t, e);
  });

  document.addEventListener('mousemove', (e) => {
    if (activeEl) schedulePosition(e);
  });

  document.addEventListener('mouseout', (e) => {
    if (e.target.closest('[data-tooltip]')) hideTooltip();
  });
})();
