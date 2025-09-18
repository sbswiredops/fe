// Protect window.fetch from being overridden by external scripts
if (typeof window !== 'undefined') {
  // Store the original fetch function
  const originalFetch = window.fetch.bind(window);
  
  // Create a protected version that handles errors gracefully
  const protectedFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    try {
      return await originalFetch(input, init);
    } catch (error) {
      // Log the error in development
      if (process.env.NODE_ENV === 'development') {
        console.warn('Fetch error caught and handled:', error);
      }
      
      // For HMR and development requests, fail gracefully
      if (typeof input === 'string' && (
        input.includes('_next') || 
        input.includes('webpack') ||
        input.includes('hot-reload')
      )) {
        // Return a minimal response for HMR requests to prevent crashes
        return new Response('{}', { 
          status: 200, 
          headers: { 'Content-Type': 'application/json' } 
        });
      }
      
      // Re-throw other errors
      throw error;
    }
  };
  
  // Replace window.fetch with the protected version
  window.fetch = protectedFetch;
  
  // Prevent external scripts from overriding our protected fetch
  Object.defineProperty(window, 'fetch', {
    value: protectedFetch,
    writable: false,
    configurable: false
  });
}

export {};
