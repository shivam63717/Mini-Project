import { POST } from '@/app/api/auth/login/route'
import { NextRequest } from 'next/server'
import { UserService } from '@/lib/auth/user'
import { RefreshTokenService } from '@/lib/auth/refresh-token'

// Mock the services
jest.mock('@/lib/auth/user')
jest.mock('@/lib/auth/refresh-token')

const mockUserService = UserService as jest.Mocked<typeof UserService>
const mockRefreshTokenService = RefreshTokenService as jest.Mocked<typeof RefreshTokenService>

describe('/api/auth/login', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should login user successfully', async () => {
    const loginData = {
      email: 'test@example.com',
      password: 'SecurePassword123!'
    }

    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      passwordHash: 'hashed-password',
      roles: ['user'],
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      emailVerified: null,
      lastLoginAt: null
    }

    mockUserService.getByEmail.mockResolvedValue(mockUser)
    mockUserService.verifyPassword.mockResolvedValue(true)
    mockUserService.updateLastLogin.mockResolvedValue()
    mockRefreshTokenService.createToken.mockResolvedValue({
      id: 'token-123',
      userId: 'user-123',
      token: 'refresh-token',
      expiresAt: Date.now() + 604800000,
      revoked: false,
      createdAt: '2024-01-01T00:00:00.000Z'
    })

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'test-agent',
        'X-Forwarded-For': '127.0.0.1'
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data).toHaveProperty('accessToken')
    expect(data.data).toHaveProperty('refreshToken')
    expect(data.data).toHaveProperty('expiresIn', 900) // 15 minutes
    expect(data.data).toHaveProperty('tokenType', 'Bearer')
    
    expect(mockUserService.getByEmail).toHaveBeenCalledWith(loginData.email)
    expect(mockUserService.verifyPassword).toHaveBeenCalledWith(mockUser, loginData.password)
    expect(mockUserService.updateLastLogin).toHaveBeenCalledWith(mockUser.id)
    expect(mockRefreshTokenService.createToken).toHaveBeenCalled()
  })

  it('should return 401 for invalid email', async () => {
    const loginData = {
      email: 'nonexistent@example.com',
      password: 'SecurePassword123!'
    }

    mockUserService.getByEmail.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Invalid credentials')
  })

  it('should return 401 for invalid password', async () => {
    const loginData = {
      email: 'test@example.com',
      password: 'WrongPassword123!'
    }

    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      passwordHash: 'hashed-password',
      roles: ['user'],
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      emailVerified: null,
      lastLoginAt: null
    }

    mockUserService.getByEmail.mockResolvedValue(mockUser)
    mockUserService.verifyPassword.mockResolvedValue(false)

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Invalid credentials')
  })

  it('should return 400 for missing fields', async () => {
    const loginData = {
      email: 'test@example.com'
      // missing password
    }

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toContain('Password is required')
  })

  it('should return 500 for server error', async () => {
    const loginData = {
      email: 'test@example.com',
      password: 'SecurePassword123!'
    }

    mockUserService.getByEmail.mockRejectedValue(new Error('Database error'))

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Login failed')
  })
})
