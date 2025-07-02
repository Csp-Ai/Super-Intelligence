// Firebase configuration placeholder - replace with your Firebase project values
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const statusEl = document.getElementById('status');
const offlineEl = document.getElementById('offlineFlag');

document.getElementById('fetchBtn').addEventListener('click', async () => {
  const userId = document.getElementById('userIdInput').value.trim();
  statusEl.className = 'ml-4 text-sm';
  statusEl.textContent = '';
  if (!userId) {
    statusEl.textContent = 'Please enter a user ID.';
    statusEl.classList.add('text-red-500');
    return;
  }

  try {
    const userRef = db.collection('users').doc(userId);

    const roadmapSnap = await userRef.collection('roadmap').limit(1).get();
    const resumeSnap = await userRef.collection('resume').limit(1).get();
    const oppSnap = await userRef.collection('opportunities').limit(1).get();
    const runSnap = await userRef.collection('agentRuns').orderBy('timestamp', 'desc').limit(1).get();

    if (!roadmapSnap.empty) {
      renderRoadmap(roadmapSnap.docs[0].data().roadmap || []);
    } else {
      renderRoadmap([]);
    }

    if (!resumeSnap.empty) {
      renderResume(resumeSnap.docs[0].data().summary || '');
    } else {
      renderResume('');
    }

    if (!oppSnap.empty) {
      renderOpportunities(oppSnap.docs[0].data().opportunities || []);
    } else {
      renderOpportunities([]);
    }

    if (!runSnap.empty) {
      const ts = runSnap.docs[0].data().timestamp;
      if (ts && Date.now() - new Date(ts).getTime() > 3 * 24 * 60 * 60 * 1000) {
        offlineEl.classList.remove('hidden');
      } else {
        offlineEl.classList.add('hidden');
      }
    } else {
      offlineEl.classList.remove('hidden');
    }

    statusEl.textContent = 'Data loaded successfully.';
    statusEl.classList.add('text-green-600');
  } catch (err) {
    console.error('Error fetching user data', err);
    statusEl.textContent = 'Failed to fetch data.';
    statusEl.classList.add('text-red-500');
  }
});

function renderRoadmap(steps) {
  const container = document.getElementById('roadmap');
  container.innerHTML = '<h2 class="text-xl font-semibold mb-2">\uD83D\uDCCD Roadmap</h2>';
  if (!steps.length) {
    container.innerHTML += '<p>No roadmap found.</p>';
    return;
  }
  const list = document.createElement('ul');
  list.className = 'list-disc ml-5';
  steps.forEach(step => {
    const li = document.createElement('li');
    li.textContent = `${step.phase}: ${step.description}`;
    list.appendChild(li);
  });
  container.appendChild(list);
}

function renderResume(summary) {
  const container = document.getElementById('resume');
  container.innerHTML = '<h2 class="text-xl font-semibold mb-2">\uD83D\uDCC4 Resume</h2>';
  container.innerHTML += summary ? `<p>${summary}</p>` : '<p>No resume summary found.</p>';
}

function renderOpportunities(list) {
  const container = document.getElementById('opportunities');
  container.innerHTML = '<h2 class="text-xl font-semibold mb-2">\uD83D\uDD0D Opportunities</h2>';
  if (!list.length) {
    container.innerHTML += '<p>No opportunities found.</p>';
    return;
  }
  const ul = document.createElement('ul');
  ul.className = 'list-disc ml-5';
  list.forEach(op => {
    const li = document.createElement('li');
    const link = op.link ? `<a href="${op.link}" target="_blank" class="text-blue-600 underline">${op.title}</a>` : op.title;
    li.innerHTML = link;
    ul.appendChild(li);
  });
  container.appendChild(ul);
}
