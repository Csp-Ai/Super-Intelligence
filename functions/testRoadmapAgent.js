const admin = require('firebase-admin');
process.env.LOCAL_AGENT_RUN = '1';
const { generateRoadmap } = require('./agents/roadmapAgent');

// Initialize Firebase app for local testing if not already initialized
try {
  admin.initializeApp({ projectId: 'demo' });
} catch (e) {
  // ignore if already initialized or failure
}

(async () => {
  const output = await generateRoadmap({ goal: 'learn AI' }, 'test-user');
  console.log('Generated roadmap:', output);
})();
