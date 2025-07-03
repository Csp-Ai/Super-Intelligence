const { executeAgent } = require('../utils/agent-wrapper');
const { translateOutput } = require('../utils/aas-translate');

async function generateRoadmap(userData, userId = 'unknown', metadata = {}) {
  const result = await executeAgent({
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

  let finalOutput = result;
  if (metadata.locale && metadata.locale !== 'en') {
    try {
      finalOutput = await translateOutput(result, metadata.locale);
    } catch (err) {
      console.error('roadmap-agent translation failed', err);
    }
  }

  return finalOutput;
}

module.exports = { generateRoadmap };
