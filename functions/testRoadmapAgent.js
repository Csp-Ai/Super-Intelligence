const admin = require('firebase-admin');
const { generateRoadmap } = require('./agents/roadmapAgent');

// Initialize Firebase app for local testing if not already initialized
try {
  admin.initializeApp();
} catch (e) {
  // ignore if already initialized or failure
}

(async () => {
  const output = await generateRoadmap({ goal: 'learn AI' }, 'test-user');
  console.log('Generated roadmap:', output);
})();
