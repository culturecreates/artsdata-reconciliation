import React from 'react';
import { extractString } from '../api/artsdataApi';

/**
 * SelectedPlace component - Displays the selected place details
 * @param {Object} place - The selected place object
 */
const SelectedPlace = ({ place }) => {
  if (!place) {
    return null;
  }

  const name = extractString(place.name);
  const description = extractString(place.description);
  const id = place.id;

  return (
    <div className="card mt-4">
      <div className="card-header bg-primary text-white">
        <h5 className="mb-0">Selected Place</h5>
      </div>
      <div className="card-body">
        <h6 className="card-title">{name}</h6>
        <div className="mb-2">
          <strong>ID:</strong>{' '}
          <a href={id} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
            {id}
          </a>
        </div>
        {description && (
          <div className="mb-2">
            <strong>Description:</strong>
            <p className="mb-0 mt-1">{description}</p>
          </div>
        )}
        {place.score && (
          <div className="mb-2">
            <strong>Match Score:</strong> {place.score}
          </div>
        )}
        {place.type && place.type.length > 0 && (
          <div>
            <strong>Type:</strong>
            <ul className="list-unstyled mb-0">
              {place.type.map((type, index) => (
                <li key={index} className="ms-3">
                  • {type.name} ({type.id})
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectedPlace;
