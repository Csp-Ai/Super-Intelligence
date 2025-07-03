const auth = firebase.auth();

const allowedEmails = ["admin@example.com"];
let liveInterval = null;

async function attemptRetry(logs) {
  const retryToggle = document.getElementById('rerunFailed');
  if (!retryToggle || !retryToggle.checked) return;
  const user = auth.currentUser;
  if (!user) return;
  const failed = logs.filter(l => l.status === 'error');
  for (const entry of failed) {
    try {
      const token = await user.getIdToken();
      const url = `https://us-central1-${firebaseConfig.projectId}.cloudfunctions.net/retryAgentRun`;
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          userId: entry.userId || entry.user,
          agentName: entry.agentName || entry.agent
        })
      });
    } catch (err) {
      console.error('retry failed', err);
    }
  }
}

async function fetchLogs() {
  const user = auth.currentUser;
  if (!user) return;
  try {
    const token = await user.getIdToken();
    const url = `https://us-central1-${firebaseConfig.projectId}.cloudfunctions.net/getLogs`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    const list = Array.isArray(data) ? data : [];
    renderLogs(list);
    attemptRetry(list);
  } catch (err) {
    console.error('Failed to load logs', err);
  }
}

function renderLogs(logs) {
  const filter = document.getElementById('statusFilter').value;
  const container = document.getElementById('logsContainer');
  container.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4';
  container.innerHTML = '';
  const grouped = {};
  logs.forEach(l => {
    const agent = l.agentName || l.agent || 'unknown';
    if (!grouped[agent]) grouped[agent] = [];
    if (!filter || l.status === filter) grouped[agent].push(l);
  });
  Object.keys(grouped).forEach(agent => {
    const section = document.createElement('div');
    section.className = 'mb-4 bg-white p-4 rounded shadow';
    section.innerHTML = `<h2 class="text-xl font-semibold mb-2">${agent}</h2>`;
    const table = document.createElement('table');
    table.className = 'min-w-full bg-white text-sm';
    table.innerHTML = `<thead><tr>
        <th class="border px-2 py-1">Time</th>
        <th class="border px-2 py-1">User</th>
        <th class="border px-2 py-1">Input</th>
        <th class="border px-2 py-1">Output</th>
        <th class="border px-2 py-1">Status</th>
      </tr></thead>`;
    const tbody = document.createElement('tbody');
    grouped[agent].forEach(e => {
      const row = document.createElement('tr');
      row.innerHTML = `<td class="border px-2 py-1">${e.timestamp}</td>
        <td class="border px-2 py-1">${e.userId || e.user || ''}</td>
        <td class="border px-2 py-1"><pre class="whitespace-pre-wrap">${JSON.stringify(e.inputSummary || {}, null, 2)}</pre></td>
        <td class="border px-2 py-1"><pre class="whitespace-pre-wrap">${JSON.stringify(e.outputSummary || e.output, null, 2)}</pre></td>
        <td class="border px-2 py-1">${e.status || ''}</td>`;
      tbody.appendChild(row);
    });
    table.appendChild(tbody);
    section.appendChild(table);
    container.appendChild(section);
  });
}

document.getElementById('loginBtn').addEventListener('click', async () => {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const statusEl = document.getElementById('loginStatus');
  statusEl.textContent = '';
  try {
    const cred = await auth.signInWithEmailAndPassword(email, password);
    if (!allowedEmails.includes(cred.user.email)) {
      statusEl.textContent = 'Unauthorized';
      await auth.signOut();
      return;
    }
    document.getElementById('loginSection').classList.add('hidden');
    document.getElementById('controls').classList.remove('hidden');
    fetchLogs();
  } catch (err) {
    console.error('login failed', err);
    statusEl.textContent = err.message;
  }
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
  await auth.signOut();
  document.getElementById('controls').classList.add('hidden');
  document.getElementById('loginSection').classList.remove('hidden');
  clearInterval(liveInterval);
});

document.getElementById('refreshBtn').addEventListener('click', fetchLogs);
document.getElementById('statusFilter').addEventListener('change', fetchLogs);
document.getElementById('liveReload').addEventListener('change', e => {
  if (e.target.checked) {
    liveInterval = setInterval(fetchLogs, 5000);
  } else {
    clearInterval(liveInterval);
  }
});

document.getElementById('rerunFailed').addEventListener('change', () => {
  fetchLogs();
});

auth.onAuthStateChanged(user => {
  if (user && allowedEmails.includes(user.email)) {
    document.getElementById('loginSection').classList.add('hidden');
    document.getElementById('controls').classList.remove('hidden');
    fetchLogs();
  }
});
