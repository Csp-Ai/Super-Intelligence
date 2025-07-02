const { aggregateRuns } = require('./agents/insightsAgent');
const fs = require('fs');
const path = require('path');

(async () => {
  const logPath = path.join(__dirname, 'logs.json');
  const raw = fs.readFileSync(logPath, 'utf8');
  const data = JSON.parse(raw);
  const metrics = aggregateRuns(data);
  console.log('Insights metrics:', JSON.stringify(metrics, null, 2));
})();
