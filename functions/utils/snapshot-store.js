const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

function createSnapshotStore({ userId = 'unknown', runId = '' }) {
  const localPath = path.join(__dirname, '..', 'snapshots.json');

  function writeLocal(stepIndex, state) {
    let data = {};
    if (fs.existsSync(localPath)) {
      try {
        data = JSON.parse(fs.readFileSync(localPath, 'utf8'));
      } catch (_) {
        data = {};
      }
    }
    if (!data[runId]) data[runId] = [];
    data[runId][stepIndex] = { state, timestamp: new Date().toISOString() };
    fs.writeFileSync(localPath, JSON.stringify(data, null, 2));
  }

  return async function saveSnapshot(stepIndex, state) {
    if (process.env.LOCAL_AGENT_RUN) {
      writeLocal(stepIndex, state);
      return;
    }
    try {
      const db = admin.firestore();
      await db
        .collection('users')
        .doc(userId)
        .collection('agentRuns')
        .doc(runId)
        .collection('snapshots')
        .doc(String(stepIndex))
        .set({ state, timestamp: new Date().toISOString() });
    } catch (err) {
      console.error('snapshot save failed', err.message);
      writeLocal(stepIndex, state);
    }
  };
}

module.exports = { createSnapshotStore };
