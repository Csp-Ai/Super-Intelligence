const { execSync } = require('child_process');

function checkDevDeps() {
  const devDeps = ['ajv'];
  for (const pkg of devDeps) {
    try {
      execSync(`npm ls ${pkg}`, { stdio: 'ignore' });
    } catch (err) {
      console.error(`\u274c Missing '${pkg}'. Run 'npm install --save-dev ${pkg}'`);
      process.exit(1);
    }
  }
  console.log('All required dev dependencies are installed.');
}

if (require.main === module) {
  checkDevDeps();
}

module.exports = { checkDevDeps };
