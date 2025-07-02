const { executeAgent } = require('../utils/agent-wrapper');
const { logAgentOutput } = require('../logger');

/**
 * Generate a list of opportunities for the user.
 * @param {Object} userData - User profile data
 * @param {string} userId - Firebase UID
 * @param {Object} metadata - Optional metadata to log
 */
async function generateOpportunities(userData = {}, userId = 'unknown', metadata = {}) {
  const agentVersion = 'v1.0.3';

  const result = await executeAgent({
    agentName: 'opportunity-agent',
    version: agentVersion,
    userId,
    input: userData,
    agentFunction: async (input) => {
      const field = input.focus || 'general';
      return [
        { title: `${field} Scholarship`, link: 'https://example.com' },
        { title: `${field} Internship`, link: 'https://example.com' },
        { title: `${field} Grant`, link: 'https://example.com' }
      ];
    }
  });

  await logAgentOutput({
    agentName: 'opportunity-agent',
    agentVersion,
    userId,
    inputSummary: metadata,
    outputSummary: Array.isArray(result) ? result.map(o => o.title) : result
  });

  return result;
}

module.exports = { generateOpportunities };
