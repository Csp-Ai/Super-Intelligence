#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const site = path.join(root, 'human-signal-site');
const read = name => fs.readFileSync(path.join(site, name), 'utf8');
const html = read('index.html');
const css = read('styles.css');
const json = JSON.parse(read('human-signal.json'));
const discovery = read('llms.txt');
const robots = read('robots.txt');
const sitemap = read('sitemap.xml');
const vercel = JSON.parse(read('vercel.json'));
const form = fs.readFileSync(path.join(root, '.github/ISSUE_TEMPLATE/human-signal.yml'), 'utf8');
const letter = fs.readFileSync(path.join(root, 'HUMAN_SIGNAL.md'), 'utf8');
const required = ['index.html', 'styles.css', 'human-signal.json', 'llms.txt', 'robots.txt', 'sitemap.xml', 'vercel.json'];
const domain = 'https://human-signal-two.vercel.app/';

for (const name of required) {
  assert.ok(fs.statSync(path.join(site, name)).size > 0, name + ' must be nonempty');
}
assert.match(html, /<!doctype html>/i);
assert.match(html, /<html lang="en">/);
assert.match(html, /<main\\b/);
assert.match(html, /<h1\\b/);
assert.match(html, /<meta name="description"/);
assert.match(html, /href="\\/styles\\.css"/);
assert.match(html, /href="\\/human-signal\\.json"/);
assert.match(html, /issues\\/new\\?template=human-signal\\.yml/);
assert.match(html, /rel="canonical"/);
assert.ok(css.includes('@media'), 'responsive stylesheet required');
assert.equal(json.site_url, domain);
assert.equal(json.status, 'open');
assert.equal(json.contact.public, true);
assert.ok(json.contact.url.endsWith('?template=human-signal.yml'));
assert.match(discovery, /human-signal\\.json/);
assert.match(robots, /Allow: \\//);
assert.match(robots, /Sitemap:/);
assert.ok(sitemap.includes('<loc>' + domain + '</loc>'));
assert.match(letter, /Human Signal/);
assert.match(form, /label: What would you like to ask\\?/);
assert.equal(vercel.version, 2);
assert.ok(Array.isArray(vercel.headers));

console.log('PASS: Human Signal site integrity (7 files, links, discovery, and consultation route).');
