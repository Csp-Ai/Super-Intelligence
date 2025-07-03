const { executeAgent } = require('../utils/agent-wrapper');
const { logAgentOutput } = require('../logger');
const { translateOutput } = require('../utils/aas-translate');

/**
 * Core resume summary generation logic.
 * This can be reused independently of the agent wrapper.
 * @param {Object} data
 * @returns {Promise<string>}
 */
async function resumeSummaryCore(data = {}) {
  const name = data.fullName || 'User';
  const outcome = data.dreamOutcome || 'your desired goal';
  return `Hi, I'm ${name}. I aim to achieve ${outcome}. I bring strengths in leadership and adaptability.`;
}

/**
 * Generate a short resume summary for the given user.
 *
 * @param {Object} userData - Raw user profile information
 * @param {string} userId - UID or email
 * @param {Object} [metadata] - Optional agent metadata
 * @param {string} [metadata.agentVersion] - Version string for logging
 * @param {boolean} [metadata.useWrapper=true] - Whether to run through executeAgent
 * @returns {Promise<string>} Resume summary output
 */
async function generateResumeSummary(userData = {}, userId = 'unknown', metadata = {}) {
  const agentName = 'resume-agent';
  const agentVersion = metadata.agentVersion || 'v1.0.3';
  const useWrapper = metadata.useWrapper !== false; // default true

  const agentFn = async (input) => resumeSummaryCore(input);

  // Execute directly or via wrapper for consistency with other agents
  const summary = useWrapper
    ? await executeAgent({ agentName, version: agentVersion, userId, input: userData, agentFunction: agentFn })
    : await agentFn(userData);

  let finalOutput = summary;
  if (metadata.locale && metadata.locale !== 'en') {
    try {
      finalOutput = await translateOutput(summary, metadata.locale);
    } catch (err) {
      console.error('resume-agent translation failed', err);
    }
  }

  // Log input and output using modular logger
  try {
    await logAgentOutput({
      agentName,
      agentVersion,
      userId,
      inputSummary: userData,
      outputSummary: finalOutput
    });
  } catch (err) {
    console.error('resume-agent logging failed', err);
  }

  return finalOutput;
}

module.exports = { generateResumeSummary, resumeSummaryCore };
