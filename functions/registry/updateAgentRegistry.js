const fs = require('fs');
const path = require('path');

/**
 * Update config/agents.json with timestamps and ensure all agent files are listed.
 * New agents discovered under functions/agents will be added automatically.
 */
async function updateRegistry() {
  const agentsDir = path.join(__dirname, '..', 'agents');
  const configPath = path.join(__dirname, '..', '..', 'config', 'agents.json');
  const now = new Date().toISOString();

  let registry = {};
  if (fs.existsSync(configPath)) {
    try {
      registry = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (err) {
      console.error('Failed to parse agents.json:', err);
    }
  }

  const files = fs.readdirSync(agentsDir).filter(f => f.endsWith('.js'));
  for (const file of files) {
    const name = file.replace(/\.js$/, '').replace(/([A-Z])/g, '-$1').toLowerCase();
    if (!registry[name]) {
      registry[name] = {
        name,
        description: '',
        version: 'v1.0.0',
        lastRunStatus: 'unknown',
        agentType: 'utility',
        enabled: true,
        docsUrl: `../functions/agents/${file}`,
        sourcePath: `functions/agents/${file}`,
        createdAt: now,
        updatedAt: now
      };
    } else {
      registry[name].updatedAt = now;
      if (!registry[name].createdAt) registry[name].createdAt = now;
    }
  }

  fs.writeFileSync(configPath, JSON.stringify(registry, null, 2));

  // mirror under public for hosting
  const publicPath = path.join(__dirname, '..', '..', 'public', 'config');
  if (!fs.existsSync(publicPath)) fs.mkdirSync(publicPath, { recursive: true });
  fs.writeFileSync(path.join(publicPath, 'agents.json'), JSON.stringify(registry, null, 2));

  console.log('Agent registry updated.');
}

if (require.main === module) {
  updateRegistry();
}

module.exports = { updateRegistry };
