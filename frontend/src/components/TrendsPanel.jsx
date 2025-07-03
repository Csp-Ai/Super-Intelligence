import React, { useEffect, useState } from 'react';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app, auth } from '../firebase';
import MetricCard from './MetricCard';

const TrendsPanel = () => {
  const [trends, setTrends] = useState(null);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const db = getFirestore(app);
        let snap;
        const uid = auth.currentUser?.uid;
        if (uid) {
          const userDoc = doc(db, 'users', uid, 'trends', 'summary');
          snap = await getDoc(userDoc);
          if (snap.exists()) {
            setTrends(snap.data());
            return;
          }
        }
        const globalDoc = doc(db, 'globalTrends', 'forecast');
        snap = await getDoc(globalDoc);
        if (snap.exists()) setTrends(snap.data());
      } catch (err) {
        console.error('Failed to fetch trends', err);
      }
    };

    fetchTrends();
  }, []);

  if (!trends) return null;

  const metrics = trends.metrics || {};
  const forecast = trends.forecast || {};

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
      {Object.entries(metrics).map(([agent, m]) => (
        <div key={agent} className="p-4 bg-white/10 rounded shadow">
          <h3 className="font-semibold mb-2 capitalize">{agent.replace(/-agent$/, '')}</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <MetricCard label="Total Runs" value={m.totalRuns || 0} />
            <MetricCard label="Success Rate" value={`${Math.round((m.successRate || 0) * 100)}%`} />
            {forecast[agent] && (
              <MetricCard label="Next Run" value={new Date(forecast[agent]).toLocaleDateString()} />
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TrendsPanel;
