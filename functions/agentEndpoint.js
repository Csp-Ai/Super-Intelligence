const admin = require('firebase-admin');
const functions = require('firebase-functions/v1');

exports.agentEndpoint = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  const authHeader = req.headers.authorization || '';
  const match = authHeader.match(/^Bearer (.+)$/);

  if (!match) {
    return res.status(401).send({ error: 'Missing auth token' });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(match[1]);
    console.log('Authenticated user:', decoded.uid);
    // TODO: replace with real agent logic
    res.json({ status: 'ok', uid: decoded.uid });
  } catch (err) {
    return res.status(403).send({ error: 'Invalid auth token', details: err.message });
  }
});
