const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

function createStepLogger({ userId = 'unknown', runId = '', agentName = 'agent' }) {
  const localPath = path.join(__dirname, '..', 'steps.json');

  async function writeLocal(entry) {
    let arr = [];
    if (fs.existsSync(localPath)) {
      try {
        arr = JSON.parse(fs.readFileSync(localPath, 'utf8'));
        if (!Array.isArray(arr)) arr = [];
      } catch (_) {
        arr = [];
      }
    }
    arr.push({ agent: agentName, runId, ...entry });
    fs.writeFileSync(localPath, JSON.stringify(arr, null, 2));
  }

  return async function logStep({ stepType, input, output, durationMs }) {
    const entry = { stepType, timestamp: new Date().toISOString() };
    if (input !== undefined) entry.input = input;
    if (output !== undefined) entry.output = output;
    if (durationMs !== undefined) entry.durationMs = durationMs;

    if (process.env.LOCAL_AGENT_RUN) {
      console.log('STEP', stepType, entry);
      await writeLocal(entry);
    } else {
      try {
        const db = admin.firestore();
        await db
          .collection('users')
          .doc(userId)
          .collection('agentRuns')
          .doc(runId)
          .collection('steps')
          .add(entry);
      } catch (err) {
        console.error('step log failed', err.message);
      }
    }
  };
}

module.exports = { createStepLogger };
