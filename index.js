const admin = require('firebase-admin');

if (!process.env.GOOGLE_CLOUD_PROJECT && !process.env.FIREBASE_PROJECT_ID) {
  process.env.FIREBASE_PROJECT_ID = 'demo-project';
}
if (!process.env.GOOGLE_CLOUD_PROJECT) {
  process.env.GOOGLE_CLOUD_PROJECT = process.env.FIREBASE_PROJECT_ID;
}

const { initializeApp } = require('firebase/app');
const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID;

let credential;
try {
  credential = admin.credential.cert(require('./serviceAccount.json'));
  console.log('Using serviceAccount.json for Firebase admin.');
} catch (err) {
  console.warn('serviceAccount.json not found, using application default credentials.');
  credential = admin.credential.applicationDefault();
}

admin.initializeApp({ credential, projectId });
initializeApp({ projectId });

console.log(`Firebase initialized for project ${projectId}`);
