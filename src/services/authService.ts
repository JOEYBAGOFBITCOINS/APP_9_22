import { supabase } from '../utils/supabase/client'
import { projectId, publicAnonKey } from '../utils/supabase/info'
import { isDemoMode, demoUsers, demoCredentials, debugMode } from '../utils/supabase/safe-demo-config'

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'porter';
}

class AuthService {
  private baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-218dc5b7`;

  async signUp(email: string, password: string, name: string): Promise<{ user: User } | { error: string }> {
    try {
      if (isDemoMode) {
        return {
          user: {
            id: 'demo-new-user',
            email,
            name,
            role: 'porter'
          }
        };
      }

      const response = await fetch(`${this.baseUrl}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ email, password, name })
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Failed to create account' };
      }

      return { user: data.user };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return { error: `Network error during signup: ${errorMessage}` };
    }
  }

  async signIn(email: string, password: string): Promise<{ user: User; accessToken: string } | { error: string }> {
    try {
      if (isDemoMode) {
        const normalizedEmail = email.toLowerCase().trim();
        const validPassword = demoCredentials[normalizedEmail as keyof typeof demoCredentials];

        if (validPassword && validPassword === password) {
          const demoUser = demoUsers.find(user => user.email === normalizedEmail);

          if (demoUser) {
            return {
              user: demoUser,
              accessToken: `demo-token-${demoUser.role}`
            };
          }
        }

        const testCredentials = [
          { username: 'admin', password: 'admin123', email: 'admin@napleton.com', name: 'Admin User', role: 'admin' as const },
          { username: 'porter', password: 'porter123', email: 'porter@napleton.com', name: 'Porter User', role: 'porter' as const }
        ];

        const testUser = testCredentials.find(cred =>
          (normalizedEmail === cred.username.toLowerCase() || normalizedEmail === cred.email.toLowerCase()) &&
          password === cred.password
        );

        if (testUser) {
          const mockUser: User = {
            id: `demo-${testUser.role}`,
            email: testUser.email,
            name: testUser.name,
            role: testUser.role
          };

          return {
            user: mockUser,
            accessToken: `demo-token-${testUser.role}`
          };
        }

        return { error: 'Invalid demo credentials. Use admin@napleton.com/admin123 or porter@napleton.com/porter123' };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          return {
            error: 'Invalid login credentials. Supabase authentication is not fully configured yet. Please enable demo mode in your .env file (VITE_DEMO_MODE=true) or create a user account in Supabase first. Demo credentials: admin@napleton.com / admin123'
          };
        }

        return { error: error.message };
      }

      if (!data.session) {
        return { error: 'No session created' };
      }

      const profileResponse = await fetch(`${this.baseUrl}/profile`, {
        headers: {
          'Authorization': `Bearer ${data.session.access_token}`
        }
      });

      if (!profileResponse.ok) {
        return { error: 'Failed to fetch user profile' };
      }

      const profile = await profileResponse.json();

      return {
        user: profile,
        accessToken: data.session.access_token
      };
    } catch (error: unknown) {
      return { error: 'Network error during sign in. Please check your connection or enable demo mode.' };
    }
  }

  async getSession(): Promise<{ user: User; accessToken: string } | null> {
    // DEMO MODE - Return immediately with no session to avoid timeouts
    if (isDemoMode) {
      return Promise.resolve(null);
    }

    try {
      // PRODUCTION MODE
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        return null;
      }

      // Get user profile from backend
      const profileResponse = await fetch(`${this.baseUrl}/profile`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!profileResponse.ok) {
        return null;
      }

      const profile = await profileResponse.json();

      return {
        user: profile,
        accessToken: session.access_token
      };
    } catch (error) {
      return null;
    }
  }

  async signOut(): Promise<void> {
    // DEMO MODE - Just log out
    if (isDemoMode) {
      return;
    }

    // PRODUCTION MODE
    await supabase.auth.signOut();
  }

  async refreshToken(): Promise<string | null> {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error || !data.session) {
        return null;
      }

      return data.session.access_token;
    } catch (error) {
      return null;
    }
  }
}

export const authService = new AuthService();