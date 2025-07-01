const { executeAgent } = require('../utils/agent-wrapper');

async function generateResumeSummary(userData, userId) {
  return executeAgent({
    agentName: 'resume-agent',
    version: 'v1.0.2',
    userId,
    input: userData,
    agentFunction: async (input) => {
      const name = input.fullName || 'User';
      const outcome = input.dreamOutcome || 'your desired goal';
      return `Hi, I'm ${name}. I aim to achieve ${outcome}. I bring strengths in leadership and adaptability.`;
    }
  });
}

module.exports = { generateResumeSummary };
