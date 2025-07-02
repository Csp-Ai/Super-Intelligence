const admin = require('firebase-admin');
process.env.LOCAL_AGENT_RUN = '1';
const fs = require('fs');
const path = require('path');
const { computeReplaySummary } = require('./summarizeReplayLogs');

try {
  admin.initializeApp({ projectId: 'demo' });
} catch (_) {}

(async () => {
  const runId = 'summary-test-run';
  const logPath = path.join(__dirname, 'replayLogs.json');
  const logs = {};
  logs[runId] = [
    { timestamp: '2023-01-01T00:00:00.000Z', action: 'start', state: { currentStep: 0, total: 2 } },
    { timestamp: '2023-01-01T00:00:01.000Z', action: 'step', state: { currentStep: 1, total: 2 } },
    { timestamp: '2023-01-01T00:00:02.000Z', action: 'step', state: { currentStep: 2, total: 2 } },
    { timestamp: '2023-01-01T00:00:03.000Z', action: 'pause', state: { currentStep: 2, total: 2 }, error: 'boom' }
  ];
  fs.writeFileSync(logPath, JSON.stringify(logs, null, 2));

  const summary = await computeReplaySummary(runId, 'user1');
  console.log('Replay summary:', summary);
  if (summary.totalSteps !== 2) throw new Error('totalSteps mismatch');
  if (summary.actionCount !== 4) throw new Error('actionCount mismatch');
  if (summary.errorCount !== 1) throw new Error('errorCount mismatch');
  if (typeof summary.durationMs !== 'number') throw new Error('duration type');
})();
