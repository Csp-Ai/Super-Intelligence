// Firebase config placeholder
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

const allowedEmails = ["admin@example.com"];

async function fetchTrends() {
  const snap = await db.collection('globalTrends').doc('forecast').get();
  renderTrends(snap.exists ? snap.data() : {});
}

function renderTrends(data) {
  const container = document.getElementById('trendsContainer');
  container.innerHTML = '';
  if (!data.metrics) {
    container.textContent = 'No trend data available';
    return;
  }
  Object.keys(data.metrics).forEach(agent => {
    const section = document.createElement('div');
    section.className = 'mb-6';
    section.innerHTML = `<h2 class="text-xl font-semibold mb-2">${agent}</h2>`;
    const pre = document.createElement('pre');
    pre.textContent = JSON.stringify(data.metrics[agent], null, 2);
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
    fetchTrends();
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

document.getElementById('refreshBtn').addEventListener('click', fetchTrends);

auth.onAuthStateChanged(user => {
  if (user && allowedEmails.includes(user.email)) {
    document.getElementById('loginSection').classList.add('hidden');
    document.getElementById('controls').classList.remove('hidden');
    fetchTrends();
  }
});

