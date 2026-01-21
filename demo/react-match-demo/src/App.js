import React, { useState } from 'react';
import PlaceSearch from './components/PlaceSearch';
import SelectedPlace from './components/SelectedPlace';

/**
 * App component - Main application component
 */
function App() {
  const [selectedPlace, setSelectedPlace] = useState(null);

  const handleSelectPlace = (place) => {
    setSelectedPlace(place);
  };

  return (
    <div className="container py-5">
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
              <PlaceSearch onSelectPlace={handleSelectPlace} />
            </div>
          </div>

          {selectedPlace && <SelectedPlace place={selectedPlace} />}

          <div className="mt-4 text-center text-muted">
            <small>
              Powered by{' '}
              <a
                href="http://recon.artsdata.ca"
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
    </div>
  );
}

export default App;
