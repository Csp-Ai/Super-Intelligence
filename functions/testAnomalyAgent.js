const admin = require('firebase-admin');
process.env.LOCAL_AGENT_RUN = '1';
const { runAnomalyDetection } = require('./agents/anomalyAgent');

try {
  admin.initializeApp({ projectId: 'demo' });
} catch (e) {
  // ignore if already initialized
}

(async () => {
  const anomalies = await runAnomalyDetection();
  console.log('Detected anomalies:', JSON.stringify(anomalies, null, 2));
})();
