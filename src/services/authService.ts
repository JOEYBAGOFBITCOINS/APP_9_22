import { supabase } from '../utils/supabase/client'
import { projectId, publicAnonKey } from '../utils/supabase/info'
import { isDemoMode, demoUsers, demoCredentials } from '../utils/supabase/safe-demo-config'
import { ApiClient } from '../utils/api-client'
import { logger } from '../utils/logger'

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'porter';
}

class AuthService {
  private baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-218dc5b7`;
  private apiClient: ApiClient;

  constructor() {
    this.apiClient = new ApiClient(this.baseUrl, {
      'Authorization': `Bearer ${publicAnonKey}`
    });
  }

  async signUp(email: string, password: string, name: string): Promise<{ user: User } | { error: string }> {
    try {
      logger.info('Attempting user signup', { email });

      if (isDemoMode) {
        logger.debug('Demo mode: Creating mock user');
        return {
          user: {
            id: 'demo-new-user',
            email,
            name,
            role: 'porter'
          }
        };
      }

      const data = await this.apiClient.post<{ user: User; error?: string }>(
        '/signup',
        { email, password, name }
      );

      if (data.error) {
        logger.warn('Signup failed', { error: data.error, email });
        return { error: data.error };
      }

      logger.info('Signup successful', { email });
      return { user: data.user };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      logger.error('Network error during signup', error, { email });
      return { error: `Network error during signup: ${errorMessage}` };
    }
  }

  async signIn(email: string, password: string): Promise<{ user: User; accessToken: string } | { error: string }> {
    try {
      logger.info('Attempting user signin', { email });

      if (isDemoMode) {
        logger.debug('Demo mode: Checking credentials');
        const normalizedEmail = email.toLowerCase().trim();
        const validPassword = demoCredentials[normalizedEmail as keyof typeof demoCredentials];

        if (validPassword && validPassword === password) {
          const demoUser = demoUsers.find(user => user.email === normalizedEmail);

          if (demoUser) {
            logger.info('Demo mode signin successful', { email, role: demoUser.role });
            return {
              user: demoUser,
              accessToken: `demo-token-${demoUser.role}`
            };
          }
        }

        // Fallback to basic demo user validation
        const testUser = demoUsers.find(user =>
          user.email.toLowerCase() === normalizedEmail
        );

        if (testUser) {
          logger.info('Demo mode signin successful (fallback)', { email, role: testUser.role });
          return {
            user: testUser,
            accessToken: `demo-token-${testUser.role}`
          };
        }

        logger.warn('Invalid demo credentials', { email });
        return { error: 'Invalid demo credentials. Please check your email and password.' };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        logger.warn('Supabase signin failed', { error: error.message, email });
        if (error.message.includes('Invalid login credentials')) {
          return {
            error: 'Invalid login credentials. Please check your email and password, or enable demo mode in your environment configuration.'
          };
        }

        return { error: error.message };
      }

      if (!data.session) {
        logger.error('No session created after signin', undefined, { email });
        return { error: 'No session created' };
      }

      const profile = await this.apiClient.get<User>(
        '/profile',
        { 'Authorization': `Bearer ${data.session.access_token}` }
      );

      logger.info('Signin successful', { email });
      return {
        user: profile,
        accessToken: data.session.access_token
      };
    } catch (error: unknown) {
      logger.error('Network error during signin', error, { email });
      return { error: 'Network error during sign in. Please check your connection or enable demo mode.' };
    }
  }

  async getSession(): Promise<{ user: User; accessToken: string } | null> {
    // DEMO MODE - Return immediately with no session to avoid timeouts
    if (isDemoMode) {
      logger.debug('Demo mode: Skipping session check');
      return Promise.resolve(null);
    }

    try {
      logger.debug('Checking for existing session');
      // PRODUCTION MODE
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        logger.debug('No active session found');
        return null;
      }

      // Get user profile from backend with retry logic
      const profile = await this.apiClient.get<User>(
        '/profile',
        { 'Authorization': `Bearer ${session.access_token}` }
      );

      logger.debug('Session restored successfully');
      return {
        user: profile,
        accessToken: session.access_token
      };
    } catch (error) {
      logger.warn('Failed to restore session', { error });
      return null;
    }
  }

  async signOut(): Promise<void> {
    logger.info('User signing out');
    // DEMO MODE - Just log out
    if (isDemoMode) {
      logger.debug('Demo mode: Skipping Supabase signout');
      return;
    }

    // PRODUCTION MODE
    await supabase.auth.signOut();
    logger.info('Signout successful');
  }

  async refreshToken(): Promise<string | null> {
    try {
      logger.debug('Attempting to refresh token');
      const { data, error } = await supabase.auth.refreshSession();

      if (error || !data.session) {
        logger.warn('Token refresh failed', { error });
        return null;
      }

      logger.debug('Token refreshed successfully');
      return data.session.access_token;
    } catch (error) {
      logger.error('Error refreshing token', error);
      return null;
    }
  }
}

export const authService = new AuthService();