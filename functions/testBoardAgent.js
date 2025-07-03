process.env.LOCAL_AGENT_RUN = '1';
const admin = require('firebase-admin');
const { generateBoardSummary } = require('./agents/board-agent');

try {
  admin.initializeApp({ projectId: 'demo' });
} catch (e) {
  // ignore if already initialized
}

(async () => {
  const summary = await generateBoardSummary({ project: 'demo' }, 'test-user');
  console.log('Board summary:', summary);
})();
