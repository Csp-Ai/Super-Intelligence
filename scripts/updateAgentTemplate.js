#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const cfgPath = path.join(__dirname,'..','config','agents.json');
const pubPath = path.join(__dirname,'..','public','config','agents.json');
const data = JSON.parse(fs.readFileSync(cfgPath,'utf8'));
let changed = false;
for(const [id,info] of Object.entries(data)){
  if(!info.tags){ info.tags = [info.agentType || '']; changed = true; }
  if(!info.description){ info.description = 'TBD'; changed = true; }
  if(!info.lifecycle){ info.lifecycle = 'stable'; changed = true; }
}
if(changed){
  fs.writeFileSync(cfgPath, JSON.stringify(data,null,2));
  fs.writeFileSync(pubPath, JSON.stringify(data,null,2));
  console.log('Agent templates updated.');
} else {
  console.log('No updates needed.');
}
