const admin = require('firebase-admin');
const functions = require('firebase-functions');
const fs = require('fs');
const path = require('path');

function aggregateRuns(runs = []) {
  const metrics = {};
  runs.forEach(r => {
    const name = r.agentName || r.agent;
    if (!name) return;
    if (!metrics[name]) {
      metrics[name] = {
        executionCount: 0,
        success: 0,
        failure: 0,
        totalInputSize: 0,
        totalOutputSize: 0,
        errors: {},
        totalOpportunities: 0,
        roadmapSteps: 0,
        resumeValue: 0,
        lastExecution: ''
      };
    }
    const m = metrics[name];
    m.executionCount += 1;
    if (r.status === 'success' || r.resolved) m.success += 1; else m.failure += 1;
    const inputSize = JSON.stringify(r.input || {}).length;
    const outputSize = JSON.stringify(r.output || {}).length;
    m.totalInputSize += inputSize;
    m.totalOutputSize += outputSize;
    const ts = r.timestamp || r.time;
    if (ts && (!m.lastExecution || ts > m.lastExecution)) m.lastExecution = ts;
    if (r.error) {
      const key = String(r.error).slice(0, 50);
      m.errors[key] = (m.errors[key] || 0) + 1;
    }
    if (name === 'opportunity-agent' && Array.isArray(r.output)) {
      m.totalOpportunities += r.output.length;
    }
    if (name === 'roadmap-agent' && Array.isArray(r.output)) {
      m.roadmapSteps += r.output.length;
    }
    if (name === 'resume-agent' && typeof r.output === 'string') {
      m.resumeValue += r.output.length;
    }
  });

  const result = {};
  Object.keys(metrics).forEach(name => {
    const d = metrics[name];
    result[name] = {
      executionCount: d.executionCount,
      successRate: d.executionCount ? d.success / d.executionCount : 0,
      failureRate: d.executionCount ? d.failure / d.executionCount : 0,
      avgInputSize: d.executionCount ? d.totalInputSize / d.executionCount : 0,
      avgOutputSize: d.executionCount ? d.totalOutputSize / d.executionCount : 0,
      mostCommonErrors: Object.entries(d.errors)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(e => e[0]),
      totalOpportunities: d.totalOpportunities,
      roadmapSteps: d.roadmapSteps,
      estimatedResumeValueUplift: d.executionCount ? d.resumeValue / d.executionCount : 0,
      lastExecution: d.lastExecution
    };
  });
  return result;
}

function loadLocalRuns() {
  const logPath = path.join(__dirname, '..', 'logs.json');
  try {
    const raw = fs.readFileSync(logPath, 'utf8');
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (_) {
    return [];
  }
}

async function computeUserInsights(userId) {
  const db = admin.firestore();
  let runs = [];
  try {
    const snap = await db.collection('users').doc(userId).collection('agentRuns').get();
    runs = snap.docs.map(d => d.data());
  } catch (err) {
    console.error('user insight firestore failed', err.message);
  }
  if (!runs.length) {
    runs = loadLocalRuns().filter(r => r.userId === userId || r.user === userId);
  }
  const metrics = aggregateRuns(runs);
  for (const [agentName, data] of Object.entries(metrics)) {
    await db.collection('users').doc(userId).collection('insights').doc(agentName).set(data, { merge: true });
  }
  return metrics;
}

async function computeGlobalInsights() {
  const db = admin.firestore();
  let runs = [];
  try {
    const snap = await db.collectionGroup('agentRuns').get();
    runs = snap.docs.map(d => d.data());
  } catch (err) {
    console.error('global insight firestore failed', err.message);
  }
  if (!runs.length) runs = loadLocalRuns();
  const metrics = aggregateRuns(runs);
  for (const [agentName, data] of Object.entries(metrics)) {
    await db.collection('global').doc('insights').collection('agents').doc(agentName).set(data, { merge: true });
  }
  return metrics;
}

exports.runAllInsights = async () => {
  const db = admin.firestore();
  const users = await db.collection('users').get();
  for (const doc of users.docs) {
    await computeUserInsights(doc.id);
  }
  return computeGlobalInsights();
};

exports.updateInsightsCron = functions.pubsub.schedule('every 24 hours').onRun(async () => {
  await exports.runAllInsights();
});

exports.getInsights = functions.https.onRequest(async (req, res) => {
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
    const userId = req.query.userId;
    let data;
    if (userId) data = await computeUserInsights(userId);
    else data = await computeGlobalInsights();
    res.json(data);
  } catch (err) {
    console.error('getInsights error', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = { aggregateRuns, computeUserInsights, computeGlobalInsights };
