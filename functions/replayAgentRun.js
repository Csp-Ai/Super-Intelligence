const admin = require('firebase-admin');
const functions = require('firebase-functions/v1');
const fs = require('fs');
const path = require('path');
const { publish } = require('./utils/agent-sync');
const { ReplayStream, logReplayEvent } = require('./utils/replay-stream');
const { computeReplaySummary } = require('./summarizeReplayLogs');

const sessions = {};

function loadLocal(runId) {
  const localPath = path.join(__dirname, 'snapshots.json');
  if (!fs.existsSync(localPath)) return [];
  try {
    const data = JSON.parse(fs.readFileSync(localPath, 'utf8'));
    return data[runId] || [];
  } catch (_) {
    return [];
  }
}

async function loadSnapshots(userId, runId) {
  if (process.env.LOCAL_AGENT_RUN) {
    return loadLocal(runId);
  }
  try {
    const db = admin.firestore();
    const snap = await db
      .collection('users')
      .doc(userId)
      .collection('agentRuns')
      .doc(runId)
      .collection('snapshots')
      .orderBy('timestamp')
      .get();
    return snap.docs.map(d => d.data());
  } catch (err) {
    console.error('loadSnapshots error', err.message);
    return loadLocal(runId);
  }
}

function runLoop(runId) {
  const session = sessions[runId];
  if (!session || session.paused) return;
  if (session.index >= session.snapshots.length) {
    const uid = session.userId;
    delete sessions[runId];
    if (!session.summaryGenerated) {
      computeReplaySummary(runId, uid).catch(err => console.error('summary fail', err));
      session.summaryGenerated = true;
    }
    return;
  }
  const snap = session.snapshots[session.index++];
  publish(runId, { replay: true, ...snap.state });
  setTimeout(() => runLoop(runId), 500);
}

async function handleReplayAction({ userId, runId, action, speed = 1, isAdmin = false, persist = false, message, rating, comment, submittedAt }) {
  if (process.env.LOCAL_AGENT_RUN) persist = true;
  let result;
  let error;
  try {
    if (isAdmin && action === 'stream') {
      const stream = new ReplayStream(runId, { speed: Number(speed) || 1 });
      stream.play().catch(err => console.error('replay error', err));
      result = { status: 'streaming' };
    } else if (action === 'start') {
      const snaps = await loadSnapshots(userId, runId);
      sessions[runId] = { snapshots: snaps, index: 0, paused: false, userId, summaryGenerated: false };
      runLoop(runId);
      result = { status: 'started' };
    } else if (action === 'pause') {
      if (sessions[runId]) sessions[runId].paused = true;
      result = { status: 'paused' };
    } else if (action === 'resume') {
      if (sessions[runId]) {
        sessions[runId].paused = false;
        runLoop(runId);
      }
      result = { status: 'resumed' };
    } else if (action === 'step') {
      const session = sessions[runId];
      if (session) {
        session.paused = true;
        if (session.index < session.snapshots.length) {
          const snap = session.snapshots[session.index++];
          await publish(runId, { replay: true, ...snap.state });
        }
      }
      result = { status: 'stepped' };
    } else if (action === 'error') {
      await logReplayEvent({ userId, runId, action: 'client-error', params: { message }, state: {}, error: message, persist });
      result = { status: 'logged' };
    } else if (action === 'feedback') {
      const ratingNum = Number(rating);
      if (rating != null && (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5)) {
        throw new Error('Invalid rating');
      }
      const fb = {
        rating: ratingNum,
        comment: comment || '',
        submittedAt: submittedAt || new Date().toISOString()
      };
      if (!process.env.LOCAL_AGENT_RUN) {
        const db = admin.firestore();
        await db.collection('users').doc(userId).collection('agentRuns').doc(runId).set({ feedback: fb }, { merge: true });
      } else {
        const logPath = path.join(__dirname, 'replayLogs.json');
        let store = {};
        if (fs.existsSync(logPath)) {
          try { store = JSON.parse(fs.readFileSync(logPath, 'utf8')); } catch (_) {}
        }
        if (!store[runId]) store[runId] = [];
        store[runId].push({ action: 'feedback', timestamp: fb.submittedAt, params: fb });
        fs.writeFileSync(logPath, JSON.stringify(store, null, 2));
      }
      await logReplayEvent({ userId, runId, action: 'feedback', params: fb, state: {}, persist });
      result = { status: 'recorded' };
    } else {
      throw new Error('Invalid action');
    }
    return result;
  } catch (err) {
    error = err.message;
    throw err;
  } finally {
    const session = sessions[runId];
    const state = session
      ? {
          currentStep: session.index,
          paused: session.paused,
          total: session.snapshots?.length
        }
      : {};
    try {
      const params = action === 'feedback'
        ? { rating: rating ? Number(rating) : undefined, comment, submittedAt }
        : { speed };
      await logReplayEvent({ userId, runId, action, params, state, error, persist });
    } catch (e) {
      console.error('replay log failed', e.message);
    }
    if (session && session.index >= session.snapshots.length && !session.summaryGenerated) {
      session.summaryGenerated = true;
      computeReplaySummary(runId, session.userId).catch(err => console.error('summary fail', err));
    }
  }
}

exports.replayAgentRun = functions.https.onRequest(async (req, res) => {
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

    // Optional email allowlist for admin-triggered ReplayStream
    const allowed = (functions.config().debug && functions.config().debug.allowlist)
      ? functions.config().debug.allowlist.split(',')
      : ['admin@example.com'];

    const { runId, action = 'start', speed = 1, persist = false, message, rating, comment, submittedAt } = req.body || {};
    if (!runId) {
      res.status(400).json({ error: 'Missing runId' });
      return;
    }

    const userId = decoded.uid;
    const result = await handleReplayAction({
      userId,
      runId,
      action,
      speed,
      isAdmin: allowed.includes(decoded.email),
      persist,
      message,
      rating,
      comment,
      submittedAt
    });
    res.json(result);
  } catch (err) {
    console.error('replayAgentRun error', err);
    res.status(500).json({ error: err.message });
  }
});

exports.handleReplayAction = handleReplayAction;

