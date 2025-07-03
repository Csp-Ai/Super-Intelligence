(function() {
  const root = document.documentElement;
  const saved = localStorage.getItem('reduceMotion') === 'true';
  if (saved) root.classList.add('reduce-motion');
  function updateState(enabled) {
    if (enabled) root.classList.add('reduce-motion');
    else root.classList.remove('reduce-motion');
    localStorage.setItem('reduceMotion', enabled);
    const cb = document.getElementById('reduceMotionToggle');
    if (cb) cb.checked = enabled;
  }
  window.toggleReduceMotion = () => {
    updateState(!root.classList.contains('reduce-motion'));
  };
  document.addEventListener('DOMContentLoaded', () => {
    const cb = document.getElementById('reduceMotionToggle');
    if (cb) {
      cb.checked = root.classList.contains('reduce-motion');
      cb.addEventListener('change', () => updateState(cb.checked));
    }
  });
})();
