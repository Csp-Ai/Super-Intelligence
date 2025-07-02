const admin = require('firebase-admin');
const functions = require('firebase-functions');
const fs = require('fs');
const path = require('path');

function loadLocalLogs(runId) {
  const logPath = path.join(__dirname, 'replayLogs.json');
  if (!fs.existsSync(logPath)) return [];
  try {
    const raw = fs.readFileSync(logPath, 'utf8');
    const data = JSON.parse(raw);
    return Array.isArray(data[runId]) ? data[runId] : [];
  } catch (_) {
    return [];
  }
}

async function computeReplaySummary(runId, userId) {
  let logs = [];
  if (process.env.LOCAL_AGENT_RUN) {
    logs = loadLocalLogs(runId);
  } else {
    const db = admin.firestore();
    const snap = await db
      .collection('users')
      .doc(userId)
      .collection('agentRuns')
      .doc(runId)
      .collection('replayLogs')
      .orderBy('timestamp')
      .get();
    logs = snap.docs.map(d => d.data());
  }

  if (!logs.length) return null;
  const first = logs[0];
  const last = logs[logs.length - 1];
  const totalSteps = logs.reduce((m, l) => Math.max(m, l.state?.currentStep || 0), 0);
  const actionCount = logs.filter(l => ['start','pause','resume','step'].includes(l.action)).length;
  const durationMs = new Date(last.timestamp) - new Date(first.timestamp);
  const errorCount = logs.filter(l => l.error).length;

  const summary = {
    totalSteps,
    actionCount,
    durationMs,
    errorCount,
    updatedAt: new Date().toISOString()
  };

  if (!process.env.LOCAL_AGENT_RUN) {
    const db = admin.firestore();
    const batch = db.batch();
    const ref = db
      .collection('users')
      .doc(userId)
      .collection('agentRuns')
      .doc(runId)
      .collection('replaySummary')
      .doc('summary');
    batch.set(ref, summary, { merge: true });
    await batch.commit();
  } else {
    const outPath = path.join(__dirname, 'replaySummary.json');
    let store = {};
    if (fs.existsSync(outPath)) {
      try {
        store = JSON.parse(fs.readFileSync(outPath, 'utf8'));
      } catch (_) {
        store = {};
      }
    }
    store[runId] = summary;
    fs.writeFileSync(outPath, JSON.stringify(store, null, 2));
  }
  return summary;
}

exports.computeReplaySummary = computeReplaySummary;

exports.summarizeReplayLogs = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  const authHeader = req.headers.authorization || '';
  const match = authHeader.match(/^Bearer (.+)$/);
  if (!match) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  try {
    const decoded = await admin.auth().verifyIdToken(match[1]);
    const allowed = (functions.config().debug && functions.config().debug.allowlist)
      ? functions.config().debug.allowlist.split(',')
      : ['admin@example.com'];
    let { runId, userId = decoded.uid } = req.body || {};
    if (!runId) {
      res.status(400).json({ error: 'Missing runId' });
      return;
    }
    if (userId !== decoded.uid && (!decoded.email || !allowed.includes(decoded.email))) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    const summary = await computeReplaySummary(runId, userId);
    res.json(summary || { status: 'no-logs' });
  } catch (err) {
    console.error('summarizeReplayLogs error', err);
    res.status(500).json({ error: err.message });
  }
});
