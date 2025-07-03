process.env.LOCAL_AGENT_RUN = '1';
const admin = require('firebase-admin');
const { generateHybridBoardSummary } = require('./agents/board-agent-hybrid');

try {
  admin.initializeApp({ projectId: 'demo' });
} catch (e) {
  // ignore if already initialized
}

(async () => {
  const summary = await generateHybridBoardSummary({ project: 'hybrid' }, 'test-user');
  console.log('Hybrid board summary:', summary);
})();
