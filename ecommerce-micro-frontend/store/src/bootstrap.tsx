import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './App';
import { setupMocks } from './services/mocks';
import { env } from './config';

// Debug environment configuration
console.log('[Bootstrap] Environment config:', {
  useMockData: env.useMockData,
  apiBaseUrl: env.apiBaseUrl,
  apiTimeout: env.apiTimeout,
  enableApiLogging: env.enableApiLogging
});

// Setup mock adapter only if enabled in environment
if (env.useMockData) {
  console.log('[Bootstrap] Initializing mock adapter');
  setupMocks();
} else {
  console.log('[Bootstrap] Using real API backend:', env.apiBaseUrl);
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
