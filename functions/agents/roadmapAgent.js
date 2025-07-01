const { logAgentOutput } = require('../logger');

function generateRoadmap(userData, { userId = 'unknown', agentVersion = '1.0.0' } = {}) {
  const roadmap = [
    { phase: 'Discover', description: 'Research scholarships and career paths.' },
    { phase: 'Build', description: 'Create resume and develop key skills.' },
    { phase: 'Launch', description: 'Apply to programs and prepare for interviews.' }
  ];

  // Log execution details
  logAgentOutput({
    agentName: 'roadmap-agent',
    agentVersion,
    userId,
    inputSummary: userData,
    outputSummary: roadmap
  });

  return roadmap;
}

module.exports = { generateRoadmap };
