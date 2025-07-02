function formatAgentInput(data = {}) {
  return {
    fullName: data.fullName || '',
    email: data.email || '',
    dreamOutcome: data.dreamOutcome || '',
    skills: Array.isArray(data.skills)
      ? data.skills
      : typeof data.skills === 'string'
      ? data.skills.split(',').map(s => s.trim()).filter(Boolean)
      : []
  };
}

module.exports = { formatAgentInput };
