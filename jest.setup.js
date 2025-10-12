// Jest setup file
import { TextEncoder, TextDecoder } from 'util'

// Polyfills for Node.js environment
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock environment variables
process.env.JWT_ACCESS_SECRET = 'test-access-secret'
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret'
process.env.BCRYPT_ROUNDS = '10'
process.env.REDIS_HOST = 'localhost'
process.env.REDIS_PORT = '6379'
process.env.NODE_ENV = 'test'

// Mock Redis for testing
jest.mock('ioredis', () => {
  const mockRedis = {
    get: jest.fn(),
    set: jest.fn(),
    setex: jest.fn(),
    del: jest.fn(),
    exists: jest.fn(),
    expire: jest.fn(),
    hset: jest.fn(),
    hget: jest.fn(),
    hgetall: jest.fn(),
    hdel: jest.fn(),
    lpush: jest.fn(),
    rpush: jest.fn(),
    lrange: jest.fn(),
    llen: jest.fn(),
    sadd: jest.fn(),
    smembers: jest.fn(),
    srem: jest.fn(),
    zadd: jest.fn(),
    zrange: jest.fn(),
    keys: jest.fn(),
    pipeline: jest.fn(),
    multi: jest.fn(),
    ping: jest.fn(),
    flushdb: jest.fn(),
    disconnect: jest.fn(),
    on: jest.fn(),
  }
  
  return jest.fn(() => mockRedis)
})

// Mock nodemailer for testing
jest.mock('nodemailer', () => ({
  createTransporter: jest.fn(() => ({
    verify: jest.fn().mockResolvedValue(true),
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' }),
  })),
}))

// Global test timeout
jest.setTimeout(30000)
