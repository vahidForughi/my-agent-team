/**
 * Checks if the app is running as a micro frontend (embedded in host app)
 * This is determined by checking if the app is loaded in a parent context
 * or if running in an iframe
 */
function isMicroFrontendApp(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  // Check if running in an iframe (common for micro frontends)
  if (window.parent !== window) {
    return true;
  }

  // Check for a global variable that might be set by the host app
  if ((window as unknown as { __MICRO_FRONTEND__?: boolean }).__MICRO_FRONTEND__) {
    return true;
  }

  return false;
}

export function getBasepath(appContextBasePath?: string): string {
  if (appContextBasePath) {
    return appContextBasePath;
  }

  if (isMicroFrontendApp()) {
    return '/store';
  }

  return '';
}

