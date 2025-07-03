const { generateMentorTip } = require('./mentor-agent');

exports.generateDanceMentorTip = async (userData = {}, userId = 'unknown') => {
  const input = { ...userData, focus: userData.focus || 'dance' };
  return generateMentorTip(input, userId);
};
