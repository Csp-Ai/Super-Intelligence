import React from 'react';

const EthicsConstitution = () => (
  <div>
    <h2 className="text-lg font-semibold mb-2">Ethical Principles</h2>
    <ul className="list-disc pl-4 space-y-1">
      <li>Value alignment (human-in-the-loop feedback)</li>
      <li>Transparency (explainable agent logic)</li>
      <li>Global accessibility (multi-lingual + inclusive)</li>
      <li>Cultural adaptability</li>
      <li>Long-term safety and governance</li>
    </ul>
    <p className="mt-2 text-sm">
      Inspired by UNESCO AI Ethics, Anthropic's Constitutional AI and Future of Life Institute.
    </p>
  </div>
);

export default EthicsConstitution;
