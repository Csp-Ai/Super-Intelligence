const fallback = require('./translate');
let lib;
try {
  lib = require('ai-agent-systems');
} catch (err) {
  lib = {};
}
const translateText = lib.translateText || fallback.translateText;
const translateOutput = lib.translateOutput || fallback.translateOutput;

module.exports = { translateText, translateOutput };
