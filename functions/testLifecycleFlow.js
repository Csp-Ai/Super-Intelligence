const admin = require('firebase-admin');
const { updateAgentState } = require('./ops/updateAgentState');

try {
  admin.initializeApp();
} catch (e) {
  // ignore
}

(async () => {
  const req = {
    method: 'POST',
    headers: { authorization: 'Bearer test' },
    body: { agentId: 'demo-agent', state: 'online' }
  };
  const res = {
    status(code) { this.statusCode = code; return this; },
    json(data) { console.log('result', this.statusCode || 200, data); },
    set() {}
  };
  await updateAgentState(req, res);
})();
