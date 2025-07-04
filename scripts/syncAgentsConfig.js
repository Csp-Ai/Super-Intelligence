#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function syncAgents() {
  const src = path.join(__dirname, '..', 'config', 'agents.json');
  const destDir = path.join(__dirname, '..', 'public', 'config');
  const dest = path.join(destDir, 'agents.json');
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  fs.copyFileSync(src, dest);
  console.log(`Copied ${src} to ${dest}`);
}

if (require.main === module) {
  syncAgents();
}

module.exports = { syncAgents };
