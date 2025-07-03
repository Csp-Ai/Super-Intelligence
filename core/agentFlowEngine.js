function createContext({ userId = 'unknown', input = {} }) {
  return { userId, input, results: {} };
}

async function runAgentFlow(flow, { userId = 'unknown', input = {} } = {}) {
  const ctx = createContext({ userId, input });
  for (const step of flow) {
    if (typeof step === 'function') {
      await step(ctx);
    }
  }
  return ctx.results;
}

module.exports = { runAgentFlow };
