import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const container = document.getElementById('root');
const entityType = container.getAttribute('data-entity-type') || 'schema:Place';
const root = createRoot(container);
root.render(<App entityType={entityType} />);
