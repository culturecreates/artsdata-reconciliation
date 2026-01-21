/**
 * API Service for Artsdata Reconciliation
 * Handles communication with the Artsdata Reconciliation API
 */

const API_BASE_URL = 'http://recon.artsdata.ca';

/**
 * Searches for places using the Artsdata Reconciliation API match service
 * @param {string} searchQuery - The search term to match
 * @param {number} limit - Maximum number of results to return (default: 10)
 * @returns {Promise<Array>} Array of matching candidates
 */
export const searchPlaces = async (searchQuery, limit = 10) => {
  if (!searchQuery || searchQuery.trim() === '') {
    return [];
  }

  const requestBody = {
    queries: [
      {
        type: 'schema:Place',
        limit: limit,
        conditions: [
          {
            matchType: 'name',
            propertyValue: searchQuery.trim(),
          },
        ],
      },
    ],
  };

  try {
    const response = await fetch(`${API_BASE_URL}/match`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': 'en',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    
    // The API returns an array with results
    if (data && data.length > 0 && data[0].results) {
      return data[0].results.candidates || [];
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching places:', error);
    throw error;
  }
};

/**
 * Extracts a readable string from MultilingualString or regular string
 * @param {Object|string} value - The value to extract
 * @returns {string} The extracted string
 */
export const extractString = (value) => {
  if (typeof value === 'string') {
    return value;
  }
  
  if (value && value.values && Array.isArray(value.values) && value.values.length > 0) {
    return value.values[0].str || '';
  }
  
  return '';
};
