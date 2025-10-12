
// Optional: Implement when Redis client available
// import { createClient, RedisClientType } from 'redis'
import { CacheProvider } from './CacheProvider'

export class RedisCache implements CacheProvider {
  // private client: RedisClientType
  constructor(/*url: string*/) {
    // this.client = createClient({ url })
    // this.client.connect()
  }
  async get<T>(key: string): Promise<T | undefined> {
    // const v = await this.client.get(key)
    // return v ? JSON.parse(v) as T : undefined
    return undefined
  }
  async set<T>(key: string, value: T, ttlSeconds = 60): Promise<void> {
    // await this.client.set(key, JSON.stringify(value), { EX: ttlSeconds })
  }
  async del(key: string): Promise<void> {
    // await this.client.del(key)
  }
}