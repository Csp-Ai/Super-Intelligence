import React, { useEffect, useState } from 'react';
import { getFirestore, collection, query, limit, onSnapshot } from 'firebase/firestore';
import { app, auth } from '../firebase';

const OpportunityCard = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const db = getFirestore(app);
    const q = query(collection(db, 'users', uid, 'opportunities'), limit(1));
    const unsub = onSnapshot(q, snap => {
      let arr = [];
      snap.forEach(doc => {
        const data = doc.data();
        if (Array.isArray(data.opportunities)) arr = data.opportunities;
      });
      setItems(arr);
    });
    return () => unsub();
  }, []);

  if (!items.length) return null;

  return (
    <div className="bg-white/10 backdrop-blur p-3 rounded shadow mb-4 max-h-40 overflow-y-auto">
      <h4 className="font-semibold mb-2">Opportunities</h4>
      <ul className="list-disc pl-4 text-sm space-y-1">
        {items.map((item, idx) => (
          <li key={idx}>
            {item.link ? (
              <a href={item.link} target="_blank" rel="noreferrer" className="underline">
                {item.title}
              </a>
            ) : (
              item.title
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OpportunityCard;
