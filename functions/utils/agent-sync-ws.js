const WebSocket = require('ws');
let wss;

function initAgentSyncWs(server) {
  if (wss) return wss;
  wss = new WebSocket.Server({ noServer: true });
  server.on('upgrade', (req, socket, head) => {
    if (req.url === '/agent-sync') {
      wss.handleUpgrade(req, socket, head, ws => {
        wss.emit('connection', ws, req);
      });
    } else {
      socket.destroy();
    }
  });
  return wss;
}

function broadcast(runId, payload) {
  if (!wss) return;
  const message = JSON.stringify({ runId, payload });
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

module.exports = { initAgentSyncWs, broadcast };
