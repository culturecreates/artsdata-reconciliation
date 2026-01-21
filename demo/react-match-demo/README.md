# Artsdata Reconciliation API - React Match Demo Widget

This is a minimal React widget that demonstrates how to integrate with the Artsdata Reconciliation API to search for entities (places, organizations, events, etc.).

## Features

- 🔍 Real-time entity search with 500ms debouncing
- 📋 Dropdown display of up to 10 matching results
- 🎨 Bootstrap UI styling
- ✅ Comprehensive unit tests (38 passing)
- 📱 Responsive design
- 🌐 Display of entity name, ID, and description
- ⚙️ Configurable entity type via HTML data attribute
- 🎁 Minimal widget (search field + dropdown only)
- 📤 External event dispatching for integration

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

### Widget Structure

The React widget is **minimal and focused** - it contains ONLY the search input field and dropdown. All labels, headings, and result displays should be in your HTML page, not inside the React component.

**What the widget includes:**
- Search input field with spinner indicator
- Dropdown showing up to 10 results
- Result selection handling

**What's in your HTML page (outside React):**
- Page heading and description
- Field label ("Select a Place", etc.)
- Footer information
- External result display area

### Basic HTML Integration

```html
<!DOCTYPE html>
<html>
<head>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
  <div class="container">
    <!-- Heading (outside React) -->
    <h1>Artsdata Reconciliation API Demo</h1>
    <p>Search for places using the Artsdata Reconciliation API</p>
    
    <!-- Field label (outside React) -->
    <label for="place-search-input">Select a Place</label>
    
    <!-- React widget mounts here - just search field + dropdown -->
    <div id="root" data-entity-type="schema:Place"></div>
    
    <!-- Footer (outside React) -->
    <small>Powered by <a href="https://recon.artsdata.ca">Artsdata Reconciliation API</a></small>
    
    <!-- External result display (outside React) -->
    <div id="selected-result" class="mt-4">
      <!-- Selection details appear here via custom event -->
    </div>
  </div>
  
  <script src="bundle.js"></script>
  <script>
    // Listen for selection event
    window.addEventListener('placeSelected', function(event) {
      const place = event.detail;
      document.getElementById('selected-result').innerHTML = `
        <h3>${place.name}</h3>
        <p><strong>ID:</strong> ${place.id}</p>
        <p><strong>Description:</strong> ${place.description}</p>
      `;
    });
  </script>
</body>
</html>
```

### Passing Parameters to the Widget

The widget is configured via HTML **data attributes** on the mounting element. This makes it easy to reuse the widget for different entity types without modifying the React code.

#### Entity Type Parameter

The most important parameter is `data-entity-type`, which specifies what type of entity to search for:

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

**Default:** If no `data-entity-type` is specified, it defaults to `schema:Place`.

#### How It Works

1. The React app reads the `data-entity-type` attribute from the `#root` element
2. This value is passed to the search API
3. The API returns matching entities of the specified type
4. The widget displays results in the dropdown

#### Complete Example

```html
<div class="container">
  <h1>Find a Venue</h1>
  <label>Venue Name</label>
  
  <!-- Widget configured for venues (places) -->
  <div id="root" data-entity-type="schema:Place"></div>
</div>
```

### Configuration Options

#### Debounce Delay

The debounce delay (default: 500ms) can be configured in `src/hooks/useSearchPlace.js`:

```javascript
const DEBOUNCE_DELAY = 500; // Change to 1000 for 1 second delay
```

#### Result Limit

The number of results (default: 10) can be configured in `src/api/artsdataApi.js`:

```javascript
const DEFAULT_LIMIT = 10; // Change to 20 for 20 results
```

#### API Endpoint

The API endpoint is configured in `src/api/artsdataApi.js`:

```javascript
const API_BASE_URL = 'https://recon.artsdata.ca';
```

## Integration with External Code

### Custom Event API

The widget dispatches a custom `placeSelected` event when a user selects an entity. This allows your webpage to react to selections without tightly coupling to React.

**Event Details:**

- **Event Name:** `placeSelected`
- **Event Target:** `window`
- **Event Detail:** Selected entity object

**Entity Object Structure:**

```javascript
{
  id: "K11-19",
  name: "Roy Thomson Hall",
  description: "Toronto (ON) CA",
  score: 3.72,
  type: [
    { id: "http://schema.org/Place", name: "Place" }
  ]
}
```

**Listening for Selections:**

```javascript
window.addEventListener('placeSelected', function(event) {
  const entity = event.detail;
  
  // Use the selected entity in your application
  console.log('Selected:', entity.name);
  console.log('ID:', entity.id);
  console.log('Description:', entity.description);
  console.log('Score:', entity.score);
  
  // Update your UI
  document.getElementById('result-name').textContent = entity.name;
  document.getElementById('result-id').textContent = entity.id;
});
```

**Complete Integration Example:**

```html
<div class="container">
  <h1>Search Organizations</h1>
  <label>Organization Name</label>
  <div id="root" data-entity-type="schema:Organization"></div>
  
  <div id="selection-display" class="mt-4 border p-3" style="display:none;">
    <h3>Selected Organization</h3>
    <p><strong>Name:</strong> <span id="result-name"></span></p>
    <p><strong>ID:</strong> <span id="result-id"></span></p>
    <p><strong>Description:</strong> <span id="result-description"></span></p>
  </div>
</div>

<script>
  window.addEventListener('placeSelected', function(event) {
    const org = event.detail;
    
    // Show the display section
    document.getElementById('selection-display').style.display = 'block';
    
    // Update the fields
    document.getElementById('result-name').textContent = org.name;
    document.getElementById('result-id').textContent = org.id;
    document.getElementById('result-description').textContent = org.description;
    
    // You can also submit to your backend, update a form, etc.
    document.getElementById('hidden-org-id').value = org.id;
  });
</script>
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
