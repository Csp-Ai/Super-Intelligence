import React from 'react';
import MetricCard from './MetricCard';

export default {
  title: 'Components/MetricCard',
  component: MetricCard,
};

export const Default = () => <MetricCard label="Users" value={42} />;
