const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { generateRoadmap } = require('../agents/roadmapAgent');
const { generateResumeSummary } = require('../agents/resumeAgent');
const { generateOpportunities } = require('../agents/opportunityAgent');
const { logAgentOutput } = require('../logger');
const { formatAgentInput } = require('../onboardUser');

const db = admin.firestore();

exports.onCreateUser = functions.firestore
  .document('users/{uid}')
  .onCreate(async (snap, context) => {
    const uid = context.params.uid;
    const rawData = snap.data();

    await snap.ref.update({ status: 'running' });
    const input = formatAgentInput(rawData);

    try {
      const roadmap = await generateRoadmap(input, uid);
      await logAgentOutput({
        agentName: 'roadmap-agent',
        agentVersion: 'v1.0.2',
        userId: uid,
        inputSummary: input,
        outputSummary: roadmap
      });
      await snap.ref.collection('roadmap').add({ roadmap });

      const resume = await generateResumeSummary(input, uid);
      await snap.ref.collection('resume').add({ summary: resume });

      const opportunities = await generateOpportunities(input, uid);
      await snap.ref.collection('opportunities').add({ opportunities });

      await snap.ref.update({ status: 'success' });
    } catch (err) {
      console.error('onCreateUser error', err);
      await snap.ref.update({ status: 'error', error: err.message });
    }
  });
