import { useState, useEffect, useRef } from 'react';
import { searchPlaces } from '../api/artsdataApi';

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
  const debounceTimerRef = useRef(null);

  useEffect(() => {
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Handle empty query
    if (!searchQuery || searchQuery.trim() === '') {
      setResults([]);
      setLoading(false);
      return;
    }

    // Set up debounced search
    debounceTimerRef.current = setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        const candidates = await searchPlaces(searchQuery, 10);
        setResults(candidates);
      } catch (err) {
        setError('Failed to fetch results. Please try again.');
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, debounceDelay);

    // Cleanup function
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery, debounceDelay]);

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
