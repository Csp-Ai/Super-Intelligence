import React, { useEffect, useState } from 'react';
import { getFirestore, collection, query, limit, onSnapshot } from 'firebase/firestore';
import { app, auth } from '../firebase';

const RoadmapCard = () => {
  const [steps, setSteps] = useState([]);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const db = getFirestore(app);
    const q = query(collection(db, 'users', uid, 'roadmap'), limit(1));
    const unsub = onSnapshot(q, snap => {
      let arr = [];
      snap.forEach(doc => {
        const data = doc.data();
        if (Array.isArray(data.roadmap)) arr = data.roadmap;
      });
      setSteps(arr);
    });
    return () => unsub();
  }, []);

  if (!steps.length) return null;

  return (
    <div className="bg-white/10 backdrop-blur p-3 rounded shadow mb-4 max-h-40 overflow-y-auto">
      <h4 className="font-semibold mb-2">Roadmap</h4>
      <ul className="list-disc pl-4 text-sm space-y-1">
        {steps.map((step, idx) => (
          <li key={idx}>
            <span className="font-medium">{step.phase}:</span> {step.description}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RoadmapCard;
