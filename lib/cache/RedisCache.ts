import { RedisService } from '../database/redis'
import { CacheProvider } from './CacheProvider'

export class RedisCache implements CacheProvider {
  constructor() {
    // RedisService is already initialized in lib/database/redis.ts
  }
  
  async get<T>(key: string): Promise<T | undefined> {
    const value = await RedisService.get<T>(key)
    return value ?? undefined
  }
  
  async set<T>(key: string, value: T, ttlSeconds = 60): Promise<void> {
    await RedisService.set(key, value, ttlSeconds)
  }
  
  async del(key: string): Promise<void> {
    await RedisService.del(key)
  }
}