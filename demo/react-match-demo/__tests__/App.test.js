import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../src/App';

jest.mock('../src/api/artsdataApi', () => ({
  searchPlaces: jest.fn(() => Promise.resolve([])),
  extractString: jest.fn((value) => value),
}));

describe('App', () => {
  it('should render the app title', () => {
    render(<App />);
    expect(screen.getByText(/artsdata reconciliation api demo/i)).toBeInTheDocument();
  });

  it('should render the description', () => {
    render(<App />);
    expect(screen.getByText(/search for places using the artsdata reconciliation api/i)).toBeInTheDocument();
  });

  it('should render the PlaceSearch component', () => {
    render(<App />);
    expect(screen.getByLabelText(/select a place/i)).toBeInTheDocument();
  });

  it('should render footer with API link', () => {
    render(<App />);
    const link = screen.getByRole('link', { name: /artsdata reconciliation api/i });
    expect(link).toHaveAttribute('href', 'https://recon.artsdata.ca');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('should not render SelectedPlace initially', () => {
    render(<App />);
    expect(screen.queryByText('Selected Place')).not.toBeInTheDocument();
  });
});
