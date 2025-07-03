const { generateRoadmap } = require('../functions/agents/roadmapAgent');
const { generateResumeSummary } = require('../functions/agents/resumeAgent');
const { generateOpportunities } = require('../functions/agents/opportunityAgent');

module.exports = [
  async ctx => {
    ctx.results.roadmap = await generateRoadmap(ctx.input, ctx.userId);
  },
  async ctx => {
    ctx.results.resume = await generateResumeSummary(ctx.input, ctx.userId);
  },
  async ctx => {
    ctx.results.opportunities = await generateOpportunities(ctx.input, ctx.userId);
  }
];
