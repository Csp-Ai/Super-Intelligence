const admin = require('firebase-admin');
const { computeGlobalTrends } = require('./agents/trendsAgent');

try {
  admin.initializeApp();
} catch (e) {
  // ignore if already initialized
}

(async () => {
  const trends = await computeGlobalTrends();
  console.log('Trends:', JSON.stringify(trends, null, 2));
})();

