import { getElasticsearchClient, getIndexName } from './client'

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'porter'
  created_at: string
  updated_at: string
}

export interface UserInsert {
  id: string
  email: string
  name: string
  role?: 'admin' | 'porter'
  created_at?: string
  updated_at?: string
}

export interface UserUpdate {
  name?: string
  role?: 'admin' | 'porter'
  updated_at?: string
}

export class UserElasticsearchService {
  private client = getElasticsearchClient()
  private indexName = getIndexName('users')

  /**
   * Create a new user
   */
  async createUser(user: UserInsert): Promise<User> {
    const timestamp = new Date().toISOString()
    const newUser: User = {
      ...user,
      role: user.role || 'porter',
      created_at: user.created_at || timestamp,
      updated_at: user.updated_at || timestamp
    }

    await this.client.index({
      index: this.indexName,
      id: user.id,
      document: newUser,
      refresh: 'wait_for'
    })

    return newUser
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User | null> {
    try {
      const result = await this.client.get({
        index: this.indexName,
        id: userId
      })

      return result._source as User
    } catch (error: any) {
      if (error.meta?.statusCode === 404) {
        return null
      }
      throw error
    }
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const result = await this.client.search({
        index: this.indexName,
        body: {
          query: {
            term: {
              email: email.toLowerCase()
            }
          }
        }
      })

      if (result.hits.hits.length === 0) {
        return null
      }

      return result.hits.hits[0]._source as User
    } catch (error) {
      console.error('Error fetching user by email:', error)
      throw error
    }
  }

  /**
   * Update user
   */
  async updateUser(userId: string, updates: UserUpdate): Promise<User | null> {
    try {
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      }

      await this.client.update({
        index: this.indexName,
        id: userId,
        doc: updateData,
        refresh: 'wait_for'
      })

      return await this.getUserById(userId)
    } catch (error: any) {
      if (error.meta?.statusCode === 404) {
        return null
      }
      throw error
    }
  }

  /**
   * Delete user
   */
  async deleteUser(userId: string): Promise<boolean> {
    try {
      await this.client.delete({
        index: this.indexName,
        id: userId,
        refresh: 'wait_for'
      })
      return true
    } catch (error: any) {
      if (error.meta?.statusCode === 404) {
        return false
      }
      throw error
    }
  }

  /**
   * Get all users
   */
  async getAllUsers(): Promise<User[]> {
    try {
      const result = await this.client.search({
        index: this.indexName,
        body: {
          query: {
            match_all: {}
          },
          sort: [{ created_at: 'desc' }],
          size: 10000 // Adjust based on expected user count
        }
      })

      return result.hits.hits.map(hit => hit._source as User)
    } catch (error) {
      console.error('Error fetching all users:', error)
      throw error
    }
  }

  /**
   * Get users by role
   */
  async getUsersByRole(role: 'admin' | 'porter'): Promise<User[]> {
    try {
      const result = await this.client.search({
        index: this.indexName,
        body: {
          query: {
            term: {
              role
            }
          },
          sort: [{ created_at: 'desc' }]
        }
      })

      return result.hits.hits.map(hit => hit._source as User)
    } catch (error) {
      console.error('Error fetching users by role:', error)
      throw error
    }
  }

  /**
   * Check if user exists
   */
  async userExists(userId: string): Promise<boolean> {
    try {
      const result = await this.client.exists({
        index: this.indexName,
        id: userId
      })
      return result
    } catch (error) {
      console.error('Error checking if user exists:', error)
      return false
    }
  }
}

// Export singleton instance
export const userService = new UserElasticsearchService()
