import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, CircleOff } from 'lucide-react';

const stateColors = {
  online: 'bg-green-500',
  offline: 'bg-red-500',
  'under-review': 'bg-yellow-500',
  deprecated: 'bg-gray-500'
};

const AgentCard = ({
  agentName,
  metrics = {},
  status,
  state,
  anomalyScore,
  enabled = true,
  onToggle,
  onTrain,
  onViewAnomalies,
  onStatusClick
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="p-4 rounded shadow-md bg-white/10 backdrop-blur hover:shadow-lg transition-shadow"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-lg">{agentName}</h3>
        {onToggle && (
          <button onClick={onToggle} aria-label="Toggle agent">
            {enabled ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <CircleOff className="w-5 h-5 text-gray-400" />
            )}
          </button>
        )}
      </div>
      <p className="text-sm mb-1">
        Status:
        <span
          onClick={onStatusClick}
          className="ml-1 underline cursor-pointer"
        >
          {status}
        </span>
      </p>
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
