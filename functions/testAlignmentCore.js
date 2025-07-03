process.env.LOCAL_AGENT_RUN = '1';
const { runAlignmentCheck } = require('./agents/alignment-core');

(async () => {
  const result = runAlignmentCheck({
    agentName: 'alignment-core-test',
    output: 'Guaranteed job offer for men only. $10k bootcamp with no aid.',
    userData: { zipCode: '00501' }
  });
  console.log('Alignment check result:', JSON.stringify(result, null, 2));
})();
