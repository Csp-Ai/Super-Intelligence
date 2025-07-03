import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { app, auth } from '../firebase';

export default function InsightsPanel() {
  const [scope, setScope] = useState('user');
  const [metrics, setMetrics] = useState({});

  const fetchMetrics = async currentScope => {
    try {
      const db = getFirestore(app);
      let col;
      if (currentScope === 'user' && auth.currentUser?.uid) {
        col = collection(db, 'users', auth.currentUser.uid, 'insights');
      } else {
        col = collection(db, 'global', 'insights', 'agents');
      }
      const snap = await getDocs(col);
      const obj = {};
      snap.forEach(doc => {
        obj[doc.id] = doc.data();
      });
      setMetrics(obj);
    } catch (err) {
      console.error('Failed to fetch insights metrics', err);
      setMetrics({});
    }
  };

  useEffect(() => {
    fetchMetrics(scope);
  }, [scope]);

  const hasData = Object.keys(metrics).length > 0;
  if (!hasData) return null;

  return (
    <div className="bg-white/10 p-4 rounded shadow mb-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold">Agent Insights</h3>
        {auth.currentUser && (
          <button
            onClick={() => setScope(scope === 'user' ? 'global' : 'user')}
            className="border px-2 py-1 rounded text-sm"
          >
            {scope === 'user' ? 'View Global' : 'View My Data'}
          </button>
        )}
      </div>
      <table className="table-auto text-sm w-full">
        <thead>
          <tr>
            <th className="px-2 py-1 text-left">Agent</th>
            <th className="px-2 py-1 text-right">Runs</th>
            <th className="px-2 py-1 text-right">Success %</th>
            <th className="px-2 py-1 text-right">Input Size</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(metrics).map(([id, m]) => (
            <tr key={id}>
              <td className="capitalize px-2 py-1">{id.replace(/-agent$/, '')}</td>
              <td className="px-2 py-1 text-right">{m.executionCount || 0}</td>
              <td className="px-2 py-1 text-right">{Math.round((m.successRate || 0) * 100)}%</td>
              <td className="px-2 py-1 text-right">{Math.round(m.avgInputSize || m.inputSize || 0)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
