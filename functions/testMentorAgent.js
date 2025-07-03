process.env.LOCAL_AGENT_RUN = '1';
const admin = require('firebase-admin');
const { generateMentorTip } = require('./agents/mentor-agent');

try {
  admin.initializeApp({ projectId: 'demo' });
} catch (e) {
  // ignore if already initialized
}

(async () => {
  const tip = await generateMentorTip({ focus: 'general' }, 'test-user');
  console.log('Mentor tip:', tip);
})();
