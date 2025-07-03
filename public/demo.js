async function loadDemoData() {
  try {
    const resp = await fetch('demo-data.json');
    const data = await resp.json();
    console.log('Loaded demo data:', data);
    const statusEl = document.getElementById('status');
    statusEl.textContent = `Loaded ${data.users.length} demo users.`;
  } catch (err) {
    console.error('Failed to load demo data', err);
  }
}

function runTrainingSimulation() {
  const statusEl = document.getElementById('status');
  statusEl.textContent = 'Running simulation...';
  setTimeout(() => {
    statusEl.textContent = 'Simulation complete.';
  }, 1000);
}

document.getElementById('demoBtn').addEventListener('click', loadDemoData);
document.getElementById('trainBtn').addEventListener('click', runTrainingSimulation);
