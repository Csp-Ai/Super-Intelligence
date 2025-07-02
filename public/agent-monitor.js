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

async function loadReplayLogs(runId) {
  if (!auth || !auth.currentUser) return [];
  const snap = await db
    .collection('users')
    .doc(auth.currentUser.uid)
    .collection('agentRuns')
    .doc(runId)
    .collection('logs')
    .orderBy('timestamp')
    .get();
  return snap.docs.map(d => d.data());
}

function renderReplayLogs(logs) {
  const container = document.getElementById('replayLogs');
  container.innerHTML = '';
  logs.forEach(l => {
    const div = document.createElement('div');
    const params = l.params ? JSON.stringify(l.params) : '';
    const err = l.error ? ` - Error: ${l.error}` : '';
    div.textContent = `${l.timestamp} - ${l.event} ${params}${err}`;
    container.appendChild(div);
  });
}

async function showReplayLogs(runId) {
  const logs = await loadReplayLogs(runId);
  renderReplayLogs(logs);
}

window.showReplayLogs = showReplayLogs;

// ... rest of the code continues unchanged

