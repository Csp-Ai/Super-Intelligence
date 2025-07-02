const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const agents = JSON.parse(fs.readFileSync(path.join(__dirname,'..','config','agents.json'),'utf8'));

function toPascal(str){
  return str.split('-').map(s=>s.charAt(0).toUpperCase()+s.slice(1)).join('');
}

const results = [];
for(const id of Object.keys(agents)){
  const pascal = toPascal(id);
  const testFile = path.join(__dirname,'..','functions',`test${pascal}.js`);
  if(!fs.existsSync(testFile)){
    results.push({agent:id,status:'missing'});
    continue;
  }
  const run = spawnSync('node',[testFile],{stdio:'inherit'});
  results.push({agent:id,status:run.status===0?'tested':'failing'});
}

let md = '# Agent Test Coverage\n\n';
for(const r of results){
  const sym = r.status==='tested'? '✅' : r.status==='missing'? '❌' : '⚠️';
  md += `${sym} ${r.agent} - ${r.status}\n`;
}

console.log(md);
fs.writeFileSync(path.join(__dirname,'..','ci-report.md'), md);
fs.writeFileSync(path.join(__dirname,'..','public','ci-report.json'), JSON.stringify(results, null, 2));
