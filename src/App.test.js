import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app header', () => {
  render(<App />);
  const linkElements = screen.getAllByText(/wellnesscafe/i);
  expect(linkElements.length).toBeGreaterThan(0);
});
