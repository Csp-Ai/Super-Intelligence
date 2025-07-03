import React from 'react';
import { useDashboardData } from '../context/DashboardDataContext';

const AgentNode = ({ id, label }) => {
  const { agentStyles } = useDashboardData();
  const style = agentStyles[id] || {};
  return (
    <div className="agent-node flex flex-col items-center">
      <div
        className="w-4 h-4 rounded-full mb-1"
        style={{ backgroundColor: style.color || '#7c3aed' }}
      />
      <span className="text-xs">{label || id}</span>
    </div>
  );
};

export default AgentNode;
