// Ultra-safe demo configuration for FuelTrakr with multiple fallback strategies
// This ensures the app works even when environment variables are completely unavailable

import { isDevelopmentFallback } from '../development';

// Fallback configuration object
// Production-ready defaults: demo mode OFF, authentication REQUIRED
const FALLBACK_CONFIG = {
  isDemoMode: false,
  skipAuth: false,
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
      
      // Production-ready configuration: demo mode and auth skip disabled by default
      return {
        isDemoMode: env.VITE_DEMO_MODE === 'true',  // Default to false unless explicitly true
        skipAuth: env.VITE_SKIP_AUTH === 'true',    // Default to false unless explicitly true
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
      
      // Production-ready configuration: demo mode and auth skip disabled by default
      return {
        isDemoMode: process.env.VITE_DEMO_MODE === 'true',  // Default to false unless explicitly true
        skipAuth: process.env.VITE_SKIP_AUTH === 'true',    // Default to false unless explicitly true
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

const config = getSafeConfig();

// Export the computed configuration values instead of hardcoded false
export const isDemoMode = config.isDemoMode;
export const skipAuth = config.skipAuth;
export const autoLogin = config.autoLogin;
export const defaultUserRole = config.defaultUserRole;
export const debugMode = config.debugMode;

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

// Demo credentials - only available in demo mode
// In production, these should be managed through environment variables or removed entirely
export const demoCredentials = isDemoMode ? {
  'admin@napleton.com': 'admin123',
  'porter@napleton.com': 'porter123'
} : {};