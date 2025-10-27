/**
 * Checks if the current React version supports createRoot (React 18+)
 *
 * @returns true if createRoot is supported (React 18+), false otherwise (React 16/17)
 */
export const isSupportCreateRoot = (): boolean => {
  try {
    // Try to dynamically import createRoot from react-dom/client
    // This module only exists in React 18+
    const ReactDOMClient = require('react-dom/client');
    return typeof ReactDOMClient.createRoot === 'function';
  } catch {
    // If the import fails, we're on React 16/17
    return false;
  }
};
