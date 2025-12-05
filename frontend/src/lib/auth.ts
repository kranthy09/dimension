// Auth utilities for admin
export interface User {
  id: string
  email: string
  full_name: string
  is_admin: boolean
  is_active: boolean
  created_at: string
  last_login: string | null
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

export class AuthError extends Error {
  constructor(message: string, public status?: number) {
    super(message)
    this.name = 'AuthError'
  }
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Login failed' }))
        throw new AuthError(error.detail || 'Login failed', response.status)
      }

      return response.json()
    } catch (error) {
      if (error instanceof AuthError) {
        throw error
      }
      // Network error or other fetch failure
      throw new AuthError(
        `Cannot connect to server. Please ensure the backend is running at ${API_URL}`,
        0
      )
    }
  },

  async getCurrentUser(token: string): Promise<User> {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new AuthError('Failed to get user info', response.status)
    }

    return response.json()
  },

  setToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin_token', token)
    }
  },

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('admin_token')
    }
    return null
  },

  removeToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token')
    }
  },

  async logout() {
    this.removeToken()
  },
}
