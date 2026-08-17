import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';

const originalError = console.error;
const originalWarn = console.warn;
console.error = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('[vite]')) return;
  originalError.call(console, ...args);
};
console.warn = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('[vite]')) return;
  originalWarn.call(console, ...args);
};

import App from './App.tsx';
import './index.css';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

// Global error handlers to capture any async JSON parsing errors and offer reset
window.addEventListener('error', (event) => {
    if (event.error?.message?.includes('JSON.parse')) {
        console.error("Global error caught JSON parse error", event.error);
        localStorage.clear();
    }
});

window.addEventListener('unhandledrejection', (event) => {
    if (event.reason?.message?.includes('JSON.parse')) {
        console.error("Global unhandled rejection caught JSON parse error", event.reason);
        localStorage.clear();
    }
});
