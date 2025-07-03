import React from 'react';

export default function AgentSyncPanel({ events = [] }) {
  return (
    <div className="bg-white/10 backdrop-blur p-3 rounded shadow mb-4">
      <h4 className="font-semibold mb-2">Recent Agent Sync</h4>
      <ul className="text-sm space-y-1">
        {events.slice(0, 10).map((e, idx) => (
          <li key={idx} className="flex justify-between">
            <span>{e._agentId} - {e.stepType || e.type}</span>
            <span className="text-xs text-gray-400">{e._timestamp}</span>
          </li>
        ))}
        {events.length === 0 && <li>No sync events.</li>}
      </ul>
    </div>
  );
}
