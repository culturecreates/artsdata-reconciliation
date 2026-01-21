import React from 'react';
import { render, screen } from '@testing-library/react';
import SelectedPlace from '../src/components/SelectedPlace';
import * as artsdataApi from '../src/api/artsdataApi';

jest.mock('../src/api/artsdataApi');

describe('SelectedPlace', () => {
  beforeEach(() => {
    artsdataApi.extractString.mockImplementation((value) => value);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render nothing when place is null', () => {
    const { container } = render(<SelectedPlace place={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render place name', () => {
    const place = {
      id: 'http://example.com/place1',
      name: 'Test Place',
      description: 'Test Description',
    };

    render(<SelectedPlace place={place} />);
    expect(screen.getByText('Test Place')).toBeInTheDocument();
  });

  it('should render place ID as a link', () => {
    const place = {
      id: 'http://example.com/place1',
      name: 'Test Place',
      description: 'Test Description',
    };

    render(<SelectedPlace place={place} />);
    const link = screen.getByRole('link', { name: /http:\/\/example.com\/place1/i });
    expect(link).toHaveAttribute('href', 'http://example.com/place1');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('should render place description', () => {
    const place = {
      id: 'http://example.com/place1',
      name: 'Test Place',
      description: 'Test Description',
    };

    render(<SelectedPlace place={place} />);
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('should not render description section if description is missing', () => {
    const place = {
      id: 'http://example.com/place1',
      name: 'Test Place',
    };

    render(<SelectedPlace place={place} />);
    expect(screen.queryByText(/description:/i)).not.toBeInTheDocument();
  });

  it('should render match score if available', () => {
    const place = {
      id: 'http://example.com/place1',
      name: 'Test Place',
      description: 'Test Description',
      score: 95.5,
    };

    render(<SelectedPlace place={place} />);
    expect(screen.getByText(/match score:/i)).toBeInTheDocument();
    expect(screen.getByText('95.5')).toBeInTheDocument();
  });

  it('should render type information', () => {
    const place = {
      id: 'http://example.com/place1',
      name: 'Test Place',
      description: 'Test Description',
      type: [
        { id: 'schema:Place', name: 'Place' },
        { id: 'schema:Organization', name: 'Organization' },
      ],
    };

    render(<SelectedPlace place={place} />);
    expect(screen.getByText(/type:/i)).toBeInTheDocument();
    expect(screen.getByText(/place \(schema:place\)/i)).toBeInTheDocument();
    expect(screen.getByText(/organization \(schema:organization\)/i)).toBeInTheDocument();
  });

  it('should handle multilingual strings', () => {
    const place = {
      id: 'http://example.com/place1',
      name: {
        values: [
          { str: 'English Name', lang: 'en' },
          { str: 'Nom Français', lang: 'fr' },
        ],
      },
      description: {
        values: [
          { str: 'English Description', lang: 'en' },
          { str: 'Description Française', lang: 'fr' },
        ],
      },
    };

    artsdataApi.extractString.mockImplementation((value) => {
      if (value && value.values && value.values.length > 0) {
        return value.values[0].str;
      }
      return value;
    });

    render(<SelectedPlace place={place} />);
    expect(screen.getByText('English Name')).toBeInTheDocument();
    expect(screen.getByText('English Description')).toBeInTheDocument();
  });

  it('should render all sections correctly', () => {
    const place = {
      id: 'http://example.com/place1',
      name: 'Complete Test Place',
      description: 'Complete Description',
      score: 100,
      type: [{ id: 'schema:Place', name: 'Place' }],
    };

    render(<SelectedPlace place={place} />);
    
    expect(screen.getByText('Selected Place')).toBeInTheDocument();
    expect(screen.getByText('Complete Test Place')).toBeInTheDocument();
    expect(screen.getByText(/ID:/i)).toBeInTheDocument();
    expect(screen.getByText(/Description:/i)).toBeInTheDocument();
    expect(screen.getByText('Complete Description')).toBeInTheDocument();
    expect(screen.getByText(/Match Score:/i)).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText(/Type:/i)).toBeInTheDocument();
  });
});
