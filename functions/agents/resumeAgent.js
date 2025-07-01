const { runAlignmentCheck } = require('./alignment-core');

function generateResumeSummary(userData) {
  const name = userData.fullName || 'User';
  const outcome = userData.dreamOutcome || 'your desired goal';
  const summary = `Hi, I'm ${name}. I aim to achieve ${outcome}. I bring strengths in leadership and adaptability.`;

  // Run alignment check and log result
  runAlignmentCheck({ agentName: 'resume-agent', output: summary, userData });

  return summary;
}

module.exports = { generateResumeSummary };
