const admin = require('firebase-admin');
process.env.LOCAL_AGENT_RUN = '1';
const { generateOpportunities } = require('./agents/opportunityAgent');

// Initialize Firebase app for local testing if not already initialized
try {
  admin.initializeApp({ projectId: 'demo' });
} catch (e) {
  // ignore if already initialized or failure
}

(async () => {
  const output = await generateOpportunities({ focus: 'tech' }, 'test-user');
  console.log('Generated opportunities:', output);
})();
