const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

function parseJSDoc(content) {
  const match = content.match(/\/\*\*([\s\S]*?)\*\//);
  if (!match) return null;
  const lines = match[1].split('\n').map(l => l.replace(/^\s*\*\s?/, '').trim());
  const description = [];
  const inputs = [];
  let output = null;
  for (const line of lines) {
    if (line.startsWith('@param')) {
      const paramMatch = line.match(/@param\s+\{[^}]*\}\s*(\S+)\s*-?\s*(.*)/);
      if (paramMatch) inputs.push(`${paramMatch[1]} - ${paramMatch[2]}`.trim());
    } else if (line.startsWith('@returns') || line.startsWith('@return')) {
      const retMatch = line.match(/@returns?\s+\{[^}]*\}\s*(.*)/);
      if (retMatch) output = retMatch[1];
    } else if (!line.startsWith('@')) {
      if (line) description.push(line);
    }
  }
  return { description: description.join(' '), inputs, output };
}

function generateAgentDocs() {
  const agentsDir = path.join(__dirname, '..', 'functions', 'agents');
  const outDir = path.join(__dirname, '..', 'docs', 'agents');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const files = fs.readdirSync(agentsDir).filter(f => f.endsWith('.js'));
  for (const file of files) {
    const content = fs.readFileSync(path.join(agentsDir, file), 'utf8');
    const info = parseJSDoc(content) || { description: 'No doc comment found', inputs: [], output: '' };
    const lines = [
      `# ${file}`,
      '',
      `**Purpose**: ${info.description || 'N/A'}`,
      ''
    ];
    if (info.inputs.length) {
      lines.push('## Inputs');
      info.inputs.forEach(i => lines.push(`- ${i}`));
      lines.push('');
    }
    lines.push('## Output');
    lines.push(info.output ? `- ${info.output}` : '- N/A');
    lines.push('');
    const outPath = path.join(outDir, `${path.basename(file, '.js')}.md`);
    fs.writeFileSync(outPath, lines.join('\n'));
  }
}

function generateWorkflowDocs() {
  const wfDir = path.join(__dirname, '..', '.github', 'workflows');
  const outDir = path.join(__dirname, '..', 'docs', 'ci');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const files = fs.readdirSync(wfDir).filter(f => f.endsWith('.yml') || f.endsWith('.yaml'));
  for (const file of files) {
    const doc = yaml.load(fs.readFileSync(path.join(wfDir, file), 'utf8')) || {};
    const lines = [
      `# ${doc.name || file}`,
      ''
    ];
    if (doc.on) {
      const events = Array.isArray(doc.on)
        ? doc.on.join(', ')
        : typeof doc.on === 'object'
        ? Object.keys(doc.on).join(', ')
        : String(doc.on);
      lines.push(`**Triggers**: ${events}`, '');
    }
    if (doc.jobs) {
      lines.push('## Jobs');
      Object.entries(doc.jobs).forEach(([jobName, job]) => {
        lines.push(`- **${jobName}**: runs on ${job['runs-on'] || 'unknown'}`);
      });
    }
    const outPath = path.join(outDir, `${path.basename(file, path.extname(file))}.md`);
    fs.writeFileSync(outPath, lines.join('\n'));
  }
}

if (require.main === module) {
  generateAgentDocs();
  generateWorkflowDocs();
}

module.exports = { generateAgentDocs, generateWorkflowDocs };
