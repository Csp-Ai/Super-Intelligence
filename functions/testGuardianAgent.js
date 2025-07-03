process.env.LOCAL_AGENT_RUN = '1';
const admin = require('firebase-admin');
const { runGuardianCheck } = require('./agents/guardian-agent');

try {
  admin.initializeApp({ projectId: 'demo' });
} catch (e) {
  // ignore if already initialized
}

(async () => {
  const result = await runGuardianCheck({}, 'test-user');
  console.log('Guardian check result:', result);
})();
