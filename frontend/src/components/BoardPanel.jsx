import React, { useEffect, useState } from 'react';
import { getFirestore, collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { app } from '../firebase';

export default function BoardPanel() {
  const [summaries, setSummaries] = useState([]);

  useEffect(() => {
    const db = getFirestore(app);
    const q = query(
      collection(db, 'logs'),
      where('agentName', '==', 'board-agent'),
      orderBy('timestamp', 'desc'),
      limit(5)
    );
    const unsub = onSnapshot(q, snap => {
      const list = [];
      snap.forEach(doc => {
        const data = doc.data();
        const summary = data.outputSummary?.summary || data.outputSummary || '';
        list.push({ summary, timestamp: data.timestamp });
      });
      setSummaries(list);
    });
    return () => unsub();
  }, []);

  return (
    <div className="bg-white/10 p-4 rounded shadow mb-4">
      <h3 className="font-semibold mb-2">Board Summaries</h3>
      <ul className="space-y-1 text-sm">
        {summaries.map((s, idx) => (
          <li key={idx} className="flex justify-between">
            <span>{typeof s.summary === 'string' ? s.summary : JSON.stringify(s.summary)}</span>
            <span className="text-xs text-gray-400">{s.timestamp ? new Date(s.timestamp).toLocaleString() : ''}</span>
          </li>
        ))}
        {summaries.length === 0 && <li>No summaries found.</li>}
      </ul>
    </div>
  );
}
