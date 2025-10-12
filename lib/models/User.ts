import { RedisService, RedisKeys } from '@/lib/database/redis'
import bcrypt from 'bcryptjs'

export type Role = 'user' | 'admin' | 'analyst' | 'manager' | 'engineer' | 'auditor' | 'owner'

export interface User {
  id: string
  email: string
  passwordHash: string
  roles: Role[]
  createdAt: string
  updatedAt: string
  emailVerified?: string | null
}

export class UserModel {
  static async create(email: string, password: string, roles: Role[] = ['user']): Promise<Omit<User,'passwordHash'>> {
    const existing = await this.getByEmail(email)
    if (existing) throw new Error('User exists')
    const id = `user_${Date.now()}_${Math.random().toString(36).slice(2,9)}`
    const now = new Date().toISOString()
    const passwordHash = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS || '12'))
    const user: User = { id, email: email.toLowerCase(), passwordHash, roles, createdAt: now, updatedAt: now, emailVerified: null }
    await RedisService.set(RedisKeys.USER(id), user)
    await RedisService.hset(RedisKeys.USER_EMAIL_INDEX, email.toLowerCase(), id)
    return { id: user.id, email: user.email, roles: user.roles, createdAt: user.createdAt, updatedAt: user.updatedAt, emailVerified: user.emailVerified }
  }

  static async getById(id: string): Promise<User | null> {
    return await RedisService.get<User>(RedisKeys.USER(id))
  }

  static async getByEmail(email: string): Promise<User | null> {
    const id = await RedisService.hget<string>(RedisKeys.USER_EMAIL_INDEX, email.toLowerCase())
    return id ? await this.getById(id) : null
  }

  static async verifyPassword(user: User, password: string): Promise<boolean> {
    return await bcrypt.compare(password, user.passwordHash)
  }
}


