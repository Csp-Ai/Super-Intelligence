import React from 'react';
import CanvasNetwork from './CanvasNetwork';

export default {
  title: 'Components/CanvasNetwork',
  component: CanvasNetwork,
};

export const Default = () => {
  const agents = [
    { id: 'core', x: 100, y: 120 },
    { id: 'mentor', x: 250, y: 60 },
    { id: 'opportunity', x: 400, y: 200 }
  ];
  return <CanvasNetwork agents={agents} width={500} height={300} />;
};
