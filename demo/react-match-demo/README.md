# Artsdata Reconciliation API - React Match Demo Widget

This is a React widget that demonstrates how to integrate with the Artsdata Reconciliation API to search for places.

## Features

- 🔍 Real-time place search with debouncing (max 1 request per second)
- 📋 Dropdown display of up to 10 matching results
- 🎨 Bootstrap UI styling
- ✅ Comprehensive unit tests
- 📱 Responsive design
- 🌐 Display of place name, ID, and description

## Live Demo

The demo is available at the `/demo` endpoint when running the Artsdata Reconciliation service.

## Installation

### Prerequisites

- Node.js >= 14.15.5
- npm >= 7.9.0

### Setup

1. Navigate to the demo directory:

```bash
cd demo/react-match-demo
```

2. Install dependencies:

```bash
npm install
```

## Usage

### Development Mode

To run the demo in development mode with hot reloading:

```bash
npm run dev
```

This will start a development server at `http://localhost:3000`.

### Production Build

To build the demo for production:

```bash
npm run build
```

The built files will be in the `dist` directory.

## Testing

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Generate Coverage Report

```bash
npm run test:coverage
```

## How to Use the Widget

### Basic Usage

The widget consists of three main components:

1. **PlaceSearch** - The search input with dropdown results
2. **SelectedPlace** - Displays the selected place details
3. **App** - Main container component

### Integration Example

```jsx
import React, { useState } from 'react';
import PlaceSearch from './components/PlaceSearch';
import SelectedPlace from './components/SelectedPlace';

function MyApp() {
  const [selectedPlace, setSelectedPlace] = useState(null);

  return (
    <div>
      <PlaceSearch onSelectPlace={setSelectedPlace} />
      {selectedPlace && <SelectedPlace place={selectedPlace} />}
    </div>
  );
}
```

### Configuration

#### API Endpoint

The API endpoint is configured in `src/api/artsdataApi.js`:

```javascript
const API_BASE_URL = 'https://recon.artsdata.ca';
```

To use a different endpoint, modify this constant.

#### Debounce Delay

The debounce delay (default: 1000ms) can be configured when using the `usePlaceSearch` hook:

```javascript
const { searchQuery, results, loading, error, handleSearchChange } = usePlaceSearch(1500); // 1.5 seconds
```

#### Result Limit

The number of results can be configured in the `searchPlaces` function call:

```javascript
const candidates = await searchPlaces(query, 15); // Fetch 15 results instead of 10
```

#### Search Type

To search for different entity types, modify the request in `src/api/artsdataApi.js`:

```javascript
const requestBody = {
  queries: [
    {
      type: 'schema:Organization', // Change from schema:Place to schema:Organization
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

## Component API

### PlaceSearch Component

**Props:**

- `onSelectPlace` (Function, required) - Callback function called when a place is selected from the dropdown

**Example:**

```jsx
<PlaceSearch onSelectPlace={(place) => console.log('Selected:', place)} />
```

### SelectedPlace Component

**Props:**

- `place` (Object, optional) - The place object to display

**Place Object Structure:**

```javascript
{
  id: "http://kg.artsdata.ca/resource/K10-123",
  name: "Roy Thomson Hall",
  description: "A concert hall in downtown Toronto",
  score: 95.5,
  type: [
    { id: "schema:Place", name: "Place" }
  ]
}
```

**Example:**

```jsx
<SelectedPlace place={selectedPlace} />
```

## Customization

### Styling

The widget uses Bootstrap 5 for styling. You can customize the appearance by:

1. **Override Bootstrap variables** - Create a custom Bootstrap theme
2. **Add custom CSS** - Modify `src/components/PlaceSearch.css`
3. **Use inline styles** - Add custom styles directly to components

### Multilingual Support

The widget supports multilingual strings returned by the API. The `extractString` utility function automatically extracts the first language variant.

To add language preference:

```javascript
// In src/api/artsdataApi.js
headers: {
  'Content-Type': 'application/json',
  'Accept-Language': 'fr', // Change to 'fr' for French
}
```

## API Reference

### Artsdata Reconciliation API

The widget uses the Match service from the Artsdata Reconciliation API:

- **Endpoint:** `POST https://recon.artsdata.ca/match`
- **Headers:** 
  - `Content-Type: application/json`
  - `Accept-Language: en` (or `fr` for French)

**Request Body:**

```json
{
  "queries": [
    {
      "type": "schema:Place",
      "limit": 10,
      "conditions": [
        {
          "matchType": "name",
          "propertyValue": "search term"
        }
      ]
    }
  ]
}
```

**Response:**

```json
[
  {
    "results": {
      "candidates": [
        {
          "id": "http://kg.artsdata.ca/resource/K10-123",
          "name": "Roy Thomson Hall",
          "description": "A concert hall",
          "score": 95.5,
          "match": true,
          "type": [
            { "id": "schema:Place", "name": "Place" }
          ]
        }
      ]
    }
  }
]
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Dependencies

### Production

- React 18.2.0
- React-DOM 18.2.0
- Bootstrap 5.3.0

### Development

- Webpack 5
- Babel 7
- Jest 29
- React Testing Library 14

## Troubleshooting

### CORS Issues

If you encounter CORS errors when calling the API:

1. Ensure the API server has CORS enabled
2. Use the webpack dev server proxy (already configured in `webpack.config.js`)
3. Or deploy both the widget and API on the same domain

### Build Issues

If you encounter build errors:

1. Clear node_modules and package-lock.json
2. Reinstall dependencies: `npm install`
3. Try building again: `npm run build`

## License

MIT

## Support

For issues or questions about the Artsdata Reconciliation API, visit:
- [Artsdata.ca](https://artsdata.ca)
- [API Documentation](https://recon.artsdata.ca/api)

## Contributing

Contributions are welcome! Please ensure all tests pass before submitting a pull request.

```bash
npm test
npm run build
```
