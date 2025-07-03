// Centralized Firebase configuration loader
// Firebase Hosting serves /__/firebase/init.js with project credentials
// so no API keys are committed to the repo.
fetch('/__/firebase/init.json')
  .then((resp) => resp.json())
  .then((firebaseConfig) => {
    firebase.initializeApp(firebaseConfig);
  })
  .catch((err) => {
    console.error('Failed to load Firebase config', err);
  });
