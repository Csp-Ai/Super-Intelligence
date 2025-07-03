import React, { createContext, useContext, useEffect, useState } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { app, auth } from '../firebase';

const DashboardDataContext = createContext({ agentStyles: {}, metrics: [], insights: {} });

export const DashboardDataProvider = ({ children }) => {
  const agentStyles = {
    core: { color: '#7c3aed' },
    mentor: { color: '#2563eb' },
    opportunity: { color: '#059669' }
  };

  const metrics = [
    { id: 'agents', label: 'Active Agents', value: 3 },
    { id: 'users', label: 'Users', value: 1 },
    { id: 'uptime', label: 'Uptime', value: '99%' }
  ];

  const [insights, setInsights] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const db = getFirestore(app);
        let col;
        const uid = auth.currentUser?.uid;
        if (uid) col = collection(db, 'users', uid, 'insights');
        else col = collection(db, 'global', 'insights', 'agents');
        const snap = await getDocs(col);
        const obj = {};
        snap.forEach(doc => {
          obj[doc.id] = doc.data();
        });
        setInsights(obj);
      } catch (err) {
        console.error('Failed to fetch insights', err);
      }
    };
    fetchData();
  }, []);

  return (
    <DashboardDataContext.Provider value={{ agentStyles, metrics, insights }}>
      {children}
    </DashboardDataContext.Provider>
  );
};

export const useDashboardData = () => useContext(DashboardDataContext);
