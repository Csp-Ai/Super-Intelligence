import React from 'react';

const steps = [
  'npm install',
  'npm install --prefix functions',
  'npm install --prefix frontend',
  'npm test --silent'
];

const DeploySteps = () => (
  <ol className="list-decimal pl-4 space-y-1">
    {steps.map(step => (
      <li key={step}>{step}</li>
    ))}
  </ol>
);

export default DeploySteps;
