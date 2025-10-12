
import { CacheProvider } from './CacheProvider'

interface Entry {
  value: any
  expiresAt: number
}

export class InMemoryCache implements CacheProvider {
  private store = new Map<string, Entry>()

  async get<T>(key: string): Promise<T | undefined> {
    const e = this.store.get(key)
    if (!e) return undefined
    if (Date.now() > e.expiresAt) {
      this.store.delete(key)
      return undefined
    }
    return e.value as T
  }

  async set<T>(key: string, value: T, ttlSeconds: number = 60): Promise<void> {
    this.store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 })
  }

  async del(key: string): Promise<void> {
    this.store.delete(key)
  }
}