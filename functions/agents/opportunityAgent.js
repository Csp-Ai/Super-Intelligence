const { executeAgent } = require('../utils/agent-wrapper');
const { logAgentOutput } = require('../logger');
const { translateOutput } = require('../utils/aas-translate');

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

  let finalOutput = result;
  if (metadata.locale && metadata.locale !== 'en') {
    try {
      finalOutput = await translateOutput(result, metadata.locale);
    } catch (err) {
      console.error('opportunity-agent translation failed', err);
    }
  }

  await logAgentOutput({
    agentName: 'opportunity-agent',
    agentVersion,
    userId,
    inputSummary: metadata,
    outputSummary: Array.isArray(finalOutput) ? finalOutput.map(o => o.title) : finalOutput
  });

  return finalOutput;
}

module.exports = { generateOpportunities };
