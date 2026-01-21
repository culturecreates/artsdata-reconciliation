import { useState, useEffect, useCallback, useRef } from 'react';
import { searchPlaces } from '../api/artsdataApi';
import { debounce } from '../utils/debounce';

/**
 * Custom hook for searching places with debounce
 * @param {number} debounceDelay - Debounce delay in milliseconds (default: 1000)
 * @returns {Object} Search state and functions
 */
export const usePlaceSearch = (debounceDelay = 1000) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const performSearch = useCallback(async (query) => {
    if (!query || query.trim() === '') {
      setResults([]);
      setLoading(false);
      return;
    }

    // Abort previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setLoading(true);
    setError(null);

    try {
      const candidates = await searchPlaces(query, 10);
      setResults(candidates);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError('Failed to fetch results. Please try again.');
        setResults([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Create debounced search function
  const debouncedSearch = useCallback(
    debounce((query) => {
      performSearch(query);
    }, debounceDelay),
    [performSearch, debounceDelay]
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  const handleSearchChange = (query) => {
    setSearchQuery(query);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setResults([]);
    setError(null);
  };

  return {
    searchQuery,
    results,
    loading,
    error,
    handleSearchChange,
    clearSearch,
  };
};
