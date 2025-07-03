
let auth, db;
let firebaseReady = true;

try {
  auth = firebase.auth();
  db = firebase.firestore();
} catch (err) {
  console.error('Firebase init failed', err);
  firebaseReady = false;
  document.body.innerHTML = '<p class="p-4 text-red-600">Missing Firebase configuration.</p>';
}

let currentRun;
let lastRuns = [];

function renderRuns(runs) {
  const container = document.getElementById('runsContainer');
  const empty = document.getElementById('emptyMsg');
  container.innerHTML = '';
  empty.textContent = '';
  if (!runs.length) {
    empty.textContent = 'No runs found.';
    return;
  }
  runs.forEach(run => {
    const div = document.createElement('div');
    div.className = 'mb-4 p-4 bg-gray-50 border border-gray-200 rounded shadow cursor-pointer';
    div.innerHTML = `<div class="flex justify-between"><span>${run.agentName}</span><span>${new Date(run.timestamp).toLocaleString()}</span></div>`;
    div.addEventListener('click', () => openModal(run.id));
    container.appendChild(div);
  });
}

async function fetchRuns() {
  if (!auth.currentUser) return;
  const snap = await db
    .collection('users')
    .doc(auth.currentUser.uid)
    .collection('agentRuns')
    .orderBy('timestamp', 'desc')
    .limit(20)
    .get();
  lastRuns = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  renderRuns(lastRuns);
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
    header.textContent = `${new Date(step.timestamp).toLocaleString()} • ${step.type}`;
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
  currentRun = lastRuns.find(r => r.id === runId);
  if (!currentRun) return;
  const doc = await db
    .collection('users')
    .doc(auth.currentUser.uid)
    .collection('agentRuns')
    .doc(runId)
    .get();
  const data = doc.data() || {};
  const modal = document.getElementById('logModal');
  const content = document.getElementById('modalContent');
  content.innerHTML = '';
  if (Array.isArray(data.steps) && data.steps.length) {
    content.appendChild(renderTimeline(data.steps));
  } else {
    content.textContent = JSON.stringify({ input: data.input, output: data.output }, null, 2);
  }
  modal.classList.remove('hidden');
}

document.getElementById('closeModal').addEventListener('click', () => {
  document.getElementById('logModal').classList.add('hidden');
});

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

auth.onAuthStateChanged(user => {
  if (user) {
    document.getElementById('loginSection').classList.add('hidden');
    document.getElementById('controls').classList.remove('hidden');
    fetchRuns();
  }
});

if (firebaseReady && auth.currentUser) {
  fetchRuns();
}
