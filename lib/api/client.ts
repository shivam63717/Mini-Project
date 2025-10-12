import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { ApiResponse, AuthTokens } from './types'

// Token management
class TokenManager {
  private static readonly ACCESS_TOKEN_KEY = 'access_token'
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token'

  static getAccessToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(this.ACCESS_TOKEN_KEY)
  }

  static getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(this.REFRESH_TOKEN_KEY)
  }

  static setTokens(tokens: AuthTokens): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(this.ACCESS_TOKEN_KEY, tokens.accessToken)
    localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken)
  }

  static clearTokens(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(this.ACCESS_TOKEN_KEY)
    localStorage.removeItem(this.REFRESH_TOKEN_KEY)
  }

  static isAuthenticated(): boolean {
    return !!this.getAccessToken()
  }
}

// API Client class
export class ApiClient {
  private client: AxiosInstance
  private isRefreshing = false
  private refreshPromise: Promise<string> | null = null

  constructor(baseURL: string = '/api') {
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors(): void {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = TokenManager.getAccessToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor to handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // If already refreshing, wait for the refresh to complete
            try {
              const newToken = await this.refreshPromise
              if (newToken) {
                originalRequest.headers = originalRequest.headers || {}
                originalRequest.headers.Authorization = `Bearer ${newToken}`
                return this.client(originalRequest)
              }
            } catch (refreshError) {
              this.handleAuthFailure()
              return Promise.reject(refreshError)
            }
          }

          originalRequest._retry = true
          this.isRefreshing = true

          this.refreshPromise = this.refreshToken()
            .then((newToken) => {
              this.isRefreshing = false
              this.refreshPromise = null
              return newToken
            })
            .catch((refreshError) => {
              this.isRefreshing = false
              this.refreshPromise = null
              this.handleAuthFailure()
              throw refreshError
            })

          try {
            const newToken = await this.refreshPromise
            originalRequest.headers = originalRequest.headers || {}
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            return this.client(originalRequest)
          } catch (refreshError) {
            return Promise.reject(refreshError)
          }
        }

        return Promise.reject(error)
      }
    )
  }

  private async refreshToken(): Promise<string> {
    const refreshToken = TokenManager.getRefreshToken()
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    try {
      const response = await axios.post('/api/auth/refresh', {
        refreshToken
      })

      const tokens: AuthTokens = response.data.data
      TokenManager.setTokens(tokens)
      return tokens.accessToken
    } catch (error) {
      TokenManager.clearTokens()
      throw error
    }
  }

  private handleAuthFailure(): void {
    TokenManager.clearTokens()
    // Redirect to login page or trigger auth state change
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login'
    }
  }

  // Generic request method
  async request<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client(config)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const apiError = error.response?.data as ApiResponse
        throw new Error(apiError?.error || error.message)
      }
      throw error
    }
  }

  // HTTP methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'GET', url })
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'POST', url, data })
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'PUT', url, data })
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'PATCH', url, data })
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'DELETE', url })
  }

  // Auth methods
  async login(email: string, password: string): Promise<AuthTokens> {
    const response = await this.post<AuthTokens>('/auth/login', { email, password })
    TokenManager.setTokens(response.data!)
    return response.data!
  }

  async register(email: string, password: string): Promise<any> {
    const response = await this.post('/auth/register', { email, password })
    return response.data
  }

  async logout(): Promise<void> {
    const refreshToken = TokenManager.getRefreshToken()
    if (refreshToken) {
      try {
        await this.post('/auth/logout', { refreshToken })
      } catch (error) {
        console.warn('Logout request failed:', error)
      }
    }
    TokenManager.clearTokens()
  }

  async refresh(): Promise<AuthTokens> {
    const refreshToken = TokenManager.getRefreshToken()
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }
    
    const response = await this.post<AuthTokens>('/auth/refresh', { refreshToken })
    TokenManager.setTokens(response.data!)
    return response.data!
  }

  async getProfile(): Promise<any> {
    const response = await this.get('/auth/me')
    return response.data
  }

  async requestPasswordReset(email: string): Promise<void> {
    await this.post('/auth/reset-password', { email })
  }

  async confirmPasswordReset(token: string, newPassword: string): Promise<void> {
    await this.put('/auth/reset-password', { token, newPassword })
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await this.put('/auth/change-password', { currentPassword, newPassword })
  }

  // Utility methods
  isAuthenticated(): boolean {
    return TokenManager.isAuthenticated()
  }

  getAccessToken(): string | null {
    return TokenManager.getAccessToken()
  }
}

// Create and export default instance
export const apiClient = new ApiClient()

// Export token manager for external use
export { TokenManager }
