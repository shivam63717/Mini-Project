import Redis from 'ioredis'
import { env } from '../../env.mjs'

let redisConfig: Redis.RedisOptions

try {
  const url = new URL(env.REDIS_URL)
  redisConfig = {
    host: url.hostname,
    port: parseInt(url.port || '6379'),
    password: url.password || undefined,
    db: parseInt(url.pathname.slice(1) || '0'),
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    keepAlive: 30000,
    connectTimeout: 10000,
    commandTimeout: 5000,
  }
} catch {
  redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0'),
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    keepAlive: 30000,
    connectTimeout: 10000,
    commandTimeout: 5000,
  }
}

// Create Redis client instance
export const redis = new Redis(redisConfig)

// Redis connection event handlers
redis.on('connect', () => {
  console.log('✅ Redis connected successfully')
})

redis.on('error', (error) => {
  console.error('❌ Redis connection error:', error)
})

redis.on('close', () => {
  console.log('🔌 Redis connection closed')
})

// Redis utility functions
export class RedisService {
  // Generic key-value operations
  static async set(key: string, value: any, ttl?: number): Promise<void> {
    const serializedValue = JSON.stringify(value)
    if (ttl) {
      await redis.setex(key, ttl, serializedValue)
    } else {
      await redis.set(key, serializedValue)
    }
  }

  static async get<T>(key: string): Promise<T | null> {
    const value = await redis.get(key)
    return value ? JSON.parse(value) : null
  }

  static async del(key: string): Promise<number> {
    return await redis.del(key)
  }

  static async exists(key: string): Promise<boolean> {
    const result = await redis.exists(key)
    return result === 1
  }

  static async expire(key: string, ttl: number): Promise<boolean> {
    const result = await redis.expire(key, ttl)
    return result === 1
  }

  // Hash operations
  static async hset(key: string, field: string, value: any): Promise<number> {
    const serializedValue = JSON.stringify(value)
    return await redis.hset(key, field, serializedValue)
  }

  static async hget<T>(key: string, field: string): Promise<T | null> {
    const value = await redis.hget(key, field)
    return value ? JSON.parse(value) : null
  }

  static async hgetall<T>(key: string): Promise<Record<string, T>> {
    const hash = await redis.hgetall(key)
    const result: Record<string, T> = {}
    for (const [field, value] of Object.entries(hash)) {
      result[field] = JSON.parse(value)
    }
    return result
  }

  static async hdel(key: string, field: string): Promise<number> {
    return await redis.hdel(key, field)
  }

  // List operations
  static async lpush(key: string, ...values: any[]): Promise<number> {
    const serializedValues = values.map(v => JSON.stringify(v))
    return await redis.lpush(key, ...serializedValues)
  }

  static async rpush(key: string, ...values: any[]): Promise<number> {
    const serializedValues = values.map(v => JSON.stringify(v))
    return await redis.rpush(key, ...serializedValues)
  }

  static async lrange<T>(key: string, start: number, stop: number): Promise<T[]> {
    const values = await redis.lrange(key, start, stop)
    return values.map(v => JSON.parse(v))
  }

  static async llen(key: string): Promise<number> {
    return await redis.llen(key)
  }

  // Set operations
  static async sadd(key: string, ...members: any[]): Promise<number> {
    const serializedMembers = members.map(m => JSON.stringify(m))
    return await redis.sadd(key, ...serializedMembers)
  }

  static async smembers<T>(key: string): Promise<T[]> {
    const members = await redis.smembers(key)
    return members.map(m => JSON.parse(m))
  }

  static async srem(key: string, ...members: any[]): Promise<number> {
    const serializedMembers = members.map(m => JSON.stringify(m))
    return await redis.srem(key, ...serializedMembers)
  }

  // Sorted set operations
  static async zadd(key: string, score: number, member: any): Promise<number> {
    const serializedMember = JSON.stringify(member)
    return await redis.zadd(key, score, serializedMember)
  }

  static async zrange<T>(key: string, start: number, stop: number, withScores = false): Promise<T[]> {
    const args = withScores ? ['WITHSCORES'] : []
    const values = await redis.zrange(key, start, stop, ...args)
    
    if (withScores) {
      const result: any[] = []
      for (let i = 0; i < values.length; i += 2) {
        result.push({
          member: JSON.parse(values[i]),
          score: parseFloat(values[i + 1])
        })
      }
      return result
    }
    
    return values.map(v => JSON.parse(v))
  }

  // Search operations
  static async keys(pattern: string): Promise<string[]> {
    return await redis.keys(pattern)
  }

  // Pipeline operations
  static async pipeline(): Promise<any> {
    return redis.pipeline()
  }

  // Transaction operations
  static async multi(): Promise<any> {
    return redis.multi()
  }

  // Connection management
  static async ping(): Promise<string> {
    return await redis.ping()
  }

  static async flushdb(): Promise<string> {
    return await redis.flushdb()
  }

  static async disconnect(): Promise<void> {
    await redis.disconnect()
  }
}

// Key patterns for different data types
export const RedisKeys = {
  // Dataset keys
  DATASET: (id: string) => `dataset:${id}`,
  DATASETS_LIST: 'datasets:list',
  DATASET_METADATA: (id: string) => `dataset:${id}:metadata`,
  DATASET_SAMPLE: (id: string) => `dataset:${id}:sample`,
  
  // Experiment keys
  EXPERIMENT: (id: string) => `experiment:${id}`,
  EXPERIMENTS_LIST: 'experiments:list',
  EXPERIMENT_METRICS: (id: string) => `experiment:${id}:metrics`,
  EXPERIMENT_LOGS: (id: string) => `experiment:${id}:logs`,
  
  // Analytics keys
  ANALYTICS_RESULT: (type: string, id: string) => `analytics:${type}:${id}`,
  ANALYTICS_CACHE: (type: string) => `analytics:${type}:cache`,
  
  // Feature engineering keys
  FEATURE_OPERATION: (id: string) => `feature:${id}`,
  FEATURE_OPERATIONS_LIST: 'features:list',
  FEATURE_IMPORTANCE: (datasetId: string) => `features:importance:${datasetId}`,
  
  // Statistics keys
  STATISTICS_RESULT: (type: string, id: string) => `statistics:${type}:${id}`,
  STATISTICS_CACHE: (type: string) => `statistics:${type}:cache`,
  
  // Upload keys
  UPLOAD_FILE: (id: string) => `upload:${id}`,
  UPLOAD_FILES_LIST: 'uploads:list',
  
  // Model training keys
  MODEL_TRAINING: (id: string) => `training:${id}`,
  TRAINING_JOBS_LIST: 'training:jobs:list',
  TRAINING_PROGRESS: (id: string) => `training:${id}:progress`,
  TRAINING_RESULTS: (id: string) => `training:${id}:results`,
  
  // User session keys
  USER_SESSION: (userId: string) => `session:${userId}`,
  USER_PREFERENCES: (userId: string) => `user:${userId}:preferences`,
  
  // Cache keys
  CACHE_PREFIX: 'cache:',
  CACHE_TTL: 3600, // 1 hour default TTL
}

export default redis
