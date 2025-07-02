const admin = require('firebase-admin');
const functions = require('firebase-functions');

function aggregateUsage(runs = []) {
  const byAgent = {};
  runs.forEach(r => {
    const name = r.agentName || r.agent;
    if (!name) return;
    const ts = new Date(r.timestamp || r.time || Date.now());
    const dow = ts.getDay();
    const dayKey = ts.toISOString().slice(0,10);
    const weekKey = `${ts.getFullYear()}-W${getWeekNumber(ts)}`;
    if (!byAgent[name]) {
      byAgent[name] = { daily: {}, weekly: {}, total: 0, success: 0, failure: 0, dow: Array(7).fill(0), failDow: Array(7).fill(0) };
    }
    const m = byAgent[name];
    m.daily[dayKey] = (m.daily[dayKey] || 0) + 1;
    m.weekly[weekKey] = (m.weekly[weekKey] || 0) + 1;
    m.total += 1;
    m.dow[dow] += 1;
    if (r.status === 'success' || r.resolved) m.success += 1; else { m.failure += 1; m.failDow[dow] += 1; }
  });
  const result = {};
  Object.keys(byAgent).forEach(agent => {
    const d = byAgent[agent];
    const worstDow = d.failDow.indexOf(Math.max(...d.failDow));
    const busyDow = d.dow.indexOf(Math.max(...d.dow));
    result[agent] = {
      daily: d.daily,
      weekly: d.weekly,
      totalRuns: d.total,
      successRate: d.total ? d.success / d.total : 0,
      busyDayOfWeek: busyDow,
      failureProneDay: worstDow
    };
  });
  return result;
}

function getWeekNumber(date) {
  const tmp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = tmp.getUTCDay() || 7;
  tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(),0,1));
  return Math.ceil((((tmp - yearStart) / 86400000) + 1)/7);
}

async function computeUserTrends(userId) {
  if (process.env.LOCAL_AGENT_RUN) return {};
  const db = admin.firestore();
  const snap = await db.collection('users').doc(userId).collection('agentRuns').get();
  const runs = snap.docs.map(d => d.data());
  const metrics = aggregateUsage(runs);
  const suggestions = [];
  const forecast = {};
  const now = Date.now();
  for (const agent of ['roadmap-agent','resume-agent','opportunity-agent']) {
    const list = runs.filter(r => (r.agentName || r.agent) === agent).sort((a,b)=>new Date(b.timestamp)-new Date(a.timestamp));
    if (!list.length) {
      suggestions.push(`You have not run ${agent} yet.`);
      continue;
    }
    const last = list[0];
    const nextTime = new Date(new Date(last.timestamp).getTime() + 24*60*60*1000).toISOString();
    forecast[agent] = nextTime;
    if (now - new Date(last.timestamp).getTime() > 7*24*60*60*1000) {
      suggestions.push(`Run ${agent} again to keep data fresh.`);
    }
  }
  const data = { metrics, forecast, suggestions };
  await db.collection('users').doc(userId).collection('trends').doc('summary').set(data, { merge: true });
  return data;
}

async function computeGlobalTrends() {
  if (process.env.LOCAL_AGENT_RUN) return {};
  const db = admin.firestore();
  const snap = await db.collectionGroup('agentRuns').get();
  const runs = snap.docs.map(d => d.data());
  const metrics = aggregateUsage(runs);
  const data = { metrics, generated: new Date().toISOString() };
  await db.collection('globalTrends').doc('forecast').set(data, { merge: true });
  return data;
}

exports.runAllTrends = async () => {
  const db = admin.firestore();
  const users = await db.collection('users').get();
  for (const doc of users.docs) {
    await computeUserTrends(doc.id);
  }
  return computeGlobalTrends();
};

exports.updateTrendsCron = functions.pubsub.schedule('every 24 hours').onRun(async () => {
  await exports.runAllTrends();
});

exports.getTrends = functions.https.onRequest(async (req, res) => {
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
    if (userId) data = await computeUserTrends(userId);
    else data = await computeGlobalTrends();
    res.json(data);
  } catch (err) {
    console.error('getTrends error', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = { aggregateUsage, computeUserTrends, computeGlobalTrends };

