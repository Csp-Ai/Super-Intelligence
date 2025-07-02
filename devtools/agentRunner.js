const fs = require('fs');
const path = require('path');
const minimist = require('minimist');

const args = minimist(process.argv.slice(2));
const agentId = args.agent || process.env.AGENT;
if (!agentId) {
  console.error('Usage: node devtools/agentRunner.js --agent <agent-id> [--fn <function>] [--input "{...}"] [--user <id>]');
  process.exit(1);
}
const userId = args.user || 'local-user';
let input = {};
if (args.input) {
  try { input = JSON.parse(args.input); } catch (e) { console.error('Invalid JSON for --input'); process.exit(1); }
}

const config = JSON.parse(fs.readFileSync(path.join(__dirname,'..','config','agents.json'), 'utf8'));
const info = config[agentId];
if (!info) {
  console.error(`Unknown agent: ${agentId}`);
  process.exit(1);
}
const agentPath = path.join(__dirname, '..', info.sourcePath);
const mod = require(agentPath);

let fnName = args.fn;
if (!fnName) {
  fnName = Object.keys(mod).find(k => typeof mod[k] === 'function');
}
if (!fnName || typeof mod[fnName] !== 'function') {
  console.error('Could not determine function to run. Available:', Object.keys(mod));
  process.exit(1);
}

(async () => {
  try {
    const result = await mod[fnName](input, userId);
    console.log('Agent output:', result);
  } catch (err) {
    console.error('Agent run failed:', err.message);
  }
})();
