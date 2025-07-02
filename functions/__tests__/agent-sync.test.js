const assert = require('assert');
process.env.LOCAL_AGENT_RUN = '1';

const { registerAgent, publish, subscribe } = require('../utils/agent-sync');

async function runTest() {
  registerAgent('test-agent');
  const runId = 'run-1';
  const payload = { foo: 'bar' };

  const received = await new Promise(resolve => {
    subscribe(runId, data => resolve(data));
    publish(runId, payload);
  });

  assert.strictEqual(received.foo, 'bar');
  assert.strictEqual(received._agentId, 'test-agent');
  console.log('AgentSync test passed');
}

runTest().catch(err => {
  console.error('AgentSync test failed', err);
  process.exit(1);
});
