// Firebase config placeholder
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID"
};
let auth, db;
let firebaseReady = true;
try {
  firebase.initializeApp(firebaseConfig);
  auth = firebase.auth();
  db = firebase.firestore();
} catch (err) {
  console.error('Firebase init failed', err);
  firebaseReady = false;
  document.body.innerHTML = '<p class="p-4 text-red-600">Missing Firebase configuration.</p>';
}

let chart;
let lastRuns = [];

function $(id) { return document.getElementById(id); }

async function fetchRuns() {
  const spinner = $('loadingSpinner');
  spinner.classList.remove('hidden');
  const user = auth.currentUser;
  if (!user) { spinner.classList.add('hidden'); return []; }

  let query = db.collection('users').doc(user.uid).collection('agentRuns');
  const agent = $('agentFilter').value;
  const status = $('statusFilter').value;
  const tag = $('tagFilter').value.trim();
  const start = $('startDate').value;
  const end = $('endDate').value;
  if (agent) query = query.where('agentName', '==', agent);
  if (status) query = query.where('status', '==', status);
  if (tag) query = query.where('tags', 'array-contains', tag);
  if (start) query = query.where('timestamp', '>=', start);
  if (end) query = query.where('timestamp', '<=', end + '\uf8ff');
  query = query.orderBy('timestamp', 'desc').limit(100);
  const snap = await query.get();
  spinner.classList.add('hidden');
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

function groupRuns(runs, key) {
  const grouped = {};
  runs.forEach(r => {
    const k = key === 'task' ? (r.input && r.input.task) || 'unknown' : r.agentName;
    if (!grouped[k]) grouped[k] = [];
    grouped[k].push(r);
  });
  return grouped;
}

function renderStats(runs) {
  const total = runs.length;
  const failures = runs.filter(r => r.status !== 'success' && !r.resolved).length;
  const recentAgents = [...new Set(runs.map(r => r.agentName))].slice(0,3).join(', ');
  $('stats').textContent = `Runs: ${total} | Failures: ${failures} | Recent Agents: ${recentAgents}`;
}

function renderChart(runs) {
  const counts = {};
  runs.forEach(r => { counts[r.agentName] = (counts[r.agentName] || 0) + 1; });
  const labels = Object.keys(counts);
  const data = labels.map(l => counts[l]);
  const ctx = $('usageChart').getContext('2d');
  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets: [{ label: 'Runs', data, backgroundColor: 'rgba(54,162,235,0.6)' }] },
    options: { responsive: true, plugins: { legend: { display: false } } }
  });
}

function renderRuns(runs) {
  const groupKey = $('groupBy').value;
  const grouped = groupRuns(runs, groupKey);
  const container = $('runsContainer');
  container.innerHTML = '';
  Object.keys(grouped).forEach(k => {
    const details = document.createElement('details');
    details.className = 'mb-4 bg-white p-2 border rounded';
    const summary = document.createElement('summary');
    summary.textContent = `${k} (${grouped[k].length})`;
    details.appendChild(summary);
    const table = document.createElement('table');
    table.className = 'min-w-full text-sm mt-2';
    table.innerHTML = `<thead><tr>
        <th class="border px-2 py-1">Time</th>
        <th class="border px-2 py-1">Agent</th>
        <th class="border px-2 py-1">Status</th>
        <th class="border px-2 py-1">Result</th>
      </tr></thead>`;
    const tbody = document.createElement('tbody');
    grouped[k].forEach(r => {
      const row = document.createElement('tr');
      row.className = 'cursor-pointer hover:bg-gray-100';
      row.innerHTML = `<td class="border px-2 py-1">${r.timestamp || ''}</td>
        <td class="border px-2 py-1">${r.agentName}</td>
        <td class="border px-2 py-1">${r.status}</td>
        <td class="border px-2 py-1 truncate max-w-xs">${(r.error ? r.error : JSON.stringify(r.output)).slice(0,40)}</td>`;
      row.addEventListener('click', () => showModal(r));
      tbody.appendChild(row);
    });
    table.appendChild(tbody);
    details.appendChild(table);
    container.appendChild(details);
  });
}

function showModal(run) {
  $('modalContent').textContent = JSON.stringify(run, null, 2);
  $('logModal').classList.remove('hidden');
}

$('closeModal').addEventListener('click', () => {
  $('logModal').classList.add('hidden');
});

async function loadRuns() {
  const runs = await fetchRuns();
  lastRuns = runs;
  populateAgentFilter(runs);
  renderStats(runs);
  renderChart(runs);
  renderRuns(runs);
}

function populateAgentFilter(runs) {
  const select = $('agentFilter');
  const agents = [...new Set(runs.map(r => r.agentName))];
  select.innerHTML = '<option value="">All</option>' + agents.map(a => `<option value="${a}">${a}</option>`).join('');
}

$('loginBtn').addEventListener('click', async () => {
  const email = $('email').value.trim();
  const password = $('password').value;
  $('loginStatus').textContent = '';
  try {
    await auth.signInWithEmailAndPassword(email, password);
  } catch (err) {
    $('loginStatus').textContent = err.message;
  }
});

$('googleBtn').addEventListener('click', async () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  $('loginStatus').textContent = '';
  try {
    await auth.signInWithPopup(provider);
  } catch (err) {
    $('loginStatus').textContent = err.message;
  }
});

$('logoutBtn').addEventListener('click', async () => {
  await auth.signOut();
});

$('refreshBtn').addEventListener('click', loadRuns);
$('downloadBtn').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(lastRuns, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'agentRuns.json';
  a.click();
  URL.revokeObjectURL(url);
});
$('groupBy').addEventListener('change', loadRuns);
$('statusFilter').addEventListener('change', loadRuns);
$('agentFilter').addEventListener('change', loadRuns);
$('tagFilter').addEventListener('change', loadRuns);
$('startDate').addEventListener('change', loadRuns);
$('endDate').addEventListener('change', loadRuns);

if (firebaseReady) {
  auth.onAuthStateChanged(user => {
    if (user) {
      $('loginSection').classList.add('hidden');
      $('controls').classList.remove('hidden');
      loadRuns();
    } else {
      $('controls').classList.add('hidden');
      $('loginSection').classList.remove('hidden');
    }
  });
}
