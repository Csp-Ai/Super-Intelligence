import { render, screen } from '@testing-library/react';
import App from './App.jsx';

test('renders app heading', () => {
  render(<App />);
  const heading = screen.getByText(/React Frontend Ready/i);
  expect(heading).toBeInTheDocument();
});
