import { RedisService, RedisKeys } from '@/lib/database/redis'

export interface RefreshTokenRecord {
  id: string // jti
  userId: string
  token: string
  expiresAt: number
  revoked: boolean
  createdAt: string
  rotatedFrom?: string
}

export class RefreshTokenModel {
  static async store(record: RefreshTokenRecord): Promise<void> {
    await RedisService.hset(RedisKeys.REFRESH_TOKENS, record.id, record)
    await RedisService.set(RedisKeys.REFRESH_TOKEN(record.token), record, record.expiresAt - Math.floor(Date.now()/1000))
  }

  static async getByToken(token: string): Promise<RefreshTokenRecord | null> {
    return await RedisService.get<RefreshTokenRecord>(RedisKeys.REFRESH_TOKEN(token))
  }

  static async revokeByToken(token: string): Promise<void> {
    const record = await this.getByToken(token)
    if (record) {
      record.revoked = true
      await this.store(record)
    }
  }
}


