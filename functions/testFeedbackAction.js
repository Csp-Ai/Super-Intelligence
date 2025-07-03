const admin = require('firebase-admin');
process.env.LOCAL_AGENT_RUN = '1';
const { handleReplayAction } = require('./replayAgentRun');

try {
  admin.initializeApp({ projectId: 'demo' });
} catch (_) {}

(async () => {
  const res = await handleReplayAction({
    userId: 'test-user',
    runId: 'feedback-run',
    action: 'feedback',
    rating: 4,
    comment: 'nice job'
  });
  console.log('Feedback action:', res);
})();
