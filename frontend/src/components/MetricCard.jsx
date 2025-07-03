import React from 'react';

const MetricCard = ({ label, value }) => (
  <div className="metric-card border p-2 rounded shadow">
    <h3 className="font-semibold">{label}</h3>
    <p>{value}</p>
  </div>
);

export default MetricCard;
