import React from 'react';
import { render, screen } from '@testing-library/react';
import { App } from './App';

it('renders "Welcome to Your Fluent UI App"', () => {
  render(<App host={Office.HostType.Excel} platform={Office.PlatformType.OfficeOnline} />);
  const linkElement = screen.getByText(/Welcome to Your Fluent UI App/i);
  expect(linkElement).toBeInTheDocument();
});
