# Running the Demo

## Important: CORS and Server Setup

The demo requires being served through the NestJS backend to work properly. Opening the HTML files directly in a browser will result in CORS errors when making API calls.

## How to Run the Demo

### Option 1: Through NestJS Server (Recommended)

1. Build the project:
```bash
npm run build
```

2. Start the NestJS server:
```bash
npm start
```

3. Access the demo at:
- React Widget: `http://localhost:3000/demo`
- The server will proxy API requests to avoid CORS issues

### Option 2: Development Mode

1. Navigate to the demo directory:
```bash
cd demo/react-match-demo
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Access the demo at `http://localhost:3000`
- The webpack dev server is configured to proxy API requests

## Features Demonstrated

### 1. Dropdown Display
- Type in the "Select a Place" field
- After 1 second (debounce), a dropdown appears with up to 10 matching results
- Each result shows:
  - **Name** (bold)
  - **ID** (as a link)
  - **Description** (if available)

### 2. Selection Behavior
- Click any item in the dropdown to select it
- The selected place information appears:
  2. **Outside React Widget** - A separate section demonstrating external integration

### 3. External Integration
The React widget communicates with external JavaScript using custom events:

```javascript
window.addEventListener('placeSelected', function(event) {
    const place = event.detail;
    console.log('Name:', place.name);
    console.log('ID:', place.id);
    console.log('Description:', place.description);
    console.log('Score:', place.score);
});
```

This allows your website to use the selected place data anywhere on the page, even outside the React component.

## Troubleshooting

### CORS Errors
If you see "Failed to fetch" errors:
- Make sure you're accessing the demo through the NestJS server, not opening the HTML file directly
- Check that the NestJS server is running on port 3000
- Verify the API endpoint is accessible

### No Dropdown Appearing
If the dropdown doesn't show:
- Check the browser console for errors
- Verify you're typing at least 2-3 characters
- Wait 1 second for the debounce
- Make sure the API is returning results

### Testing with Mock Data
For local testing without the API, you can modify `src/api/artsdataApi.js` to return mock data:

```javascript
export const searchPlaces = async (searchQuery, limit = 10) => {
  // Mock data for testing
  return [
    {
      id: 'http://kg.artsdata.ca/resource/K10-1234',
      name: 'Test Place',
      description: 'A test place for demonstration',
      score: 95.5,
      match: true,
      type: [{ id: 'schema:Place', name: 'Place' }]
    }
  ];
};
```
