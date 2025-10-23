// Simple development mode detection that doesn't rely on environment variables
// This serves as a fallback when import.meta.env is not available

export const isLocalhost = (): boolean => {
  try {
    return typeof window !== 'undefined' && 
           (window.location.hostname === 'localhost' || 
            window.location.hostname === '127.0.0.1' ||
            window.location.hostname.includes('127.0.0.1') ||
            window.location.port === '5173' ||
            window.location.port === '3000');
  } catch (error) {
    return false;
  }
};

export const isDevelopmentFallback = (): boolean => {
  // Check various indicators that we're in development
  try {
    return (
      isLocalhost() ||
      (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') ||
      (typeof window !== 'undefined' && window.location.search.includes('dev=true'))
    );
  } catch (error) {
    // If all else fails, assume development for safety
    return true;
  }
};

export const getModeFallback = (): 'development' | 'production' => {
  return isDevelopmentFallback() ? 'development' : 'production';
};