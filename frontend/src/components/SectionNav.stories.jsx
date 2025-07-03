import React, { useState } from 'react';
import SectionNav from './SectionNav';

export default {
  title: 'Components/SectionNav',
  component: SectionNav,
};

export const Default = () => {
  const [active, setActive] = useState('home');
  const sections = { home: 'Home', about: 'About', signup: 'Signup' };
  return <SectionNav sections={sections} active={active} onChange={setActive} />;
};
