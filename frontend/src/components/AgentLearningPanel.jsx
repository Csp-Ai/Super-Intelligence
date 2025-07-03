import React, { useEffect, useState } from 'react';
import { getFirestore, collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { app } from '../firebase';

export default function AgentLearningPanel() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const db = getFirestore(app);
    const q = query(collection(db, 'agentSyncLogs'), orderBy('timestamp', 'desc'), limit(10));
    const unsub = onSnapshot(q, snap => {
      const list = [];
      snap.forEach(doc => {
        list.push(doc.data());
      });
      setLogs(list);
    });
    return () => unsub();
  }, []);

  return (
    <div className="bg-white/10 backdrop-blur p-3 rounded shadow mb-4">
      <h4 className="font-semibold mb-2">Strategy Sync Log</h4>
      <ul className="text-sm space-y-1">
        {logs.map((log, idx) => (
          <li key={idx} className="flex justify-between">
            <span>
              <span className="font-medium capitalize">{log.sourceAgent}</span>
              <span className="mx-1">→</span>
              <span className="font-medium capitalize">{log.targetAgent}</span>:
              {" "}{log.strategySummary}
            </span>
            <span className="text-xs text-gray-400">
              {log.timestamp ? new Date(log.timestamp).toLocaleString() : ''}
            </span>
          </li>
        ))}
        {logs.length === 0 && <li>No sync logs found.</li>}
      </ul>
    </div>
  );
}
