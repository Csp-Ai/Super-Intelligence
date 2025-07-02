const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const { runAlignmentCheck } = require('../agents/alignment-core');

async function executeAgent({ agentName = 'unknown-agent', version = 'v1.0.0', userId = 'unknown', input = {}, agentFunction }) {
  const start = new Date();
  console.log(`[${start.toISOString()}] Starting ${agentName}`);

  // Collect granular execution steps for debugging and visualization
  const steps = [];
  const addStep = (type, data = {}) => {
    steps.push({
      type,
      timestamp: new Date().toISOString(),
      ...data
    });
  };
  addStep('plan', { input });

  let output;
  let alignment = { alignmentPassed: false, flags: ['agent_error'], notes: '' };
  let errorMsg = '';

  try {
    // allow agent functions to push additional steps via callback
    output = await agentFunction(input, addStep);
    addStep('generate', { output });
    alignment = runAlignmentCheck({ agentName, output, userData: input });
  } catch (err) {
    addStep('error', { message: err.message });
    alignment.notes = err.message;
    errorMsg = err.message;
  }

  const status = alignment.alignmentPassed && !errorMsg ? 'success' : 'error';
  const timestamp = new Date().toISOString();
  const outputSummary = typeof output === 'string' ? output.slice(0, 100) : JSON.stringify(output).slice(0, 100);

  const logEntry = {
    agent: agentName,
    version,
    user: userId,
    status,
    alignment: { passed: alignment.alignmentPassed, flags: alignment.flags },
    timestamp,
    outputSummary,
    steps
  };

  // Firestore logging
  try {
    const db = admin.firestore();
    await db.collection('logs').add(logEntry);
    await db
      .collection('users')
      .doc(userId)
      .collection('agentRuns')
      .add({
        agentName,
        timestamp,
        input,
        output,
        status,
        error: errorMsg,
        resolved: status === 'success',
        steps
      });
  } catch (e) {
    console.error('Failed to write log to Firestore:', e.message);
  }

  // Local fallback logging
  try {
    const logPath = path.join(__dirname, '..', 'logs.json');
    let logs = [];
    if (fs.existsSync(logPath)) {
      const raw = fs.readFileSync(logPath, 'utf8');
      try {
        logs = JSON.parse(raw);
        if (!Array.isArray(logs)) logs = [];
      } catch (_) {
        logs = [];
      }
    }
    logs.push(logEntry);
    fs.writeFileSync(logPath, JSON.stringify(logs, null, 2));
  } catch (e) {
    console.error('Failed to write local log:', e.message);
  }

  if (status === 'error') {
    return { error: errorMsg || 'Output did not pass alignment checks.' };
  }

  return output;
}

module.exports = { executeAgent };
