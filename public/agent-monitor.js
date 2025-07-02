// Firebase config placeholder
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
} catch (err) {
  console.error('Firebase init failed', err);
}

let runs = [];
let unsubscribeRuns = null;
const stepListeners = {};

function statusIcon(run) {
  if (run.status === 'running') {
    return '<span class="w-3 h-3 bg-blue-500 rounded-full inline-block mr-1 animate-ping"></span>';
  }
  if (run.status === 'success') {
    return '<span class="text-green-600 font-semibold">\u2713</span>';
  }
  if (run.status === 'error') {
    return '<span class="text-red-600 font-semibold">\u2717</span>';
  }
  return run.status || '';
}

function renderTimeline(steps) {
  const wrapper = document.createElement('div');
  wrapper.className = 'space-y-3 overflow-y-auto max-h-96 pr-2';
  steps.forEach(step => {
    const item = document.createElement('div');
    item.className = 'border-l-2 border-gray-300 pl-4 relative';
    const dot = document.createElement('span');
    dot.className = 'w-2 h-2 bg-blue-500 rounded-full absolute -left-1 top-2';
    item.appendChild(dot);
    const header = document.createElement('div');
    header.className = 'text-xs text-gray-500';
    header.textContent = `${new Date(step.timestamp).toLocaleString()} • ${step.stepType || step.type}`;
    const pre = document.createElement('pre');
    pre.className = 'bg-gray-100 p-2 mt-1 rounded hidden text-xs';
    pre.textContent = JSON.stringify(step, null, 2);
    item.appendChild(header);
    item.appendChild(pre);
    item.addEventListener('click', () => pre.classList.toggle('hidden'));
    wrapper.appendChild(item);
  });
  return wrapper;
}

async function openModal(runId) {
  const userId = auth.currentUser.uid;
  const runRef = db.collection('users').doc(userId).collection('agentRuns').doc(runId);
  const content = document.getElementById('modalContent');
  content.innerHTML = '';
  try {
    const stepsSnap = await runRef.collection('steps').orderBy('timestamp').get();
    const steps = stepsSnap.docs.map(d => d.data());
    if (steps.length) {
      content.appendChild(renderTimeline(steps));
    } else {
      const doc = await runRef.get();
      const data = doc.data() || {};
      content.textContent = JSON.stringify({ input: data.input, output: data.output }, null, 2);
    }
  } catch (err) {
    console.error('Failed to load steps', err);
    content.textContent = 'Failed to load steps.';
  }
  document.getElementById('timelineModal').classList.remove('hidden');
}

document.getElementById('closeModal').addEventListener('click', () => {
  document.getElementById('timelineModal').classList.add('hidden');
});

function updateAgentFilter() {
  const select = document.getElementById('agentFilter');
  const current = select.value;
  select.innerHTML = '<option value="">All</option>';
  const agents = Array.from(new Set(runs.map(r => r.agentName).filter(Boolean))).sort();
  agents.forEach(name => {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    if (name === current) opt.selected = true;
    select.appendChild(opt);
  });
}

function renderRuns() {
  const statusFilter = document.getElementById('statusFilter').value;
  const agentFilter = document.getElementById('agentFilter').value;
  const container = document.getElementById('runsContainer');
  container.innerHTML = '';
  const list = runs.filter(r => {
    if (statusFilter && r.status !== statusFilter) return false;
    if (agentFilter && r.agentName !== agentFilter) return false;
    return true;
  });
  list.forEach(run => {
    const div = document.createElement('div');
    const highlight = run.highlight ? 'bg-yellow-50 ' : '';
    div.className = highlight + 'border p-2 rounded cursor-pointer flex justify-between items-center';
    div.innerHTML = `
      <div>
        <div class="font-semibold">${run.agentName}</div>
        <div class="text-xs text-gray-500">${new Date(run.timestamp).toLocaleString()}</div>
      </div>
      <div class="flex items-center space-x-2">
        ${statusIcon(run)}
        ${run.phase ? `<span class="text-xs text-gray-600">${run.phase}</span>` : ''}
        ${run.alignment && run.alignment.passed !== undefined ? `<span class="text-xs ${run.alignment.passed ? 'text-green-600' : 'text-red-600'}">${run.alignment.passed ? 'aligned' : 'flagged'}</span>` : ''}
      </div>`;
    div.addEventListener('click', () => openModal(run.id));
    container.appendChild(div);
  });
  if (document.getElementById('autoScroll').checked) {
    container.scrollTop = container.scrollHeight;
  }
}

document.getElementById('statusFilter').addEventListener('change', renderRuns);
document.getElementById('agentFilter').addEventListener('change', renderRuns);

document.getElementById('loginBtn').addEventListener('click', async () => {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const statusEl = document.getElementById('loginStatus');
  statusEl.textContent = '';
  try {
    await auth.signInWithEmailAndPassword(email, password);
  } catch (err) {
    statusEl.textContent = err.message;
  }
});

document.getElementById('googleBtn').addEventListener('click', async () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  const statusEl = document.getElementById('loginStatus');
  statusEl.textContent = '';
  try {
    await auth.signInWithPopup(provider);
  } catch (err) {
    statusEl.textContent = err.message;
  }
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
  await auth.signOut();
});

function listenSteps(run) {
  if (stepListeners[run.id]) return;
  const userId = auth.currentUser.uid;
  const ref = db
    .collection('users')
    .doc(userId)
    .collection('agentRuns')
    .doc(run.id)
    .collection('steps')
    .orderBy('timestamp', 'desc')
    .limit(1);
  stepListeners[run.id] = ref.onSnapshot(snap => {
    if (!snap.empty) {
      const step = snap.docs[0].data();
      const idx = runs.findIndex(r => r.id === run.id);
      if (idx > -1) {
        runs[idx].phase = step.stepType || step.type;
        renderRuns();
      }
    }
  });
}

function processSnapshot(snapshot) {
  const offline = snapshot.metadata.fromCache && !snapshot.metadata.hasPendingWrites;
  document.getElementById('offlineMsg').classList.toggle('hidden', !offline);
  snapshot.docChanges().forEach(change => {
    const data = { id: change.doc.id, ...change.doc.data() };
    if (change.type === 'removed') {
      runs = runs.filter(r => r.id !== data.id);
      if (stepListeners[data.id]) { stepListeners[data.id](); delete stepListeners[data.id]; }
      return;
    }
    const idx = runs.findIndex(r => r.id === data.id);
    if (idx >= 0) {
      runs[idx] = { ...runs[idx], ...data, highlight: true };
    } else {
      runs.push({ ...data, highlight: true });
    }
    if (data.status === 'running') {
      listenSteps(data);
    } else if (stepListeners[data.id]) {
      stepListeners[data.id]();
      delete stepListeners[data.id];
    }
    setTimeout(() => {
      const r = runs.find(x => x.id === data.id);
      if (r) { delete r.highlight; renderRuns(); }
    }, 3000);
  });
  runs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  updateAgentFilter();
  renderRuns();
}

function startListening() {
  if (!auth.currentUser) return;
  if (unsubscribeRuns) unsubscribeRuns();
  Object.values(stepListeners).forEach(fn => fn());
  for (const k in stepListeners) delete stepListeners[k];
  runs = [];
  const userId = auth.currentUser.uid;
  const q = db
    .collection('users')
    .doc(userId)
    .collection('agentRuns')
    .orderBy('timestamp')
    .limit(50);
  unsubscribeRuns = q.onSnapshot(processSnapshot);
}

auth.onAuthStateChanged(user => {
  if (user) {
    document.getElementById('loginSection').classList.add('hidden');
    document.getElementById('controls').classList.remove('hidden');
    startListening();
  } else {
    if (unsubscribeRuns) unsubscribeRuns();
    unsubscribeRuns = null;
    Object.values(stepListeners).forEach(fn => fn());
    for (const k in stepListeners) delete stepListeners[k];
    runs = [];
    renderRuns();
    document.getElementById('loginSection').classList.remove('hidden');
    document.getElementById('controls').classList.add('hidden');
  }
});
