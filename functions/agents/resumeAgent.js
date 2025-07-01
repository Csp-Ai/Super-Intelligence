function generateResumeSummary(userData) {
  const name = userData.fullName || 'User';
  const outcome = userData.dreamOutcome || 'your desired goal';
  return `Hi, I'm ${name}. I aim to achieve ${outcome}. I bring strengths in leadership and adaptability.`;
}

module.exports = { generateResumeSummary };
