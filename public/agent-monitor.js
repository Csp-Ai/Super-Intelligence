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
const errorEl = document.getElementById('errorBanner');
const replayLogCache = {};
window.persistReplayLogs = false;
// List of emails allowed to access admin-only controls
const adminEmails = ['admin@example.com'];

// Display an error or system message in the banner
// type: 'error' (red) or 'system' (yellow)
function showError(msg, type = 'error') {
  if (!errorEl) return;
  errorEl.textContent = msg;
  errorEl.classList.remove('hidden', 'bg-red-200', 'text-red-800', 'bg-yellow-200', 'text-yellow-800');
  if (type === 'system') {
    errorEl.classList.add('bg-yellow-200', 'text-yellow-800');
  } else {
    errorEl.classList.add('bg-red-200', 'text-red-800');
  }
}

// Clear and hide the error banner
function clearError() {
  if (!errorEl) return;
  errorEl.textContent = '';
  errorEl.classList.remove('bg-red-200', 'text-red-800', 'bg-yellow-200', 'text-yellow-800');
  errorEl.classList.add('hidden');
}

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

async function loadReplaySummary(runId) {
  if (!auth || !auth.currentUser) return null;
  const doc = await db
    .collection('users')
    .doc(auth.currentUser.uid)
    .collection('agentRuns')
    .doc(runId)
    .collection('replaySummary')
    .doc('summary')
    .get();
  return doc.exists ? doc.data() : null;
}

function renderReplaySummary(data) {
  const container = document.getElementById('replaySummary');
  container.innerHTML = '';
  if (!data) return;
  const keys = ['totalSteps','actionCount','durationMs','errorCount'];
  keys.forEach(k => {
    const div = document.createElement('div');
    div.textContent = `${k}: ${data[k]}`;
    container.appendChild(div);
  });
}

async function showReplaySummary(runId) {
  const data = await loadReplaySummary(runId);
  renderReplaySummary(data);
}

window.showReplaySummary = showReplaySummary;
window.showReplayLogs = showReplayLogs;
window.openTimelineModal = async function(runId) {
  await showReplayLogs(runId);
  await showReplaySummary(runId);
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

async function sendReplayAction(runId, action, speed = 1, opts = {}) {
  const user = auth.currentUser;
  if (!user) return;
  const token = await user.getIdToken();
  const url = `https://us-central1-${firebaseConfig.projectId}.cloudfunctions.net/replayAgentRun`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ runId, action, speed, persist: window.persistReplayLogs || opts.persist, message: opts.message })
  });
}

async function triggerSummary(runId) {
  const user = auth.currentUser;
  if (!user) return;
  const token = await user.getIdToken();
  const url = `https://us-central1-${firebaseConfig.projectId}.cloudfunctions.net/summarizeReplayLogs`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ runId })
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
  if (!auth.currentUser) {
    showError('Not authenticated');
    sendReplayAction(runId, 'error', 1, { message: 'no auth' });
    return;
  }
  await sendReplayAction(runId, 'stream', speed);
  const token = await auth.currentUser.getIdToken();
  const esUrl = `https://us-central1-${firebaseConfig.projectId}.cloudfunctions.net/agentSyncSubscribe?runId=${runId}&token=${token}`;
  replaySource = new EventSource(esUrl);
  replaySource.onmessage = evt => {
    clearError();
    const data = JSON.parse(evt.data);
    if (data.type === 'replay-state') {
      activeStep = data.index - 1;
      if (statusEl && data.status) {
        statusEl.textContent = `${data.status} (${data.index}/${data.total})`;
      }
      updateTimeline();
    } else if (!data.stepType && !data.type) {
      showError('Invalid stream data');
      sendReplayAction(runId, 'error', 1, { message: 'missing stepType' });
    } else {
      const step = { type: data.stepType || data.type, timestamp: data.timestamp };
      timelineSteps.push(step);
      updateTimeline();
    }
  };
  replaySource.onerror = () => {
    showError('Stream disconnected');
    if (statusEl) statusEl.textContent = 'disconnected';
    sendReplayAction(runId, 'error', 1, { message: 'sse disconnect' });
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

// Toggle whether replay logs should be persisted to Firestore
document.getElementById('persistLogsBtn').addEventListener('click', () => {
  window.persistReplayLogs = !window.persistReplayLogs;
  const btn = document.getElementById('persistLogsBtn');
  if (window.persistReplayLogs) {
    btn.textContent = 'Persist Logs \u2713';
    showError('Logs will be persisted', 'system');
  } else {
    btn.textContent = 'Persist Logs';
    showError('Logs will NOT be persisted', 'system');
  }
});

document.getElementById('regenSummaryBtn').addEventListener('click', async () => {
  const runId = new URLSearchParams(location.search).get('runId');
  if (!runId) return;
  await triggerSummary(runId);
  await showReplaySummary(runId);
});

// Show admin controls only for authenticated admin users
auth.onAuthStateChanged(user => {
  const btn = document.getElementById('regenSummaryBtn');
  if (user && user.email && adminEmails.includes(user.email)) {
    btn.classList.remove('hidden');
  } else {
    btn.classList.add('hidden');
  }
});

