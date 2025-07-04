#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const agents = JSON.parse(fs.readFileSync(path.join(__dirname,'..','config','agents.json'),'utf8'));

function toPascal(str){
  return str.split('-').map(s=>s.charAt(0).toUpperCase()+s.slice(1)).join('');
}

const stepsPath = path.join(__dirname,'..','functions','steps.json');
// optional additional tests not driven directly by agents.json
const extraTests = [{ id: 'alignment-core', file: 'testAlignmentCore.js' }];

const results = [];
for(const id of Object.keys(agents)){
  const pascal = toPascal(id);
  const testFile = path.join(__dirname,'..','functions',`test${pascal}.js`);
  if(!fs.existsSync(testFile)){
    results.push({agent:id,status:'missing',steps:false});
    continue;
  }
  let before = [];
  if(fs.existsSync(stepsPath)){
    try{ before = JSON.parse(fs.readFileSync(stepsPath,'utf8')); if(!Array.isArray(before)) before=[]; }catch(_) { before=[]; }
  }
  const run = spawnSync('node',[testFile],{stdio:'inherit'});
  let after = before;
  if(fs.existsSync(stepsPath)){
    try{ after = JSON.parse(fs.readFileSync(stepsPath,'utf8')); if(!Array.isArray(after)) after=[]; }catch(_) { after=before; }
  }
  const newSteps = after.slice(before.length).filter(s=>s.agent===id);
  const hasSteps = newSteps.length > 0;
  results.push({agent:id,status:run.status===0?'tested':'failing',steps:hasSteps});
}

for(const {id, file} of extraTests){
  if(results.some(r => r.agent === id)) continue;
  const testPath = path.join(__dirname,'..','functions',file);
  if(!fs.existsSync(testPath)) continue;
  const run = spawnSync('node',[testPath],{stdio:'inherit'});
  results.push({agent:id,status:run.status===0?'tested':'failing',steps:false});
}

let md = '# Agent Test Coverage\n\n';
for(const r of results){
  const sym = r.status==='tested'? '✅' : r.status==='missing'? '❌' : '⚠️';
  const stepSym = r.steps ? '📝' : '❌';
  md += `${sym} ${r.agent} - ${r.status} - steps:${stepSym}\n`;
}

console.log(md);
fs.writeFileSync(path.join(__dirname,'..','ci-report.md'), md);
fs.writeFileSync(path.join(__dirname,'..','public','ci-report.json'), JSON.stringify(results, null, 2));
