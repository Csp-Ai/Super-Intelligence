const admin = require('firebase-admin');
const functions = require('firebase-functions/v1');

/**
 * Analyze recent agent runs and log anomalies to Firestore.
 * @returns {Promise<Array>} List of anomaly objects saved
 */
async function detectAnomalies() {
  if (process.env.LOCAL_AGENT_RUN) return [];
  const db = admin.firestore();
  const users = await db.collection('users').get();
  const anomalies = [];
  const now = Date.now();

  for (const userDoc of users.docs) {
    const userId = userDoc.id;
    const runsSnap = await userDoc.ref
      .collection('agentRuns')
      .orderBy('timestamp', 'desc')
      .get();
    const runs = runsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const byAgent = {};
    runs.forEach(r => {
      const name = r.agentName || r.agent;
      if (!name) return;
      if (!byAgent[name]) byAgent[name] = [];
      byAgent[name].push(r);
    });

    const requiredAgents = ['roadmap-agent', 'resume-agent', 'opportunity-agent'];

    for (const agentName of requiredAgents) {
      const list = byAgent[agentName] || [];
      // Agent never triggered
      if (!list.length) {
        anomalies.push({
          userId,
          agent: agentName,
          type: 'agent-missing',
          severity: 'high',
          timestamp: new Date().toISOString(),
          runIds: [],
          message: 'Agent never triggered for user',
          remediation: 'Run onboarding or trigger agent manually'
        });
        continue;
      }

      // Inactivity check
      const lastTime = new Date(list[0].timestamp).getTime();
      if (now - lastTime > 3 * 24 * 60 * 60 * 1000) {
        anomalies.push({
          userId,
          agent: agentName,
          type: 'agent-offline',
          severity: 'high',
          timestamp: new Date().toISOString(),
          runIds: [list[0].id],
          message: 'Agent inactive for over 3 days',
          remediation: 'Investigate failure or trigger retry'
        });
      }

      // Failure spike detection
      const recent = list.slice(0, 5);
      const previous = list.slice(5);
      const recentFail = recent.filter(r => r.status !== 'success' && r.status !== 'pass').length;
      const prevFail = previous.filter(r => r.status !== 'success' && r.status !== 'pass').length;
      const recentRate = recentFail / (recent.length || 1);
      const prevRate = prevFail / (previous.length || 1);
      if (recentRate - prevRate > 0.2) {
        anomalies.push({
          userId,
          agent: agentName,
          type: 'failure-spike',
          severity: 'medium',
          timestamp: new Date().toISOString(),
          runIds: recent.map(r => r.id),
          message: `Failure rate jumped to ${(recentRate * 100).toFixed(0)}%`,
          remediation: 'Check recent inputs and outputs for issues'
        });
      }

      // Repeated failures
      let consecutive = 0;
      const failedIds = [];
      for (const r of list) {
        if (r.status !== 'success' && r.status !== 'pass') {
          consecutive += 1;
          failedIds.push(r.id);
          if (consecutive >= 3) {
            anomalies.push({
              userId,
              agent: agentName,
              type: 'repeated-failures',
              severity: 'high',
              timestamp: new Date().toISOString(),
              runIds: failedIds.slice(-consecutive),
              message: `${consecutive} consecutive failures`,
              remediation: 'Investigate inputs or retry failed runs'
            });
            break;
          }
        } else {
          consecutive = 0;
          failedIds.length = 0;
        }
      }

      // Empty or null outputs
      list.forEach(r => {
        const out = r.output;
        if (
          out === null ||
          out === '' ||
          (typeof out === 'object' && Object.keys(out).length === 0)
        ) {
          anomalies.push({
            userId,
            agent: agentName,
            type: 'empty-output',
            severity: 'medium',
            timestamp: new Date().toISOString(),
            runIds: [r.id],
            message: 'Run returned empty output',
            remediation: 'Check agent logic or retry'
          });
        }
      });
    }
  }

  for (const anom of anomalies) {
    await admin.firestore().collection('anomalies').add(anom);
    const state = anom.type === 'agent-offline' ? 'offline' : 'under-review';
    await admin
      .firestore()
      .collection('agents')
      .doc(anom.agent)
      .collection('lifecycle')
      .doc(state)
      .set({ timestamp: anom.timestamp }, { merge: true });
    await admin
      .firestore()
      .collection('agents')
      .doc(anom.agent)
      .set({ currentState: state }, { merge: true });
    if (process.env.ANOMALY_WEBHOOK && anom.severity === 'high') {
      try {
        await fetch(process.env.ANOMALY_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(anom)
        });
      } catch (err) {
        console.error('anomaly webhook failed', err.message);
      }
    }
  }
  return anomalies;
}

exports.runAnomalyDetection = detectAnomalies;
exports.anomalyCron = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async () => {
    if (!process.env.PUBSUB_EMULATOR_HOST) {
      console.warn('PubSub emulator not detected. Skipping anomalyCron...');
      return;
    }
    await detectAnomalies();
  });
