import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders ProctorAI app', () => {
  render(<App />);
  const appElement = screen.getByText(/ProctorAI/i);
  expect(appElement).toBeInTheDocument();
});
