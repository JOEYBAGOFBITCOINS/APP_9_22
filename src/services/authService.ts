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
      console.log('🔧 SIGNUP - Starting signup process...');
      console.log('📧 Email:', email);
      console.log('👤 Name:', name);
      console.log('🎭 isDemoMode:', isDemoMode);
      
      // DEMO MODE - Just return success
      if (isDemoMode) {
        console.log('✅ Demo mode - returning mock user');
        return { 
          user: {
            id: 'demo-new-user',
            email,
            name,
            role: 'porter'
          }
        };
      }

      // PRODUCTION MODE - Use real backend
      console.log('🔒 Production mode - calling backend signup endpoint');
      console.log('🌐 URL:', `${this.baseUrl}/signup`);
      
      const response = await fetch(`${this.baseUrl}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ email, password, name })
      });

      console.log('📦 Response status:', response.status);
      const data = await response.json();
      console.log('📦 Response data:', data);

      if (!response.ok) {
        console.log('❌ Signup failed:', data.error);
        return { error: data.error || 'Failed to create account' };
      }

      console.log('✅ Signup successful!');
      return { user: data.user };
    } catch (error) {
      console.error('💥 Signup error:', error);
      return { error: `Network error during signup: ${error.message}` };
    }
  }

  async signIn(email: string, password: string): Promise<{ user: User; accessToken: string } | { error: string }> {
    try {
      console.log('='.repeat(50));
      console.log('🔐 AUTH SERVICE - signIn() called');
      console.log('='.repeat(50));
      console.log('📧 Email received:', email);
      console.log('🔑 Password received:', password ? '***' + password.slice(-3) : 'EMPTY');
      console.log('🎭 isDemoMode:', isDemoMode);
      console.log('📋 Available demo emails:', Object.keys(demoCredentials));
      console.log('='.repeat(50));
      
      // DEMO MODE - Use demo credentials
      if (isDemoMode) {
        console.log('✅ Demo mode is ACTIVE - checking credentials...');
        
        // Normalize email
        const normalizedEmail = email.toLowerCase().trim();
        console.log('🔄 Normalized email:', normalizedEmail);
        
        // Check demo credentials
        const validPassword = demoCredentials[normalizedEmail as keyof typeof demoCredentials];
        console.log('🔍 Looking up password for:', normalizedEmail);
        console.log('🔍 Found password:', validPassword ? '***' + validPassword.slice(-3) : 'NOT FOUND');
        console.log('🔍 Password match?', validPassword === password);
        
        if (validPassword && validPassword === password) {
          console.log('✅ Password matches! Finding user object...');
          const demoUser = demoUsers.find(user => user.email === normalizedEmail);
          console.log('👤 Found user:', demoUser);
          
          if (demoUser) {
            console.log('🎉 LOGIN SUCCESS! Returning user object');
            return {
              user: demoUser,
              accessToken: `demo-token-${demoUser.role}`
            };
          } else {
            console.log('❌ User object not found in demoUsers array');
          }
        } else {
          console.log('❌ Password does not match or was not found');
        }
        
        console.log('⚠️ Main demo credentials check failed, trying test credentials...');
        
        // Check for simple test credentials in demo mode
        const testCredentials = [
          { username: 'admin', password: 'admin123', email: 'admin@napleton.com', name: 'Admin User', role: 'admin' as const },
          { username: 'porter', password: 'porter123', email: 'porter@napleton.com', name: 'Porter User', role: 'porter' as const }
        ];

        const testUser = testCredentials.find(cred => 
          (normalizedEmail === cred.username.toLowerCase() || normalizedEmail === cred.email.toLowerCase()) && 
          password === cred.password
        );
        
        console.log('🔍 Test credentials check result:', testUser ? 'FOUND' : 'NOT FOUND');

        if (testUser) {
          console.log('🎉 Test credentials matched! Creating mock user...');
          const mockUser: User = {
            id: `demo-${testUser.role}`,
            email: testUser.email,
            name: testUser.name,
            role: testUser.role
          };

          console.log('🎉 LOGIN SUCCESS via test credentials!');
          return {
            user: mockUser,
            accessToken: `demo-token-${testUser.role}`
          };
        }
        
        console.log('❌ ALL DEMO LOGIN ATTEMPTS FAILED');
        console.log('Available credentials:', demoCredentials);
        return { error: 'Invalid demo credentials. Use admin@napleton.com/admin123 or porter@napleton.com/porter123' };
      }
      
      console.log('🔒 Demo mode is OFF, using Supabase authentication...');
      
      // PRODUCTION MODE - Use real Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        // Check if this is an "Invalid login credentials" error
        // If so, suggest using demo mode instead
        if (error.message.includes('Invalid login credentials')) {
          return { 
            error: `Invalid login credentials. Supabase authentication is not fully configured yet. Please enable demo mode in your .env file (VITE_DEMO_MODE=true) or create a user account in Supabase first. Demo credentials: admin@napleton.com / admin123` 
          };
        }
        
        return { error: error.message };
      }

      if (!data.session) {
        return { error: 'No session created' };
      }

      // Get user profile from backend
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
    } catch (error) {
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