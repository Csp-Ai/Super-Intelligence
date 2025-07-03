process.env.LOCAL_AGENT_RUN = '1';
const admin = require('firebase-admin');
const { generateDanceMentorTip } = require('./agents/mentor-agent-dance');

try {
  admin.initializeApp({ projectId: 'demo' });
} catch (e) {
  // ignore if already initialized
}

(async () => {
  const tip = await generateDanceMentorTip({}, 'test-user');
  console.log('Dance mentor tip:', tip);
})();
