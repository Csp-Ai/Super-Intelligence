const admin = require('firebase-admin');
const functions = require('firebase-functions/v1');

/**
 * Increment activity metrics for an agent.
 * Requires auth and agentId param.
 */
exports.trainAgent = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
  }
  const agentId = data.agentId;
  if (!agentId) {
    throw new functions.https.HttpsError('invalid-argument', 'agentId required');
  }
  const db = admin.firestore();
  await db.collection('agents').doc(agentId).set({
    activity: admin.firestore.FieldValue.increment(1),
    connections: admin.firestore.FieldValue.increment(1)
  }, { merge: true });
  return { status: 'ok' };
});
