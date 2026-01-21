import React, { useState, useRef, useEffect } from 'react';
import { usePlaceSearch } from '../hooks/useSearchPlace';
import { extractString } from '../api/artsdataApi';
import './PlaceSearch.css';

/**
 * PlaceSearch component - Search input with dropdown results
 * @param {Function} onSelectPlace - Callback when a place is selected
 */
const PlaceSearch = ({ onSelectPlace }) => {
  const { searchQuery, results, loading, error, handleSearchChange } = usePlaceSearch(1000);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Show dropdown when there are results
  useEffect(() => {
    if (results.length > 0) {
      setShowDropdown(true);
    }
  }, [results]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    handleSearchChange(value);
    if (value.trim() !== '') {
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  };

  const handleSelectPlace = (place) => {
    onSelectPlace(place);
    setShowDropdown(false);
    handleSearchChange('');
  };

  return (
    <div className="place-search-container" ref={dropdownRef}>
      <div className="mb-3">
        <label htmlFor="placeSearch" className="form-label">
          Select a Place
        </label>
        <input
          type="text"
          className="form-control"
          id="placeSearch"
          placeholder="Start typing to search for places..."
          value={searchQuery}
          onChange={handleInputChange}
          autoComplete="off"
        />
        {loading && (
          <div className="text-muted mt-1">
            <small>Searching...</small>
          </div>
        )}
        {error && (
          <div className="text-danger mt-1">
            <small>{error}</small>
          </div>
        )}
      </div>

      {showDropdown && results.length > 0 && (
        <div className="dropdown-menu show w-100" style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {results.map((result, index) => {
            const name = extractString(result.name);
            const description = extractString(result.description);
            const id = result.id;

            return (
              <button
                key={`${id}-${index}`}
                className="dropdown-item"
                type="button"
                onClick={() => handleSelectPlace(result)}
              >
                <div className="result-item">
                  <div className="fw-bold">{name}</div>
                  <div className="text-muted small">ID: {id}</div>
                  {description && (
                    <div className="text-secondary small">{description}</div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PlaceSearch;
