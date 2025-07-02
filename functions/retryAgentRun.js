const admin = require('firebase-admin');
const functions = require('firebase-functions');
const { generateRoadmap } = require('./agents/roadmapAgent');
const { generateResumeSummary } = require('./agents/resumeAgent');
const { generateOpportunities } = require('./agents/opportunityAgent');

const agentMap = {
  'roadmap-agent': generateRoadmap,
  'resume-agent': generateResumeSummary,
  'opportunity-agent': generateOpportunities
};

async function retryRun(userId, agentName) {
  const db = admin.firestore();
  const snap = await db
    .collection('users')
    .doc(userId)
    .collection('agentRuns')
    .where('agentName', '==', agentName)
    .where('status', '==', 'error')
    .orderBy('timestamp', 'desc')
    .limit(1)
    .get();

  if (snap.empty) {
    throw new Error('No failed run found');
  }

  const doc = snap.docs[0];
  const data = doc.data();
  const input = data.input || {};

  if (!agentMap[agentName]) throw new Error('Unknown agent');

  const output = await agentMap[agentName](input, userId);

  await doc.ref.update({
    output,
    status: 'success',
    resolved: true,
    timestamp: new Date().toISOString()
  });

  if (process.env.RETRY_WEBHOOK) {
    try {
      await fetch(process.env.RETRY_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: `Resolved ${agentName} for ${userId}` })
      });
    } catch (err) {
      console.error('webhook failed', err);
    }
  }

  return output;
}

exports.retryAgentRun = functions.https.onRequest(async (req, res) => {
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

    const { userId = decoded.uid, agentName } = req.body || {};
    if (!userId || !agentName) {
      res.status(400).json({ error: 'Missing parameters' });
      return;
    }

    const output = await retryRun(userId, agentName);
    res.json({ status: 'success', output });
  } catch (err) {
    console.error('retryAgentRun error', err);
    res.status(500).json({ error: err.message });
  }
});
