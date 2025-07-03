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

async function runTrainingSimulation() {
  const statusEl = document.getElementById('status');
  statusEl.textContent = 'Training...';
  try {
    const functions = firebase.app().functions();
    const train = functions.httpsCallable('trainAgent');
    await train({ agentId: 'core' });
    statusEl.textContent = 'Training complete.';
  } catch (err) {
    console.error('train failed', err);
    statusEl.textContent = 'Training failed.';
  }
}

document.getElementById('demoBtn').addEventListener('click', loadDemoData);
document.getElementById('trainBtn').addEventListener('click', runTrainingSimulation);
