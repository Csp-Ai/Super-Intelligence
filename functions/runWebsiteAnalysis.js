const functions = require('firebase-functions/v1');
const { runAgentFlow } = require('./core/agentFlowEngine');

exports.runWebsiteAnalysis = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  const { url, userId = 'anon' } = req.body || {};
  if (!url) {
    res.status(400).json({ error: 'Missing url' });
    return;
  }

  try {
    const runId = Date.now().toString();
    const result = await runAgentFlow(url, runId, { userId, configId: 'website-analysis' });
    res.json(result);
  } catch (err) {
    console.error('runWebsiteAnalysis error', err);
    res.status(500).json({ error: err.message });
  }
});
