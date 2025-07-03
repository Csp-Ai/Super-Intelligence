process.env.LOCAL_AGENT_RUN = '1';
const admin = require('firebase-admin');
const { generateAcademicMentorTip } = require('./agents/mentor-agent-academic');

try {
  admin.initializeApp({ projectId: 'demo' });
} catch (e) {
  // ignore if already initialized
}

(async () => {
  const tip = await generateAcademicMentorTip({}, 'test-user');
  console.log('Academic mentor tip:', tip);
})();
