const { runFlowCareer } = require('../functions/flows/flow-career');
process.env.LOCAL_AGENT_RUN = '1';

(async () => {
  const runId = Date.now().toString();
  const sample = {
    fullName: 'Test Runner',
    dreamOutcome: 'secure a great job',
    focus: 'engineering'
  };
  const result = await runFlowCareer(sample, runId, { userId: 'cli-user' });
  console.log('Flow result for', runId, result);
})();
