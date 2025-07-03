import React, { useEffect, useState } from 'react';
import { getFirestore, collection, query, limit, onSnapshot } from 'firebase/firestore';
import { app, auth } from '../firebase';

const ResumeCard = () => {
  const [summary, setSummary] = useState('');

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const db = getFirestore(app);
    const q = query(collection(db, 'users', uid, 'resume'), limit(1));
    const unsub = onSnapshot(q, snap => {
      let text = '';
      snap.forEach(doc => {
        const data = doc.data();
        if (data.summary) text = data.summary;
      });
      setSummary(text);
    });
    return () => unsub();
  }, []);

  if (!summary) return null;

  return (
    <div className="bg-white/10 backdrop-blur p-3 rounded shadow mb-4 max-h-40 overflow-y-auto">
      <h4 className="font-semibold mb-2">Resume Summary</h4>
      <p className="text-sm whitespace-pre-wrap">{summary}</p>
    </div>
  );
};

export default ResumeCard;
