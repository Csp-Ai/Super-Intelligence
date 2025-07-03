const admin = require('firebase-admin');
process.env.LOCAL_AGENT_RUN = '1';
const { generateOpportunities } = require('./agents/opportunityAgent');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

// Initialize Firebase app for local testing if not already initialized
try {
  admin.initializeApp({ projectId: 'demo' });
} catch (e) {
  // ignore if already initialized or failure
}

(async () => {
  const input = { focus: 'tech' };
  const output = await generateOpportunities(input, 'test-user');
  console.log('Generated opportunities:', output);

  const logPath = path.join(__dirname, 'logs.json');
  const logs = JSON.parse(fs.readFileSync(logPath, 'utf8'));
  const last = logs[logs.length - 1];
  assert.strictEqual(last.agentName, 'opportunity-agent');
  assert.deepStrictEqual(last.inputSummary, input);
  console.log('Input summary logged correctly');
})();
