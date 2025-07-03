const admin = require('firebase-admin');
const functions = require('firebase-functions/v1');
const { executeAgent } = require('../utils/agent-wrapper');
const { logAgentOutput } = require('../logger');

async function generateMentorTip(userData = {}, userId = 'unknown') {
  const agentVersion = 'v1.0.0';
  const result = await executeAgent({
    agentName: 'mentor-agent',
    version: agentVersion,
    userId,
    input: userData,
    agentFunction: async (input) => {
      const topic = input.focus || 'general';
      return `Here is your weekly ${topic} mentoring tip.`;
    }
  });

  await logAgentOutput({
    agentName: 'mentor-agent',
    agentVersion,
    userId,
    inputSummary: userData,
    outputSummary: result
  });

  return result;
}

exports.runMentorTips = async () => {
  const db = admin.firestore();
  const users = await db.collection('users').get();
  for (const doc of users.docs) {
    const data = doc.data();
    const tip = await generateMentorTip(data, doc.id);
    await doc.ref.collection('mentorTips').add({ tip, timestamp: new Date().toISOString() });
  }
};

exports.mentorCron = functions.pubsub.schedule('every 168 hours').onRun(async () => {
  if (!process.env.PUBSUB_EMULATOR_HOST) {
    console.warn('PubSub emulator not detected. Skipping mentorCron...');
    return;
  }
  await exports.runMentorTips();
});

module.exports = { generateMentorTip };
