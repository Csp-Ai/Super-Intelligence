const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const { runAlignmentCheck } = require('../agents/alignment-core');
const { createStepLogger } = require('./step-logger');

async function executeAgent({ agentName = 'unknown-agent', version = 'v1.0.0', userId = 'unknown', input = {}, agentFunction }) {
  const startTime = Date.now();
  const startIso = new Date(startTime).toISOString();
  console.log(`[${startIso}] Starting ${agentName}`);

  let db;
  let runRef;
  if (!process.env.LOCAL_AGENT_RUN) {
    try {
      db = admin.firestore();
      runRef = await db.collection('users').doc(userId).collection('agentRuns').add({
        agentName,
        version,
        input,
        timestamp: startIso,
        status: 'running'
      });
    } catch (err) {
      console.error('Failed to create run doc', err.message);
      process.env.LOCAL_AGENT_RUN = '1';
      runRef = { id: `local-${Date.now()}` };
    }
  } else {
    runRef = { id: `local-${Date.now()}` };
  }

  const runId = runRef && runRef.id ? runRef.id : `local-${Date.now()}`;
  const logStep = createStepLogger({ userId, runId, agentName });
  await logStep({ stepType: 'start', input });

  let output;
  let alignment = { alignmentPassed: false, flags: ['agent_error'], notes: '' };
  let errorMsg = '';

  try {
    const execStart = Date.now();
    output = await agentFunction(input, logStep);
    await logStep({ stepType: 'execute', input, output, durationMs: Date.now() - execStart });
    alignment = runAlignmentCheck({ agentName, output, userData: input });
    await logStep({ stepType: 'alignment', input: output, output: alignment });
  } catch (err) {
    alignment.notes = err.message;
    errorMsg = err.message;
    await logStep({ stepType: 'error', input, output: err.message });
  }

  const status = alignment.alignmentPassed && !errorMsg ? 'success' : 'error';
  const endIso = new Date().toISOString();
  const outputSummary = typeof output === 'string' ? output.slice(0, 100) : JSON.stringify(output).slice(0, 100);

  const logEntry = {
    agent: agentName,
    version,
    user: userId,
    status,
    alignment: { passed: alignment.alignmentPassed, flags: alignment.flags },
    timestamp: endIso,
    outputSummary
  };

  if (!process.env.LOCAL_AGENT_RUN) {
    try {
      await db.collection('logs').add(logEntry);
      if (runRef) {
        await runRef.set({ output, status, error: errorMsg, resolved: status === 'success', timestamp: endIso }, { merge: true });
      }
    } catch (e) {
      console.error('Failed to write log to Firestore:', e.message);
    }
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

  await logStep({ stepType: 'complete', output, durationMs: Date.now() - startTime });

  if (status === 'error') {
    return { error: errorMsg || 'Output did not pass alignment checks.' };
  }

  return output;
}

module.exports = { executeAgent };
