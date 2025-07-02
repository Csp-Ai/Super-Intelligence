const assert = require('assert');
const express = require('express');
const fs = require('fs');
const path = require('path');
const functionsTest = require('firebase-functions-test')({ projectId: 'demo' });

// Stub firebase-admin before requiring functions
const logsStore = {};
const adminStub = {
  initializeApp: () => {},
  auth: () => ({ verifyIdToken: async () => ({ uid: 'user1', email: 'admin@example.com' }) }),
  firestore: () => ({
    collection: () => ({
      doc: () => ({
        collection: name => ({
          doc: () => ({ get: async () => ({ exists: true }) }),
          add: async entry => {
            const key = `logs-${name}`;
            if (!logsStore[key]) logsStore[key] = [];
            logsStore[key].push(entry);
          }
        }),
        get: async () => ({ exists: true })
      })
    })
  })
};
require.cache[require.resolve('firebase-admin')] = { exports: adminStub };
const admin = require('firebase-admin');
const { JSDOM } = require('jsdom');
const { EventSource } = require('eventsource');

process.env.LOCAL_AGENT_RUN = '1';

const { replayAgentRun } = require('../functions/replayAgentRun');
const { agentSyncSubscribe } = require('../functions/ops/agentSyncSubscribe');

const app = express();
app.use(express.json());
app.post('/replayAgentRun', (req, res) => replayAgentRun(req, res));
app.get('/agentSyncSubscribe', (req, res) => agentSyncSubscribe(req, res));
const server = app.listen(3050, () => console.log('Test server running'));

// Prepare sample steps for ReplayStream
const runId = 'test-run';
const stepsPath = path.join(__dirname, '../functions/steps.json');
fs.writeFileSync(stepsPath, JSON.stringify([
  { runId, stepType: 'plan', timestamp: new Date().toISOString() },
  { runId, stepType: 'execute', timestamp: new Date(Date.now() + 100).toISOString() }
], null, 2));

const dom = new JSDOM('<div id="timeline"></div>');
const document = dom.window.document;

function renderTimeline(steps) {
  const wrapper = document.createElement('div');
  wrapper.className = 'space-y-3 overflow-y-auto max-h-96 pr-2';
  steps.forEach(step => {
    const item = document.createElement('div');
    item.className = 'border-l-2 border-gray-300 pl-4 relative';
    const dot = document.createElement('span');
    dot.className = 'w-2 h-2 bg-blue-500 rounded-full absolute -left-1 top-2';
    item.appendChild(dot);
    const header = document.createElement('div');
    header.className = 'text-xs text-gray-500';
    header.textContent = `${new Date(step.timestamp).toLocaleString()} • ${step.type}`;
    item.appendChild(header);
    wrapper.appendChild(item);
  });
  return wrapper;
}

(async () => {
  const steps = [];
  const timeline = document.getElementById('timeline');
  let lastUpdateDelay = 0;

  const es = new EventSource(
    `http://localhost:3050/agentSyncSubscribe?runId=${runId}&token=dummy`
  );
  let received = 0;
  const expected = ['plan', 'execute'];
  const timeout = setTimeout(() => {
    console.error('No step received within timeout');
    es.close();
    server.close();
    functionsTest.cleanup();
    process.exit(1);
  }, 2000);

  es.onmessage = evt => {
    const start = Date.now();
    const data = JSON.parse(evt.data);
    const step = { type: data.stepType || data.type, timestamp: data.timestamp };
    steps.push(step);
    timeline.innerHTML = '';
    timeline.appendChild(renderTimeline(steps));
    lastUpdateDelay = Date.now() - start;
    assert.strictEqual(step.type, expected[received]);
    received++;
    if (received === expected.length) {
      clearTimeout(timeout);
      es.close();
      server.close();
      if (lastUpdateDelay > 500) throw new Error('Timeline update exceeded 500ms');
      const lastItem = timeline.lastElementChild;
      if (!lastItem.querySelector('span') || !lastItem.querySelector('div')) {
        throw new Error('Timeline entry missing visual elements');
      }

      // verify replay log structure
      const logPath = path.join(__dirname, '../functions/replayLogs.json');
      const rawLogs = fs.readFileSync(logPath, 'utf8');
      const logs = JSON.parse(rawLogs)[runId];
      assert.ok(Array.isArray(logs) && logs.length > 0);
      assert.strictEqual(logs[0].event, 'stream');
      assert.strictEqual(logs[0].params.speed, 2);

      console.log('E2E replay test passed');
      functionsTest.cleanup();
    }
  };

  await fetch('http://localhost:3050/replayAgentRun', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer fake',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ runId, action: 'stream', speed: 2 })
  });
})();
