const store = {};

function read(runId) {
  return store[runId] ? { ...store[runId] } : {};
}

function write(runId, data = {}) {
  if (!store[runId]) store[runId] = {};
  Object.assign(store[runId], data);
}

function reset(runId) {
  if (runId) {
    delete store[runId];
  } else {
    Object.keys(store).forEach(key => delete store[key]);
  }
}

module.exports = { read, write, reset };
