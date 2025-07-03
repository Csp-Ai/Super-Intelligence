// Centralized Firebase configuration
// Replace these placeholders with real values or inject via environment variables during deployment
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID"
};

// Initialize Firebase once for all pages
firebase.initializeApp(firebaseConfig);
