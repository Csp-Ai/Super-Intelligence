const admin = require('firebase-admin');
const functions = require('firebase-functions');
const { ReplayStream } = require('./utils/replay-stream');

/**
 * Trigger a replay of a past agent run.
 * Expects POST with { runId, speed } and auth bearer token.
 */
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
    const allowed = (functions.config().debug && functions.config().debug.allowlist)
      ? functions.config().debug.allowlist.split(',')
      : ['admin@example.com'];
    if (!decoded.email || !allowed.includes(decoded.email)) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const { runId, speed = 1 } = req.body || {};
    if (!runId) {
      res.status(400).json({ error: 'Missing runId' });
      return;
    }

    const stream = new ReplayStream(runId, { speed: Number(speed) || 1 });
    stream.play().catch(err => console.error('replay error', err));
    res.json({ status: 'playing' });
  } catch (err) {
    console.error('replayAgentRun error', err);
    res.status(500).json({ error: err.message });
  }
});
