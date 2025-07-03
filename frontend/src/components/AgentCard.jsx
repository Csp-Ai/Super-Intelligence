import React from 'react';
import { motion } from 'framer-motion';

const stateColors = {
  online: 'bg-green-500',
  offline: 'bg-red-500',
  'under-review': 'bg-yellow-500',
  deprecated: 'bg-gray-500'
};

const AgentCard = ({ agentName, metrics = {}, status, state, anomalyScore, onTrain, onViewAnomalies }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="p-4 rounded shadow-md bg-white/10 backdrop-blur hover:shadow-lg transition-shadow"
    >
      <h3 className="font-semibold text-lg mb-2">{agentName}</h3>
      <p className="text-sm mb-1">Status: {status}</p>
      {state && (
        <p className="text-sm mb-1 flex items-center">
          State:
          <span
            className={`ml-1 w-2 h-2 rounded-full ${stateColors[state] || 'bg-gray-300'}`}
          ></span>
          <span className="ml-1">{state}</span>
        </p>
      )}
      {anomalyScore !== undefined && (
        <p className="text-sm mb-2">Anomaly Score: {anomalyScore}</p>
      )}
      <ul className="text-sm space-y-1 mb-2">
        {Object.entries(metrics).map(([key, value]) => (
          <li key={key}>
            {key}: {value}
          </li>
        ))}
      </ul>
      <div className="flex space-x-2">
        {onTrain && (
          <button
            onClick={onTrain}
            className="mt-1 border px-2 py-1 rounded text-sm"
          >
            Train
          </button>
        )}
        {onViewAnomalies && (
          <button
            onClick={onViewAnomalies}
            className="mt-1 border px-2 py-1 rounded text-sm"
          >
            View Anomalies
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default AgentCard;
