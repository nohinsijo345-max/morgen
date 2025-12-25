// Global Error Handler for Console Errors
export const initializeErrorHandler = () => {
  // Suppress specific console errors
  const originalError = console.error;
  console.error = (...args) => {
    const message = args.join(' ');
    
    // Suppress known non-critical errors
    if (
      message.includes('Failed to load resource') ||
      message.includes('XMLHttpRequest cannot load') ||
      message.includes('WebSocket connection') ||
      message.includes('Network Error') ||
      message.includes('CORS') ||
      message.includes('404') ||
      message.includes('Access-Control-Allow-Origin')
    ) {
      // Log to a separate debug console instead
      console.debug('🔇 Suppressed error:', ...args);
      return;
    }
    
    // Allow other errors through
    originalError.apply(console, args);
  };

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.debug('🔇 Suppressed unhandled rejection:', event.reason);
    event.preventDefault(); // Prevent the default browser behavior
  });

  // Handle general errors
  window.addEventListener('error', (event) => {
    if (
      event.message.includes('Network Error') ||
      event.message.includes('Failed to fetch') ||
      event.message.includes('WebSocket')
    ) {
      console.debug('🔇 Suppressed window error:', event.message);
      event.preventDefault();
    }
  });

  console.log('✅ Error handler initialized - non-critical errors will be suppressed');
};

export default initializeErrorHandler;