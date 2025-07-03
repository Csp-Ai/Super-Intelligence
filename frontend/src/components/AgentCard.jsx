import React from 'react';
import { motion } from 'framer-motion';

const AgentCard = ({ agentName, metrics = {}, status, anomalyScore, onTrain }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="p-4 rounded shadow-md bg-white/10 backdrop-blur hover:shadow-lg transition-shadow"
    >
      <h3 className="font-semibold text-lg mb-2">{agentName}</h3>
      <p className="text-sm mb-1">Status: {status}</p>
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
      {onTrain && (
        <button
          onClick={onTrain}
          className="mt-1 border px-2 py-1 rounded text-sm"
        >
          Train
        </button>
      )}
    </motion.div>
  );
};

export default AgentCard;
