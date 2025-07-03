const auth = firebase.auth();
const db = firebase.firestore();

const allowedEmails = ["admin@example.com"];

async function fetchAnomalies() {
  const snap = await db.collection('anomalies').orderBy('timestamp', 'desc').limit(50).get();
  const list = snap.docs.map(d => d.data());
  renderAnomalies(list);
}

function renderAnomalies(list) {
  const container = document.getElementById('anomaliesContainer');
  container.innerHTML = '';
  list.forEach(a => {
    const div = document.createElement('div');
    div.className = 'border p-2 mb-2 bg-white';
    div.innerHTML = `<div class="font-semibold">${a.agent} - ${a.userId}</div>
      <div>${a.type} (${a.severity})</div>
      <div class="text-sm">${a.message}</div>
      <div class="text-xs text-gray-600">${a.timestamp}</div>`;
    container.appendChild(div);
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
    fetchAnomalies();
  } catch (err) {
    console.error('login failed', err);
    statusEl.textContent = err.message;
  }
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
  await auth.signOut();
  document.getElementById('controls').classList.add('hidden');
  document.getElementById('loginSection').classList.remove('hidden');
});

document.getElementById('refreshBtn').addEventListener('click', fetchAnomalies);

auth.onAuthStateChanged(user => {
  if (user && allowedEmails.includes(user.email)) {
    document.getElementById('loginSection').classList.add('hidden');
    document.getElementById('controls').classList.remove('hidden');
    fetchAnomalies();
  }
});
