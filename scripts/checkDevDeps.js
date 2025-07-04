const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

function checkDevDeps() {
  const pkgJson = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8')
  );
  const devDeps = Object.keys(pkgJson.devDependencies || {});
  for (const pkg of devDeps) {
    try {
      execSync(`npm ls ${pkg}`, { stdio: 'ignore' });
    } catch (err) {
      console.error(`\u274c Missing dev dependency '${pkg}'. Run 'npm install --save-dev ${pkg}'`);
      process.exit(1);
    }
  }
  console.log('All required dev dependencies are installed.');
}

if (require.main === module) {
  checkDevDeps();
}

module.exports = { checkDevDeps };
