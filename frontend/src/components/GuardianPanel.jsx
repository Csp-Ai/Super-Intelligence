import React, { useEffect, useState } from 'react';
import { getFirestore, collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { app } from '../firebase';

export default function GuardianPanel() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const db = getFirestore(app);
    const q = query(
      collection(db, 'logs'),
      where('agentName', '==', 'guardian-agent'),
      orderBy('timestamp', 'desc'),
      limit(5)
    );
    const unsub = onSnapshot(q, snap => {
      const items = [];
      snap.forEach(doc => {
        const data = doc.data();
        items.push({
          message: data.outputSummary?.message || data.outputSummary || data.message || '',
          flags: data.alignment?.flags || data.flags || [],
          timestamp: data.timestamp
        });
      });
      setLogs(items);
    });
    return () => unsub();
  }, []);

  return (
    <div className="bg-white/10 p-4 rounded shadow mb-4">
      <h3 className="font-semibold mb-2">Compliance Logs</h3>
      <ul className="space-y-1 text-sm">
        {logs.map((log, idx) => (
          <li key={idx} className="flex flex-col">
            <span className="flex justify-between">
              <span>{typeof log.message === 'string' ? log.message : JSON.stringify(log.message)}</span>
              <span className="text-xs text-gray-400">{log.timestamp ? new Date(log.timestamp).toLocaleString() : ''}</span>
            </span>
            {log.flags.length > 0 && (
              <span className="text-xs text-red-400">Flags: {log.flags.join(', ')}</span>
            )}
          </li>
        ))}
        {logs.length === 0 && <li>No compliance logs found.</li>}
      </ul>
    </div>
  );
}
