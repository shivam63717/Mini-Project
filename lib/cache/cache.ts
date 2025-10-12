
import { createClient } from 'redis'

interface CacheDriver {
  get<T>(k: string): Promise<T | null>
  set<T>(k: string, v: T, ttlSeconds?: number): Promise<void>
  del(k: string): Promise<void>
}

class MemoryCache implements CacheDriver {
  store = new Map<string, { v: any; exp?: number }>()
  async get<T>(k: string) {
    const e = this.store.get(k)
    if (!e) return null
    if (e.exp && Date.now() > e.exp) { this.store.delete(k); return null }
    return e.v as T
  }
  async set<T>(k: string, v: T, ttl?: number) {
    this.store.set(k, { v, exp: ttl ? Date.now() + ttl * 1000 : undefined })
  }
  async del(k: string) { this.store.delete(k) }
}

let driver: CacheDriver
(async () => {
  if (process.env.REDIS_URL) {
    try {
      const client = createClient({ url: process.env.REDIS_URL })
      await client.connect()
      driver = {
        async get<T>(k) { const r = await client.get(k); return r ? JSON.parse(r) as T : null },
        async set<T>(k,v,ttl) { await client.set(k, JSON.stringify(v), ttl ? { EX: ttl } : {}) },
        async del(k) { await client.del(k) }
      }
      return
    } catch {
      // fallback
    }
  }
  driver = new MemoryCache()
})()

export const cache = {
  get: <T>(k: string) => driver.get<T>(k),
  set: <T>(k: string, v: T, ttl?: number) => driver.set(k, v, ttl),
  del: (k: string) => driver.del(k)
}

export function cacheMiddleware(ttlSeconds: number, keyBuilder: (req: any) => string) {
  return async (req: any, res: any, next: any) => {
    const key = keyBuilder(req)
    const hit = await cache.get<any>(key)
    if (hit) return res.json({ cached: true, data: hit })
    const send = res.json.bind(res)
    res.json = (body: any) => {
      cache.set(key, body, ttlSeconds).catch(()=>{})
      return send(body)
    }
    next()
  }
}