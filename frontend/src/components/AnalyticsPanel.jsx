import React, { useEffect, useState } from 'react';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  setDoc
} from 'firebase/firestore';
import { app, auth } from '../firebase';

export default function AnalyticsPanel() {
  const [events, setEvents] = useState([]);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const db = getFirestore(app);
    const settingsRef = doc(db, 'users', uid, 'settings', 'analytics');
    getDoc(settingsRef)
      .then(snap => {
        if (snap.exists()) setEnabled(!!snap.data().enabled);
      })
      .catch(err => console.error('Failed to fetch analytics setting', err));
  }, []);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const db = getFirestore(app);
    const col = collection(db, 'analytics', uid, 'ui-events');
    const q = query(col, orderBy('timestamp', 'desc'), limit(20));
    const unsub = onSnapshot(q, snap => {
      const list = [];
      snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
      setEvents(list);
    });
    return () => unsub();
  }, []);

  const toggleEnabled = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const db = getFirestore(app);
    const settingsRef = doc(db, 'users', uid, 'settings', 'analytics');
    const newVal = !enabled;
    setEnabled(newVal);
    try {
      await setDoc(settingsRef, { enabled: newVal }, { merge: true });
    } catch (err) {
      console.error('Failed to update analytics setting', err);
    }
  };

  const grouped = events.reduce((acc, evt) => {
    const key = evt.sessionId || evt.userId || 'unknown';
    if (!acc[key]) acc[key] = [];
    acc[key].push(evt);
    return acc;
  }, {});

  return (
    <div className="bg-white/10 p-4 rounded shadow mb-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">Analytics Events</h3>
        <label className="text-sm flex items-center space-x-1">
          <input
            type="checkbox"
            checked={enabled}
            onChange={toggleEnabled}
            className="form-checkbox"
          />
          <span>Enable</span>
        </label>
      </div>
      {Object.keys(grouped).length === 0 && <p className="text-sm">No events found.</p>}
      {Object.entries(grouped).map(([group, list]) => (
        <div key={group} className="mb-2">
          <h4 className="font-medium text-sm mb-1">{group}</h4>
          <ul className="text-sm space-y-1">
            {list.map(evt => (
              <li key={evt.id} className="flex justify-between">
                <span>{evt.component}</span>
                <span className="text-xs text-gray-400">
                  {evt.timestamp ? new Date(evt.timestamp).toLocaleString() : ''}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
