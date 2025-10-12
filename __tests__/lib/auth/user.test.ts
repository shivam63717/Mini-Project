import { UserService, type User, type Role } from '@/lib/auth/user'
import { RedisService } from '@/lib/database/redis'
import bcrypt from 'bcryptjs'

// Mock RedisService
jest.mock('@/lib/database/redis')
jest.mock('bcryptjs')

const mockRedisService = RedisService as jest.Mocked<typeof RedisService>
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('create', () => {
    it('should create a new user successfully', async () => {
      const input = {
        email: 'test@example.com',
        password: 'SecurePassword123!',
        roles: ['user'] as Role[]
      }

      const mockUser: User = {
        id: 'user-123',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
        roles: ['user'],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        emailVerified: null,
        lastLoginAt: null
      }

      mockRedisService.get.mockResolvedValue(null) // User doesn't exist
      mockBcrypt.hash.mockResolvedValue('hashed-password' as never)
      mockRedisService.set.mockResolvedValue()
      mockRedisService.hset.mockResolvedValue(1)
      mockRedisService.sadd.mockResolvedValue(1)

      const result = await UserService.create(input.email, input.password, input.roles)

      expect(result).toEqual({
        id: expect.any(String),
        email: 'test@example.com',
        roles: ['user'],
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        emailVerified: null,
        lastLoginAt: null
      })

      expect(mockBcrypt.hash).toHaveBeenCalledWith(input.password, 12)
      expect(mockRedisService.set).toHaveBeenCalled()
      expect(mockRedisService.hset).toHaveBeenCalled()
      expect(mockRedisService.sadd).toHaveBeenCalled()
    })

    it('should throw error if user already exists', async () => {
      const input = {
        email: 'existing@example.com',
        password: 'SecurePassword123!',
        roles: ['user'] as Role[]
      }

      const existingUser: User = {
        id: 'user-123',
        email: 'existing@example.com',
        passwordHash: 'hashed-password',
        roles: ['user'],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        emailVerified: null,
        lastLoginAt: null
      }

      mockRedisService.hget.mockResolvedValue('user-123')
      mockRedisService.get.mockResolvedValue(existingUser)

      await expect(UserService.create(input.email, input.password, input.roles))
        .rejects.toThrow('User already exists')
    })
  })

  describe('getById', () => {
    it('should return user by ID', async () => {
      const mockUser: User = {
        id: 'user-123',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
        roles: ['user'],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        emailVerified: null,
        lastLoginAt: null
      }

      mockRedisService.get.mockResolvedValue(mockUser)

      const result = await UserService.getById('user-123')

      expect(result).toEqual(mockUser)
      expect(mockRedisService.get).toHaveBeenCalledWith('user:user-123')
    })

    it('should return null if user not found', async () => {
      mockRedisService.get.mockResolvedValue(null)

      const result = await UserService.getById('non-existent')

      expect(result).toBeNull()
    })
  })

  describe('getByEmail', () => {
    it('should return user by email', async () => {
      const mockUser: User = {
        id: 'user-123',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
        roles: ['user'],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        emailVerified: null,
        lastLoginAt: null
      }

      mockRedisService.hget.mockResolvedValue('user-123')
      mockRedisService.get.mockResolvedValue(mockUser)

      const result = await UserService.getByEmail('test@example.com')

      expect(result).toEqual(mockUser)
      expect(mockRedisService.hget).toHaveBeenCalledWith('user:email:index', 'test@example.com')
    })

    it('should return null if user not found', async () => {
      mockRedisService.hget.mockResolvedValue(null)

      const result = await UserService.getByEmail('nonexistent@example.com')

      expect(result).toBeNull()
    })
  })

  describe('verifyPassword', () => {
    it('should return true for valid password', async () => {
      const user: User = {
        id: 'user-123',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
        roles: ['user'],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        emailVerified: null,
        lastLoginAt: null
      }

      mockBcrypt.compare.mockResolvedValue(true as never)

      const result = await UserService.verifyPassword(user, 'correct-password')

      expect(result).toBe(true)
      expect(mockBcrypt.compare).toHaveBeenCalledWith('correct-password', 'hashed-password')
    })

    it('should return false for invalid password', async () => {
      const user: User = {
        id: 'user-123',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
        roles: ['user'],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        emailVerified: null,
        lastLoginAt: null
      }

      mockBcrypt.compare.mockResolvedValue(false as never)

      const result = await UserService.verifyPassword(user, 'wrong-password')

      expect(result).toBe(false)
    })
  })

  describe('updateLastLogin', () => {
    it('should update last login timestamp', async () => {
      const mockUser: User = {
        id: 'user-123',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
        roles: ['user'],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        emailVerified: null,
        lastLoginAt: null
      }

      mockRedisService.get.mockResolvedValue(mockUser)
      mockRedisService.set.mockResolvedValue()

      await UserService.updateLastLogin('user-123')

      expect(mockRedisService.get).toHaveBeenCalledWith('user:user-123')
      expect(mockRedisService.set).toHaveBeenCalledWith(
        'user:user-123',
        expect.objectContaining({
          lastLoginAt: expect.any(String),
          updatedAt: expect.any(String)
        })
      )
    })

    it('should not update if user not found', async () => {
      mockRedisService.get.mockResolvedValue(null)

      await UserService.updateLastLogin('non-existent')

      expect(mockRedisService.set).not.toHaveBeenCalled()
    })
  })

  describe('updatePassword', () => {
    it('should update user password', async () => {
      const mockUser: User = {
        id: 'user-123',
        email: 'test@example.com',
        passwordHash: 'old-hashed-password',
        roles: ['user'],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        emailVerified: null,
        lastLoginAt: null
      }

      mockRedisService.get.mockResolvedValue(mockUser)
      mockBcrypt.hash.mockResolvedValue('new-hashed-password' as never)
      mockRedisService.set.mockResolvedValue()

      await UserService.updatePassword('user-123', 'new-password')

      expect(mockBcrypt.hash).toHaveBeenCalledWith('new-password', 12)
      expect(mockRedisService.set).toHaveBeenCalledWith(
        'user:user-123',
        expect.objectContaining({
          passwordHash: 'new-hashed-password',
          updatedAt: expect.any(String)
        })
      )
    })

    it('should throw error if user not found', async () => {
      mockRedisService.get.mockResolvedValue(null)

      await expect(UserService.updatePassword('non-existent', 'new-password'))
        .rejects.toThrow('User not found')
    })
  })
})
