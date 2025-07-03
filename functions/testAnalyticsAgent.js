process.env.LOCAL_AGENT_RUN = '1';
const admin = require('firebase-admin');
const { logInteraction } = require('./agents/analytics-agent');

try {
  admin.initializeApp({ projectId: 'demo' });
} catch (e) {
  // ignore if already initialized
}

(async () => {
  const res = await logInteraction({ eventName: 'test', userId: 'test-user' });
  console.log('Analytics log result:', res);
})();
