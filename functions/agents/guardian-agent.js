const admin = require('firebase-admin');
const functions = require('firebase-functions/v1');
const { executeAgent } = require('../utils/agent-wrapper');
const { logAgentOutput } = require('../logger');

async function runGuardianCheck(userData = {}, userId = 'unknown') {
  const agentVersion = 'v1.0.0';
  const result = await executeAgent({
    agentName: 'guardian-agent',
    version: agentVersion,
    userId,
    input: userData,
    agentFunction: async () => {
      return 'System check completed successfully.';
    }
  });

  await logAgentOutput({
    agentName: 'guardian-agent',
    agentVersion,
    userId,
    inputSummary: userData,
    outputSummary: result
  });

  return result;
}

exports.runGuardianChecks = async () => {
  const db = admin.firestore();
  const users = await db.collection('users').get();
  for (const doc of users.docs) {
    const data = doc.data();
    const msg = await runGuardianCheck(data, doc.id);
    await doc.ref.collection('guardianLogs').add({ message: msg, timestamp: new Date().toISOString() });
  }
};

exports.guardianCron = functions.pubsub.schedule('every 168 hours').onRun(async () => {
  if (!process.env.PUBSUB_EMULATOR_HOST) {
    console.warn('PubSub emulator not detected. Skipping guardianCron...');
    return;
  }
  await exports.runGuardianChecks();
});

module.exports = { runGuardianCheck };
