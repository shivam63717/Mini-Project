import { RedisService } from '@/lib/database/redis'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'

export type Role = 'user' | 'admin' | 'analyst' | 'manager' | 'engineer' | 'auditor' | 'owner'

export interface User {
  id: string
  email: string
  passwordHash: string
  roles: Role[]
  createdAt: string
  updatedAt: string
  emailVerified?: string | null
  lastLoginAt?: string | null
}

export interface CreateUserInput {
  email: string
  password: string
  roles?: Role[]
}

export interface UserResponse {
  id: string
  email: string
  roles: Role[]
  createdAt: string
  updatedAt: string
  emailVerified?: string | null
  lastLoginAt?: string | null
}

// Redis key patterns
const USER_KEY = (id: string) => `user:${id}`
const USER_EMAIL_INDEX = 'user:email:index'
const USER_ROLES_INDEX = 'user:roles:index'

export class UserService {
  static async create(input: CreateUserInput): Promise<UserResponse> {
    const { email, password, roles = ['user'] } = input
    
    // Check if user exists
    const existing = await this.getByEmail(email)
    if (existing) {
      throw new Error('User already exists')
    }

    // Generate user ID and hash password
    const id = randomUUID()
    const now = new Date().toISOString()
    const passwordHash = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS || '12'))
    
    const user: User = {
      id,
      email: email.toLowerCase(),
      passwordHash,
      roles,
      createdAt: now,
      updatedAt: now,
      emailVerified: null,
      lastLoginAt: null
    }

    // Store user and indexes
    await RedisService.set(USER_KEY(id), user)
    await RedisService.hset(USER_EMAIL_INDEX, email.toLowerCase(), id)
    
    // Update roles index
    for (const role of roles) {
      await RedisService.sadd(`user:role:${role}`, id)
    }

    return this.toResponse(user)
  }

  static async getById(id: string): Promise<User | null> {
    return await RedisService.get<User>(USER_KEY(id))
  }

  static async getByEmail(email: string): Promise<User | null> {
    const id = await RedisService.hget<string>(USER_EMAIL_INDEX, email.toLowerCase())
    return id ? await this.getById(id) : null
  }

  static async verifyPassword(user: User, password: string): Promise<boolean> {
    return await bcrypt.compare(password, user.passwordHash)
  }

  static async updateLastLogin(id: string): Promise<void> {
    const user = await this.getById(id)
    if (user) {
      user.lastLoginAt = new Date().toISOString()
      user.updatedAt = user.lastLoginAt
      await RedisService.set(USER_KEY(id), user)
    }
  }

  static async updatePassword(id: string, newPassword: string): Promise<void> {
    const user = await this.getById(id)
    if (!user) {
      throw new Error('User not found')
    }

    const passwordHash = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_ROUNDS || '12'))
    user.passwordHash = passwordHash
    user.updatedAt = new Date().toISOString()

    await RedisService.set(USER_KEY(id), user)
  }

  static async updateRoles(id: string, roles: Role[]): Promise<UserResponse> {
    const user = await this.getById(id)
    if (!user) {
      throw new Error('User not found')
    }

    // Remove from old roles
    for (const role of user.roles) {
      await RedisService.srem(`user:role:${role}`, id)
    }

    // Add to new roles
    user.roles = roles
    user.updatedAt = new Date().toISOString()
    
    for (const role of roles) {
      await RedisService.sadd(`user:role:${role}`, id)
    }

    await RedisService.set(USER_KEY(id), user)
    return this.toResponse(user)
  }

  static async getUsersByRole(role: Role): Promise<UserResponse[]> {
    const userIds = await RedisService.smembers<string>(`user:role:${role}`)
    const users: UserResponse[] = []
    
    for (const id of userIds) {
      const user = await this.getById(id)
      if (user) {
        users.push(this.toResponse(user))
      }
    }
    
    return users
  }

  static async delete(id: string): Promise<void> {
    const user = await this.getById(id)
    if (!user) {
      throw new Error('User not found')
    }

    // Remove from indexes
    await RedisService.hdel(USER_EMAIL_INDEX, user.email)
    for (const role of user.roles) {
      await RedisService.srem(`user:role:${role}`, id)
    }

    // Delete user
    await RedisService.del(USER_KEY(id))
  }

  private static toResponse(user: User): UserResponse {
    const { passwordHash, ...response } = user
    return response
  }
}
