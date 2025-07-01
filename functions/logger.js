const admin = require('firebase-admin');
const fs = require('fs');
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
  outputSummary
}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    agentName,
    agentVersion,
    userId,
    inputSummary,
    outputSummary
  };

  // Write to Firestore collection 'logs'
  try {
    const db = admin.firestore();
    await db.collection('logs').add(logEntry);
  } catch (err) {
    console.error('Failed to write log to Firestore', err);
  }

  // Append to local logs.json file
  try {
    let logs = [];
    if (fs.existsSync(logFilePath)) {
      const content = fs.readFileSync(logFilePath, 'utf8');
      try {
        logs = JSON.parse(content);
        if (!Array.isArray(logs)) logs = [];
      } catch (e) {
        logs = [];
      }
    }
    logs.push(logEntry);
    fs.writeFileSync(logFilePath, JSON.stringify(logs, null, 2));
  } catch (err) {
    console.error('Failed to write log to local file', err);
  }
}

module.exports = { logAgentOutput };
