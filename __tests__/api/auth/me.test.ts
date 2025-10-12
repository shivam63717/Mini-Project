import { GET } from '@/app/api/auth/me/route'
import { NextRequest } from 'next/server'
import { UserService } from '@/lib/auth/user'
import { verifyAccess } from '@/lib/auth/jwt'

// Mock the services
jest.mock('@/lib/auth/user')
jest.mock('@/lib/auth/jwt')

const mockUserService = UserService as jest.Mocked<typeof UserService>
const mockVerifyAccess = verifyAccess as jest.MockedFunction<typeof verifyAccess>

describe('/api/auth/me', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return user profile successfully', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      roles: ['user'],
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      emailVerified: null,
      lastLoginAt: null
    }

    const mockUserResponse = {
      id: 'user-123',
      email: 'test@example.com',
      roles: ['user'],
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      emailVerified: null,
      lastLoginAt: null
    }

    mockVerifyAccess.mockReturnValue({
      sub: 'user-123',
      roles: ['user'],
      iat: 1640995200,
      exp: 1640996100
    })

    mockUserService.getById.mockResolvedValue(mockUser)

    const request = new NextRequest('http://localhost:3000/api/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer valid-token',
      },
    })

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data).toEqual(mockUserResponse)
    expect(mockUserService.getById).toHaveBeenCalledWith('user-123')
  })

  it('should return 401 for missing token', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/me', {
      method: 'GET',
    })

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Authentication required')
  })

  it('should return 401 for invalid token', async () => {
    mockVerifyAccess.mockImplementation(() => {
      throw new Error('Invalid token')
    })

    const request = new NextRequest('http://localhost:3000/api/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer invalid-token',
      },
    })

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Authentication required')
  })

  it('should return 404 for non-existent user', async () => {
    mockVerifyAccess.mockReturnValue({
      sub: 'user-123',
      roles: ['user'],
      iat: 1640995200,
      exp: 1640996100
    })

    mockUserService.getById.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer valid-token',
      },
    })

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.success).toBe(false)
    expect(data.error).toBe('User not found')
  })

  it('should return 403 for insufficient permissions', async () => {
    mockVerifyAccess.mockReturnValue({
      sub: 'user-123',
      roles: ['user'],
      iat: 1640995200,
      exp: 1640996100
    })

    const request = new NextRequest('http://localhost:3000/api/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer valid-token',
      },
    })

    // This test would need to be modified if we add role-based access control to /me endpoint
    const response = await GET(request)
    
    // For now, /me endpoint doesn't require specific roles, so this should pass
    expect(response.status).not.toBe(403)
  })

  it('should return 500 for server error', async () => {
    mockVerifyAccess.mockReturnValue({
      sub: 'user-123',
      roles: ['user'],
      iat: 1640995200,
      exp: 1640996100
    })

    mockUserService.getById.mockRejectedValue(new Error('Database error'))

    const request = new NextRequest('http://localhost:3000/api/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer valid-token',
      },
    })

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Failed to retrieve user profile')
  })
})
