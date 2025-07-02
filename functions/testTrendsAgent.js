const admin = require('firebase-admin');
process.env.LOCAL_AGENT_RUN = '1';
const { computeGlobalTrends } = require('./agents/trendsAgent');

try {
  admin.initializeApp({ projectId: 'demo' });
} catch (e) {
  // ignore if already initialized
}

(async () => {
  const trends = await computeGlobalTrends();
  console.log('Trends:', JSON.stringify(trends, null, 2));
})();

