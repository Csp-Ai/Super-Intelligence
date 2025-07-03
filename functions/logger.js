const admin = require('firebase-admin');
const fs = require('fs/promises');
const path = require('path');

const logFilePath = path.join(__dirname, 'logs.json');

/**
 * Log agent execution details to Firestore and local file.
 * @param {Object} params
 * @param {string} params.agentName
 * @param {string} params.agentVersion
 * @param {string} params.userId - UID or email
 * @param {*} params.inputSummary - Summary of inputs
 * @param {*} params.outputSummary - Summary of outputs
 */
async function logAgentOutput({
  agentName,
  agentVersion,
  userId,
  inputSummary,
  outputSummary,
  feedback
}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    agentName,
    agentVersion,
    userId,
    inputSummary,
    outputSummary
  };

  if (feedback) {
    const ratingNum = Number(feedback.rating);
    if (feedback.rating != null && (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5)) {
      throw new Error('Invalid rating');
    }
    logEntry.feedback = {
      rating: ratingNum,
      comment: feedback.comment || '',
      submittedAt: feedback.submittedAt || new Date().toISOString()
    };
  }

  // Write to Firestore collection 'logs'
  if (!process.env.LOCAL_AGENT_RUN) {
    try {
      const db = admin.firestore();
      await db.collection('logs').add(logEntry);
    } catch (err) {
      console.error('Failed to write log to Firestore', err);
    }
  }

  // Append to local logs.json file
  try {
    let logs = [];
    try {
      const content = await fs.readFile(logFilePath, 'utf8');
      logs = JSON.parse(content);
      if (!Array.isArray(logs)) logs = [];
    } catch (e) {
      // File might not exist or JSON might be invalid
      logs = [];
    }

    logs.push(logEntry);
    await fs.writeFile(logFilePath, JSON.stringify(logs, null, 2));
  } catch (err) {
    console.error('Failed to write log to local file', err);
  }
}

module.exports = { logAgentOutput };
