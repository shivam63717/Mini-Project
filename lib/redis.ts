
import Redis from 'ioredis'
import { env } from '../env.mjs'

declare global {
  // eslint-disable-next-line no-var
  var __redis: Redis | undefined
}

export const redis =
  global.__redis ??
  new Redis(env.REDIS_URL, {
    lazyConnect: true,
    maxRetriesPerRequest: 3
  })

if (process.env.NODE_ENV !== 'production') global.__redis = redis

