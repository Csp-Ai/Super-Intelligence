const auth = firebase.auth();
const db = firebase.firestore();

const allowedEmails = ["admin@example.com"];

async function loadData() {
  const agentsSnap = await db.collection('agents').get();
  const anomaliesSnap = await db.collection('anomalies').orderBy('timestamp', 'desc').limit(10).get();
  const commitSnap = await db.collectionGroup('commits').orderBy('timestamp', 'desc').limit(5).get();
  renderSummary(agentsSnap.docs);
  renderRecent(agentsSnap.docs);
  renderFailing(anomaliesSnap.docs);
  renderCommits(commitSnap.docs);
  renderActivity(anomaliesSnap.docs);
  loadCoverage();
}

function renderSummary(agentDocs) {
  const summary = document.getElementById('summary');
  const total = agentDocs.length;
  const deprecated = agentDocs.filter(d => d.data().currentState === 'deprecated').length;
  const failing = agentDocs.filter(d => d.data().currentState === 'under-review' || d.data().currentState === 'offline').length;
  summary.textContent = `Agents: ${total} | Deprecated: ${deprecated} | Failing: ${failing}`;
}

function renderRecent(agentDocs) {
  const recent = document.getElementById('recent');
  recent.innerHTML = '<h2 class="text-2xl font-semibold mb-2">Recently Modified</h2>';
  agentDocs
    .sort((a, b) => (b.data().updatedAt || '').localeCompare(a.data().updatedAt || ''))
    .slice(0, 5)
    .forEach(doc => {
      const div = document.createElement('div');
      div.textContent = `${doc.id} - ${doc.data().updatedAt || ''}`;
      recent.appendChild(div);
    });
}

function renderFailing(anomalyDocs) {
  const failing = document.getElementById('failing');
  failing.innerHTML = '<h2 class="text-2xl font-semibold mb-2">Top Failing Agents</h2>';
  anomalyDocs.forEach(doc => {
    const data = doc.data();
    const div = document.createElement('div');
    div.textContent = `${data.agent} - ${data.type}`;
    failing.appendChild(div);
  });
}

function renderCommits(commitDocs) {
  const commits = document.getElementById('commits');
  commits.innerHTML = '<h2 class="text-2xl font-semibold mb-2">Recent Commits</h2>';
  commitDocs.forEach(doc => {
    const data = doc.data();
    const div = document.createElement('div');
    div.textContent = `${data.sha} - ${data.author} - ${data.timestamp}`;
    commits.appendChild(div);
  });
}

async function loadCoverage() {
  try {
    const res = await fetch('ci-report.json');
    if (!res.ok) return;
    const data = await res.json();
    renderCoverage(data);
  } catch (_) {
    // ignore
  }
}

function renderCoverage(list) {
  const coverage = document.getElementById('coverage');
  coverage.innerHTML = '<h2 class="text-2xl font-semibold mb-2">CI Coverage</h2>';
  list.forEach(item => {
    const div = document.createElement('div');
    div.textContent = `${item.agent} - ${item.status}`;
    coverage.appendChild(div);
  });
}

function renderActivity(anomalyDocs) {
  const activity = document.getElementById('activity');
  activity.innerHTML = '<h2 class="text-2xl font-semibold mb-2">Activity Feed</h2>';
  anomalyDocs.forEach(doc => {
    const data = doc.data();
    const div = document.createElement('div');
    div.textContent = `${data.timestamp} - ${data.agent}: ${data.message}`;
    activity.appendChild(div);
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
    document.getElementById('content').classList.remove('hidden');
    loadData();
  } catch (err) {
    statusEl.textContent = err.message;
  }
});

document.getElementById('refreshBtn').addEventListener('click', loadData);

document.getElementById('logoutBtn').addEventListener('click', async () => {
  await auth.signOut();
  document.getElementById('content').classList.add('hidden');
  document.getElementById('loginSection').classList.remove('hidden');
});
