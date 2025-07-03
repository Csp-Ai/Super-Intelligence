const { generateMentorTip } = require('./mentor-agent');

exports.generateAcademicMentorTip = async (userData = {}, userId = 'unknown') => {
  const input = { ...userData, focus: userData.focus || 'academic' };
  return generateMentorTip(input, userId);
};
