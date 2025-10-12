import { authenticate, authorize, requireAuth, optionalAuth } from '@/lib/middleware/auth'
import { NextRequest } from 'next/server'
import { verifyAccess } from '@/lib/auth/jwt'

// Mock JWT verification
jest.mock('@/lib/auth/jwt')
const mockVerifyAccess = verifyAccess as jest.MockedFunction<typeof verifyAccess>

describe('Auth Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('authenticate', () => {
    it('should return authenticated context for valid token', () => {
      mockVerifyAccess.mockReturnValue({
        sub: 'user-123',
        roles: ['user'],
        iat: 1640995200,
        exp: 1640996100
      })

      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          'Authorization': 'Bearer valid-token',
        },
      })

      const result = authenticate(request)

      expect(result.isAuthenticated).toBe(true)
      expect(result.user).toEqual({
        id: 'user-123',
        email: '',
        roles: ['user']
      })
    })

    it('should return unauthenticated context for missing token', () => {
      const request = new NextRequest('http://localhost:3000/api/test')

      const result = authenticate(request)

      expect(result.isAuthenticated).toBe(false)
      expect(result.user).toBeNull()
    })

    it('should return unauthenticated context for invalid token format', () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          'Authorization': 'InvalidFormat token',
        },
      })

      const result = authenticate(request)

      expect(result.isAuthenticated).toBe(false)
      expect(result.user).toBeNull()
    })

    it('should return unauthenticated context for invalid token', () => {
      mockVerifyAccess.mockImplementation(() => {
        throw new Error('Invalid token')
      })

      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          'Authorization': 'Bearer invalid-token',
        },
      })

      const result = authenticate(request)

      expect(result.isAuthenticated).toBe(false)
      expect(result.user).toBeNull()
    })
  })

  describe('authorize', () => {
    it('should return true for user with required role', () => {
      const context = {
        isAuthenticated: true,
        user: {
          id: 'user-123',
          email: 'test@example.com',
          roles: ['admin']
        }
      }

      const result = authorize(context, 'admin')

      expect(result).toBe(true)
    })

    it('should return true for user with multiple roles including required one', () => {
      const context = {
        isAuthenticated: true,
        user: {
          id: 'user-123',
          email: 'test@example.com',
          roles: ['user', 'admin', 'manager']
        }
      }

      const result = authorize(context, 'admin')

      expect(result).toBe(true)
    })

    it('should return false for user without required role', () => {
      const context = {
        isAuthenticated: true,
        user: {
          id: 'user-123',
          email: 'test@example.com',
          roles: ['user']
        }
      }

      const result = authorize(context, 'admin')

      expect(result).toBe(false)
    })

    it('should return false for unauthenticated user', () => {
      const context = {
        isAuthenticated: false,
        user: null
      }

      const result = authorize(context, 'admin')

      expect(result).toBe(false)
    })

    it('should return true when no specific roles required', () => {
      const context = {
        isAuthenticated: true,
        user: {
          id: 'user-123',
          email: 'test@example.com',
          roles: ['user']
        }
      }

      const result = authorize(context)

      expect(result).toBe(true)
    })

    it('should return true for user with any of multiple allowed roles', () => {
      const context = {
        isAuthenticated: true,
        user: {
          id: 'user-123',
          email: 'test@example.com',
          roles: ['user']
        }
      }

      const result = authorize(context, 'admin', 'user', 'manager')

      expect(result).toBe(true)
    })
  })

  describe('requireAuth', () => {
    it('should return auth context for valid token', () => {
      mockVerifyAccess.mockReturnValue({
        sub: 'user-123',
        roles: ['user'],
        iat: 1640995200,
        exp: 1640996100
      })

      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          'Authorization': 'Bearer valid-token',
        },
      })

      const result = requireAuth(request)

      expect(result.isAuthenticated).toBe(true)
      expect(result.user.id).toBe('user-123')
    })

    it('should throw error for missing token', () => {
      const request = new NextRequest('http://localhost:3000/api/test')

      expect(() => requireAuth(request)).toThrow('Authentication required')
    })

    it('should throw error for invalid token', () => {
      mockVerifyAccess.mockImplementation(() => {
        throw new Error('Invalid token')
      })

      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          'Authorization': 'Bearer invalid-token',
        },
      })

      expect(() => requireAuth(request)).toThrow('Authentication required')
    })

    it('should throw error for insufficient permissions', () => {
      mockVerifyAccess.mockReturnValue({
        sub: 'user-123',
        roles: ['user'],
        iat: 1640995200,
        exp: 1640996100
      })

      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          'Authorization': 'Bearer valid-token',
        },
      })

      expect(() => requireAuth(request, 'admin')).toThrow('Insufficient permissions')
    })

    it('should return auth context for user with required role', () => {
      mockVerifyAccess.mockReturnValue({
        sub: 'user-123',
        roles: ['admin'],
        iat: 1640995200,
        exp: 1640996100
      })

      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          'Authorization': 'Bearer valid-token',
        },
      })

      const result = requireAuth(request, 'admin')

      expect(result.isAuthenticated).toBe(true)
      expect(result.user.roles).toContain('admin')
    })
  })

  describe('optionalAuth', () => {
    it('should return authenticated context for valid token', () => {
      mockVerifyAccess.mockReturnValue({
        sub: 'user-123',
        roles: ['user'],
        iat: 1640995200,
        exp: 1640996100
      })

      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          'Authorization': 'Bearer valid-token',
        },
      })

      const result = optionalAuth(request)

      expect(result.isAuthenticated).toBe(true)
      expect(result.user?.id).toBe('user-123')
    })

    it('should return unauthenticated context for missing token', () => {
      const request = new NextRequest('http://localhost:3000/api/test')

      const result = optionalAuth(request)

      expect(result.isAuthenticated).toBe(false)
      expect(result.user).toBeNull()
    })

    it('should return unauthenticated context for invalid token', () => {
      mockVerifyAccess.mockImplementation(() => {
        throw new Error('Invalid token')
      })

      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          'Authorization': 'Bearer invalid-token',
        },
      })

      const result = optionalAuth(request)

      expect(result.isAuthenticated).toBe(false)
      expect(result.user).toBeNull()
    })
  })
})
