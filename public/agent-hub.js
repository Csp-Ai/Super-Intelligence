const auth = firebase.auth();

async function loadAgents() {
  const res = await fetch('/config/agents.json');
  const data = await res.json();
  renderTable(data);
}

function renderTable(registry) {
  const table = document.getElementById('agentsTable');
  table.innerHTML = `<thead><tr>
    <th>Name</th>
    <th>Status</th>
    <th>Version</th>
    <th>Created</th>
    <th>Updated</th>
    <th>Docs</th>
    <th>Enabled</th>
    <th>Actions</th>
  </tr></thead>`;
  const tbody = document.createElement('tbody');
  Object.values(registry).forEach(agent => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${agent.name}</td>
      <td>${agent.lastRunStatus}</td>
      <td>${agent.version}</td>
      <td>${agent.createdAt || ''}</td>
      <td>${agent.updatedAt || ''}</td>
      <td><a class="text-blue-600 underline" href="${agent.docsUrl}" target="_blank">README</a></td>
      <td><input type="checkbox" ${agent.enabled ? 'checked' : ''} disabled></td>
      <td>
        <button class="bg-gray-200 px-2 py-1 mr-1" onclick="testAgent('${agent.name}')">Test Agent</button>
        <button class="bg-gray-200 px-2 py-1" onclick="rerunAgent('${agent.name}')">Rerun</button>
      </td>`;
    tbody.appendChild(row);
  });
  table.appendChild(tbody);
}

async function testAgent(name) {
  alert(`Test functionality for ${name} not implemented.`);
}

async function rerunAgent(name) {
  const user = auth.currentUser;
  if (!user) {
    alert('Login required');
    return;
  }
  const token = await user.getIdToken();
  await fetch(`https://us-central1-${firebaseConfig.projectId}.cloudfunctions.net/retryAgentRun`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ agentName: name, userId: user.uid })
  });
  alert('Agent re-run triggered');
}

loadAgents();
