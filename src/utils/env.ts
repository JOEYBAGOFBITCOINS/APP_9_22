// Environment configuration utility for FuelTrakr
// Provides safe access to environment variables with proper fallbacks

export class EnvConfig {
  private static instance: EnvConfig;
  private config: Record<string, string | boolean>;

  private constructor() {
    this.config = this.loadConfig();
  }

  public static getInstance(): EnvConfig {
    if (!EnvConfig.instance) {
      EnvConfig.instance = new EnvConfig();
    }
    return EnvConfig.instance;
  }

  private loadConfig(): Record<string, string | boolean> {
    try {
      const env = import.meta.env || {};
      const isDev = env.DEV === true || env.MODE === 'development';
      
      return {
        // Mode detection
        isDevelopment: isDev,
        isProduction: env.PROD === true || env.MODE === 'production',
        mode: env.MODE || (isDev ? 'development' : 'production'),
        
        // Demo and authentication settings - defaults to false in production
        demoMode: env.VITE_DEMO_MODE === 'true',
        skipAuth: env.VITE_SKIP_AUTH === 'true',
        autoLogin: env.VITE_AUTO_LOGIN === 'true',
        defaultUserRole: env.VITE_DEFAULT_USER_ROLE || 'porter',
        
        // Debug settings - defaults to false in production
        debugMode: env.VITE_DEBUG_MODE === 'true',
        consoleLogging: env.VITE_CONSOLE_LOGGING === 'true',
        
        // Feature flags
        enableBiometricAuth: env.VITE_ENABLE_BIOMETRIC_AUTH !== 'false',
        enableLocationServices: env.VITE_ENABLE_LOCATION_SERVICES !== 'false',
        enableVinScanner: env.VITE_ENABLE_VIN_SCANNER !== 'false',
        enableOcrScanner: env.VITE_ENABLE_OCR_SCANNER !== 'false',
        
        // API settings
        apiTimeout: parseInt(env.VITE_API_TIMEOUT || '10000'),
        enableMockServices: env.VITE_ENABLE_MOCK_SERVICES === 'true',
        
        // Security settings - requireNapletonEmail now defaults to true in production
        requireNapletonEmail: env.VITE_REQUIRE_NAPLETON_EMAIL !== 'false',
        enableAnalytics: env.VITE_ENABLE_ANALYTICS === 'true',
        enableErrorReporting: env.VITE_ENABLE_ERROR_REPORTING === 'true',
      };
    } catch (error) {
      // Return safe defaults for production (secure by default)
      return {
        isDevelopment: false,
        isProduction: true,
        mode: 'production',
        demoMode: false,
        skipAuth: false,
        autoLogin: false,
        defaultUserRole: 'porter',
        debugMode: false,
        consoleLogging: false,
        enableBiometricAuth: true,
        enableLocationServices: false,
        enableVinScanner: true,
        enableOcrScanner: true,
        apiTimeout: 10000,
        enableMockServices: false,
        requireNapletonEmail: true,
        enableAnalytics: false,
        enableErrorReporting: false,
      };
    }
  }

  public get<T = string | boolean>(key: string): T {
    return this.config[key] as T;
  }

  public getString(key: string, fallback: string = ''): string {
    const value = this.config[key];
    return typeof value === 'string' ? value : fallback;
  }

  public getBoolean(key: string, fallback: boolean = false): boolean {
    const value = this.config[key];
    return typeof value === 'boolean' ? value : fallback;
  }

  public getNumber(key: string, fallback: number = 0): number {
    const value = this.config[key];
    return typeof value === 'number' ? value : fallback;
  }

  public logConfig(): void {
    // Only log in development mode when explicitly enabled
    if (this.getBoolean('consoleLogging') && this.getBoolean('isDevelopment')) {
      // Configuration logging removed for production
    }
  }
}

// Export singleton instance
export const envConfig = EnvConfig.getInstance();