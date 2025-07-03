import React from 'react';
import AgentNode from './AgentNode';
import { DashboardDataProvider } from '../context/DashboardDataContext';

export default {
  title: 'Components/AgentNode',
  component: AgentNode,
};

export const Default = () => (
  <DashboardDataProvider>
    <AgentNode id="core" label="Core" />
  </DashboardDataProvider>
);
