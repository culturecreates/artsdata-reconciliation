import React, { useState } from 'react';
import PlaceSearch from './components/PlaceSearch';
import { extractString } from './api/artsdataApi';

/**
 * App component - Main application component
 * @param {string} entityType - The entity type to search for (default: 'schema:Place')
 */
function App({ entityType = 'schema:Place' }) {
  const [selectedPlace, setSelectedPlace] = useState(null);

  const handleSelectPlace = (place) => {
    setSelectedPlace(place);
    
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

  return (
    <div className="row justify-content-center">
      <div className="col-lg-8">
        <div className="text-center mb-4">
          <h1 className="mb-3">Artsdata Reconciliation API Demo</h1>
          <p className="lead text-muted">
            Search for places using the Artsdata Reconciliation API
          </p>
        </div>

        <div className="card shadow-sm">
          <div className="card-body p-4">
            <PlaceSearch onSelectPlace={handleSelectPlace} entityType={entityType} />
          </div>
        </div>

        <div className="mt-4 text-center text-muted">
          <small>
            Powered by{' '}
            <a
              href="https://recon.artsdata.ca"
              target="_blank"
              rel="noopener noreferrer"
              className="text-decoration-none"
            >
              Artsdata Reconciliation API
            </a>
          </small>
        </div>
      </div>
    </div>
  );
}

export default App;
