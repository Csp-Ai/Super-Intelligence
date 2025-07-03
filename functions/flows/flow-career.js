const fs = require('fs');
const path = require('path');

const { generateRoadmap } = require('../agents/roadmapAgent');
const { generateResumeSummary } = require('../agents/resumeAgent');
const { generateOpportunities } = require('../agents/opportunityAgent');
const memory = require('../utils/memory');

function appendLog(runId, entry) {
  const dir = path.join(__dirname, '..', '..', 'logs', 'flows');
  const file = path.join(dir, `${runId}.json`);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  let data = [];
  if (fs.existsSync(file)) {
    try {
      data = JSON.parse(fs.readFileSync(file, 'utf8'));
      if (!Array.isArray(data)) data = [];
    } catch (_) {
      data = [];
    }
  }
  data.push({ timestamp: new Date().toISOString(), ...entry });
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

async function runFlowCareer(userData = {}, runId, opts = {}) {
  const userId = opts.userId || 'unknown';
  if (!runId) runId = Date.now().toString();

  // Roadmap step
  const roadmap = await generateRoadmap(userData, userId);
  memory.write(runId, { roadmap });
  appendLog(runId, { agent: 'roadmap-agent', prompt: userData, score: 1 });

  // Resume step
  const resumeInput = { ...userData, roadmap };
  const resume = await generateResumeSummary(resumeInput, userId);
  memory.write(runId, { resume });
  appendLog(runId, { agent: 'resume-agent', prompt: resumeInput, score: 1 });

  // Opportunities step
  const oppInput = { ...userData, resume, roadmap };
  const opportunities = await generateOpportunities(oppInput, userId);
  memory.write(runId, { opportunities });
  appendLog(runId, { agent: 'opportunity-agent', prompt: oppInput, score: 1 });

  return memory.read(runId);
}

module.exports = { runFlowCareer };
