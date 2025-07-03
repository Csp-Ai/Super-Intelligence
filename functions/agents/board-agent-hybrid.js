const { generateBoardSummary } = require('./board-agent');

exports.generateHybridBoardSummary = async (userData = {}, userId = 'unknown') => {
  const input = { ...userData, project: userData.project || 'hybrid' };
  return generateBoardSummary(input, userId);
};
