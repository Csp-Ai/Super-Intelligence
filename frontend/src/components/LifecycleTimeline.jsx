import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { app } from '../firebase';

const stateStyles = {
  online: 'text-green-400',
  offline: 'text-red-400',
  'under-review': 'text-yellow-400'
};

export default function LifecycleTimeline({ agentId }) {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (!agentId) return;
    const fetchData = async () => {
      try {
        const db = getFirestore(app);
        const q = query(
          collection(db, 'agents', agentId, 'lifecycle'),
          orderBy('timestamp', 'asc')
        );
        const snap = await getDocs(q);
        const list = snap.docs.map(doc => ({ state: doc.id, ...doc.data() }));
        setEvents(list);
      } catch (err) {
        console.error('Failed to fetch lifecycle', err);
      }
    };
    fetchData();
  }, [agentId]);

  if (!events.length) {
    return <p>No lifecycle data.</p>;
  }

  return (
    <div>
      <h4 className="font-semibold mb-2">Lifecycle Timeline</h4>
      <ul className="space-y-2 text-sm">
        {events.map(evt => (
          <li key={evt.state} className="flex justify-between items-center">
            <span className={stateStyles[evt.state] || ''}>{evt.state}</span>
            <span className="text-xs text-gray-400">
              {evt.timestamp ? new Date(evt.timestamp).toLocaleString() : ''}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
