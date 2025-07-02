const { formatAgentInput } = require('./onboardUser');
const { generateRoadmap } = require('./agents/roadmapAgent');
const { generateResumeSummary } = require('./agents/resumeAgent');
const { generateOpportunities } = require('./agents/opportunityAgent');

(async () => {
  const input = formatAgentInput({
    fullName: 'Test User',
    email: 'test@example.com',
    dreamOutcome: 'be legendary',
    skills: 'coding,design'
  });
  const roadmap = await generateRoadmap(input, 'test-user');
  const resume = await generateResumeSummary(input, 'test-user');
  const opps = await generateOpportunities(input, 'test-user');
  console.log('roadmap', roadmap);
  console.log('resume', resume);
  console.log('opportunities', opps);
})();
