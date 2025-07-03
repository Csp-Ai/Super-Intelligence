const admin = require('firebase-admin');
const functions = require('firebase-functions/v1');
const { subscribe } = require('../utils/agent-sync');

/**
 * Server-sent events endpoint for live AgentSync updates.
 * Clients must provide ?runId and ?token query params.
 */
exports.agentSyncSubscribe = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  const { runId, token } = req.query;
  if (!runId || !token) {
    res.status(400).json({ error: 'Missing parameters' });
    return;
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const db = admin.firestore();
    const runDoc = await db
      .collection('users')
      .doc(decoded.uid)
      .collection('agentRuns')
      .doc(runId)
      .get();
    if (!runDoc.exists) {
      res.status(404).json({ error: 'Run not found' });
      return;
    }
  } catch (err) {
    console.error('agentSyncSubscribe auth error', err.message);
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  res.set({
    'Cache-Control': 'no-cache',
    'Content-Type': 'text/event-stream',
    Connection: 'keep-alive'
  });
  res.flushHeaders();

  const unsubscribe = subscribe(runId, data => {
    try {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch (e) {
      // ignore write errors
    }
  });

  req.on('close', () => {
    unsubscribe();
    res.end();
  });
});
