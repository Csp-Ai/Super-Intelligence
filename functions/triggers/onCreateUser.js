const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');
const { runAgentFlow } = require('../../core/agentFlowEngine');
const flows = require('../../flows');
const { logAgentOutput } = require('../logger');
const { formatAgentInput } = require('../onboardUser');

const db = admin.firestore();

exports.onCreateUser = functions.firestore
  .document('users/{uid}')
  .onCreate(async (snap, context) => {
    if (!process.env.FIRESTORE_EMULATOR_HOST) {
      console.warn('Firestore emulator not detected. Skipping onCreateUser...');
      return;
    }
    const uid = context.params.uid;
    const rawData = snap.data();

    await snap.ref.update({ status: 'running' });
    const input = formatAgentInput(rawData);

    try {
      const result = await runAgentFlow(flows.onboarding, { userId: uid, input });

      await logAgentOutput({
        agentName: 'roadmap-agent',
        agentVersion: 'v1.0.2',
        userId: uid,
        inputSummary: input,
        outputSummary: result.roadmap
      });

      await snap.ref.collection('roadmap').add({ roadmap: result.roadmap });
      await snap.ref.collection('resume').add({ summary: result.resume });
      await snap.ref.collection('opportunities').add({ opportunities: result.opportunities });

      await snap.ref.update({ status: 'success' });
    } catch (err) {
      console.error('onCreateUser error', err);
      await snap.ref.update({ status: 'error', error: err.message });
    }
  });
