const admin = require('firebase-admin');
const functions = require('firebase-functions/v1');

/**
 * Update lifecycle state for an agent and record timestamp.
 * Expects POST with {agentId, state} and auth bearer token.
 */
exports.updateAgentState = functions.https.onRequest(async (req, res) => {
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
    if (!decoded.email || !allowed.includes(decoded.email)) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const { agentId, state } = req.body || {};
    if (!agentId || !state) {
      res.status(400).json({ error: 'Missing parameters' });
      return;
    }
    const db = admin.firestore();
    const ts = new Date().toISOString();
    await db.collection('agents').doc(agentId).collection('lifecycle').doc(state).set({ timestamp: ts }, { merge: true });
    await db.collection('agents').doc(agentId).set({ currentState: state, updatedAt: ts }, { merge: true });
    res.json({ status: 'ok' });
  } catch (err) {
    console.error('updateAgentState error', err);
    res.status(500).json({ error: err.message });
  }
});
