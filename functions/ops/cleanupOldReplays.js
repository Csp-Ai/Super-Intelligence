const admin = require('firebase-admin');
const functions = require('firebase-functions');

/**
 * Scheduled cleanup for replay logs.
 * Deletes logs older than 7 days unless persist is true.
 * Skips runs that received AgentSync updates in the last 5 minutes.
 */
exports.cleanupOldReplays = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async () => {
    const db = admin.firestore();
    const usersSnap = await db.collection('users').get();
    const now = Date.now();
    const threshold = new Date(now - 7 * 24 * 60 * 60 * 1000);

    for (const user of usersSnap.docs) {
      const runsSnap = await user.ref.collection('agentRuns').get();
      for (const run of runsSnap.docs) {
        const runId = run.id;
        const syncDoc = await db.collection('agentSync').doc(runId).get();
        const latest = syncDoc.data()?.latest?._timestamp;
        if (latest && now - new Date(latest).getTime() < 5 * 60 * 1000) {
          continue; // still streaming
        }
        const logsSnap = await run.ref
          .collection('replayLogs')
          .where('timestamp', '<', threshold.toISOString())
          .get();
        for (const log of logsSnap.docs) {
          if (log.data().persist) continue;
          await log.ref.delete();
        }
      }
    }
  });

