const auth = firebase.auth();

const allowedEmails = ["admin@example.com"];

async function fetchInsights() {
  const user = auth.currentUser;
  if (!user) return;
  try {
    const token = await user.getIdToken();
    const url = `https://us-central1-${firebaseConfig.projectId}.cloudfunctions.net/getInsights`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    renderInsights(data);
  } catch (err) {
    console.error('Failed to load insights', err);
  }
}

function renderInsights(data) {
  const container = document.getElementById('insightsContainer');
  container.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4';
  container.innerHTML = '';

  Object.keys(data).forEach(agent => {
    const section = document.createElement('div');
    section.className = 'mb-6 bg-white p-4 rounded shadow';
    section.innerHTML = `<h2 class="text-2xl font-semibold mb-2">${agent}</h2>`;

    const pre = document.createElement('pre');
    pre.textContent = JSON.stringify(data[agent], null, 2);
    section.appendChild(pre);
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
    fetchInsights();
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

document.getElementById('refreshBtn').addEventListener('click', fetchInsights);

auth.onAuthStateChanged(user => {
  if (user && allowedEmails.includes(user.email)) {
    document.getElementById('loginSection').classList.add('hidden');
    document.getElementById('controls').classList.remove('hidden');
    fetchInsights();
  }
});
