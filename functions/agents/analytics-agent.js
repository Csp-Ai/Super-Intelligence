const admin = require('firebase-admin');
const functions = require('firebase-functions/v1');

/**
 * Store UI interaction analytics.
 * @param {Object} payload
 * @param {string} payload.eventName - Event identifier
 * @param {string} payload.userId - UID or email
 * @param {string} [payload.timestamp] - ISO timestamp
 * @returns {Promise<{status:string}>}
 */
async function logInteraction(payload = {}) {
  const { eventName, userId, timestamp = new Date().toISOString() } = payload;
  if (!eventName || !userId) {
    throw new Error('eventName and userId required');
  }
  if (process.env.LOCAL_AGENT_RUN) {
    return { status: 'skipped' };
  }
  const db = admin.firestore();
  await db.collection('analytics')
    .doc(userId)
    .collection(eventName)
    .add({ ...payload, timestamp });
  return { status: 'logged' };
}

exports.analyticsAgent = functions.https.onCall(async (data, context) => {
  const userId = data.userId || (context.auth && context.auth.uid);
  const eventName = data.eventName;
  const timestamp = data.timestamp || new Date().toISOString();
  if (!userId || !eventName) {
    throw new functions.https.HttpsError('invalid-argument', 'userId and eventName required');
  }
  await logInteraction({ ...data, userId, eventName, timestamp });
  return { status: 'ok' };
});

module.exports = { logInteraction };
