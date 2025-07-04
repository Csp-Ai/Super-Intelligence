#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');

function validate() {
  const schemaPath = path.join(__dirname, '..', 'config', 'agents.schema.json');
  const dataPath = path.join(__dirname, '..', 'config', 'agents.json');
  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const ajv = new Ajv();
  const validate = ajv.compile(schema);
  const valid = validate(data);
  if (!valid) {
    console.error('Agent metadata validation failed:', validate.errors);
    process.exit(1);
  }
  console.log('Agent metadata valid.');
}

if (require.main === module) {
  validate();
}

module.exports = { validate };
