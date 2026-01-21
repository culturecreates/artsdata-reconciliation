import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PlaceSearch from '../src/components/PlaceSearch';
import * as artsdataApi from '../src/api/artsdataApi';

jest.mock('../src/api/artsdataApi');

describe('PlaceSearch', () => {
  const mockOnSelectPlace = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should render search input', () => {
    render(<PlaceSearch onSelectPlace={mockOnSelectPlace} />);
    
    expect(screen.getByLabelText(/select a place/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/start typing to search/i)).toBeInTheDocument();
  });

  it('should show loading state while searching', async () => {
    artsdataApi.searchPlaces.mockImplementation(() => new Promise(() => {}));
    
    render(<PlaceSearch onSelectPlace={mockOnSelectPlace} />);
    
    const input = screen.getByLabelText(/select a place/i);
    fireEvent.change(input, { target: { value: 'test' } });
    
    jest.advanceTimersByTime(1000);
    
    await waitFor(() => {
      expect(screen.getByText(/searching/i)).toBeInTheDocument();
    });
  });

  it('should display search results in dropdown', async () => {
    const mockResults = [
      {
        id: 'http://example.com/place1',
        name: 'Test Place 1',
        description: 'Description 1',
        score: 100,
      },
      {
        id: 'http://example.com/place2',
        name: 'Test Place 2',
        description: 'Description 2',
        score: 90,
      },
    ];

    artsdataApi.searchPlaces.mockResolvedValue(mockResults);
    artsdataApi.extractString.mockImplementation((value) => value);

    render(<PlaceSearch onSelectPlace={mockOnSelectPlace} />);
    
    const input = screen.getByLabelText(/select a place/i);
    fireEvent.change(input, { target: { value: 'test' } });
    
    jest.advanceTimersByTime(1000);
    
    await waitFor(() => {
      expect(screen.getByText('Test Place 1')).toBeInTheDocument();
      expect(screen.getByText('Test Place 2')).toBeInTheDocument();
    });
  });

  it('should call onSelectPlace when a result is clicked', async () => {
    const mockPlace = {
      id: 'http://example.com/place1',
      name: 'Test Place',
      description: 'Description',
      score: 100,
    };

    artsdataApi.searchPlaces.mockResolvedValue([mockPlace]);
    artsdataApi.extractString.mockImplementation((value) => value);

    render(<PlaceSearch onSelectPlace={mockOnSelectPlace} />);
    
    const input = screen.getByLabelText(/select a place/i);
    fireEvent.change(input, { target: { value: 'test' } });
    
    jest.advanceTimersByTime(1000);
    
    await waitFor(() => {
      expect(screen.getByText('Test Place')).toBeInTheDocument();
    });

    const resultItem = screen.getByText('Test Place').closest('button');
    fireEvent.click(resultItem);

    expect(mockOnSelectPlace).toHaveBeenCalledWith(mockPlace);
  });

  it('should clear input after selecting a place', async () => {
    const mockPlace = {
      id: 'http://example.com/place1',
      name: 'Test Place',
      description: 'Description',
      score: 100,
    };

    artsdataApi.searchPlaces.mockResolvedValue([mockPlace]);
    artsdataApi.extractString.mockImplementation((value) => value);

    render(<PlaceSearch onSelectPlace={mockOnSelectPlace} />);
    
    const input = screen.getByLabelText(/select a place/i);
    fireEvent.change(input, { target: { value: 'test' } });
    
    jest.advanceTimersByTime(1000);
    
    await waitFor(() => {
      expect(screen.getByText('Test Place')).toBeInTheDocument();
    });

    const resultItem = screen.getByText('Test Place').closest('button');
    fireEvent.click(resultItem);

    expect(input.value).toBe('');
  });

  it('should display error message when search fails', async () => {
    artsdataApi.searchPlaces.mockRejectedValue(new Error('API Error'));

    render(<PlaceSearch onSelectPlace={mockOnSelectPlace} />);
    
    const input = screen.getByLabelText(/select a place/i);
    fireEvent.change(input, { target: { value: 'test' } });
    
    jest.advanceTimersByTime(1000);
    
    await waitFor(() => {
      expect(screen.getByText(/failed to fetch results/i)).toBeInTheDocument();
    });
  });

  it('should not show dropdown when search query is empty', () => {
    render(<PlaceSearch onSelectPlace={mockOnSelectPlace} />);
    
    const input = screen.getByLabelText(/select a place/i);
    fireEvent.change(input, { target: { value: '' } });
    
    const dropdown = screen.queryByRole('button');
    expect(dropdown).not.toBeInTheDocument();
  });

  it('should debounce search requests', async () => {
    artsdataApi.searchPlaces.mockResolvedValue([]);

    render(<PlaceSearch onSelectPlace={mockOnSelectPlace} />);
    
    const input = screen.getByLabelText(/select a place/i);
    
    fireEvent.change(input, { target: { value: 't' } });
    fireEvent.change(input, { target: { value: 'te' } });
    fireEvent.change(input, { target: { value: 'tes' } });
    fireEvent.change(input, { target: { value: 'test' } });
    
    jest.advanceTimersByTime(1000);
    
    await waitFor(() => {
      expect(artsdataApi.searchPlaces).toHaveBeenCalledTimes(1);
    });
  });
});
