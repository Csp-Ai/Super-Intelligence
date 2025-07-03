const fs = require('fs');
const path = require('path');

function checkTargets() {
  const rcPath = path.join(__dirname, '..', '.firebaserc');
  const jsonPath = path.join(__dirname, '..', 'firebase.json');
  const rc = JSON.parse(fs.readFileSync(rcPath, 'utf8'));
  const config = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  const required = new Set();
  const hostingConfig = config.hosting || [];
  if (Array.isArray(hostingConfig)) {
    for (const h of hostingConfig) {
      if (h && h.target) required.add(h.target);
    }
  } else if (hostingConfig && hostingConfig.target) {
    required.add(hostingConfig.target);
  }

  const defined = new Set();
  if (rc.targets && typeof rc.targets === 'object') {
    for (const project of Object.values(rc.targets)) {
      if (project.hosting && typeof project.hosting === 'object') {
        for (const t of Object.keys(project.hosting)) {
          defined.add(t);
        }
      }
    }
  }

  const missing = Array.from(required).filter(t => !defined.has(t));
  if (missing.length > 0) {
    console.error(`Missing Firebase hosting targets in .firebaserc: ${missing.join(', ')}`);
    process.exit(1);
  }
}

if (require.main === module) {
  checkTargets();
}

module.exports = { checkTargets };
