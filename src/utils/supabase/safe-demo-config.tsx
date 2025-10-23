// Ultra-safe demo configuration for FuelTrakr with multiple fallback strategies
// This ensures the app works even when environment variables are completely unavailable

import { isDevelopmentFallback } from '../development';

// Fallback configuration object
const FALLBACK_CONFIG = {
  isDemoMode: true,
  skipAuth: true,
  autoLogin: false,
  defaultUserRole: 'porter',
  debugMode: false,
  mode: 'production'
} as const;

// Safe environment variable access with multiple fallback strategies
const getSafeConfig = () => {
  try {
    // Strategy 1: Try import.meta.env
    const env = import.meta?.env;
    if (env && typeof env === 'object') {
      const isDev = env.DEV === true || env.MODE === 'development' || isDevelopmentFallback();
      
      // TEMPORARY: Force demo mode enabled for quick access
      return {
        isDemoMode: env.VITE_DEMO_MODE === 'false' ? false : true,  // Default to true unless explicitly false
        skipAuth: env.VITE_SKIP_AUTH === 'false' ? false : true,    // Default to true unless explicitly false
        autoLogin: env.VITE_AUTO_LOGIN === 'true' || isDev,
        defaultUserRole: env.VITE_DEFAULT_USER_ROLE || 'porter',
        debugMode: env.VITE_DEBUG_MODE === 'true' || isDev,
        mode: env.MODE || (isDev ? 'development' : 'production')
      };
    }
  } catch (error) {
    console.warn('Strategy 1 failed (import.meta.env):', error);
  }

  try {
    // Strategy 2: Try process.env (for Node.js environments)
    if (typeof process !== 'undefined' && process.env) {
      const isDev = process.env.NODE_ENV === 'development' || isDevelopmentFallback();
      
      // TEMPORARY: Force demo mode enabled for quick access
      return {
        isDemoMode: process.env.VITE_DEMO_MODE === 'false' ? false : true,  // Default to true unless explicitly false
        skipAuth: process.env.VITE_SKIP_AUTH === 'false' ? false : true,    // Default to true unless explicitly false
        autoLogin: process.env.VITE_AUTO_LOGIN === 'true' || isDev,
        defaultUserRole: process.env.VITE_DEFAULT_USER_ROLE || 'porter',
        debugMode: process.env.VITE_DEBUG_MODE === 'true' || isDev,
        mode: process.env.NODE_ENV || (isDev ? 'development' : 'production')
      };
    }
  } catch (error) {
    console.warn('Strategy 2 failed (process.env):', error);
  }

  try {
    // Strategy 3: Development mode detection fallback
    const isDev = isDevelopmentFallback();
    
    return {
      isDemoMode: isDev,
      skipAuth: isDev,
      autoLogin: isDev,
      defaultUserRole: 'porter',
      debugMode: isDev,
      mode: isDev ? 'development' : 'production'
    };
  } catch (error) {
    console.warn('Strategy 3 failed (development detection):', error);
  }

  // Strategy 4: Ultimate fallback
  console.warn('All configuration strategies failed, using fallback config');
  return FALLBACK_CONFIG;
};

// Get configuration with all fallback strategies
const config = getSafeConfig();

// REAL AUTH MODE - Using Supabase authentication
console.log('🔧 FuelTrakr Config:', config);
console.log('🔧 Real authentication mode enabled');

// Export configuration values - REAL AUTH ENABLED
export const isDemoMode = false;  // Real Supabase authentication
export const skipAuth = false;    // Require actual login
export const autoLogin = false;   // Show login screen
export const defaultUserRole = config.defaultUserRole;
export const debugMode = config.debugMode;

// Demo users and credentials (always available)
export const demoUsers = [
  {
    id: 'demo-admin',
    email: 'admin@napleton.com',
    name: 'Admin User',
    role: 'admin' as const
  },
  {
    id: 'demo-porter',
    email: 'porter@napleton.com', 
    name: 'John Porter',
    role: 'porter' as const
  }
];

// Demo credentials for testing
export const demoCredentials = {
  'admin@napleton.com': 'admin123',
  'porter@napleton.com': 'porter123'
};