import React from 'react';

const SectionNav = ({ sections, active, onChange }) => (
  <nav className="space-x-2 mb-4">
    {Object.keys(sections).map(key => (
      <button
        key={key}
        onClick={() => onChange(key)}
        className="border px-2 py-1 rounded"
      >
        {key}
      </button>
    ))}
  </nav>
);

export default SectionNav;
