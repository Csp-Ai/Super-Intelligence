// Firebase config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID"
};

let auth, db;
try {
  firebase.initializeApp(firebaseConfig);
  auth = firebase.auth();
  db = firebase.firestore();
  db.enablePersistence({ synchronizeTabs: true }).catch(() => {});
  auth.signInAnonymously().catch(() => {});
} catch (err) {
  console.error('Firebase init failed', err);
}

let runs = [];
let unsubscribeRuns = null;
const stepListeners = {};
const syncStreams = {};
let currentReplay = null;

// ... rest of the code continues unchanged

