import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

let app;
let analytics;
let auth;

export async function getFirebase() {
  if (!app) {
    const resp = await fetch('/__/firebase/init.json');
    const config = await resp.json();
    app = initializeApp(config);
    analytics = getAnalytics(app);
    auth = getAuth(app);
    if (window.location.hostname === 'localhost') {
      connectAuthEmulator(auth, 'http://localhost:9099');
    }
  }
  return { app, analytics, auth };
}
