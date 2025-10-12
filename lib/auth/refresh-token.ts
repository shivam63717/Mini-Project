import { RedisService } from '@/lib/database/redis'
import { randomUUID } from 'crypto'

export interface RefreshTokenRecord {
  id: string // jti
  userId: string
  token: string
  expiresAt: number
  revoked: boolean
  createdAt: string
  rotatedFrom?: string
  userAgent?: string
  ipAddress?: string
}

// Redis key patterns
const REFRESH_TOKEN_KEY = (token: string) => `refresh:${token}`
const REFRESH_TOKENS_INDEX = 'refresh:tokens:index'
const USER_REFRESH_TOKENS = (userId: string) => `user:${userId}:refresh:tokens`

export class RefreshTokenService {
  static async store(record: RefreshTokenRecord): Promise<void> {
    const { token, userId, id } = record
    
    // Store token record
    await RedisService.set(REFRESH_TOKEN_KEY(token), record, record.expiresAt - Math.floor(Date.now() / 1000))
    
    // Add to indexes
    await RedisService.hset(REFRESH_TOKENS_INDEX, id, token)
    await RedisService.sadd(USER_REFRESH_TOKENS(userId), id)
  }

  static async getByToken(token: string): Promise<RefreshTokenRecord | null> {
    return await RedisService.get<RefreshTokenRecord>(REFRESH_TOKEN_KEY(token))
  }

  static async getById(id: string): Promise<RefreshTokenRecord | null> {
    const token = await RedisService.hget<string>(REFRESH_TOKENS_INDEX, id)
    return token ? await this.getByToken(token) : null
  }

  static async revokeByToken(token: string): Promise<void> {
    const record = await this.getByToken(token)
    if (record && !record.revoked) {
      record.revoked = true
      await this.store(record)
    }
  }

  static async revokeById(id: string): Promise<void> {
    const record = await this.getById(id)
    if (record && !record.revoked) {
      record.revoked = true
      await this.store(record)
    }
  }

  static async revokeAllForUser(userId: string): Promise<void> {
    const tokenIds = await RedisService.smembers<string>(USER_REFRESH_TOKENS(userId))
    
    for (const id of tokenIds) {
      await this.revokeById(id)
    }
  }

  static async getUserTokens(userId: string): Promise<RefreshTokenRecord[]> {
    const tokenIds = await RedisService.smembers<string>(USER_REFRESH_TOKENS(userId))
    const tokens: RefreshTokenRecord[] = []
    
    for (const id of tokenIds) {
      const token = await this.getById(id)
      if (token && !token.revoked) {
        tokens.push(token)
      }
    }
    
    return tokens
  }

  static async cleanupExpired(): Promise<number> {
    // This would typically be run as a background job
    // For now, we rely on Redis TTL to handle expiration
    return 0
  }

  static async createToken(userId: string, expiresAt: number, metadata?: { userAgent?: string; ipAddress?: string }): Promise<RefreshTokenRecord> {
    const id = randomUUID()
    const token = randomUUID()
    
    const record: RefreshTokenRecord = {
      id,
      userId,
      token,
      expiresAt,
      revoked: false,
      createdAt: new Date().toISOString(),
      ...metadata
    }

    await this.store(record)
    return record
  }
}
