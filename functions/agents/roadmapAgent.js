const { runAlignmentCheck } = require('./alignment-core');

function generateRoadmap(userData) {
  const roadmap = [
    { phase: 'Discover', description: 'Research scholarships and career paths.' },
    { phase: 'Build', description: 'Create resume and develop key skills.' },
    { phase: 'Launch', description: 'Apply to programs and prepare for interviews.' }
  ];

  // Run alignment check and log result
  runAlignmentCheck({ agentName: 'roadmap-agent', output: roadmap, userData });

  return roadmap;
}

module.exports = { generateRoadmap };
