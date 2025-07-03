import React, { useEffect, useState } from 'react';
import { getFirestore, collection, query, orderBy, limit, where, onSnapshot } from 'firebase/firestore';
import { app } from '../firebase';

export default function AnomalyPanel({ agentId }) {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const db = getFirestore(app);
    let q = collection(db, 'anomalies');
    if (agentId) {
      q = query(q, where('agent', '==', agentId));
    }
    q = query(q, orderBy('timestamp', 'desc'), limit(10));
    const unsub = onSnapshot(q, snap => {
      const items = [];
      snap.forEach(doc => items.push(doc.data()));
      setEvents(items);
    });
    return () => unsub();
  }, [agentId]);

  return (
    <div className="anomaly-panel bg-white/10 backdrop-blur p-3 rounded shadow mb-4">
      <h4 className="font-semibold mb-2">Recent Anomalies {agentId && `for ${agentId}`}</h4>
      <ul className="text-sm space-y-1">
        {events.map((e, idx) => (
          <li key={idx} className="flex justify-between">
            <span>{e.agent} - {e.type}</span>
            <span className="text-xs text-gray-400">{e.timestamp}</span>
          </li>
        ))}
        {events.length === 0 && <li>No anomalies found.</li>}
      </ul>
    </div>
  );
}
