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
let currentRun;
let selectedRating = 0;
let lastRuns = [];
