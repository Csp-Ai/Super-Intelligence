const { executeAgent } = require('../utils/agent-wrapper');

async function generateOpportunities(userData, userId) {
  return executeAgent({
    agentName: 'opportunity-agent',
    version: 'v1.0.2',
    userId,
    input: userData,
    agentFunction: async () => {
      return [
        { title: 'Future Leaders Scholarship', link: 'https://example.com' },
        { title: 'Tech for Impact Internship', link: 'https://example.com' },
        { title: 'Equity Accelerator Program', link: 'https://example.com' }
      ];
    }
  });
}

module.exports = { generateOpportunities };
