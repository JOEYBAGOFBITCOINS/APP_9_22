import { projectId } from '../utils/supabase/info';
import { isDemoMode, demoUsers } from '../utils/supabase/safe-demo-config';
import { User } from './authService';
import { ApiClient } from '../utils/api-client';
import { logger } from '../utils/logger';

class AdminService {
  private baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-218dc5b7`;
  private apiClient: ApiClient;

  constructor() {
    this.apiClient = new ApiClient(this.baseUrl);
  }

  async getAllUsers(token: string): Promise<{ users: User[] } | { error: string }> {
    // DEMO MODE - Return demo users immediately
    if (isDemoMode) {
      logger.debug('Demo mode: Returning demo users');
      return Promise.resolve({ users: [...demoUsers] });
    }

    try {
      const data = await this.apiClient.get<User[]>(
        '/admin/users',
        { 'Authorization': `Bearer ${token}` }
      );

      return { users: data };
    } catch (error) {
      logger.error('Failed to fetch users', error);
      return { error: 'Network error while fetching users' };
    }
  }

  async updateUserRole(
    userId: string,
    role: 'admin' | 'porter',
    token: string
  ): Promise<{ user: User } | { error: string }> {
    try {
      const data = await this.apiClient.put<User>(
        `/admin/users/${userId}/role`,
        { role },
        { 'Authorization': `Bearer ${token}` }
      );

      return { user: data };
    } catch (error) {
      logger.error('Failed to update user role', error, { userId, role });
      return { error: 'Network error while updating user role' };
    }
  }

  async deleteUser(userId: string, token: string): Promise<{ success: boolean } | { error: string }> {
    try {
      await this.apiClient.delete(
        `/admin/users/${userId}`,
        { 'Authorization': `Bearer ${token}` }
      );

      return { success: true };
    } catch (error) {
      logger.error('Failed to delete user', error, { userId });
      return { error: 'Network error while deleting user' };
    }
  }

  async exportData(token: string): Promise<void> {
    try {
      logger.info('Exporting data');
      const response = await fetch(`${this.baseUrl}/admin/export`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      // Create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fueltrakr-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      logger.info('Data export successful');
    } catch (error) {
      logger.error('Failed to export data', error);
      throw new Error('Failed to export data');
    }
  }
}

export const adminService = new AdminService();