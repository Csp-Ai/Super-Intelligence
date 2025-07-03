import React, { useEffect, useState } from 'react';
import { getFirestore, collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { app } from '../firebase';

const categories = ['dance', 'academic'];

export default function MentorPanel() {
  const [tips, setTips] = useState({});

  useEffect(() => {
    const db = getFirestore(app);
    const unsubs = categories.map(cat => {
      const q = query(
        collection(db, 'logs'),
        where('agentName', '==', 'mentor-agent'),
        where('inputSummary.focus', '==', cat),
        orderBy('timestamp', 'desc'),
        limit(1)
      );
      return onSnapshot(q, snap => {
        let tip;
        snap.forEach(doc => {
          const data = doc.data();
          tip = data.outputSummary?.tip || data.outputSummary || '';
        });
        setTips(prev => ({ ...prev, [cat]: tip }));
      });
    });
    return () => unsubs.forEach(u => u());
  }, []);

  return (
    <div className="bg-white/10 p-4 rounded shadow mb-4">
      <h3 className="font-semibold mb-2">Latest Mentor Tips</h3>
      <ul className="space-y-1 text-sm">
        {categories.map(cat => (
          <li key={cat} className="flex justify-between">
            <span className="font-medium capitalize">{cat}:</span>
            <span className="ml-2">{tips[cat] || 'No tip found.'}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
