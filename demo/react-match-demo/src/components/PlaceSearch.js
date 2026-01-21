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
      <label htmlFor="placeSearch" className="form-label">
        Select a Place
      </label>
      <div className="search-input-wrapper">
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
          <div className="spinner-container">
            <div className="spinner-border spinner-border-sm text-primary" role="status">
              <span className="visually-hidden">Searching...</span>
            </div>
          </div>
        )}
      </div>
      {error && (
        <div className="text-danger mt-1">
          <small>{error}</small>
        </div>
      )}

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
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="fw-bold flex-grow-1">{name}</div>
                    <span className="badge bg-secondary ms-2">{id}</span>
                  </div>
                  {description && (
                    <div className="text-secondary small mt-1">{description}</div>
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
