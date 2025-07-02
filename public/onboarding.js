// Firebase config placeholder
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

async function saveUser(user, extra) {
  const doc = {
    uid: user.uid,
    email: user.email,
    fullName: extra.name || user.displayName || '',
    dreamOutcome: extra.dream || '',
    skills: (extra.skills || '').split(',').map(s => s.trim()).filter(Boolean),
    status: 'pending',
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  };
  await db.collection('users').doc(user.uid).set(doc);
}

function getInput(id) {
  return document.getElementById(id).value.trim();
}

async function handleEmailSignup() {
  const email = getInput('email');
  const password = getInput('password');
  const name = getInput('name');
  const dream = getInput('dream');
  const skills = getInput('skills');
  const statusEl = document.getElementById('status');
  statusEl.textContent = '';
  try {
    const cred = await auth.createUserWithEmailAndPassword(email, password);
    await saveUser(cred.user, { name, dream, skills });
    window.location.href = `dashboard.html?id=${cred.user.uid}`;
  } catch (err) {
    console.error('signup error', err);
    statusEl.textContent = err.message;
    statusEl.classList.add('text-red-600');
  }
}

async function handleGoogleSignup() {
  const provider = new firebase.auth.GoogleAuthProvider();
  const name = getInput('name');
  const dream = getInput('dream');
  const skills = getInput('skills');
  const statusEl = document.getElementById('status');
  statusEl.textContent = '';
  try {
    const result = await auth.signInWithPopup(provider);
    await saveUser(result.user, { name, dream, skills });
    window.location.href = `dashboard.html?id=${result.user.uid}`;
  } catch (err) {
    console.error('google signup error', err);
    statusEl.textContent = err.message;
    statusEl.classList.add('text-red-600');
  }
}

document.getElementById('signupBtn').addEventListener('click', handleEmailSignup);
document.getElementById('googleBtn').addEventListener('click', handleGoogleSignup);
