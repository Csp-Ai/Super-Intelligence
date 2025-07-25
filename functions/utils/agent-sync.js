const admin = require('firebase-admin');
const { broadcast } = require('./agent-sync-ws');

let agentId = 'unknown-agent';
const listeners = {};
const localStore = {};

// Store strategy sync logs locally when running in LOCAL_AGENT_RUN
const localLogs = [];

function registerAgent(id) {
  agentId = id || agentId;
}

function encryptPayload(data) {
  // Placeholder for future encryption logic
  return data;
}

function decryptPayload(data) {
  // Placeholder for future decryption logic
  return data;
}

async function logSyncMessage({ sourceAgent, targetAgent, strategySummary, timestamp }) {
  if (!targetAgent || !strategySummary) return;
  const entry = { sourceAgent, targetAgent, strategySummary, timestamp };

  if (process.env.LOCAL_AGENT_RUN) {
    localLogs.push(entry);
    return;
  }

  try {
    const db = admin.firestore();
    await db.collection('agentSyncLogs').add(entry);
  } catch (err) {
    console.error('AgentSync log failed', err.message);
  }
}

async function publish(runId, payload = {}) {
  const data = {
    ...encryptPayload(payload),
    _timestamp: new Date().toISOString(),
    _agentId: agentId
  };

  if (process.env.LOCAL_AGENT_RUN) {
    if (!localStore[runId]) localStore[runId] = [];
    localStore[runId].push(data);
    (listeners[runId] || []).forEach(cb => cb(decryptPayload(data)));
    broadcast(runId, decryptPayload(data));
    await logSyncMessage({
      sourceAgent: agentId,
      targetAgent: payload.targetAgent,
      strategySummary: payload.strategySummary,
      timestamp: data._timestamp
    });
    return;
  }

  const db = admin.firestore();
  const docRef = db.collection('agentSync').doc(runId);

  async function attempt(retries = 3) {
    try {
      await docRef.set({
        latest: data,
        updates: admin.firestore.FieldValue.arrayUnion(data)
      }, { merge: true });
    } catch (err) {
      if (retries > 0) {
        console.warn('AgentSync publish retry', err.message);
        await new Promise(r => setTimeout(r, 1000));
        await attempt(retries - 1);
      } else {
        console.error('AgentSync publish failed', err.message);
      }
    }
  }

  await attempt();
  broadcast(runId, decryptPayload(data));
  await logSyncMessage({
    sourceAgent: agentId,
    targetAgent: payload.targetAgent,
    strategySummary: payload.strategySummary,
    timestamp: data._timestamp
  });
}

function subscribe(runId, callback) {
  if (process.env.LOCAL_AGENT_RUN) {
    if (!listeners[runId]) listeners[runId] = [];
    listeners[runId].push(callback);
    if (localStore[runId]) {
      localStore[runId].forEach(data => callback(decryptPayload(data)));
    }
    return () => {
      listeners[runId] = (listeners[runId] || []).filter(cb => cb !== callback);
    };
  }

  const db = admin.firestore();
  const docRef = db.collection('agentSync').doc(runId);
  let unsubscribe;

  function startListener() {
    unsubscribe = docRef.onSnapshot(snap => {
      const data = snap.data();
      if (!data || !data.latest) return;
      callback(decryptPayload(data.latest));
    }, err => {
      console.error('AgentSync subscribe error', err.message);
      setTimeout(startListener, 1000);
    });
  }

  startListener();

  return () => {
    if (unsubscribe) unsubscribe();
  };
}

module.exports = { registerAgent, publish, subscribe };
