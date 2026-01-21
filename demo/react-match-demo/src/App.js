import React from 'react';
import PlaceSearch from './components/PlaceSearch';
import { extractString } from './api/artsdataApi';

/**
 * App component - Minimal widget containing only search and dropdown
 * @param {string} entityType - The entity type to search for (default: 'schema:Place')
 */
function App({ entityType = 'schema:Place' }) {
  const handleSelectPlace = (place) => {
    // Dispatch custom event to communicate with external JavaScript
    // This allows websites to react to place selections outside of React
    const event = new CustomEvent('placeSelected', {
      detail: {
        name: extractString(place.name),
        id: place.id,
        description: extractString(place.description),
        score: place.score,
        type: place.type,
        rawData: place
      }
    });
    window.dispatchEvent(event);
  };

  return <PlaceSearch onSelectPlace={handleSelectPlace} entityType={entityType} />;
}

export default App;
