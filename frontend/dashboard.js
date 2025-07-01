// Firebase configuration placeholder - replace with your project config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

function getUserId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

function renderRoadmap(steps = []) {
  const container = document.getElementById('roadmap');
  container.innerHTML = '<h2>📍 Roadmap</h2>';
  const timeline = document.createElement('div');
  timeline.className = 'timeline';
  steps.slice(0, 3).forEach((step, idx) => {
    const item = document.createElement('div');
    item.className = 'timeline-step';
    item.innerHTML = `<h3>Step ${idx + 1}: ${step.phase}</h3><p>${step.description}</p>`;
    timeline.appendChild(item);
  });
  container.appendChild(timeline);
}

function renderResume(summary) {
  const container = document.getElementById('resume');
  container.innerHTML = `<h2>📄 Resume</h2><p>${summary}</p>`;
}

function renderOpportunities(list = []) {
  const container = document.getElementById('opportunities');
  container.innerHTML = '<h2>🔍 Opportunities</h2>';
  const grid = document.createElement('div');
  grid.className = 'opportunity-grid';
  list.forEach(op => {
    const card = document.createElement('div');
    card.className = 'opportunity-card';
    card.innerHTML = `<h3>${op.title}</h3><p>${op.description || ''}</p><a href="${op.link}" target="_blank">View</a>`;
    grid.appendChild(card);
  });
  container.appendChild(grid);
}

function initDashboard() {
  const userId = getUserId();
  if (!userId) return alert('No user ID provided');
  const userRef = db.collection('users').doc(userId);

  userRef.collection('roadmap').limit(1).onSnapshot(snapshot => {
    snapshot.forEach(doc => {
      renderRoadmap(doc.data().roadmap);
    });
  });

  userRef.collection('resume').limit(1).onSnapshot(snapshot => {
    snapshot.forEach(doc => {
      renderResume(doc.data().summary);
    });
  });

  userRef.collection('opportunities').limit(1).onSnapshot(snapshot => {
    snapshot.forEach(doc => {
      renderOpportunities(doc.data().opportunities);
    });
  });
}

document.addEventListener('DOMContentLoaded', initDashboard);
