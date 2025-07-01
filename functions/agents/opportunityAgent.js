const { runAlignmentCheck } = require('./alignment-core');

function generateOpportunities(userData) {
  const opportunities = [
    { title: 'Future Leaders Scholarship', link: 'https://example.com' },
    { title: 'Tech for Impact Internship', link: 'https://example.com' },
    { title: 'Equity Accelerator Program', link: 'https://example.com' }
  ];

  // Run alignment check and log result
  runAlignmentCheck({ agentName: 'opportunity-agent', output: opportunities, userData });

  return opportunities;
}

module.exports = { generateOpportunities };
