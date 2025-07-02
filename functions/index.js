const functions = require('firebase-functions');
const admin = require('firebase-admin');

const { generateRoadmap } = require('./agents/roadmapAgent');
const { generateResumeSummary } = require('./agents/resumeAgent');
const { generateOpportunities } = require('./agents/opportunityAgent');

admin.initializeApp();
const db = admin.firestore();

exports.handleNewUser = functions.firestore
  .document('users/{userId}')
  .onCreate(async (snap, context) => {
    const userData = snap.data();
    const userId = context.params.userId;

    const roadmap = await generateRoadmap(userData, userId);
    const resume = await generateResumeSummary(userData, userId);
    const opportunities = await generateOpportunities(userData, userId);

    await db.collection('users').doc(userId).collection('roadmap').add({ roadmap });
    await db.collection('users').doc(userId).collection('resume').add({ summary: resume });
    await db.collection('users').doc(userId).collection('opportunities').add({ opportunities });
  });
