# Quick Start Guide - Artsdata React Match Widget

This guide will help you integrate the Artsdata Reconciliation API React widget into your website.

## What This Widget Does

The widget is a **minimal search component** containing only:
- A search input field with spinner
- A dropdown showing matching results

Everything else (headings, labels, result displays) should be in your HTML page.

## Installation

### Option 1: Use the Built Widget (Recommended)

1. Copy the built files from `dist/` directory
2. Include Bootstrap CSS in your HTML:
   ```html
   <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
   ```
3. Include the widget bundle:
   ```html
   <script src="path/to/bundle.js"></script>
   ```

### Option 2: Build from Source

1. Navigate to the demo directory:
   ```bash
   cd demo/react-match-demo
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build for production:
   ```bash
   npm run build
   ```
4. Use the files from `dist/` directory

## Basic Usage

### HTML Setup

```html
<!DOCTYPE html>
<html>
<head>
  <title>Search Demo</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
  <div class="container mt-5">
    <!-- Your heading (outside React) -->
    <h1>Find a Place</h1>
    <p>Search for places in the Artsdata knowledge graph</p>
    
    <!-- Your label (outside React) -->
    <label for="place-search-input">Select a Place</label>
    
    <!-- React widget mounts here -->
    <div id="root" data-entity-type="schema:Place"></div>
    
    <!-- Result display (outside React) -->
    <div id="selected-place" class="mt-4"></div>
  </div>
  
  <!-- Load the widget -->
  <script src="bundle.js"></script>
  
  <!-- Handle selection -->
  <script>
    window.addEventListener('placeSelected', function(event) {
      const place = event.detail;
      document.getElementById('selected-place').innerHTML = `
        <div class="card">
          <div class="card-body">
            <h3>${place.name}</h3>
            <p><strong>ID:</strong> ${place.id}</p>
            <p><strong>Description:</strong> ${place.description}</p>
          </div>
        </div>
      `;
    });
  </script>
</body>
</html>
```

## Passing Parameters to the Widget

### Entity Type (Required Parameter)

The widget accepts the entity type as a **data attribute** on the mounting element:

```html
<!-- Search for places -->
<div id="root" data-entity-type="schema:Place"></div>

<!-- Search for organizations -->
<div id="root" data-entity-type="schema:Organization"></div>

<!-- Search for events -->
<div id="root" data-entity-type="schema:Event"></div>

<!-- Search for people -->
<div id="root" data-entity-type="schema:Person"></div>
```

**Default:** If not specified, defaults to `schema:Place`.

### How Parameters Work

1. The React app reads the `data-entity-type` attribute from `#root`
2. This value is sent to the Artsdata API
3. Results are filtered to match the specified type
4. The dropdown displays matching entities

### Advanced Configuration

To modify other settings (debounce delay, result limit, API endpoint), you need to rebuild from source:

1. Edit `src/hooks/useSearchPlace.js` for debounce delay (default: 500ms)
2. Edit `src/api/artsdataApi.js` for result limit (default: 10)
3. Edit `src/api/artsdataApi.js` for API endpoint
4. Rebuild: `npm run build`

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

## Event API Reference

### placeSelected Event

When a user selects an entity from the dropdown, the widget dispatches a custom event:

**Event Name:** `placeSelected`

**Event Target:** `window`

**Event Detail (object):**
```javascript
{
  id: "K11-19",              // Entity ID
  name: "Roy Thomson Hall",   // Entity name
  description: "Toronto (ON) CA",  // Description
  score: 3.72,                // Match score
  type: [                     // Entity types
    { id: "http://schema.org/Place", name: "Place" }
  ]
}
```

**Usage:**
```javascript
window.addEventListener('placeSelected', function(event) {
  const entity = event.detail;
  console.log('Selected:', entity.name);
  console.log('ID:', entity.id);
  // Use entity data in your application
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

For API documentation, visit: https://recon.artsdata.ca/api
