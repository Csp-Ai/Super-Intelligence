import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Legend,
  Tooltip
} from 'chart.js';
import { useDashboardData } from '../context/DashboardDataContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, Legend, Tooltip);

const InsightsChart = () => {
  const { insights } = useDashboardData();
  const agents = Object.keys(insights || {});
  if (!agents.length) return null;

  const successData = agents.map(
    id => insights[id].success ?? Math.round((insights[id].successRate || 0) * (insights[id].executionCount || 0))
  );
  const failureData = agents.map(
    id => insights[id].failure ?? Math.round((insights[id].failureRate || 0) * (insights[id].executionCount || 0))
  );

  const data = {
    labels: agents,
    datasets: [
      {
        label: 'Successes',
        data: successData,
        backgroundColor: 'rgba(16,185,129,0.6)'
      },
      {
        label: 'Failures',
        data: failureData,
        backgroundColor: 'rgba(239,68,68,0.6)'
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: { legend: { position: 'top' } }
  };

  return (
    <div className="bg-white/10 p-4 rounded shadow mb-4">
      <h3 className="font-semibold mb-2">Success / Failure Trends</h3>
      <Bar data={data} options={options} />
    </div>
  );
};

export default InsightsChart;
