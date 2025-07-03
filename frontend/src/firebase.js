import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "super-intelligence-7b653.firebaseapp.com",
  projectId: "super-intelligence-7b653",
  storageBucket: "super-intelligence-7b653.firebasestorage.app",
  messagingSenderId: "170923536461",
  appId: "1:170923536461:web:f055faae06eb4552e8ac04",
  measurementId: "G-BNQTJQ902V"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);

if (window.location.hostname === 'localhost') {
  connectAuthEmulator(auth, 'http://localhost:9099');
}

export { app, auth, analytics };
