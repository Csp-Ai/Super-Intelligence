// Firebase config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID"
};

let auth, db;
try {
  firebase.initializeApp(firebaseConfig);
  auth = firebase.auth();
  db = firebase.firestore();
  db.enablePersistence({ synchronizeTabs: true }).catch(() => {});
  auth.signInAnonymously().catch(() => {});
} catch (err) {
  console.error('Firebase init failed', err);
}

let runs = [];
let unsubscribeRuns = null;
const stepListeners = {};
const syncStreams = {};
let currentReplay = null;
let replaySource = null;
let timelineSteps = [];
let activeStep = -1;
const statusEl = document.getElementById('replayStatus');
const replayLogCache = {};

// === Replay Log UI ===
async function loadReplayLogs(runId) {
  if (replayLogCache[runId]) return replayLogCache[runId];
  if (!auth || !auth.currentUser) return [];
  const snap = await db
    .collection('users')
    .doc(auth.currentUser.uid)
    .collection('agentRuns')
    .doc(runId)
    .collection('replayLogs')
    .orderBy('timestamp', 'desc')
    .get();
  replayLogCache[runId] = snap.docs.map(d => d.data());
  return replayLogCache[runId];
}

function renderReplayLogs(logs) {
  const container = document.getElementById('replayLogs');
  container.innerHTML = '';
  logs.forEach(l => {
    const div = document.createElement('div');
    const params = l.params ? JSON.stringify(l.params) : '';
    const err = l.error ? ` - Error: ${l.error}` : '';
    div.textContent = `${l.timestamp} - ${l.action} ${params}${err}`;
    container.appendChild(div);
  });
}

async function showReplayLogs(runId) {
  const logs = await loadReplayLogs(runId);
  renderReplayLogs(logs);
}

window.showReplayLogs = showReplayLogs;
window.openTimelineModal = async function(runId) {
  await showReplayLogs(runId);
};

// === Timeline UI ===
function renderTimeline(steps, active = -1) {
  const wrapper = document.createElement('div');
  wrapper.className = 'space-y-3 overflow-y-auto max-h-96 pr-2';
  steps.forEach((step, idx) => {
    const item = document.createElement('div');
    item.className = 'border-l-2 border-gray-300 pl-4 relative';
    if (idx === active) item.classList.add('bg-yellow-50');
    const dot = document.createElement('span');
    dot.className = 'w-2 h-2 bg-blue-500 rounded-full absolute -left-1 top-2';
    item.appendChild(dot);
    const header = document.createElement('div');
    header.className = 'text-xs text-gray-500';
    header.textContent = `${new Date(step.timestamp).toLocaleString()} • ${step.type}`;
    item.appendChild(header);
    wrapper.appendChild(item);
  });
  return wrapper;
}

function updateTimeline() {
  const container = document.getElementById('modalContent');
  container.innerHTML = '';
  container.appendChild(renderTimeline(timelineSteps, activeStep));
  if (statusEl) {
    if (activeStep >= 0) {
      statusEl.textContent = `Step ${activeStep + 1} / ${timelineSteps.length}`;
    } else {
      statusEl.textContent = '';
    }
  }
}

async function sendReplayAction(runId, action, speed = 1) {
  const user = auth.currentUser;
  if (!user) return;
  const token = await user.getIdToken();
  const url = `https://us-central1-${firebaseConfig.projectId}.cloudfunctions.net/replayAgentRun`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ runId, action, speed })
  });
}

async function startReplay() {
  const params = new URLSearchParams(location.search);
  const runId = params.get('runId');
  if (!runId) return;
  const speed = parseFloat(document.getElementById('replaySpeed').value) || 1;
  timelineSteps = [];
  activeStep = -1;
  updateTimeline();
  if (statusEl) statusEl.textContent = 'Starting...';
  if (replaySource) replaySource.close();
  await sendReplayAction(runId, 'stream', speed);
  const token = await auth.currentUser.getIdToken();
  const esUrl = `https://us-central1-${firebaseConfig.projectId}.cloudfunctions.net/agentSyncSubscribe?runId=${runId}&token=${token}`;
  replaySource = new EventSource(esUrl);
  replaySource.onmessage = evt => {
    const data = JSON.parse(evt.data);
    if (data.type === 'replay-state') {
      activeStep = data.index - 1;
      if (statusEl && data.status) {
        statusEl.textContent = `${data.status} (${data.index}/${data.total})`;
      }
      updateTimeline();
    } else {
      const step = { type: data.stepType || data.type, timestamp: data.timestamp };
      timelineSteps.push(step);
      updateTimeline();
    }
  };
  replaySource.onerror = () => {
    if (statusEl) statusEl.textContent = 'disconnected';
  };
}

// === Button Event Bindings ===
document.getElementById('replayBtn').addEventListener('click', startReplay);

document.getElementById('replayStart').addEventListener('click', () => {
  const runId = new URLSearchParams(location.search).get('runId');
  const speed = parseFloat(document.getElementById('replaySpeed').value) || 1;
  if (runId) {
    if (statusEl) statusEl.textContent = 'running';
    sendReplayAction(runId, 'start', speed);
  }
});

document.getElementById('replayPause').addEventListener('click', () => {
  const runId = new URLSearchParams(location.search).get('runId');
  if (runId) {
    if (statusEl) statusEl.textContent = 'paused';
    sendReplayAction(runId, 'pause');
  }
});

document.getElementById('replayResume').addEventListener('click', () => {
  const runId = new URLSearchParams(location.search).get('runId');
  if (runId) {
    if (statusEl) statusEl.textContent = 'running';
    sendReplayAction(runId, 'resume');
  }
});

document.getElementById('replayStep').addEventListener('click', () => {
  const runId = new URLSearchParams(location.search).get('runId');
  if (runId) sendReplayAction(runId, 'step');
});
