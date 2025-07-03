const fs = require('fs');
const path = require('path');

function generateMarkdown() {
  const configPath = path.join(__dirname, '..', 'config', 'agents.json');
  const outPath = path.join(__dirname, '..', 'AGENTS.md');
  // Base URL for linking to agent source files in the repository
  const repoUrl = 'https://github.com/Csp-Ai/Super-Intelligence/blob/main/';
  const raw = fs.readFileSync(configPath, 'utf8');
  const agents = JSON.parse(raw);

  const lines = ['# 🤖 Agent Directory', ''];
  Object.keys(agents)
    .sort()
    .forEach((key) => {
      const agent = agents[key];
      const tags = Array.isArray(agent.tags)
        ? agent.tags.join(', ')
        : agent.agentType || '';
      const updated = agent.updatedAt ? agent.updatedAt.split('T')[0] : 'unknown';
      lines.push(`### ${agent.name}`);
      lines.push(`- 📁 Path: \`${agent.sourcePath}\``);
      lines.push(`- 🏷️ Tags: ${tags}`);
      lines.push(`- 📅 Last updated: ${updated}`);
      lines.push(`- 🔗 [View source](${repoUrl}${agent.sourcePath})`);
      lines.push(`- 🧠 Description: ${agent.description || 'TBD'}`);
      lines.push('');
    });

  fs.writeFileSync(outPath, lines.join('\n'));
}

if (require.main === module) {
  generateMarkdown();
}

module.exports = { generateMarkdown };
