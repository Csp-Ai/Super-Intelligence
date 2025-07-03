(function(){
  const tooltip = document.createElement('div');
  tooltip.className = 'tooltip hidden';
  document.body.appendChild(tooltip);

  function showTooltip(el) {
    tooltip.textContent = el.getAttribute('data-tooltip');
    const rect = el.getBoundingClientRect();
    tooltip.style.top = rect.bottom + window.scrollY + 6 + 'px';
    tooltip.style.left = rect.left + window.scrollX + 'px';
    tooltip.classList.remove('hidden');
  }

  function hideTooltip() {
    tooltip.classList.add('hidden');
  }

  document.addEventListener('mouseover', e => {
    const t = e.target.closest('[data-tooltip]');
    if (t) showTooltip(t);
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest('[data-tooltip]')) hideTooltip();
  });
})();
