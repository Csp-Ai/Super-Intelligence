#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function checkTargets() {
  const rcPath = path.join(__dirname, '..', '.firebaserc');
  const jsonPath = path.join(__dirname, '..', 'firebase.json');
  const rc = JSON.parse(fs.readFileSync(rcPath, 'utf8'));
  const config = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  const configTargets = new Set();
  const hostingConfig = config.hosting || [];
  if (Array.isArray(hostingConfig)) {
    for (const h of hostingConfig) {
      if (h && h.target) {
        configTargets.add(h.target);
        if (!h.rewrites && !h.redirects) {
          console.warn(`Warning: hosting target '${h.target}' has no rewrites or redirects defined`);
        }
      }
    }
  } else if (hostingConfig && hostingConfig.target) {
    configTargets.add(hostingConfig.target);
    if (!hostingConfig.rewrites && !hostingConfig.redirects) {
      console.warn(`Warning: hosting target '${hostingConfig.target}' has no rewrites or redirects defined`);
    }
  }

  const rcTargets = new Set();
  if (rc.targets && typeof rc.targets === 'object') {
    for (const project of Object.values(rc.targets)) {
      if (project.hosting && typeof project.hosting === 'object') {
        for (const t of Object.keys(project.hosting)) {
          rcTargets.add(t);
        }
      }
    }
  }

  const missingInRc = Array.from(configTargets).filter(t => !rcTargets.has(t));
  const missingInConfig = Array.from(rcTargets).filter(t => !configTargets.has(t));

  if (missingInRc.length || missingInConfig.length) {
    if (missingInRc.length) {
      console.error(`Missing Firebase hosting targets in .firebaserc: ${missingInRc.join(', ')}`);
    }
    if (missingInConfig.length) {
      console.error(`Targets defined in .firebaserc but not in firebase.json: ${missingInConfig.join(', ')}`);
    }
    process.exit(1);
  } else {
    console.log('Firebase hosting targets validated successfully.');
  }
}

if (require.main === module) {
  checkTargets();
}

module.exports = { checkTargets };
