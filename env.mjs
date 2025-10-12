
import { z } from 'zod'

const schema = z.object({
  NODE_ENV: z.enum(['development','test','production']).default('development'),
  REDIS_URL: z.string().url(),
  SESSION_TTL_SECONDS: z.coerce.number().int().positive().default(60 * 60 * 24 * 7),
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET must be at least 32 chars'),
  CORS_ORIGIN: z.string().optional(),
  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(4).max(15).default(10)
})

const parsed = schema.safeParse(process.env)
if (!parsed.success) {
  console.error('Invalid environment variables', parsed.error.flatten().fieldErrors)
  throw new Error('Invalid environment variables')
}

export const env = parsed.data