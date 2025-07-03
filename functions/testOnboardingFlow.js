process.env.LOCAL_AGENT_RUN = '1';
const { formatAgentInput } = require('./onboardUser');
const { runAgentFlow } = require('./core/agentFlowEngine');
const flows = require('../flows');

(async () => {
  const input = formatAgentInput({
    fullName: 'Test User',
    email: 'test@example.com',
    dreamOutcome: 'be legendary',
    skills: 'coding,design'
  });
  const result = await runAgentFlow(flows.onboarding, { userId: 'test-user', input });
  console.log('roadmap', result.roadmap);
  console.log('resume', result.resume);
  console.log('opportunities', result.opportunities);
})();
