import { POST } from '@/app/api/auth/register/route'
import { NextRequest } from 'next/server'
import { UserService } from '@/lib/auth/user'

// Mock the UserService
jest.mock('@/lib/auth/user')
jest.mock('@/lib/auth/email')

const mockUserService = UserService as jest.Mocked<typeof UserService>

describe('/api/auth/register', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should register a new user successfully', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'SecurePassword123!'
    }

    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      roles: ['user'],
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      emailVerified: null,
      lastLoginAt: null
    }

    mockUserService.create.mockResolvedValue(mockUser)

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.success).toBe(true)
    expect(data.data).toEqual(mockUser)
    expect(mockUserService.create).toHaveBeenCalledWith({
      email: userData.email,
      password: userData.password,
      roles: ['user']
    })
  })

  it('should return 409 when user already exists', async () => {
    const userData = {
      email: 'existing@example.com',
      password: 'SecurePassword123!'
    }

    mockUserService.create.mockRejectedValue(new Error('User already exists'))

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(409)
    expect(data.success).toBe(false)
    expect(data.error).toBe('User already exists')
  })

  it('should return 400 for invalid email', async () => {
    const userData = {
      email: 'invalid-email',
      password: 'SecurePassword123!'
    }

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toContain('Invalid email format')
  })

  it('should return 400 for weak password', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'weak'
    }

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toContain('Password must be at least 12 characters')
  })

  it('should return 400 for missing fields', async () => {
    const userData = {
      email: 'test@example.com'
      // missing password
    }

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
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
})
