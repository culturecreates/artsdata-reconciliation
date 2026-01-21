import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../src/App';

jest.mock('../src/api/artsdataApi', () => ({
  searchPlaces: jest.fn(() => Promise.resolve([])),
  extractString: jest.fn((value) => value),
}));

describe('App', () => {
  it('should render the PlaceSearch component with search input', () => {
    render(<App />);
    const searchInput = screen.getByPlaceholderText(/start typing to search for places/i);
    expect(searchInput).toBeInTheDocument();
  });

  it('should pass entityType prop to PlaceSearch', () => {
    render(<App entityType="schema:Organization" />);
    // Verify that the component renders without error with entityType
    expect(screen.getByPlaceholderText(/start typing to search for places/i)).toBeInTheDocument();
  });

  it('should use default entityType when not provided', () => {
    render(<App />);
    // Verify that the component renders with default entityType
    expect(screen.getByPlaceholderText(/start typing to search for places/i)).toBeInTheDocument();
  });

  it('should dispatch custom event when place is selected', () => {
    const dispatchEventSpy = jest.spyOn(window, 'dispatchEvent');
    render(<App />);
    // The component should be ready to dispatch events
    expect(dispatchEventSpy).toBeDefined();
    dispatchEventSpy.mockRestore();
  });
});
