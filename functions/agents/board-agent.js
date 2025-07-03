const admin = require('firebase-admin');
const functions = require('firebase-functions/v1');
const { executeAgent } = require('../utils/agent-wrapper');
const { logAgentOutput } = require('../logger');

async function generateBoardSummary(userData = {}, userId = 'unknown') {
  const agentVersion = 'v1.0.0';
  const result = await executeAgent({
    agentName: 'board-agent',
    version: agentVersion,
    userId,
    input: userData,
    agentFunction: async (input) => {
      const project = input.project || 'general';
      return `Weekly board summary for ${project}.`;
    }
  });

  await logAgentOutput({
    agentName: 'board-agent',
    agentVersion,
    userId,
    inputSummary: userData,
    outputSummary: result
  });

  return result;
}

exports.runBoardSummaries = async () => {
  const db = admin.firestore();
  const users = await db.collection('users').get();
  for (const doc of users.docs) {
    const data = doc.data();
    const summary = await generateBoardSummary(data, doc.id);
    await doc.ref.collection('boardSummaries').add({ summary, timestamp: new Date().toISOString() });
  }
};

exports.boardCron = functions.pubsub.schedule('every 168 hours').onRun(async () => {
  if (!process.env.PUBSUB_EMULATOR_HOST) {
    console.warn('PubSub emulator not detected. Skipping boardCron...');
    return;
  }
  await exports.runBoardSummaries();
});

module.exports = { generateBoardSummary };
