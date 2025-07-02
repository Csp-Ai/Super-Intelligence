const { executeAgent } = require('../utils/agent-wrapper');

async function generateRoadmap(userData, userId = 'unknown') {
  return executeAgent({
    agentName: 'roadmap-agent',
    version: 'v1.0.2',
    userId,
    input: userData,
    agentFunction: async () => {
      return [
        { phase: 'Discover', description: 'Research scholarships and career paths.' },
        { phase: 'Build', description: 'Create resume and develop key skills.' },
        { phase: 'Launch', description: 'Apply to programs and prepare for interviews.' }
      ];
    }
  });
}

module.exports = { generateRoadmap };

