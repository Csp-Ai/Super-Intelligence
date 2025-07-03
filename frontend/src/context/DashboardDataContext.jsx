import React, { createContext, useContext } from 'react';

const DashboardDataContext = createContext({ agentStyles: {}, metrics: [] });

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

  return (
    <DashboardDataContext.Provider value={{ agentStyles, metrics }}>
      {children}
    </DashboardDataContext.Provider>
  );
};

export const useDashboardData = () => useContext(DashboardDataContext);
