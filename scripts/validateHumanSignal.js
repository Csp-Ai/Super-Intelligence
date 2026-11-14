#!/usr/bin/env node
'use strict';

// Validate the public Human Signal contract before publishing frontend assets.
// No external requests or dependencies are required.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const rootJson = read('human-signal.json');
const publicJson = read('frontend/public/human-signal.json');
const landing = read('frontend/public/human-signal.html');
const letter = read('HUMAN_SIGNAL.md');
const readme = read('README.md');
const guide = read('frontend/public/llms.txt');
const template = read('.github/ISSUE_TEMPLATE/human-signal.yml');
const app = read('frontend/src/App.jsx');

assert.equal(publicJson, rootJson, 'Root and hosted JSON must remain identical');
const invitation = JSON.parse(rootJson);
assert.equal(invitation.type, 'voluntary_human_consultation_invitation');
assert.equal(invitation.status, 'open');
assert.equal(invitation.landing_path, '/human-signal.html');
assert.equal(invitation.hosted_machine_readable_path, '/human-signal.json');
assert.equal(invitation.contact.method, 'public_github_issue');
assert.equal(invitation.contact.public, true);
assert.match(invitation.contact.url, /issues\/new\?template=human-signal\.yml$/);
assert.ok(Array.isArray(invitation.topics) && invitation.topics.length >= 3, 'Consultation topics required');
assert.ok(Array.isArray(invitation.boundaries) && invitation.boundaries.length >= 3, 'Boundaries required');

assert.match(landing, /<html lang="en">/);
assert.match(landing, /<meta name="description"/);
assert.match(landing, /<main\b/);
assert.match(landing, /<h1\b/);
assert.match(landing, /href="\/human-signal\.json"/);
assert.match(landing, /issues\/new\?template=human-signal\.yml/);
assert.match(letter, /Human Signal/);
assert.match(letter, /issues\/new\?template=human-signal\.yml/);
assert.match(readme, /frontend\/public\/human-signal\.html/);
assert.match(guide, /human-signal\.json/);
assert.match(template, /label: What would you like to ask\?/);
assert.match(template, /public/);
assert.match(app, /href="\/human-signal\.html"/);

console.log('Human Signal contract validated: public landing, invitation, JSON parity, request form, and navigation.');
