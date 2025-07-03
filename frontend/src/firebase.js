// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, connectAuthEmulator } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyALV8mGdTdENmOCjgiPCODLVs6DUtD5H0U",
  authDomain: "super-intelligence-7b653.firebaseapp.com",
  projectId: "super-intelligence-7b653",
  storageBucket: "super-intelligence-7b653.firebasestorage.app",
  messagingSenderId: "170923536461",
  appId: "1:170923536461:web:f055faae06eb4552e8ac04",
  measurementId: "G-BNQTJQ902V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

if (window.location.hostname === "localhost") {
  connectAuthEmulator(auth, "http://localhost:9099");
}

export { app, analytics, auth };
