import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Import Inter font from Google Fonts
const link = document.createElement('link');
link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
link.rel = 'stylesheet';
document.head.appendChild(link);

// Import Fira Code for monospace
const monoFont = document.createElement('link');
monoFont.href = 'https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500&display=swap';
monoFont.rel = 'stylesheet';
document.head.appendChild(monoFont);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
