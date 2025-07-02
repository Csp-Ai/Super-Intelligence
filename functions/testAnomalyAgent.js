const admin = require('firebase-admin');
const { runAnomalyDetection } = require('./agents/anomalyAgent');

try {
  admin.initializeApp();
} catch (e) {
  // ignore if already initialized
}

(async () => {
  const anomalies = await runAnomalyDetection();
  console.log('Detected anomalies:', JSON.stringify(anomalies, null, 2));
})();
