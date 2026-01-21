# Quick Start Guide - Artsdata React Match Widget

This guide will help you integrate the Artsdata Reconciliation API React widget into your own application.

## Installation

### Option 1: Use the Built Widget (Recommended for Quick Start)

1. Copy the built files from `dist/` directory
2. Include Bootstrap CSS in your HTML:
   ```html
   <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
   ```
3. Include the widget bundle:
   ```html
   <script src="path/to/bundle.js"></script>
   ```

### Option 2: Integrate as React Components

1. Copy the source files from `src/` directory to your React project
2. Install dependencies:
   ```bash
   npm install react react-dom bootstrap
   ```
3. Import and use the components:
   ```jsx
   import PlaceSearch from './components/PlaceSearch';
   import SelectedPlace from './components/SelectedPlace';
   ```

## Basic Usage

```jsx
import React, { useState } from 'react';
import PlaceSearch from './components/PlaceSearch';
import SelectedPlace from './components/SelectedPlace';

function MyApp() {
  const [selectedPlace, setSelectedPlace] = useState(null);

  return (
    <div className="container">
      <h1>Search Places</h1>
      <PlaceSearch onSelectPlace={setSelectedPlace} />
      {selectedPlace && <SelectedPlace place={selectedPlace} />}
    </div>
  );
}

export default MyApp;
```

## Configuration

### Change API Endpoint

Edit `src/api/artsdataApi.js`:
```javascript
const API_BASE_URL = 'https://your-api-endpoint.com';
```

### Change Debounce Delay

Edit the hook usage in your component:
```javascript
const { searchQuery, results, loading, error, handleSearchChange } = usePlaceSearch(2000); // 2 seconds
```

### Change Result Limit

Edit `src/api/artsdataApi.js` in the `searchPlaces` function:
```javascript
const candidates = await searchPlaces(query, 20); // 20 results instead of 10
```

### Search Different Entity Types

Modify the request body in `src/api/artsdataApi.js`:
```javascript
const requestBody = {
  queries: [
    {
      type: 'schema:Organization', // or 'schema:Event', 'schema:Person', etc.
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
```

## Styling

### Use Custom Bootstrap Theme

Replace the Bootstrap CDN link with your custom theme:
```html
<link href="path/to/custom-bootstrap.css" rel="stylesheet">
```

### Override Component Styles

Add custom CSS after importing the component:
```css
.place-search-container {
  /* Your custom styles */
}

.dropdown-menu {
  /* Your custom dropdown styles */
}
```

## Examples

### Example 1: Search with Custom Styling

```jsx
import React, { useState } from 'react';
import PlaceSearch from './components/PlaceSearch';
import './custom-styles.css';

function CustomStyledSearch() {
  const [place, setPlace] = useState(null);

  return (
    <div className="my-custom-container">
      <PlaceSearch onSelectPlace={setPlace} />
    </div>
  );
}
```

### Example 2: Multiple Search Instances

```jsx
import React, { useState } from 'react';
import PlaceSearch from './components/PlaceSearch';

function MultipleSearches() {
  const [venue, setVenue] = useState(null);
  const [origin, setOrigin] = useState(null);

  return (
    <div>
      <div>
        <h3>Venue</h3>
        <PlaceSearch onSelectPlace={setVenue} />
      </div>
      <div>
        <h3>Origin</h3>
        <PlaceSearch onSelectPlace={setOrigin} />
      </div>
    </div>
  );
}
```

### Example 3: With Validation

```jsx
import React, { useState } from 'react';
import PlaceSearch from './components/PlaceSearch';

function ValidatedSearch() {
  const [place, setPlace] = useState(null);
  const [error, setError] = useState('');

  const handleSelectPlace = (selectedPlace) => {
    if (!selectedPlace.id) {
      setError('Invalid place selected');
      return;
    }
    setError('');
    setPlace(selectedPlace);
  };

  return (
    <div>
      <PlaceSearch onSelectPlace={handleSelectPlace} />
      {error && <div className="alert alert-danger">{error}</div>}
      {place && <div className="alert alert-success">Selected: {place.name}</div>}
    </div>
  );
}
```

## Testing Your Integration

### Unit Tests

```javascript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PlaceSearch from './components/PlaceSearch';

test('renders search input', () => {
  render(<PlaceSearch onSelectPlace={jest.fn()} />);
  expect(screen.getByLabelText(/select a place/i)).toBeInTheDocument();
});
```

### Integration Test

```javascript
test('selects a place', async () => {
  const mockOnSelect = jest.fn();
  render(<PlaceSearch onSelectPlace={mockOnSelect} />);
  
  const input = screen.getByLabelText(/select a place/i);
  fireEvent.change(input, { target: { value: 'test' } });
  
  await waitFor(() => {
    const result = screen.getByText(/test place/i);
    fireEvent.click(result);
  });
  
  expect(mockOnSelect).toHaveBeenCalled();
});
```

## Troubleshooting

### Issue: CORS Errors

**Solution:** Ensure your API has CORS enabled, or proxy the requests through your backend.

### Issue: Slow Search Results

**Solution:** Increase the debounce delay or implement client-side caching.

### Issue: No Results Displayed

**Solution:** Check the browser console for errors and verify the API endpoint is accessible.

## Support

For more detailed documentation, see [README.md](./README.md)

For API documentation, visit: http://recon.artsdata.ca/api
