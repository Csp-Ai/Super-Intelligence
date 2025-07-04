const admin = require('firebase-admin');
const express = require('express');
const http = require('http');
const path = require('path');
const { initAgentSyncWs } = require('./functions/utils/agent-sync-ws');

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

const app = express();
const server = http.createServer(app);
initAgentSyncWs(server);

const distPath = path.join(__dirname, 'frontend', 'dist');
app.use(express.static(distPath));
// Fallback to index.html so client-side routing works
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
