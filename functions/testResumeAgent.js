const admin = require('firebase-admin');
process.env.LOCAL_AGENT_RUN = '1';
const { generateResumeSummary } = require('./agents/resumeAgent');

// Initialize Firebase app for local testing if not already initialized
try {
  admin.initializeApp({ projectId: 'demo' });
} catch (e) {
  // ignore if already initialized or failure
}

(async () => {
  const output = await generateResumeSummary(
    { fullName: 'Test Runner', dreamOutcome: 'land an amazing role' },
    'test-user'
  );
  console.log('Generated summary:', output);
})();
